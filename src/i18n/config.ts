export const locales = ['en', 'pt', 'es', 'fr', 'de'] as const
export type Locale = (typeof locales)[number]
/** Inglês é a língua principal (URLs sem prefixo). */
export const defaultLocale: Locale = 'en'
export const LOCALE_HEADER = 'x-locale'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

/** Prefixos de URL para locales que não são o default. */
export const localePrefixes: Exclude<Locale, typeof defaultLocale>[] = [
  'pt',
  'es',
  'fr',
  'de',
]

export function isLocale(value: string | null | undefined): value is Locale {
  return (
    value === 'en' ||
    value === 'pt' ||
    value === 'es' ||
    value === 'fr' ||
    value === 'de'
  )
}

export function numberLocaleFor(locale: Locale): string {
  switch (locale) {
    case 'pt':
      return 'pt-PT'
    case 'es':
      return 'es-ES'
    case 'fr':
      return 'fr-FR'
    case 'de':
      return 'de-DE'
    default:
      return 'en-GB'
  }
}

/** Detecta locale a partir do pathname (`/pt|es|fr|de/...`; resto = inglês). */
export function localeFromPathname(pathname: string): Locale {
  for (const code of localePrefixes) {
    if (pathname === `/${code}` || pathname.startsWith(`/${code}/`)) {
      return code
    }
  }
  return 'en'
}

/** Remove prefixos de locale (`/pt|/es|/fr|/de` ou legado `/en`). */
export function stripLocalePrefix(pathname: string): string {
  for (const prefix of ['/pt', '/es', '/fr', '/de', '/en'] as const) {
    if (pathname === prefix) return '/'
    if (pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length)
      return rest.startsWith('/') ? rest : `/${rest}`
    }
  }
  return pathname || '/'
}

/**
 * Prefixa o path com `/{locale}` quando não é o default (EN).
 * EN fica sem prefixo.
 */
export function withLocale(pathname: string, locale: Locale): string {
  const path = stripLocalePrefix(pathname)
  const [base, query] = path.split('?')
  const normalized = base || '/'
  let localized =
    locale === defaultLocale
      ? normalized
      : normalized === '/'
        ? `/${locale}`
        : `/${locale}${normalized}`
  if (query) localized += `?${query}`
  return localized
}

/** Troca o locale mantendo o path + query atuais. */
export function switchLocalePath(
  pathname: string,
  search: string,
  next: Locale
): string {
  const base = withLocale(pathname, next)
  if (!search || search === '?') return base
  const q = search.startsWith('?') ? search : `?${search}`
  return `${base}${q}`
}
