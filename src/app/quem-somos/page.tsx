import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Quem Somos — SportsEvents.app',
  description:
    'Empresa familiar com ambição multinacional: operações no Algarve e expansão comercial pan-europeia.',
}

export default function QuemSomosPage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[60svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2000&q=80"
            alt="Equipa SportsEvents"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-16">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            About Us
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            A Nossa História. A Nossa Visão.
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            Somos uma empresa familiar com ambição multinacional, unindo a
            operação executiva no terreno à visão tecnológica e comercial
            pan-europeia.
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-extrabold">
            A Génese da SportsEvents.app
          </h2>
          <div className="mt-6 space-y-5 text-app-white/70 text-base md:text-lg leading-relaxed">
            <p>
              A SportsEvents.app nasceu da frustração com o mercado tradicional
              de turismo desportivo. Víamos equipas a viajar milhares de
              quilómetros para a Península Ibérica apenas para jogarem fechadas
              nos mesmos grupos de sempre, enfrentando orçamentos manuais
              lentos e logística desorganizada.
            </p>
            <p>
              Decidimos mudar as regras do jogo. Combinámos o conhecimento
              profundo da gestão de torneios locais e hospitalidade com o
              desenvolvimento de uma plataforma tecnológica nativa para criar
              um modelo B2B transparente, ágil e centrado no verdadeiro valor
              desportivo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#071525] px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-extrabold">
            A Nossa Liderança
          </h2>
          <p className="mt-4 max-w-2xl text-app-white/65">
            A nossa força reside na complementaridade das nossas direções:
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="border-l border-cyan/40 pl-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-cyan">
                Operações & Logística Local
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                Portugal / Algarve
              </p>
              <p className="mt-4 text-sm md:text-base text-app-white/65 leading-relaxed">
                Garantimos que nada falha no terreno. Com vasta experiência na
                gestão de eventos desportivos, planeamento tático e organização
                de ligas locais, asseguramos que os campos estão prontos, os
                treinadores alinhados e os adversários à vossa espera.
              </p>
            </div>
            <div className="border-l border-gold/40 pl-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-gold">
                Direção Comercial & Parcerias
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan">
                Espanha / Europa
              </p>
              <p className="mt-4 text-sm md:text-base text-app-white/65 leading-relaxed">
                Conduzimos a expansão internacional e a gestão tecnológica,
                criando pontes com clubes de toda a Europa Central, Escandinávia
                e Reino Unido. Gerimos as parcerias de topo (como a Meliá) para
                garantir que a sua equipa tem sempre as melhores tarifas e
                condições.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-extrabold">
            A Nossa Promessa
          </h2>
          <p className="mt-6 text-app-white/70 text-base md:text-lg leading-relaxed">
            Somos uma plataforma tecnológica &quot;Asset-Light&quot;. Isso significa que
            não temos os custos pesados das agências tradicionais. Investimos o
            nosso capital onde ele importa: na qualidade dos seus treinadores,
            na excelência do seu hotel e na tecnologia que lhe permite desenhar
            e gerir o seu camp em poucos cliques.
          </p>
          <Link
            href="/eventos"
            className="mt-10 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
          >
            Construir o Meu Estágio
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
