'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Info,
  Search,
  Pin,
  X,
  Loader2,
  Flag,
  Share2
} from 'lucide-react'
import toast from 'react-hot-toast'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import GroupInfoPanel from './GroupInfoPanel'
import { MessageSkeleton } from '@/components/shared/SkeletonLoader'
import { copyToClipboard, cn } from '@/lib/utils'
import type {
  GroupWithMeta,
  MessageWithSender,
  Profile,
  UserRole,
  AttachmentType,
  MessageTag,
  ReportReason
} from '@/types'

interface ChatPanelProps {
  group: GroupWithMeta
  messages: MessageWithSender[]
  isLoadingMessages?: boolean
  hasMoreMessages?: boolean
  onLoadMore?: () => void
  currentUser: Profile
  onSendMessage: (data: {
    content: string
    tag: MessageTag
    replyToId?: string | null
    attachment?: {
      url: string
      name: string
      type: AttachmentType
      size: number
    } | null
  }) => Promise<void>
  onReact: (messageId: string, emoji: string) => void
  onHelpfulVote: (messageId: string) => void
  onMarkAnswer: (messageId: string, isAnswer: boolean) => void
  onPinMessage: (messageId: string, isPinned: boolean) => void
  onDeleteMessage: (messageId: string) => void
  onEditMessage: (messageId: string, content: string) => void
  onReportMessage: (messageId: string, reason: ReportReason, details?: string) => Promise<void>
  onTogglePinGroup?: (groupId: string, isPinned: boolean) => void
  onToggleMuteGroup?: (groupId: string, isMuted: boolean) => void
  typingUsers?: Profile[]
  onTyping?: () => void
  activeMembers?: Profile[]
}

