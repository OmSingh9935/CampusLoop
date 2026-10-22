import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'

/**
 * Root page – redirects based on auth state.
 * Logged-in verified users or demo session → dashboard.
 * Everyone else → login.
 */
export default async function RootPage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {}

  const cookieStore = await cookies()
  const demoCookie = cookieStore.get('campus_loop_demo_user')
  const hasDemo = !!demoCookie?.value

  if (user || hasDemo) {
    redirect(ROUTES.DASHBOARD)
  } else {
    redirect(ROUTES.LOGIN)
  }
}
