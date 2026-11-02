import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  BOOST_SUPABASE_ANON_KEY,
  BOOST_SUPABASE_URL,
} from '@/lib/boost-store/config'

let browserClient: SupabaseClient | null = null

/**
 * Cliente anon loja — PostgREST schema `boost` no SE.
 * Sem Database generics (tipos gerados só têm `public`) → options sem restrição de SchemaName.
 */
export function createBoostStoreClient(): SupabaseClient {
  if (!BOOST_SUPABASE_ANON_KEY) {
    throw new Error(
      'Falta NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_BOOST_SUPABASE_ANON_KEY) para a loja.'
    )
  }
  return createClient(BOOST_SUPABASE_URL, BOOST_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Cast: DefaultDatabase só admite schema "public"; runtime usa "boost".
    db: { schema: 'boost' as 'public' },
  })
}

export function getBoostStoreBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createBoostStoreClient()
  }
  return browserClient
}
