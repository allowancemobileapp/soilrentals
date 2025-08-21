
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Note: These environment variables are exposed to the browser
  // and are NOT secrets. They are safe to use here.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
