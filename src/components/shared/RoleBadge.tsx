import { cn, ROLE_COLORS } from '@/lib/utils'
import type { UserRole } from '@/types'

interface RoleBadgeProps {
  role: UserRole
  className?: string
  compact?: boolean
}

const ROLE_ICONS: Record<UserRole, string> = {
  student: '🎓',
  teacher: '🧑‍🏫',
  admin: '🛡️',
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Faculty',
  admin: 'Admin',
}

export default function RoleBadge({ role, className, compact = false }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-transparent shadow-xs',
        ROLE_COLORS[role] || 'bg-muted text-muted-foreground',
        className
      )}
      aria-label={`Role: ${ROLE_LABELS[role]}`}
    >
      <span aria-hidden>{ROLE_ICONS[role]}</span>
      {!compact && <span>{ROLE_LABELS[role]}</span>}
    </span>
  )
}
