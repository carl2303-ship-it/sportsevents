'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import { CheckCircle2 } from 'lucide-react'
import { withLocale, numberLocaleFor } from '@/i18n/config'
import { fillTemplate } from '@/i18n/dictionaries'
import { useDictionary } from '@/i18n/use-locale'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { locale, t } = useDictionary()
  const e = t.events
  const numberLocale = numberLocaleFor(locale)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      const id = window.setTimeout(() => {
        setStatus('error')
        setMessage(e.missingSession)
      }, 0)
      return () => window.clearTimeout(id)
    }
    let cancelled = false
    fetch(`/api/bookings/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || e.successError)
        if (cancelled) return
        setBooking(data.booking)
        setStatus('ok')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setMessage(err.message || e.successError)
      })
    return () => {
      cancelled = true
    }
  }, [sessionId, e.missingSession, e.successError])

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-app-white/55">{e.successLoading}</p>
          )}
          {status === 'ok' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-black">{e.successTitle}</h1>
              <p className="text-sm text-app-white/60">
                {fillTemplate(e.successThanks, {
                  name: booking?.customer_name
                    ? `, ${String(booking.customer_name)}`
                    : '',
                })}
              </p>
              {booking?.events && typeof booking.events === 'object' ? (
                <div className="text-left text-xs bg-black/30 border border-white/10 rounded-xl p-4 space-y-1">
                  <div className="font-bold text-white">
                    {String((booking.events as Record<string, unknown>).title || '')}
                  </div>
                  <div className="text-app-white/55">
                    {String((booking.events as Record<string, unknown>).start_date || '')}{' '}
                    →{' '}
                    {String((booking.events as Record<string, unknown>).end_date || '')}
                  </div>
                  <div className="text-app-white/55">
                    {String(booking.participants ?? '')} pax ·{' '}
                    {booking.payment_type === 'FULL'
                      ? e.fullPayment
                      : e.depositPayment}{' '}
                    · {Number(booking.amount).toLocaleString(numberLocale)} €
                  </div>
                </div>
              ) : null}
              <Link
                href={withLocale('/eventos', locale)}
                className="inline-flex rounded-xl bg-cyan text-navy font-bold text-xs px-4 py-2"
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
              <p className="text-sm text-app-white/55">{message}</p>
              <Link
                href={withLocale('/eventos', locale)}
                className="text-xs text-cyan"
              >
                {e.backToEvents}
              </Link>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function EventoSucessoPage() {
  const { t } = useDictionary()
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy text-app-white/50 flex items-center justify-center text-sm">
          {t.events.loading}
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
