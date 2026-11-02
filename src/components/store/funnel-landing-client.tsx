'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  BOOST_STRIPE_PUBLISHABLE_KEY,
  boostEdgeRootUrl,
  BOOST_EDGE_ANON_KEY,
} from '@/lib/boost-store/config'
import {
  eurosFromCents,
  simpleMarkdown,
  type EbookFunnel,
  type EbookFunnelAsset,
} from '@/lib/boost-store/funnels'

declare global {
  interface Window {
    Stripe?: (key: string) => {
      redirectToCheckout: (opts: { sessionId: string }) => Promise<unknown>
    }
  }
}

export function FunnelLandingClient({
  funnel,
  assets,
  slug,
}: {
  funnel: EbookFunnel
  assets: EbookFunnelAsset[]
  slug: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const body = funnel.landing_body || {}
  const benefits = Array.isArray(body.benefits) ? body.benefits : []
  const md = body.body_markdown ? String(body.body_markdown) : ''

  const images = useMemo(() => {
    const fromBody = Array.isArray(body.images) ? body.images.filter(Boolean) : []
    const fromAssets = assets
      .filter((a) => a.kind === 'cover' || a.kind === 'landing_image')
      .map((a) => a.public_url)
      .filter(Boolean) as string[]
    return [...new Set([...fromBody, ...fromAssets])].slice(0, 8)
  }, [body.images, assets])

  useEffect(() => {
    const supabase = getBoostStoreBrowserClient()
    void supabase.from('ebook_leads').insert([
      {
        name: 'Visitante',
        email: `visitor+${slug}-${Date.now()}@sportsevents.app`,
        source: `funnel:${slug}`,
        newsletter_opt_in: false,
      },
    ])
  }, [slug])

  useEffect(() => {
    if (document.querySelector('script[data-stripe-js]')) return
    const s = document.createElement('script')
    s.src = 'https://js.stripe.com/v3/'
    s.async = true
    s.dataset.stripeJs = '1'
    document.body.appendChild(s)
  }, [])

  async function checkout() {
    setBusy(true)
    setError(null)
    try {
      const language = (navigator.language || 'pt').slice(0, 2)
      const origin = window.location.origin
      const response = await fetch(boostEdgeRootUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOOST_EDGE_ANON_KEY}`,
        },
        body: JSON.stringify({
          productType: funnel.ebook_product_type,
          amount: funnel.ebook_price_cents,
          language,
          successUrl: `${origin}/store/funnel/upsell?slug=${encodeURIComponent(slug)}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/store/funnel?slug=${encodeURIComponent(slug)}`,
        }),
      })
      const payload = await response.json()
      if (payload.error) throw new Error(payload.error)
      if (!payload.sessionId) throw new Error('Sem sessionId Stripe')
      if (!window.Stripe) throw new Error('Stripe.js ainda a carregar')
      const stripe = window.Stripe(BOOST_STRIPE_PUBLISHABLE_KEY)
      await stripe.redirectToCheckout({ sessionId: payload.sessionId })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(
        /not found/i.test(msg)
          ? 'Edge stripe-checkout desatualizada — redeploy no Supabase Boost'
          : `Erro no pagamento. (${msg})`
      )
      setBusy(false)
    }
  }

  const price = eurosFromCents(funnel.ebook_price_cents)
  const cta = funnel.cta_label || 'Comprar agora'

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <section className="relative overflow-hidden px-5 py-20 md:px-10 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(6,182,212,0.22),_transparent_45%),radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.18),_transparent_40%)]" />
        <div className="relative mx-auto max-w-3xl text-center space-y-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan">
            SportsEvents
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold md:text-5xl">
            {funnel.headline || funnel.title}
          </h1>
          {funnel.subheadline ? (
            <p className="mx-auto max-w-2xl text-lg text-app-white/65">
              {funnel.subheadline}
            </p>
          ) : null}
          <p className="text-3xl font-extrabold text-gold">{price}</p>
          <button
            type="button"
            disabled={busy}
            onClick={checkout}
            className="rounded-xl bg-cyan px-8 py-3 text-base font-bold text-navy transition hover:bg-cyan/90 disabled:opacity-50"
          >
            {busy ? 'A processar…' : cta}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </section>

      {images.length > 0 ? (
        <section className="mx-auto grid max-w-3xl grid-cols-2 gap-3 px-5 py-10 md:grid-cols-3">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
            >
              <Image src={url} alt="" fill className="object-cover" sizes="33vw" />
            </div>
          ))}
        </section>
      ) : null}

      {benefits.length > 0 ? (
        <section className="border-y border-white/10 bg-black/20 px-5 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold">
              O que vais receber
            </h2>
            <ul className="mt-8 grid gap-3">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="rounded-r-xl border-l-4 border-cyan bg-white/5 px-4 py-3 text-sm font-semibold"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {md ? (
        <section className="mx-auto max-w-3xl px-5 py-12 text-sm leading-relaxed text-app-white/75 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_strong]:text-white">
          <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(md) }} />
        </section>
      ) : null}

      <section className="border-t border-white/10 px-5 py-12 text-center">
        <p className="text-2xl font-bold text-gold">{price}</p>
        <button
          type="button"
          disabled={busy}
          onClick={checkout}
          className="mt-4 rounded-xl bg-cyan px-8 py-3 text-base font-bold text-navy transition hover:bg-cyan/90 disabled:opacity-50"
        >
          {busy ? 'A processar…' : cta}
        </button>
      </section>
    </div>
  )
}
