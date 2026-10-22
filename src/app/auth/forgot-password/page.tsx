'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )
      if (error) throw error
      setSent(true)
      toast.success('Password reset link sent to your email')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-indigo-950/20">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <CheckCircle2 size={44} className="text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a password reset link to <strong>{getValues('email')}</strong>.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 text-primary font-medium text-sm hover:underline"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-indigo-950/20">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold mb-1">Reset Password</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your registered KIET email address to receive password reset instructions.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                KIET Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="yourname@kiet.edu"
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border bg-background text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  errors.email && 'border-destructive'
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 cursor-pointer transition-colors shadow-xs"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{isLoading ? 'Sending link…' : 'Send Reset Link'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
