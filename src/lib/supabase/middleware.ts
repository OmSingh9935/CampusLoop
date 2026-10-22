import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants'

/**
 * Supabase auth middleware.
 * Refreshes sessions and protects routes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-kiet.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // Refresh session — important to do before any route checks
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    user = null
  }

  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const isAuthRoute = pathname.startsWith('/auth')
  const isApiRoute = pathname.startsWith('/api')
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon')

  if (isPublicAsset || isApiRoute) {
    return supabaseResponse
  }

  const demoCookie = request.cookies.get('campus_loop_demo_user')
  const hasDemoUser = !!demoCookie?.value
  const isDemoAdmin = demoCookie?.value?.includes('"role":"admin"') || demoCookie?.value?.includes('%22role%22%3A%22admin%22')

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

    if (hasDemoUser && !user) {
      if (!isDemoAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = ROUTES.DASHBOARD
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Check admin role via profile
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = ROUTES.DASHBOARD
        return NextResponse.redirect(url)
      }
    } catch {
      // In case of error fetching profile, redirect safely
      const url = request.nextUrl.clone()
      url.pathname = ROUTES.DASHBOARD
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
