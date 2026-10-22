import Image from 'next/image'
import { cn, getAvatarUrl, getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

interface AvatarProps {
  profile: Pick<Profile, 'full_name' | 'avatar_url' | 'id'>
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showOnline?: boolean
}

const SIZE_MAP = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', online: 'w-1.5 h-1.5' },
  sm: { container: 'w-8 h-8', text: 'text-xs', online: 'w-2 h-2' },
  md: { container: 'w-10 h-10', text: 'text-sm', online: 'w-2.5 h-2.5' },
  lg: { container: 'w-12 h-12', text: 'text-base', online: 'w-3 h-3' },
  xl: { container: 'w-16 h-16', text: 'text-lg', online: 'w-3.5 h-3.5' },
}

export default function Avatar({
  profile,
  size = 'md',
  className,
  showOnline = false,
}: AvatarProps) {
  const sizes = SIZE_MAP[size]
  const initials = getInitials(profile.full_name || 'User')
  const avatarUrl = getAvatarUrl(profile.avatar_url, profile.full_name, profile.id)

  return (
    <div className={cn('relative shrink-0', sizes.container, className)}>
      <div
        className={cn(
          'w-full h-full rounded-full overflow-hidden',
          'bg-primary/10 flex items-center justify-center',
          'ring-2 ring-background relative'
        )}
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name || 'User avatar'}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className={cn('font-semibold text-primary select-none', sizes.text)}>
            {initials}
          </span>
        )}
      </div>
      {showOnline && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full bg-emerald-500',
            'ring-2 ring-background',
            sizes.online
          )}
          aria-label="Online"
        />
      )}
    </div>
  )
}
