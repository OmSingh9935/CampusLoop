'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  Smile,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Tag,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import TagBadge from '@/components/shared/TagBadge'
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  QUICK_REACTIONS
} from '@/lib/constants'
import { formatFileSize, getAttachmentType, cn } from '@/lib/utils'
import type {
  MessageTag,
  MessageWithSender,
  AttachmentType,
  UserRole
} from '@/types'

interface MessageInputProps {
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
  onTyping?: () => void
  replyingTo: MessageWithSender | null
  editingMessage: MessageWithSender | null
  onCancelReply: () => void
  onCancelEdit: () => void
  currentUserRole: UserRole
}

export default function MessageInput({
  onSendMessage,
  onTyping,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  currentUserRole,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const [selectedTag, setSelectedTag] = useState<MessageTag>('general')
  const [showTagMenu, setShowTagMenu] = useState(false)
  const [showEmojiMenu, setShowEmojiMenu] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachment, setAttachment] = useState<{
    url: string
    name: string
    type: AttachmentType
    size: number
  } | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Populate when editing
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content)
      setSelectedTag(editingMessage.tag)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [editingMessage])

  // Focus on reply
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  // Auto-resize textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    onTyping?.()

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`
    }
  }

  // Handle file select and mock or upload to API
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to upload attachment')
      }

      const result = await res.json()
      setAttachment({
        url: result.url,
        name: result.name,
        type: result.type,
        size: result.size,
      })
      toast.success('File attached')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast.error(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed && !attachment) return

    setIsSubmitting(true)
    try {
      await onSendMessage({
        content: trimmed,
        tag: selectedTag,
        replyToId: replyingTo?.id || null,
        attachment,
      })

      // Reset
      setContent('')
      setAttachment(null)
      setSelectedTag('general')
      if (replyingTo) onCancelReply()
      if (editingMessage) onCancelEdit()

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const availableTags: { tag: MessageTag; label: string; icon: string }[] = [
    { tag: 'general', label: 'General', icon: '💬' },
    { tag: 'question', label: 'Question', icon: '❓' },
    { tag: 'answer', label: 'Answer', icon: '✅' },
    { tag: 'resource', label: 'Resource', icon: '📎' },
    { tag: 'opportunity', label: 'Opportunity', icon: '🌟' },
  ]

  // Only teachers and admins can post announcements
  if (currentUserRole === 'teacher' || currentUserRole === 'admin') {
    availableTags.push({ tag: 'announcement', label: 'Announcement', icon: '📢' })
  }

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm p-3 relative shrink-0">
      {/* Replying-To preview banner */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-muted/80 px-3 py-1.5 rounded-lg mb-2 text-xs border-l-4 border-primary">
          <div className="truncate">
            <span className="font-semibold text-primary">
              Replying to {replyingTo.sender.full_name}:{' '}
            </span>
            <span className="text-muted-foreground truncate">
              {replyingTo.content}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-muted-foreground hover:text-foreground ml-2 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editing message preview banner */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-amber-500/10 px-3 py-1.5 rounded-lg mb-2 text-xs border-l-4 border-amber-500 text-amber-600 dark:text-amber-400">
          <span className="font-semibold">Editing message</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="hover:text-foreground ml-2 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attached file preview */}
      {attachment && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg mb-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            {attachment.type === 'image' ? (
              <ImageIcon size={14} className="text-primary" />
            ) : (
              <FileText size={14} className="text-primary" />
            )}
            <span className="font-medium truncate">{attachment.name}</span>
            <span className="text-muted-foreground">({formatFileSize(attachment.size)})</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main input control bar */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          title="Attach file (images, PDFs, docs up to 10MB)"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin text-primary" />
          ) : (
            <Paperclip size={18} />
          )}
        </button>

        {/* Tag selection dropdown button */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTagMenu(!showTagMenu)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border',
              selectedTag !== 'general'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'hover:bg-muted border-border text-muted-foreground hover:text-foreground'
            )}
            title="Categorize message tag"
          >
            <Tag size={13} />
            <span className="capitalize">{selectedTag}</span>
          </button>

          {/* Tag popup picker */}
          {showTagMenu && (
            <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-xl shadow-lg p-1.5 w-48 z-50 animate-fade-in space-y-0.5">
              <div className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
                Select Message Tag
              </div>
              {availableTags.map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => {
                    setSelectedTag(item.tag)
                    setShowTagMenu(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
                    selectedTag === item.tag
                      ? 'bg-primary/15 text-primary'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {selectedTag === item.tag && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Emoji toggle */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Emoji reaction"
          >
            <Smile size={18} />
          </button>

          {showEmojiMenu && (
            <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-xl shadow-lg p-2 z-50 flex items-center gap-1.5 animate-fade-in">
              {QUICK_REACTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    setContent((prev) => prev + em)
                    setShowEmojiMenu(false)
                    textareaRef.current?.focus()
                  }}
                  className="p-1 hover:bg-muted rounded-lg text-base cursor-pointer hover:scale-115 transition-transform"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTag === 'question'
                ? 'Ask your doubt clearly (mention subject, error, code)...'
                : selectedTag === 'opportunity'
                ? 'Share internship, scholarship, or bootcamp (include deadlines/links)...'
                : 'Type a message in this group... (Press Enter to send, Shift+Enter for newline)'
            }
            className={cn(
              'w-full resize-none max-h-36 py-2 px-3 text-sm rounded-xl',
              'bg-background border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20',
              'placeholder:text-muted-foreground/60 focus:outline-none transition-all'
            )}
          />
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!content.trim() && !attachment) || isSubmitting}
          className={cn(
            'p-2.5 rounded-xl bg-primary text-primary-foreground font-semibold',
            'hover:bg-primary/90 transition-colors shadow-xs cursor-pointer shrink-0',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Send message"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  )
}
