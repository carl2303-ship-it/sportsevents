'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  switchLocalePath,
  withLocale,
  type Locale,
} from '@/i18n/config'

/**
 * Visual SoT: boostpadel `ebook-landing.html` + `ebook-landing.js`.
 * Do NOT apply se-theme.css (navy remapping) — that was the half-measure.
 */
const EBOOK_PDF_URL =
  'https://tprbpeacicadsbmvxcqk.supabase.co/storage/v1/object/public/ebook-materials/Guia_Completo_de_Equipamento_de_Padel_POR.pdf'

const LANGS: Locale[] = ['en', 'pt', 'es', 'fr', 'de']
const LANG_LABEL: Record<Locale, string> = {
  en: 'EN',
  pt: 'PT',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}

export type EbookLandingCopy = {
  ebookLabel: string
  heroTitle: string
  heroSubtitleHtml: string
  benefits: { title: string; text: string }[]
  bonusLabel: string
  bonusText: string
  formTitle: string
  formSubtitle: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  phoneLabel: string
  phonePlaceholder: string
  newsletterText: string
  submitButton: string
  processing: string
  gdprText: string
  successTitle: string
  successText: string
  visitStoreButton: string
  trustedBy: string
  players: string
  premiumProducts: string
  freeShipping: string
  icons: { title: string; text: string }[]
  errorGeneric: string
  footerCopyright: string
  storeNav: string
}

function BookIcon() {
  return (
    <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  )
}

function LocaleStrip({ locale }: { locale: Locale }) {
  return (
    <div className="ebook-lang flex items-center gap-0.5" aria-label="Language">
      {LANGS.map((l) => (
        <Link
          key={l}
          href={switchLocalePath('/store/ebook-landing', '', l)}
          hrefLang={l}
          aria-current={l === locale ? 'true' : undefined}
        >
          {LANG_LABEL[l]}
        </Link>
      ))}
    </div>
  )
}

