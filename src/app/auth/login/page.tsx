import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | CampusLoop',
  description: 'Sign in to CampusLoop with your KIET student or faculty email',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-slate-950 dark:via-background dark:to-indigo-950/20">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
