'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  type StageHub,
} from '@/lib/stage-builder/types'
import {
  formatEuro,
  HUB_CODE_TO_ID,
  HUB_ID_TO_CODE,
  lowestAvailablePrice,
  type HubId,
  type HubPackageView,
  type PackageKey,
} from '@/lib/hub-packages'
import { withLocale } from '@/i18n/config'
import { fillTemplate } from '@/i18n/dictionaries'
import { useDictionary } from '@/i18n/use-locale'

function hubIdFromQuery(raw: string | null): StageHub | null {
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower === 'algarve' || lower === 'alg') return 'ALG'
  if (lower === 'barcelona' || lower === 'bcn') return 'BCN'
  if (lower === 'marbella' || lower === 'mar' || lower === 'mrb') return 'MAR'
  if (raw === 'ALG' || raw === 'BCN' || raw === 'MAR') return raw
  return null
}

export default function ConstruirEstagioPage() {
  const { t } = useDictionary()
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy text-app-white flex items-center justify-center text-sm text-app-white/60">
          {t.builder.loading}
        </div>
      }
    >
      <ConstruirEstagioClient />
    </Suspense>
  )
}

function ConstruirEstagioClient() {
  const { locale, t } = useDictionary()
  const b = t.builder
  const numberLocale = locale === 'en' ? 'en-GB' : 'pt-PT'
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState<StageBuilderConfig>(DEFAULT_STAGE_CONFIG)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [packages, setPackages] = useState<HubPackageView[]>([])
  const [selectedPackageKey, setSelectedPackageKey] = useState<PackageKey | null>(
    null
  )
  const [bootstrapped, setBootstrapped] = useState(false)

  const estimate = useMemo(() => estimateStage(config), [config])

  const hubPackages = useMemo(() => {
    const hubId = HUB_CODE_TO_ID[config.hub] as HubId | undefined
    if (!hubId) return []
    return packages.filter(
      (p) => p.destinationCode === HUB_ID_TO_CODE[hubId] || HUB_CODE_TO_ID[p.destinationCode] === hubId
    )
  }, [packages, config.hub])

  useEffect(() => {
    fetch(`/api/packages?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.packages)) setPackages(data.packages)
      })
      .catch(() => {})
  }, [locale])

  useEffect(() => {
    if (bootstrapped || packages.length === 0) return
    const hub = hubIdFromQuery(searchParams.get('hub'))
    const pkgKey = searchParams.get('package') as PackageKey | null
    if (hub) {
      setConfig((c) => ({ ...c, hub }))
    }
    if (hub && pkgKey) {
      const hubId = HUB_CODE_TO_ID[hub]
      const match = packages.find(
        (p) =>
          p.packageKey === pkgKey &&
          (p.destinationCode === hub ||
            HUB_CODE_TO_ID[p.destinationCode] === hubId)
      )
      if (match) {
        applyPackageToConfig(match)
        setSelectedPackageKey(match.packageKey)
        setStep(1)
      }
    }
    setBootstrapped(true)
  }, [packages, searchParams, bootstrapped])

  function patch<K extends keyof StageBuilderConfig>(
    key: K,
    value: StageBuilderConfig[K]
  ) {
    setConfig((c) => ({ ...c, [key]: value }))
  }

  function applyPackageToConfig(pkg: HubPackageView) {
    const hub =
      (Object.entries(HUB_ID_TO_CODE).find(
        ([, code]) => code === pkg.destinationCode
      )?.[0] as HubId | undefined) || HUB_CODE_TO_ID[pkg.destinationCode]
    const stageHub: StageHub =
      hub === 'barcelona' ? 'BCN' : hub === 'marbella' ? 'MAR' : 'ALG'

    setConfig((c) => ({
      ...c,
      hub: stageHub,
      nights: pkg.nights || c.nights,
      trainingHours: pkg.coachHours || c.trainingHours,
      matchHours: pkg.localMatchHours || c.matchHours,
      tournament: pkg.tournamentHours > 0,
      airportTransfer: true,
    }))
    setSelectedPackageKey(pkg.packageKey)
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
        body: JSON.stringify({
          config,
          packageKey: selectedPackageKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.builder.submitError)
        setSubmitting(false)
        return
      }
      setLeadId(data.leadId)
      setDone(true)
    } catch {
      setError(t.builder.networkError)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            {b.eyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold">
            {t.builder.title}
          </h1>
          <p className="mt-3 max-w-2xl text-app-white/65 text-sm md:text-base">
            {t.builder.lead}
          </p>

          {done ? (
            <div className="mt-12 max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <h2 className="text-2xl font-black">{b.sentTitle}</h2>
              <p className="text-sm text-app-white/70">
                {fillTemplate(b.sentBody, {
                  name: config.clientName ? `, ${config.clientName}` : '',
                  double: estimate.pricePerPlayerDouble.toLocaleString(numberLocale),
                  single: estimate.pricePerPlayerSingle.toLocaleString(numberLocale),
                  total: estimate.grandTotal.toLocaleString(numberLocale),
                })}
              </p>
              {leadId && (
                <p className="text-[11px] text-app-white/40">Ref. {leadId}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={withLocale("/eventos", locale)}
                  className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-navy"
                >
                  {b.seeEvents}
                </Link>
                <Link
                  href={withLocale("/", locale)}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold"
                >
                  {b.backHome}
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-10 max-w-3xl mx-auto space-y-6">
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
                      {i + 1}. {b.steps[i]}
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7 space-y-5">
                  {step === 0 && (
                    <>
                      <SectionTitle title={b.wherePlay} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {HUB_OPTIONS.map((h, i) => (
                          <ChoiceCard
                            key={h.value}
                            active={config.hub === h.value}
                            onClick={() => {
                              patch('hub', h.value)
                              setSelectedPackageKey(null)
                            }}
                            title={`${h.flag} ${b.hubs[i].label}`}
                            blurb={b.hubs[i].blurb}
                          />
                        ))}
                      </div>

                      {hubPackages.length > 0 ? (
                        <>
                          <SectionTitle title={b.readyPackages} />
                          <p className="text-xs text-app-white/50 -mt-2">
                            {b.readyPackagesHint}
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {hubPackages.map((pkg) => (
                              <button
                                key={pkg.id}
                                type="button"
                                onClick={() => applyPackageToConfig(pkg)}
                                className={`text-left rounded-xl border px-4 py-3 transition ${
                                  selectedPackageKey === pkg.packageKey
                                    ? 'border-gold/50 bg-gold/10'
                                    : 'border-white/10 bg-navy/40 hover:border-cyan/35'
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-bold text-white">
                                      {pkg.name}
                                      {pkg.featured ? (
                                        <span className="ml-2 text-[10px] text-gold uppercase tracking-wider">
                                          {b.featured}
                                        </span>
                                      ) : null}
                                    </p>
                                    <p className="text-[11px] text-app-white/50 mt-0.5">
                                      {pkg.duration} · {pkg.courtHours}{b.courtHoursShort}
                                      {lowestAvailablePrice(pkg.prices) != null
                                        ? ` · ${b.fromPrice} ${formatEuro(lowestAvailablePrice(pkg.prices)!)}`
                                        : ''}
                                    </p>
                                  </div>
                                  <span className="text-[11px] font-bold text-cyan">
                                    {b.useThis}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : null}

                      <SectionTitle title={b.groupType} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {GROUP_TYPE_OPTIONS.map((g, i) => (
                          <ChoiceCard
                            key={g.value}
                            active={config.groupType === g.value}
                            onClick={() => patch('groupType', g.value)}
                            title={b.groupTypes[i].label}
                            blurb={b.groupTypes[i].blurb}
                          />
                        ))}
                      </div>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                          {b.preferredMonth}
                        </span>
                        <select
                          className={inputCls}
                          value={config.month}
                          onChange={(e) => patch('month', e.target.value)}
                        >
                          {MONTH_OPTIONS.map((m, i) => (
                            <option key={m} value={m}>
                              {b.months[i]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <SectionTitle
                        title={b.groupSize}
                        icon={<Users className="w-4 h-4 text-cyan" />}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <NumberField
                          label={b.players}
                          value={config.players}
                          min={4}
                          max={40}
                          onChange={(v) => patch('players', v)}
                        />
                        <NumberField
                          label={b.companions}
                          value={config.companions}
                          min={0}
                          max={20}
                          onChange={(v) => patch('companions', v)}
                        />
                        <NumberField
                          label={b.nights}
                          value={config.nights}
                          min={2}
                          max={10}
                          onChange={(v) => patch('nights', v)}
                        />
                      </div>
                      <SectionTitle title={b.playLevel} />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LEVEL_OPTIONS.map((l, i) => (
                          <ChoiceCard
                            key={l.value}
                            active={config.playLevel === l.value}
                            onClick={() => patch('playLevel', l.value)}
                            title={b.levels[i]}
                            compact
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <SectionTitle
                        title={b.sportsProgram}
                        icon={<Trophy className="w-4 h-4 text-gold" />}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NumberField
                          label={b.trainingHours}
                          value={config.trainingHours}
                          min={0}
                          max={30}
                          onChange={(v) => patch('trainingHours', v)}
                        />
                        <NumberField
                          label={b.matchHours}
                          value={config.matchHours}
                          min={0}
                          max={30}
                          onChange={(v) => patch('matchHours', v)}
                        />
                      </div>
                      <ToggleRow
                        label={b.tournament}
                        description={b.tournamentDesc}
                        value={config.tournament}
                        onChange={(v) => patch('tournament', v)}
                        yesLabel={b.yes}
                        noLabel={b.no}
                      />
                      <SectionTitle title={b.lessonLang} />
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
                        title={b.hospitality}
                        icon={<Plane className="w-4 h-4 text-cyan" />}
                      />
                      <SectionTitle title={b.mealPlan} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {MEAL_OPTIONS.map((m, i) => (
                          <ChoiceCard
                            key={m.value}
                            active={config.mealPlan === m.value}
                            onClick={() => patch('mealPlan', m.value)}
                            title={b.meals[i].label}
                            blurb={b.meals[i].blurb}
                          />
                        ))}
                      </div>
                      <SectionTitle title={b.hotelCategory} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOTEL_STAR_OPTIONS.map((h, i) => (
                          <ChoiceCard
                            key={h.value}
                            active={config.hotelStars === h.value}
                            onClick={() => patch('hotelStars', h.value)}
                            title={b.hotels[i].label}
                            blurb={b.hotels[i].blurb}
                          />
                        ))}
                      </div>
                      <ToggleRow
                        label={b.airportTransfer}
                        description={b.airportTransferDesc}
                        value={config.airportTransfer}
                        onChange={(v) => patch('airportTransfer', v)}
                        yesLabel={b.yes}
                        noLabel={b.no}
                      />
                      <NumberField
                        label={b.singleRooms}
                        value={config.singleRooms}
                        min={0}
                        max={config.players}
                        onChange={(v) => patch('singleRooms', v)}
                      />
                      <p className="text-[11px] text-app-white/45 -mt-2">
                        {fillTemplate(b.doubleRoomsNote, {
                          n: String(Math.max(0, config.players - config.singleRooms)),
                        })}
                      </p>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                          {b.notes}
                        </span>
                        <textarea
                          className={inputCls}
                          rows={3}
                          value={config.notes}
                          onChange={(e) => patch('notes', e.target.value)}
                          placeholder={b.notesPlaceholder}
                        />
                      </label>
                    </>
                  )}

                  {step === 4 && (
                    <>
                      <SectionTitle title={b.summary} />
                      <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent p-5 md:p-6 space-y-4">
                        <p className="text-[10px] uppercase tracking-wider text-gold font-bold">
                          {b.yourChoices}
                        </p>
                        <div className="text-[11px] text-app-white/65 space-y-1">
                          <p>
                            {HUB_OPTIONS.find((h) => h.value === config.hub)?.flag}{' '}
                            {HUB_OPTIONS.find((h) => h.value === config.hub)?.label} ·
                            Hotel {config.hotelStars}★ · {config.month}
                          </p>
                          <p>
                            {config.players} {b.playersWord}
                            {config.companions
                              ? ` + ${config.companions} ${b.companionsWord}`
                              : ''}{' '}
                            · {config.nights} {b.nightsWord} · {config.singleRooms}{' '}
                            {b.singleRoomsWord}
                          </p>
                          <p>
                            {config.trainingHours}{b.trainingShort} · {config.matchHours}
                            {b.matchShort} · {config.mealPlan}
                            {config.tournament ? ` · ${b.tournamentShort}` : ''}
                            {config.airportTransfer ? ` · ${b.transferShort}` : ''}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 space-y-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-app-white/55">
                              {b.priceDouble}
                            </p>
                            <p className="text-3xl md:text-4xl font-black text-gold leading-none mt-1">
                              {estimate.pricePerPlayerDouble.toLocaleString(numberLocale)} €
                            </p>
                          </div>
                          <div className="flex justify-between items-end gap-3">
                            <p className="text-sm text-app-white/60">
                              {b.priceSingle}
                            </p>
                            <p className="text-xl font-black text-white">
                              {estimate.pricePerPlayerSingle.toLocaleString(numberLocale)} €
                            </p>
                          </div>
                          <div className="flex justify-between items-end gap-3">
                            <p className="text-sm text-app-white/60">{b.groupTotal}</p>
                            <p className="text-2xl font-black text-white">
                              {estimate.grandTotal.toLocaleString(numberLocale)} €
                            </p>
                          </div>
                        </div>

                        <p className="text-[11px] text-app-white/55 pt-1">
                          {b.estimateNote}
                        </p>
                      </div>
                    </>
                  )}

                  {step === 5 && (
                    <>
                      <SectionTitle title={b.yourDetails} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block space-y-1.5 sm:col-span-2">
                          <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                            {b.fullName}
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
                            {b.email}
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
                            {b.phone}
                          </span>
                          <input
                            className={inputCls}
                            value={config.clientPhone}
                            onChange={(e) => patch('clientPhone', e.target.value)}
                          />
                        </label>
                        <label className="block space-y-1.5 sm:col-span-2">
                          <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                            {b.clubCompany}
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
                      <ArrowLeft className="w-3.5 h-3.5" /> {b.back}
                    </button>
                    {step < BUILDER_STEPS.length - 1 ? (
                      <button
                        type="button"
                        disabled={!canNext()}
                        onClick={() => setStep((s) => s + 1)}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-xs font-bold text-navy disabled:opacity-40"
                      >
                        {b.next} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canNext() || submitting}
                        onClick={submit}
                        className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-navy disabled:opacity-40"
                      >
                        {submitting ? b.submitting : b.submit}
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
  yesLabel = 'Sim',
  noLabel = 'Não',
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  yesLabel?: string
  noLabel?: string
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
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
            !value ? 'bg-rose-500/80 text-white' : 'bg-white/5 text-app-white/50'
          }`}
        >
          {noLabel}
        </button>
      </div>
    </div>
  )
}
