/**
 * Supabase Browser Client
 * @description Creates a Supabase client for use in browser/client components
 * @module lib/supabase/client
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for browser-side operations
 * Uses localStorage for session persistence to ensure reliable session restoration
 * @returns Supabase browser client instance
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('users').select()
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use localStorage for session persistence (more reliable than cookies for SPA)
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Automatically refresh token before expiry
        autoRefreshToken: true,
        // Persist session across browser sessions
        persistSession: true,
        // Detect session from URL (for OAuth callbacks)
        detectSessionInUrl: true,
      },
    }
  )
}
