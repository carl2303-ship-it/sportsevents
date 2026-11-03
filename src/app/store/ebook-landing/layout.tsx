import type { ReactNode } from 'react'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-900.css'
import './ebook-landing.css'

/**
 * Isolates Boost ebook-landing from SE navy Site chrome / globals.css.
 * Visual SoT: boostpadel ebook-landing.html (+ inline CSS), NOT se-theme.css.
 */
export default function EbookLandingLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
