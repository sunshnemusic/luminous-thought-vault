
# ThoughtVault - Second Brain Application

ThoughtVault is a "Second Brain" application that efficiently stores and retrieves user knowledge using a vector database. It features a responsive web interface, semantic search capabilities, and AI-powered knowledge management.

## Features

- Create and store notes, links, and images in a personal knowledge base
- Vector database storage for semantic search and retrieval
- OpenAI integration for processing and generating insights
- Responsive design for both mobile and desktop use
- Customizable AI model selection

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI
- **Vector Database**: Pinecone
- **AI Integration**: OpenAI

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- Docker and Docker Compose (optional)

### Environment Setup

1. Clone the repository
2. Set up backend environment:
   ```
   cd backend
   cp .env.example .env
   # Edit .env with your API keys
   ```

### Installation

#### With Docker

1. Build and run the application:
   ```
   docker-compose up -d
   ```
   This will start both frontend and backend services.

#### Manual Setup

1. Start the backend:
   ```
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. Start the frontend:
   ```
   npm install
   npm run dev
   ```

## Development

### Backend API

The backend API is built with FastAPI and provides the following endpoints:

- `POST /notes` - Create a new note
- `GET /notes` - Get all notes
- `GET /notes/{note_id}` - Get a specific note
- `POST /search` - Perform a semantic search

### Frontend

The frontend is built with React and uses:

- React Query for data fetching
- Tailwind CSS for styling
- Shadcn UI for components

## Deployment

### Heroku Deployment (Backend)

1. Create a Heroku app
2. Configure environment variables in Heroku app settings
3. Deploy the backend:
   ```
   heroku git:remote -a your-app-name
   git subtree push --prefix backend heroku main
   ```

### Netlify Deployment (Frontend)

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify settings

## License

This project is licensed under the MIT License
