/** Loja Boost — dados + Edge Stripe no projecto SportsEvents (schema `boost`). */

const SE_SUPABASE_URL = 'https://tprbpeacicadsbmvxcqk.supabase.co'
/** Projecto Boost legado — só referência histórica; não usar para dados nem Edge. */
export const BOOST_LEGACY_SUPABASE_URL =
  'https://gmpyjnufuvsoewbtirsg.supabase.co'

function resolveDataUrl(raw: string | undefined): string {
  const url = raw || process.env.NEXT_PUBLIC_SUPABASE_URL || SE_SUPABASE_URL
  // Dados migrados: nunca usar o host legado para PostgREST
  if (url.includes('gmpyjnufuvsoewbtirsg.supabase.co')) return SE_SUPABASE_URL
  return url
}

/** URL API para dados da loja (SE). */
export const BOOST_SUPABASE_URL = resolveDataUrl(
  process.env.NEXT_PUBLIC_BOOST_SUPABASE_URL
)

/** Anon SE para leitura/escrita schema `boost`. */
export const BOOST_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_BOOST_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

/**
 * Edge `stripe-checkout` — canónico no projecto SE após cutover.
 * Override: NEXT_PUBLIC_BOOST_EDGE_URL (ex. hold legado).
 */
export const BOOST_EDGE_URL = (
  process.env.NEXT_PUBLIC_BOOST_EDGE_URL || SE_SUPABASE_URL
).replace(/\/$/, '')

/**
 * Anon do projecto Edge (SE).
 * Override: NEXT_PUBLIC_BOOST_EDGE_ANON_KEY.
 * Default = anon SE da loja/hub (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
 */
export const BOOST_EDGE_ANON_KEY =
  process.env.NEXT_PUBLIC_BOOST_EDGE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

export const BOOST_DB_SCHEMA = 'boost' as const

/**
 * Stripe publishable — conta SportsEvents (não Boost).
 * Prefer `NEXT_PUBLIC_BOOST_STRIPE_PUBLISHABLE_KEY`, senão `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
 */
export const BOOST_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_BOOST_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  ''

export const STORE_BASE_PATH = '/store'

export function boostEdgeCheckoutUrl(path = '/create-checkout-session') {
  const base = `${BOOST_EDGE_URL}/functions/v1/stripe-checkout`
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function boostEdgeRootUrl() {
  return `${BOOST_EDGE_URL}/functions/v1/stripe-checkout`
}
