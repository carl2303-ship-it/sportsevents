'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useStoreCart } from '@/components/store/cart-context'
import { getBoostStoreBrowserClient } from '@/lib/boost-store/client'
import {
  BOOST_SUPABASE_ANON_KEY,
  boostEdgeCheckoutUrl,
} from '@/lib/boost-store/config'
import { formatEuro } from '@/lib/boost-store/products'
import { withLocale, type Locale } from '@/i18n/config'

type ShippingOption = { name: string; cost: number; days: string }

type CheckoutCopy = {
  empty: string
  continueShopping: string
  title: string
  orderSummary: string
  subtotal: string
  shipping: string
  total: string
  remove: string
  customer: string
  name: string
  email: string
  phone: string
  nif: string
  address: string
  postal: string
  city: string
  country: string
  notes: string
  placeOrder: string
  processing: string
  selectShipping: string
  paymentSuccess: string
  paymentCanceled: string
  backToStore: string
  shipDigital: string
  shipDigitalDays: string
  shipFree: string
  shipStandard: string
  shipExpress: string
  days35: string
  days12: string
  days57: string
  days47: string
  days710: string
  countryPt: string
  countryPtIslands: string
  countryEs: string
  countryEu: string
  countryWorld: string
  errorGeneric: string
}

function shippingOptionsFor(
  country: string,
  subtotal: number,
  digitalOnly: boolean,
  c: CheckoutCopy
): ShippingOption[] {
  if (digitalOnly) {
    return [{ name: c.shipDigital, cost: 0, days: c.shipDigitalDays }]
  }
  switch (country) {
    case 'PT_CONTINENTAL':
      if (subtotal >= 100) {
        return [{ name: c.shipFree, cost: 0, days: c.days35 }]
      }
      return [
        { name: c.shipStandard, cost: 4.95, days: c.days35 },
        { name: c.shipExpress, cost: 9.95, days: c.days12 },
      ]
    case 'PT_ISLANDS':
      if (subtotal >= 100) {
        return [{ name: c.shipFree, cost: 0, days: c.days57 }]
      }
      return [{ name: c.shipStandard, cost: 9.95, days: c.days57 }]
    case 'ES':
      if (subtotal >= 100) {
        return [{ name: c.shipFree, cost: 0, days: c.days47 }]
      }
      return [
        { name: c.shipStandard, cost: 7.95, days: c.days47 },
        { name: c.shipExpress, cost: 14.95, days: c.days12 },
      ]
    case 'EU':
      return [{ name: c.shipStandard, cost: 14.95, days: c.days710 }]
    default:
      return [{ name: c.shipStandard, cost: 24.95, days: c.days710 }]
  }
}

