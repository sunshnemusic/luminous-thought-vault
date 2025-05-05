
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

// Add request interceptor to include token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface NoteCreateRequest {
  title: string;
  content: string;
  type: "note" | "link" | "image";
  tags: string[];
  storeVector: boolean;
}

export interface NoteUpdateRequest {
  title?: string;
  content?: string;
  type?: "note" | "link" | "image";
  tags?: string[];
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
  tags: Tag[];
  date: string;
  vectorId?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// API functions
export const apiService = {
  // Authentication
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post<User>("/register", userData);
    return response.data;
  },
  
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    // Convert to form data as required by OAuth2
    const formData = new FormData();
    formData.append("username", loginData.username);
    formData.append("password", loginData.password);
    
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/token`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
    // Store token in localStorage
    localStorage.setItem("token", response.data.access_token);
    
    return response.data;
  },
  
  logout: (): void => {
    localStorage.removeItem("token");
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

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
  
  updateNote: async (id: string, noteData: NoteUpdateRequest): Promise<Note> => {
    const response = await api.put<Note>(`/notes/${id}`, noteData);
    return response.data;
  },
  
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  // Tag operations
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>("/tags");
    return response.data;
  },

  // Search operations
  semanticSearch: async (request: SearchRequest): Promise<Note[]> => {
    const response = await api.post<Note[]>("/search", request);
    return response.data;
  },
};

// Export a utility to get headers for fetch requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
