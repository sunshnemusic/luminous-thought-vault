
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()

@router.get("/tags", response_model=List[schemas.Tag])
async def get_all_tags(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Get all tags that are associated with the user's notes
    user_notes = db.query(models.Note).filter(models.Note.owner_id == current_user.id).all()
    tags = set()
    for note in user_notes:
        for tag in note.tags:
            tags.add(tag)
    
    return [schemas.Tag(id=tag.id, name=tag.name) for tag in tags]
