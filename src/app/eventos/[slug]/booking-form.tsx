'use client'

import { FormEvent, useState } from 'react'
import { numberLocaleFor } from '@/i18n/config'
import { fillTemplate } from '@/i18n/dictionaries'
import { useDictionary } from '@/i18n/use-locale'

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
  const { locale, t } = useDictionary()
  const e = t.events
  const numberLocale = numberLocaleFor(locale)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [participants, setParticipants] = useState(2)
  const [customerCountry, setCustomerCountry] = useState('')
  const [ageBand, setAgeBand] = useState('')
  const [genderMix, setGenderMix] = useState('')
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'FULL'>(
    depositAmount > 0 ? 'DEPOSIT' : 'FULL'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unit = paymentType === 'FULL' ? salePrice : depositAmount || salePrice
  const total = unit * participants

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
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
          customerCountry: customerCountry || undefined,
          ageBand: ageBand || undefined,
          genderMix: genderMix || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || e.checkoutError)
        setLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setError(e.networkError)
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
    >
      <div>
        <h2 className="text-lg font-black text-white">{e.bookTitle}</h2>
        <p className="text-xs text-slate-500 mt-1">{e.bookLead}</p>
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
          {e.depositOnly}
          <div className="text-[10px] font-semibold opacity-80">
            {depositAmount > 0 ? `${depositAmount} € / pax` : 'N/A'}
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
          {e.fullAmount}
          <div className="text-[10px] font-semibold opacity-80">
            {salePrice} € / pax
          </div>
        </button>
      </div>

      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          {e.fullName}
        </span>
        <input
          required
          value={customerName}
          onChange={(ev) => setCustomerName(ev.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          {e.email}
        </span>
        <input
          required
          type="email"
          value={customerEmail}
          onChange={(ev) => setCustomerEmail(ev.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          {e.phone}
        </span>
        <input
          value={customerPhone}
          onChange={(ev) => setCustomerPhone(ev.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>
      <label className="block space-y-1 text-xs">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          {fillTemplate(e.participants, { n: String(maxParticipants) })}
        </span>
        <input
          required
          type="number"
          min={1}
          max={maxParticipants}
          value={participants}
          onChange={(ev) => setParticipants(Number(ev.target.value))}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="block space-y-1 text-xs">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            {e.customerCountry}
          </span>
          <select
            required
            value={customerCountry}
            onChange={(ev) => setCustomerCountry(ev.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
          >
            <option value="">{e.selectOption}</option>
            <option value="PT">Portugal</option>
            <option value="ES">España / Espanha</option>
            <option value="FR">France</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Deutschland</option>
            <option value="IT">Italia</option>
            <option value="BE">België / Belgique</option>
            <option value="CH">Schweiz / Suisse</option>
            <option value="NL">Nederland</option>
            <option value="IE">Ireland</option>
            <option value="BR">Brasil</option>
            <option value="US">USA</option>
          </select>
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            {e.ageBand}
          </span>
          <select
            required
            value={ageBand}
            onChange={(ev) => setAgeBand(ev.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
          >
            <option value="">{e.selectOption}</option>
            <option value="U18">{e.ageU18}</option>
            <option value="18-25">18–25</option>
            <option value="26-35">26–35</option>
            <option value="36-45">36–45</option>
            <option value="46-55">46–55</option>
            <option value="55+">{e.age55plus}</option>
          </select>
        </label>
        <label className="block space-y-1 text-xs">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            {e.genderMix}
          </span>
          <select
            required
            value={genderMix}
            onChange={(ev) => setGenderMix(ev.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
          >
            <option value="">{e.selectOption}</option>
            <option value="MALE">{e.genderMale}</option>
            <option value="FEMALE">{e.genderFemale}</option>
            <option value="MIXED">{e.genderMixed}</option>
            <option value="OTHER">{e.genderOther}</option>
          </select>
        </label>
      </div>

      <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 flex justify-between items-center">
        <span className="text-xs text-slate-400">{e.totalNow}</span>
        <span className="text-xl font-black text-emerald-400">
          {total.toLocaleString(numberLocale)} €
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
        {loading ? e.redirecting : e.payStripe}
      </button>
    </form>
  )
}
