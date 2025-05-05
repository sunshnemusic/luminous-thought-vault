
import axios from "axios";

// Set the base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface NoteCreateRequest {
  title: string;
  content: string;
  type: "note" | "link" | "image";
  tags: string[];
  storeVector: boolean;
}

export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: "note" | "link" | "image";
  tags: string[];
  date: string;
  vectorId?: string;
}

// API functions
export const apiService = {
  // Note operations
  createNote: async (noteData: NoteCreateRequest): Promise<Note> => {
    const response = await api.post<Note>("/notes", noteData);
    return response.data;
  },

  getNotes: async (): Promise<Note[]> => {
    const response = await api.get<Note[]>("/notes");
    return response.data;
  },

  getNote: async (id: string): Promise<Note> => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  // Search operations
  semanticSearch: async (request: SearchRequest): Promise<Note[]> => {
    const response = await api.post<Note[]>("/search", request);
    return response.data;
  },
};
