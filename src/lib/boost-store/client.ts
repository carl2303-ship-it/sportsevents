import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  BOOST_DB_SCHEMA,
  BOOST_SUPABASE_ANON_KEY,
  BOOST_SUPABASE_URL,
} from '@/lib/boost-store/config'

let browserClient: SupabaseClient | null = null

/** Cliente anon loja — schema `boost` no projecto SportsEvents. */
export function createBoostStoreClient(): SupabaseClient {
  if (!BOOST_SUPABASE_ANON_KEY) {
    throw new Error(
      'Falta NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_BOOST_SUPABASE_ANON_KEY) para a loja.'
    )
  }
  return createClient(BOOST_SUPABASE_URL, BOOST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: BOOST_DB_SCHEMA },
  })
}

export function getBoostStoreBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBoostStoreClient()
  }
  return browserClient
}
