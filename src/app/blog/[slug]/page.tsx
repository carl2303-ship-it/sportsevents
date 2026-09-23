import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogContent } from '@/components/blog/blog-content'
import { BlogCTA } from '@/components/blog/blog-cta'
import { Breadcrumbs } from '@/components/blog/breadcrumbs'
import {
  absoluteUrl,
  blogPostingJsonLd,
  formatPostDate,
  getAllPublishedSlugs,
  getPostBySlug,
  getRelatedPosts,
  getSiteOrigin,
} from '@/lib/blog'
import { withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const revalidate = 60
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return { title: 'Article not found | SportsEvents.app' }
  }

  const locale = await getLocale()
  const origin = await getSiteOrigin()
  const path = withLocale(`/blog/${post.slug}`, locale)
  const canonical = absoluteUrl(origin, path)
  const title = post.meta_title || `${post.title} | SportsEvents.app`
  const description = post.meta_description || post.excerpt
  const image = post.cover_image
    ? absoluteUrl(origin, post.cover_image)
    : absoluteUrl(origin, '/brand/logo.png')

  return {
    title,
    description,
    authors: [{ name: post.author_name }],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author_name],
      siteName: 'SportsEvents.app',
      images: [
        {
          url: image,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const locale = await getLocale()
  const t = getDictionary(locale).blog
  const origin = await getSiteOrigin()
  const path = withLocale(`/blog/${post.slug}`, locale)
  const url = absoluteUrl(origin, path)
  const related = await getRelatedPosts(post)
  const jsonLd = blogPostingJsonLd({ post, origin, url })

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: withLocale('/', locale) },
              { label: t.title, href: withLocale('/blog', locale) },
              { label: post.title },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10 lg:gap-14 items-start">
            <article className="min-w-0 max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">
                {post.category}
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold leading-tight">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-app-white/50">
                <span>{post.author_name}</span>
                <time dateTime={post.published_at}>
                  {formatPostDate(post.published_at)}
                </time>
              </div>

              {post.cover_image && (
                <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="mt-10">
                <BlogContent html={post.content} />
              </div>

              <div className="mt-12 lg:hidden">
                <BlogCTA
                  locale={locale}
                  eyebrow={t.ctaEyebrow}
                  title={t.ctaTitle}
                  text={t.ctaText}
                  ctaLabel={t.ctaButton}
                />
              </div>
            </article>

            <div className="hidden lg:block">
              <BlogCTA
                locale={locale}
                sticky
                eyebrow={t.ctaEyebrow}
                title={t.ctaTitle}
                text={t.ctaText}
                ctaLabel={t.ctaButton}
              />
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-20 border-t border-white/10 pt-12">
              <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-extrabold">
                {t.relatedTitle}
              </h2>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((item) => (
                  <BlogCard
                    key={item.id}
                    post={item}
                    locale={locale}
                    readMoreLabel={t.readMore}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
