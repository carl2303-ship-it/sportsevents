import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { Calendar, MapPin } from 'lucide-react'
import { withLocale, numberLocaleFor } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLocale } from '@/i18n/get-locale'

export const dynamic = 'force-dynamic'

export default async function EventosPage() {
  const locale = await getLocale()
  const t = getDictionary(locale).events
  const numberLocale = numberLocaleFor(locale)
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, destinations(name), sports(name)')
    .eq('published', true)
    .order('start_date', { ascending: true })

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 md:px-10 py-10 space-y-8">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan">
            {t.eyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold">
            {t.title}
          </h1>
          <p className="mt-3 max-w-2xl text-app-white/65 text-sm md:text-base">
            {t.lead}
          </p>
        </div>

        {!events?.length ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-app-white/50">
            {t.empty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <Link
                key={event.id}
                href={withLocale(
                  `/eventos/${event.slug || event.id}`,
                  locale
                )}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-cyan/40 transition-all"
              >
                <div className="aspect-[16/9] bg-navy relative">
                  {event.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.cover_image_url}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-navy to-gold/10" />
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-cyan font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.destinations?.name || 'Hub'} ·{' '}
                    {event.sports?.name || 'Padel'}
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan transition">
                    {event.title}
                  </h2>
                  {event.short_description && (
                    <p className="text-sm text-app-white/60 line-clamp-2">
                      {event.short_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <span className="inline-flex items-center gap-1.5 text-app-white/55">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.start_date} → {event.end_date}
                    </span>
                    <span className="font-black text-emerald-400">
                      {t.from}{' '}
                      {Number(event.sale_price_per_person || 0).toLocaleString(
                        numberLocale
                      )}{' '}
                      €
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
