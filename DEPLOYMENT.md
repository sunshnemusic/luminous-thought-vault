
# ThoughtVault Deployment Guide

This guide provides step-by-step instructions for deploying ThoughtVault to production.

## Prerequisites

- Docker and Docker Compose installed on your server
- A domain name (optional for proper HTTPS setup)
- API keys for OpenAI and Pinecone

## Configuration

### 1. Environment Setup

#### Backend Configuration

1. Create a `.env` file in the `backend` directory:
   ```
   cp backend/.env.example backend/.env
   ```

2. Edit the `.env` file and add your:
   - OpenAI API key
   - Pinecone API key and environment
   - Generate a strong SECRET_KEY (you can use `openssl rand -hex 32` to generate one)
   - Adjust other settings as needed

#### Frontend Configuration

1. Create a `.env` file in the root directory:
   ```
   cp .env.example .env
   ```

2. Update `VITE_API_URL` to point to your backend API URL

### 2. Update CORS Settings

In `backend/main.py`, update the `allowed_origins` list to include your frontend domain.

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. Deploy everything with Docker Compose:
   ```
   docker-compose up -d
   ```

2. This will start:
   - Frontend on port 8080
   - Backend API on port 8000
   - PostgreSQL database

3. Configure a reverse proxy (Nginx, Traefik, etc.) to:
   - Route traffic to your containers
   - Handle SSL termination

### Option 2: Separate Deployment

#### Backend Deployment (Heroku)

1. Create a Heroku app
2. Configure environment variables in Heroku dashboard
3. Deploy the backend:
   ```
   cd backend
   heroku git:remote -a your-app-name
   git subtree push --prefix backend heroku main
   ```

#### Frontend Deployment (Netlify)

1. Create a production build:
   ```
   npm run build
   ```

2. Deploy to Netlify:
   - Connect GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

## Post-Deployment Checklist

- [ ] Verify user registration works
- [ ] Test creating notes with vector embeddings
- [ ] Confirm semantic search functionality
- [ ] Check database persistence
- [ ] Test mobile responsiveness
