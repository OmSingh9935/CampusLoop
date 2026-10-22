'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/**
 * DashboardShell wraps the group-list + main-content area.
 * On mobile it shows EITHER the group list OR the main content (never both).
 * On desktop both are always visible side by side.
 */
export default function DashboardShell({
  groupList,
  children,
}: {
  groupList: React.ReactNode
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // If we're on a child route (group chat, search, opportunities, profile)
  // then on mobile we should show the content, not the group list
  const isOnChildRoute = pathname !== '/dashboard'

  return (
    <>
      {/* Group list panel */}
      <div
        className={cn(
          'h-full flex flex-col shrink-0 border-r border-border',
          // Desktop: always visible, fixed width
          'md:w-80 lg:w-96 md:flex',
          // Mobile: full width when showing group list, hidden when on child route
          isOnChildRoute ? 'hidden md:flex' : 'flex w-full'
        )}
      >
        {groupList}
      </div>

      {/* Main content area */}
      <main
        className={cn(
          'h-full min-w-0 overflow-hidden relative',
          // Desktop: always flex-1
          'md:flex-1 md:block',
          // Mobile: only show when on a child route
          isOnChildRoute ? 'flex-1 block' : 'hidden'
        )}
      >
        {children}
      </main>
    </>
  )
}
