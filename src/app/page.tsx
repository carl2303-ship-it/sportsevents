'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { BrandLogo } from '@/components/brand-logo'
import { withLocale } from '@/i18n/config'
import { useDictionary } from '@/i18n/use-locale'

const HERO_IMAGE = '/home/hero.jpg'

export default function Home() {
  const { locale, t } = useDictionary()
  const h = t.home

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt={h.heroAlt}
            fill
            priority
            className="object-cover animate-hero-pan"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/55 to-navy" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.22),_transparent_55%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center items-center text-center px-5 md:px-10 pb-14 md:pb-20 pt-28 md:pt-32">
          <BrandLogo
            href={null}
            variant="full"
            priority
            className="h-52 w-auto max-w-[min(96vw,56rem)] sm:h-64 md:h-80 lg:h-[22rem] xl:h-96 mx-auto animate-fade-up drop-shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
          />

          <h1 className="animate-fade-up-delay mt-8 md:mt-10 max-w-4xl font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-app-white">
            {h.heroTitle}
          </h1>

          <p className="animate-fade-up-delay mt-4 max-w-2xl text-base md:text-lg text-app-white/75">
            {h.heroText}
          </p>

          <div className="animate-fade-up-delay-2 mt-8">
            <Link
              id="builder"
              href={withLocale('/construir', locale)}
              className="animate-cta-glow inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              {h.ctaBuild}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative px-5 md:px-10 py-20 md:py-28 bg-gradient-to-b from-navy via-[#071a2e] to-navy">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            {h.formulaEyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight">
            {h.formulaTitle}
          </h2>
          <p className="mt-5 max-w-3xl text-app-white/70 text-base md:text-lg leading-relaxed">
            {h.formulaLead}
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {h.formula.map((item, i) => (
              <div
                key={item.title}
                className="relative pl-5 border-l border-cyan/40 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm md:text-base text-app-white/65 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="hubs" className="relative px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            {h.hubsEyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            {h.hubsTitle}
          </h2>

          <div className="mt-12 space-y-6">
            <DestinationRow
              flag="🇵🇹"
              title={h.hubs.algarve.title}
              text={h.hubs.algarve.text}
              href={withLocale('/destinos/algarve', locale)}
              image="/destinos/algarve-hub.jpg"
              learnMore={t.common.learnMore}
            />
            <DestinationRow
              flag="🇪🇸"
              title={h.hubs.barcelona.title}
              text={h.hubs.barcelona.text}
              href={withLocale('/destinos/barcelona', locale)}
              image="/destinos/barcelona.jpg"
              learnMore={t.common.learnMore}
              reverse
            />
            <DestinationRow
              flag="🇪🇸"
              title={h.hubs.marbella.title}
              text={h.hubs.marbella.text}
              href={withLocale('/destinos/marbella', locale)}
              image="/destinos/marbella.jpg"
              learnMore={t.common.learnMore}
            />
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 px-5 md:px-10 py-20 md:py-28 bg-gradient-to-br from-navy via-[#0c4a6e]/25 to-navy">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            {h.b2bEyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight">
            {h.b2bTitle}
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {h.audiences.map((a) => (
              <div key={a.title}>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gold">
                  {a.title}
                </h3>
                <p className="mt-3 text-sm md:text-base text-app-white/65 leading-relaxed">
                  {a.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              href={withLocale('/construir', locale)}
              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              {h.ctaBuild}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

function DestinationRow({
  flag,
  title,
  text,
  href,
  image,
  learnMore,
  reverse = false,
}: {
  flag: string
  title: string
  text: string
  href: string
  image: string
  learnMore: string
  reverse?: boolean
}) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-none lg:rounded-2xl border border-white/10 ${
        reverse ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div className="relative min-h-[240px] lg:min-h-[320px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/40 to-transparent" />
      </div>
      <div className="flex flex-col justify-center bg-[#071525] p-8 md:p-10">
        <p className="text-sm font-semibold text-cyan">
          {flag} {title}
        </p>
        <p className="mt-4 text-base text-app-white/75 leading-relaxed">{text}</p>
        <Link
          href={href}
          className="mt-6 inline-flex w-fit text-sm font-bold text-gold hover:brightness-110 transition"
        >
          {learnMore}
        </Link>
      </div>
    </div>
  )
}
