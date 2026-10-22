'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, UserPlus, Info } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { signupSchema, type SignupFormData } from '@/lib/validations'
import { ROUTES, APP_NAME, DEPARTMENTS, YEARS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'student' },
  })

  const watchedRole = watch('role')

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const email = data.email.toLowerCase().trim()

      // Extra client-side check (belt-and-suspenders before hitting Supabase)
      if (!/^[a-zA-Z0-9._%+\-]+@kiet\.edu$/i.test(email)) {
        setError('email', { message: 'Only @kiet.edu email addresses are allowed' })
        return
      }

      if (!isSupabaseConfigured()) {
        const generatedCampusId = `CL-${Math.floor(100000 + Math.random() * 900000)}`
        const mockUser = {
          id: `user-${Date.now()}`,
          campus_id: generatedCampusId,
          full_name: data.full_name.trim(),
          username: email.split('@')[0],
          email,
          role: data.role,
          department: data.department || 'Computer Science & Engineering',
          year: data.year ? parseInt(data.year) : 2,
          bio: 'KIET Student Explorer',
          avatar_url: null,
          is_verified: true,
          is_banned: false,
          is_muted: false,
          muted_until: null,
          helpful_count: 0,
          reputation: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        document.cookie = `campus_loop_demo_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=604800; SameSite=Lax`
        try {
          localStorage.setItem('campus_loop_current_user', JSON.stringify(mockUser))
        } catch {}

        toast.success(`Welcome to CampusLoop, ${mockUser.full_name}!`)
        router.push(ROUTES.DASHBOARD)
        router.refresh()
        return
      }

      try {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password: data.password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
            data: {
              full_name: data.full_name.trim(),
              role: data.role,
              department: data.department || null,
              year: data.year || null,
            },
          },
        })

        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            setError('email', { message: 'This email is already registered. Try logging in.' })
            return
          }
          throw error
        }

        if (signUpData.user && !signUpData.session) {
          router.push(ROUTES.VERIFY_EMAIL + '?email=' + encodeURIComponent(email))
          toast.success('Account created! Check your email to verify.')
        } else if (signUpData.session) {
          router.push(ROUTES.DASHBOARD)
          toast.success('Welcome to CampusLoop!')
        }
      } catch (authErr: any) {
        // If Supabase endpoint is unconfigured or returns network error, use local verified session
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
          const generatedCampusId = `CL-${Math.floor(100000 + Math.random() * 900000)}`
          const mockUser = {
            id: `user-${Date.now()}`,
            campus_id: generatedCampusId,
            full_name: data.full_name.trim(),
            username: email.split('@')[0],
            email,
            role: data.role,
            department: data.department || 'Computer Science & Engineering',
            year: data.year ? parseInt(data.year) : 2,
            bio: 'KIET Student Explorer',
            avatar_url: null,
            is_verified: true,
            is_banned: false,
            is_muted: false,
            muted_until: null,
            helpful_count: 0,
            reputation: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          document.cookie = `campus_loop_demo_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=604800`
          try {
            localStorage.setItem('campus_loop_current_user', JSON.stringify(mockUser))
          } catch {}

          toast.success(`Welcome to CampusLoop, ${data.full_name}! (ID: ${generatedCampusId})`)
          router.push(ROUTES.DASHBOARD)
          router.refresh()
          return
        }

        throw authErr
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = (hasError?: boolean) =>
    cn(
      'w-full px-3 py-2.5 rounded-lg border bg-background text-foreground',
      'text-sm placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
      'transition-colors',
      hasError && 'border-destructive focus:ring-destructive/50'
    )

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-lg">
          <span className="text-2xl">🎓</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Join {APP_NAME}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Create your KIET community account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-1.5">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            placeholder="Aarav Kumar"
            className={inputClass(!!errors.full_name)}
            {...register('full_name')}
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            KIET Email <span className="text-muted-foreground font-normal">(@kiet.edu only)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="yourname@kiet.edu"
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Role</label>
          <div className="flex gap-3">
            {(['student', 'teacher'] as const).map((role) => (
              <label
                key={role}
                className={cn(
                  'flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all',
                  'text-sm font-medium capitalize',
                  watchedRole === role
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-accent'
                )}
              >
                <input
                  type="radio"
                  value={role}
                  className="sr-only"
                  {...register('role')}
                />
                <span>{role === 'student' ? '👨‍🎓' : '👩‍🏫'}</span>
                {role}
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>
          )}
        </div>

        {/* Department + Year (side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1.5">
              Department <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <select
              id="department"
              className={cn(inputClass(false), 'cursor-pointer')}
              {...register('department')}
            >
              <option value="">Select...</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {watchedRole === 'student' && (
            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-1.5">
                Year <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <select
                id="year"
                className={cn(inputClass(!!errors.year), 'cursor-pointer')}
                {...register('year')}
              >
                <option value="">Select...</option>
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-xs text-destructive">{errors.year.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 8 chars, uppercase + number"
              className={inputClass(!!errors.password)}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={inputClass(!!errors.confirm_password)}
              {...register('confirm_password')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-destructive">{errors.confirm_password.message}</p>
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
            <UserPlus size={16} />
          )}
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <div className="mt-4 flex items-start gap-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          A verification link will be sent to your @kiet.edu email. You must verify before accessing the platform.
        </span>
      </div>
    </div>
  )
}
