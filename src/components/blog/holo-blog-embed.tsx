'use client'

import Script from 'next/script'

/** Publish key from TryHolo — do not invent another. */
export const HOLO_BLOG_EMBED_SRC =
  'https://prod-api-holo-ai.fly.dev/public/seo/embed/d0a94a17-d7da-4a6b-a2c2-b33bd5906bf4.js'

/**
 * TryHolo automatic blog embed.
 * Renders the required mount node + loads the vendor script via next/script
 * (equivalent to defer; avoids raw <script> in the App Router tree).
 */
export function HoloBlogEmbed() {
  return (
    <div className="holo-blog-embed min-h-[24rem]">
      <div id="holo-blog" />
      <Script
        id="holo-blog-embed"
        src={HOLO_BLOG_EMBED_SRC}
        strategy="afterInteractive"
      />
    </div>
  )
}
