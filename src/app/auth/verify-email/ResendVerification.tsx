'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function ResendVerification({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleResend = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
      setSent(true)
      toast.success('Verification email resent successfully!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isLoading || sent}
      className={cn(
        'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg cursor-pointer',
        'bg-primary text-primary-foreground text-sm font-medium',
        'hover:bg-primary/90 transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed shadow-xs'
      )}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <RefreshCw size={16} />
      )}
      <span>{sent ? 'Verification link sent!' : 'Resend verification email'}</span>
    </button>
  )
}
