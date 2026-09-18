import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  stripLocalePrefix,
  type Locale,
} from '@/i18n/config'

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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Legacy /en → redirect to unprefixed EN (default)
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return redirectStripped(request, pathname)
  }

  // Portuguese URLs: /pt and /pt/... → rewrite to unprefixed path
  if (pathname === '/pt' || pathname.startsWith('/pt/')) {
    const stripped = stripLocalePrefix(pathname)
    if (stripped === '/admin' || stripped.startsWith('/admin/')) {
      const url = request.nextUrl.clone()
      url.pathname = stripped
      return NextResponse.redirect(url)
    }

    const url = request.nextUrl.clone()
    url.pathname = stripped

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(LOCALE_HEADER, 'pt')

    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
    return applyLocaleHeaders(request, 'pt', response)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute =
    pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  // Public routes without prefix default to English
  if (!isAdminRoute) {
    applyLocaleHeaders(request, 'en', supabaseResponse)
  }

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
          supabaseResponse = NextResponse.next({
            request,
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

  // Refresh session / validate JWT — do not use getSession() for auth checks.
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
