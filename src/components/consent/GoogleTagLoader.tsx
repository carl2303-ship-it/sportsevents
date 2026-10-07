'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { useConsent } from '@/components/consent/consent-context'
import { getGaMeasurementId, getGtmId } from '@/lib/consent'

/**
 * Carrega GA4 / GTM apenas quando:
 * - IDs estão definidos em env, e
 * - o utilizador já escolheu preferências (Consent Mode já fez update).
 * As tags respeitam Consent Mode v2 (denied até granted).
 */
export function GoogleTagLoader() {
  const { ready, preferences } = useConsent()
  const gaId = getGaMeasurementId()
  const gtmId = getGtmId()
  const gtmBooted = useRef(false)

  const hasChoice = ready && preferences !== null
  /** GA4 só após consentimento de analytics (Consent Mode já fez update). */
  const loadGa = Boolean(hasChoice && gaId && preferences?.analytics)
  const loadGtm = Boolean(hasChoice && gtmId)

  useEffect(() => {
    if (!loadGtm || !gtmId || gtmBooted.current) return
    gtmBooted.current = true
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'gtm.start': Date.now(),
      event: 'gtm.js',
    })
  }, [loadGtm, gtmId])

  useEffect(() => {
    if (!loadGa || !gaId || typeof window.gtag !== 'function') return
    window.gtag('js', new Date())
    window.gtag('config', gaId, { anonymize_ip: true })
  }, [loadGa, gaId])

  if (!loadGa && !loadGtm) return null

  return (
    <>
      {loadGtm && gtmId ? (
        <Script
          id="gtm"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        />
      ) : null}
      {loadGa && gaId ? (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
    </>
  )
}
