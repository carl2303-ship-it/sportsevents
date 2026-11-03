'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart2,
  Check,
  CheckCircle,
  FileText,
  Frown,
  HelpCircle,
  Smartphone,
} from 'lucide-react'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  BOOST_STRIPE_PUBLISHABLE_KEY,
  BOOST_EDGE_ANON_KEY,
  boostEdgeRootUrl,
} from '@/lib/boost-store/config'
import { PADEL_IQ_ASSETS } from '@/lib/boost-store/padel-iq-assets'
import {
  PADEL_IQ_LANGS,
  padelIqLandingTranslations,
  type PadelIqLang,
} from '@/lib/boost-store/padel-iq-landing-i18n'
import { eurosFromCents, type EbookFunnel } from '@/lib/boost-store/funnels'

declare global {
  interface Window {
    Stripe?: (key: string) => {
      redirectToCheckout: (opts: { sessionId: string }) => Promise<unknown>
    }
  }
}

const LANG_KEY = 'padel-iq-lang'

function detectLang(): PadelIqLang {
  if (typeof window === 'undefined') return 'pt'
  const stored = localStorage.getItem(LANG_KEY) as PadelIqLang | null
  if (stored && stored in padelIqLandingTranslations) return stored
  const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase()
  if (nav in padelIqLandingTranslations) return nav as PadelIqLang
  return 'pt'
}

