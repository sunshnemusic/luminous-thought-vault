
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from typing import List
import uuid

Base = declarative_base()

# Association table for note tags
note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', String, ForeignKey('notes.id')),
    Column('tag_id', String, ForeignKey('tags.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    notes = relationship("Note", back_populates="owner")
    
    def __repr__(self):
        return f"<User {self.username}>"

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True)
    content = Column(Text)
    type = Column(String)  # note, link, image
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    vector_id = Column(String, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")
    
    def __repr__(self):
        return f"<Note {self.title}>"

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True)
    
    # Relationships
    notes = relationship("Note", secondary=note_tags, back_populates="tags")
    
    def __repr__(self):
        return f"<Tag {self.name}>"
