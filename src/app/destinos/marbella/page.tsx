import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Marbella Hub — SportsEvents.app',
  description:
    'Marbella Hub: a capital europeia do padel. Costa del Sol, Meliá Hotels e competição de alto nível.',
}

const highlights = [
  {
    title: 'Parceria Meliá Hotels',
    text: 'Alojamento de prestígio com infraestruturas adaptadas para grupos corporativos e desportistas, garantindo um descanso absoluto após treinos intensos.',
  },
  {
    title: 'A Elite do Padel',
    text: 'Acesso a clubes icónicos e possibilidade de treino com técnicos experientes no circuito espanhol, elevando a componente tática do seu grupo.',
  },
  {
    title: 'Pós-Match de Luxo',
    text: 'Desde a zona histórica aos clubes de praia e restauração de topo, Marbella oferece o melhor ambiente de socialização da Europa.',
  },
]

export default function MarbellaPage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[70svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=2000&q=80"
            alt="Marbella Hub"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            🇪🇸 España · Costa del Sol
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Marbella Hub: A Capital Europeia do Padel.
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            Jogue onde os profissionais jogam. A Costa del Sol oferece o cenário
            mais vibrante, competitivo e luxuoso para o seu estágio desportivo,
            com a excelência dos Meliá Hotels.
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              A Experiência Marbella
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
              Desempenho Desportivo. Exclusividade e Glamour.
            </h2>
          </div>
          <p className="text-app-white/70 text-base md:text-lg leading-relaxed">
            Marbella não é apenas um destino; é a verdadeira casa do Padel na
            Europa. O nosso hub na Costa del Sol foi criado para grupos que
            procuram elevar o seu nível de jogo enfrentando a forte armada
            espanhola, enquanto desfrutam do lifestyle incomparável do
            Mediterrâneo.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 md:px-10 py-16 md:py-24 bg-[#071525]">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
            O Que Torna Marbella Única?
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

          <div className="mt-14 flex flex-wrap gap-4">
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
              href="/destinos/algarve"
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-app-white/80 hover:border-cyan/50 hover:text-cyan transition"
            >
              Explorar Algarve →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
