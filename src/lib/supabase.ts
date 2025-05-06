
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Check for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate essential environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
}

// Create Supabase client with proper type safety
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-url.supabase.co', // Fallback URL to prevent runtime errors
  supabaseAnonKey || 'placeholder-key', // Fallback key to prevent runtime errors
);

// Browser-specific client for auth operations
export const createBrowserSupabaseClient = () => 
  createBrowserClient<Database>(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  );

export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('Failed to generate embedding');
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};
