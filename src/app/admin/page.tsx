'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Building2,
  Trophy,
  MapPin,
  Briefcase,
  Calendar,
  Plus,
  BarChart3,
  Calculator,
} from 'lucide-react'
import RentabilidadeTorneios from '@/components/admin/RentabilidadeTorneios'
import { LogoutButton } from '@/components/admin/logout-button'

export default function EnterpriseBackoffice() {
  const [activeTab, setActiveTab] = useState<'kpis' | 'pipeline' | 'partners' | 'events' | 'roi'>('kpis')
  const [leads, setLeads] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [managerFilter, setManagerFilter] = useState<string>('ALL')

  useEffect(() => {
    loadEnterpriseData()
  }, [])

  async function loadEnterpriseData() {
    setLoading(true)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data: leadsData } = await supabase
      .from('leads')
      .select('*, destinations(name), sports(name)')
      .order('created_at', { ascending: false })

    const { data: partnersData } = await supabase
      .from('partners')
      .select('*, destinations(name)')
      .order('name', { ascending: true })

    const { data: eventsData } = await supabase
      .from('events')
      .select('*, destinations(name), sports(name)')
      .order('start_date', { ascending: true })

    if (leadsData) setLeads(leadsData)
    if (partnersData) setPartners(partnersData)
    if (eventsData) setEvents(eventsData)

    setLoading(false)
  }

  const totalRevenueWon = events.reduce(
    (acc, curr) => acc + Number(curr.total_revenue || 0),
    0
  )
  const totalMarginWon = events.reduce(
    (acc, curr) => acc + Number(curr.margin || 0),
    0
  )
  const pipelineForecast = leads
    .filter((l) => l.status !== 'PERDIDO' && l.status !== 'GANHO')
    .reduce(
      (acc, curr) =>
        acc +
        Number(curr.estimated_revenue || 0) *
          (Number(curr.probability || 50) / 100),
      0
    )

  return (
    <div className="min-h-screen bg-navy text-app-white font-sans flex flex-col">
      <header className="bg-navy/90 border-b border-white/10 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan to-gold p-2 rounded-xl text-navy font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2 font-[family-name:var(--font-display)]">
              SportsEvents<span className="text-cyan">.app</span>{' '}
              <span className="text-xs bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded-full font-mono">
                ENTERPRISE ERP
              </span>
            </h1>
            <p className="text-xs text-app-white/55">
              Gestão Multinacional Ibérica (Algarve · Barcelona · Marbella)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setManagerFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${managerFilter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Visão Global
            </button>
            <button
              onClick={() => setManagerFilter('PAI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${managerFilter === 'PAI' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              🇵🇹 Operações Algarve (Pai)
            </button>
            <button
              onClick={() => setManagerFilter('FILHO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${managerFilter === 'FILHO' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              🇪🇸 Comercial / Espanha (Filho)
            </button>
          </div>
          <LogoutButton />
        </div>
      </header>

      <nav className="bg-slate-900/50 border-b border-slate-800 px-6 flex gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'kpis' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <BarChart3 className="w-4 h-4" /> Dashboard Executive & Previsões
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'pipeline' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Briefcase className="w-4 h-4" /> Pipeline de Vendas & CRM
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'events' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Calendar className="w-4 h-4" /> Estágios & Eventos Operacionais
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'partners' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Building2 className="w-4 h-4" /> Rede de Parceiros (ERP)
        </button>
        <button
          onClick={() => setActiveTab('roi')}
          className={`py-3 flex items-center gap-2 border-b-2 transition-all ${activeTab === 'roi' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Calculator className="w-4 h-4" /> Rentabilidade Torneios
        </button>
        <Link
          href="/admin/simulador"
          className="py-3 flex items-center gap-2 border-b-2 border-transparent text-slate-400 hover:text-amber-400 hover:border-amber-400/50 transition-all"
        >
          <Calculator className="w-4 h-4" /> Simulador Financeiro
        </Link>
      </nav>

      <main className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Faturação Executada
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  {totalRevenueWon.toLocaleString('pt-PT')} €
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Contratos Fechados & Eventos
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Margem Líquida Realizada
                </span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  {totalMarginWon.toLocaleString('pt-PT')} €
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Margem Operacional Média ~35%
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Previsão Pipeline (Weighted Forecast)
                </span>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {pipelineForecast.toLocaleString('pt-PT')} €
                </div>
                <span className="text-[11px] text-amber-400/80 font-medium">
                  Ajustado por probabilidade de fecho
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Rede de Parceiros Ativos
                </span>
                <div className="text-3xl font-black text-cyan-400 mt-1">
                  {partners.length}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Hotéis, Clubes, Treinadores, Sponsors
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-white mb-4 flex items-center justify-between">
                  <span>Próximos Estágios Confirmados</span>
                  <span className="text-xs text-cyan-400 font-normal">Ver Todos</span>
                </h3>
                <div className="space-y-3">
                  {events.slice(0, 4).map((e) => (
                    <div
                      key={e.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{e.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {e.destinations?.name} · {e.group_size} pessoas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">
                          {e.total_revenue} €
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">
                          {e.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-xs text-slate-500">
                      Sem eventos operacionais agendados.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-sm text-white mb-4">
                  Distribuição do Pipeline de Vendas
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Propostas Enviadas</span>
                      <span className="font-bold text-amber-400">
                        {leads.filter((l) => l.status === 'PROPOSTA_ENVIADA').length}{' '}
                        Negócios
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-2/3"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Em Negociação Directa</span>
                      <span className="font-bold text-cyan-400">
                        {leads.filter((l) => l.status === 'EM_NEGOCIACAO').length}{' '}
                        Negócios
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Rede Ibérica de Parceiros & Fornecedores
                </h2>
                <p className="text-xs text-slate-400">
                  Gestão de acordos com Hotéis, Clubes de Padel, Campos de Futebol,
                  Treinadores e Patrocinadores.
                </p>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar Novo Parceiro
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-cyan-400 uppercase tracking-wider">
                      {p.type}
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      ★ {p.rating}/5
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{p.name}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />{' '}
                    {p.destinations?.name || 'Geral'}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        Tarifa Negociada
                      </div>
                      <div className="font-bold text-emerald-400">
                        {p.negotiated_rate
                          ? `${p.negotiated_rate} €`
                          : 'Sob Consulta'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Contacto
                      </div>
                      <div className="text-slate-300">{p.contact_name || 'N/D'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {partners.length === 0 && (
                <div className="col-span-3 bg-slate-900 border border-slate-800 p-8 text-center rounded-2xl text-xs text-slate-500">
                  Nenhum parceiro registado na base de dados. Clica em &quot;Adicionar
                  Novo Parceiro&quot; para começar.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Pipeline de Vendas & Pedidos de Orçamento
              </h2>
              <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Inserir Novo Lead Manual
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Cliente / Clube</th>
                    <th className="p-3">Modalidade</th>
                    <th className="p-3">Destino</th>
                    <th className="p-3">Pax</th>
                    <th className="p-3">Faturação Prevista</th>
                    <th className="p-3">Probabilidade</th>
                    <th className="p-3">Atribuído a</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/50">
                      <td className="p-3">
                        <div className="font-bold text-white">{l.client_name}</div>
                        <div className="text-[10px] text-slate-400">
                          {l.company_or_club || l.client_email}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-cyan-400">
                        {l.sports?.name || 'Padel'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {l.destinations?.name || 'Algarve'}
                      </td>
                      <td className="p-3 font-bold">{l.group_size} pax</td>
                      <td className="p-3 font-bold text-emerald-400">
                        {l.estimated_revenue || 0} €
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full"
                              style={{ width: `${l.probability || 50}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {l.probability || 50}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        {l.assigned_to}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roi' && <RentabilidadeTorneios />}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Estágios & Eventos Operacionais
                </h2>
                <p className="text-xs text-slate-400">
                  Calendário de operações confirmadas e em preparação.
                </p>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Evento
              </button>
            </div>

            {loading ? (
              <div className="bg-slate-900 border border-slate-800 p-8 text-center rounded-2xl text-xs text-slate-500">
                A carregar eventos...
              </div>
            ) : events.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 text-center rounded-2xl text-xs text-slate-500">
                Sem eventos operacionais agendados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm text-white">{e.title}</h3>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {e.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {e.destinations?.name || 'N/D'} · {e.sports?.name || 'Padel'}
                    </div>
                    <div className="mt-3 flex justify-between text-xs">
                      <span className="text-slate-300">{e.group_size} pax</span>
                      <span className="font-bold text-emerald-400">
                        {e.total_revenue || 0} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
