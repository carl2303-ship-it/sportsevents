import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogCTA } from '@/components/blog/blog-cta'
import { BlogFilters } from '@/components/blog/blog-filters'
import { Breadcrumbs } from '@/components/blog/breadcrumbs'
import {
  getSiteOrigin,
  isBlogCategory,
  listPublishedPosts,
} from '@/lib/blog'
import { withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const revalidate = 60

type PageProps = {
  searchParams: Promise<{ category?: string; q?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).blog
  const origin = await getSiteOrigin()
  const canonical = `${origin}${withLocale('/blog', locale)}`

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

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const locale = await getLocale()
  const t = getDictionary(locale).blog
  const params = await searchParams
  const category = isBlogCategory(params.category) ? params.category : null
  const q = params.q?.trim() || ''

  const posts = await listPublishedPosts({ category, q: q || null })

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: withLocale('/', locale) },
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
          </header>

          <div className="mt-10">
            <BlogFilters
              category={category}
              q={q}
              allLabel={t.allCategories}
              searchPlaceholder={t.searchPlaceholder}
              searchLabel={t.searchLabel}
            />
          </div>

          {posts.length === 0 ? (
            <p className="mt-16 text-app-white/55">{t.empty}</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  locale={locale}
                  readMoreLabel={t.readMore}
                />
              ))}
            </div>
          )}

          <div className="mt-16 max-w-xl">
            <BlogCTA
              locale={locale}
              eyebrow={t.ctaEyebrow}
              title={t.ctaTitle}
              text={t.ctaText}
              ctaLabel={t.ctaButton}
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
