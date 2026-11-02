/** Loja Boost — pós-cutover no projecto SportsEvents, schema `boost`. */

const SE_SUPABASE_URL = 'https://tprbpeacicadsbmvxcqk.supabase.co'
const LEGACY_BOOST_HOST = 'gmpyjnufuvsoewbtirsg.supabase.co'

function resolveBoostUrl(raw: string | undefined): string {
  const url =
    raw ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    SE_SUPABASE_URL
  if (url.includes(LEGACY_BOOST_HOST)) return SE_SUPABASE_URL
  return url
}

export const BOOST_SUPABASE_URL = resolveBoostUrl(
  process.env.NEXT_PUBLIC_BOOST_SUPABASE_URL
)

/** Anon do projecto SE (mesmo Auth/API que a loja). */
export const BOOST_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_BOOST_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

/** Schema Postgres das tabelas da loja no SE. */
export const BOOST_DB_SCHEMA = 'boost' as const

/** Stripe publishable (conta Boost) — igual a VITE_STRIPE_PUBLISHABLE_KEY. */
export const BOOST_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_BOOST_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51KYRS6HBQooMbxlg15uZ6MgzZVzEuQMVbrwSFxz6D6AIhPWCvjoUASZ8b0k1I392d7YXC39J26gUsPRf51a4r76T004LtMabfE'

/** Base canónica da loja SE. */
export const STORE_BASE_PATH = '/store'

/**
 * Edge stripe-checkout — após cutover vive no projecto SE.
 * Carlos: deploy functions + secrets no SE; até lá checkout pode falhar.
 */
export function boostEdgeCheckoutUrl(path = '/create-checkout-session') {
  const base = `${BOOST_SUPABASE_URL}/functions/v1/stripe-checkout`
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function boostEdgeRootUrl() {
  return `${BOOST_SUPABASE_URL}/functions/v1/stripe-checkout`
}
