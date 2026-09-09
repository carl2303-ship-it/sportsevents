import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Barcelona Hub — SportsEvents.app',
  description:
    'Barcelona Hub: epicentro do desporto e da inovação. Corporate teambuilding, padel urbano e Meliá Hotels.',
}

const highlights = [
  {
    title: 'Parceria Meliá Hotels (Urban Premium)',
    text: 'Alojamento de excelência no centro nevrálgico da cidade. Os hotéis Meliá em Barcelona oferecem as infraestruturas perfeitas para grupos corporativos, incluindo salas de reuniões modernas e espaços executivos para aliar trabalho e lazer.',
  },
  {
    title: 'A Força da Comunidade Catalã',
    text: 'Barcelona tem uma das maiores e mais competitivas comunidades de Padel da Europa. As suas tardes serão passadas a medir forças com clubes locais apaixonados e altamente táticos.',
  },
  {
    title: 'O Pós-Match Cosmopolita',
    text: 'O treino termina, mas a experiência continua. Da gastronomia de renome mundial em tapas bars exclusivos aos passeios pela arquitetura de Gaudí e marginal de Barceloneta, o networking do seu grupo ganha uma dimensão inesquecível.',
  },
]

const packages = [
  {
    title: 'Corporate Weekend',
    nights: '3 Noites',
    text: 'O formato ágil para empresas e executivos. Treino de manhã, reuniões ao início da tarde e confrontos locais ao final do dia.',
  },
  {
    title: 'Urban Padel Experience',
    nights: '4 Noites',
    text: 'A imersão desportiva citadina. 14 horas de padel e tempo livre otimizado para explorar a cultura e gastronomia catalã.',
  },
  {
    title: 'Premium VIP Camp',
    nights: '5 Noites',
    text: 'Alojamento executivo, jantares reservados nos melhores restaurantes da cidade e clínicas exclusivas com treinadores de topo.',
  },
]

export default function BarcelonaPage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      <section className="relative min-h-[70svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=2000&q=80"
            alt="Barcelona Hub"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pt-36 md:pt-44 pb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            🇪🇸 España · Capital Catalã
          </p>
          <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
            Barcelona Hub: O Epicentro do Desporto e da Inovação.
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-app-white/75">
            A energia de uma cidade cosmopolita aliada a uma cultura desportiva
            de elite. A sua equipa no centro da ação, com o conforto e a
            sofisticação da rede Meliá Hotels.
          </p>
        </div>
      </section>

      <section className="px-5 md:px-10 py-16 md:py-24">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              A Experiência Barcelona
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
              Alta Performance Urbana. Conexão Corporate.
            </h2>
          </div>
          <p className="text-app-white/70 text-base md:text-lg leading-relaxed">
            Barcelona respira desporto e modernidade. O nosso hub na capital
            catalã foi estrategicamente desenhado para grupos que procuram um
            ritmo dinâmico. Ideal para Club Trips e Corporate Camps
            (Teambuilding), aqui combinamos o treino intensivo nos melhores
            clubes da cidade com a oportunidade de viver uma das capitais
            europeias mais entusiasmantes, perfeita para fortalecer o espírito
            de equipa fora do campo.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 md:px-10 py-16 md:py-24 bg-[#071525]">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
            O Que Torna Barcelona Única?
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
            Os Nossos Pacotes em Barcelona
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  {p.nights}
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
              href="/destinos/marbella"
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-app-white/80 hover:border-cyan/50 hover:text-cyan transition"
            >
              Explorar Marbella →
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
