'use client'

import { useEffect, useState } from 'react'
import { storePath, STORE_HOST } from '@/lib/boost-store/store-host'
import type { Locale } from '@/i18n/config'

/**
 * Store href that omits `/store` when the browser is on store.padel1.app.
 * SSR / first paint uses internal `/store…` (store host middleware 301s duplicates).
 */
export function useStoreHref(
  internalOrSuffix: string,
  locale: Locale
): string {
  const [host, setHost] = useState<string | undefined>(undefined)
  useEffect(() => {
    setHost(window.location.hostname)
  }, [])
  return storePath(internalOrSuffix, {
    locale,
    host: host === STORE_HOST ? STORE_HOST : undefined,
  })
}

export function useIsStoreHost(): boolean {
  const [isStore, setIsStore] = useState(false)
  useEffect(() => {
    setIsStore(window.location.hostname === STORE_HOST)
  }, [])
  return isStore
}
