import type { Locale } from '@/i18n/config'
import { de } from '@/i18n/dictionaries/de'
import { en } from '@/i18n/dictionaries/en'
import { es } from '@/i18n/dictionaries/es'
import { fr } from '@/i18n/dictionaries/fr'
import { pt } from '@/i18n/dictionaries/pt'

export type Dictionary = typeof pt

const dictionaries: Record<Locale, Dictionary> = {
  en,
  pt,
  es,
  fr,
  de,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || en
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
