import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { HubPackagesSection } from '@/components/hub-packages'
import { fetchPublishedPackagesForHub } from '@/lib/hub-packages.server'
import { withLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getDictionary(locale).destBarcelona
  return { title: t.metaTitle, description: t.metaDescription }
}

export default async function BarcelonaPage() {
  const locale = await getLocale()
  const t = getDictionary(locale)
  const d = t.destBarcelona
  const packages = await fetchPublishedPackagesForHub('barcelona', locale)

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[70svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/destinos/barcelona.jpg"
            alt={d.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            {d.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            {d.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            {d.heroText}
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              {d.experienceEyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
              {d.experienceTitle}
            </h2>
          </div>
          <p className="text-app-white/70 text-base md:text-lg leading-relaxed">
            {d.experienceText}
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 md:px-10 py-16 md:py-24 bg-[#071525]">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
            {d.uniqueTitle}
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {d.highlights.map((h) => (
              <div key={h.title} className="border-t border-cyan/30 pt-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-cyan">
                  {h.title}
                </h3>
                <p className="mt-3 text-sm text-app-white/65 leading-relaxed">
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HubPackagesSection
        hubId="barcelona"
        packages={packages}
        locale={locale}
        otherLinks={[
          {
            href: withLocale('/destinos/marbella', locale),
            label: t.common.exploreMarbella,
          },
          {
            href: withLocale('/destinos/algarve', locale),
            label: t.common.exploreAlgarve,
          },
        ]}
      />

      <SiteFooter />
    </div>
  )
}
