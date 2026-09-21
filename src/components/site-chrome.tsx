'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import {
  switchLocalePath,
  withLocale,
  type Locale,
} from '@/i18n/config'
import { useDictionary } from '@/i18n/use-locale'

const activeLanguages: Locale[] = ['en', 'pt', 'es', 'fr', 'de']
const languageLabels: Record<Locale, string> = {
  en: 'EN',
  pt: 'PT',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}

function LocaleSwitcher() {
  const pathname = usePathname() || '/'
  const searchParams = useSearchParams()
  const { locale } = useDictionary()
  const search = searchParams?.toString()
    ? `?${searchParams.toString()}`
    : ''

  return (
    <div className="flex rounded-full border border-white/15 bg-black/25 p-0.5 text-[11px] font-semibold tracking-wide">
      {activeLanguages.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, search, l)}
          hrefLang={l}
          className={`px-2 py-1 rounded-full transition-colors ${
            locale === l
              ? 'bg-cyan text-navy'
              : 'text-app-white/70 hover:text-app-white'
          }`}
        >
          {languageLabels[l]}
        </Link>
      ))}
    </div>
  )
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { locale, t } = useDictionary()
  const [openDestinos, setOpenDestinos] = useState(false)

  const destinos = [
    { href: withLocale('/destinos/algarve', locale), label: t.nav.algarve },
    {
      href: withLocale('/destinos/barcelona', locale),
      label: t.nav.barcelona,
    },
    {
      href: withLocale('/destinos/marbella', locale),
      label: t.nav.marbella,
    },
  ]

  return (
    <header
      className={
        transparent
          ? 'absolute inset-x-0 top-0 z-30 px-5 md:px-10 pt-4 md:pt-5'
          : 'sticky top-0 z-30 border-b border-white/10 bg-navy/95 backdrop-blur-md px-5 md:px-10 py-3'
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <BrandLogo
          variant="full"
          priority
          href={withLocale('/', locale)}
          className={
            transparent
              ? 'h-16 w-auto sm:h-20 md:h-24 lg:h-28 drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)]'
              : 'h-12 w-auto sm:h-14 md:h-16'
          }
        />

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-app-white/80">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDestinos((v) => !v)}
              className="inline-flex items-center gap-1 hover:text-app-white transition-colors"
            >
              {t.nav.destinations} <ChevronDown className="w-4 h-4" />
            </button>
            {openDestinos && (
              <div className="absolute top-full left-0 mt-3 min-w-[240px] rounded-xl border border-white/10 bg-navy/95 backdrop-blur-md p-2 shadow-xl">
                {destinos.map((d) => (
                  <Link
                    key={d.href}
                    href={d.href}
                    onClick={() => setOpenDestinos(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  >
                    {d.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href={withLocale('/quem-somos', locale)}
            className="hover:text-app-white transition-colors"
          >
            {t.nav.about}
          </Link>
          <Link
            href={withLocale('/eventos', locale)}
            className="hover:text-app-white transition-colors"
          >
            {t.nav.events}
          </Link>
          <Link
            href={withLocale('/blog', locale)}
            className="hover:text-app-white transition-colors"
          >
            {t.nav.blog}
          </Link>
          <Link
            href={withLocale('/construir', locale)}
            className="hover:text-app-white transition-colors"
          >
            {t.nav.build}
          </Link>
          <Link
            href={withLocale('/contacto', locale)}
            className="hover:text-app-white transition-colors"
          >
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Suspense
            fallback={
              <div className="h-7 w-16 rounded-full border border-white/15 bg-black/25" />
            }
          >
            <LocaleSwitcher />
          </Suspense>
          <Link
            href="/admin"
            className="hidden sm:inline-flex text-xs font-semibold text-app-white/60 hover:text-cyan transition-colors"
          >
            {t.nav.staff}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const { locale, t } = useDictionary()

  return (
    <footer className="border-t border-white/10 px-5 md:px-10 py-12 text-xs text-app-white/45 bg-navy">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <BrandLogo
            variant="full"
            href={withLocale('/', locale)}
            className="h-16 w-auto sm:h-20 md:h-24 drop-shadow-md"
          />
          <p className="text-sm text-app-white/55 max-w-xs">{t.footer.blurb}</p>
          <Link
            href={withLocale('/contacto', locale)}
            className="inline-flex text-sm font-semibold text-cyan hover:underline"
          >
            {t.footer.contactForm}
          </Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-[10px] uppercase tracking-wider text-app-white/40 font-bold">
            {t.footer.contacts}
          </p>
          <p>
            <a
              href="mailto:info@sportsevents.app"
              className="text-app-white/75 hover:text-cyan"
            >
              info@sportsevents.app
            </a>
          </p>
          <p className="text-app-white/75">
            POR{' '}
            <a href="tel:+351969365059" className="hover:text-cyan">
              +351 969 365 059
            </a>
          </p>
          <p className="text-app-white/75">
            ESP{' '}
            <a href="tel:+34631699818" className="hover:text-cyan">
              +34 631 699 818
            </a>
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-app-white/40 font-bold">
              {t.footer.addressAlgarve}
            </p>
            <p className="mt-1 text-app-white/75 leading-relaxed">
              Rua Leonardo Coimbra 1
              <br />
              8200-112 Albufeira
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-app-white/40 font-bold">
              {t.footer.addressBarcelona}
            </p>
            <p className="mt-1 text-app-white/75 leading-relaxed">
              Calle Mallorca 535B
              <br />
              08026 Barcelona
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-between text-[11px] text-app-white/40">
        <div className="flex flex-wrap gap-4">
          <Link
            href={withLocale('/destinos/algarve', locale)}
            className="hover:text-cyan"
          >
            Algarve
          </Link>
          <Link
            href={withLocale('/destinos/barcelona', locale)}
            className="hover:text-cyan"
          >
            Barcelona
          </Link>
          <Link
            href={withLocale('/destinos/marbella', locale)}
            className="hover:text-cyan"
          >
            Marbella
          </Link>
          <Link
            href={withLocale('/quem-somos', locale)}
            className="hover:text-cyan"
          >
            {t.nav.about}
          </Link>
          <Link
            href={withLocale('/blog', locale)}
            className="hover:text-cyan"
          >
            {t.nav.blog}
          </Link>
          <Link
            href={withLocale('/construir', locale)}
            className="hover:text-cyan"
          >
            {t.nav.build}
          </Link>
          <Link
            href={withLocale('/contacto', locale)}
            className="hover:text-cyan"
          >
            {t.nav.contact}
          </Link>
          <Link
            href={withLocale('/privacidade', locale)}
            className="hover:text-cyan"
          >
            {t.footer.privacy}
          </Link>
          <Link
            href={withLocale('/termos', locale)}
            className="hover:text-cyan"
          >
            {t.footer.terms}
          </Link>
        </div>
        <span>© SportsEvents.app</span>
      </div>
    </footer>
  )
}
