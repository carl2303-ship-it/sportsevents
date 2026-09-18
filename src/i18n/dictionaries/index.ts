import type { Locale } from '@/i18n/config'
import { en } from '@/i18n/dictionaries/en'
import { pt } from '@/i18n/dictionaries/pt'

export type Dictionary = typeof pt

export function getDictionary(locale: Locale): Dictionary {
  return locale === 'en' ? en : pt
}

export function fillTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template
  )
}
