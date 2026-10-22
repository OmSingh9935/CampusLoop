'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Check,
  CheckCheck,
  ThumbsUp,
  Reply,
  Pin,
  MoreVertical,
  Edit2,
  Trash2,
  Flag,
  FileText,
  Download,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import RoleBadge from '@/components/shared/RoleBadge'
import TagBadge from '@/components/shared/TagBadge'
import { formatMessageTime, formatFileSize, cn } from '@/lib/utils'
import { QUICK_REACTIONS } from '@/lib/constants'
import type { MessageWithSender, Profile, UserRole } from '@/types'

interface MessageBubbleProps {
  message: MessageWithSender
  currentUserId: string
  currentUserRole: UserRole
  onReply?: (message: MessageWithSender) => void
  onEdit?: (message: MessageWithSender) => void
  onDelete?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
  onHelpfulVote?: (messageId: string) => void
  onMarkAnswer?: (messageId: string, isAnswer: boolean) => void
  onPinMessage?: (messageId: string, isPinned: boolean) => void
  onReport?: (messageId: string) => void
  highlighted?: boolean
}

export default function MessageBubble({
  message,
  currentUserId,
  currentUserRole,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onHelpfulVote,
  onMarkAnswer,
  onPinMessage,
  onReport,
  highlighted = false,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const isOwn = message.sender_id === currentUserId
  const isTeacherOrAdmin = currentUserRole === 'teacher' || currentUserRole === 'admin'
  const isDeleted = message.is_deleted

  // Highlight URL links in content
  const renderFormattedContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g

    const parts = text.split(/((?:https?:\/\/[^\s]+)|(?:@[a-zA-Z0-9_]+))/g)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{part}</span>
            <ExternalLink size={11} className="inline ml-0.5 opacity-70" />
          </a>
        )
      }
      if (mentionRegex.test(part)) {
        return (
          <span
            key={index}
            className="font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded-sm"
          >
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  if (isDeleted) {
    return (
      <div className={cn('flex items-center gap-2 my-1 px-4 text-xs italic text-muted-foreground/60', isOwn ? 'justify-end' : 'justify-start')}>
        <span>This message was deleted</span>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowEmojiPicker(false)
      }}
      className={cn(
        'group relative flex gap-2.5 my-1.5 px-3 py-1 rounded-xl transition-colors',
        highlighted && 'bg-primary/10 ring-1 ring-primary/30',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Sender Avatar (Only for others' messages) */}
      {!isOwn && (
        <div className="shrink-0 mt-1">
          <Avatar profile={message.sender || { id: message.sender_id, full_name: 'Member', campus_id: 'CL-000000', email: '', role: 'student', is_verified: true, is_banned: false, is_muted: false, muted_until: null, helpful_count: 0, reputation: 0, created_at: '', updated_at: '', username: null, department: null, year: null, bio: null, avatar_url: null }} size="sm" />
        </div>
      )}

      {/* Bubble container */}
      <div
        className={cn(
          'relative max-w-[85%] md:max-w-[70%] rounded-2xl p-3 shadow-xs transition-shadow',
          message.is_pinned && 'ring-2 ring-amber-500/30',
          message.is_answer && 'ring-2 ring-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-xs'
            : 'bg-card border border-border/80 text-foreground rounded-bl-xs'
        )}
      >
        {/* Pinned & Answer Indicators */}
        {(message.is_pinned || message.is_answer) && (
          <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-current/10 text-xs">
            {message.is_pinned && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-500 text-[11px]">
                <Pin size={11} className="fill-amber-500 rotate-45" /> Pinned
              </span>
            )}
            {message.is_answer && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-500 text-[11px]">
                <Check size={12} className="stroke-[3]" /> Verified Answer
              </span>
            )}
          </div>
        )}

        {/* Sender Name, Campus ID, and Role Badge */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-bold text-foreground">
              {message.sender?.full_name || 'KIET Member'}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {message.sender?.campus_id || 'CL-000000'}
            </span>
            <RoleBadge role={message.sender?.role || 'student'} compact />
            {message.tag && <TagBadge tag={message.tag} />}
          </div>
        )}

        {/* Own Tag Badge */}
        {isOwn && message.tag && message.tag !== 'general' && (
          <div className="mb-1">
            <TagBadge tag={message.tag} />
          </div>
        )}

        {/* Replied-To / Quoted Message */}
        {message.reply_to && (
          <div
            className={cn(
              'mb-2 p-2 rounded-lg text-xs border-l-3 select-none',
              isOwn
                ? 'bg-primary-foreground/10 border-primary-foreground/40 text-primary-foreground/90'
                : 'bg-muted/70 border-primary/50 text-muted-foreground'
            )}
          >
            <div className="font-semibold text-[11px] mb-0.5">
              {message.reply_to.sender?.full_name || 'User'}
            </div>
            <div className="line-clamp-2">
              {message.reply_to.content}
            </div>
          </div>
        )}

        {/* Attachment Display (Image or File) */}
        {message.attachment_url && (
          <div className="mb-2">
            {message.attachment_type === 'image' ? (
              <div className="relative rounded-xl overflow-hidden max-w-sm max-h-72 border border-border/50">
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full h-56"
                >
                  <Image
                    src={message.attachment_url}
                    alt={message.attachment_name || 'Attached image'}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </a>
              </div>
            ) : (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl border transition-colors',
                  isOwn
                    ? 'bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/15 text-primary-foreground'
                    : 'bg-muted/60 border-border hover:bg-muted text-foreground'
                )}
              >
                <div className="p-2 rounded-lg bg-background/60">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">
                    {message.attachment_name || 'Document'}
                  </p>
                  {message.attachment_size && (
                    <p className="text-[10px] opacity-75">
                      {formatFileSize(message.attachment_size)}
                    </p>
                  )}
                </div>
                <Download size={16} className="opacity-75" />
              </a>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className="text-sm break-words whitespace-pre-wrap leading-relaxed select-text">
          {renderFormattedContent(message.content)}
        </div>

        {/* Footer: Time, Edited status, Read receipt */}
        <div
          className={cn(
            'flex items-center justify-end gap-1.5 mt-1 text-[10px] select-none',
            isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'
          )}
        >
          {message.is_edited && <span>(edited)</span>}
          <span>{formatMessageTime(message.created_at)}</span>
          {isOwn && (
            <CheckCheck size={13} className="text-primary-foreground/90" />
          )}
        </div>

        {/* Reaction badges underneath message */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => onReact?.(message.id, reaction.emoji)}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all cursor-pointer border',
                  reaction.user_reacted
                    ? 'bg-primary/20 border-primary/50 text-foreground font-semibold'
                    : 'bg-background/80 border-border/60 hover:bg-muted text-muted-foreground'
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-[10px]">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar on hover */}
      {showActions && (
        <div
          className={cn(
            'absolute top-0 z-20 flex items-center gap-0.5 bg-background border border-border rounded-xl px-1.5 py-1 shadow-md animate-fade-in',
            isOwn ? 'right-0 -translate-y-8' : 'left-10 -translate-y-8'
          )}
        >
          {/* Quick emoji reactions */}
          {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact?.(message.id, emoji)}
              className="p-1 hover:bg-muted rounded-lg text-sm cursor-pointer hover:scale-110 transition-transform"
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-border mx-1" />

          {/* Reply */}
          <button
            type="button"
            onClick={() => onReply?.(message)}
            className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reply"
          >
            <Reply size={15} />
          </button>

          {/* Helpful Upvote */}
          <button
            type="button"
            onClick={() => onHelpfulVote?.(message.id)}
            className={cn(
              'flex items-center gap-1 p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-emerald-500 cursor-pointer',
              message.user_has_voted_helpful && 'text-emerald-500 font-bold'
            )}
            title="Upvote as helpful"
          >
            <ThumbsUp size={14} />
            {message.helpful_count > 0 && (
              <span className="text-[10px]">{message.helpful_count}</span>
            )}
          </button>

          {/* Mark as Answer (Faculty or Question Asker) */}
          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={() => onMarkAnswer?.(message.id, !message.is_answer)}
              className={cn(
                'p-1 hover:bg-muted rounded-lg cursor-pointer',
                message.is_answer
                  ? 'text-emerald-500 font-bold'
                  : 'text-muted-foreground hover:text-emerald-500'
              )}
              title={message.is_answer ? 'Unmark as answer' : 'Mark as verified answer'}
            >
              <Check size={15} />
            </button>
          )}

          {/* Pin Message (Faculty / Admin) */}
          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={() => onPinMessage?.(message.id, !message.is_pinned)}
              className={cn(
                'p-1 hover:bg-muted rounded-lg cursor-pointer',
                message.is_pinned
                  ? 'text-amber-500'
                  : 'text-muted-foreground hover:text-amber-500'
              )}
              title={message.is_pinned ? 'Unpin message' : 'Pin message'}
            >
              <Pin size={14} className={message.is_pinned ? 'fill-amber-500 rotate-45' : ''} />
            </button>
          )}

          {/* Edit own message */}
          {isOwn && (
            <button
              type="button"
              onClick={() => onEdit?.(message)}
              className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Edit message"
            >
              <Edit2 size={14} />
            </button>
          )}

          {/* Delete (Own message or Admin) */}
          {(isOwn || currentUserRole === 'admin') && (
            <button
              type="button"
              onClick={() => onDelete?.(message.id)}
              className="p-1 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
              title="Delete message"
            >
              <Trash2 size={14} />
            </button>
          )}

          {/* Report */}
          {!isOwn && (
            <button
              type="button"
              onClick={() => onReport?.(message.id)}
              className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive cursor-pointer"
              title="Report message"
            >
              <Flag size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
