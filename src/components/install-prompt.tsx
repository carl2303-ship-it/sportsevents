'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useDictionary } from '@/i18n/use-locale'

const STORAGE_KEY = 'se-install-dismissed'
const DISMISS_DAYS = 14

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia('(display-mode: standalone)').matches
  const ios = 'standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone
  return Boolean(mq || ios)
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 900px)').matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = Number(raw)
    if (!Number.isFinite(ts)) return false
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua)
  const chrome = /CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit && !chrome
}

export function InstallPrompt() {
  const pathname = usePathname() || '/'
  const { t } = useDictionary()
  const i = t.install
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  )
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'android' | 'ios' | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname.startsWith('/admin')) return
    if (isStandalone() || wasDismissedRecently() || !isMobileViewport()) return

    let cancelled = false
    let showTimer: ReturnType<typeof setTimeout> | undefined

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setMode('android')
      showTimer = setTimeout(() => {
        if (!cancelled) setOpen(true)
      }, 2500)
    }

    window.addEventListener('beforeinstallprompt', onBip)

    // iOS has no beforeinstallprompt — show Share → Add to Home Screen tip
    if (isIosSafari()) {
      setMode('ios')
      showTimer = setTimeout(() => {
        if (!cancelled) setOpen(true)
      }, 3500)
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    return () => {
      cancelled = true
      if (showTimer) clearTimeout(showTimer)
      window.removeEventListener('beforeinstallprompt', onBip)
    }
  }, [pathname])

  if (!open || !mode) return null

  async function onInstall() {
    if (deferred) {
      await deferred.prompt()
      try {
        await deferred.userChoice
      } catch {
        /* ignore */
      }
      setDeferred(null)
    }
    dismiss()
    setOpen(false)
  }

  function onClose() {
    dismiss()
    setOpen(false)
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-5 pointer-events-none"
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-modal="false"
    >
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-white/15 bg-navy/95 backdrop-blur-md shadow-[0_-8px_40px_rgba(0,0,0,0.45)] p-4 sm:p-5 animate-fade-up">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/icon.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl border border-white/10 shrink-0 object-cover"
          />
          <div className="min-w-0 flex-1">
            <h2
              id="install-prompt-title"
              className="text-sm font-bold text-white leading-snug"
            >
              {i.title}
            </h2>
            <p className="mt-1 text-xs text-app-white/65 leading-relaxed">
              {mode === 'ios' ? i.iosBody : i.body}
            </p>
            {mode === 'ios' ? (
              <p className="mt-2 text-[11px] text-cyan/90 leading-relaxed inline-flex items-start gap-1.5">
                <Share className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{i.iosHint}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-app-white/45 hover:text-white hover:bg-white/5 transition"
            aria-label={i.dismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {mode === 'android' ? (
            <button
              type="button"
              onClick={onInstall}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-xs font-bold text-navy hover:brightness-110 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {i.cta}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-cyan px-4 py-2.5 text-xs font-bold text-navy hover:brightness-110 transition"
            >
              {i.gotIt}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-app-white/70 hover:border-white/30 hover:text-white transition"
          >
            {i.later}
          </button>
        </div>
      </div>
    </div>
  )
}
