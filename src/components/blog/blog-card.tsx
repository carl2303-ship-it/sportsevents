import Image from 'next/image'
import Link from 'next/link'
import {
  formatPostDate,
  type BlogPostListItem,
} from '@/lib/blog-shared'
import { withLocale, type Locale } from '@/i18n/config'

type BlogCardProps = {
  post: BlogPostListItem
  locale: Locale
  readMoreLabel?: string
}

export function BlogCard({
  post,
  locale,
  readMoreLabel = 'Read article →',
}: BlogCardProps) {
  const href = withLocale(`/blog/${post.slug}`, locale)
  const dateLabel = formatPostDate(post.published_at)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-cyan/35 hover:bg-white/[0.05]">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-navy">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-navy" />
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-navy/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan backdrop-blur-sm">
          {post.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <time
          dateTime={post.published_at}
          className="font-mono text-[11px] uppercase tracking-wider text-app-white/40"
        >
          {dateLabel}
        </time>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold leading-snug text-app-white group-hover:text-cyan transition-colors">
          <Link href={href}>{post.title}</Link>
        </h2>
        <p className="text-sm leading-relaxed text-app-white/60 line-clamp-3">
          {post.excerpt}
        </p>
        <Link
          href={href}
          className="mt-auto pt-2 text-sm font-semibold text-gold hover:underline"
        >
          {readMoreLabel}
        </Link>
      </div>
    </article>
  )
}
