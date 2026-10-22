// ============================================================
// CampusLoop – Core TypeScript Types
// ============================================================

export type UserRole = 'student' | 'teacher' | 'admin'
export type MessageTag = 'question' | 'answer' | 'resource' | 'opportunity' | 'announcement' | 'general'
export type AttachmentType = 'image' | 'pdf' | 'file' | 'link'
export type ReportReason = 'spam' | 'inappropriate' | 'misinformation' | 'harassment' | 'other'
export type NotificationType = 'mention' | 'reply' | 'reaction' | 'answer_marked' | 'announcement'

// ============================================================
// Database Row Types
// ============================================================

export interface Profile {
  id: string
  campus_id: string
  full_name: string
  username: string | null
  email: string
  role: UserRole
  department: string | null
  year: number | null
  bio: string | null
  avatar_url: string | null
  is_verified: boolean
  is_banned: boolean
  is_muted: boolean
  muted_until: string | null
  helpful_count: number
  reputation: number
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  slug: string
  description: string | null
  rules: string | null
  icon: string
  color: string
  tags: string[]
  is_archived: boolean
  is_pinnable: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  group_id: string
  sender_id: string
  content: string
  reply_to_id: string | null
  tag: MessageTag
  is_answer: boolean
  answer_marked_by: string | null
  helpful_count: number
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: AttachmentType | null
  attachment_size: number | null
  is_pinned: boolean
  pinned_by: string | null
  pinned_at: string | null
  is_edited: boolean
  edited_at: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  sender?: Profile
  reply_to?: Message | MessageWithSender | null
  reactions?: ReactionGroup[] | Reaction[]
  user_reaction?: string | null
  is_bookmarked?: boolean
  user_has_voted_helpful?: boolean
}

export interface Reaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
  // Aggregated
  count?: number
  user_reacted?: boolean
}

export interface ReactionGroup {
  emoji: string
  count: number
  user_reacted: boolean
  user_ids: string[]
}

export interface HelpfulVote {
  id: string
  message_id: string
  user_id: string
  created_at: string
}

export interface GroupRead {
  group_id: string
  user_id: string
  last_read_at: string
}

export interface UserGroupPref {
  group_id: string
  user_id: string
  is_pinned: boolean
  is_muted: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  message_id: string
  created_at: string
  message?: Message
}

export interface Report {
  id: string
  reporter_id: string
  message_id: string
  reason: ReportReason
  details: string | null
  is_resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  action_taken: string | null
  created_at: string
  reporter?: Profile
  message?: Message
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  payload: Record<string, unknown>
  group_id: string | null
  message_id: string | null
  actor_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  actor?: Profile
  group?: Group
}

export interface TypingIndicator {
  group_id: string
  user_id: string
  updated_at: string
  profile?: Profile
}

export interface Mention {
  id: string
  message_id: string
  mentioned_user_id: string
  created_at: string
}

// ============================================================
// App State / UI Types
// ============================================================

export interface LastMessageSummary {
  id?: string
  content?: string
  created_at?: string
  sender_id?: string
  sender?: { full_name: string; role: UserRole } | Profile | null
  attachment_url?: string | null
  attachment_name?: string | null
  attachment_type?: AttachmentType | null
  attachment_size?: number | null
  tag?: MessageTag
  is_answer?: boolean
  helpful_count?: number
}

export interface GroupWithMeta extends Group {
  last_message?: LastMessageSummary | Message | null
  unread_count?: number
  user_prefs?: UserGroupPref | null
}

export interface MessageWithSender extends Message {
  sender: Profile
  reply_to: MessageWithSender | Message | null
  reactions: ReactionGroup[]
  is_bookmarked: boolean
  user_has_voted_helpful: boolean
}

export interface SearchResult {
  type: 'message' | 'group' | 'user' | 'resource'
  message?: MessageWithSender
  group?: Group
  user?: Profile
  score?: number
}

export interface OpportunityCard {
  id: string
  group_id: string
  group_name: string
  group_icon: string
  sender: Profile
  content: string
  tag: MessageTag
  created_at: string
  attachment_url?: string | null
  attachment_name?: string | null
}

// ============================================================
// Form / Input Types
// ============================================================

export interface SignupFormData {
  full_name: string
  email: string
  password: string
  confirm_password: string
  role: UserRole
  department?: string
  year?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ProfileUpdateData {
  full_name?: string
  username?: string
  bio?: string
  department?: string
  year?: number
  avatar_url?: string
}

export interface MessageInputData {
  content: string
  tag: MessageTag
  reply_to_id?: string | null
  attachment_url?: string | null
  attachment_name?: string | null
  attachment_type?: AttachmentType | null
  attachment_size?: number | null
}

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedMessages {
  messages: MessageWithSender[]
  hasMore: boolean
  nextCursor: string | null
}

export interface UploadResult {
  url: string
  name: string
  type: AttachmentType
  size: number
}

// ============================================================
// Admin Types
// ============================================================

export interface AdminStats {
  total_users: number
  total_messages: number
  total_reports: number
  open_reports: number
  banned_users: number
}
