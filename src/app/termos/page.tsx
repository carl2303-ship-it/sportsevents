import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

export const metadata: Metadata = {
  title: 'Termos de Serviço — SportsEvents.app',
  description:
    'Condições gerais de utilização da plataforma e dos serviços SportsEvents.app.',
}

export default function TermosPage() {
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
              Termos de Serviço
            </h1>
            <p className="mt-3 text-xs text-app-white/45">
              Última atualização: setembro 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Objeto</h2>
            <p>
              Estes Termos regulam o acesso e utilização do website
              SportsEvents.app e dos serviços de organização de estágios,
              camps e experiências de padel em Portugal e Espanha
              (&quot;Serviços&quot;).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Serviços</h2>
            <p>
              A SportsEvents.app disponibiliza informação comercial, um
              construtor de estágios personalizados, formulários de contacto e,
              quando publicado, a reserva de eventos. Os preços apresentados no
              construtor são <strong className="text-white">estimativos</strong>
              ; o orçamento definitivo é comunicado por email após análise do
              pedido.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Pedidos e reservas</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                O envio de um formulário ou pedido de orçamento não constitui,
                por si só, contrato vinculativo até confirmação escrita pela
                SportsEvents.app.
              </li>
              <li>
                Reservas online com pagamento (quando disponíveis) ficam sujeitas
                às condições indicadas na ficha do evento e ao processamento do
                pagamento.
              </li>
              <li>
                Disponibilidade de hotel, campos, treinadores e transfers
                depende de confirmação operacional.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              4. Obrigações do cliente
            </h2>
            <p>
              O cliente compromete-se a fornecer informação verdadeira e
              atualizada, a cumprir as regras dos hotéis e clubes parceiros, e a
              garantir comportamento adequado dos participantes. Quaisquer
              danos causados por participantes podem ser imputados ao cliente /
              grupo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              5. Cancelamentos e alterações
            </h2>
            <p>
              Políticas de cancelamento, alterações de datas e reembolsos são
              definidas em cada proposta / contrato de reserva. Força maior
              (incluindo restrições climáticas extremas, greves ou imposições
              oficiais) pode implicar reagendamento ou soluções alternativas sem
              responsabilidade adicional da SportsEvents.app além do
              contratualmente previsto.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Responsabilidade</h2>
            <p>
              A SportsEvents.app organiza experiências com parceiros
              independentes (hotéis, clubes, transportes). Na medida permitida
              por lei, a responsabilidade limita-se aos serviços por nós
              diretamente contratados e aos danos previsíveis resultantes de
              incumprimento culposo. Não garantimos resultados desportivos
              específicos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">7. Propriedade intelectual</h2>
            <p>
              Marcas, conteúdos, software e materiais do site são propriedade da
              SportsEvents.app ou dos respetivos titulares. É proibida a
              reprodução não autorizada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">8. Dados pessoais</h2>
            <p>
              O tratamento de dados pessoais segue a nossa{' '}
              <Link href="/privacidade" className="text-cyan hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">9. Lei aplicável</h2>
            <p>
              Salvo disposição legal imperativa em contrário, aplica-se a lei
              portuguesa. Para litígios de consumo, o cliente pode recorrer às
              entidades de resolução alternativa de litígios competentes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">10. Contacto</h2>
            <p>
              <a
                href="mailto:info@sportsevents.app"
                className="text-cyan hover:underline"
              >
                info@sportsevents.app
              </a>{' '}
              · POR +351 969 365 059 · ESP +34 631 699 818
              <br />
              Rua Leonardo Coimbra 1, 8200-112 Albufeira
              <br />
              Calle Mallorca 535B, 08026 Barcelona
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
