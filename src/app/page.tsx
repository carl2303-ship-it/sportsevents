'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'

type HubId = 'algarve' | 'barcelona' | 'marbella'
type Country = 'portugal' | 'spain'

const hubs = [
  {
    id: 'algarve' as HubId,
    country: 'portugal' as Country,
    flag: '🇵🇹',
    label: 'Hub Algarve',
    region: 'Portugal',
    focus: 'Padel & Beach Camps',
    blurb:
      'Sol, resorts à beira-mar e hospitality de topo para camps de padel e estágios de primavera/outono.',
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'barcelona' as HubId,
    country: 'spain' as Country,
    flag: '🇪🇸',
    label: 'Hub Barcelona',
    region: 'España',
    focus: 'Padel & Football Stages',
    blurb:
      'Capital cosmopolita do desporto europeu — centros urbanos de alto rendimento e dinamismo de grande cidade.',
    image:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'marbella' as HubId,
    country: 'spain' as Country,
    flag: '🇪🇸',
    label: 'Hub Marbella / Málaga',
    region: 'Costa del Sol',
    focus: 'VIP Padel & Winter Football',
    blurb:
      'Luxo da Costa del Sol, clubes VIP de padel e infraestruturas de topo para Winter Football Camps.',
    image:
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80',
  },
]

const languages = ['PT', 'ES', 'FR', 'EN', 'DE'] as const

export default function Home() {
  const [country, setCountry] = useState<Country>('portugal')
  const [lang, setLang] = useState<(typeof languages)[number]>('PT')
  const [openDestinos, setOpenDestinos] = useState(false)
  const [openModalidades, setOpenModalidades] = useState(false)

  const activeHub =
    hubs.find((h) =>
      country === 'portugal' ? h.id === 'algarve' : h.id === 'barcelona'
    ) ?? hubs[0]

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <header className="absolute inset-x-0 top-0 z-30 px-5 md:px-10 pt-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl md:text-2xl font-extrabold tracking-tight">
            SportsEvents<span className="text-cyan">.app</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-app-white/80">
            <div className="relative">
              <button
                onClick={() => {
                  setOpenDestinos((v) => !v)
                  setOpenModalidades(false)
                }}
                className="inline-flex items-center gap-1 hover:text-app-white transition-colors"
              >
                Destinos <ChevronDown className="w-4 h-4" />
              </button>
              {openDestinos && (
                <div className="absolute top-full left-0 mt-3 min-w-[220px] rounded-xl border border-white/10 bg-navy/95 backdrop-blur-md p-2 shadow-xl">
                  {hubs.map((hub) => (
                    <button
                      key={hub.id}
                      onClick={() => {
                        setCountry(hub.country)
                        setOpenDestinos(false)
                        document
                          .getElementById('hubs')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                    >
                      {hub.flag} {hub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setOpenModalidades((v) => !v)
                  setOpenDestinos(false)
                }}
                className="inline-flex items-center gap-1 hover:text-app-white transition-colors"
              >
                Modalidades <ChevronDown className="w-4 h-4" />
              </button>
              {openModalidades && (
                <div className="absolute top-full left-0 mt-3 min-w-[180px] rounded-xl border border-white/10 bg-navy/95 backdrop-blur-md p-2 shadow-xl">
                  {['Padel', 'Football', 'Beach Camps', 'VIP Stages'].map(
                    (m) => (
                      <div
                        key={m}
                        className="rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                      >
                        {m}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <a href="#builder" className="hover:text-app-white transition-colors">
              Orçamento
            </a>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex rounded-full border border-white/15 bg-black/25 p-0.5 text-[11px] font-semibold tracking-wide">
              {languages.map((l) => (
                <button
                  key={l}
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

      {/* HERO — first viewport: brand, headline, support, CTA, dominant image */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={activeHub.image}
            alt={activeHub.label}
            fill
            priority
            className="object-cover animate-hero-pan"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/55 to-navy" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.22),_transparent_55%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 md:px-10 pb-16 md:pb-20 pt-28">
          <p className="animate-fade-up font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.95]">
            SportsEvents<span className="text-cyan">.app</span>
          </p>

          <h1 className="animate-fade-up-delay mt-5 max-w-3xl font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-app-white">
            One App. Two Countries. Infinite Sports Experiences.
          </h1>

          <p className="animate-fade-up-delay mt-4 max-w-xl text-base md:text-lg text-app-white/75">
            A plataforma ibérica de estágios, camps e eventos — Algarve, Barcelona
            e Costa del Sol numa só experiência tech.
          </p>

          <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-sm">
              <button
                onClick={() => setCountry('portugal')}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  country === 'portugal'
                    ? 'bg-cyan text-navy'
                    : 'text-app-white/75 hover:text-app-white'
                }`}
              >
                🇵🇹 Portugal (Algarve)
              </button>
              <button
                onClick={() => setCountry('spain')}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  country === 'spain'
                    ? 'bg-cyan text-navy'
                    : 'text-app-white/75 hover:text-app-white'
                }`}
              >
                🇪🇸 España (Barcelona / Marbella)
              </button>
            </div>

            <a
              id="builder"
              href="#hubs"
              className="animate-cta-glow inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              Construir Estágio na App
            </a>
          </div>
        </div>
      </section>

      {/* Destination Hubs */}
      <section id="hubs" className="relative bg-navy px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            Iberian Sports Platform
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight">
            Três hubs. Um corredor desportivo.
          </h2>
          <p className="mt-4 max-w-2xl text-app-white/65">
            Alterna entre Portugal e Espanha — da hospitalidade algarvia ao
            ritmo urbano de Barcelona e ao luxo da Costa del Sol.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {hubs.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setCountry(hub.country)}
                className={`group relative overflow-hidden rounded-2xl text-left min-h-[320px] border transition-all duration-300 ${
                  (country === 'portugal' && hub.id === 'algarve') ||
                  (country === 'spain' && hub.id !== 'algarve')
                    ? 'border-cyan/60 ring-1 ring-cyan/30'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <Image
                  src={hub.image}
                  alt={hub.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" />
                <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-end p-5">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-app-white/90 backdrop-blur-sm">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {hub.region}
                  </span>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold">
                    {hub.label}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-cyan">{hub.focus}</p>
                  <p className="mt-2 text-sm text-app-white/70 leading-relaxed">
                    {hub.blurb}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Closing brand strip */}
      <section className="border-t border-white/10 bg-gradient-to-br from-navy via-[#0c4a6e]/40 to-navy px-5 md:px-10 py-16">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold max-w-xl">
              Tech-driven. Multilíngue. Feito para o eixo Algarve ↔ Costa del Sol.
            </p>
            <p className="mt-3 text-app-white/60 text-sm md:text-base">
              PT · ES · FR · EN · DE — uma aplicação para clubs, escolas e
              operadores de turismo desportivo.
            </p>
          </div>
          <a
            href="#builder"
            className="inline-flex w-fit items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
          >
            Pedir orçamento na app
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 md:px-10 py-8 text-xs text-app-white/45">
        <div className="mx-auto max-w-7xl flex flex-wrap justify-between gap-3">
          <span className="font-semibold text-app-white/70">
            SportsEvents.app
          </span>
          <span>Portugal (Algarve) · España (Barcelona · Marbella · Málaga)</span>
        </div>
      </footer>
    </div>
  )
}
