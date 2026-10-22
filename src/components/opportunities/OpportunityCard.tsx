'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  ExternalLink,
  Bookmark,
  MessageSquare,
  Building,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '@/components/shared/Avatar'
import RoleBadge from '@/components/shared/RoleBadge'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { OpportunityCard as OpportunityType } from '@/types'

interface OpportunityCardProps {
  item: OpportunityType
  isBookmarked?: boolean
  onToggleBookmark?: (id: string, bookmarked: boolean) => void
}

export default function OpportunityCard({
  item,
  isBookmarked = false,
  onToggleBookmark,
}: OpportunityCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked)

  // Extract external link from message content if present
  const urlMatch = item.content.match(/(https?:\/\/[^\s]+)/)
  const externalLink = urlMatch ? urlMatch[0] : null

  // Clean description removing URL for cleaner card reading
  const cleanDescription = externalLink
    ? item.content.replace(externalLink, '').trim()
    : item.content

  const handleBookmark = () => {
    const next = !bookmarked
    setBookmarked(next)
    onToggleBookmark?.(item.id, next)
    toast.success(next ? 'Saved to bookmarks' : 'Removed from bookmarks')
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Group origin & Bookmark */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/dashboard/g/${item.group_id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-full transition-colors"
          >
            <span>{item.group_icon}</span>
            <span>{item.group_name}</span>
          </Link>

          <button
            type="button"
            onClick={handleBookmark}
            className={cn(
              'p-1.5 rounded-lg border transition-colors cursor-pointer',
              bookmarked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark opportunity'}
          >
            <Bookmark
              size={16}
              className={bookmarked ? 'fill-amber-500' : ''}
            />
          </button>
        </div>

        {/* Poster identity */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar profile={item.sender} size="xs" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium text-foreground truncate">
              {item.sender.full_name}
            </span>
            <RoleBadge role={item.sender.role} compact />
            <span className="text-[10px] text-muted-foreground">
              • {formatRelativeTime(item.created_at)}
            </span>
          </div>
        </div>

        {/* Opportunity Content */}
        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed line-clamp-4 mb-4">
          {cleanDescription || item.content}
        </p>
      </div>

      {/* Footer CTA Buttons */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-2">
        <Link
          href={`/dashboard/g/${item.group_id}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <MessageSquare size={13} />
          <span>Discuss in room</span>
        </Link>

        {externalLink ? (
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <span>Apply / View</span>
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">
            Check post details
          </span>
        )}
      </div>
    </div>
  )
}
