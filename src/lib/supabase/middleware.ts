import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants'
import { isSupabaseConfigured, withTimeout } from './config'

/**
 * Supabase auth middleware.
 * Refreshes sessions and protects routes.
 * When Supabase is not configured, completes instantly without blocking DNS/TCP timeouts.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // Public assets and internal Next.js routes
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/auth')

  if (isPublicAsset || isApiRoute) {
    return supabaseResponse
  }

  const demoCookie = request.cookies.get('campus_loop_demo_user')
  const hasDemoUser = !!demoCookie?.value
  const isDemoAdmin =
    demoCookie?.value?.includes('"role":"admin"') ||
    demoCookie?.value?.includes('%22role%22%3A%22admin%22')

  let user = null

  if (isSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    })

    try {
      const { data } = await withTimeout(
        supabase.auth.getUser(),
        1500,
        { data: { user: null }, error: null } as any
      )
      user = data?.user || null
    } catch {
      user = null
    }

    // Admin route protection with Supabase profile
    if (pathname.startsWith('/admin') && user) {
      try {
        const { data: profile } = await withTimeout(
          supabase.from('profiles').select('role').eq('id', user.id).single(),
          1500,
          { data: null, error: null } as any
        )

        if (profile?.role !== 'admin') {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = ROUTES.DASHBOARD
          return NextResponse.redirect(redirectUrl)
        }
      } catch {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = ROUTES.DASHBOARD
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Not logged in → redirect to login (except auth routes)
  if (!user && !hasDemoUser && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Logged in but on auth route → redirect to dashboard
  if ((user || hasDemoUser) && isAuthRoute && pathname !== ROUTES.VERIFY_EMAIL) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.DASHBOARD
    return NextResponse.redirect(url)
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!user && !hasDemoUser) {
      const url = request.nextUrl.clone()
      url.pathname = ROUTES.LOGIN
      return NextResponse.redirect(url)
    }

    if (hasDemoUser && !user && !isDemoAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = ROUTES.DASHBOARD
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
