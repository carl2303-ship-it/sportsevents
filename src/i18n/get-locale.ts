import { headers } from 'next/headers'
import {
  defaultLocale,
  isLocale,
  LOCALE_HEADER,
  type Locale,
} from '@/i18n/config'

/**
 * Locale no servidor — só o header do proxy (nunca cookie).
 * Cookie antigo (ex.: pt) causava HTML em PT com cliente em EN.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers()
  const fromHeader = h.get(LOCALE_HEADER)
  if (isLocale(fromHeader)) return fromHeader
  return defaultLocale
}
