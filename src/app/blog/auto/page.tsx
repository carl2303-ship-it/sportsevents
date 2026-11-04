import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { Breadcrumbs } from '@/components/blog/breadcrumbs'
import { HoloBlogEmbed } from '@/components/blog/holo-blog-embed'
import { getSiteOrigin } from '@/lib/blog'
import { withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).blogAuto
  const origin = await getSiteOrigin()
  const canonical = `${origin}${withLocale('/blog/auto', locale)}`

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: canonical,
      type: 'website',
      siteName: 'SportsEvents.app',
    },
  }
}

export default async function BlogAutoPage() {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const t = dict.blogAuto
  const manualHref = withLocale('/blog', locale)

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: withLocale('/', locale) },
              { label: dict.blog.title, href: manualHref },
              { label: t.title },
            ]}
          />

          <header className="mt-6 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
              {t.eyebrow}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold">
              {t.title}
            </h1>
            <p className="mt-4 text-base md:text-lg text-app-white/65">
              {t.lead}
            </p>
            <p className="mt-4 text-sm text-app-white/50">
              <Link
                href={manualHref}
                className="font-semibold text-cyan hover:underline"
              >
                {t.manualBlogLink}
              </Link>
            </p>
          </header>

          <div className="mt-10">
            <HoloBlogEmbed />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
