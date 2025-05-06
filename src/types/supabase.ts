
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string
          type: "note" | "link" | "image"
          created_at: string
          updated_at: string
          vector_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: "note" | "link" | "image"
          created_at?: string
          updated_at?: string
          vector_id?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: "note" | "link" | "image"
          created_at?: string
          updated_at?: string
          vector_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      note_embeddings: {
        Row: {
          id: string
          note_id: string
          embedding: number[]
        }
        Insert: {
          id?: string
          note_id: string
          embedding: number[]
        }
        Update: {
          id?: string
          note_id?: string
          embedding?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "note_embeddings_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      match_notes: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          user_id: string
        }
        Returns: {
          id: string
          title: string
          content: string
          type: string
          created_at: string
          similarity: number
        }[]
      }
    }
  }
}
