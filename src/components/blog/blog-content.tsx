/** Renders trusted CMS HTML (admin-authored posts). */
export function BlogContent({ html }: { html: string }) {
  return (
    <div
      className="blog-prose text-base md:text-lg leading-relaxed text-app-white/75"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
