
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, auth
from ..database import get_db
from ..utils.vector_utils import get_embedding

# Global index variable to be set in the main app
index = None

router = APIRouter()

@router.post("/search", response_model=List[schemas.NoteResponse])
async def search_notes(request: schemas.SearchRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
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
        notes = db.query(models.Note).filter(
            models.Note.id.in_(note_ids),
            models.Note.owner_id == current_user.id
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
