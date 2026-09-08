'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { CheckCircle2 } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [booking, setBooking] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setMessage('Sessão Stripe em falta.')
      return
    }
    fetch(`/api/bookings/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro')
        setBooking(data.booking)
        setStatus('ok')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Não foi possível confirmar o pagamento.')
      })
  }, [sessionId])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-slate-800 px-5 md:px-10 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <BrandLogo variant="full" className="h-10 w-auto" />
          <Link href="/eventos" className="text-xs text-slate-400 hover:text-cyan-400">
            Eventos
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-slate-400">A confirmar pagamento...</p>
          )}
          {status === 'ok' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-black">Reserva confirmada</h1>
              <p className="text-sm text-slate-400">
                Obrigado{booking?.customer_name ? `, ${booking.customer_name}` : ''}.
                Recebemos o pagamento via Stripe.
              </p>
              {booking?.events && (
                <div className="text-left text-xs bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="font-bold text-white">{booking.events.title}</div>
                  <div className="text-slate-400">
                    {booking.events.start_date} → {booking.events.end_date}
                  </div>
                  <div className="text-slate-400">
                    {booking.participants} pax · {booking.payment_type === 'FULL' ? 'Completo' : 'Depósito'} ·{' '}
                    {Number(booking.amount).toLocaleString('pt-PT')} €
                  </div>
                </div>
              )}
              <Link
                href="/eventos"
                className="inline-flex rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs px-4 py-2"
              >
                Ver mais eventos
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <h1 className="text-xl font-black text-red-400">Algo falhou</h1>
              <p className="text-sm text-slate-400">{message}</p>
              <Link href="/eventos" className="text-xs text-cyan-400">
                Voltar aos eventos
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default function EventoSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-500 flex items-center justify-center text-sm">
          A carregar...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
