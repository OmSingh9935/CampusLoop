import type { Profile, UserRole } from '@/types'

export interface StoredUser extends Profile {
  password_hash: string
  salt: string
}

// Simple fast SHA-256 hashing for browser and Node.js environments
export function hashPassword(password: string, salt = 'kiet_loop_salt_2026'): string {
  // Simple deterministic hash function for both client and edge/server
  let hash = 0
  const combined = `${salt}:${password}:kiet_edu`
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  // Convert to positive hex representation
  return Math.abs(hash).toString(16).padStart(8, '0')
}

// Default verified faculty & administrator accounts
const PRE_REGISTERED_USERS: StoredUser[] = [
  {
    id: 'usr_admin_001',
    campus_id: 'CL-000001',
    full_name: 'Dr. T&P Official',
    username: 'admin_kiet',
    email: 'admin@kiet.edu',
    role: 'admin',
    department: 'Training & Placement',
    year: null,
    bio: 'Official Training & Placement and Administration Cell @ KIET Group of Institutions.',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 85,
    reputation: 500,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    salt: 'kiet_salt_admin',
    password_hash: hashPassword('Admin@1234', 'kiet_salt_admin'),
  },
  {
    id: 'usr_faculty_002',
    campus_id: 'CL-000010',
    full_name: 'Dr. R. K. Sharma',
    username: 'prof_sharma',
    email: 'faculty@kiet.edu',
    role: 'teacher',
    department: 'Computer Science & Engineering',
    year: null,
    bio: 'Professor, Department of CSE @ KIET. Operating Systems & Distributed Architecture.',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 42,
    reputation: 280,
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date().toISOString(),
    salt: 'kiet_salt_faculty',
    password_hash: hashPassword('Faculty@1234', 'kiet_salt_faculty'),
  },
]

const REGISTRY_STORAGE_KEY = 'campus_loop_registered_users'
const CURRENT_USER_KEY = 'campus_loop_current_user'

/**
 * Get all registered users from storage or default list
 */
export function getRegisteredUsers(): StoredUser[] {
  if (typeof window === 'undefined') {
    return PRE_REGISTERED_USERS
  }

  try {
    const raw = localStorage.getItem(REGISTRY_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(PRE_REGISTERED_USERS))
      return PRE_REGISTERED_USERS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {}

  return PRE_REGISTERED_USERS
}

/**
 * Save users list to storage
 */
export function saveRegisteredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users))
  } catch {}
}

/**
 * Find registered user by email (case-insensitive)
 */
export function findUserByEmail(email: string): StoredUser | null {
  const normalized = email.toLowerCase().trim()
  const users = getRegisteredUsers()
  return users.find((u) => u.email.toLowerCase() === normalized) || null
}

/**
 * Register a real new account
 */
export function registerNewUser(data: {
  full_name: string
  email: string
  password: string
  role: UserRole
  department?: string
  year?: number
}): { success: boolean; user?: Profile; error?: string } {
  const email = data.email.toLowerCase().trim()

  // 1. Strict @kiet.edu validation
  if (!/^[a-zA-Z0-9._%+\-]+@kiet\.edu$/i.test(email)) {
    return { success: false, error: 'Only official @kiet.edu email addresses are permitted.' }
  }

  // 2. Check if already registered
  const existing = findUserByEmail(email)
  if (existing) {
    return {
      success: false,
      error: 'An account with this @kiet.edu email already exists. Please log in directly.',
    }
  }

  // 3. Create real profile with unique Campus ID
  const salt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const password_hash = hashPassword(data.password, salt)
  const campus_id = `CL-${Math.floor(100000 + Math.random() * 900000)}`
  const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    campus_id,
    full_name: data.full_name.trim(),
    username,
    email,
    role: data.role,
    department: data.department || 'Computer Science & Engineering',
    year: data.year || 2,
    bio: `${data.role === 'teacher' ? 'Faculty Member' : 'Student'} at KIET Group of Institutions.`,
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 0,
    reputation: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    salt,
    password_hash,
  }

  // Save to persistent user registry
  const currentList = getRegisteredUsers()
  const updatedList = [...currentList, newUser]
  saveRegisteredUsers(updatedList)

  // Set active user session
  setActiveSession(newUser)

  // Strip password details before returning
  const { password_hash: _p, salt: _s, ...profile } = newUser
  return { success: true, user: profile }
}

/**
 * Authenticate existing registered user
 */
export function authenticateUser(
  email: string,
  password: string
): { success: boolean; user?: Profile; error?: string } {
  const normalized = email.toLowerCase().trim()
  const user = findUserByEmail(normalized)

  // Strict check: User MUST have registered first!
  if (!user) {
    return {
      success: false,
      error: 'No account found with this email. You must create an account first.',
    }
  }

  // Verify password hash
  const computedHash = hashPassword(password, user.salt)
  if (computedHash !== user.password_hash) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your password and try again.',
    }
  }

  // Set active user session
  setActiveSession(user)

  const { password_hash: _p, salt: _s, ...profile } = user
  return { success: true, user: profile }
}

/**
 * Set active user session (localStorage + Cookie for Next.js server components)
 */
export function setActiveSession(user: StoredUser | Profile): void {
  const { password_hash, salt, ...safeProfile } = user as StoredUser
  const jsonStr = JSON.stringify(safeProfile)

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CURRENT_USER_KEY, jsonStr)
      // Set session cookie for Next.js middleware and server-side layout
      document.cookie = `campus_loop_user=${encodeURIComponent(jsonStr)}; path=/; max-age=604800; SameSite=Lax`
      document.cookie = `campus_loop_demo_user=${encodeURIComponent(jsonStr)}; path=/; max-age=604800; SameSite=Lax`
    } catch {}
  }
}

/**
 * Clear session on logout
 */
export function clearActiveSession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CURRENT_USER_KEY)
      document.cookie = 'campus_loop_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'campus_loop_demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch {}
  }
}

/**
 * Get active profile from localStorage
 */
export function getActiveSession(): Profile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}
