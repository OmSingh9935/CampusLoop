import { cn } from '@/lib/utils'

interface UnreadBadgeProps {
  count: number
  className?: string
}

export default function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (!count || count <= 0) return null

  const displayCount = count > 99 ? '99+' : count

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] h-5',
        'text-[11px] font-bold rounded-full bg-emerald-500 text-white shadow-xs',
        className
      )}
      aria-label={`${count} unread messages`}
    >
      {displayCount}
    </span>
  )
}
