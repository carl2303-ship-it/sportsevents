'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  BOOST_STRIPE_PUBLISHABLE_KEY,
  BOOST_SUPABASE_ANON_KEY,
  boostEdgeRootUrl,
} from '@/lib/boost-store/config'
import { eurosFromCents, type EbookFunnel } from '@/lib/boost-store/funnels'

declare global {
  interface Window {
    Stripe?: (key: string) => {
      redirectToCheckout: (opts: { sessionId: string }) => Promise<unknown>
    }
  }
}

type Purchase = {
  customer_email?: string
  customer_name?: string
  stripe_session_id?: string
  language?: string
}

async function verifyPurchase(
  ebookProductType: string,
  sessionId: string | null,
  token: string | null,
  retries = 5
): Promise<Purchase | null> {
  const supabase = getBoostStoreBrowserClient()
  if (token) {
    const { data } = await supabase
      .from('ebook_purchases')
      .select('*')
      .eq('access_token', token)
      .eq('product_type', ebookProductType)
      .maybeSingle()
    return data
  }
  if (!sessionId) return null
  for (let attempt = 0; attempt < retries; attempt++) {
    const { data } = await supabase
      .from('ebook_purchases')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .eq('product_type', ebookProductType)
      .maybeSingle()
    if (data) return data
    if (attempt < retries - 1) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  return null
}

export function FunnelUpsellClient({
  funnel,
  slug,
}: {
  funnel: EbookFunnel
  slug: string
}) {
  const search = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (document.querySelector('script[data-stripe-js]')) return
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.async = true
    s.dataset.stripeJs = '1'
    document.body.appendChild(s)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const p = await verifyPurchase(
        funnel.ebook_product_type,
        search.get('session_id'),
        search.get('token')
      )
      if (cancelled) return
      if (!p) {
        window.location.href = `/store/funnel?slug=${encodeURIComponent(slug)}`
        return
      }
      setPurchase(p)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [funnel.ebook_product_type, search, slug])

  async function accept() {
    if (!purchase) return
    setBusy(true)
    setError(null)
    try {
      const origin = window.location.origin
      const response = await fetch(boostEdgeRootUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOOST_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          productType: funnel.upsell_product_type,
          amount: funnel.upsell_price_cents,
          customerEmail: purchase.customer_email,
          customerName: purchase.customer_name,
          originalSessionId: purchase.stripe_session_id,
          language: purchase.language || 'pt',
          successUrl: `${origin}/store/funnel/thank-you?slug=${encodeURIComponent(slug)}&bundle=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/store/funnel/thank-you?slug=${encodeURIComponent(slug)}`,
        }),
      })
      const payload = await response.json()
      if (payload.error) throw new Error(payload.error)
      if (!window.Stripe) throw new Error('Stripe.js ainda a carregar')
      const stripe = window.Stripe(BOOST_STRIPE_PUBLISHABLE_KEY)
      await stripe.redirectToCheckout({ sessionId: payload.sessionId })
    } catch (err) {
      console.error(err)
      setError('Erro no pagamento do upsell.')
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy text-app-white/60">
        A verificar a tua compra…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 text-center text-app-white">
      <div className="max-w-xl space-y-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
          Oferta única
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold">
          {funnel.stripe_upsell_name || `${funnel.title} — Upsell`}
        </h1>
        <p className="text-lg text-app-white/60">
          Completa o sistema com o mini-curso — disponível só agora.
        </p>
        <p className="text-3xl font-bold text-cyan">
          {eurosFromCents(funnel.upsell_price_cents)}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={accept}
            className="rounded-xl bg-gold px-6 py-3 font-bold text-navy hover:bg-gold/90 disabled:opacity-50"
          >
            {busy ? 'A processar…' : 'Sim, quero o upsell'}
          </button>
          <Link
            href={`/store/funnel/thank-you?slug=${encodeURIComponent(slug)}`}
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-app-white/80 hover:bg-white/5"
          >
            Não, obrigado
          </Link>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </div>
    </div>
  )
}
