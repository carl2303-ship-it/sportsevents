'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { localeFromPathname, type Locale } from '@/i18n/config'
import { getDictionary, type Dictionary } from '@/i18n/dictionaries'

const LocaleContext = createContext<Locale>('en')

/** Locale do servidor (proxy header) — evita mismatch de hidratação com rewrites. */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

/**
 * SSR + first client render always use the server locale (identical → no hydration mismatch).
 * After mount, follow the browser pathname (/pt, /es, …).
 */
export function useLocale(): Locale {
  const serverLocale = useContext(LocaleContext)
  const pathname = usePathname()
  const [clientLocale, setClientLocale] = useState<Locale | null>(null)

  useEffect(() => {
    setClientLocale(localeFromPathname(pathname || '/'))
  }, [pathname])

  return clientLocale ?? serverLocale
}

export function useDictionary(): { locale: Locale; t: Dictionary } {
  const locale = useLocale()
  return { locale, t: getDictionary(locale) }
}
