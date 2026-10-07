export const CONSENT_COOKIE = 'se_consent'
export const CONSENT_STORAGE_KEY = 'se_consent'
export const CONSENT_EVENT = 'se:consent-change'
/** ~12 months */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export type ConsentPreferences = {
  /** Always true — locale, auth, security */
  necessary: true
  analytics: boolean
  marketing: boolean
  updatedAt: string
}

export type GtagConsentState = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function defaultConsentPreferences(): ConsentPreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date().toISOString(),
  }
}

export function acceptAllConsent(): ConsentPreferences {
  return {
    necessary: true,
    analytics: true,
    marketing: true,
    updatedAt: new Date().toISOString(),
  }
}

export function rejectNonEssentialConsent(): ConsentPreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    updatedAt: new Date().toISOString(),
  }
}

function parseConsent(raw: string | null | undefined): ConsentPreferences | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<ConsentPreferences>
    if (typeof data.analytics !== 'boolean' || typeof data.marketing !== 'boolean') {
      return null
    }
    return {
      necessary: true,
      analytics: data.analytics,
      marketing: data.marketing,
      updatedAt:
        typeof data.updatedAt === 'string'
          ? data.updatedAt
          : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function readConsentFromDocument(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
  if (match) {
    const value = decodeURIComponent(match.slice(CONSENT_COOKIE.length + 1))
    const fromCookie = parseConsent(value)
    if (fromCookie) return fromCookie
  }
  try {
    return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeConsent(prefs: ConsentPreferences): void {
  if (typeof document === 'undefined') return
  const payload: ConsentPreferences = {
    ...prefs,
    necessary: true,
    updatedAt: new Date().toISOString(),
  }
  const encoded = encodeURIComponent(JSON.stringify(payload))
  document.cookie = `${CONSENT_COOKIE}=${encoded};path=/;max-age=${CONSENT_MAX_AGE_SECONDS};SameSite=Lax`
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT, { detail: payload })
  )
  applyConsentUpdate(payload)
}

/** Inline bootstrap — runs before React; sets Consent Mode v2 defaults. */
export const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
`.trim()

export function applyConsentUpdate(prefs: ConsentPreferences): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }
  }
  const analytics: GtagConsentState = prefs.analytics ? 'granted' : 'denied'
  const marketing: GtagConsentState = prefs.marketing ? 'granted' : 'denied'
  window.gtag('consent', 'update', {
    analytics_storage: analytics,
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    functionality_storage: 'granted',
    security_storage: 'granted',
  })
}

/** Apply stored choice on load (after defaults). */
export function hydrateConsentFromStorage(): ConsentPreferences | null {
  const prefs = readConsentFromDocument()
  if (prefs) applyConsentUpdate(prefs)
  return prefs
}

export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  return id || undefined
}

export function getGtmId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim()
  return id || undefined
}
