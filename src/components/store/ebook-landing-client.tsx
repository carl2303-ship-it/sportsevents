'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import { withLocale, type Locale } from '@/i18n/config'

const EBOOK_PDF_URL =
  'https://tprbpeacicadsbmvxcqk.supabase.co/storage/v1/object/public/ebook-materials/Guia_Completo_de_Equipamento_de_Padel_POR.pdf'

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

      const link = document.createElement('a')
      link.href = EBOOK_PDF_URL
      link.download = 'Guia-Completo-Equipamento-Padel.pdf'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDone(true)
    } catch (err) {
      console.error(err)
      setError(copy.errorGeneric)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-block rounded-full bg-gold px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy">
            {copy.ebookLabel}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-tight text-white md:text-5xl">
            {copy.heroTitle}
          </h1>
          <p
            className="text-lg leading-relaxed text-app-white/70 [&_span]:font-bold [&_span]:text-cyan"
            dangerouslySetInnerHTML={{ __html: copy.heroSubtitleHtml }}
          />
          <ul className="space-y-3 pt-2">
            {copy.benefits.map((b) => (
              <li key={b.title} className="flex items-start gap-3 text-sm text-app-white/75">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan text-xs font-bold text-navy">
                  ✓
                </span>
                <span>
                  <strong className="text-white">{b.title}</strong> {b.text}
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl border-l-4 border-cyan bg-cyan/10 px-4 py-3 text-sm text-app-white/75">
            <strong className="text-white">{copy.bonusLabel}</strong> {copy.bonusText}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-cyan/5 p-8 shadow-[0_20px_40px_rgba(6,182,212,0.15)] md:p-10">
          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-3xl text-emerald-400">
                ✓
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-white">
                {copy.successTitle}
              </h2>
              <p className="text-app-white/65">{copy.successText}</p>
              <Link
                href={withLocale('/store', locale)}
                className="inline-flex rounded-xl bg-cyan px-8 py-3 text-sm font-bold text-navy hover:bg-cyan/90"
              >
                {copy.visitStoreButton}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-cyan/60 text-3xl shadow-lg shadow-cyan/30">
                  📖
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-white">
                  {copy.formTitle}
                </h2>
                <p className="mt-1 text-sm text-app-white/55">{copy.formSubtitle}</p>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-app-white/80">
                    {copy.nameLabel}
                  </label>
                  <input
                    name="name"
                    required
                    placeholder={copy.namePlaceholder}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-cyan placeholder:text-app-white/35 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-app-white/80">
                    {copy.emailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={copy.emailPlaceholder}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-cyan placeholder:text-app-white/35 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-app-white/80">
                    {copy.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={copy.phonePlaceholder}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-cyan placeholder:text-app-white/35 focus:ring-2"
                  />
                </div>
                <label className="flex items-start gap-3 text-sm text-app-white/60">
                  <input
                    type="checkbox"
                    name="newsletter"
                    defaultChecked
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 text-cyan"
                  />
                  <span>{copy.newsletterText}</span>
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan to-cyan/80 py-4 text-base font-extrabold uppercase tracking-wide text-navy transition hover:brightness-110 disabled:opacity-50"
                >
                  {busy ? copy.processing : copy.submitButton}
                </button>
                {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
                <p className="text-center text-xs text-app-white/40">{copy.gdprText}</p>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-app-white/40">
          {copy.trustedBy}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-app-white/45">
          <span>{copy.players}</span>
          <span className="text-app-white/20">|</span>
          <span>{copy.premiumProducts}</span>
          <span className="text-app-white/20">|</span>
          <span>{copy.freeShipping}</span>
        </div>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {copy.icons.map((icon) => (
          <div key={icon.title} className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cyan/15 text-xl text-cyan">
              ◆
            </div>
            <h3 className="font-bold text-white">{icon.title}</h3>
            <p className="mt-1 text-sm text-app-white/55">{icon.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
