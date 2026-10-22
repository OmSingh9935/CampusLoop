import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

// ============================================================
// Style Utilities
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Date & Time Utilities
// ============================================================

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return format(date, 'HH:mm')
  }
  if (isYesterday(date)) {
    return 'Yesterday ' + format(date, 'HH:mm')
  }
  return format(date, 'dd/MM/yyyy HH:mm')
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function formatGroupListTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd/MM/yy')
}

export function formatFullDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMMM d, yyyy, HH:mm')
}

// ============================================================
// Text Utilities
// ============================================================

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Extract @mentions from message content.
 * Returns array of usernames (without @).
 */
export function extractMentions(content: string): string[] {
  const matches = content.match(/@([a-zA-Z0-9_]+)/g) || []
  return [...new Set(matches.map((m) => m.slice(1)))]
}

/**
 * Sanitize text to prevent XSS – strip HTML tags.
 * We rely on React's automatic escaping for rendering,
 * but this helps when constructing strings manually.
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Generate slug from text
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ============================================================
// File Utilities
// ============================================================

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Get file type from MIME type or extension
 */
export function getAttachmentType(
  mimeType: string,
  fileName?: string
): 'image' | 'pdf' | 'file' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (fileName?.endsWith('.pdf')) return 'pdf'
  return 'file'
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// ============================================================
// Avatar Utilities
// ============================================================

/**
 * Generate a deterministic avatar URL using DiceBear Initials
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined,
  name: string,
  id?: string
): string {
  if (avatarUrl) return avatarUrl
  const seed = id || name
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1&textColor=ffffff&fontSize=40`
}

// ============================================================
// Color Utilities
// ============================================================

export const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  teacher: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export const TAG_COLORS: Record<string, string> = {
  question: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  answer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  resource: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  opportunity: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  announcement: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

export const TAG_LABELS: Record<string, string> = {
  question: '❓ Question',
  answer: '✅ Answer',
  resource: '📎 Resource',
  opportunity: '🌟 Opportunity',
  announcement: '📢 Announcement',
  general: 'General',
}

// ============================================================
// Misc Utilities
// ============================================================

/**
 * Debounce a function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Generate initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
