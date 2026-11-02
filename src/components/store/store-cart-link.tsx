'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useStoreCart } from '@/components/store/cart-context'
import { withLocale, type Locale } from '@/i18n/config'

export function StoreCartLink({
  locale,
  label,
}: {
  locale: Locale
  label: string
}) {
  const { count, ready } = useStoreCart()

  return (
    <Link
      href={withLocale('/store/checkout', locale)}
      className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold text-app-white/85 transition hover:border-cyan/40 hover:text-cyan"
      aria-label={label}
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {ready && count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy">
          {count}
        </span>
      ) : null}
    </Link>
  )
}
