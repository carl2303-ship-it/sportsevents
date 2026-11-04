'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Suspense,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from 'react'
import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { ConsentPreferencesLink } from '@/components/consent/ConsentPreferencesLink'
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

function StoreNavLink({
  href,
  label,
  cartLabel,
  className = '',
  showLabel = true,
}: {
  href: string
  label: string
  cartLabel: string
  className?: string
  showLabel?: boolean
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 transition-colors hover:text-app-white ${className}`}
      aria-label={`${label} — ${cartLabel}`}
    >
      <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden />
      {showLabel ? <span>{label}</span> : null}
    </Link>
  )
}

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { locale, t } = useDictionary()
  const pathname = usePathname() || '/'
  const [openDestinos, setOpenDestinos] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileDestinosOpen, setMobileDestinosOpen] = useState(false)
  const menuId = useId()

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

  const storeHref = withLocale('/store', locale)
  const campsHref = `${withLocale('/', locale)}#hubs`
  const tournamentsHref = withLocale('/eventos', locale)
  const buildHref = withLocale('/construir', locale)

  // Close menus when the route changes (render-time sync — avoids setState-in-effect lint).
  const [menuRoute, setMenuRoute] = useState(pathname)
  if (pathname !== menuRoute) {
    setMenuRoute(pathname)
    if (mobileOpen) setMobileOpen(false)
    if (openDestinos) setOpenDestinos(false)
    if (mobileDestinosOpen) setMobileDestinosOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  return (
    <header
      className={
        transparent
          ? 'absolute inset-x-0 top-0 z-40 px-5 md:px-10 pt-4 md:pt-5'
          : 'sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur-md px-5 md:px-10 py-3'
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 overflow-x-clip">
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

        <nav
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-app-white/80"
          aria-label="Primary"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDestinos((v) => !v)}
              aria-expanded={openDestinos}
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
          <StoreNavLink
            href={storeHref}
            label={t.nav.store}
            cartLabel={t.nav.cart}
            className="text-app-white/80"
          />
          <Link
            href={withLocale('/blog', locale)}
            className="hover:text-app-white transition-colors"
          >
            {t.nav.blog}
          </Link>
          <Link
            href={buildHref}
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

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <StoreNavLink
            href={storeHref}
            label={t.nav.store}
            cartLabel={t.nav.cart}
            showLabel={false}
            className="lg:hidden rounded-full border border-white/15 bg-black/25 p-2 text-app-white/85 hover:border-cyan/40 hover:text-cyan"
          />
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
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-full border border-white/15 bg-black/25 p-2 text-app-white hover:border-cyan/40 hover:text-cyan transition-colors"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-[visibility] duration-300 ${
          mobileOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label={t.nav.closeMenu}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.openMenu}
          className={`absolute inset-y-0 right-0 flex w-[min(100%,20.5rem)] max-w-full flex-col border-l border-white/10 bg-navy shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <BrandLogo
              variant="full"
              href={withLocale('/', locale)}
              className="h-10 w-auto"
            />
            <button
              type="button"
              className="inline-flex rounded-full border border-white/15 p-2 text-app-white/80 hover:text-cyan"
              aria-label={t.nav.closeMenu}
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-1 text-sm font-medium">
            <MobileAccordion
              label={t.nav.destinations}
              open={mobileDestinosOpen}
              onToggle={() => setMobileDestinosOpen((v) => !v)}
            >
              {destinos.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-app-white/75 hover:bg-white/5 hover:text-app-white"
                >
                  {d.label}
                </Link>
              ))}
            </MobileAccordion>

            <MobileLink
              href={campsHref}
              onNavigate={() => setMobileOpen(false)}
            >
              {t.nav.camps}
            </MobileLink>
            <MobileLink
              href={tournamentsHref}
              onNavigate={() => setMobileOpen(false)}
            >
              {t.nav.tournaments}
            </MobileLink>
            <MobileLink
              href={storeHref}
              onNavigate={() => setMobileOpen(false)}
              icon={<ShoppingBag className="h-4 w-4" aria-hidden />}
            >
              {t.nav.storePro}
            </MobileLink>
            <MobileLink
              href={withLocale('/quem-somos', locale)}
              onNavigate={() => setMobileOpen(false)}
            >
              {t.nav.about}
            </MobileLink>
            <MobileLink
              href={withLocale('/blog', locale)}
              onNavigate={() => setMobileOpen(false)}
            >
              {t.nav.blog}
            </MobileLink>
            <MobileLink
              href={withLocale('/contacto', locale)}
              onNavigate={() => setMobileOpen(false)}
            >
              {t.nav.contact}
            </MobileLink>
          </nav>

          <div className="border-t border-white/10 p-4 space-y-3">
            <Link
              href={buildHref}
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              {t.nav.build}
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center text-xs font-semibold text-app-white/50 hover:text-cyan"
            >
              {t.nav.staff}
            </Link>
          </div>
        </aside>
      </div>
    </header>
  )
}

function MobileAccordion({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-xl">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-app-white/90 hover:bg-white/5"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden pl-2">{children}</div>
      </div>
    </div>
  )
}

function MobileLink({
  href,
  onNavigate,
  children,
  icon,
}: {
  href: string
  onNavigate: () => void
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-lg px-3 py-3 text-app-white/90 hover:bg-white/5 hover:text-app-white"
    >
      {icon}
      {children}
    </Link>
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
            href={withLocale('/store', locale)}
            className="inline-flex items-center gap-1 hover:text-cyan"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            {t.nav.store}
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
          <ConsentPreferencesLink className="hover:text-cyan" />
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
