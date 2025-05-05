
import os
import openai
import pinecone
from typing import List

def get_embedding(text: str):
    """Generate embedding vector for text using OpenAI's API"""
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

def get_combined_text(note, tags: List[str]) -> str:
    """Combine note title, content and tags for embedding generation"""
    tag_text = " ".join(tags) if tags else ""
    return f"{note.title} {note.content} {tag_text}"

def initialize_vector_db():
    """Initialize Pinecone vector database"""
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
    return pinecone.Index(index_name)