export function PadelIqLandingClient({
  funnel,
  slug,
}: {
  funnel: EbookFunnel
  slug: string
}) {
  const [lang, setLang] = useState<PadelIqLang>('pt')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const t = padelIqLandingTranslations[lang]

  useEffect(() => {
    const next = detectLang()
    setLang(next)
    document.title = padelIqLandingTranslations[next].metaTitle
    document.documentElement.lang = next
  }, [])

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

  function switchLang(code: PadelIqLang) {
    setLang(code)
    localStorage.setItem(LANG_KEY, code)
    document.title = padelIqLandingTranslations[code].metaTitle
    document.documentElement.lang = code
  }

  async function checkout() {
    setBusy(true)
    setError(null)
    try {
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
          language: lang,
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

  const priceLabel =
    eurosFromCents(funnel.ebook_price_cents).replace(/\s/g, '') || t.pricingSpecial

  const modules = [
    { title: t.module1Title, text: t.module1Text },
    { title: t.module2Title, text: t.module2Text },
    { title: t.module3Title, text: t.module3Text },
    { title: t.module4Title, text: t.module4Text },
    { title: t.module5Title, text: t.module5Text },
    { title: t.module6Title, text: t.module6Text },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Tailwind safelist for classes used inside i18n HTML strings */}
      <span className="hidden text-blue-400 text-blue-300 text-blue-600 underline decoration-blue-500/50 font-bold text-white" />
      <style>{`
        .padel-iq-hero-bg {
          background-color: #0f172a;
          background-image: radial-gradient(#1e293b 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .padel-iq-html .gradient-text {
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PADEL_IQ_ASSETS.logo} alt="The Padel IQ" className="h-12" />
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              {PADEL_IQ_LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => switchLang(l.code)}
                  className={`rounded px-2 py-1 transition ${
                    lang === l.code
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <a
              href="#pricing"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 md:px-6"
            >
              {t.buyNow}
            </a>
          </div>
        </div>
      </nav>

      <header className="padel-iq-hero-bg relative overflow-hidden px-4 pb-24 pt-20 text-white">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full border border-blue-500/30 bg-blue-600/20 px-4 py-1 text-sm font-semibold text-blue-300">
            {t.badge}
          </div>
          <h1
            className="mb-6 text-4xl font-black leading-tight md:text-6xl"
            dangerouslySetInnerHTML={{ __html: t.heroTitle }}
          />
          <p
            className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-300 md:text-2xl"
            dangerouslySetInnerHTML={{ __html: t.heroSubtitle }}
          />
          <div className="mx-auto max-w-3xl rounded-2xl bg-gray-900/30 p-6 md:p-10">
            <div className="aspect-video overflow-hidden rounded-xl bg-gray-800">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
                preload="auto"
              >
                <source src={PADEL_IQ_ASSETS.salesVideo} type="video/mp4" />
              </video>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
            <a
              href="#pricing"
              className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 hover:bg-blue-500 md:w-auto"
            >
              <span>{t.ctaPrimary}</span>
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="text-sm text-slate-400 md:hidden">{t.ctaSecondary}</p>
          </div>
        </div>
      </header>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-bold">{t.painPointsTitle}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { Icon: Frown, title: t.pain1Title, text: t.pain1Text },
              { Icon: HelpCircle, title: t.pain2Title, text: t.pain2Text },
              { Icon: BarChart2, title: t.pain3Title, text: t.pain3Text },
            ].map(({ Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{title}</h3>
                <p className="text-slate-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
            <p
              className="text-lg font-medium text-slate-800"
              dangerouslySetInnerHTML={{ __html: t.truthBox }}
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-20 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row">
          <div className="md:w-1/2">
            <div className="rotate-3 transform rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-1 shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-transform duration-500 hover:rotate-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PADEL_IQ_ASSETS.ebookCover}
                alt="PADEL IQ PRO"
                className="block h-auto w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <h2
              className="padel-iq-html mb-6 text-3xl font-bold md:text-4xl"
              dangerouslySetInnerHTML={{ __html: t.productTitle }}
            />
            <p
              className="mb-6 text-lg text-slate-300"
              dangerouslySetInnerHTML={{ __html: t.productDesc1 }}
            />
            <p
              className="mb-8 text-lg text-slate-300"
              dangerouslySetInnerHTML={{ __html: t.productDesc2 }}
            />
            <ul className="mb-8 space-y-4">
              {[t.benefit1, t.benefit2, t.benefit3].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 shrink-0 text-blue-400" />
                  <span dangerouslySetInnerHTML={{ __html: b }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold">{t.modulesTitle}</h2>
          <p className="mb-12 text-center text-slate-500">{t.modulesSubtitle}</p>
          <div className="space-y-6">
            {modules.map((m, i) => (
              <div
                key={m.title}
                className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 md:flex-row"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
                  {i + 1}
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">{m.title}</h3>
                  <p className="text-slate-600">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">{t.bonusTitle}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              { Icon: FileText, title: t.bonus1Title, text: t.bonus1Text },
              { Icon: Smartphone, title: t.bonus2Title, text: t.bonus2Text },
            ].map(({ Icon, title, text }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-8"
              >
                <div className="absolute right-0 top-0 rounded-bl-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                  {t.bonusLabel}
                </div>
                <div className="mb-4 text-blue-600">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{title}</h3>
                <p className="text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative overflow-hidden bg-slate-900 px-4 py-24 text-center text-white"
      >
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-blue-500 opacity-20 mix-blend-multiply blur-3xl filter" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-cyan-500 opacity-20 mix-blend-multiply blur-3xl filter" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold md:text-5xl">{t.pricingTitle}</h2>
          <p className="mb-12 text-xl text-slate-300">{t.pricingSubtitle}</p>
          <div className="mx-auto max-w-md transform rounded-3xl bg-white p-8 text-slate-900 shadow-2xl transition-transform duration-300 hover:scale-105">
            <p className="mb-2 text-lg text-slate-500 line-through">{t.pricingNormal}</p>
            <div className="mb-6 flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-blue-600">{priceLabel}</span>
              <span className="font-medium text-slate-500">{t.pricingLabel}</span>
            </div>
            <ul className="mb-8 space-y-3 text-left text-slate-600">
              {[
                t.pricingItem1,
                t.pricingItem2,
                t.pricingItem3,
                t.pricingItem4,
                t.pricingItem5,
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={busy}
              onClick={checkout}
              className="mb-4 block w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 disabled:opacity-50"
            >
              {busy ? '…' : t.pricingCTA}
            </button>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t.pricingSecure}</span>
            </div>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-6xl px-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PADEL_IQ_ASSETS.logo}
            alt="The Padel IQ"
            className="mx-auto mb-6 h-20 opacity-70"
          />
          <p className="mb-4">{t.footerCopyright}</p>
          <div className="space-x-4 text-sm">
            <Link href="/termos" className="transition hover:text-white">
              {t.footerTerms}
            </Link>
            <Link href="/privacidade" className="transition hover:text-white">
              {t.footerPrivacy}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
