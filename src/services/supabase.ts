import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The one Supabase client. The publishable key is meant to be public: the
// database's Row Level Security, not the key, keeps each user's data private.
// Without the two variables (a fresh clone, no .env.local) the client is null
// and the app runs as a guest who can only browse.

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
      })
    : null;
