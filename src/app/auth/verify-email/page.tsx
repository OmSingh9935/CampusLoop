import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import ResendVerification from './ResendVerification'

export const metadata: Metadata = {
  title: 'Verify Your Email | CampusLoop',
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-indigo-950/20">
      <div className="w-full max-w-md text-center">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-6">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-muted-foreground text-sm mb-3">
            We sent a verification link to your KIET email
          </p>
          {email && (
            <div className="inline-block px-3 py-1 bg-secondary text-primary font-semibold rounded-md mb-4 text-sm border border-primary/20">
              {email}
            </div>
          )}
          <p className="text-muted-foreground text-sm mb-6">
            Click the link inside the email to verify your address and gain immediate access to all groups.
          </p>

          <div className="space-y-3">
            {email && <ResendVerification email={email} />}
            <Link
              href={ROUTES.LOGIN}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>

          <div className="mt-6 flex items-start gap-2 p-3 bg-muted/60 rounded-lg text-xs text-muted-foreground text-left">
            <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
            <span>
              CampusLoop strictly requires verified @kiet.edu credentials to protect student integrity and academic discussions.
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
