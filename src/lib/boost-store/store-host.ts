import {
  localeFromPathname,
  stripLocalePrefix,
  withLocale,
  type Locale,
} from '@/i18n/config'

/** Canonical public store origin (no `/store` path). */
export const STORE_CANONICAL_ORIGIN = 'https://store.padel1.app'
export const STORE_HOST = 'store.padel1.app'

/** Internal App Router base (unchanged until path cleanup). */
export const STORE_INTERNAL_BASE = '/store'

/** Request header set by proxy when Host is the store alias. */
export const STORE_HOST_HEADER = 'x-store-canonical-host'

export function normalizeHostname(host: string | null | undefined): string {
  return String(host || '')
    .split(':')[0]
    .trim()
    .toLowerCase()
}

export function isStoreHostname(host: string | null | undefined): boolean {
  return normalizeHostname(host) === STORE_HOST
}

export function isSportsEventsHostname(host: string | null | undefined): boolean {
  const h = normalizeHostname(host)
  return h === 'sportsevents.app' || h === 'www.sportsevents.app'
}

/**
 * Map internal `/store…` path (optional locale prefix) → public path on the
 * store host (`/` / `/checkout` / `/pt/checkout`, …).
 */
export function toPublicStorePath(pathname: string): string {
  const locale = localeFromPathname(pathname)
  const stripped = stripLocalePrefix(pathname)
  let publicPath: string
  if (stripped === STORE_INTERNAL_BASE) {
    publicPath = '/'
  } else if (stripped.startsWith(`${STORE_INTERNAL_BASE}/`)) {
    publicPath = stripped.slice(STORE_INTERNAL_BASE.length) || '/'
  } else {
    publicPath = stripped || '/'
  }
  return withLocale(publicPath, locale)
}

/**
 * Map public path on the store host → internal `/store…` App Router path.
 * Leaves paths that already start with `/store` unchanged.
 */
export function toInternalStorePath(pathname: string): string {
  const locale = localeFromPathname(pathname)
  const stripped = stripLocalePrefix(pathname)
  if (
    stripped === STORE_INTERNAL_BASE ||
    stripped.startsWith(`${STORE_INTERNAL_BASE}/`)
  ) {
    return withLocale(stripped, locale)
  }
  const internal =
    stripped === '/' ? STORE_INTERNAL_BASE : `${STORE_INTERNAL_BASE}${stripped}`
  return withLocale(internal, locale)
}

/**
 * Normalize a store path (internal `/store…` or suffix) then localize.
 * On the store host, returns the public path without `/store`.
 */
export function storePath(
  internalOrSuffix: string,
  opts?: { locale?: Locale; host?: string | null }
): string {
  const raw = String(internalOrSuffix || '').trim() || '/'
  let stripped: string
  if (raw === STORE_INTERNAL_BASE || raw.startsWith(`${STORE_INTERNAL_BASE}/`)) {
    stripped = stripLocalePrefix(raw)
  } else if (raw.startsWith('/')) {
    stripped = raw === '/' ? STORE_INTERNAL_BASE : `${STORE_INTERNAL_BASE}${raw}`
  } else {
    stripped = `${STORE_INTERNAL_BASE}/${raw}`
  }

  const locale = opts?.locale ?? 'en'
  const localized = withLocale(stripped, locale)

  if (isStoreHostname(opts?.host)) {
    return toPublicStorePath(localized)
  }
  return localized
}

/** Absolute canonical store URL (public paths, no `/store`). */
export function storeCanonicalUrl(publicPath = '/'): string {
  const path = publicPath.startsWith('/') ? publicPath : `/${publicPath}`
  if (path === '/') return STORE_CANONICAL_ORIGIN
  return `${STORE_CANONICAL_ORIGIN}${path}`
}

/** Client helper: `''` on store host, `/store` elsewhere. */
export function storeBasePathForHost(host?: string | null): string {
  return isStoreHostname(host) ? '' : STORE_INTERNAL_BASE
}

/**
 * Absolute URL for Stripe success/cancel given an Origin header.
 * store.padel1.app (and canonical fallback) → no `/store`;
 * sportsevents.app → `/store…`.
 */
export function storeUrlForOrigin(
  origin: string,
  pathWithinStore: string
): string {
  const base = (origin || STORE_CANONICAL_ORIGIN).replace(/\/$/, '')
  const suffix = pathWithinStore.replace(/^\//, '')
  let host = ''
  try {
    host = new URL(base).hostname
  } catch {
    host = ''
  }
  if (isStoreHostname(host) || !origin) {
    return suffix ? `${base}/${suffix}` : `${base}/`
  }
  if (isSportsEventsHostname(host)) {
    return suffix ? `${base}/store/${suffix}` : `${base}/store`
  }
  return suffix ? `${base}/${suffix}` : `${base}/`
}

/**
 * Absolute store URL from an internal `/store…` path + locale.
 * Honours store host (no `/store`) vs SE (`/pt/store/…`).
 * Call from browser event handlers.
 */
export function absoluteStoreHref(
  internalOrSuffix: string,
  opts?: { locale?: Locale; origin?: string }
): string {
  const origin = (
    opts?.origin ||
    (typeof window !== 'undefined' ? window.location.origin : STORE_CANONICAL_ORIGIN)
  ).replace(/\/$/, '')
  let host = ''
  try {
    host = new URL(origin).hostname
  } catch {
    host = typeof window !== 'undefined' ? window.location.hostname : ''
  }
  const path = storePath(internalOrSuffix, { locale: opts?.locale, host })
  if (path === '/') return `${origin}/`
  return `${origin}${path}`
}

/** Browser Origin → absolute store URL without locale (Edge defaults). */
export function browserStoreUrl(pathWithinStore: string): string {
  if (typeof window === 'undefined') {
    return storeUrlForOrigin(STORE_CANONICAL_ORIGIN, pathWithinStore)
  }
  return storeUrlForOrigin(window.location.origin, pathWithinStore)
}

/** Browser host → relative store path (call only in event handlers / after mount). */
export function browserStorePath(
  pathWithinStore: string,
  locale?: Locale
): string {
  const host =
    typeof window !== 'undefined' ? window.location.hostname : undefined
  return storePath(pathWithinStore, { locale, host })
}
