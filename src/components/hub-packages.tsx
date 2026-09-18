import Link from 'next/link'
import {
  formatEuro,
  HUB_LABELS,
  availableMealPlans,
  isPriceAvailable,
  mealPlanPrices,
  type HubId,
  type HubPackageView,
  type MealPlanKey,
} from '@/lib/hub-packages'
import { withLocale, type Locale } from '@/i18n/config'
import { fillTemplate, getDictionary } from '@/i18n/dictionaries'

function Specs({
  pkg,
  labels,
}: {
  pkg: HubPackageView
  labels: {
    courtTotal: string
    coachHours: string
    localMatch: string
    tournament: string
  }
}) {
  const items = [
    { label: labels.courtTotal, value: `${pkg.courtHours}h` },
    { label: labels.coachHours, value: `${pkg.coachHours}h` },
    { label: labels.localMatch, value: `${pkg.localMatchHours}h` },
    { label: labels.tournament, value: `${pkg.tournamentHours}h` },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-l border-cyan/35 pl-3">
          <dt className="text-[10px] uppercase tracking-wider text-app-white/45">
            {item.label}
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-cyan">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function PriceTable({
  pkg,
  locale,
}: {
  pkg: HubPackageView
  locale: Locale
}) {
  const t = getDictionary(locale).packages
  const plans = availableMealPlans(pkg.prices)
  if (plans.length === 0) {
    return <p className="text-sm text-app-white/50">{t.pricesOnRequest}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-app-white/45">
            <th className="py-2 pr-3 font-semibold">{t.lodging}</th>
            <th className="py-2 px-3 font-semibold">{t.double}</th>
            <th className="py-2 pl-3 font-semibold">{t.single}</th>
          </tr>
        </thead>
        <tbody className="text-app-white/80">
          {plans.map((plan: MealPlanKey) => {
            const { double, single } = mealPlanPrices(pkg.prices, plan)
            const meta = t.mealPlans[plan]
            const accent = plan === 'full' ? 'text-gold' : 'text-white'
            return (
              <tr
                key={plan}
                className="border-b border-white/5 last:border-0"
              >
                <td className="py-3 pr-3">
                  {meta.label}
                  <span className="block text-[11px] text-app-white/40">
                    {meta.blurb}
                  </span>
                </td>
                <td className={`py-3 px-3 font-bold ${accent}`}>
                  {isPriceAvailable(double) ? formatEuro(double) : '—'}
                </td>
                <td className={`py-3 pl-3 font-bold ${accent}`}>
                  {isPriceAvailable(single) ? formatEuro(single) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-app-white/40">{t.pricesNote}</p>
    </div>
  )
}

export function HubPackagesSection({
  hubId,
  packages,
  otherLinks,
  locale = 'en',
}: {
  hubId: HubId
  packages: HubPackageView[]
  otherLinks: { href: string; label: string }[]
  locale?: Locale
}) {
  const t = getDictionary(locale).packages
  const hubLabel = HUB_LABELS[hubId]
  const meta = packages[0]
  const airport = meta?.airportLabel || ''
  const localNetwork = meta?.localNetwork || ''
  const routine = meta?.routine || []
  const inclusions = meta?.inclusions || []

  if (packages.length === 0) {
    return (
      <section className="px-5 md:px-10 py-16 md:py-24 border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold">
            {fillTemplate(t.emptyTitle, { hub: hubLabel })}
          </h2>
          <p className="mt-3 text-app-white/60 text-sm">{t.emptyText}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="px-5 md:px-10 py-16 md:py-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl space-y-16 md:space-y-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            {t.sectionEyebrow} · {hubLabel}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold max-w-3xl">
            {t.sectionTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-app-white/65 text-sm md:text-base leading-relaxed">
            {t.sectionLeadBefore}
            {airport ? (
              <>
                .{' '}
                {fillTemplate(t.sectionLeadAirport, {
                  hub: hubLabel,
                  airport,
                })}
              </>
            ) : null}
            {localNetwork ? (
              <>
                .{' '}
                {fillTemplate(t.sectionLeadNetwork, {
                  network: localNetwork,
                })}
              </>
            ) : null}
            .
          </p>
        </div>

        {(routine.length > 0 || inclusions.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {routine.length > 0 ? (
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-cyan">
                  {t.dailyRoutine}
                </h3>
                <ul className="mt-6 space-y-5">
                  {routine.map((item) => (
                    <li key={item.title} className="border-l border-gold/40 pl-4">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-app-white/60 leading-relaxed">
                        {/^(Tarde|Afternoon)/i.test(item.title) && localNetwork
                          ? fillTemplate(t.afternoonLocal, {
                              network: localNetwork,
                            })
                          : item.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {inclusions.length > 0 ? (
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-cyan">
                  {t.baseInclusions}
                </h3>
                <ul className="mt-6 space-y-3">
                  {inclusions.map((line) => (
                    <li
                      key={line}
                      className="text-sm text-app-white/70 leading-relaxed flex gap-2"
                    >
                      <span className="text-gold shrink-0">▸</span>
                      <span>
                        {airport &&
                        /aeroporto|airport/i.test(line) &&
                        /transfer/i.test(line)
                          ? fillTemplate(t.transferLine, { airport })
                          : line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        <div className="space-y-10">
          <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-extrabold">
            {fillTemplate(t.packagesInHub, { hub: hubLabel })}
          </h3>

          {packages.map((pkg) => (
            <article
              key={pkg.id}
              id={`pacote-${pkg.packageKey}`}
              className={`rounded-2xl border p-6 md:p-8 ${
                pkg.featured
                  ? 'border-gold/45 bg-gold/[0.06]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
                      {pkg.duration}
                      {pkg.schedule ? ` · ${pkg.schedule}` : ''}
                    </p>
                    {pkg.featured ? (
                      <span className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                        {t.featured}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-2 font-[family-name:var(--font-display)] text-2xl md:text-3xl font-extrabold">
                    {pkg.name}
                  </h4>
                  <p className="mt-2 max-w-3xl text-sm text-app-white/65 leading-relaxed">
                    {pkg.concept}
                  </p>
                </div>
                <Link
                  href={withLocale(
                    `/construir?hub=${hubId}&package=${pkg.packageKey}`,
                    locale
                  )}
                  className="inline-flex rounded-full bg-gold px-5 py-2.5 text-xs font-bold text-navy hover:brightness-110 transition shrink-0"
                >
                  {t.requestQuote}
                </Link>
              </div>

              <div className="mt-8">
                <Specs
                  pkg={pkg}
                  labels={{
                    courtTotal: t.courtTotal,
                    coachHours: t.coachHours,
                    localMatch: t.localMatch,
                    tournament: t.tournament,
                  }}
                />
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-app-white/40 font-bold mb-3">
                    {t.itinerary}
                  </p>
                  <ol className="space-y-3">
                    {pkg.itinerary.map((step) => (
                      <li
                        key={`${step.day}-${step.detail.slice(0, 24)}`}
                        className="text-sm"
                      >
                        <span className="font-bold text-cyan">{step.day}</span>
                        <span className="text-app-white/60">
                          {' '}
                          — {step.detail}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-app-white/40 font-bold mb-3">
                    {t.pricesPerPerson}
                  </p>
                  <PriceTable pkg={pkg} locale={locale} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href={withLocale('/construir', locale)}
            className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy hover:brightness-110 transition"
          >
            {t.buildStage}
          </Link>
          <Link
            href={withLocale('/contacto', locale)}
            className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-app-white/80 hover:border-cyan/50 hover:text-cyan transition"
          >
            {t.talkToUs}
          </Link>
          {otherLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-app-white/80 hover:border-cyan/50 hover:text-cyan transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
