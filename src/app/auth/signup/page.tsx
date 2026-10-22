import type { Metadata } from 'next'
import SignupForm from '@/components/auth/SignupForm'

export const metadata: Metadata = {
  title: 'Create Account | CampusLoop',
  description: 'Create your verified KIET account on CampusLoop',
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-indigo-950/20">
      <div className="w-full max-w-md py-8">
        <SignupForm />
      </div>
    </main>
  )
}
