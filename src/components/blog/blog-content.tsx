import { ensureBlogHtml } from '@/lib/blog-html'

/** Renders CMS HTML; plain text is auto-formatted into article layout. */
export function BlogContent({ html }: { html: string }) {
  const content = ensureBlogHtml(html)
  return (
    <div
      className="blog-prose text-base md:text-lg leading-relaxed text-app-white/75"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
