import { createBrowserClient } from '@supabase/ssr'

export { isSupabaseConfigured, withTimeout } from './config'

/**
 * Browser-side Supabase client.
 * Uses anon key — RLS enforced on all tables.
 * Safe to use in client components.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-kiet.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
