import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { BOOST_SUPABASE_URL } from '@/lib/boost-store/config'

/**
 * Service-role client for schema `boost` on SE.
 * Bypasses RLS — only for server routes / Edge-equivalent Next handlers.
 */
export function createBoostStoreServiceClient(): SupabaseClient | null {
  const key =
    process.env.BOOST_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(BOOST_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'boost' as 'public' },
  })
}
