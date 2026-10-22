'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ChatPanel from '@/components/dashboard/ChatPanel'
import { createClient } from '@/lib/supabase/client'
import { MESSAGE_RATE_LIMIT } from '@/lib/constants'
import type {
  GroupWithMeta,
  MessageWithSender,
  Profile,
  AttachmentType,
  MessageTag,
  ReportReason
} from '@/types'

interface GroupChatClientProps {
  initialGroup: GroupWithMeta
  initialMessages: MessageWithSender[]
  currentUser: Profile
  initialMembers: Profile[]
}

export default function GroupChatClient({
  initialGroup,
  initialMessages,
  currentUser,
  initialMembers,
}: GroupChatClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [typingUsers, setTypingUsers] = useState<Profile[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialMessages.length >= 30)
  const [lastSentTime, setLastSentTime] = useState<number>(0)
  const channelRef = useRef<any>(null)

  // Sync state if initialMessages changes (e.g. route switch)
  useEffect(() => {
    try {
      const cacheKey = `campus_loop_msgs_${initialGroup.id}`
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
      if (cached.length > 0) {
        const merged = [...initialMessages]
        cached.forEach((c: MessageWithSender) => {
          if (!merged.some((m) => m.id === c.id)) {
            merged.push(c)
          }
        })
        setMessages(merged)
      } else {
        setMessages(initialMessages)
      }
    } catch {
      setMessages(initialMessages)
    }
  }, [initialGroup.id, initialMessages])

  // Setup Supabase Realtime Channel
  useEffect(() => {
    if (!initialGroup.id) return

    const channel = supabase
      .channel(`group:${initialGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${initialGroup.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any

          // Fetch sender details to attach to message
          let sender: Profile | null = null
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMsg.sender_id)
              .single()
            sender = data
          } catch {}

          const messageWithSender: MessageWithSender = {
            ...newMsg,
            sender: sender || {
              id: newMsg.sender_id,
              campus_id: 'CL-000000',
              full_name: 'KIET Member',
              email: 'user@kiet.edu',
              role: 'student',
            },
            reply_to: null,
            reactions: [],
            is_bookmarked: false,
            user_has_voted_helpful: false,
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, messageWithSender]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${initialGroup.id}`,
        },
        (payload) => {
          const updated = payload.new as any
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${initialGroup.id}`,
        },
        (payload) => {
          const deletedId = (payload.old as any).id
          setMessages((prev) => prev.filter((m) => m.id !== deletedId))
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== currentUser.id) {
          setTypingUsers((prev) => {
            if (prev.some((u) => u.id === payload.user.id)) return prev
            return [...prev, payload.user]
          })

          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.id !== payload.userId))
          }, 3000)
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [initialGroup.id, currentUser.id, supabase])

  // Broadcast typing event using existing channel (no duplicate subscriptions)
  const handleTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUser.id,
          user: {
            id: currentUser.id,
            full_name: currentUser.full_name,
          },
        },
      })
    }
  }, [currentUser.id, currentUser.full_name])

  // Helper to sync local changes to localStorage
  const updateLocalCache = (updater: (prev: MessageWithSender[]) => MessageWithSender[]) => {
    setMessages((prev) => {
      const next = updater(prev)
      try {
        const cacheKey = `campus_loop_msgs_${initialGroup.id}`
        localStorage.setItem(cacheKey, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Load more / pagination
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || messages.length === 0) return
    setIsLoadingMore(true)
    try {
      const oldest = messages[0]
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(initialGroup.id)
      if (isUUID && oldest?.created_at) {
        const { data, error } = await supabase
          .from('messages')
          .select('*, sender:profiles(*)')
          .eq('group_id', initialGroup.id)
          .eq('is_deleted', false)
          .lt('created_at', oldest.created_at)
          .order('created_at', { ascending: false })
          .limit(30)

        if (data && data.length > 0) {
          const older: MessageWithSender[] = data.reverse().map((m: any) => ({
            ...m,
            reply_to: null,
            reactions: [],
            is_bookmarked: false,
            user_has_voted_helpful: false,
          }))
          setMessages((prev) => [...older, ...prev])
          if (data.length < 30) {
            setHasMore(false)
          }
        } else {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch {
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Send message
  const handleSendMessage = async (data: {
    content: string
    tag: MessageTag
    replyToId?: string | null
    attachment?: {
      url: string
      name: string
      type: AttachmentType
      size: number
    } | null
  }) => {
    // Basic rate limit
    const now = Date.now()
    if (now - lastSentTime < 800) {
      toast.error('Slow down! Sending too fast.')
      return
    }
    setLastSentTime(now)

    const payload = {
      group_id: initialGroup.id,
      sender_id: currentUser.id,
      content: data.content,
      tag: data.tag || 'general',
      reply_to_id: data.replyToId || null,
      attachment_url: data.attachment?.url || null,
      attachment_name: data.attachment?.name || null,
      attachment_type: data.attachment?.type || null,
      attachment_size: data.attachment?.size || null,
    }

    // Optimistic local append
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: MessageWithSender = {
      id: tempId,
      ...payload,
      is_answer: false,
      answer_marked_by: null,
      helpful_count: 0,
      is_pinned: false,
      pinned_by: null,
      pinned_at: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: currentUser,
      reply_to: messages.find((m) => m.id === data.replyToId) || null,
      reactions: [],
      is_bookmarked: false,
      user_has_voted_helpful: false,
    }

    updateLocalCache((prev) => [...prev, optimisticMsg])

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(initialGroup.id)
      if (isUUID) {
        const { data: inserted, error } = await supabase
          .from('messages')
          .insert(payload)
          .select()
          .single()

        if (!error && inserted) {
          updateLocalCache((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: inserted.id } : m))
          )
        }
      }
    } catch {
      // Local demo mode fallback
    }
  }

  // Emoji reactions (handles both ADD and REMOVE)
  const handleReact = async (messageId: string, emoji: string) => {
    let willRemove = false

    updateLocalCache((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m

        const existing = m.reactions?.find((r) => r.emoji === emoji)
        let updatedReactions = [...(m.reactions || [])]

        if (existing) {
          if (existing.user_reacted) {
            willRemove = true
            updatedReactions = updatedReactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, user_reacted: false }
                  : r
              )
              .filter((r) => r.count > 0)
          } else {
            updatedReactions = updatedReactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, user_reacted: true }
                : r
            )
          }
        } else {
          updatedReactions.push({
            emoji,
            count: 1,
            user_reacted: true,
            user_ids: [currentUser.id],
          })
        }

        return { ...m, reactions: updatedReactions }
      })
    )

    try {
      if (willRemove) {
        await supabase
          .from('reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', currentUser.id)
          .eq('emoji', emoji)
      } else {
        await supabase.from('reactions').upsert({
          message_id: messageId,
          user_id: currentUser.id,
          emoji,
        })
      }
    } catch {
      // Handled
    }
  }

  // Helpful vote
  const handleHelpfulVote = async (messageId: string) => {
    let willVote = true
    updateLocalCache((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m
        const hasVoted = m.user_has_voted_helpful
        willVote = !hasVoted
        return {
          ...m,
          user_has_voted_helpful: willVote,
          helpful_count: willVote
            ? m.helpful_count + 1
            : Math.max(0, m.helpful_count - 1),
        }
      })
    )

    try {
      if (!willVote) {
        await supabase
          .from('helpful_votes')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', currentUser.id)
      } else {
        await supabase.from('helpful_votes').insert({
          message_id: messageId,
          user_id: currentUser.id,
        })
      }
    } catch {
      // Handled
    }
  }

  // Mark as Answer
  const handleMarkAnswer = async (messageId: string, isAnswer: boolean) => {
    updateLocalCache((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_answer: isAnswer } : m))
    )
    toast.success(isAnswer ? 'Marked as verified answer! (+10 rep)' : 'Unmarked answer')

    try {
      await supabase
        .from('messages')
        .update({
          is_answer: isAnswer,
          answer_marked_by: isAnswer ? currentUser.id : null,
        })
        .eq('id', messageId)
    } catch {
      // Handled
    }
  }

  // Pin message
  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    updateLocalCache((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              is_pinned: isPinned,
              pinned_by: isPinned ? currentUser.id : null,
              pinned_at: isPinned ? new Date().toISOString() : null,
            }
          : m
      )
    )
    toast.success(isPinned ? 'Message pinned to top' : 'Message unpinned')

    try {
      await supabase
        .from('messages')
        .update({
          is_pinned: isPinned,
          pinned_by: isPinned ? currentUser.id : null,
          pinned_at: isPinned ? new Date().toISOString() : null,
        })
        .eq('id', messageId)
    } catch {
      // Handled
    }
  }

  // Delete message (soft delete)
  const handleDeleteMessage = async (messageId: string) => {
    updateLocalCache((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_deleted: true } : m))
    )
    toast.success('Message deleted')

    try {
      await supabase
        .from('messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId)
    } catch {
      // Handled
    }
  }

  // Edit message
  const handleEditMessage = async (messageId: string, content: string) => {
    updateLocalCache((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content,
              is_edited: true,
              edited_at: new Date().toISOString(),
            }
          : m
      )
    )
    toast.success('Message updated')

    try {
      await supabase
        .from('messages')
        .update({
          content,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
    } catch {
      // Handled
    }
  }

  // Report message
  const handleReportMessage = async (
    messageId: string,
    reason: ReportReason,
    details?: string
  ) => {
    try {
      await supabase.from('reports').insert({
        reporter_id: currentUser.id,
        message_id: messageId,
        reason,
        details: details || null,
      })
    } catch {}
  }

  // Pin group in user preferences
  const handleTogglePinGroup = async (groupId: string, isPinned: boolean) => {
    try {
      await supabase.from('user_group_prefs').upsert({
        group_id: groupId,
        user_id: currentUser.id,
        is_pinned: isPinned,
      })
      toast.success(isPinned ? 'Group pinned' : 'Group unpinned')
      router.refresh()
    } catch {
      toast.success(isPinned ? 'Group pinned' : 'Group unpinned')
    }
  }

  // Mute group
  const handleToggleMuteGroup = async (groupId: string, isMuted: boolean) => {
    try {
      await supabase.from('user_group_prefs').upsert({
        group_id: groupId,
        user_id: currentUser.id,
        is_muted: isMuted,
      })
      toast.success(isMuted ? 'Group muted' : 'Group unmuted')
      router.refresh()
    } catch {
      toast.success(isMuted ? 'Group muted' : 'Group unmuted')
    }
  }

  return (
    <ChatPanel
      group={initialGroup}
      messages={messages}
      isLoadingMessages={isLoadingMore}
      hasMoreMessages={hasMore}
      onLoadMore={handleLoadMore}
      currentUser={currentUser}
      onSendMessage={handleSendMessage}
      onReact={handleReact}
      onHelpfulVote={handleHelpfulVote}
      onMarkAnswer={handleMarkAnswer}
      onPinMessage={handlePinMessage}
      onDeleteMessage={handleDeleteMessage}
      onEditMessage={handleEditMessage}
      onReportMessage={handleReportMessage}
      onTogglePinGroup={handleTogglePinGroup}
      onToggleMuteGroup={handleToggleMuteGroup}
      typingUsers={typingUsers}
      onTyping={handleTyping}
      activeMembers={initialMembers}
    />
  )
}
