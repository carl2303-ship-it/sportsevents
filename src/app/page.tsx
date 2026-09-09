'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { BrandLogo } from '@/components/brand-logo'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=2000&q=80'

const formula = [
  {
    title: 'Manhãs de Evolução',
    text: '2 horas de treino técnico intensivo com treinadores certificados (Rácio 1:4).',
  },
  {
    title: 'Tardes de Competição',
    text: '2 horas de confronto direto contra a comunidade local de jogadores ibéricos, nivelados ao seu escalão.',
  },
  {
    title: 'Noites de Conexão',
    text: 'Jantares de grupo, networking e alojamento em resorts de topo.',
  },
]

const audiences = [
  {
    title: 'Club Trips & Academias',
    text: 'Rentabilize o seu clube organizando a viagem anual dos seus sócios. Nós tratamos da logística, você lidera a equipa.',
  },
  {
    title: 'Corporate & Teambuilding',
    text: 'Reforce os laços da sua empresa com pacotes VIP que combinam desporto, reuniões estratégicas e alta gastronomia.',
  },
  {
    title: 'Grupos Privados',
    text: 'O refúgio desportivo ideal para fechar a sua época com os amigos, com competição e diversão garantidas.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader transparent />

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Estágio desportivo na Península Ibérica"
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
            A Plataforma Ibérica de Turismo e Estágios Desportivos.
          </h1>

          <p className="animate-fade-up-delay mt-4 max-w-2xl text-base md:text-lg text-app-white/75">
            Experiências de alto rendimento em Padel. Combinamos treino
            profissional, competição com a comunidade local e alojamento premium
            em Portugal e Espanha.
          </p>

          <div className="animate-fade-up-delay-2 mt-8">
            <Link
              id="builder"
              href="/construir"
              className="animate-cta-glow inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              Construir o Meu Estágio
            </Link>
          </div>
        </div>
      </section>

      {/* Filosofia */}
      <section className="relative px-5 md:px-10 py-20 md:py-28 bg-gradient-to-b from-navy via-[#071a2e] to-navy">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            A Nossa Filosofia — A Fórmula Perfeita
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight">
            Não vendemos apenas viagens. Construímos atletas.
          </h2>
          <p className="mt-5 max-w-3xl text-app-white/70 text-base md:text-lg leading-relaxed">
            Esqueça as &quot;bolhas turísticas&quot; onde a sua equipa viaja milhares de
            quilómetros apenas para jogar entre si. A SportsEvents.app redefiniu
            o Sports Travel na Europa com a nossa fórmula exclusiva de imersão:
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {formula.map((item, i) => (
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

      {/* Destinos */}
      <section id="hubs" className="relative px-5 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            Os Nossos Destinos
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            Os Melhores Hubs Desportivos do Sul da Europa
          </h2>

          <div className="mt-12 space-y-6">
            <DestinationRow
              flag="🇵🇹"
              title="Algarve (Portugal)"
              text="O nosso Flagship Hub no Amendoeira Golf Resort. Mais de 300 dias de sol, campos de classe mundial e a autêntica hospitalidade portuguesa."
              href="/destinos/algarve"
              image="https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=80"
            />
            <DestinationRow
              flag="🇪🇸"
              title="Barcelona (Espanha)"
              text="O epicentro urbano do desporto e da inovação. Ideal para Corporate / Teambuilding, com a sofisticação Meliá e a energia cosmopolita da capital catalã."
              href="/destinos/barcelona"
              image="https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80"
              reverse
            />
            <DestinationRow
              flag="🇪🇸"
              title="Marbella (Espanha)"
              text="A Meca do Padel Europeu. Luxo, alta competição e a energia inigualável da Costa del Sol com a garantia de qualidade Meliá Hotels."
              href="/destinos/marbella"
              image="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80"
            />
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="relative border-t border-white/10 px-5 md:px-10 py-20 md:py-28 bg-gradient-to-br from-navy via-[#0c4a6e]/25 to-navy">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            Para Quem Trabalhamos
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold tracking-tight">
            Soluções B2B à Medida
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {audiences.map((a) => (
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
              href="/construir"
              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
            >
              Construir o Meu Estágio
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
  reverse = false,
}: {
  flag: string
  title: string
  text: string
  href: string
  image: string
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
          Saber mais →
        </Link>
      </div>
    </div>
  )
}
