import type { Profile } from '@/types'

interface TypingIndicatorProps {
  users: Profile[]
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (!users || users.length === 0) return null

  const names =
    users.length === 1
      ? users[0].full_name
      : users.length === 2
      ? `${users[0].full_name} and ${users[1].full_name}`
      : `${users[0].full_name} and ${users.length - 1} others`

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground animate-fade-in select-none">
      <div className="flex items-center gap-1 bg-muted/80 px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot [animation-delay:0.4s]" />
      </div>
      <span className="truncate">{names} {users.length > 1 ? 'are' : 'is'} typing...</span>
    </div>
  )
}