export default function ChatPanel({
  group,
  messages,
  isLoadingMessages = false,
  hasMoreMessages = false,
  onLoadMore,
  currentUser,
  onSendMessage,
  onReact,
  onHelpfulVote,
  onMarkAnswer,
  onPinMessage,
  onDeleteMessage,
  onEditMessage,
  onReportMessage,
  onTogglePinGroup,
  onToggleMuteGroup,
  typingUsers = [],
  onTyping,
  activeMembers = [],
}: ChatPanelProps) {
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [replyingTo, setReplyingTo] = useState<MessageWithSender | null>(null)
  const [editingMessage, setEditingMessage] = useState<MessageWithSender | null>(null)
  const [reportTargetId, setReportTargetId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<ReportReason>('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [showChatSearch, setShowChatSearch] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isFirstLoadRef = useRef(true)

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  }, [])

  // Auto-scroll on initial load and when new messages arrive
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      if (isFirstLoadRef.current) {
        scrollToBottom(false)
        isFirstLoadRef.current = false
      } else {
        scrollToBottom(true)
      }
    }
  }, [messages.length, isLoadingMessages, scrollToBottom])

  // Infinite scroll listener
  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoadingMessages || !hasMoreMessages) return
    if (scrollContainerRef.current.scrollTop === 0) {
      onLoadMore?.()
    }
  }

  // Filter messages if in-chat search active
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
        m.sender?.full_name?.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : messages

  // Pinned messages & shared file resources
  const pinnedMessages = messages.filter((m) => m.is_pinned && !m.is_deleted)
  const sharedResources = messages.filter((m) => m.attachment_url && !m.is_deleted)

  const handleShareGroupLink = async () => {
    const url = window.location.href
    const copied = await copyToClipboard(url)
    if (copied) toast.success('Group link copied to clipboard!')
  }

  const submitReport = async () => {
    if (!reportTargetId) return
    setIsReporting(true)
    try {
      await onReportMessage(reportTargetId, reportReason, reportDetails)
      toast.success('Report submitted to KIET moderators')
      setReportTargetId(null)
      setReportDetails('')
    } catch {
      toast.error('Failed to submit report')
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Center Chat View */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-16 px-4 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Back Button to list */}
            <Link
              href="/dashboard"
              className="md:hidden p-1.5 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <ArrowLeft size={20} />
            </Link>

            {/* Group Avatar & Info */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-border/50 cursor-pointer"
              style={{ backgroundColor: `${group.color}20` }}
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              {group.icon}
            </div>

            <div
              className="min-w-0 cursor-pointer"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
            >
              <h2 className="text-sm font-bold truncate text-foreground flex items-center gap-1.5">
                <span>{group.name}</span>
                {group.user_prefs?.is_pinned && (
                  <Pin size={12} className="text-amber-500 fill-amber-500 rotate-45" />
                )}
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                {activeMembers.length > 0 ? `${activeMembers.length} active members • ` : ''}
                {group.description ? group.description : 'Open educational room'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Chat search button */}
            <button
              type="button"
              onClick={() => setShowChatSearch(!showChatSearch)}
              className={cn(
                'p-2 rounded-xl transition-colors cursor-pointer',
                showChatSearch
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Search within group"
            >
              <Search size={18} />
            </button>

            {/* Share group link */}
            <button
              type="button"
              onClick={handleShareGroupLink}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Copy group link"
            >
              <Share2 size={18} />
            </button>

            {/* Toggle Info Panel */}
            <button
              type="button"
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className={cn(
                'p-2 rounded-xl transition-colors cursor-pointer',
                showInfoPanel
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Group information"
            >
              <Info size={18} />
            </button>
          </div>
        </header>

        {/* In-chat search bar */}
        {showChatSearch && (
          <div className="p-2.5 bg-muted/60 border-b border-border flex items-center gap-2 animate-fade-in shrink-0">
            <Search size={15} className="text-muted-foreground ml-2" />
            <input
              type="text"
              autoFocus
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              placeholder="Search words or authors in this room..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            {chatSearchQuery && (
              <button
                type="button"
                onClick={() => setChatSearchQuery('')}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowChatSearch(false)
                setChatSearchQuery('')
              }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
            >
              Done
            </button>
          </div>
        )}

        {/* Pinned message strip banner at top of chat */}
        {pinnedMessages.length > 0 && !showChatSearch && (
          <div
            onClick={() => setShowInfoPanel(true)}
            className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs cursor-pointer hover:bg-amber-500/15 transition-colors shrink-0"
          >
            <div className="flex items-center gap-2 truncate">
              <Pin size={13} className="text-amber-500 fill-amber-500 rotate-45 shrink-0" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Pinned:
              </span>
              <span className="truncate text-foreground/80">
                {pinnedMessages[pinnedMessages.length - 1].content}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground underline ml-2 shrink-0">
              View all ({pinnedMessages.length})
            </span>
          </div>
        )}

        {/* Message Feed Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-2 md:px-4 py-3 chat-messages-scroll"
        >
          {/* Loading indicator on top for infinite scroll */}
          {hasMoreMessages && (
            <div className="flex justify-center py-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMessages}
                className="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                {isLoadingMessages && <Loader2 size={12} className="animate-spin" />}
                Load earlier messages
              </button>
            </div>
          )}

          {isLoadingMessages && messages.length === 0 ? (
            <MessageSkeleton />
          ) : displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-xs border border-border/60"
                style={{ backgroundColor: `${group.color}20` }}
              >
                {group.icon}
              </div>
              <h3 className="font-bold text-base text-foreground mb-1">
                Welcome to {group.name}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {group.description || 'This room is open to every verified KIET student and faculty member.'}
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
                onReply={(m) => setReplyingTo(m)}
                onEdit={(m) => setEditingMessage(m)}
                onDelete={onDeleteMessage}
                onReact={onReact}
                onHelpfulVote={onHelpfulVote}
                onMarkAnswer={onMarkAnswer}
                onPinMessage={onPinMessage}
                onReport={(id) => setReportTargetId(id)}
              />
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator */}
        <TypingIndicator users={typingUsers} />

        {/* Message Input Form */}
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          replyingTo={replyingTo}
          editingMessage={editingMessage}
          onCancelReply={() => setReplyingTo(null)}
          onCancelEdit={() => setEditingMessage(null)}
          currentUserRole={currentUser.role}
        />
      </div>

      {/* Right Info Drawer (Desktop) */}
      {showInfoPanel && (
        <GroupInfoPanel
          group={group}
          pinnedMessages={pinnedMessages}
          resources={sharedResources}
          members={activeMembers}
          onClose={() => setShowInfoPanel(false)}
          onTogglePinGroup={onTogglePinGroup}
          onToggleMuteGroup={onToggleMuteGroup}
        />
      )}

      {/* Report Modal */}
      {reportTargetId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl animate-fade-in space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <Flag size={20} />
              <h3 className="font-bold text-base text-foreground">Report Message</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Please specify the reason this message violates KIET community guidelines.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Violation Type</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
              >
                <option value="spam">Spam / Advertisements</option>
                <option value="inappropriate">Inappropriate / Obscene content</option>
                <option value="misinformation">Misinformation / Fake academic notices</option>
                <option value="harassment">Harassment / Bullying</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Details (Optional)</label>
              <textarea
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Explain what is wrong with this post..."
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background resize-none focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportTargetId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReporting}
                onClick={submitReport}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isReporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
