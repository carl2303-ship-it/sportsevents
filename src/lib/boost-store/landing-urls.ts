import { withLocale, type Locale } from '@/i18n/config'
import type { BoostProduct } from '@/lib/boost-store/types'

export type ProductLanding = {
  href: string
  /** Open in new tab (external domain). */
  external: boolean
  /** Show «Saber mais» instead of add-to-cart (legacy Boost digital CTA). */
  learnMore: boolean
}

const BOOST_HOST_RE = /^(?:https?:)?\/\/(?:www\.)?boostpadel\.store/i

/**
 * Map discontinued boostpadel.store URLs (and known aliases) to SE / padel1
 * destinations. Returns null when the URL is already fine as-is.
 */
export function remapBoostStoreUrl(
  raw: string,
  locale?: Locale
): ProductLanding | null {
  const url = String(raw || '').trim()
  if (!url) return null

  // Already on SE /store — keep relative when possible
  try {
    if (url.startsWith('/store')) {
      return {
        href: locale ? withLocale(url, locale) : url,
        external: false,
        learnMore: true,
      }
    }
    const abs = new URL(url, 'https://sportsevents.app')
    if (
      abs.hostname === 'sportsevents.app' ||
      abs.hostname === 'www.sportsevents.app'
    ) {
      const path = `${abs.pathname}${abs.search}`
      return {
        href: locale ? withLocale(path, locale) : path,
        external: false,
        learnMore: true,
      }
    }
    if (
      abs.hostname === 'tour.padel1.app' ||
      abs.hostname === 'padel1.app' ||
      abs.hostname === 'www.padel1.app'
    ) {
      return { href: abs.toString(), external: true, learnMore: true }
    }
  } catch {
    /* fall through */
  }

  if (!BOOST_HOST_RE.test(url) && !url.includes('boostpadel.store')) {
    // Absolute non-Boost URL — keep external
    if (/^https?:\/\//i.test(url)) {
      return { href: url, external: true, learnMore: true }
    }
    return null
  }

  let path = ''
  let search = ''
  try {
    const u = new URL(url.replace(BOOST_HOST_RE, 'https://boostpadel.store'))
    path = u.pathname.replace(/\/+$/, '') || '/'
    search = u.search
  } catch {
    path = url.replace(BOOST_HOST_RE, '').split('?')[0] || '/'
    search = url.includes('?') ? `?${url.split('?')[1]}` : ''
  }

  const pathLower = path.toLowerCase()
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const slug = params.get('slug') || ''

  if (
    pathLower === '/smartpadelstrategy' ||
    pathLower === '/smartpadelstrategy.html'
  ) {
    return funnelLanding('smartpadelstrategy', locale)
  }

  if (pathLower === '/funnel.html' || pathLower === '/funnel') {
    return funnelLanding(slug || 'smartpadelstrategy', locale)
  }

  if (
    pathLower === '/funnel-upsell.html' ||
    pathLower === '/funnel-upsell' ||
    pathLower === '/ebook-upsell.html' ||
    pathLower === '/ebook-upsell-1.html'
  ) {
    const s = slug || 'smartpadelstrategy'
    const href = `/store/funnel/upsell?slug=${encodeURIComponent(s)}`
    return {
      href: locale ? withLocale(href, locale) : href,
      external: false,
      learnMore: true,
    }
  }

  if (
    pathLower === '/funnel-thank-you.html' ||
    pathLower === '/funnel-thank-you' ||
    pathLower === '/ebook-thank-you.html' ||
    pathLower === '/ebook-upsell-thank-you.html'
  ) {
    const s = slug || 'smartpadelstrategy'
    const href = `/store/funnel/thank-you?slug=${encodeURIComponent(s)}`
    return {
      href: locale ? withLocale(href, locale) : href,
      external: false,
      learnMore: true,
    }
  }

  if (
    pathLower === '/ebook-landing.html' ||
    pathLower === '/ebook-landing'
  ) {
    const href = '/store/ebook-landing'
    return {
      href: locale ? withLocale(href, locale) : href,
      external: false,
      learnMore: true,
    }
  }

  if (pathLower === '/tour.html' || pathLower === '/tour') {
    return {
      href: 'https://tour.padel1.app',
      external: true,
      learnMore: true,
    }
  }

  if (
    pathLower === '/product.html' ||
    pathLower === '/product'
  ) {
    const id = params.get('id')
    if (id) {
      const href = `/store/${id}`
      return {
        href: locale ? withLocale(href, locale) : href,
        external: false,
        learnMore: false,
      }
    }
  }

  if (
    pathLower === '/checkout.html' ||
    pathLower === '/checkout'
  ) {
    const href = '/store/checkout'
    return {
      href: locale ? withLocale(href, locale) : href,
      external: false,
      learnMore: false,
    }
  }

  if (
    pathLower === '/' ||
    pathLower === '/index.html' ||
    pathLower === '/store.html' ||
    pathLower === '/store' ||
    pathLower === '/digital.html' ||
    pathLower === '/digital'
  ) {
    const href = '/store'
    return {
      href: locale ? withLocale(href, locale) : href,
      external: false,
      learnMore: false,
    }
  }

  // Residual Boost URL → store catalogue
  const href = '/store'
  return {
    href: locale ? withLocale(href, locale) : href,
    external: false,
    learnMore: false,
  }
}

function funnelLanding(slug: string, locale?: Locale): ProductLanding {
  const href = `/store/funnel?slug=${encodeURIComponent(slug)}`
  return {
    href: locale ? withLocale(href, locale) : href,
    external: false,
    learnMore: true,
  }
}

/**
 * Canonical landing for a store product (digital funnels / lead magnets / tour).
 * Mirrors Boost «Saber mais» when a landing existed; otherwise product detail.
 */
export function resolveProductLanding(
  product: BoostProduct,
  locale?: Locale
): ProductLanding {
  if (product.funnel_slug) {
    return funnelLanding(product.funnel_slug, locale)
  }

  if (product.learn_more_url) {
    const remapped = remapBoostStoreUrl(product.learn_more_url, locale)
    if (remapped) return remapped
  }

  const href = `/store/${product.id}`
  return {
    href: locale ? withLocale(href, locale) : href,
    external: false,
    learnMore: false,
  }
}

/** Rewrite boostpadel.store hrefs inside product HTML descriptions. */
export function rewriteBoostUrlsInHtml(html: string): string {
  if (!html || !/boostpadel\.store/i.test(html)) return html

  return html
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/smartpadelstrategy\.html/gi,
      '/store/funnel?slug=smartpadelstrategy'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/ebook-landing\.html/gi,
      '/store/ebook-landing'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/tour\.html/gi,
      'https://tour.padel1.app'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/funnel\.html\?slug=([^"'&\s<#]+)/gi,
      '/store/funnel?slug=$1'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/funnel-upsell\.html\?slug=([^"'&\s<#]+)/gi,
      '/store/funnel/upsell?slug=$1'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/funnel-thank-you\.html\?slug=([^"'&\s<#]+)/gi,
      '/store/funnel/thank-you?slug=$1'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/ebook-upsell(?:-1)?\.html/gi,
      '/store/funnel/upsell?slug=smartpadelstrategy'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/ebook-thank-you\.html/gi,
      '/store/funnel/thank-you?slug=smartpadelstrategy'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/store\.html/gi,
      '/store'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/digital\.html/gi,
      '/store'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/product\.html\?id=([^"'&\s<#]+)/gi,
      '/store/$1'
    )
    .replace(
      /https?:\/\/(?:www\.)?boostpadel\.store\/?/gi,
      '/store'
    )
}
