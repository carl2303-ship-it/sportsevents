'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  getEbookLandingCopy,
  type EbookLandingCopy,
} from '@/lib/boost-store/ebook-landing-copy'
import { withLocale } from '@/i18n/config'
import { useLocale } from '@/i18n/use-locale'

export type { EbookLandingCopy }

/**
 * Ebook lead magnet — SE site chrome + live locale via pathname.
 * Funnel/PDF download flow preserved.
 */
const EBOOK_PDF_URL =
  'https://tprbpeacicadsbmvxcqk.supabase.co/storage/v1/object/public/ebook-materials/Guia_Completo_de_Equipamento_de_Padel_POR.pdf'

function BookIcon() {
  return (
    <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  )
}

function triggerEbookDownload() {
  const link = document.createElement('a')
  link.href = EBOOK_PDF_URL
  link.download = 'Guia-Completo-Equipamento-Padel-SportsEvents.pdf'
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function EbookLandingClient() {
  const locale = useLocale()
  const copy = getEbookLandingCopy(locale)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />

      <main className="ebook-landing-root px-5 md:px-10 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-gold px-4 py-2 text-sm font-bold uppercase tracking-wider text-navy">
                {copy.ebookLabel}
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-tight text-white md:text-5xl">
                {copy.heroTitle}
              </h1>

              <p
                className="text-xl leading-relaxed text-app-white/75 [&_span]:text-cyan [&_span]:font-bold"
                dangerouslySetInnerHTML={{ __html: copy.heroSubtitleHtml }}
              />

              <div className="space-y-4 pt-2">
                {copy.benefits.map((b) => (
                  <div key={b.title} className="flex items-start gap-3">
                    <span className="mt-1 text-cyan" aria-hidden>
                      ✓
                    </span>
                    <p className="flex-1 text-app-white/70">
                      <strong className="text-white">{b.title}</strong> {b.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border-l-4 border-cyan bg-cyan/10 p-4">
                <p className="text-sm text-app-white/75">
                  <span className="font-bold text-gold">{copy.bonusLabel}</span>{' '}
                  {copy.bonusText}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white p-8 text-gray-900 shadow-xl md:p-10">
              {done ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                      className="h-10 w-10 text-emerald-600"
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
                  <h3 className="text-2xl font-black text-navy">
                    {copy.successTitle}
                  </h3>
                  <p className="text-gray-600">{copy.successText}</p>
                  <Link
                    href={storeHref}
                    className="inline-block rounded-xl bg-cyan px-8 py-3 font-bold text-navy transition hover:brightness-110"
                  >
                    {copy.visitStoreButton}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-navy">
                      <BookIcon />
                    </div>
                    <h2 className="mb-2 text-2xl font-black text-navy">
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
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
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
                        name="email"
                        type="email"
                        required
                        placeholder={copy.emailPlaceholder}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
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
                        name="phone"
                        type="tel"
                        placeholder={copy.phonePlaceholder}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/30"
                      />
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="newsletter"
                        id="newsletter"
                        defaultChecked
                        className="mt-0.5 h-5 w-5 rounded border-gray-300 text-cyan focus:ring-cyan"
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
                      className="w-full rounded-xl bg-gold px-4 py-3.5 text-sm font-bold text-navy transition hover:brightness-110 disabled:opacity-60"
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

          <div className="mt-20 text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-app-white/45">
              {copy.trustedBy}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-app-white/55">
              <div className="text-lg font-bold">{copy.players}</div>
              <div>|</div>
              <div className="text-lg font-bold">{copy.premiumProducts}</div>
              <div>|</div>
              <div className="text-lg font-bold">{copy.freeShipping}</div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {copy.icons.map((icon) => (
              <div
                key={icon.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"
              >
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold text-gold">
                  {icon.title}
                </h3>
                <p className="text-sm text-app-white/65">{icon.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
