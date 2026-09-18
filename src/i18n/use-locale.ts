'use client'

import { usePathname } from 'next/navigation'
import { localeFromPathname, type Locale } from '@/i18n/config'
import { getDictionary, type Dictionary } from '@/i18n/dictionaries'

export function useLocale(): Locale {
  const pathname = usePathname() || '/'
  return localeFromPathname(pathname)
}

export function useDictionary(): { locale: Locale; t: Dictionary } {
  const locale = useLocale()
  return { locale, t: getDictionary(locale) }
}
