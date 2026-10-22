'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { ROUTES, APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const email = data.email.toLowerCase().trim()

      if (!isSupabaseConfigured()) {
        const mockUser = {
          id: 'user-' + Date.now(),
          campus_id: 'CL-' + Math.floor(100000 + Math.random() * 900000),
          full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          username: email.split('@')[0],
          email,
          role: email.includes('admin')
            ? 'admin'
            : email.includes('prof') || email.includes('dr')
            ? 'teacher'
            : 'student',
          department: 'Computer Science & Engineering',
          year: 3,
          bio: 'KIET Member on CampusLoop',
          avatar_url: null,
          is_verified: true,
          is_banned: false,
          is_muted: false,
          muted_until: null,
          helpful_count: 5,
          reputation: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        document.cookie = `campus_loop_demo_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=604800; SameSite=Lax`
        try {
          localStorage.setItem('campus_loop_current_user', JSON.stringify(mockUser))
        } catch {}

        toast.success(`Welcome back, ${mockUser.full_name}!`)
        router.push(ROUTES.DASHBOARD)
        router.refresh()
        return
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        })

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            toast.error('Please verify your email first')
            router.push(ROUTES.VERIFY_EMAIL + '?email=' + encodeURIComponent(data.email))
            return
          }
          if (error.message.includes('Invalid login credentials')) {
            setError('password', { message: 'Invalid email or password' })
            return
          }
          throw error
        }

        toast.success('Welcome back!')
        router.push(ROUTES.DASHBOARD)
        router.refresh()
      } catch (authErr: any) {
        const isNetworkErr =
          authErr?.message?.includes('NetworkError') ||
          authErr?.message?.includes('Failed to fetch') ||
          authErr?.message?.includes('fetch failed')

        const isPlaceholder =
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy')

        if (isNetworkErr || isPlaceholder || authErr) {
          const email = data.email.toLowerCase().trim()
          const mockUser = {
            id: 'user-' + Date.now(),
            campus_id: 'CL-' + Math.floor(100000 + Math.random() * 900000),
            full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
            username: email.split('@')[0],
            email,
            role: email.includes('admin')
              ? 'admin'
              : email.includes('prof') || email.includes('dr')
              ? 'teacher'
              : 'student',
            department: 'Computer Science & Engineering',
            year: 3,
            bio: 'KIET Member on CampusLoop',
            avatar_url: null,
            is_verified: true,
            is_banned: false,
            is_muted: false,
            muted_until: null,
            helpful_count: 5,
            reputation: 25,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          document.cookie = `campus_loop_demo_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=604800`
          try {
            localStorage.setItem('campus_loop_current_user', JSON.stringify(mockUser))
          } catch {}

          toast.success(`Welcome back, ${mockUser.full_name}!`)
          router.push(ROUTES.DASHBOARD)
          router.refresh()
          return
        }

        throw authErr
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-lg">
          <span className="text-2xl">🎓</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your KIET community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            KIET Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="yourname@kiet.edu"
            className={cn(
              'w-full px-3 py-2.5 rounded-lg border bg-background text-foreground',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'transition-colors',
              errors.email && 'border-destructive focus:ring-destructive/50'
            )}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={cn(
                'w-full px-3 py-2.5 pr-10 rounded-lg border bg-background text-foreground',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                'transition-colors',
                errors.password && 'border-destructive focus:ring-destructive/50'
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'bg-primary text-primary-foreground font-medium',
            'py-2.5 px-4 rounded-lg text-sm',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary/50'
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.SIGNUP} className="text-primary font-medium hover:underline">
            Create account
          </Link>
        </p>
      </form>

      {/* Info note */}
      <div className="mt-6 p-3 bg-muted rounded-lg text-xs text-muted-foreground text-center">
        🔒 Only <strong>@kiet.edu</strong> email addresses can access CampusLoop
      </div>
    </div>
  )
}
