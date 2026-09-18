import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).terms
  return { title: t.metaTitle, description: t.metaDescription }
}

export default async function TermosPage() {
  const locale = await getLocale()
  const t = getDictionary(locale).terms
  const privacyLabel =
    locale === 'en' ? 'Privacy Policy' : 'Política de Privacidade'

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="px-5 md:px-10 py-12 md:py-16">
        <article className="mx-auto max-w-3xl space-y-8 text-sm md:text-base leading-relaxed text-app-white/75">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
              {t.eyebrow}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold text-white">
              {t.title}
            </h1>
            <p className="mt-3 text-xs text-app-white/45">{t.updated}</p>
          </div>

          {t.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-lg font-bold text-white">{section.title}</h2>
              {'paragraphs' in section &&
                section.paragraphs?.map((p) => {
                  if (p.includes('Política de Privacidade') || p.includes('Privacy Policy')) {
                    const parts = p.split(/Política de Privacidade|Privacy Policy/)
                    return (
                      <p key={p.slice(0, 40)}>
                        {parts[0]}
                        <Link
                          href={withLocale('/privacidade', locale)}
                          className="text-cyan hover:underline"
                        >
                          {privacyLabel}
                        </Link>
                        {parts[1] || ''}
                      </p>
                    )
                  }
                  return (
                    <p key={p.slice(0, 40)} className="whitespace-pre-line">
                      {p}
                    </p>
                  )
                })}
              {'bullets' in section && section.bullets ? (
                <ul className="list-disc pl-5 space-y-1">
                  {section.bullets.map((b) => (
                    <li key={b.slice(0, 40)}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
