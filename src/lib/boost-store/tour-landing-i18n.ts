import type { Locale } from '@/i18n/config'

export type TourPlanCopy = {
  id: 'bronze' | 'silver' | 'gold' | 'platinum'
  name: string
  noteAnual: string
  limit: string
  features: string[]
  popular?: boolean
}

export type TourLandingCopy = {
  metaTitle: string
  metaDescription: string
  navFeatures: string
  navFormats: string
  navPlayerApp: string
  navPricing: string
  navFaq: string
  ctaStart: string
  heroBadge: string
  heroTitle1: string
  heroTitle2: string
  heroLead: string
  ctaPlans: string
  ctaFeatures: string
  trustNoCommit: string
  trustCancel: string
  trustFrom: string
  featuresEyebrow: string
  featuresTitle: string
  features: { title: string; text: string }[]
  formatsEyebrow: string
  formatsTitle: string
  formats: { title: string; text: string; tier: string }[]
  playerEyebrow: string
  playerTitle: string
  playerLead: string
  playerBullets: string[]
  pricingEyebrow: string
  pricingTitle: string
  pricingLead: string
  billingMonthly: string
  billingYearly: string
  billingSave: string
  perMonth: string
  choosePlan: string
  popular: string
  pricingNote: string
  faqEyebrow: string
  faqTitle: string
  faq: { q: string; a: string }[]
  ctaTitle1: string
  ctaTitle2: string
  ctaLead: string
  ctaReply: string
  successWithSlug: string
  successGeneric: string
  modalSub: string
  modalTitle: string
  modalLead: string
  orgName: string
  orgNamePh: string
  orgSlug: string
  orgSlugHint: string
  ownerEmail: string
  ownerEmailHint: string
  language: string
  currency: string
  cancel: string
  continuePay: string
  redirecting: string
  close: string
  planLabelMonthly: string
  planLabelYearly: string
  errRequired: string
  errSlug: string
  errCheckout: string
  plans: TourPlanCopy[]
}

