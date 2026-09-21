import Link from 'next/link'
import { withLocale, type Locale } from '@/i18n/config'

type BlogCTAProps = {
  locale: Locale
  eyebrow?: string
  title?: string
  text?: string
  ctaLabel?: string
  sticky?: boolean
  className?: string
}

export function BlogCTA({
  locale,
  eyebrow = 'For clubs & coaches',
  title = 'Want a customised padel stage for your club?',
  text = 'Tell us your dates, group size and level. We reply with a free proposal covering coaching, hotels and transfers.',
  ctaLabel = 'Request a Free Proposal',
  sticky = false,
  className = '',
}: BlogCTAProps) {
  return (
    <aside
      className={[
        'rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 via-[#0b1a2e] to-navy p-5 md:p-6 shadow-lg',
        sticky ? 'lg:sticky lg:top-28' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg md:text-xl font-extrabold leading-snug text-app-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-app-white/70">{text}</p>
      <Link
        href={withLocale('/construir', locale)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-amber-300 animate-cta-glow"
      >
        {ctaLabel}
      </Link>
      <Link
        href={withLocale('/contacto', locale)}
        className="mt-3 block text-center text-xs font-semibold text-cyan hover:underline"
      >
        Or contact the team →
      </Link>
    </aside>
  )
}
