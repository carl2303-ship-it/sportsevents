'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

const languages = ['PT', 'ES', 'FR', 'EN', 'DE'] as const

const destinos = [
  { href: '/destinos/algarve', label: '🇵🇹 Algarve (Portugal)' },
  { href: '/destinos/barcelona', label: '🇪🇸 Barcelona (Espanha)' },
  { href: '/destinos/marbella', label: '🇪🇸 Marbella (Espanha)' },
]

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [lang, setLang] = useState<(typeof languages)[number]>('PT')
  const [openDestinos, setOpenDestinos] = useState(false)

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
              Destinos <ChevronDown className="w-4 h-4" />
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
          <Link href="/quem-somos" className="hover:text-app-white transition-colors">
            Quem Somos
          </Link>
          <Link href="/eventos" className="hover:text-app-white transition-colors">
            Eventos
          </Link>
          <Link href="/#builder" className="hover:text-app-white transition-colors">
            Orçamento
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex rounded-full border border-white/15 bg-black/25 p-0.5 text-[11px] font-semibold tracking-wide">
            {languages.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-full transition-colors ${
                  lang === l
                    ? 'bg-cyan text-navy'
                    : 'text-app-white/70 hover:text-app-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link
            href="/admin"
            className="hidden sm:inline-flex text-xs font-semibold text-app-white/60 hover:text-cyan transition-colors"
          >
            Staff
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 md:px-10 py-12 text-xs text-app-white/45 bg-navy">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row flex-wrap items-center justify-between gap-6">
        <BrandLogo
          variant="full"
          className="h-16 w-auto sm:h-20 md:h-24 drop-shadow-md"
        />
        <div className="flex flex-col sm:items-end gap-2 text-center sm:text-right">
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm text-app-white/60">
            <Link href="/destinos/algarve" className="hover:text-cyan">
              Algarve
            </Link>
            <Link href="/destinos/barcelona" className="hover:text-cyan">
              Barcelona
            </Link>
            <Link href="/destinos/marbella" className="hover:text-cyan">
              Marbella
            </Link>
            <Link href="/quem-somos" className="hover:text-cyan">
              Quem Somos
            </Link>
            <Link href="/eventos" className="hover:text-cyan">
              Eventos
            </Link>
          </div>
          <span className="text-sm">
            Portugal (Algarve) · España (Barcelona · Marbella)
          </span>
        </div>
      </div>
    </footer>
  )
}