function triggerEbookDownload() {
  const link = document.createElement('a')
  link.href = EBOOK_PDF_URL
  link.download = 'Guia-Completo-Equipamento-Padel-BOOSTPADEL.pdf'
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function EbookLandingClient({
  locale,
  copy,
}: {
  locale: Locale
  copy: EbookLandingCopy
}) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Override SE navy body while this Boost landing is mounted.
  useEffect(() => {
    const { body } = document
    const prevBg = body.style.background
    const prevColor = body.style.color
    const prevFamily = body.style.fontFamily
    body.style.background = 'linear-gradient(135deg, #f7f7f7 0%, #e8f4ff 100%)'
    body.style.color = '#111111'
    body.style.fontFamily =
      "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
    return () => {
      body.style.background = prevBg
      body.style.color = prevColor
      body.style.fontFamily = prevFamily
    }
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const email = String(fd.get('email') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const newsletterOptIn = fd.get('newsletter') === 'on'

    try {
      const supabase = getBoostStoreBrowserClient()
      const { data: existingLead } = await supabase
        .from('ebook_leads')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (existingLead) {
        await supabase
          .from('ebook_leads')
          .update({
            download_count: (existingLead.download_count || 0) + 1,
            last_download: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingLead.id)
      } else {
        const { error: insertError } = await supabase
          .from('ebook_leads')
          .insert([
            {
              name,
              email,
              phone: phone || null,
              newsletter_opt_in: newsletterOptIn,
              download_count: 1,
              last_download: new Date().toISOString(),
              source: 'ebook-landing',
            },
          ])
        if (insertError) throw insertError

        if (newsletterOptIn) {
          await supabase.from('newsletter_subscribers').upsert(
            [{ email, active: true }],
            { onConflict: 'email', ignoreDuplicates: true }
          )
        }
      }

      triggerEbookDownload()
      setDone(true)
    } catch (err) {
      console.error(err)
      setError(copy.errorGeneric)
      setBusy(false)
    }
  }

  const storeHref = withLocale('/store', locale)
  const homeHref = withLocale('/', locale)

  return (
    <div className="ebook-landing-root">
      <header className="bg-boost-dark py-4 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={homeHref} className="flex items-center">
            <Image
              src="/brand/logo.png"
              alt="SportsEvents"
              width={200}
              height={80}
              className="h-16 w-auto md:h-20"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <LocaleStrip locale={locale} />
            <Link
              href={storeHref}
              className="font-bold text-white transition duration-200 hover:text-[#007BFF]"
            >
              {copy.storeNav}
            </Link>
          </div>
        </nav>
      </header>

      <main className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: copy — matches Boost ebook-landing.html */}
            <div className="space-y-6">
              <div className="bg-boost-orange inline-block rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
                {copy.ebookLabel}
              </div>

              <h1 className="text-boost-dark text-4xl font-black leading-tight md:text-5xl">
                {copy.heroTitle}
              </h1>

              <p
                className="text-xl leading-relaxed text-gray-700 [&_span]:boost-blue [&_span]:font-bold"
                dangerouslySetInnerHTML={{ __html: copy.heroSubtitleHtml }}
              />

              <div className="space-y-4 pt-4">
                {copy.benefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <span className="check-icon" aria-hidden />
                    <p className="flex-1 text-gray-700">
                      <strong>{b.title}</strong> {b.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border-l-4 border-[#007BFF] bg-blue-50 p-4">
                <p className="text-sm text-gray-700">
                  <span className="text-boost-dark font-bold">{copy.bonusLabel}</span>{' '}
                  {copy.bonusText}
                </p>
              </div>
            </div>

            {/* Right: form card */}
            <div className="hero-pattern shadow-boost rounded-3xl p-8 md:p-10">
              {done ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-10 w-10 text-green-600"
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
                  </div>
                  <h3 className="text-boost-dark text-2xl font-black">
                    {copy.successTitle}
                  </h3>
                  <p className="text-gray-600">{copy.successText}</p>
                  <Link
                    href={storeHref}
                    className="bg-boost-blue inline-block rounded-xl px-8 py-3 font-bold text-white transition duration-200 hover:bg-blue-700"
                  >
                    {copy.visitStoreButton}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <div className="gradient-bg pulse-animation mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                      <BookIcon />
                    </div>
                    <h2 className="text-boost-dark mb-2 text-2xl font-black">
                      {copy.formTitle}
                    </h2>
                    <p className="text-gray-600">{copy.formSubtitle}</p>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-5" id="ebook-form">
                    <div>
                      <label
                        htmlFor="ebook-name"
                        className="mb-2 block text-sm font-bold text-gray-700"
                      >
                        {copy.nameLabel}
                      </label>
                      <input
                        id="ebook-name"
                        name="name"
                        required
                        placeholder={copy.namePlaceholder}
                        className="ebook-input"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ebook-email"
                        className="mb-2 block text-sm font-bold text-gray-700"
                      >
                        {copy.emailLabel}
                      </label>
                      <input
                        id="ebook-email"
                        type="email"
                        name="email"
                        required
                        placeholder={copy.emailPlaceholder}
                        className="ebook-input"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ebook-phone"
                        className="mb-2 block text-sm font-bold text-gray-700"
                      >
                        {copy.phoneLabel}
                      </label>
                      <input
                        id="ebook-phone"
                        type="tel"
                        name="phone"
                        placeholder={copy.phonePlaceholder}
                        className="ebook-input"
                        autoComplete="tel"
                      />
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="newsletter"
                        id="newsletter"
                        defaultChecked
                        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#007BFF] focus:ring-[#007BFF]"
                      />
                      <label
                        htmlFor="newsletter"
                        className="ml-3 text-sm text-gray-600"
                      >
                        {copy.newsletterText}
                      </label>
                    </div>
                    <button
                      type="submit"
                      id="submit-btn"
                      disabled={busy}
                      className="ebook-submit gradient-bg"
                    >
                      {busy ? copy.processing : copy.submitButton}
                    </button>
                    {error ? (
                      <p className="text-center text-sm text-red-600">{error}</p>
                    ) : null}
                    <p className="text-center text-xs text-gray-500">
                      {copy.gdprText}
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-20 text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
              {copy.trustedBy}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
              <div className="text-lg font-bold text-gray-400">{copy.players}</div>
              <div className="text-gray-400">|</div>
              <div className="text-lg font-bold text-gray-400">
                {copy.premiumProducts}
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-lg font-bold text-gray-400">
                {copy.freeShipping}
              </div>
            </div>
          </div>

          {/* Icon benefits */}
          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            {copy.icons.map((icon, i) => (
              <div key={icon.title} className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#007BFF]">
                  {i === 0 ? (
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  ) : i === 1 ? (
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-boost-dark mb-2 text-lg font-bold">
                  {icon.title}
                </h3>
                <p className="text-sm text-gray-600">{icon.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-boost-dark mt-20 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Image
            src="/brand/logo.png"
            alt="SportsEvents"
            width={140}
            height={48}
            className="mx-auto mb-4 h-12 w-auto"
          />
          <p className="text-sm text-gray-400">{copy.footerCopyright}</p>
        </div>
      </footer>
    </div>
  )
}
