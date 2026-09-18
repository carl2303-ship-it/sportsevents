import Image from 'next/image'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { HubPackagesSection } from '@/components/hub-packages'
import { fetchPublishedPackagesForHub } from '@/lib/hub-packages.server'

export const metadata: Metadata = {
  title: 'Algarve Hub — SportsEvents.app',
  description:
    'Algarve Hub: onde o desporto encontra a natureza. Pacotes Padel Weekend, Experience e Premium VIP — treino, jogo local e transfers Faro.',
}

const highlights = [
  {
    title: 'Alojamento Premium',
    text: 'Selecionamos hotéis e resorts 4★ e 5★ no Algarve com villas ou apartamentos, ginásio e espaços comuns pensados para grupos desportivos.',
  },
  {
    title: 'A Comunidade Local',
    text: 'Através da nossa forte rede algarvia e do ecossistema Padel One / APC, as tardes são passadas a competir contra jogadores da região, nivelados ao vosso escalão.',
  },
  {
    title: 'Conveniência Total',
    text: 'Incluímos transfers VIP 24/7 diretamente do Aeroporto de Faro para a porta do seu alojamento.',
  },
]

export default async function AlgarvePage() {
  const packages = await fetchPublishedPackagesForHub('algarve')

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[70svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/destinos/algarve-hub.jpg"
            alt="Algarve Hub — campos de padel"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            🇵🇹 Portugal · Hub Algarve
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Algarve Hub: Onde o Desporto Encontra a Natureza.
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            O nosso hub em Portugal. Operações no Algarve com padel de alto
            nível, sol generoso e a transição natural entre o campo, a costa e
            o descanso.
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
            Situado no coração do sul de Portugal, o nosso hub no Algarve foi
            desenhado para grupos que exigem excelência. Com operações
            centralizadas, o seu grupo não perde tempo em deslocações. Do seu
            alojamento até ao campo de Padel, a logística fica connosco.
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

      <HubPackagesSection
        hubId="algarve"
        packages={packages}
        otherLinks={[
          { href: '/destinos/barcelona', label: 'Explorar Barcelona →' },
          { href: '/destinos/marbella', label: 'Explorar Marbella →' },
        ]}
      />

      <SiteFooter />
    </div>
  )
}
