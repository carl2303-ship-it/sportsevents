import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  localeFromPathname,
  localePrefixes,
  stripLocalePrefix,
  withLocale,
  type Locale,
} from '@/i18n/config'
import {
  isSportsEventsHostname,
  isStoreHostname,
  STORE_CANONICAL_ORIGIN,
  STORE_HOST_HEADER,
  toInternalStorePath,
  toPublicStorePath,
} from '@/lib/boost-store/store-host'

function applyLocaleHeaders(
  request: NextRequest,
  locale: Locale,
  response: NextResponse
) {
  response.headers.set(LOCALE_HEADER, locale)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

function redirectStripped(
  request: NextRequest,
  pathname: string
): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = stripLocalePrefix(pathname)
  return NextResponse.redirect(url)
}

function rewriteWithLocale(
  request: NextRequest,
  pathname: string,
  locale: Locale,
  extraRequestHeaders?: HeadersInit
): NextResponse {
  const stripped = stripLocalePrefix(pathname)
  if (stripped === '/admin' || stripped.startsWith('/admin/')) {
    const url = request.nextUrl.clone()
    url.pathname = stripped
    return NextResponse.redirect(url)
  }

  const url = request.nextUrl.clone()
  url.pathname = stripped

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, locale)
  if (extraRequestHeaders) {
    new Headers(extraRequestHeaders).forEach((value, key) => {
      requestHeaders.set(key, value)
    })
  }

  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  })
  return applyLocaleHeaders(request, locale, response)
}

function nextWithLocale(request: NextRequest, locale: Locale): NextResponse {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, locale)

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  return applyLocaleHeaders(request, locale, response)
}

function requestHost(request: NextRequest): string {
  return (request.headers.get('host') || request.nextUrl.hostname || '')
    .split(':')[0]
    .toLowerCase()
}

function shouldBypassStoreRewrite(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/brand/')
  )
}

/**
 * store.padel1.app: public URLs without `/store`.
 * - everything (incl. `/store…`) → *internal* rewrite to `/store…` (no
 *   external 301 `/`↔`/store` — that looped with Netlify force redirects)
 * - legacy `/loja…` → 301 to public path (no `/store` in Location)
 */
function handleStoreHost(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return redirectStripped(request, pathname)
  }

  if (shouldBypassStoreRewrite(stripLocalePrefix(pathname))) {
    const locale = localeFromPathname(pathname)
    if (locale !== 'en') {
      return rewriteWithLocale(request, pathname, locale, {
        [STORE_HOST_HEADER]: '1',
      })
    }
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(STORE_HOST_HEADER, '1')
    requestHeaders.set(LOCALE_HEADER, 'en')
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    return applyLocaleHeaders(request, 'en', response)
  }

  const locale = localeFromPathname(pathname)
  const stripped = stripLocalePrefix(pathname)

  // Legacy /loja → public store paths on this host (no /store in Location)
  if (stripped === '/loja' || stripped.startsWith('/loja/')) {
    const rest = stripped === '/loja' ? '/' : stripped.slice('/loja'.length)
    const url = request.nextUrl.clone()
    url.pathname = withLocale(rest || '/', locale)
    return NextResponse.redirect(url, 301)
  }

  // Internal rewrite only — never 301 `/store`→`/` here. A public 301 of
  // `/store`→`/` plus rewrite `/`→`/store` causes ERR_TOO_MANY_REDIRECTS
  // when the edge re-applies rules on the rewrite target (HUB-91).
  const internalPath = toInternalStorePath(pathname)
  const storeHeader = { [STORE_HOST_HEADER]: '1' }
  if (locale !== 'en') {
    return rewriteWithLocale(request, internalPath, locale, storeHeader)
  }

  const url = request.nextUrl.clone()
  url.pathname = stripLocalePrefix(internalPath)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, 'en')
  requestHeaders.set(STORE_HOST_HEADER, '1')
  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  })
  return applyLocaleHeaders(request, 'en', response)
}

/**
 * sportsevents.app/store… → https://store.padel1.app/… (no /store on destination)
 */
function handleSportsEventsStoreRedirect(
  request: NextRequest
): NextResponse | null {
  const pathname = request.nextUrl.pathname
  const locale = localeFromPathname(pathname)
  const stripped = stripLocalePrefix(pathname)

  if (stripped !== '/store' && !stripped.startsWith('/store/')) {
    return null
  }

  const publicPath = toPublicStorePath(
    withLocale(stripped, locale)
  )
  const dest = new URL(STORE_CANONICAL_ORIGIN)
  dest.pathname = publicPath
  dest.search = request.nextUrl.search
  return NextResponse.redirect(dest, 301)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = requestHost(request)

  if (isStoreHostname(host)) {
    return handleStoreHost(request)
  }

  if (isSportsEventsHostname(host)) {
    const storeRedirect = handleSportsEventsStoreRedirect(request)
    if (storeRedirect) return storeRedirect
  }

  // Legacy /en → unprefixed English (default)
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return redirectStripped(request, pathname)
  }

  for (const code of localePrefixes) {
    if (pathname === `/${code}` || pathname.startsWith(`/${code}/`)) {
      return rewriteWithLocale(request, pathname, code)
    }
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute =
    pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  // Public routes without prefix → English (set request header so SSR matches)
  let supabaseResponse = isAdminRoute
    ? NextResponse.next({ request })
    : nextWithLocale(request, 'en')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          const requestHeaders = new Headers(request.headers)
          if (!isAdminRoute) {
            requestHeaders.set(LOCALE_HEADER, 'en')
          }
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value)
          })
          if (!isAdminRoute) {
            applyLocaleHeaders(request, 'en', supabaseResponse)
          }
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(data?.claims)

  if (isAdminRoute && !isLoginRoute && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isLoginRoute && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
