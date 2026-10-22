import Link from 'next/link'
import {
  Shield,
  Users,
  FolderTree,
  Flag,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { ROUTES } from '@/lib/constants'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminNav = [
    { label: 'Overview', icon: LayoutDashboard, href: ROUTES.ADMIN },
    { label: 'Users & Roles', icon: Users, href: ROUTES.ADMIN_USERS },
    { label: 'Group Management', icon: FolderTree, href: ROUTES.ADMIN_GROUPS },
    { label: 'Reports & Moderation', icon: Flag, href: ROUTES.ADMIN_REPORTS },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card/60 backdrop-blur-sm flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-black text-lg">
              <Shield size={24} />
              <span>CampusLoop Admin</span>
            </div>
            <ThemeToggle compact />
          </div>

          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-border/60">
          <Link
            href={ROUTES.DASHBOARD}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to KIET Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 bg-background">
        {children}
      </main>
    </div>
  )
}
