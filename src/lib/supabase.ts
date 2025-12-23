import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with environment variables
 * @returns Supabase client instance
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );
}

export const supabase = createClient();