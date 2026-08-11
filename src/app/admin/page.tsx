'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Trophy,
  MapPin,
  Filter,
  CheckCircle,
  Clock,
  PhoneCall,
} from 'lucide-react'

interface Lead {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  language: string
  group_size: number
  status: string
  assigned_to: string
  created_at: string
  destinations?: { name: string }
  sports?: { name: string }
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAssignee, setFilterAssignee] = useState<string>('TODOS')
  const supabase = createClient()

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        destinations (name),
        sports (name)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLeads(data as Lead[])
    }
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from('leads').update({ status: newStatus }).eq('id', id)
    fetchLeads()
  }

  async function updateAssignee(id: string, assignee: string) {
    await supabase.from('leads').update({ assigned_to: assignee }).eq('id', id)
    fetchLeads()
  }

  const filteredLeads = leads.filter((lead) => {
    if (filterAssignee === 'TODOS') return true
    return lead.assigned_to === filterAssignee
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            SportsEvents.app — Backoffice
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão Ibérica de Estágios & Eventos (Portugal & Espanha)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterAssignee('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterAssignee === 'TODOS' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            Todos os Pedidos
          </button>
          <button
            onClick={() => setFilterAssignee('PAI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterAssignee === 'PAI' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            🇵🇹 Operações Algarve (Pai)
          </button>
          <button
            onClick={() => setFilterAssignee('FILHO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filterAssignee === 'FILHO' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            🇪🇸 Comercial / Espanha (Filho)
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Total de Solicitões</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-white">{leads.length}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Novos Pedidos</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-400">
            {leads.filter((l) => l.status === 'NOVO').length}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Em Negociação</span>
            <PhoneCall className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-cyan-400">
            {leads.filter((l) => l.status === 'EM_CONTACTO').length}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase">
            <span>Confirmados / Ganhos</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">
            {leads.filter((l) => l.status === 'GANHO').length}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-sm text-slate-200">
            Pedidos de Estágios & Torneios Recebidos
          </h2>
          <span className="text-xs text-slate-500">A atualizar em tempo real via Supabase</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">A carregar pedidos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Modalidade</th>
                  <th className="p-3">Destino</th>
                  <th className="p-3">Grupo</th>
                  <th className="p-3">Língua</th>
                  <th className="p-3">Atribuído a</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{lead.client_name}</div>
                      <div className="text-slate-400 text-[11px]">{lead.client_email}</div>
                    </td>
                    <td className="p-3 font-semibold text-cyan-400">
                      {lead.sports?.name || 'Padel'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {lead.destinations?.name || 'Algarve'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-200">{lead.group_size} pax</td>
                    <td className="p-3 uppercase font-bold text-slate-400">{lead.language}</td>
                    <td className="p-3">
                      <select
                        value={lead.assigned_to || ''}
                        onChange={(e) => updateAssignee(lead.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 text-xs"
                      >
                        <option value="">Sem Atribuição</option>
                        <option value="PAI">🇵🇹 Pai (Algarve)</option>
                        <option value="FILHO">🇪🇸 Filho (Espanha)</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          lead.status === 'NOVO'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : lead.status === 'GANHO'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => updateStatus(lead.id, 'EM_CONTACTO')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                      >
                        Em Contacto
                      </button>
                      <button
                        onClick={() => updateStatus(lead.id, 'GANHO')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
                      >
                        Ganho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
