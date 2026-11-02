/** Loja Boost — dados no SE schema `boost`; Edge Stripe ainda no projecto Boost até cutover. */

const SE_SUPABASE_URL = 'https://tprbpeacicadsbmvxcqk.supabase.co'
/** Projecto Boost legado — Edge `stripe-checkout` + webhook Stripe ainda aqui. */
export const BOOST_LEGACY_SUPABASE_URL =
  'https://gmpyjnufuvsoewbtirsg.supabase.co'

function resolveDataUrl(raw: string | undefined): string {
  const url = raw || process.env.NEXT_PUBLIC_SUPABASE_URL || SE_SUPABASE_URL
  // Dados já migrados: nunca usar o host legado para PostgREST
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
 * Edge stripe-checkout — mantém-se no projecto Boost enquanto SE Edge + webhook
 * não estiverem prontos (pagamentos). Override: NEXT_PUBLIC_BOOST_EDGE_URL.
 */
export const BOOST_EDGE_URL = (
  process.env.NEXT_PUBLIC_BOOST_EDGE_URL || BOOST_LEGACY_SUPABASE_URL
).replace(/\/$/, '')

/** Anon do projecto Boost (apikey Edge). Não usar a anon SE aqui. */
export const BOOST_EDGE_ANON_KEY =
  process.env.NEXT_PUBLIC_BOOST_EDGE_ANON_KEY ||
  // fallback público legado (mesmo que VITE_ do boostpadel)
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcHlqbnVmdXZzb2V3YnRpcnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjQ0NTYsImV4cCI6MjA3NjA0MDQ1Nn0.Uoe0xGYkQteD0nnHxeM5euGvBdeMbD64VbhBFQcGkX8'

export const BOOST_DB_SCHEMA = 'boost' as const

/** Stripe publishable (conta Boost). */
export const BOOST_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_BOOST_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51KYRS6HBQooMbxlg15uZ6MgzZVzEuQMVbrwSFxz6D6AIhPWCvjoUASZ8b0k1I392d7YXC39J26gUsPRf51a4r76T004LtMabfE'

export const STORE_BASE_PATH = '/store'

export function boostEdgeCheckoutUrl(path = '/create-checkout-session') {
  const base = `${BOOST_EDGE_URL}/functions/v1/stripe-checkout`
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function boostEdgeRootUrl() {
  return `${BOOST_EDGE_URL}/functions/v1/stripe-checkout`
}
