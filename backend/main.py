
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional
import uuid
import os
import pinecone
import openai
from dotenv import load_dotenv

# Import local modules
from .database import engine, get_db
from . import models, schemas, auth
from .models import Note as NoteModel, Tag as TagModel, User as UserModel

# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="ThoughtVault API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI and Pinecone
openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT")
)

# Get or create Pinecone index
index_name = "thoughtvault"
dimension = 1536  # OpenAI embedding dimension

try:
    pinecone.create_index(
        name=index_name,
        dimension=dimension,
        metric="cosine"
    )
except Exception as e:
    if "already exists" not in str(e):
        raise e

# Get the index
index = pinecone.Index(index_name)

# Helper functions
def get_embedding(text: str):
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def get_combined_text(note: schemas.NoteCreate, tags: List[str]) -> str:
    tag_text = " ".join(tags) if tags else ""
    return f"{note.title} {note.content} {tag_text}"

def get_or_create_tags(db: Session, tag_names: List[str]):
    tags = []
    for name in tag_names:
        tag = db.query(TagModel).filter(TagModel.name == name).first()
        if not tag:
            tag = TagModel(id=str(uuid.uuid4()), name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags

# API routes
@app.get("/")
def read_root():
    return {"message": "ThoughtVault API is running"}

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = UserModel(
        id=str(uuid.uuid4()),
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/notes", response_model=schemas.NoteResponse)
async def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(auth.get_current_active_user)):
    # Create note
    vector_id = None
    
    # Get or create tags
    tags = get_or_create_tags(db, note.tags)
    
    # Store vector embedding if requested
    if note.storeVector:
        try:
            # Get embedding
            combined_text = get_combined_text(note, [tag.name for tag in tags])
            embedding = get_embedding(combined_text)
            
            # Generate unique ID for the note
            note_id = str(uuid.uuid4())
            vector_id = f"note:{note_id}"
            
            # Store in Pinecone
            index.upsert(vectors=[(vector_id, embedding, {
                "id": note_id,
                "title": note.title,
                "type": note.type,
                "user_id": current_user.id
            })])
        except Exception as e:
            print(f"Error creating vector: {str(e)}")
            # Continue without vector storage if it fails
    else:
        note_id = str(uuid.uuid4())
    
    # Create note in database
    db_note = NoteModel(
        id=note_id,
        title=note.title,
        content=note.content,
        type=note.type,
        vector_id=vector_id,
        owner_id=current_user.id
    )
    
    # Add tags to note
    db_note.tags = tags
    
    # Save to database
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Format response
    return schemas.NoteResponse(
        id=db_note.id,
        title=db_note.title,
        content=db_note.content,
        type=db_note.type,
        date=db_note.created_at,
        tags=[schemas.Tag(id=tag.id, name=tag.name) for tag in db_note.tags],
        vectorId=db_note.vector_id
    )

@app.get("/notes", response_model=List[schemas.NoteResponse])
async def get_all_notes(db: Session = Depends(get_db), current_user: UserModel = Depends(auth.get_current_active_user)):
    notes = db.query(NoteModel).filter(NoteModel.owner_id == current_user.id).all()
    
    # Format response
    response_notes = []
    for note in notes:
        response_notes.append(schemas.NoteResponse(
            id=note.id,
            title=note.title,
            content=note.content,
            type=note.type,
            date=note.created_at,
            tags=[schemas.Tag(id=tag.id, name=tag.name) for tag in note.tags],
            vectorId=note.vector_id
        ))
    
    return response_notes

@app.get("/notes/{note_id}", response_model=schemas.NoteResponse)
async def get_note(note_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(auth.get_current_active_user)):
    note = db.query(NoteModel).filter(NoteModel.id == note_id, NoteModel.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return schemas.NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        type=note.type,
        date=note.created_at,
        tags=[schemas.Tag(id=tag.id, name=tag.name) for tag in note.tags],
        vectorId=note.vector_id
    )

@app.post("/search", response_model=List[schemas.NoteResponse])
async def search_notes(request: schemas.SearchRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(auth.get_current_active_user)):
    try:
        # Get embedding for search query
        query_embedding = get_embedding(request.query)
        
        # Search in Pinecone
        search_results = index.query(
            vector=query_embedding,
            top_k=request.limit,
            include_metadata=True,
            filter={"user_id": current_user.id}
        )
        
        # Extract note IDs from results
        note_ids = [match.id for match in search_results.matches]
        
        # Get full notes from database
        notes = db.query(NoteModel).filter(
            NoteModel.id.in_(note_ids),
            NoteModel.owner_id == current_user.id
        ).all()
        
        # Format response
        response_notes = []
        for note in notes:
            response_notes.append(schemas.NoteResponse(
                id=note.id,
                title=note.title,
                content=note.content,
                type=note.type,
                date=note.created_at,
                tags=[schemas.Tag(id=tag.id, name=tag.name) for tag in note.tags],
                vectorId=note.vector_id
            ))
        
        return response_notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, db: Session = Depends(get_db), current_user: UserModel = Depends(auth.get_current_active_user)):
    # Get note
    note = db.query(NoteModel).filter(NoteModel.id == note_id, NoteModel.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Delete vector from Pinecone if exists
    if note.vector_id:
        try:
            index.delete(ids=[note.vector_id])
        except Exception as e:
            print(f"Error deleting vector: {str(e)}")
    
    # Delete note from database
    db.delete(note)
    db.commit()
    
    return None

@app.put("/notes/{note_id}", response_model=schemas.NoteResponse)
async def update_note(
    note_id: str, 
    note_update: schemas.NoteUpdate, 
    db: Session = Depends(get_db), 
    current_user: UserModel = Depends(auth.get_current_active_user)
):
    # Get note
    note = db.query(NoteModel).filter(NoteModel.id == note_id, NoteModel.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Update fields if provided
    if note_update.title is not None:
        note.title = note_update.title
    if note_update.content is not None:
        note.content = note_update.content
    if note_update.type is not None:
        note.type = note_update.type
    
    # Update tags if provided
    if note_update.tags is not None:
        tags = get_or_create_tags(db, note_update.tags)
        note.tags = tags
    
    # Update vector embedding if it exists
    if note.vector_id:
        try:
            combined_text = get_combined_text(
                schemas.NoteCreate(
                    title=note.title,
                    content=note.content,
                    type=note.type,
                    tags=[],
                    storeVector=True
                ),
                [tag.name for tag in note.tags]
            )
            embedding = get_embedding(combined_text)
            
            # Update in Pinecone
            index.upsert(vectors=[(note.vector_id, embedding, {
                "id": note.id,
                "title": note.title,
                "type": note.type,
                "user_id": current_user.id
            })])
        except Exception as e:
            print(f"Error updating vector: {str(e)}")
    
    # Save to database
    db.commit()
    db.refresh(note)
    
    # Format response
    return schemas.NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        type=note.type,
        date=note.created_at,
        tags=[schemas.Tag(id=tag.id, name=tag.name) for tag in note.tags],
        vectorId=note.vector_id
    )

@app.get("/tags", response_model=List[schemas.Tag])
async def get_all_tags(db: Session = Depends(get_db), current_user: UserModel = Depends(auth.get_current_active_user)):
    # Get all tags that are associated with the user's notes
    user_notes = db.query(NoteModel).filter(NoteModel.owner_id == current_user.id).all()
    tags = set()
    for note in user_notes:
        for tag in note.tags:
            tags.add(tag)
    
    return [schemas.Tag(id=tag.id, name=tag.name) for tag in tags]

# For testing API connectivity
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Run with: uvicorn main:app --reload
