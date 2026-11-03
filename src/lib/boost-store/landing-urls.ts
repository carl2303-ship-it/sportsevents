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
    // App runtime (login / org slug) stays on padel1 — marketing landing is /store/tour
    if (
      abs.hostname === 'padel1.app' ||
      abs.hostname === 'www.padel1.app'
    ) {
      return { href: abs.toString(), external: true, learnMore: true }
    }
    if (abs.hostname === 'tour.padel1.app') {
      // Bare host without org path → marketing landing on SE
      if (abs.pathname === '/' || abs.pathname === '') {
        const href = '/store/tour'
        return {
          href: locale ? withLocale(href, locale) : href,
          external: false,
          learnMore: true,
        }
      }
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
    const href = '/store/tour'
    return {
      href: locale ? withLocale(href, locale) : href,
      external: false,
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
/** Known digital SKU → dedicated SE landing (parity with Boost HTML). */
const PRODUCT_LANDING_BY_ID: Record<string, string> = {
  // App Gestão Torneios — was boostpadel.store/tour.html
  'e854bc16-1ea7-4306-9dac-b53145b3999d': '/store/tour',
}

export function resolveProductLanding(
  product: BoostProduct,
  locale?: Locale
): ProductLanding {
  const byId = PRODUCT_LANDING_BY_ID[product.id]
  if (byId) {
    return {
      href: locale ? withLocale(byId, locale) : byId,
      external: false,
      learnMore: true,
    }
  }

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

const SE_STORE = 'https://sportsevents.app/store'
/** SE product UUIDs used by Boost blog CTAs that landed on bare /store. */
const BLOG_PRODUCT = {
  loaded: '6fcd365a-8026-4fb1-bfe0-15b95cb671e3',
  nrgyGelBox: '85f1171b-cad6-4740-8d52-53140e55eded',
} as const

/** Rewrite boostpadel.store (and leftover /store/product.html) hrefs in HTML. */
export function rewriteBoostUrlsInHtml(html: string): string {
  if (
    !html ||
    (!/boostpadel\.store/i.test(html) &&
      !/store\/product\.html\?id=/i.test(html) &&
      !/\/store\/store(?:["'/?#\s]|$)/i.test(html) &&
      !/Loaded 4Endurance Pro|Nrgy Gel 45/i.test(html))
  ) {
    return html
  }

  return (
    html
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/smartpadelstrategy\.html/gi,
        `${SE_STORE}/funnel?slug=smartpadelstrategy`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/ebook-landing\.html/gi,
        `${SE_STORE}/ebook-landing`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/tour\.html/gi,
        `${SE_STORE}/tour`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/funnel\.html\?slug=([^"'&\s<#]+)/gi,
        `${SE_STORE}/funnel?slug=$1`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/funnel-upsell\.html\?slug=([^"'&\s<#]+)/gi,
        `${SE_STORE}/funnel/upsell?slug=$1`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/funnel-thank-you\.html\?slug=([^"'&\s<#]+)/gi,
        `${SE_STORE}/funnel/thank-you?slug=$1`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/ebook-upsell(?:-1)?\.html/gi,
        `${SE_STORE}/funnel/upsell?slug=smartpadelstrategy`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/ebook-thank-you\.html/gi,
        `${SE_STORE}/funnel/thank-you?slug=smartpadelstrategy`
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/store\.html/gi,
        SE_STORE
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/digital\.html/gi,
        SE_STORE
      )
      .replace(
        /https?:\/\/(?:www\.)?boostpadel\.store\/product\.html\?id=([^"'&\s<#]+)/gi,
        `${SE_STORE}/$1`
      )
      // Already host-rewritten but path still legacy
      .replace(
        /https?:\/\/(?:www\.)?sportsevents\.app\/store\/product\.html\?id=([^"'&\s<#]+)/gi,
        `${SE_STORE}/$1`
      )
      .replace(/\/store\/product\.html\?id=([^"'&\s<#]+)/gi, `${SE_STORE}/$1`)
      .replace(
        /https?:\/\/(?:www\.)?sportsevents\.app\/store\/store(?=["'/?#\s]|$)/gi,
        SE_STORE
      )
      .replace(/\/store\/store(?=["'/?#\s]|$)/gi, SE_STORE)
      .replace(/https?:\/\/(?:www\.)?boostpadel\.store\/?/gi, SE_STORE)
      // Named CTAs still on bare store home
      .replace(
        /href="(?:https?:\/\/(?:www\.)?sportsevents\.app)?\/store"(?=[^>]*>\s*<strong>Loaded 4Endurance Pro<\/strong>)/gi,
        `href="${SE_STORE}/${BLOG_PRODUCT.loaded}"`
      )
      .replace(
        /href="(?:https?:\/\/(?:www\.)?sportsevents\.app)?\/store"(?=[^>]*>\s*Loaded\s*<)/gi,
        `href="${SE_STORE}/${BLOG_PRODUCT.loaded}"`
      )
      .replace(
        /href="(?:https?:\/\/(?:www\.)?sportsevents\.app)?\/store"(?=[^>]*>\s*<strong>Nrgy Gel 45(?: da Nduranz)?<\/strong>)/gi,
        `href="${SE_STORE}/${BLOG_PRODUCT.nrgyGelBox}"`
      )
  )
}
