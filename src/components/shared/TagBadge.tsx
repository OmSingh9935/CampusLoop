import { cn, TAG_COLORS, TAG_LABELS } from '@/lib/utils'
import type { MessageTag } from '@/types'

export default function TagBadge({
  tag,
  className,
}: {
  tag: MessageTag
  className?: string
}) {
  if (tag === 'general') return null
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent',
        TAG_COLORS[tag] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {TAG_LABELS[tag] || tag}
    </span>
  )
}
