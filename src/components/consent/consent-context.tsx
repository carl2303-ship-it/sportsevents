'use client'

import { createContext, useContext } from 'react'
import type { ConsentPreferences } from '@/lib/consent'

export type ConsentContextValue = {
  preferences: ConsentPreferences | null
  ready: boolean
  bannerOpen: boolean
  openPreferences: () => void
  closeBanner: () => void
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (
    prefs: Pick<ConsentPreferences, 'analytics' | 'marketing'>
  ) => void
}

export const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return ctx
}
