'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  MessageSquare,
  Search,
  Sparkles,
  User,
  Shield,
  LogOut,
  GraduationCap
} from 'lucide-react'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/shared/ThemeToggle'
import Avatar from '@/components/shared/Avatar'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface SidebarProps {
  currentUser: Profile | null
}

export default function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push(ROUTES.LOGIN)
      router.refresh()
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const navItems = [
    {
      label: 'Groups',
      icon: MessageSquare,
      href: ROUTES.DASHBOARD,
      active: pathname === ROUTES.DASHBOARD || pathname.startsWith('/dashboard/g/'),
    },
    {
      label: 'Search',
      icon: Search,
      href: ROUTES.SEARCH,
      active: pathname === ROUTES.SEARCH,
    },
    {
      label: 'Opportunities',
      icon: Sparkles,
      href: ROUTES.OPPORTUNITIES,
      active: pathname === ROUTES.OPPORTUNITIES,
    },
    {
      label: 'Profile',
      icon: User,
      href: ROUTES.PROFILE,
      active: pathname === ROUTES.PROFILE,
    },
  ]

  if (currentUser?.role === 'admin') {
    navItems.push({
      label: 'Admin',
      icon: Shield,
      href: ROUTES.ADMIN,
      active: pathname.startsWith('/admin'),
    })
  }

  return (
    <>
      {/* Desktop Narrow Rail */}
      <aside
        className={cn(
          'hidden md:flex flex-col items-center justify-between',
          'w-16 h-screen py-4 border-r border-border bg-card/60 backdrop-blur-md shrink-0 z-30'
        )}
      >
        {/* Top: Logo & Nav items */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
            title="CampusLoop Home"
          >
            <GraduationCap size={22} />
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all relative group',
                    item.active
                      ? 'bg-primary/15 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  title={item.label}
                >
                  <Icon size={20} />
                  {/* Tooltip on hover */}
                  <span className="absolute left-14 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-border">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom: User avatar, theme toggle, logout */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <ThemeToggle compact />

          {currentUser && (
            <Link href={ROUTES.PROFILE} title="Your Profile" className="relative">
              <Avatar
                profile={currentUser}
                size="sm"
                className="hover:ring-2 hover:ring-primary transition-all"
              />
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Hidden when inside active chat room) */}
      <nav
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around px-2 z-40',
          pathname.startsWith('/dashboard/g/') && 'hidden'
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs transition-colors',
                item.active
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={18} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut size={18} />
          <span className="text-[10px] mt-0.5">Logout</span>
        </button>
      </nav>
    </>
  )
}
