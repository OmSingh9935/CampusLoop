// ============================================================
// CampusLoop Constants
// ============================================================

export const APP_NAME = 'CampusLoop'
export const APP_DESCRIPTION = 'The collaborative educational community for KIET students and teachers'
export const KIET_DOMAIN = 'kiet.edu'
export const ALLOWED_EMAIL_DOMAIN = '@kiet.edu'

// Messages
export const MESSAGES_PER_PAGE = 30
export const MAX_MESSAGE_LENGTH = 5000
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const TYPING_TIMEOUT_MS = 3000
export const TYPING_THROTTLE_MS = 1000

// Rate limiting
export const MESSAGE_RATE_LIMIT = 10 // messages per minute
export const SEARCH_DEBOUNCE_MS = 300

// Pagination
export const USERS_PER_PAGE = 20
export const REPORTS_PER_PAGE = 20
export const NOTIFICATIONS_PER_PAGE = 20

// Storage
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'campus-loop-files'
export const AVATAR_FOLDER = 'avatars'
export const ATTACHMENTS_FOLDER = 'attachments'

// Reputation thresholds
export const REPUTATION_LEVELS = [
  { min: 0, max: 49, label: 'Newcomer', badge: '🌱' },
  { min: 50, max: 199, label: 'Contributor', badge: '⭐' },
  { min: 200, max: 499, label: 'Helper', badge: '🌟' },
  { min: 500, max: 999, label: 'Expert', badge: '💎' },
  { min: 1000, max: Infinity, label: 'Champion', badge: '🏆' },
]

export function getReputationLevel(reputation: number) {
  return REPUTATION_LEVELS.find((l) => reputation >= l.min && reputation <= l.max) || REPUTATION_LEVELS[0]
}

// Departments
export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Computer Science (AI/ML)',
  'Biotechnology',
  'Chemical Engineering',
  'MBA',
  'MCA',
  'Other',
]

// Years
export const YEARS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
  { value: '5', label: '5th Year' },
  { value: '6', label: '6th Year / PG' },
]

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  GROUP: (id: string) => `/dashboard/g/${id}`,
  SEARCH: '/dashboard/search',
  OPPORTUNITIES: '/dashboard/opportunities',
  PROFILE: '/dashboard/profile',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_GROUPS: '/admin/groups',
  ADMIN_REPORTS: '/admin/reports',
}

// Emoji reactions (commonly used)
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '🙏', '✅', '🔥']
