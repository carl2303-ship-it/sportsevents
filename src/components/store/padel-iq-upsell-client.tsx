'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  BOOST_STRIPE_PUBLISHABLE_KEY,
  BOOST_EDGE_ANON_KEY,
  boostEdgeRootUrl,
} from '@/lib/boost-store/config'
import { PADEL_IQ_ASSETS } from '@/lib/boost-store/padel-iq-assets'
import {
  PADEL_IQ_LANGS,
  type PadelIqLang,
} from '@/lib/boost-store/padel-iq-landing-i18n'
import { padelIqUpsellTranslations } from '@/lib/boost-store/padel-iq-upsell-i18n'
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

const LANG_KEY = 'padel-iq-lang'

function detectLang(): PadelIqLang {
  if (typeof window === 'undefined') return 'pt'
  const stored = localStorage.getItem(LANG_KEY) as PadelIqLang | null
  if (stored && stored in padelIqUpsellTranslations) return stored
  const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase()
  if (nav in padelIqUpsellTranslations) return nav as PadelIqLang
  return 'pt'
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

export function PadelIqUpsellClient({
  funnel,
  slug,
}: {
  funnel: EbookFunnel
  slug: string
}) {
  const search = useSearchParams()
  const [lang, setLang] = useState<PadelIqLang>('pt')
  const [loading, setLoading] = useState(true)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const t = padelIqUpsellTranslations[lang]

  useEffect(() => {
    const next = detectLang()
    setLang(next)
    document.title = padelIqUpsellTranslations[next].metaTitle
    document.documentElement.lang = next
  }, [])

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

  function switchLang(code: PadelIqLang) {
    setLang(code)
    localStorage.setItem(LANG_KEY, code)
    document.title = padelIqUpsellTranslations[code].metaTitle
    document.documentElement.lang = code
  }

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
          Authorization: `Bearer ${BOOST_EDGE_ANON_KEY}`,
        },
        body: JSON.stringify({
          productType: funnel.upsell_product_type,
          amount: funnel.upsell_price_cents,
          customerEmail: purchase.customer_email,
          customerName: purchase.customer_name,
          originalSessionId: purchase.stripe_session_id,
          language: purchase.language || lang,
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

  const priceLabel =
    eurosFromCents(funnel.upsell_price_cents).replace(/\s/g, '') || t.ctaPrice

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white font-sans">
        <div className="text-center">
          <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-blue-600" />
          <p className="text-xl font-semibold text-gray-700">{t.loadingText}</p>
        </div>
      </div>
    )
  }

  const modules = [
    {
      title: t.module1Title,
      text: t.module1Text,
      cls: 'from-purple-50 to-purple-100 border-purple-300',
    },
    {
      title: t.module2Title,
      text: t.module2Text,
      cls: 'from-blue-50 to-blue-100 border-blue-300',
    },
    {
      title: t.module3Title,
      text: t.module3Text,
      cls: 'from-green-50 to-green-100 border-green-300',
    },
    {
      title: t.module4Title,
      text: t.module4Text,
      cls: 'from-orange-50 to-orange-100 border-orange-300',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <span className="hidden font-bold text-red-600 text-yellow-300 underline" />
      <style>{`
        .padel-iq-gradient-urgent {
          background: linear-gradient(135deg, #dc2626 0%, #f97316 100%);
        }
        .padel-iq-pulse-urgent {
          animation: padelIqPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes padelIqPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .padel-iq-html .text-padel-blue,
        .text-padel-blue { color: #3b82f6; }
      `}</style>

      <div className="flex justify-end border-b border-gray-200 bg-white px-4 py-2">
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
      </div>

      <div className="padel-iq-gradient-urgent padel-iq-pulse-urgent py-4 text-center text-white">
        <p className="text-xl font-black uppercase tracking-wider md:text-2xl">
          {t.urgentHeader}
        </p>
      </div>

      <section className="px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 rounded-3xl bg-white p-8 shadow-2xl md:p-12">
            <div className="mb-8 text-center">
              <span className="mb-4 block text-6xl">🎉</span>
              <h1 className="mb-4 text-3xl font-black text-gray-900 md:text-4xl">
                {t.thankYouTitle}
              </h1>
              <p className="text-xl text-gray-700">{t.thankYouSubtitle}</p>
            </div>
            <div className="rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 p-6 md:p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                {t.newProblemTitle}
              </h2>
              <p
                className="padel-iq-html mb-4 text-lg leading-relaxed text-gray-800 md:text-xl"
                dangerouslySetInnerHTML={{ __html: t.newProblemText1 }}
              />
              <p
                className="mb-4 text-lg leading-relaxed text-gray-800 md:text-xl"
                dangerouslySetInnerHTML={{ __html: t.newProblemText2 }}
              />
              <p
                className="mt-6 text-xl font-black text-gray-900 md:text-2xl"
                dangerouslySetInnerHTML={{ __html: t.newProblemText3 }}
              />
            </div>
          </div>

          <div className="mb-12 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-2xl md:p-12">
            <div className="mb-8 text-center">
              <p className="mb-4 text-sm font-black uppercase tracking-widest text-yellow-300">
                {t.offerBadge}
              </p>
              <h2
                className="mb-6 text-3xl font-black md:text-5xl"
                dangerouslySetInnerHTML={{ __html: t.offerTitle }}
              />
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-blue-100 md:text-2xl">
                {t.offerSubtitle}
              </p>
            </div>
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PADEL_IQ_ASSETS.mentalCover}
                alt=""
                className="h-auto max-w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>

          <div className="mb-12 rounded-3xl bg-white p-8 shadow-2xl md:p-12">
            <h2 className="mb-4 text-center text-3xl font-black text-gray-900 md:text-4xl">
              {t.whatYouGetTitle}
            </h2>
            <p className="mb-10 text-center text-lg text-gray-600">
              {t.whatYouGetSubtitle}
            </p>
            <div className="mb-12 space-y-6">
              {modules.map((m) => (
                <div
                  key={m.title}
                  className={`rounded-2xl border-2 bg-gradient-to-r p-6 ${m.cls}`}
                >
                  <div className="mb-3 flex items-center">
                    <span className="mr-4 text-3xl">🎬</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{m.title}</h3>
                      <p className="text-gray-700">{m.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 pt-8">
              <h3 className="mb-8 text-center text-2xl font-black text-gray-900">
                {t.bonusTitle}
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50 p-6 text-center">
                  <span className="mb-4 block text-5xl">🎧</span>
                  <h4 className="mb-3 text-xl font-bold text-gray-900">
                    {t.audioBonus}
                  </h4>
                  <p className="mb-2 font-semibold text-gray-700">
                    {t.audioBonusTitle}
                  </p>
                  <p className="text-sm text-gray-600">{t.audioBonusText}</p>
                </div>
                <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center">
                  <span className="mb-4 block text-5xl">📄</span>
                  <h4 className="mb-3 text-xl font-bold text-gray-900">
                    {t.pdfBonus}
                  </h4>
                  <p className="mb-2 font-semibold text-gray-700">
                    {t.pdfBonusTitle}
                  </p>
                  <p className="text-sm text-gray-600">{t.pdfBonusText}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-center text-white shadow-2xl md:p-12">
            <h2
              className="mb-6 text-2xl font-bold leading-relaxed md:text-3xl"
              dangerouslySetInnerHTML={{ __html: t.ctaMainText }}
            />
            <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
              <p className="mb-2 text-xl font-bold">{t.ctaOfferLabel}</p>
              <p className="mb-2 text-5xl font-black md:text-6xl">{priceLabel}</p>
              <p className="text-green-200">{t.ctaSubtext}</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={accept}
              className="mb-6 w-full transform rounded-2xl bg-yellow-400 px-8 py-6 text-xl font-black text-gray-900 shadow-2xl transition duration-300 hover:scale-105 hover:bg-yellow-500 disabled:opacity-50 md:text-2xl"
            >
              {busy ? '…' : t.ctaButton}
            </button>
            <div className="mb-4 flex items-center justify-center space-x-2 text-green-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">{t.ctaBenefit1}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">{t.ctaBenefit2}</span>
            </div>
            {error ? <p className="mt-4 text-sm text-yellow-200">{error}</p> : null}
          </div>

          <div className="text-center">
            <Link
              href={`/store/funnel/thank-you?slug=${encodeURIComponent(slug)}`}
              className="inline-block text-sm text-gray-500 transition hover:text-gray-700"
            >
              {t.rejectLink}
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-8 text-gray-400">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm">
          <p>{t.footerCopyright}</p>
        </div>
      </footer>
    </div>
  )
}
