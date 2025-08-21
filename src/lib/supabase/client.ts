import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This client is used for DATABASE operations ONLY.
// It does not handle authentication, as that is now managed by Firebase.
// We use the ANON KEY here, and rely on PostgreSQL Row Level Security (RLS)
// for data access policies. If you have not configured RLS, your data is public.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
