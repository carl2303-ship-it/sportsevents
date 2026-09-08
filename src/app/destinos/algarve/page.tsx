import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Algarve Hub — SportsEvents.app',
  description:
    'Algarve Hub: onde o desporto encontra a natureza. Flagship no Amendoeira Golf Resort — padel, futebol e hospitalidade portuguesa.',
}

const highlights = [
  {
    title: 'O Amendoeira Golf Resort',
    text: 'O nosso parceiro de alojamento oferece villas privadas exclusivas, campos de golfe de campeonato (Faldo e O\'Connor Jnr.), ginásio de alto rendimento e um Clubhouse deslumbrante para os nossos jantares de equipa.',
  },
  {
    title: 'A Comunidade Local',
    text: 'Através da nossa forte rede algarvia, garantimos que as suas tardes são passadas a competir contra jogadores da região, integrando a cultura desportiva local.',
  },
  {
    title: 'Conveniência Total',
    text: 'Incluímos transfers VIP 24/7 diretamente do Aeroporto de Faro para a porta do seu alojamento.',
  },
]

const packages = [
  {
    title: 'Padel Weekend',
    days: '4 Dias',
    text: 'A escapadinha tática ideal. 10 horas de padel num fim de semana prolongado.',
  },
  {
    title: 'Padel Experience',
    days: '5 Dias',
    text: 'O nosso produto estrela. 14 horas de padel, torneio final e a imersão completa no lifestyle algarvio.',
  },
  {
    title: 'Premium VIP Camp',
    days: '6 Dias',
    text: 'Para quem procura a derradeira experiência. 18 horas de campo, opção de clínica de golfe e serviço premium.',
  },
]

export default function AlgarvePage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[70svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=2000&q=80"
            alt="Algarve Hub"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            🇵🇹 Portugal · Flagship Hub
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Algarve Hub: Onde o Desporto Encontra a Natureza.
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            O nosso quartel-general. Sede de operações no premiado Amendoeira
            Golf Resort, oferecendo a transição perfeita entre o campo, a
            piscina e o descanso.
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              A Experiência Algarve
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
              Instalações de Nível Mundial. Imersão Local.
            </h2>
          </div>
          <p className="text-app-white/70 text-base md:text-lg leading-relaxed">
            Situado no coração do sul de Portugal, o nosso Flagship Hub no
            Algarve foi desenhado para grupos que exigem excelência. Com
            operações centralizadas, o seu grupo não perde tempo em
            deslocações. Do seu apartamento ou moradia de luxo até ao campo de
            Padel ou ao relvado FIFA, são apenas uns passos.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 md:px-10 py-16 md:py-24 bg-[#071525]">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
            O Que Torna o Algarve Único?
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {highlights.map((h) => (
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

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
            Os Nossos Pacotes no Algarve
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  {p.days}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-app-white/65 leading-relaxed">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/eventos"
              className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              Ver eventos & reservar
            </Link>
            <Link
              href="/destinos/barcelona"
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-app-white/80 hover:border-cyan/50 hover:text-cyan transition"
            >
              Explorar Barcelona →
            </Link>
            <Link
              href="/destinos/marbella"
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-app-white/80 hover:border-cyan/50 hover:text-cyan transition"
            >
              Explorar Marbella →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
