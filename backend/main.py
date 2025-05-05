
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import openai

# Import local modules
from .database import engine, get_db
from . import models
from .utils.vector_utils import initialize_vector_db
from .api import auth_routes, note_routes, search_routes, tag_routes

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

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize Pinecone vector database
index = initialize_vector_db()

# Set the index in the routes modules
note_routes.index = index
search_routes.index = index

# Include routers
app.include_router(auth_routes.router, tags=["authentication"])
app.include_router(note_routes.router, tags=["notes"])
app.include_router(search_routes.router, tags=["search"])
app.include_router(tag_routes.router, tags=["tags"])

# Basic routes
@app.get("/")
def read_root():
    return {"message": "ThoughtVault API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Run with: uvicorn main:app --reload
