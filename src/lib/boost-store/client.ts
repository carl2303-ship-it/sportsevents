import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  BOOST_SUPABASE_ANON_KEY,
  BOOST_SUPABASE_URL,
} from '@/lib/boost-store/config'

let browserClient: SupabaseClient | null = null

/** Cliente anon Boost — leitura pública de produtos + insert orders (RLS). */
export function createBoostStoreClient(): SupabaseClient {
  return createClient(BOOST_SUPABASE_URL, BOOST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function getBoostStoreBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBoostStoreClient()
  }
  return browserClient
}
