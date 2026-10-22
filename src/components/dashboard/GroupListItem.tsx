'use client'

import Link from 'next/link'
import { Pin, VolumeX, Image as ImageIcon, FileText } from 'lucide-react'
import UnreadBadge from './UnreadBadge'
import { formatGroupListTime, truncate, cn } from '@/lib/utils'
import type { GroupWithMeta } from '@/types'

interface GroupListItemProps {
  group: GroupWithMeta
  isActive: boolean
  onClick?: () => void
}

export default function GroupListItem({
  group,
  isActive,
  onClick,
}: GroupListItemProps) {
  const lastMsg = group.last_message
  const isPinned = group.user_prefs?.is_pinned
  const isMuted = group.user_prefs?.is_muted
  const unreadCount = group.unread_count || 0

  const renderLastMessagePreview = () => {
    if (!lastMsg) {
      return (
        <span className="text-muted-foreground/60 text-xs">
          Tap to start discussing in this room
        </span>
      )
    }

    let myId = ''
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campus_loop_current_user')
        if (stored) myId = JSON.parse(stored).id
      } catch {}
    }

    const isMe = !!myId && (lastMsg as any).sender_id === myId
    const senderPrefix = isMe
      ? 'You: '
      : lastMsg.sender?.full_name
      ? `${lastMsg.sender.full_name.split(' ')[0]}: `
      : ''

    if (lastMsg.attachment_url) {
      if (lastMsg.attachment_type === 'image') {
        return (
          <span className="flex items-center gap-1 text-xs">
            <ImageIcon size={13} className="text-primary shrink-0" />
            <span>{senderPrefix}Photo {lastMsg.content ? `• ${truncate(lastMsg.content, 20)}` : ''}</span>
          </span>
        )
      }
      return (
        <span className="flex items-center gap-1 text-xs">
          <FileText size={13} className="text-primary shrink-0" />
          <span>{senderPrefix}Attachment {lastMsg.content ? `• ${truncate(lastMsg.content, 20)}` : ''}</span>
        </span>
      )
    }

    return (
      <span className="text-xs">
        <strong className={cn(isMe ? 'text-primary font-semibold' : 'text-foreground/90 font-medium')}>
          {senderPrefix}
        </strong>
        <span className="text-muted-foreground">{truncate(lastMsg.content || '', 35)}</span>
      </span>
    )
  }

  return (
    <Link
      href={`/dashboard/g/${group.id}`}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all select-none',
        'border border-transparent text-left w-full cursor-pointer',
        isActive
          ? 'bg-primary/10 border-primary/20 text-foreground font-medium'
          : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
      )}
    >
      {/* Group Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs border border-border/40"
        style={{ backgroundColor: `${group.color}15` }}
      >
        <span role="img" aria-label={group.name}>
          {group.icon || '💬'}
        </span>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={cn(
              'text-sm truncate font-semibold',
              isActive ? 'text-primary' : 'text-foreground'
            )}
          >
            {group.name}
          </h4>

          {/* Timestamp */}
          {lastMsg?.created_at && (
            <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 ml-1">
              {formatGroupListTime(lastMsg.created_at)}
            </span>
          )}
        </div>

        {/* Preview & Status Badges */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="truncate flex-1">
            {renderLastMessagePreview()}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isMuted && (
              <VolumeX size={13} className="text-muted-foreground/60" />
            )}
            {isPinned && (
              <Pin size={13} className="text-amber-500 fill-amber-500 rotate-45" />
            )}
            <UnreadBadge count={unreadCount} />
          </div>
        </div>
      </div>
    </Link>
  )
}
