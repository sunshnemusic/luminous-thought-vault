
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Note schemas
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: str

    class Config:
        orm_mode = True

class NoteBase(BaseModel):
    title: str
    content: str
    type: str
    
class NoteCreate(NoteBase):
    tags: List[str]
    storeVector: bool = True

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(NoteBase):
    id: str
    date: datetime
    tags: List[Tag]
    vectorId: Optional[str] = None

    class Config:
        orm_mode = True

# User schemas
class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Search schemas
class SearchRequest(BaseModel):
    query: str
    limit: int = 10
