'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { CheckCircle2 } from 'lucide-react'
import { withLocale } from '@/i18n/config'
import { fillTemplate } from '@/i18n/dictionaries'
import { useDictionary } from '@/i18n/use-locale'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { locale, t } = useDictionary()
  const e = t.events
  const numberLocale = locale === 'en' ? 'en-GB' : 'pt-PT'
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [booking, setBooking] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setMessage(e.missingSession)
      return
    }
    fetch(`/api/bookings/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || e.successError)
        setBooking(data.booking)
        setStatus('ok')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || e.successError)
      })
  }, [sessionId, e.missingSession, e.successError])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-slate-800 px-5 md:px-10 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <BrandLogo
            variant="full"
            href={withLocale('/', locale)}
            className="h-10 w-auto"
          />
          <Link
            href={withLocale('/eventos', locale)}
            className="text-xs text-slate-400 hover:text-cyan-400"
          >
            {e.eventsLink}
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-slate-400">{e.successLoading}</p>
          )}
          {status === 'ok' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-black">{e.successTitle}</h1>
              <p className="text-sm text-slate-400">
                {fillTemplate(e.successThanks, {
                  name: booking?.customer_name
                    ? `, ${booking.customer_name}`
                    : '',
                })}
              </p>
              {booking?.events && (
                <div className="text-left text-xs bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="font-bold text-white">
                    {booking.events.title}
                  </div>
                  <div className="text-slate-400">
                    {booking.events.start_date} → {booking.events.end_date}
                  </div>
                  <div className="text-slate-400">
                    {booking.participants} pax ·{' '}
                    {booking.payment_type === 'FULL'
                      ? e.fullPayment
                      : e.depositPayment}{' '}
                    · {Number(booking.amount).toLocaleString(numberLocale)} €
                  </div>
                </div>
              )}
              <Link
                href={withLocale('/eventos', locale)}
                className="inline-flex rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs px-4 py-2"
              >
                {e.seeMore}
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-xl font-black text-red-400">
                {e.somethingFailed}
              </h1>
              <p className="text-sm text-slate-400">{message}</p>
              <Link
                href={withLocale('/eventos', locale)}
                className="text-xs text-cyan-400"
              >
                {e.backToEvents}
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function EventoSucessoPage() {
  const { t } = useDictionary()
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center text-sm">
          {t.events.loading}
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
