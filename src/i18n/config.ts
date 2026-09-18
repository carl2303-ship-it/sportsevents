export const locales = ['en', 'pt'] as const
export type Locale = (typeof locales)[number]
/** Inglês é a língua principal (URLs sem prefixo). */
export const defaultLocale: Locale = 'en'
export const LOCALE_HEADER = 'x-locale'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'pt' || value === 'en'
}

/** Detecta locale a partir do pathname (`/pt/...` = português; resto = inglês). */
export function localeFromPathname(pathname: string): Locale {
  if (pathname === '/pt' || pathname.startsWith('/pt/')) return 'pt'
  return 'en'
}

/** Remove o prefixo de locale (`/pt` ou legado `/en`). */
export function stripLocalePrefix(pathname: string): string {
  for (const prefix of ['/pt', '/en'] as const) {
    if (pathname === prefix) return '/'
    if (pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length)
      return rest.startsWith('/') ? rest : `/${rest}`
    }
  }
  return pathname || '/'
}

/**
 * Prefixa o path com `/pt` quando o locale não é o default (EN).
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
        ? '/pt'
        : `/pt${normalized}`
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
