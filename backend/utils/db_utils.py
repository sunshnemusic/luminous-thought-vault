
from sqlalchemy.orm import Session
from typing import List
from .. import models

def get_or_create_tags(db: Session, tag_names: List[str]):
    """Get existing tags or create new ones"""
    tags = []
    for name in tag_names:
        tag = db.query(models.Tag).filter(models.Tag.name == name).first()
        if not tag:
            tag = models.Tag(id=str(models.uuid.uuid4()), name=name)
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags
