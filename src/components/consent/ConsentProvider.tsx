'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CONSENT_EVENT,
  acceptAllConsent,
  hydrateConsentFromStorage,
  rejectNonEssentialConsent,
  writeConsent,
  type ConsentPreferences,
} from '@/lib/consent'
import {
  ConsentContext,
  type ConsentContextValue,
} from '@/components/consent/consent-context'
import { CookieBanner } from '@/components/consent/CookieBanner'
import { GoogleTagLoader } from '@/components/consent/GoogleTagLoader'

export { useConsent } from '@/components/consent/consent-context'

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null
  )
  const [ready, setReady] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [forceOpen, setForceOpen] = useState(false)

  useEffect(() => {
    const stored = hydrateConsentFromStorage()
    setPreferences(stored)
    setReady(true)
    if (!stored) setBannerOpen(true)

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail
      if (detail) setPreferences(detail)
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  const persist = useCallback((prefs: ConsentPreferences) => {
    writeConsent(prefs)
    setPreferences(prefs)
    setBannerOpen(false)
    setForceOpen(false)
  }, [])

  const acceptAll = useCallback(() => {
    persist(acceptAllConsent())
  }, [persist])

  const rejectNonEssential = useCallback(() => {
    persist(rejectNonEssentialConsent())
  }, [persist])

  const savePreferences = useCallback(
    (prefs: Pick<ConsentPreferences, 'analytics' | 'marketing'>) => {
      persist({
        necessary: true,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        updatedAt: new Date().toISOString(),
      })
    },
    [persist]
  )

  const openPreferences = useCallback(() => {
    setForceOpen(true)
    setBannerOpen(true)
  }, [])

  const closeBanner = useCallback(() => {
    if (preferences) {
      setBannerOpen(false)
      setForceOpen(false)
    }
  }, [preferences])

  const value = useMemo<ConsentContextValue>(
    () => ({
      preferences,
      ready,
      bannerOpen: bannerOpen || forceOpen,
      openPreferences,
      closeBanner,
      acceptAll,
      rejectNonEssential,
      savePreferences,
    }),
    [
      preferences,
      ready,
      bannerOpen,
      forceOpen,
      openPreferences,
      closeBanner,
      acceptAll,
      rejectNonEssential,
      savePreferences,
    ]
  )

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <GoogleTagLoader />
      <CookieBanner />
    </ConsentContext.Provider>
  )
}
