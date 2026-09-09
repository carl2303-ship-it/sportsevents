import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BrandLogo } from '@/components/brand-logo'
import { BookingForm } from './booking-form'
import {
  Building2,
  Calendar,
  Gift,
  Hotel,
  MapPin,
  Trophy,
  Users,
  Utensils,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: bySlug } = await supabase
    .from('events')
    .select('*, destinations(name), sports(name)')
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle()

  let event = bySlug
  if (!event && /^[0-9a-f-]{36}$/i.test(slug)) {
    const { data: byId } = await supabase
      .from('events')
      .select('*, destinations(name), sports(name)')
      .eq('published', true)
      .eq('id', slug)
      .maybeSingle()
    event = byId
  }

  if (!event) notFound()

  const max = Number(event.max_participants || event.group_size || 16)
  const sale = Number(event.sale_price_per_person || 0)
  const deposit = Number(event.deposit_amount || 0)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-5 md:px-10 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <BrandLogo variant="full" className="h-12 w-auto" />
          <Link
            href="/eventos"
            className="text-xs text-slate-400 hover:text-cyan-400"
          >
            ← Todos os eventos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
            {event.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-slate-900 to-amber-500/15" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-400 font-semibold">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.destinations?.name}
              </span>
              <span>·</span>
              <span>{event.sports?.name || 'Padel'}</span>
            </div>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl font-extrabold">
              {event.title}
            </h1>
            {event.short_description && (
              <p className="mt-3 text-slate-300 text-base">{event.short_description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {event.start_date} → {event.end_date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Até {max} participantes
              </span>
            </div>
          </div>

          {event.description && (
            <Section title="Sobre o evento">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </Section>
          )}

          <Section title="Campos de padel">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center max-w-md">
              <Stat label="Campos padel" value={event.courts_padel || 0} icon={<Trophy className="w-4 h-4" />} />
              {(event.courts_other || 0) > 0 && (
                <Stat label="Outros" value={event.courts_other || 0} icon={<Building2 className="w-4 h-4" />} />
              )}
            </div>
            {event.courts_notes && (
              <p className="mt-3 text-xs text-slate-400">{event.courts_notes}</p>
            )}
          </Section>

          {(event.hotel_name || event.restaurants || event.coaches) && (
            <Section title="Operações & hospitality">
              <div className="space-y-3 text-sm text-slate-300">
                {event.hotel_name && (
                  <div className="flex gap-2">
                    <Hotel className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">{event.hotel_name}</div>
                      {event.hotel_details && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {event.hotel_details}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {event.restaurants && (
                  <div className="flex gap-2">
                    <Utensils className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="whitespace-pre-wrap">{event.restaurants}</div>
                  </div>
                )}
                {event.coaches && (
                  <div className="flex gap-2">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="whitespace-pre-wrap">{event.coaches}</div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {event.welcome_pack && (
            <Section title="Welcome pack">
              <div className="flex gap-2 text-sm text-slate-300">
                <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap">{event.welcome_pack}</p>
              </div>
            </Section>
          )}

          {event.program && (
            <Section title="Programa completo">
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {event.program}
              </p>
            </Section>
          )}

          {event.highlights && (
            <Section title="Destaques">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {event.highlights}
              </p>
            </Section>
          )}

          {event.includes && (
            <Section title="Inclui">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {event.includes}
              </p>
            </Section>
          )}
        </div>

        <aside className="lg:col-span-2 lg:sticky lg:top-6 h-fit space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Preço / pessoa
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {sale.toLocaleString('pt-PT')} €
            </div>
            {deposit > 0 && (
              <p className="text-xs text-amber-400 mt-2">
                Ou reserva agora por {deposit.toLocaleString('pt-PT')} € / pessoa
              </p>
            )}
          </div>
          <BookingForm
            eventId={event.id}
            salePrice={sale}
            depositAmount={deposit}
            maxParticipants={max}
          />
        </aside>
      </main>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-black text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
      <div className="flex justify-center text-cyan-400 mb-1">{icon}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-[10px] uppercase text-slate-500 font-semibold">
        {label}
      </div>
    </div>
  )
}