const pt: TourLandingCopy = {
  metaTitle:
    'PADEL ONE Tour | Plataforma de Gestão de Torneios para Organizadores',
  metaDescription:
    'Organiza torneios de padel profissionais sem precisar de um clube. Americanos, Grupos, Eliminatórias, Ligas. Inscrições online, pagamentos integrados e scheduling automático.',
  navFeatures: 'Funcionalidades',
  navFormats: 'Formatos',
  navPlayerApp: 'App Jogador',
  navPricing: 'Preços',
  navFaq: 'FAQ',
  ctaStart: 'Começar Agora',
  heroBadge: 'Para Organizadores Independentes',
  heroTitle1: 'Organiza Torneios',
  heroTitle2: 'Sem Complicações',
  heroLead:
    'Não precisas de um clube. Cria torneios profissionais de padel em qualquer local. Americanos, Grupos, Eliminatórias, Ligas — tudo numa única plataforma.',
  ctaPlans: 'Ver Planos',
  ctaFeatures: 'Conhecer Funcionalidades',
  trustNoCommit: 'Sem compromisso',
  trustCancel: 'Cancela quando quiseres',
  trustFrom: 'Desde 9.90€/mês',
  featuresEyebrow: 'Funcionalidades',
  featuresTitle: 'Tudo o que precisas para organizar',
  features: [
    {
      title: 'Inscrições Online',
      text: 'Formulário de inscrição com link partilhável. Os jogadores inscrevem-se diretamente pelo telemóvel.',
    },
    {
      title: 'Pagamentos Stripe',
      text: 'Recebe pagamentos de inscrições de forma segura. O dinheiro vai diretamente para a tua conta Stripe.',
    },
    {
      title: 'Scheduling Automático',
      text: 'O sistema cria a ordem de jogos otimizada automaticamente. Define campos, horários e duração — o resto é automático.',
    },
    {
      title: 'Gestão de Campos',
      text: 'Configura campos disponíveis, campos outdoor e horários. O sistema distribui os jogos sem conflitos.',
    },
    {
      title: 'Resultados em Tempo Real',
      text: 'Insere resultados facilmente. Classificações, rankings e estatísticas atualizados instantaneamente.',
    },
    {
      title: 'Página Live',
      text: 'Página pública com resultados ao vivo. Os jogadores e espectadores acompanham tudo em tempo real no telemóvel.',
    },
  ],
  formatsEyebrow: 'Formatos',
  formatsTitle: 'Todos os formatos de torneio',
  formats: [
    {
      title: 'Americano Individual',
      text: 'Cada jogador joga com um parceiro diferente a cada ronda. O formato mais popular do padel.',
      tier: 'Bronze',
    },
    {
      title: 'Americano por Equipas',
      text: 'Duplas fixas competem no formato americano. Ideal para torneios de pares já formados.',
      tier: 'Bronze',
    },
    {
      title: 'Grupos + Eliminatórias',
      text: 'Fase de grupos seguida de eliminatórias. O formato clássico de competição com fases finais.',
      tier: 'Silver',
    },
    {
      title: 'Eliminatórias Diretas',
      text: 'Quadro de eliminação direta (brackets). Perdes e vais para casa. Máxima emoção.',
      tier: 'Gold',
    },
    {
      title: 'Ligas',
      text: 'Competição prolongada com jornadas semanais ou mensais. Classificação contínua ao longo da temporada.',
      tier: 'Gold',
    },
    {
      title: 'Super Teams',
      text: 'Equipas de 4+ jogadores competem entre si. Formato social com rotação dentro da equipa.',
      tier: 'Platinum',
    },
    {
      title: 'Escada',
      text: 'Ranking dinâmico. Os jogadores desafiam quem está acima para subir de posição. Competição contínua.',
      tier: 'Platinum',
    },
    {
      title: 'Personalizados',
      text: 'Cria formatos à medida com regras personalizadas. Flexibilidade total para eventos únicos.',
      tier: 'Platinum',
    },
  ],
  playerEyebrow: 'App Jogador',
  playerTitle: 'Os teus jogadores também ganham',
  playerLead:
    'A app PADEL ONE liga organizadores e jogadores — níveis ELO, notificações e resultados no telemóvel.',
  playerBullets: [
    'Inscrição e página live no browser',
    'Nível ELO e histórico de jogos',
    'Notificações de jogos e resultados',
  ],
  pricingEyebrow: 'Preços',
  pricingTitle: 'Planos simples, sem surpresas',
  pricingLead: 'Escolhe o plano certo para o volume de torneios que organizas.',
  billingMonthly: 'Mensal',
  billingYearly: 'Anual',
  billingSave: '−15%',
  perMonth: '/mês',
  choosePlan: 'Escolher',
  popular: 'Mais popular',
  pricingNote: 'Preços sem IVA. Pagamento seguro via Stripe.',
  faqEyebrow: 'FAQ',
  faqTitle: 'Perguntas frequentes',
  faq: [
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
  ],
  ctaTitle1: 'Pronto para organizar',
  ctaTitle2: 'torneios profissionais?',
  ctaLead:
    'Junta-te a dezenas de organizadores que já confiam na PADEL ONE Tour para gerir os seus eventos',
  ctaReply: 'Respondemos em menos de 24h',
  successWithSlug: 'Subscrição ativa! Acede em tour.padel1.app/{slug}',
  successGeneric: 'Subscrição ativa com sucesso!',
  modalSub: 'Subscrição',
  modalTitle: 'Criar a tua conta',
  modalLead:
    'Preenche os dados da organização. Depois avanças para o pagamento Stripe e recebes o acesso à plataforma Tour.',
  orgName: 'Nome da organização *',
  orgNamePh: 'Ex: Madrid Padel Club',
  orgSlug: 'Slug da URL *',
  orgSlugHint:
    'Só letras minúsculas, números e hífens. Gerado automaticamente a partir do nome.',
  ownerEmail: 'Email do responsável *',
  ownerEmailHint: 'Usado para login Tour e envio das credenciais.',
  language: 'Idioma',
  currency: 'Moeda',
  cancel: 'Cancelar',
  continuePay: 'Continuar para pagamento',
  redirecting: 'A redirecionar…',
  close: 'Fechar',
  planLabelMonthly: 'Plano {name} · Mensal',
  planLabelYearly: 'Plano {name} · Anual',
  errRequired: 'Preenche todos os campos obrigatórios.',
  errSlug: 'O slug só pode ter letras minúsculas, números e hífens.',
  errCheckout:
    'Não foi possível iniciar o checkout. Tenta novamente ou contacta info@sportsevents.app',
  plans: [
    {
      id: 'bronze',
      name: 'Bronze',
      noteAnual: '100.98€ facturado anualmente',
      limit: 'Até 4 torneios/mês',
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
      noteAnual: '202.98€ facturado anualmente',
      limit: 'Até 10 torneios/mês',
      features: ['Tudo do Bronze', 'Formato Grupos + Eliminatórias'],
    },
    {
      id: 'gold',
      name: 'Gold',
      noteAnual: '304.98€ facturado anualmente',
      limit: 'Até 15 torneios/mês',
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
      noteAnual: '406.98€ facturado anualmente',
      limit: 'Torneios ilimitados',
      features: [
        'Tudo do Gold',
        'Formato Super Teams',
        'Torneios Escada',
        'Formatos Personalizados',
        'Suporte prioritário',
        'Onboarding personalizado',
      ],
    },
  ],
}

