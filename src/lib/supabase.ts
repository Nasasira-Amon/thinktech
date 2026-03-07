// Import the createClient function from Supabase JavaScript SDK
// This function is used to initialize and configure a Supabase client instance
import { createClient } from '@supabase/supabase-js';

// Retrieve the Supabase project URL from environment variables
// This URL points to your specific Supabase project instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Retrieve the Supabase anonymous/public key from environment variables
// This key allows client-side access to Supabase with RLS (Row Level Security) enforcement
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export a singleton Supabase client instance
// This client will be used throughout the application for all database and auth operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
