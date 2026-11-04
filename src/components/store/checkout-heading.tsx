'use client'

import Link from 'next/link'
import { withLocale } from '@/i18n/config'
import { useDictionary } from '@/i18n/use-locale'

export function CheckoutHeading() {
  const { locale, t } = useDictionary()
  const s = t.store
  return (
    <div>
      <Link
        href={withLocale('/store', locale)}
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
