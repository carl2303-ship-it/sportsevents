'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plane,
  Trophy,
  Users,
} from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { estimateStage } from '@/lib/stage-builder/estimate'
import {
  BUILDER_STEPS,
  DEFAULT_STAGE_CONFIG,
  GROUP_TYPE_OPTIONS,
  HUB_OPTIONS,
  HOTEL_STAR_OPTIONS,
  LANG_OPTIONS,
  LEVEL_OPTIONS,
  MEAL_OPTIONS,
  MONTH_OPTIONS,
  type StageBuilderConfig,
} from '@/lib/stage-builder/types'

export default function ConstruirEstagioPage() {
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState<StageBuilderConfig>(DEFAULT_STAGE_CONFIG)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)

  const estimate = useMemo(() => estimateStage(config), [config])

  function patch<K extends keyof StageBuilderConfig>(
    key: K,
    value: StageBuilderConfig[K]
  ) {
    setConfig((c) => ({ ...c, [key]: value }))
  }

  function canNext() {
    if (step === 5) {
      return Boolean(config.clientName.trim() && config.clientEmail.trim())
    }
    return true
  }

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/stage-builder/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Não foi possível enviar o pedido.')
        setSubmitting(false)
        return
      }
      setLeadId(data.leadId)
      setDone(true)
    } catch {
      setError('Erro de rede. Tenta novamente.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            App Builder
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold">
            Construir o Meu Estágio
          </h1>
          <p className="mt-3 max-w-2xl text-app-white/65 text-sm md:text-base">
            Configura o teu camp de padel em minutos. Recebes uma estimativa
            indicativa e a nossa equipa confirma o orçamento final.
          </p>

          {done ? (
            <div className="mt-12 max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <h2 className="text-2xl font-black">Pedido enviado</h2>
              <p className="text-sm text-app-white/70">
                Obrigado{config.clientName ? `, ${config.clientName}` : ''}. A
                estimativa ficou em cerca de{' '}
                <strong className="text-emerald-300">
                  {estimate.pricePerPlayerDouble.toLocaleString('pt-PT')} €
                </strong>{' '}
                / jogador (quarto duplo) ou{' '}
                <strong className="text-emerald-300">
                  {estimate.pricePerPlayerSingle.toLocaleString('pt-PT')} €
                </strong>{' '}
                / jogador (single). Total grupo:{' '}
                {estimate.grandTotal.toLocaleString('pt-PT')} €. Entramos em
                contacto em breve.
              </p>
              {leadId && (
                <p className="text-[11px] text-app-white/40">Ref. {leadId}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/eventos"
                  className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy"
                >
                  Ver eventos publicados
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold"
                >
                  Voltar à home
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 max-w-3xl mx-auto space-y-6">
                {/* Steps */}
                <div className="flex flex-wrap gap-2">
                  {BUILDER_STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(i)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${
                        step === i
                          ? 'bg-cyan text-navy border-cyan'
                          : i < step
                            ? 'border-cyan/40 text-cyan'
                            : 'border-white/15 text-app-white/45'
                      }`}
                    >
                      {i + 1}. {s.label}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-5">
                  {step === 0 && (
                    <>
                      <SectionTitle title="Onde queres jogar?" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {HUB_OPTIONS.map((h) => (
                          <ChoiceCard
                            key={h.value}
                            active={config.hub === h.value}
                            onClick={() => patch('hub', h.value)}
                            title={`${h.flag} ${h.label}`}
                            blurb={h.blurb}
                          />
                        ))}
                      </div>
                      <SectionTitle title="Tipo de grupo" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {GROUP_TYPE_OPTIONS.map((g) => (
                          <ChoiceCard
                            key={g.value}
                            active={config.groupType === g.value}
                            onClick={() => patch('groupType', g.value)}
                            title={g.label}
                            blurb={g.blurb}
                          />
                        ))}
                      </div>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                          Mês preferido
                        </span>
                        <select
                          className={inputCls}
                          value={config.month}
                          onChange={(e) => patch('month', e.target.value)}
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <SectionTitle
                        title="Dimensão do grupo"
                        icon={<Users className="w-4 h-4 text-cyan" />}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <NumberField
                          label="Jogadores de padel"
                          value={config.players}
                          min={4}
                          max={40}
                          onChange={(v) => patch('players', v)}
                        />
                        <NumberField
                          label="Acompanhantes (não jogam)"
                          value={config.companions}
                          min={0}
                          max={20}
                          onChange={(v) => patch('companions', v)}
                        />
                        <NumberField
                          label="Noites"
                          value={config.nights}
                          min={2}
                          max={10}
                          onChange={(v) => patch('nights', v)}
                        />
                      </div>
                      <SectionTitle title="Nível de jogo" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LEVEL_OPTIONS.map((l) => (
                          <ChoiceCard
                            key={l.value}
                            active={config.playLevel === l.value}
                            onClick={() => patch('playLevel', l.value)}
                            title={l.label}
                            compact
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <SectionTitle
                        title="Programa desportivo"
                        icon={<Trophy className="w-4 h-4 text-gold" />}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NumberField
                          label="Horas de treino (total)"
                          value={config.trainingHours}
                          min={0}
                          max={30}
                          onChange={(v) => patch('trainingHours', v)}
                        />
                        <NumberField
                          label="Horas de jogo / confrontos"
                          value={config.matchHours}
                          min={0}
                          max={30}
                          onChange={(v) => patch('matchHours', v)}
                        />
                      </div>
                      <ToggleRow
                        label="Torneio final"
                        description="Formato competitivo no último dia com rankings e prémios"
                        value={config.tournament}
                        onChange={(v) => patch('tournament', v)}
                      />
                      <SectionTitle title="Língua das aulas" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LANG_OPTIONS.map((l) => (
                          <ChoiceCard
                            key={l.value}
                            active={config.lessonLanguage === l.value}
                            onClick={() => patch('lessonLanguage', l.value)}
                            title={l.label}
                            compact
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <SectionTitle
                        title="Hospitality"
                        icon={<Plane className="w-4 h-4 text-cyan" />}
                      />
                      <SectionTitle title="Regime de refeições" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {MEAL_OPTIONS.map((m) => (
                          <ChoiceCard
                            key={m.value}
                            active={config.mealPlan === m.value}
                            onClick={() => patch('mealPlan', m.value)}
                            title={m.label}
                            blurb={m.blurb}
                          />
                        ))}
                      </div>
                      <SectionTitle title="Categoria de hotel" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOTEL_STAR_OPTIONS.map((h) => (
                          <ChoiceCard
                            key={h.value}
                            active={config.hotelStars === h.value}
                            onClick={() => patch('hotelStars', h.value)}
                            title={h.label}
                            blurb={h.blurb}
                          />
                        ))}
                      </div>
                      <ToggleRow
                        label="Transfers aeroporto"
                        description="VIP 24/7 aeroporto ↔ hotel (ida e volta)"
                        value={config.airportTransfer}
                        onChange={(v) => patch('airportTransfer', v)}
                      />
                      <NumberField
                        label="Nº de quartos single"
                        value={config.singleRooms}
                        min={0}
                        max={config.players}
                        onChange={(v) => patch('singleRooms', v)}
                      />
                      <p className="text-[11px] text-app-white/45 -mt-2">
                        Os restantes jogadores ficam em quarto duplo (
                        {Math.max(0, config.players - config.singleRooms)} pax).
                      </p>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                          Notas / pedidos especiais
                        </span>
                        <textarea
                          className={inputCls}
                          rows={3}
                          value={config.notes}
                          onChange={(e) => patch('notes', e.target.value)}
                          placeholder="Ex.: preferência de hotel, aniversário no grupo, salas de reunião..."
                        />
                      </label>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <SectionTitle title="Resumo do estágio" />
                      <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent p-5 md:p-6 space-y-4">
                        <p className="text-[10px] uppercase tracking-wider text-gold font-bold">
                          As tuas escolhas
                        </p>
                        <div className="text-[11px] text-app-white/65 space-y-1">
                          <p>
                            {HUB_OPTIONS.find((h) => h.value === config.hub)?.flag}{' '}
                            {HUB_OPTIONS.find((h) => h.value === config.hub)?.label} ·
                            Hotel {config.hotelStars}★ · {config.month}
                          </p>
                          <p>
                            {config.players} jogadores
                            {config.companions
                              ? ` + ${config.companions} acompanhantes`
                              : ''}{' '}
                            · {config.nights} noites · {config.singleRooms} quarto(s)
                            single
                          </p>
                          <p>
                            {config.trainingHours}h treino · {config.matchHours}h jogo ·{' '}
                            {config.mealPlan}
                            {config.tournament ? ' · torneio' : ''}
                            {config.airportTransfer ? ' · transfer' : ''}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 space-y-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-app-white/55">
                              Preço por jogador (duplo)
                            </p>
                            <p className="text-3xl md:text-4xl font-black text-gold leading-none mt-1">
                              {estimate.pricePerPlayerDouble.toLocaleString('pt-PT')} €
                            </p>
                          </div>
                          <div className="flex justify-between items-end gap-3">
                            <p className="text-sm text-app-white/60">
                              Preço por jogador (single)
                            </p>
                            <p className="text-xl font-black text-white">
                              {estimate.pricePerPlayerSingle.toLocaleString('pt-PT')} €
                            </p>
                          </div>
                          <div className="flex justify-between items-end gap-3">
                            <p className="text-sm text-app-white/60">Total do grupo</p>
                            <p className="text-2xl font-black text-white">
                              {estimate.grandTotal.toLocaleString('pt-PT')} €
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-app-white/55 pt-1">
                          Estes valores são estimativos. O orçamento definitivo será
                          comunicado por email após o envio do formulário.
                        </p>
                      </div>
                    </>
                  )}

                  {step === 5 && (
                    <>
                      <SectionTitle title="Os teus dados" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block space-y-1.5 sm:col-span-2">
                          <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                            Nome completo *
                          </span>
                          <input
                            className={inputCls}
                            required
                            value={config.clientName}
                            onChange={(e) => patch('clientName', e.target.value)}
                          />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                            Email *
                          </span>
                          <input
                            className={inputCls}
                            type="email"
                            required
                            value={config.clientEmail}
                            onChange={(e) => patch('clientEmail', e.target.value)}
                          />
                        </label>
                        <label className="block space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                            Telefone
                          </span>
                          <input
                            className={inputCls}
                            value={config.clientPhone}
                            onChange={(e) => patch('clientPhone', e.target.value)}
                          />
                        </label>
                        <label className="block space-y-1.5 sm:col-span-2">
                          <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                            Clube / empresa
                          </span>
                          <input
                            className={inputCls}
                            value={config.companyOrClub}
                            onChange={(e) =>
                              patch('companyOrClub', e.target.value)
                            }
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {error && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-between gap-3 pt-2">
                    <button
                      type="button"
                      disabled={step === 0}
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold disabled:opacity-30"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Anterior
                    </button>
                    {step < BUILDER_STEPS.length - 1 ? (
                      <button
                        type="button"
                        disabled={!canNext()}
                        onClick={() => setStep((s) => s + 1)}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-xs font-bold text-navy disabled:opacity-40"
                      >
                        Seguinte <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canNext() || submitting}
                        onClick={submit}
                        className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-navy disabled:opacity-40"
                      >
                        {submitting ? 'A enviar...' : 'Pedir orçamento'}
                      </button>
                    )}
                  </div>
                </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

const inputCls =
  'w-full bg-navy/80 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan/50'

function SectionTitle({
  title,
  icon,
}: {
  title: string
  icon?: React.ReactNode
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-black text-white">
      {icon}
      {title}
    </h2>
  )
}

function ChoiceCard({
  active,
  onClick,
  title,
  blurb,
  compact,
}: {
  active: boolean
  onClick: () => void
  title: string
  blurb?: string
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border transition ${
        compact ? 'px-3 py-2.5' : 'px-3.5 py-3.5'
      } ${
        active
          ? 'border-cyan bg-cyan/10 text-white'
          : 'border-white/10 bg-navy/40 text-app-white/70 hover:border-white/25'
      }`}
    >
      <div className={`font-bold ${compact ? 'text-xs' : 'text-sm'}`}>{title}</div>
      {blurb && (
        <div className="mt-1 text-[11px] text-app-white/50 leading-snug">
          {blurb}
        </div>
      )}
    </button>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
        {label}
      </span>
      <input
        type="number"
        className={inputCls}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-navy/40 px-4 py-3">
      <div>
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-[11px] text-app-white/50 mt-0.5">{description}</div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
            value ? 'bg-emerald-500 text-navy' : 'bg-white/5 text-app-white/50'
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
            !value ? 'bg-rose-500/80 text-white' : 'bg-white/5 text-app-white/50'
          }`}
        >
          Não
        </button>
      </div>
    </div>
  )
}