const en: TourLandingCopy = {
  ...pt,
  metaTitle: 'PADEL ONE Tour | Tournament Management for Organisers',
  metaDescription:
    'Run professional padel tournaments without needing a club. Americanos, groups, knockouts, leagues. Online entries, Stripe payments and automatic scheduling.',
  navFeatures: 'Features',
  navFormats: 'Formats',
  navPlayerApp: 'Player App',
  navPricing: 'Pricing',
  navFaq: 'FAQ',
  ctaStart: 'Get Started',
  heroBadge: 'For Independent Organisers',
  heroTitle1: 'Run Tournaments',
  heroTitle2: 'Without the Hassle',
  heroLead:
    'You don’t need a club. Create professional padel tournaments anywhere. Americanos, Groups, Knockouts, Leagues — all in one platform.',
  ctaPlans: 'See Plans',
  ctaFeatures: 'Explore Features',
  trustNoCommit: 'No commitment',
  trustCancel: 'Cancel anytime',
  trustFrom: 'From €9.90/mo',
  featuresEyebrow: 'Features',
  featuresTitle: 'Everything you need to organise',
  features: [
    {
      title: 'Online Entries',
      text: 'Shareable entry form. Players sign up directly from their phone.',
    },
    {
      title: 'Stripe Payments',
      text: 'Collect entry fees securely. Money goes straight to your Stripe account.',
    },
    {
      title: 'Automatic Scheduling',
      text: 'Optimised match order created automatically. Set courts, times and duration — the rest is done.',
    },
    {
      title: 'Court Management',
      text: 'Configure available courts, outdoor courts and time slots. No scheduling conflicts.',
    },
    {
      title: 'Live Results',
      text: 'Enter results easily. Standings, rankings and stats update instantly.',
    },
    {
      title: 'Live Page',
      text: 'Public live results page. Players and spectators follow everything in real time.',
    },
  ],
  formatsEyebrow: 'Formats',
  formatsTitle: 'Every tournament format',
  formats: [
    {
      title: 'Individual Americano',
      text: 'Each player rotates partners every round. The most popular padel format.',
      tier: 'Bronze',
    },
    {
      title: 'Team Americano',
      text: 'Fixed pairs compete in Americano format. Ideal for pre-formed teams.',
      tier: 'Bronze',
    },
    {
      title: 'Groups + Knockouts',
      text: 'Group stage followed by knockouts. The classic competition format.',
      tier: 'Silver',
    },
    {
      title: 'Direct Knockouts',
      text: 'Single-elimination brackets. Lose and you’re out. Maximum drama.',
      tier: 'Gold',
    },
    {
      title: 'Leagues',
      text: 'Long-form competition with weekly or monthly rounds. Continuous standings.',
      tier: 'Gold',
    },
    {
      title: 'Super Teams',
      text: 'Teams of 4+ players compete. Social format with rotation inside the team.',
      tier: 'Platinum',
    },
    {
      title: 'Ladder',
      text: 'Dynamic ranking. Challenge players above you to climb. Continuous competition.',
      tier: 'Platinum',
    },
    {
      title: 'Custom',
      text: 'Build formats with custom rules. Full flexibility for unique events.',
      tier: 'Platinum',
    },
  ],
  playerEyebrow: 'Player App',
  playerTitle: 'Your players win too',
  playerLead:
    'PADEL ONE connects organisers and players — ELO levels, notifications and results on mobile.',
  playerBullets: [
    'Entry and live page in the browser',
    'ELO level and match history',
    'Match and result notifications',
  ],
  pricingEyebrow: 'Pricing',
  pricingTitle: 'Simple plans, no surprises',
  pricingLead: 'Pick the plan that matches your tournament volume.',
  billingMonthly: 'Monthly',
  billingYearly: 'Yearly',
  billingSave: '−15%',
  perMonth: '/mo',
  choosePlan: 'Choose',
  popular: 'Most popular',
  pricingNote: 'Prices exclude VAT. Secure payment via Stripe.',
  faqEyebrow: 'FAQ',
  faqTitle: 'Frequently asked questions',
  faq: [
    {
      q: 'Do I need a club to use the platform?',
      a: 'No! Built for independent organisers. Run tournaments anywhere — partner clubs, halls, outdoor events. You define courts and times.',
    },
    {
      q: 'How do players enter?',
      a: 'Each tournament has a unique entry link you can share on social, WhatsApp or email. Players enter on mobile in seconds. Paid events collect via Stripe automatically.',
    },
    {
      q: 'Do players need an app?',
      a: 'Not required, but recommended. PADEL ONE (padel1.app) lets players see tournaments, results, ELO and notifications. Entry and live pages work in the browser.',
    },
    {
      q: 'Can I change plans anytime?',
      a: 'Yes — upgrade or downgrade anytime. Changes are prorated for the current billing cycle.',
    },
    {
      q: 'Where do player payments go?',
      a: 'Straight to your Stripe account. We facilitate checkout; you keep 100% of entry fees. No commission on player entries.',
    },
    {
      q: 'Is there a lock-in period?',
      a: 'No. Cancel anytime with no penalties. Annual plans apply the 15% discount to the prepaid year.',
    },
  ],
  ctaTitle1: 'Ready to organise',
  ctaTitle2: 'professional tournaments?',
  ctaLead:
    'Join dozens of organisers who already trust PADEL ONE Tour to run their events',
  ctaReply: 'We reply within 24h',
  successWithSlug: 'Subscription active! Open tour.padel1.app/{slug}',
  successGeneric: 'Subscription activated successfully!',
  modalSub: 'Subscription',
  modalTitle: 'Create your account',
  modalLead:
    'Enter your organisation details, then continue to Stripe payment to get Tour access.',
  orgName: 'Organisation name *',
  orgNamePh: 'e.g. Madrid Padel Club',
  orgSlug: 'URL slug *',
  orgSlugHint: 'Lowercase letters, numbers and hyphens only. Auto-generated from the name.',
  ownerEmail: 'Owner email *',
  ownerEmailHint: 'Used for Tour login and credentials.',
  language: 'Language',
  currency: 'Currency',
  cancel: 'Cancel',
  continuePay: 'Continue to payment',
  redirecting: 'Redirecting…',
  close: 'Close',
  planLabelMonthly: '{name} plan · Monthly',
  planLabelYearly: '{name} plan · Yearly',
  errRequired: 'Please fill in all required fields.',
  errSlug: 'Slug may only contain lowercase letters, numbers and hyphens.',
  errCheckout:
    'Could not start checkout. Try again or email info@sportsevents.app',
  plans: [
    {
      id: 'bronze',
      name: 'Bronze',
      noteAnual: '€100.98 billed yearly',
      limit: 'Up to 4 tournaments/mo',
      features: [
        'Individual Americano',
        'Team Americano',
        'Online entries',
        'Stripe payments',
        'Automatic scheduling',
        'Live page',
      ],
    },
    {
      id: 'silver',
      name: 'Silver',
      noteAnual: '€202.98 billed yearly',
      limit: 'Up to 10 tournaments/mo',
      features: ['Everything in Bronze', 'Groups + Knockouts format'],
    },
    {
      id: 'gold',
      name: 'Gold',
      noteAnual: '€304.98 billed yearly',
      limit: 'Up to 15 tournaments/mo',
      popular: true,
      features: [
        'Everything in Silver',
        'Direct Knockouts format',
        'Leagues',
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      noteAnual: '€406.98 billed yearly',
      limit: 'Unlimited tournaments',
      features: [
        'Everything in Gold',
        'Super Teams format',
        'Ladder tournaments',
        'Custom formats',
        'Priority support',
        'Personalised onboarding',
      ],
    },
  ],
}

const es: TourLandingCopy = {
  ...en,
  metaTitle: 'PADEL ONE Tour | Gestión de Torneos para Organizadores',
  metaDescription:
    'Organiza torneos de pádel profesionales sin necesitar un club. Americanos, grupos, eliminatorias, ligas.',
  navFeatures: 'Funciones',
  navFormats: 'Formatos',
  navPlayerApp: 'App Jugador',
  navPricing: 'Precios',
  navFaq: 'FAQ',
  ctaStart: 'Empezar ahora',
  heroBadge: 'Para organizadores independientes',
  heroTitle1: 'Organiza Torneos',
  heroTitle2: 'Sin Complicaciones',
  heroLead:
    'No necesitas un club. Crea torneos profesionales de pádel en cualquier lugar. Americanos, Grupos, Eliminatorias, Ligas — todo en una plataforma.',
  ctaPlans: 'Ver Planes',
  ctaFeatures: 'Ver Funciones',
  trustNoCommit: 'Sin compromiso',
  trustCancel: 'Cancela cuando quieras',
  trustFrom: 'Desde 9.90€/mes',
  featuresEyebrow: 'Funciones',
  featuresTitle: 'Todo lo que necesitas para organizar',
  pricingEyebrow: 'Precios',
  pricingTitle: 'Planes simples, sin sorpresas',
  billingMonthly: 'Mensual',
  billingYearly: 'Anual',
  choosePlan: 'Elegir',
  popular: 'Más popular',
  faqEyebrow: 'FAQ',
  faqTitle: 'Preguntas frecuentes',
  ctaTitle1: '¿Listo para organizar',
  ctaTitle2: 'torneos profesionales?',
  modalTitle: 'Crea tu cuenta',
  cancel: 'Cancelar',
  continuePay: 'Continuar al pago',
  language: 'Idioma',
  currency: 'Moneda',
}

const fr: TourLandingCopy = {
  ...en,
  metaTitle: 'PADEL ONE Tour | Gestion de Tournois pour Organisateurs',
  metaDescription:
    'Organisez des tournois de padel professionnels sans club. Americanos, groupes, tableaux, ligues.',
  navFeatures: 'Fonctionnalités',
  navFormats: 'Formats',
  navPlayerApp: 'App Joueur',
  navPricing: 'Tarifs',
  ctaStart: 'Commencer',
  heroBadge: 'Pour organisateurs indépendants',
  heroTitle1: 'Organisez des Tournois',
  heroTitle2: 'Sans Complications',
  heroLead:
    'Pas besoin d’un club. Créez des tournois professionnels partout. Americanos, Groupes, Tableaux, Ligues — une seule plateforme.',
  ctaPlans: 'Voir les Plans',
  ctaFeatures: 'Découvrir',
  trustNoCommit: 'Sans engagement',
  trustCancel: 'Résiliez quand vous voulez',
  trustFrom: 'Dès 9.90€/mois',
  featuresEyebrow: 'Fonctionnalités',
  featuresTitle: 'Tout pour organiser',
  pricingEyebrow: 'Tarifs',
  pricingTitle: 'Plans simples, sans surprise',
  billingMonthly: 'Mensuel',
  billingYearly: 'Annuel',
  choosePlan: 'Choisir',
  popular: 'Le plus populaire',
  faqTitle: 'Questions fréquentes',
  ctaTitle1: 'Prêt à organiser',
  ctaTitle2: 'des tournois professionnels ?',
  modalTitle: 'Créer votre compte',
  cancel: 'Annuler',
  continuePay: 'Continuer vers le paiement',
  language: 'Langue',
  currency: 'Devise',
}

const de: TourLandingCopy = {
  ...en,
  metaTitle: 'PADEL ONE Tour | Turniermanagement für Organisatoren',
  metaDescription:
    'Professionelle Padel-Turniere ohne Club. Americanos, Gruppen, K.O., Ligen.',
  navFeatures: 'Funktionen',
  navFormats: 'Formate',
  navPlayerApp: 'Spieler-App',
  navPricing: 'Preise',
  ctaStart: 'Jetzt starten',
  heroBadge: 'Für unabhängige Organisatoren',
  heroTitle1: 'Turniere organisieren',
  heroTitle2: 'Ohne Komplikationen',
  heroLead:
    'Kein Club nötig. Professionelle Padel-Turniere überall. Americanos, Gruppen, K.O., Ligen — eine Plattform.',
  ctaPlans: 'Pläne ansehen',
  ctaFeatures: 'Funktionen entdecken',
  trustNoCommit: 'Keine Bindung',
  trustCancel: 'Jederzeit kündbar',
  trustFrom: 'Ab 9.90€/Monat',
  featuresEyebrow: 'Funktionen',
  featuresTitle: 'Alles zum Organisieren',
  pricingEyebrow: 'Preise',
  pricingTitle: 'Einfache Pläne, keine Überraschungen',
  billingMonthly: 'Monatlich',
  billingYearly: 'Jährlich',
  choosePlan: 'Wählen',
  popular: 'Beliebteste',
  faqTitle: 'Häufige Fragen',
  ctaTitle1: 'Bereit für',
  ctaTitle2: 'professionelle Turniere?',
  modalTitle: 'Konto erstellen',
  cancel: 'Abbrechen',
  continuePay: 'Weiter zur Zahlung',
  language: 'Sprache',
  currency: 'Währung',
}

const BY_LOCALE: Record<Locale, TourLandingCopy> = { pt, en, es, fr, de }

export function getTourLandingCopy(locale: Locale): TourLandingCopy {
  return BY_LOCALE[locale] || en
}
