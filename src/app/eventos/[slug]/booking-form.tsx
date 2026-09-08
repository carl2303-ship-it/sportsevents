'use client'

import { FormEvent, useState } from 'react'

export function BookingForm({
  eventId,
  salePrice,
  depositAmount,
  maxParticipants,
}: {
  eventId: string
  salePrice: number
  depositAmount: number
  maxParticipants: number
}) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [participants, setParticipants] = useState(2)
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'FULL'>(
    depositAmount > 0 ? 'DEPOSIT' : 'FULL'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unit = paymentType === 'FULL' ? salePrice : depositAmount || salePrice
  const total = unit * participants

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          customerName,
          customerEmail,
          customerPhone,
          participants,
          paymentType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Não foi possível iniciar o pagamento.')
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError('Erro de rede ao contactar o checkout.')
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
    >
      <div>
        <h2 className="text-lg font-black text-white">Reservar agora</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pagamento seguro via Stripe — reserva ou valor completo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPaymentType('DEPOSIT')}
          disabled={!depositAmount}
          className={`rounded-xl px-3 py-2.5 text-xs font-bold border transition ${
            paymentType === 'DEPOSIT'
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-950 text-slate-400 border-slate-700'
          } disabled:opacity-40`}
        >
          Só reserva
          <div className="text-[10px] font-semibold opacity-80">
            {depositAmount > 0 ? `${depositAmount} € / pax` : 'N/D'}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setPaymentType('FULL')}
          className={`rounded-xl px-3 py-2.5 text-xs font-bold border transition ${
            paymentType === 'FULL'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-slate-950 text-slate-400 border-slate-700'
          }`}
        >
          Valor completo
          <div className="text-[10px] font-semibold opacity-80">
            {salePrice} € / pax
          </div>
        </button>
      </div>

      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          Nome completo
        </span>
        <input
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          Email
        </span>
        <input
          required
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          Telefone
        </span>
        <input
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          Nº participantes (máx. {maxParticipants})
        </span>
        <input
          required
          type="number"
          min={1}
          max={maxParticipants}
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>

      <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 flex justify-between items-center">
        <span className="text-xs text-slate-400">Total a pagar agora</span>
        <span className="text-xl font-black text-emerald-400">
          {total.toLocaleString('pt-PT')} €
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm py-3"
      >
        {loading ? 'A redirecionar para Stripe...' : 'Pagar com Stripe'}
      </button>
    </form>
  )
}
