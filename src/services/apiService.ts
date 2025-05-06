
import { supabase, getEmbedding } from '@/lib/supabase';
import { v4 as uuid } from 'uuid';

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

// Get or create tags
const getOrCreateTags = async (tagNames: string[]): Promise<Tag[]> => {
  const tags: Tag[] = [];
  
  for (const name of tagNames) {
    // Check if tag exists
    let { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('name', name)
      .single();
    
    if (!existingTag) {
      // Create new tag
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert({ id: uuid(), name })
        .select()
        .single();
      
      if (error) throw error;
      existingTag = newTag;
    }
    
    if (existingTag) {
      tags.push({ id: existingTag.id, name: existingTag.name });
    }
  }
  
  return tags;
};

// API functions
export const apiService = {
  // Note operations
  createNote: async (noteData: NoteCreateRequest): Promise<Note> => {
    try {
      // Create note
      const noteId = uuid();
      let vectorId = null;
      
      // Get or create tags
      const tags = await getOrCreateTags(noteData.tags);
      
      // Store vector embedding if requested
      if (noteData.storeVector) {
        const combined_text = `${noteData.title} ${noteData.content} ${noteData.tags.join(' ')}`;
        const embedding = await getEmbedding(combined_text);
        
        // Generate unique ID for the vector
        vectorId = `note:${noteId}`;
        
        // Store in note_embeddings table
        const { error: embeddingError } = await supabase
          .from('note_embeddings')
          .insert({
            id: vectorId,
            note_id: noteId,
            embedding
          });
        
        if (embeddingError) throw embeddingError;
      }
      
      // Create note in database
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .insert({
          id: noteId,
          title: noteData.title,
          content: noteData.content,
          type: noteData.type,
          vector_id: vectorId
        })
        .select()
        .single();
      
      if (noteError) throw noteError;
      
      // Add note-tag relationships
      if (tags.length > 0) {
        const noteTagRows = tags.map(tag => ({
          note_id: noteId,
          tag_id: tag.id
        }));
        
        const { error: tagError } = await supabase
          .from('note_tags')
          .insert(noteTagRows);
        
        if (tagError) throw tagError;
      }
      
      return {
        id: note.id,
        title: note.title,
        content: note.content,
        type: note.type,
        date: note.created_at,
        tags: tags,
        vectorId: note.vector_id
      };
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  getNotes: async (): Promise<Note[]> => {
    try {
      // Get notes
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (notesError) throw notesError;
      if (!notes) return [];
      
      // Get tags for each note
      const noteIds = notes.map(note => note.id);
      const { data: noteTagsData, error: tagsError } = await supabase
        .from('note_tags')
        .select('note_id, tags(*)')
        .in('note_id', noteIds);
      
      if (tagsError) throw tagsError;
      
      // Map notes to response format
      return notes.map(note => {
        const noteTags = (noteTagsData || [])
          .filter(nt => nt.note_id === note.id)
          .map(nt => ({ 
            id: nt.tags.id, 
            name: nt.tags.name 
          }));
        
        return {
          id: note.id,
          title: note.title,
          content: note.content,
          type: note.type as "note" | "link" | "image",
          date: note.created_at,
          tags: noteTags,
          vectorId: note.vector_id
        };
      });
    } catch (error) {
      console.error("Error getting notes:", error);
      throw error;
    }
  },

  getNote: async (id: string): Promise<Note> => {
    try {
      // Get note
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (noteError) throw noteError;
      
      // Get tags for note
      const { data: noteTagsData, error: tagsError } = await supabase
        .from('note_tags')
        .select('tags(*)')
        .eq('note_id', id);
      
      if (tagsError) throw tagsError;
      
      const tags = (noteTagsData || []).map(nt => ({
        id: nt.tags.id,
        name: nt.tags.name
      }));
      
      return {
        id: note.id,
        title: note.title,
        content: note.content,
        type: note.type as "note" | "link" | "image",
        date: note.created_at,
        tags: tags,
        vectorId: note.vector_id
      };
    } catch (error) {
      console.error("Error getting note:", error);
      throw error;
    }
  },
  
  updateNote: async (id: string, noteData: NoteUpdateRequest): Promise<Note> => {
    try {
      // Get existing note
      const { data: existingNote, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (noteError) throw noteError;
      
      // Update note in database
      const updateData: any = {};
      if (noteData.title !== undefined) updateData.title = noteData.title;
      if (noteData.content !== undefined) updateData.content = noteData.content;
      if (noteData.type !== undefined) updateData.type = noteData.type;
      updateData.updated_at = new Date().toISOString();
      
      const { data: updatedNote, error: updateError } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Update tags if provided
      let tags: Tag[] = [];
      if (noteData.tags !== undefined) {
        // Get or create new tags
        tags = await getOrCreateTags(noteData.tags);
        
        // Delete existing note-tag relationships
        await supabase
          .from('note_tags')
          .delete()
          .eq('note_id', id);
        
        // Create new note-tag relationships
        if (tags.length > 0) {
          const noteTagRows = tags.map(tag => ({
            note_id: id,
            tag_id: tag.id
          }));
          
          const { error: tagError } = await supabase
            .from('note_tags')
            .insert(noteTagRows);
          
          if (tagError) throw tagError;
        }
      } else {
        // Get existing tags
        const { data: noteTagsData, error: tagsError } = await supabase
          .from('note_tags')
          .select('tags(*)')
          .eq('note_id', id);
        
        if (tagsError) throw tagsError;
        
        tags = (noteTagsData || []).map(nt => ({
          id: nt.tags.id,
          name: nt.tags.name
        }));
      }
      
      // Update vector embedding if it exists
      if (existingNote.vector_id) {
        const combined_text = `${updatedNote.title} ${updatedNote.content} ${tags.map(tag => tag.name).join(' ')}`;
        const embedding = await getEmbedding(combined_text);
        
        // Update in note_embeddings table
        const { error: embeddingError } = await supabase
          .from('note_embeddings')
          .update({ embedding })
          .eq('id', existingNote.vector_id);
        
        if (embeddingError) throw embeddingError;
      }
      
      return {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        type: updatedNote.type,
        date: updatedNote.created_at,
        tags: tags,
        vectorId: updatedNote.vector_id
      };
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },
  
  deleteNote: async (id: string): Promise<void> => {
    try {
      // Get note to check if it has a vector_id
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('vector_id')
        .eq('id', id)
        .single();
      
      if (noteError) throw noteError;
      
      // Delete vector embedding if it exists
      if (note && note.vector_id) {
        const { error: embeddingError } = await supabase
          .from('note_embeddings')
          .delete()
          .eq('id', note.vector_id);
        
        if (embeddingError) throw embeddingError;
      }
      
      // Delete note-tag relationships
      await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', id);
      
      // Delete note
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  // Tag operations
  getTags: async (): Promise<Tag[]> => {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*');
      
      if (error) throw error;
      
      return (tags || []).map(tag => ({
        id: tag.id,
        name: tag.name
      }));
    } catch (error) {
      console.error("Error getting tags:", error);
      throw error;
    }
  },

  // Search operations
  semanticSearch: async (request: SearchRequest): Promise<Note[]> => {
    try {
      // Generate embedding for search query
      const embedding = await getEmbedding(request.query);
      
      // Call match_notes function
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase.rpc(
        'match_notes',
        {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: request.limit || 10,
          user_id: user.user.id
        }
      );
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get note IDs from results
      const noteIds = data.map(result => result.id);
      
      // Get tags for each note
      const { data: noteTagsData, error: tagsError } = await supabase
        .from('note_tags')
        .select('note_id, tags(*)')
        .in('note_id', noteIds);
      
      if (tagsError) throw tagsError;
      
      // Map results to Note objects
      return data.map(result => {
        const noteTags = (noteTagsData || [])
          .filter(nt => nt.note_id === result.id)
          .map(nt => ({
            id: nt.tags.id,
            name: nt.tags.name
          }));
        
        return {
          id: result.id,
          title: result.title,
          content: result.content,
          type: result.type as "note" | "link" | "image",
          date: result.created_at,
          tags: noteTags,
          vectorId: result.vector_id
        };
      });
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  }
};
