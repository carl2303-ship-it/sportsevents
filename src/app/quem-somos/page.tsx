import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).about
  return { title: t.metaTitle, description: t.metaDescription }
}

export default async function QuemSomosPage() {
  const locale = await getLocale()
  const t = getDictionary(locale).about

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[60svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2000&q=80"
            alt="SportsEvents team"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            {t.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            {t.heroText}
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-extrabold">
            {t.genesisTitle}
          </h2>
          <div className="mt-6 space-y-5 text-app-white/70 text-base md:text-lg leading-relaxed">
            <p>{t.genesisP1}</p>
            <p>{t.genesisP2}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#071525] px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-extrabold">
            {t.leadershipTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-app-white/65">{t.leadershipLead}</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="border-l border-cyan/40 pl-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-cyan">
                {t.opsTitle}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                {t.opsRegion}
              </p>
              <p className="mt-4 text-sm md:text-base text-app-white/65 leading-relaxed">
                {t.opsText}
              </p>
            </div>
            <div className="border-l border-gold/40 pl-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gold">
                {t.growthTitle}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan">
                {t.growthRegion}
              </p>
              <p className="mt-4 text-sm md:text-base text-app-white/65 leading-relaxed">
                {t.growthText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-extrabold">
            {t.promiseTitle}
          </h2>
          <p className="mt-6 text-app-white/70 text-base md:text-lg leading-relaxed">
            {t.promiseText}
          </p>
          <Link
            href={withLocale('/construir', locale)}
            className="mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
          >
            {t.cta}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