export function CheckoutClient({
  locale,
  numberLocale,
  copy,
}: {
  locale: Locale
  numberLocale: string
  copy: CheckoutCopy
}) {
  const { items, subtotal, removeItem, clear, ready } = useStoreCart()
  const [country, setCountry] = useState('PT_CONTINENTAL')
  const [shippingIdx, setShippingIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successFlash, setSuccessFlash] = useState(false)

  const digitalOnly =
    items.length > 0 && items.every((i) => i.type === 'digital')

  const options = useMemo(
    () => shippingOptionsFor(country, subtotal, digitalOnly, copy),
    [country, subtotal, digitalOnly, copy]
  )

  const shipping = options[Math.min(shippingIdx, options.length - 1)] || options[0]
  const total = Math.max(0, subtotal + (shipping?.cost || 0))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      clear()
      setSuccessFlash(true)
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('canceled') === 'true') {
      setError(copy.paymentCanceled)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [clear, copy.paymentCanceled])

  if (!ready) {
    return <p className="text-sm text-app-white/50">…</p>
  }

  if (successFlash) {
    return (
      <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-8 text-center space-y-4">
        <p className="text-lg font-bold text-white">{copy.paymentSuccess}</p>
        <Link
          href={withLocale('/store', locale)}
          className="inline-flex text-cyan hover:underline"
        >
          {copy.backToStore}
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-10 text-center space-y-4">
        <p className="text-app-white/60">{copy.empty}</p>
        <Link
          href={withLocale('/store', locale)}
          className="inline-flex rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy"
        >
          {copy.continueShopping}
        </Link>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!shipping) {
      setError(copy.selectShipping)
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    setBusy(true)

    try {
      const supabase = getBoostStoreBrowserClient()
      const orderNumber =
        'SE-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 11).toUpperCase()

      const orderData = {
        order_number: orderNumber,
        customer_name: String(fd.get('name') || ''),
        customer_email: String(fd.get('email') || ''),
        customer_phone: String(fd.get('phone') || ''),
        customer_nif: String(fd.get('nif') || '') || null,
        shipping_address: String(fd.get('address') || ''),
        postal_code: String(fd.get('postal') || ''),
        city: String(fd.get('city') || ''),
        country: country,
        shipping_method: shipping.name,
        shipping_cost: shipping.cost,
        payment_method: 'stripe',
        notes: String(fd.get('notes') || '') || null,
        items,
        subtotal,
        total,
        status: 'pending',
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw new Error(orderError.message)

      const origin =
        typeof window !== 'undefined' ? window.location.origin : 'https://sportsevents.app'
      const checkoutPath = withLocale('/store/checkout', locale)

      const response = await fetch(boostEdgeCheckoutUrl('/create-checkout-session'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${BOOST_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          apikey: BOOST_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          items,
          customerEmail: orderData.customer_email,
          customerName: orderData.customer_name,
          shippingMethod: { name: shipping.name, cost: shipping.cost },
          orderId: order.id,
          language: locale,
          successUrl: `${origin}${checkoutPath}?success=true&order_id=${order.id}`,
          cancelUrl: `${origin}${checkoutPath}?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      if (!result.url) throw new Error(copy.errorGeneric)
      window.location.href = result.url
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : copy.errorGeneric)
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={onSubmit} className="space-y-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
          {copy.customer}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label={copy.name} required />
          <Field name="email" label={copy.email} type="email" required />
          <Field name="phone" label={copy.phone} required />
          <Field name="nif" label={copy.nif} />
          <Field name="address" label={copy.address} className="sm:col-span-2" required />
          <Field name="postal" label={copy.postal} required />
          <Field name="city" label={copy.city} required />
        </div>

        <label className="block space-y-1.5 text-sm">
          <span className="text-app-white/60">{copy.country}</span>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
              setShippingIdx(0)
            }}
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-app-white outline-none focus:border-cyan"
          >
            <option value="PT_CONTINENTAL">{copy.countryPt}</option>
            <option value="PT_ISLANDS">{copy.countryPtIslands}</option>
            <option value="ES">{copy.countryEs}</option>
            <option value="EU">{copy.countryEu}</option>
            <option value="WORLD">{copy.countryWorld}</option>
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm text-app-white/60">{copy.shipping}</legend>
          {options.map((opt, idx) => (
            <label
              key={`${opt.name}-${idx}`}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm has-[:checked]:border-cyan/50"
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingIdx === idx}
                  onChange={() => setShippingIdx(idx)}
                />
                <span>
                  {opt.name}
                  <span className="ml-2 text-app-white/40">({opt.days})</span>
                </span>
              </span>
              <span className="font-semibold text-cyan">
                {formatEuro(opt.cost, numberLocale)}
              </span>
            </label>
          ))}
        </fieldset>

        <label className="block space-y-1.5 text-sm">
          <span className="text-app-white/60">{copy.notes}</span>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-app-white outline-none focus:border-cyan"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gold px-6 py-3.5 text-sm font-extrabold text-navy transition hover:bg-gold/90 disabled:opacity-50"
        >
          {busy ? copy.processing : copy.placeOrder}
        </button>
      </form>

      <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-black/25 p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          {copy.orderSummary}
        </h2>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 border-b border-white/5 pb-3"
            >
              <div>
                <p className="font-medium text-white">
                  {item.name} ×{item.quantity}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="mt-1 text-xs text-app-white/40 hover:text-red-400"
                >
                  {copy.remove}
                </button>
              </div>
              <span className="shrink-0 font-semibold">
                {formatEuro(item.price * item.quantity, numberLocale)}
              </span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 text-sm">
          <Row label={copy.subtotal} value={formatEuro(subtotal, numberLocale)} />
          <Row
            label={copy.shipping}
            value={formatEuro(shipping?.cost || 0, numberLocale)}
          />
          <Row
            label={copy.total}
            value={formatEuro(total, numberLocale)}
            strong
          />
        </div>
      </aside>
    </div>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  className = '',
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <label className={`block space-y-1.5 text-sm ${className}`}>
      <span className="text-app-white/60">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-app-white outline-none focus:border-cyan"
      />
    </label>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div
      className={`flex justify-between gap-3 ${strong ? 'pt-2 text-base font-bold text-cyan' : 'text-app-white/70'}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
