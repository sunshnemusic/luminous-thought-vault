
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import models, schemas, auth
from ..database import get_db
from ..utils.vector_utils import get_embedding, get_combined_text
from ..utils.db_utils import get_or_create_tags

# Global index variable to be set in the main app
index = None

router = APIRouter()

@router.post("/notes", response_model=schemas.NoteResponse)
async def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
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
    db_note = models.Note(
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

@router.get("/notes", response_model=List[schemas.NoteResponse])
async def get_all_notes(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    notes = db.query(models.Note).filter(models.Note.owner_id == current_user.id).all()
    
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

@router.get("/notes/{note_id}", response_model=schemas.NoteResponse)
async def get_note(note_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.owner_id == current_user.id).first()
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

@router.put("/notes/{note_id}", response_model=schemas.NoteResponse)
async def update_note(
    note_id: str, 
    note_update: schemas.NoteUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Get note
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.owner_id == current_user.id).first()
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

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Get note
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.owner_id == current_user.id).first()
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
