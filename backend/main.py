
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, date
import os
import pinecone
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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

# Pydantic models
class NoteCreate(BaseModel):
    title: str
    content: str
    type: str
    tags: List[str]
    storeVector: bool = True

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

class Note(BaseModel):
    id: str
    title: str
    content: str
    type: str
    tags: List[str]
    date: str
    vectorId: Optional[str] = None

# In-memory storage (replace with a database in production)
notes_db = {}

# Helper functions
def get_embedding(text: str):
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def get_combined_text(note: NoteCreate) -> str:
    return f"{note.title} {note.content} {' '.join(note.tags)}"

# API routes
@app.get("/")
def read_root():
    return {"message": "ThoughtVault API is running"}

@app.post("/notes", response_model=Note)
async def create_note(note: NoteCreate):
    note_id = str(uuid.uuid4())
    today = date.today().isoformat()
    vector_id = None
    
    # Store vector embedding if requested
    if note.storeVector:
        try:
            # Get embedding
            combined_text = get_combined_text(note)
            embedding = get_embedding(combined_text)
            
            # Store in Pinecone
            vector_id = f"note:{note_id}"
            index.upsert(vectors=[(vector_id, embedding, {
                "id": note_id,
                "title": note.title,
                "type": note.type
            })])
        except Exception as e:
            print(f"Error creating vector: {str(e)}")
            # Continue without vector storage if it fails
    
    # Create note object
    new_note = Note(
        id=note_id,
        title=note.title,
        content=note.content,
        type=note.type,
        tags=note.tags,
        date=today,
        vectorId=vector_id
    )
    
    # Store in "database"
    notes_db[note_id] = new_note
    
    return new_note

@app.get("/notes", response_model=List[Note])
async def get_all_notes():
    return list(notes_db.values())

@app.get("/notes/{note_id}", response_model=Note)
async def get_note(note_id: str):
    if note_id not in notes_db:
        raise HTTPException(status_code=404, detail="Note not found")
    return notes_db[note_id]

@app.post("/search", response_model=List[Note])
async def search_notes(request: SearchRequest):
    try:
        # Get embedding for search query
        query_embedding = get_embedding(request.query)
        
        # Search in Pinecone
        search_results = index.query(
            vector=query_embedding,
            top_k=request.limit,
            include_metadata=True
        )
        
        # Extract note IDs from results
        note_ids = [match.id for match in search_results.matches]
        
        # Get full notes
        results = [notes_db[note_id] for note_id in note_ids if note_id in notes_db]
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

# Run with: uvicorn main:app --reload
