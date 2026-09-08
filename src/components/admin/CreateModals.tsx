'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, X } from 'lucide-react'

export type LookupOption = { id: string; name: string; code?: string | null }

const inputCls =
  'w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50'

const COUNTRY_OPTIONS = [
  { code: 'IT', name: 'Itália', lang: 'it' },
  { code: 'FR', name: 'França', lang: 'fr' },
  { code: 'GB', name: 'Reino Unido', lang: 'en' },
  { code: 'CH', name: 'Suíça', lang: 'de' },
  { code: 'BE', name: 'Bélgica', lang: 'fr' },
  { code: 'DE', name: 'Alemanha', lang: 'de' },
  { code: 'NL', name: 'Países Baixos', lang: 'nl' },
  { code: 'SE', name: 'Suécia', lang: 'sv' },
  { code: 'DK', name: 'Dinamarca', lang: 'da' },
  { code: 'PT', name: 'Portugal', lang: 'pt' },
  { code: 'ES', name: 'Espanha', lang: 'es' },
]

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`space-y-1 block ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h3 className="text-sm font-black text-white">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        <div className="sticky bottom-0 flex justify-end gap-2 px-5 py-4 border-t border-slate-800 bg-slate-900">
          {footer}
        </div>
      </div>
    </div>
  )
}

export function CreateClubModal({
  destinations,
  onClose,
  onCreated,
}: {
  destinations: LookupOption[]
  onClose: () => void
  onCreated: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    country_code: 'FR',
    city: '',
    region: '',
    address: '',
    courts_info: '',
    infrastructure: '',
    email: '',
    phone: '',
    contact_name: '',
    coaches: '',
    responsibles: '',
    preferred_language: 'fr',
    status: 'PROSPECAO',
  })

  function setCountry(code: string) {
    const c = COUNTRY_OPTIONS.find((x) => x.code === code)
    setForm((f) => ({
      ...f,
      country_code: code,
      preferred_language: c?.lang || 'en',
    }))
  }

  async function handleSave() {
    setError(null)
    if (!form.name.trim()) {
      setError('Nome do clube é obrigatório.')
      return
    }
    setSaving(true)
    const country = COUNTRY_OPTIONS.find((c) => c.code === form.country_code)
    const destination =
      destinations.find((d) => d.code === form.country_code) ||
      destinations.find((d) => d.name === country?.name)

    const { error: insertError } = await supabase.from('partners').insert({
      name: form.name.trim(),
      type: 'CLUBE_PADEL',
      destination_id: destination?.id || null,
      contact_name: form.contact_name || 'Clube',
      email: form.email || null,
      phone: form.phone || null,
      status: form.status,
      rating: 5,
      country_code: form.country_code,
      country_name: country?.name || form.country_code,
      city: form.city || null,
      region: form.region || null,
      address: form.address || null,
      courts_info: form.courts_info || null,
      infrastructure: form.infrastructure || null,
      coaches: form.coaches || null,
      responsibles: form.responsibles || null,
      preferred_language: form.preferred_language,
      notes: 'Criado manualmente no backoffice',
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <ModalShell
      title="Adicionar Clube"
      subtitle="Nova ficha de prospeção / parceiro"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'A guardar...' : 'Guardar clube'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Field label="Nome do clube *" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="País">
          <select
            className={inputCls}
            value={form.country_code}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PROSPECAO">Prospeção</option>
            <option value="RESPONDIDO">Respondido</option>
            <option value="PARCEIRO">Parceiro</option>
          </select>
        </Field>
        <Field label="Cidade">
          <input
            className={inputCls}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </Field>
        <Field label="Região">
          <input
            className={inputCls}
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Telefone">
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Responsáveis" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.responsibles}
            onChange={(e) => setForm({ ...form, responsibles: e.target.value })}
          />
        </Field>
        <Field label="Treinadores" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.coaches}
            onChange={(e) => setForm({ ...form, coaches: e.target.value })}
          />
        </Field>
        <Field label="Campos" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.courts_info}
            onChange={(e) => setForm({ ...form, courts_info: e.target.value })}
          />
        </Field>
        <Field label="Morada" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </ModalShell>
  )
}

export function CreateLeadModal({
  destinations,
  sports,
  onClose,
  onCreated,
}: {
  destinations: LookupOption[]
  sports: LookupOption[]
  onClose: () => void
  onCreated: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const padelSport = sports.find((s) => s.name.toLowerCase().includes('padel'))
  const algarve =
    destinations.find((d) => d.code === 'ALG' || d.code === 'ALGARVE') ||
    destinations.find((d) => d.name.toLowerCase().includes('algarve'))

  const [form, setForm] = useState({
    client_name: '',
    company_or_club: '',
    client_email: '',
    client_phone: '',
    language: 'pt',
    sport_id: padelSport?.id || '',
    destination_id: algarve?.id || '',
    group_size: 12,
    estimated_date: '',
    estimated_revenue: 10000,
    probability: 50,
    assigned_to: 'FILHO',
    status: 'NOVO',
    notes: '',
  })

  useEffect(() => {
    if (padelSport?.id && !form.sport_id) {
      setForm((f) => ({ ...f, sport_id: padelSport.id }))
    }
    if (algarve?.id && !form.destination_id) {
      setForm((f) => ({ ...f, destination_id: algarve.id }))
    }
  }, [padelSport?.id, algarve?.id, form.sport_id, form.destination_id])

  async function handleSave() {
    setError(null)
    if (!form.client_name.trim() || !form.client_email.trim()) {
      setError('Nome e email do cliente são obrigatórios.')
      return
    }
    setSaving(true)
    const { error: insertError } = await supabase.from('leads').insert({
      client_name: form.client_name.trim(),
      client_email: form.client_email.trim(),
      client_phone: form.client_phone || null,
      company_or_club: form.company_or_club || null,
      language: form.language,
      sport_id: form.sport_id || null,
      destination_id: form.destination_id || null,
      group_size: Number(form.group_size) || 1,
      estimated_date: form.estimated_date || null,
      estimated_revenue: Number(form.estimated_revenue) || 0,
      probability: Number(form.probability) || 50,
      assigned_to: form.assigned_to,
      status: form.status,
      notes: form.notes || null,
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <ModalShell
      title="Inserir Lead Manual"
      subtitle="Novo negócio no pipeline de vendas"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'A guardar...' : 'Guardar lead'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Field label="Nome do cliente *">
          <input
            className={inputCls}
            value={form.client_name}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          />
        </Field>
        <Field label="Empresa / Clube">
          <input
            className={inputCls}
            value={form.company_or_club}
            onChange={(e) =>
              setForm({ ...form, company_or_club: e.target.value })
            }
          />
        </Field>
        <Field label="Email *">
          <input
            className={inputCls}
            type="email"
            value={form.client_email}
            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
          />
        </Field>
        <Field label="Telefone">
          <input
            className={inputCls}
            value={form.client_phone}
            onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
          />
        </Field>
        <Field label="Modalidade">
          <select
            className={inputCls}
            value={form.sport_id}
            onChange={(e) => setForm({ ...form, sport_id: e.target.value })}
          >
            <option value="">Selecionar...</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destino">
          <select
            className={inputCls}
            value={form.destination_id}
            onChange={(e) =>
              setForm({ ...form, destination_id: e.target.value })
            }
          >
            <option value="">Selecionar...</option>
            {destinations
              .filter((d) =>
                ['ALG', 'ALGARVE', 'BCN', 'MAR', 'MRB'].includes(d.code || '')
              )
              .concat(
                destinations.filter(
                  (d) =>
                    !['ALG', 'ALGARVE', 'BCN', 'MAR', 'MRB'].includes(d.code || '')
                )
              )
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Nº participantes">
          <input
            className={inputCls}
            type="number"
            min={1}
            value={form.group_size}
            onChange={(e) =>
              setForm({ ...form, group_size: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Data estimada">
          <input
            className={inputCls}
            type="date"
            value={form.estimated_date}
            onChange={(e) =>
              setForm({ ...form, estimated_date: e.target.value })
            }
          />
        </Field>
        <Field label="Faturação prevista (€)">
          <input
            className={inputCls}
            type="number"
            min={0}
            value={form.estimated_revenue}
            onChange={(e) =>
              setForm({ ...form, estimated_revenue: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Probabilidade (%)">
          <input
            className={inputCls}
            type="number"
            min={0}
            max={100}
            value={form.probability}
            onChange={(e) =>
              setForm({ ...form, probability: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Atribuído a">
          <select
            className={inputCls}
            value={form.assigned_to}
            onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
          >
            <option value="FILHO">Comercial / Espanha (Filho)</option>
            <option value="PAI">Operações Algarve (Pai)</option>
            <option value="AMBOS">Ambos</option>
          </select>
        </Field>
        <Field label="Estado">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="NOVO">Novo</option>
            <option value="PROPOSTA_ENVIADA">Proposta enviada</option>
            <option value="EM_NEGOCIACAO">Em negociação</option>
            <option value="GANHO">Ganho</option>
            <option value="PERDIDO">Perdido</option>
          </select>
        </Field>
        <Field label="Notas" className="sm:col-span-2">
          <textarea
            className={inputCls}
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </ModalShell>
  )
}

export function CreateEventModal({
  destinations,
  sports,
  onClose,
  onCreated,
}: {
  destinations: LookupOption[]
  sports: LookupOption[]
  onClose: () => void
  onCreated: () => void
}) {
  const supabase = useMemo(() => createClient(), [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const padelSport = sports.find((s) => s.name.toLowerCase().includes('padel'))
  const algarve =
    destinations.find((d) => d.code === 'ALG' || d.code === 'ALGARVE') ||
    destinations.find((d) => d.name.toLowerCase().includes('algarve'))

  const [form, setForm] = useState({
    title: '',
    sport_id: padelSport?.id || '',
    destination_id: algarve?.id || '',
    start_date: '',
    end_date: '',
    group_size: 16,
    total_revenue: 0,
    total_cost: 0,
    assigned_manager: 'PAI',
    status: 'PLANEAMENTO',
  })

  async function handleSave() {
    setError(null)
    if (!form.title.trim() || !form.start_date || !form.end_date) {
      setError('Título, data de início e data de fim são obrigatórios.')
      return
    }
    setSaving(true)
    const { error: insertError } = await supabase.from('events').insert({
      title: form.title.trim(),
      sport_id: form.sport_id || null,
      destination_id: form.destination_id || null,
      start_date: form.start_date,
      end_date: form.end_date,
      group_size: Number(form.group_size) || 1,
      total_revenue: Number(form.total_revenue) || 0,
      total_cost: Number(form.total_cost) || 0,
      assigned_manager: form.assigned_manager,
      status: form.status,
    })
    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <ModalShell
      title="Novo Evento"
      subtitle="Estágio / camp operacional"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'A guardar...' : 'Guardar evento'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Field label="Título *" className="sm:col-span-2">
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex.: Padel Club Challenge — Casa Padel FR"
          />
        </Field>
        <Field label="Modalidade">
          <select
            className={inputCls}
            value={form.sport_id}
            onChange={(e) => setForm({ ...form, sport_id: e.target.value })}
          >
            <option value="">Selecionar...</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destino">
          <select
            className={inputCls}
            value={form.destination_id}
            onChange={(e) =>
              setForm({ ...form, destination_id: e.target.value })
            }
          >
            <option value="">Selecionar...</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data início *">
          <input
            className={inputCls}
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </Field>
        <Field label="Data fim *">
          <input
            className={inputCls}
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </Field>
        <Field label="Nº participantes">
          <input
            className={inputCls}
            type="number"
            min={1}
            value={form.group_size}
            onChange={(e) =>
              setForm({ ...form, group_size: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Gestor">
          <select
            className={inputCls}
            value={form.assigned_manager}
            onChange={(e) =>
              setForm({ ...form, assigned_manager: e.target.value })
            }
          >
            <option value="PAI">Operações Algarve (Pai)</option>
            <option value="FILHO">Comercial / Espanha (Filho)</option>
          </select>
        </Field>
        <Field label="Receita prevista (€)">
          <input
            className={inputCls}
            type="number"
            min={0}
            value={form.total_revenue}
            onChange={(e) =>
              setForm({ ...form, total_revenue: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Custo previsto (€)">
          <input
            className={inputCls}
            type="number"
            min={0}
            value={form.total_cost}
            onChange={(e) =>
              setForm({ ...form, total_cost: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Estado" className="sm:col-span-2">
          <select
            className={inputCls}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="PLANEAMENTO">Planeamento</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="EM_CURSO">Em curso</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </Field>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </ModalShell>
  )
}
