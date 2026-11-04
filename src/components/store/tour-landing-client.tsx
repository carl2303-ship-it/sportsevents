'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import {
  BOOST_EDGE_ANON_KEY,
  boostEdgeRootUrl,
} from '@/lib/boost-store/config'
import {
  getTourLandingCopy,
  type TourPlanCopy,
} from '@/lib/boost-store/tour-landing-i18n'
import { withLocale } from '@/i18n/config'
import { useDictionary, useLocale } from '@/i18n/use-locale'

type PlanId = TourPlanCopy['id']
type Billing = 'mensal' | 'anual'

const PLAN_PRICES: Record<PlanId, { mensal: string; anual: string }> = {
  bronze: { mensal: '9.90', anual: '8.42' },
  silver: { mensal: '19.90', anual: '16.92' },
  gold: { mensal: '29.90', anual: '25.42' },
  platinum: { mensal: '39.90', anual: '33.92' },
}

const PLAN_ACCENT: Record<PlanId, string> = {
  bronze: 'border-gold/40',
  silver: 'border-white/20',
  gold: 'border-gold',
  platinum: 'border-cyan/50',
}

const FORMAT_STYLES = [
  'border-gold/30',
  'border-gold/30',
  'border-white/20',
  'border-gold/50',
  'border-gold/50',
  'border-cyan/40',
  'border-cyan/40',
  'border-cyan/40',
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Check() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-cyan"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function TourLandingClient() {
  const locale = useLocale()
  const { t: dict } = useDictionary()
  const t = getTourLandingCopy(locale)
  const [billing, setBilling] = useState<Billing>('mensal')
  const [modalPlan, setModalPlan] = useState<PlanId | null>(null)
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [ownerEmail, setOwnerEmail] = useState('')
  const [language, setLanguage] = useState<string | null>(null)
  const [currency, setCurrency] = useState('EUR')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)
  const checkoutLang = language ?? locale

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscription') !== 'success') return
    const slug = params.get('slug')
    const msg = slug
      ? t.successWithSlug.replace('{slug}', slug)
      : t.successGeneric
    // Defer to avoid set-state-in-effect lint on mount sync.
    const id = window.setTimeout(() => {
      setSuccessNotice(msg)
      window.history.replaceState({}, '', `${window.location.pathname}#precos`)
    }, 0)
    const clearId = window.setTimeout(() => setSuccessNotice(null), 10000)
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(clearId)
    }
  }, [t.successGeneric, t.successWithSlug])

  const planLabel = useMemo(() => {
    if (!modalPlan) return ''
    const name = t.plans.find((p) => p.id === modalPlan)?.name || modalPlan
    const tpl = billing === 'anual' ? t.planLabelYearly : t.planLabelMonthly
    return tpl.replace('{name}', name)
  }, [modalPlan, billing, t])

  function openCheckout(plan: PlanId) {
    setModalPlan(plan)
    setError(null)
    setOrgName('')
    setOrgSlug('')
    setSlugManual(false)
    setOwnerEmail('')
    setLanguage(null)
    setCurrency('EUR')
  }

  function closeCheckout() {
    setModalPlan(null)
    setBusy(false)
    setError(null)
  }

  useEffect(() => {
    if (!modalPlan) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [modalPlan])

  async function submitCheckout(e: FormEvent) {
    e.preventDefault()
    if (!modalPlan) return
    const organizationName = orgName.trim()
    const organizationSlug = slugify(orgSlug.trim())
    const email = ownerEmail.trim()
    if (!organizationName || !organizationSlug || !email) {
      setError(t.errRequired)
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(organizationSlug)) {
      setError(t.errSlug)
      return
    }
    setOrgSlug(organizationSlug)
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
          productType: 'saas-tour-subscription',
          planType: modalPlan,
          billingPeriod: billing,
          organizationName,
          organizationSlug,
          ownerEmail: email,
          language: checkoutLang,
          currency,
          successUrl: `${origin}${withLocale('/store/tour', locale)}?subscription=success&slug=${encodeURIComponent(organizationSlug)}`,
          cancelUrl: `${origin}${withLocale('/store/tour', locale)}#precos`,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.error || t.errCheckout)
      }
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errCheckout)
      setBusy(false)
    }
  }

  const storeHref = withLocale('/store', locale)

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />

      {successNotice ? (
        <div className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl">
          {successNotice}
        </div>
      ) : null}

      <main>
        {/* In-page anchors under SE chrome */}
        <nav
          aria-label="Tour sections"
          className="border-b border-white/10 bg-navy/80 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 text-xs font-semibold text-app-white/65 md:px-10">
            <a href="#funcionalidades" className="hover:text-cyan">
              {t.navFeatures}
            </a>
            <a href="#formatos" className="hover:text-cyan">
              {t.navFormats}
            </a>
            <a href="#player-app" className="hover:text-cyan">
              {t.navPlayerApp}
            </a>
            <a href="#precos" className="hover:text-cyan">
              {t.navPricing}
            </a>
            <a href="#faq" className="hover:text-cyan">
              {t.navFaq}
            </a>
            <a
              href="#precos"
              className="ml-auto rounded-full bg-gold px-4 py-1.5 text-navy hover:brightness-110"
            >
              {t.ctaStart}
            </a>
          </div>
        </nav>

        <section className="relative overflow-hidden px-5 py-16 md:px-10 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.18),_transparent_55%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-cyan/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan">
                {t.heroBadge}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {t.heroTitle1}
                <br />
                <span className="text-gold">{t.heroTitle2}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-app-white/70">
                {t.heroLead}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#precos"
                  className="rounded-full bg-gold px-8 py-3.5 text-center text-sm font-bold text-navy hover:brightness-110"
                >
                  {t.ctaPlans}
                </a>
                <a
                  href="#funcionalidades"
                  className="rounded-full border border-white/20 px-8 py-3.5 text-center text-sm font-bold hover:border-cyan/50"
                >
                  {t.ctaFeatures}
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-app-white/60">
                {[t.trustNoCommit, t.trustCancel, t.trustFrom].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <Check />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <Image
                src="/store/tour-hero-padel-one.png"
                alt="PADEL ONE Tour"
                width={640}
                height={480}
                className="h-auto w-full rounded-2xl border border-white/10 shadow-2xl"
                priority
              />
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="border-t border-white/10 px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
              {t.featuresEyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
              {t.featuresTitle}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {t.features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="font-bold text-gold">{f.title}</h3>
                  <p className="mt-2 text-sm text-app-white/65 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="formatos" className="border-t border-white/10 px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              {t.formatsEyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
              {t.formatsTitle}
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.formats.map((f, i) => (
                <div
                  key={f.title}
                  className={`rounded-2xl border bg-white/[0.03] p-5 ${FORMAT_STYLES[i] || 'border-white/15'}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan">
                    {f.tier}
                  </p>
                  <h3 className="mt-2 font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-xs text-app-white/60 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="player-app" className="border-t border-white/10 px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
                {t.playerEyebrow}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
                {t.playerTitle}
              </h2>
              <p className="mt-4 text-app-white/70">{t.playerLead}</p>
              <ul className="mt-6 space-y-3">
                {t.playerBullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-app-white/75">
                    <Check />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto max-w-xs">
              <Image
                src="/store/padel-one-player-app.png"
                alt="PADEL ONE"
                width={360}
                height={720}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <section id="precos" className="border-t border-white/10 px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              {t.pricingEyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
              {t.pricingTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-app-white/65">{t.pricingLead}</p>

            <div className="mt-8 inline-flex rounded-full border border-white/15 bg-black/25 p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setBilling('mensal')}
                className={`rounded-full px-4 py-2 transition ${
                  billing === 'mensal' ? 'bg-cyan text-navy' : 'text-app-white/70'
                }`}
              >
                {t.billingMonthly}
              </button>
              <button
                type="button"
                onClick={() => setBilling('anual')}
                className={`rounded-full px-4 py-2 transition ${
                  billing === 'anual' ? 'bg-cyan text-navy' : 'text-app-white/70'
                }`}
              >
                {t.billingYearly}{' '}
                <span className="text-gold">{t.billingSave}</span>
              </button>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {t.plans.map((plan) => {
                const price =
                  billing === 'anual'
                    ? PLAN_PRICES[plan.id].anual
                    : PLAN_PRICES[plan.id].mensal
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border bg-white/[0.03] p-6 ${PLAN_ACCENT[plan.id]}`}
                  >
                    {plan.popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold uppercase text-navy">
                        {t.popular}
                      </span>
                    ) : null}
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="mt-3 text-3xl font-black text-gold">
                      {price}€
                      <span className="text-sm font-semibold text-app-white/50">
                        {t.perMonth}
                      </span>
                    </p>
                    {billing === 'anual' ? (
                      <p className="mt-1 text-xs text-app-white/45">
                        {plan.noteAnual}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm font-semibold text-cyan">
                      {plan.limit}
                    </p>
                    <ul className="mt-4 flex-1 space-y-2 text-sm text-app-white/65">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => openCheckout(plan.id)}
                      className="mt-6 w-full rounded-full bg-gold py-2.5 text-sm font-bold text-navy hover:brightness-110"
                    >
                      {t.choosePlan}
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="mt-6 text-center text-xs text-app-white/45">
              {t.pricingNote}
            </p>
          </div>
        </section>

        <section id="faq" className="border-t border-white/10 px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
              {t.faqEyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold">
              {t.faqTitle}
            </h2>
            <div className="mt-8 space-y-4">
              {t.faq.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <summary className="cursor-pointer list-none font-semibold text-white marker:content-none">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-app-white/65">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-gradient-to-br from-navy via-[#0c4a6e]/40 to-navy px-5 py-16 text-center md:px-10 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
              {t.ctaTitle1}
              <br />
              {t.ctaTitle2}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-app-white/70">{t.ctaLead}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:info@sportsevents.app?subject=PADEL ONE Tour"
                className="rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-navy hover:brightness-110"
              >
                info@sportsevents.app
              </a>
              <a
                href="https://wa.me/351969365059"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold hover:border-cyan/50"
              >
                WhatsApp
              </a>
            </div>
            <p className="mt-6 text-sm text-app-white/45">{t.ctaReply}</p>
            <Link
              href={storeHref}
              className="mt-4 inline-block text-sm text-cyan hover:underline"
            >
              ← {dict.nav.store}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />

      {modalPlan ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label={t.close}
            onClick={closeCheckout}
          />
          <div className="relative flex min-h-full items-center justify-center p-4">
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-navy shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="border-b border-white/10 bg-gradient-to-r from-cyan/20 to-gold/10 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan">
                      {t.modalSub}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-white">
                      {t.modalTitle}
                    </h3>
                    <p className="mt-1 text-sm text-app-white/70">{planLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="rounded-lg p-1.5 text-app-white/70 hover:bg-white/10"
                    aria-label={t.close}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <form onSubmit={submitCheckout} className="space-y-4 p-6">
                <p className="text-sm text-app-white/65">{t.modalLead}</p>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-app-white/80">
                    {t.orgName}
                  </label>
                  <input
                    required
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value)
                      if (!slugManual) setOrgSlug(slugify(e.target.value))
                    }}
                    placeholder={t.orgNamePh}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-app-white/80">
                    {t.orgSlug}
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 focus-within:border-cyan/50">
                    <span className="flex items-center whitespace-nowrap border-r border-white/10 bg-black/40 px-3 text-xs text-app-white/45">
                      tour.padel1.app/
                    </span>
                    <input
                      required
                      value={orgSlug}
                      onChange={(e) => {
                        setSlugManual(e.target.value.trim().length > 0)
                        setOrgSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        )
                      }}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      placeholder="madrid-padel"
                      className="flex-1 border-0 bg-black/30 px-3 py-3 font-mono text-sm text-white focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-app-white/45">{t.orgSlugHint}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-app-white/80">
                    {t.ownerEmail}
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan/50 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-app-white/45">
                    {t.ownerEmailHint}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-app-white/80">
                      {t.language}
                    </label>
                    <select
                      value={checkoutLang}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white"
                    >
                      <option value="pt">Português</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-app-white/80">
                      {t.currency}
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr.)</option>
                    </select>
                  </div>
                </div>
                {error ? (
                  <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="flex-1 rounded-full border border-white/20 px-4 py-3 text-sm font-bold"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-full bg-gold px-4 py-3 text-sm font-bold text-navy disabled:opacity-60"
                  >
                    {busy ? t.redirecting : t.continuePay}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
