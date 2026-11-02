/** Supabase Boost (loja) — chaves públicas (anon), iguais às VITE_ do boostpadel. */

export const BOOST_SUPABASE_URL =
  process.env.NEXT_PUBLIC_BOOST_SUPABASE_URL ||
  'https://gmpyjnufuvsoewbtirsg.supabase.co'

export const BOOST_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_BOOST_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcHlqbnVmdXZzb2V3YnRpcnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjQ0NTYsImV4cCI6MjA3NjA0MDQ1Nn0.Uoe0xGYkQteD0nnHxeM5euGvBdeMbD64VbhBFQcGkX8'

/** Stripe publishable (conta Boost) — igual a VITE_STRIPE_PUBLISHABLE_KEY. */
export const BOOST_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_BOOST_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51KYRS6HBQooMbxlg15uZ6MgzZVzEuQMVbrwSFxz6D6AIhPWCvjoUASZ8b0k1I392d7YXC39J26gUsPRf51a4r76T004LtMabfE'

/** Base canónica da loja SE. */
export const STORE_BASE_PATH = '/store'

export function boostEdgeCheckoutUrl(path = '/create-checkout-session') {
  const base = `${BOOST_SUPABASE_URL}/functions/v1/stripe-checkout`
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function boostEdgeRootUrl() {
  return `${BOOST_SUPABASE_URL}/functions/v1/stripe-checkout`
}
