import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local file.');
}

// This is a factory function for creating a new client.
// This should be used in server-side code (api routes, services).
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);

// This is a singleton client instance.
// This can be used in client-side code.
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);