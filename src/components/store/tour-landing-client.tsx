'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  BOOST_SUPABASE_ANON_KEY,
  boostEdgeRootUrl,
} from '@/lib/boost-store/config'

type PlanId = 'bronze' | 'silver' | 'gold' | 'platinum'
type Billing = 'mensal' | 'anual'

const PLANS: {
  id: PlanId
  name: string
  mensal: string
  anual: string
  noteAnual: string
  limit: string
  features: string[]
  popular?: boolean
  accent: string
}[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    mensal: '9.90',
    anual: '8.42',
    noteAnual: '100.98€ facturado anualmente',
    limit: 'Até 4 torneios/mês',
    accent: 'amber',
    features: [
      'Americano Individual',
      'Americano por Equipas',
      'Inscrições online',
      'Pagamentos Stripe',
      'Scheduling automático',
      'Página live',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    mensal: '19.90',
    anual: '16.92',
    noteAnual: '202.98€ facturado anualmente',
    limit: 'Até 10 torneios/mês',
    accent: 'gray',
    features: ['Tudo do Bronze', 'Formato Grupos + Eliminatórias'],
  },
  {
    id: 'gold',
    name: 'Gold',
    mensal: '29.90',
    anual: '25.42',
    noteAnual: '304.98€ facturado anualmente',
    limit: 'Até 15 torneios/mês',
    accent: 'yellow',
    popular: true,
    features: [
      'Tudo do Silver',
      'Formato Eliminatórias Diretas',
      'Ligas',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    mensal: '39.90',
    anual: '33.92',
    noteAnual: '406.98€ facturado anualmente',
    limit: 'Torneios ilimitados',
    accent: 'purple',
    features: [
      'Tudo do Gold',
      'Formato Super Teams',
      'Torneios Escada',
      'Formatos Personalizados',
      'Suporte prioritário',
      'Onboarding personalizado',
    ],
  },
]

const FEATURES = [
  {
    title: 'Inscrições Online',
    text: 'Formulário de inscrição com link partilhável. Os jogadores inscrevem-se diretamente pelo telemóvel.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Pagamentos Stripe',
    text: 'Recebe pagamentos de inscrições de forma segura. O dinheiro vai diretamente para a tua conta Stripe.',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Scheduling Automático',
    text: 'O sistema cria a ordem de jogos otimizada automaticamente. Define campos, horários e duração — o resto é automático.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Gestão de Campos',
    text: 'Configura campos disponíveis, campos outdoor e horários. O sistema distribui os jogos sem conflitos.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Resultados em Tempo Real',
    text: 'Insere resultados facilmente. Classificações, rankings e estatísticas atualizados instantaneamente.',
    color: 'from-red-500 to-red-600',
  },
  {
    title: 'Página Live',
    text: 'Página pública com resultados ao vivo. Os jogadores e espectadores acompanham tudo em tempo real no telemóvel.',
    color: 'from-indigo-500 to-indigo-600',
  },
]

const FORMATS = [
  {
    title: 'Americano Individual',
    text: 'Cada jogador joga com um parceiro diferente a cada ronda. O formato mais popular do padel.',
    tier: 'Bronze',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Americano por Equipas',
    text: 'Duplas fixas competem no formato americano. Ideal para torneios de pares já formados.',
    tier: 'Bronze',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Grupos + Eliminatórias',
    text: 'Fase de grupos seguida de eliminatórias. O formato clássico de competição com fases finais.',
    tier: 'Silver',
    border: 'border-gray-300',
    badge: 'bg-gray-200 text-gray-700',
  },
  {
    title: 'Eliminatórias Diretas',
    text: 'Quadro de eliminação direta (brackets). Perdes e vais para casa. Máxima emoção.',
    tier: 'Gold',
    border: 'border-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    title: 'Ligas',
    text: 'Competição prolongada com jornadas semanais ou mensais. Classificação contínua ao longo da temporada.',
    tier: 'Gold',
    border: 'border-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    title: 'Super Teams',
    text: 'Equipas de 4+ jogadores competem entre si. Formato social com rotação dentro da equipa.',
    tier: 'Platinum',
    border: 'border-purple-400',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Escada',
    text: 'Ranking dinâmico. Os jogadores desafiam quem está acima para subir de posição. Competição contínua.',
    tier: 'Platinum',
    border: 'border-purple-400',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Personalizados',
    text: 'Cria formatos à medida com regras personalizadas. Flexibilidade total para eventos únicos.',
    tier: 'Platinum',
    border: 'border-purple-400',
    badge: 'bg-purple-100 text-purple-700',
  },
]

const FAQ = [
  {
    q: 'Preciso de ter um clube para usar a plataforma?',
    a: 'Não! A plataforma foi desenhada para organizadores independentes. Podes organizar torneios em qualquer local — clubes parceiros, pavilhões, eventos outdoor. Tu defines os campos e horários.',
  },
  {
    q: 'Como é que os jogadores se inscrevem?',
    a: 'Cada torneio tem um link de inscrição único que podes partilhar nas redes sociais, WhatsApp ou email. Os jogadores inscrevem-se pelo telemóvel em segundos. Se o torneio for pago, o pagamento é processado automaticamente via Stripe.',
  },
  {
    q: 'Os jogadores precisam de instalar alguma app?',
    a: 'Não é obrigatório, mas recomendado. A app PADEL ONE (padel1.app) permite que os jogadores vejam torneios, acompanhem resultados, consultem o seu nível ELO e recebam notificações. A inscrição e a página live funcionam no browser, sem instalação.',
  },
  {
    q: 'Posso mudar de plano a qualquer momento?',
    a: 'Sim! Podes fazer upgrade ou downgrade a qualquer momento. A mudança é proporcional ao tempo restante do ciclo de facturação atual.',
  },
  {
    q: 'Os pagamentos dos jogadores vão para onde?',
    a: 'Diretamente para a tua conta Stripe. A plataforma facilita o processo de pagamento, mas o dinheiro vai todo para ti. Não cobramos comissões sobre as inscrições dos jogadores.',
  },
  {
    q: 'Há algum período de fidelização?',
    a: 'Não. Podes cancelar a subscrição a qualquer momento sem penalizações. No plano anual, o desconto de 15% aplica-se ao pagamento adiantado do ano completo.',
  },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function Check({ className = 'text-green-500' }: { className?: string }) {
  return (
    <svg
      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${className}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function TourLandingClient() {
  const [billing, setBilling] = useState<Billing>('mensal')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalPlan, setModalPlan] = useState<PlanId | null>(null)
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [ownerEmail, setOwnerEmail] = useState('')
  const [language, setLanguage] = useState('pt')
  const [currency, setCurrency] = useState('EUR')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscription') === 'success') {
      const slug = params.get('slug')
      setSuccessNotice(
        slug
          ? `Subscrição ativa! Acede em tour.padel1.app/${slug}`
          : 'Subscrição ativa com sucesso!'
      )
      window.history.replaceState({}, '', `${window.location.pathname}#precos`)
      const t = setTimeout(() => setSuccessNotice(null), 10000)
      return () => clearTimeout(t)
    }
  }, [])

  const planLabel = useMemo(() => {
    if (!modalPlan) return ''
    const name = PLANS.find((p) => p.id === modalPlan)?.name || modalPlan
    return `Plano ${name} · ${billing === 'anual' ? 'Anual' : 'Mensal'}`
  }, [modalPlan, billing])

  function openCheckout(plan: PlanId) {
    setModalPlan(plan)
    setError(null)
    setOrgName('')
    setOrgSlug('')
    setSlugManual(false)
    setOwnerEmail('')
    setLanguage('pt')
    setCurrency('EUR')
    document.body.style.overflow = 'hidden'
  }

  function closeCheckout() {
    setModalPlan(null)
    setBusy(false)
    setError(null)
    document.body.style.overflow = ''
  }

  async function submitCheckout(e: FormEvent) {
    e.preventDefault()
    if (!modalPlan) return
    const organizationName = orgName.trim()
    const organizationSlug = slugify(orgSlug.trim())
    const email = ownerEmail.trim()
    if (!organizationName || !organizationSlug || !email) {
      setError('Preenche todos os campos obrigatórios.')
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(organizationSlug)) {
      setError('O slug só pode ter letras minúsculas, números e hífens.')
      return
    }
    setOrgSlug(organizationSlug)
    setBusy(true)
    setError(null)
    try {
      const origin = window.location.origin
      const response = await fetch(boostEdgeRootUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${BOOST_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          productType: 'saas-tour-subscription',
          planType: modalPlan,
          billingPeriod: billing,
          organizationName,
          organizationSlug,
          ownerEmail: email,
          language,
          currency,
          successUrl: `${origin}/store/tour?subscription=success&slug=${encodeURIComponent(organizationSlug)}`,
          cancelUrl: `${origin}/store/tour#precos`,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento')
      }
      window.location.href = data.url
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível iniciar o checkout. Tenta novamente ou contacta info@sportsevents.app'
      )
      setBusy(false)
    }
  }

  return (
    <div className="bg-white text-gray-900 antialiased">
      {successNotice ? (
        <div className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-xl bg-green-600 px-6 py-4 text-sm font-bold text-white shadow-xl">
          {successNotice}
        </div>
      ) : null}

      <header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/store" className="flex items-center">
            <Image
              src="/brand/logo.png"
              alt="SportsEvents"
              width={160}
              height={56}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <div className="hidden items-center space-x-8 text-sm font-semibold text-gray-700 md:flex">
            <a href="#funcionalidades" className="hover:text-blue-600">
              Funcionalidades
            </a>
            <a href="#formatos" className="hover:text-blue-600">
              Formatos
            </a>
            <a href="#player-app" className="hover:text-blue-600">
              App Jogador
            </a>
            <a href="#precos" className="hover:text-blue-600">
              Preços
            </a>
            <a href="#faq" className="hover:text-blue-600">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#precos"
              className="hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition hover:shadow-lg sm:inline-block"
            >
              Começar Agora
            </a>
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-blue-600 md:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        {mobileOpen ? (
          <div className="space-y-2 border-t bg-white px-4 pb-4 md:hidden">
            {[
              ['#funcionalidades', 'Funcionalidades'],
              ['#formatos', 'Formatos'],
              ['#player-app', 'App Jogador'],
              ['#precos', 'Preços'],
              ['#faq', 'FAQ'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="block py-2 text-sm font-semibold text-gray-700 hover:text-blue-600"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <a
              href="#precos"
              className="block rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-center text-sm font-bold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Começar Agora
            </a>
          </div>
        ) : null}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-200 opacity-30 mix-blend-multiply blur-3xl filter" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-200 opacity-30 mix-blend-multiply blur-3xl filter" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-bold text-white">
                Para Organizadores Independentes
              </div>
              <h1 className="mb-6 text-4xl font-black leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Organiza Torneios
                <br />
                <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                  Sem Complicações
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                Não precisas de um clube. Cria torneios profissionais de padel em
                qualquer local. Americanos, Grupos, Eliminatórias, Ligas — tudo
                numa única plataforma.
              </p>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#precos"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-center font-bold text-white transition hover:scale-105 hover:shadow-xl"
                >
                  Ver Planos
                </a>
                <a
                  href="#funcionalidades"
                  className="rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-center font-bold text-gray-800 transition hover:border-blue-600"
                >
                  Conhecer Funcionalidades
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                {['Sem compromisso', 'Cancela quando quiseres', 'Desde 9.90€/mês'].map(
                  (t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Check className="text-green-600" />
                      {t}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <Image
                src="/store/tour-hero-padel-one.png"
                alt="PADEL ONE Tour — gestão de torneios no telemóvel"
                width={1024}
                height={682}
                className="h-auto w-full rounded-2xl object-cover shadow-2xl"
                priority
              />
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-green-100 p-3">
                    <Check className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Pronto em 5 min</p>
                    <p className="text-sm text-gray-600">Cria o teu primeiro torneio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 text-center text-white sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ['5 min', 'Setup completo'],
            ['100%', 'Automático'],
            ['24/7', 'Suporte dedicado'],
          ].map(([n, l]) => (
            <div key={n}>
              <div className="mb-2 text-4xl font-black sm:text-5xl">{n}</div>
              <p className="text-lg opacity-90">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="funcionalidades" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Funcionalidades
            </span>
            <h2 className="mt-4 mb-4 text-3xl font-black text-gray-900 sm:text-4xl lg:text-5xl">
              Tudo o que precisas para organizar torneios
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
              Ferramentas profissionais para gerir torneios de qualquer dimensão,
              sem necessidade de infraestrutura própria
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-8 shadow-lg transition hover:-translate-y-1.5"
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${f.color}`}
                >
                  <span className="text-xl text-white">◆</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="formatos" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Formatos
            </span>
            <h2 className="mt-4 mb-4 text-3xl font-black text-gray-900 sm:text-4xl lg:text-5xl">
              Todos os formatos de torneio
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
              Do americano clássico às ligas e escadas — escolhe o formato ideal
              para o teu evento
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FORMATS.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border-2 bg-white p-6 shadow-lg transition hover:-translate-y-1 ${f.border}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    ◆
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${f.badge}`}
                  >
                    {f.tier}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="player-app"
        className="bg-gradient-to-br from-gray-50 to-blue-50 py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Integração
              </span>
              <h2 className="mt-4 mb-6 text-3xl font-black text-gray-900 sm:text-4xl">
                Os teus jogadores têm a
                <br />
                <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                  App do Jogador
                </span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                Cada jogador que participa nos teus torneios tem acesso à app{' '}
                <strong>PADEL ONE</strong>, onde pode acompanhar tudo sobre os
                torneios e a sua evolução.
              </p>
              <ul className="space-y-5">
                {[
                  [
                    'Descobrir torneios',
                    'Os jogadores encontram os teus torneios e inscrevem-se diretamente pela app',
                  ],
                  [
                    'Nível ELO automático',
                    'O sistema calcula e atualiza o nível de cada jogador após cada jogo',
                  ],
                  [
                    'Perfil e histórico',
                    'Cada jogador tem perfil com estatísticas, vitórias, derrotas e evolução do nível',
                  ],
                  [
                    'Notificações',
                    'Alertas automáticos de novos torneios, horários de jogos e resultados',
                  ],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2 text-blue-600">
                      ◆
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{t}</h4>
                      <p className="text-sm text-gray-600">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="https://padel1.app"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
              >
                Conhecer a App do Jogador →
              </a>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <Image
                src="/store/padel-one-player-app.png"
                alt="PADEL ONE - App do Jogador"
                width={483}
                height={1011}
                className="h-auto max-w-[56%] drop-shadow-2xl sm:max-w-[256px] lg:max-w-[288px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="precos" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Preços
            </span>
            <h2 className="mt-4 mb-4 text-3xl font-black text-gray-900 sm:text-4xl lg:text-5xl">
              Planos para todos os organizadores
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600 sm:text-xl">
              Escolhe o plano ideal para a tua atividade. Sem surpresas, sem
              custos escondidos.
            </p>
            <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setBilling('mensal')}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                  billing === 'mensal'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setBilling('anual')}
                className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                  billing === 'anual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                Anual <span className="ml-1 text-xs text-green-600">-15%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl bg-white p-6 shadow-lg transition hover:-translate-y-1 ${
                  plan.popular
                    ? 'border-2 border-blue-500 shadow-xl lg:scale-105'
                    : 'border-2 border-gray-100'
                }`}
              >
                {plan.popular ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      Mais Popular
                    </span>
                  </div>
                ) : null}
                <div className={`mb-4 flex items-center gap-3 ${plan.popular ? 'mt-2' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    ★
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-gray-900">
                      {billing === 'mensal' ? plan.mensal : plan.anual}
                    </span>
                    <span className="mb-1 text-sm text-gray-500">€/mês</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {billing === 'mensal'
                      ? 'Facturado mensalmente'
                      : plan.noteAnual}
                  </p>
                </div>
                <div className="mb-6 flex-1 border-t border-gray-100 pt-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    {plan.limit.includes('ilimitados') ? (
                      <>
                        Torneios <strong>ilimitados</strong>
                      </>
                    ) : (
                      <>
                        Até <strong>{plan.limit.replace('Até ', '').replace('/mês', '')}</strong>
                        /mês
                      </>
                    )}
                  </p>
                  <ul className="space-y-2.5 text-sm text-gray-600">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check />
                        <span
                          className={
                            feat.startsWith('Formato') ||
                            feat === 'Ligas' ||
                            feat.startsWith('Torneios Escada') ||
                            feat.startsWith('Formatos')
                              ? 'font-semibold'
                              : undefined
                          }
                        >
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => openCheckout(plan.id)}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  Subscrever
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">
            Preços sem IVA. Pagamento seguro via Stripe.
          </p>
        </div>
      </section>

      <section id="faq" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-black text-gray-900 sm:text-4xl">
            Perguntas Frequentes
          </h2>
          <div className="space-y-5">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-xl bg-white p-6 shadow-sm sm:p-8"
              >
                <h3 className="mb-3 text-lg font-bold text-gray-900">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-black sm:text-4xl lg:text-5xl">
            Pronto para organizar
            <br />
            torneios profissionais?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg opacity-90 sm:text-xl">
            Junta-te a dezenas de organizadores que já confiam na PADEL ONE Tour
            para gerir os seus eventos
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="mailto:info@sportsevents.app?subject=PADEL ONE Tour - Quero saber mais"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-black text-blue-600 transition hover:scale-105 hover:shadow-2xl"
            >
              info@sportsevents.app
            </a>
            <a
              href="https://wa.me/351969365059?text=Olá! Estou interessado na plataforma PADEL ONE Tour para organizar torneios."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-4 text-lg font-black text-white transition hover:scale-105 hover:bg-green-600 hover:shadow-2xl"
            >
              WhatsApp
            </a>
          </div>
          <p className="mt-8 text-sm opacity-75">Respondemos em menos de 24h</p>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <Image
                src="/brand/logo.png"
                alt="SportsEvents"
                width={140}
                height={48}
                className="mx-auto mb-4 h-12 w-auto md:mx-0"
              />
              <p className="text-sm">
                Soluções profissionais para o mundo do padel
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-white">Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/store" className="hover:text-white">
                    Loja
                  </Link>
                </li>
                <li>
                  <a
                    href="https://padel1.app"
                    className="hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    App Jogador
                  </a>
                </li>
                <li>
                  <a
                    href="https://tour.padel1.app"
                    className="hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Login Tour
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-white">Contacto</h4>
              <p className="text-sm">
                Email:{' '}
                <a
                  href="mailto:info@sportsevents.app"
                  className="hover:text-white"
                >
                  info@sportsevents.app
                </a>
                <br />
                Tel:{' '}
                <a
                  href="https://wa.me/351969365059"
                  className="hover:text-white"
                >
                  +351 969 365 059
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 SportsEvents. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {modalPlan ? (
        <div className="fixed inset-0 z-[100]" aria-hidden="false">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={closeCheckout}
          />
          <div className="relative flex min-h-full items-center justify-center p-4">
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                      Subscrição
                    </p>
                    <h3 className="mt-1 text-xl font-black">Criar a tua conta</h3>
                    <p className="mt-1 text-sm opacity-90">{planLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="rounded-lg p-1.5 transition hover:bg-white/20"
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <form onSubmit={submitCheckout} className="space-y-4 p-6">
                <p className="text-sm text-gray-600">
                  Preenche os dados da organização. Depois avanças para o
                  pagamento Stripe e recebes o acesso à plataforma Tour.
                </p>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Nome da organização *
                  </label>
                  <input
                    required
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value)
                      if (!slugManual) setOrgSlug(slugify(e.target.value))
                    }}
                    placeholder="Ex: Madrid Padel Club"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Slug da URL *
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="flex items-center whitespace-nowrap border-r border-gray-300 bg-gray-50 px-3 text-xs text-gray-500 sm:text-sm">
                      tour.padel1.app/
                    </span>
                    <input
                      required
                      value={orgSlug}
                      onChange={(e) => {
                        setSlugManual(e.target.value.trim().length > 0)
                        setOrgSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        )
                      }}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      placeholder="madrid-padel"
                      className="flex-1 border-0 px-3 py-3 font-mono text-sm focus:ring-0"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Só letras minúsculas, números e hífens. Gerado automaticamente
                    a partir do nome.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Email do responsável *
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="teu@email.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Usado para login Tour e envio das credenciais.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Idioma
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pt">Português</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Moeda
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr.)</option>
                    </select>
                  </div>
                </div>
                {error ? (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? 'A redirecionar…' : 'Continuar para pagamento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
