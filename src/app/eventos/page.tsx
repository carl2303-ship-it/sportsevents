import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BrandLogo } from '@/components/brand-logo'
import { Calendar, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventosPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*, destinations(name), sports(name)')
    .eq('published', true)
    .order('start_date', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-5 md:px-10 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <BrandLogo variant="full" className="h-12 w-auto" />
          <Link href="/" className="text-xs text-slate-400 hover:text-cyan-400">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 md:px-10 py-10 space-y-8">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400">
            Iberian Sports Experiences
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold">
            Eventos & Camps
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400 text-sm md:text-base">
            Algarve · Marbella · Barcelona. Reserva online com Stripe — paga só a
            reserva ou o valor completo.
          </p>
        </div>

        {!events?.length ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-500">
            Ainda não há eventos publicados. Volta em breve.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug || event.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-cyan-500/40 transition-all"
              >
                <div className="aspect-[16/9] bg-slate-950 relative">
                  {event.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.cover_image_url}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-amber-500/10" />
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.destinations?.name || 'Hub'} · {event.sports?.name || 'Padel'}
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                    {event.title}
                  </h2>
                  {event.short_description && (
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {event.short_description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {event.start_date} → {event.end_date}
                    </span>
                    <span className="font-black text-emerald-400">
                      desde {Number(event.sale_price_per_person || 0).toLocaleString('pt-PT')} €
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
