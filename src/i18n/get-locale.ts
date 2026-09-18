import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from '@/i18n/config'

/** Locale no servidor (header do proxy ou cookie). */
export async function getLocale(): Promise<Locale> {
  const h = await headers()
  const fromHeader = h.get(LOCALE_HEADER)
  if (isLocale(fromHeader)) return fromHeader

  const jar = await cookies()
  const fromCookie = jar.get(LOCALE_COOKIE)?.value
  if (isLocale(fromCookie)) return fromCookie

  return defaultLocale
}
