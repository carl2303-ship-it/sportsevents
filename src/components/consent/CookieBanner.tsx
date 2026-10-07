'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useConsent } from '@/components/consent/consent-context'
import { useDictionary } from '@/i18n/use-locale'
import { withLocale } from '@/i18n/config'

export function CookieBanner() {
  const { locale, t } = useDictionary()
  const c = t.cookies
  const {
    ready,
    bannerOpen,
    preferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    closeBanner,
  } = useConsent()

  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    if (preferences) {
      setAnalytics(preferences.analytics)
      setMarketing(preferences.marketing)
    } else {
      setAnalytics(false)
      setMarketing(false)
    }
  }, [preferences, bannerOpen])

  if (!ready || !bannerOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-white/15 bg-navy/95 backdrop-blur-md shadow-2xl shadow-black/40 p-5 md:p-6 text-app-white">
        <h2
          id="cookie-banner-title"
          className="font-display text-base md:text-lg font-bold tracking-tight"
        >
          {c.title}
        </h2>
        <p className="mt-2 text-sm text-app-white/70 leading-relaxed">
          {c.description}{' '}
          <Link
            href={withLocale('/privacidade', locale)}
            className="text-cyan underline underline-offset-2 hover:text-cyan/90"
          >
            {c.privacyLink}
          </Link>
        </p>

        {customize && (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked
                disabled
                className="mt-1 rounded border-white/30"
              />
              <span>
                <span className="font-semibold text-app-white">
                  {c.necessaryTitle}
                </span>
                <span className="block text-app-white/55 text-xs mt-0.5">
                  {c.necessaryDesc}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 rounded border-white/30"
              />
              <span>
                <span className="font-semibold text-app-white">
                  {c.analyticsTitle}
                </span>
                <span className="block text-app-white/55 text-xs mt-0.5">
                  {c.analyticsDesc}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 rounded border-white/30"
              />
              <span>
                <span className="font-semibold text-app-white">
                  {c.marketingTitle}
                </span>
                <span className="block text-app-white/55 text-xs mt-0.5">
                  {c.marketingDesc}
                </span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {customize ? (
            <>
              <button
                type="button"
                onClick={() => savePreferences({ analytics, marketing })}
                className="rounded-xl bg-cyan hover:bg-cyan/90 text-navy font-bold text-xs px-4 py-2.5"
              >
                {c.save}
              </button>
              <button
                type="button"
                onClick={() => setCustomize(false)}
                className="rounded-xl border border-white/20 hover:bg-white/5 text-app-white/80 font-semibold text-xs px-4 py-2.5"
              >
                {c.back}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-xl bg-cyan hover:bg-cyan/90 text-navy font-bold text-xs px-4 py-2.5"
              >
                {c.acceptAll}
              </button>
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-xl border border-white/20 hover:bg-white/5 text-app-white font-semibold text-xs px-4 py-2.5"
              >
                {c.reject}
              </button>
              <button
                type="button"
                onClick={() => setCustomize(true)}
                className="rounded-xl border border-white/20 hover:bg-white/5 text-app-white/80 font-semibold text-xs px-4 py-2.5"
              >
                {c.customize}
              </button>
              {preferences && (
                <button
                  type="button"
                  onClick={closeBanner}
                  className="rounded-xl text-app-white/50 hover:text-app-white/80 font-semibold text-xs px-3 py-2.5"
                >
                  {c.close}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
