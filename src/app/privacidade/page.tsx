import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Política de Privacidade — SportsEvents.app',
  description:
    'Como a SportsEvents.app recolhe, utiliza e protege os seus dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main className="px-5 md:px-10 py-12 md:py-16">
        <article className="mx-auto max-w-3xl space-y-8 text-sm md:text-base leading-relaxed text-app-white/75">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
              Legal
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold text-white">
              Política de Privacidade
            </h1>
            <p className="mt-3 text-xs text-app-white/45">
              Última atualização: setembro 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Quem somos</h2>
            <p>
              A SportsEvents.app (&quot;nós&quot;) opera a plataforma de turismo e
              estágios de padel em Portugal e Espanha. Responsável pelo
              tratamento: SportsEvents.app — contactos em{' '}
              <Link href="/contacto" className="text-cyan hover:underline">
                /contacto
              </Link>{' '}
              e email{' '}
              <a
                href="mailto:info@sportsevents.app"
                className="text-cyan hover:underline"
              >
                info@sportsevents.app
              </a>
              .
            </p>
            <p>
              Morada Portugal: Rua Leonardo Coimbra 1, 8200-112 Albufeira.
              Morada Espanha: Calle Mallorca 535B, 08026 Barcelona.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              2. Que dados recolhemos
            </h2>
            <p>Podemos tratar, entre outros:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Dados de identificação e contacto (nome, email, telefone,
                clube/empresa)
              </li>
              <li>
                Dados de pedidos de orçamento e configuração de estágios (hub,
                datas, nº de participantes, preferências)
              </li>
              <li>
                Dados de reservas e pagamento (quando aplicável, via prestadores
                como Stripe)
              </li>
              <li>
                Dados técnicos de navegação (cookies essenciais, logs de
                segurança)
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              3. Finalidades e bases legais
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Responder a contactos e pedidos de orçamento (interesse
                legítimo / pré-contratual)
              </li>
              <li>
                Gerir reservas, pagamentos e prestação do serviço (execução de
                contrato)
              </li>
              <li>
                Cumprir obrigações legais (faturação, contabilidade)
              </li>
              <li>
                Melhorar o site e a segurança (interesse legítimo)
              </li>
              <li>
                Comunicações comerciais apenas com consentimento, quando
                exigido
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Partilha de dados</h2>
            <p>
              Podemos partilhar dados com prestadores necessários à operação
              (alojamento, clubes, transfers, ferramentas de email/CRM,
              hosting, pagamentos), sempre sob obrigação de confidencialidade e
              apenas na medida necessária. Não vendemos dados pessoais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Conservação</h2>
            <p>
              Conservamos os dados pelo tempo necessário às finalidades acima e
              aos prazos legais aplicáveis (incluindo fiscal e comercial).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Os seus direitos</h2>
            <p>
              Nos termos do RGPD, pode solicitar acesso, retificação, apagamento,
              limitação, oposição e portabilidade, bem como retirar
              consentimentos. Para exercer direitos: {' '}
              <a
                href="mailto:info@sportsevents.app"
                className="text-cyan hover:underline"
              >
                info@sportsevents.app
              </a>
              . Tem ainda o direito de apresentar reclamação à autoridade de
              controlo competente (em Portugal, a CNPD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">7. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes necessárias ao
              funcionamento do site e, quando aplicável, para análise agregada.
              Pode gerir preferências no navegador.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">8. Contacto</h2>
            <p>
              Dúvidas sobre privacidade:{' '}
              <a
                href="mailto:info@sportsevents.app"
                className="text-cyan hover:underline"
              >
                info@sportsevents.app
              </a>{' '}
              · POR +351 969 365 059 · ESP +34 631 699 818.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
