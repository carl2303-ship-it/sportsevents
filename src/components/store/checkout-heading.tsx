'use client'

import Link from 'next/link'
import { useStoreHref } from '@/lib/boost-store/use-store-path'
import { useDictionary } from '@/i18n/use-locale'

export function CheckoutHeading() {
  const { locale, t } = useDictionary()
  const s = t.store
  const storeHomeHref = useStoreHref('/store', locale)
  return (
    <div>
      <Link
        href={storeHomeHref}
        className="text-sm text-app-white/55 hover:text-cyan"
      >
        ← {s.backToStore}
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-extrabold md:text-4xl">
        {s.checkoutTitle}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-app-white/55">{s.checkoutLead}</p>
    </div>
  )
}
