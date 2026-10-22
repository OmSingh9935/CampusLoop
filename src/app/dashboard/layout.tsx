import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import GroupList from '@/components/dashboard/GroupList'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { ROUTES } from '@/lib/constants'
import type { GroupWithMeta, Profile } from '@/types'

// Mock fallback groups for preview if DB not yet seeded
const DEFAULT_PREVIEW_GROUPS: GroupWithMeta[] = [
  {
    id: 'academic-doubts',
    name: 'Academic Doubts',
    slug: 'academic-doubts',
    description: 'Ask and answer academic questions across all subjects.',
    rules: '1. Be specific.\n2. No duplicate posts.\n3. Tag subject.',
    icon: '🎓',
    color: '#6366f1',
    tags: ['Maths', 'Programming', 'Physics', 'Electronics'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 1,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'courses-study-material',
    name: 'Courses & Study Material',
    slug: 'courses-study-material',
    description: 'Share notes, textbooks, slides, and syllabus updates.',
    rules: '1. No pirated books.\n2. Tag with semester.',
    icon: '📚',
    color: '#8b5cf6',
    tags: ['Notes', 'Books', 'Videos', 'Slides'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 2,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'examinations-results',
    name: 'Examinations & Results',
    slug: 'examinations-results',
    description: 'Exam schedules, date sheets, result circulars, and prep guidance.',
    rules: '1. Post official notices only.',
    icon: '📝',
    color: '#f59e0b',
    tags: ['Date Sheet', 'Results', 'Syllabus'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 3,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'holidays-notices',
    name: 'College Holidays & Notices',
    slug: 'holidays-notices',
    description: 'Official college notices, holiday calendars, and administrative alerts.',
    rules: '1. Verified announcements only.',
    icon: '📅',
    color: '#10b981',
    tags: ['Holidays', 'Events', 'Notices'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 4,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'scholarships-funding',
    name: 'Scholarships & Funding',
    slug: 'scholarships-funding',
    description: 'Government schemes, corporate scholarships, and financial aid.',
    rules: '1. Include application deadline.',
    icon: '💰',
    color: '#f97316',
    tags: ['Gov Schemes', 'Private', 'Aid'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 5,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'bootcamps-workshops',
    name: 'Bootcamps & Workshops',
    slug: 'bootcamps-workshops',
    description: 'Hands-on technical workshops, guest lectures, and certifications.',
    rules: '1. Free and verified events preferred.',
    icon: '🛠️',
    color: '#06b6d4',
    tags: ['Tech', 'Workshops', 'Coding'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 6,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'internships-jobs',
    name: 'Internships & Jobs',
    slug: 'internships-jobs',
    description: 'Off-campus internships, summer training, and job openings.',
    rules: '1. Post verified links only.',
    icon: '💼',
    color: '#3b82f6',
    tags: ['Internships', 'Jobs', 'Remote'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 7,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'hackathons-competitions',
    name: 'Hackathons & Competitions',
    slug: 'hackathons-competitions',
    description: 'Find team members, prepare for SIH, ICPC, and college hackathons.',
    rules: '1. State your tech stack.',
    icon: '🏆',
    color: '#ec4899',
    tags: ['Hackathon', 'Contests', 'SIH'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 8,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'placements-interview-prep',
    name: 'Placements & Interview Prep',
    slug: 'placements-interview-prep',
    description: 'DSA questions, mock interviews, and company interview experiences.',
    rules: '1. Respect company NDAs.',
    icon: '🎯',
    color: '#14b8a6',
    tags: ['DSA', 'Interviews', 'Aptitude'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 9,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'projects-collaboration',
    name: 'Projects & Collaboration',
    slug: 'projects-collaboration',
    description: 'Collaborate on open source, final year projects, and hackathon prototypes.',
    rules: '1. Credit contributors.',
    icon: '🔧',
    color: '#a855f7',
    tags: ['Web', 'AI/ML', 'IoT'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 10,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'general-campus',
    name: 'General Campus Chat',
    slug: 'general-campus',
    description: 'Casual college discussions, canteen talks, sports, and life at KIET.',
    rules: '1. Be polite and respectful.',
    icon: '🏫',
    color: '#64748b',
    tags: ['Life', 'Canteen', 'Campus'],
    is_archived: false,
    is_pinnable: true,
    sort_order: 11,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verify auth session
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
  } catch {
    user = null
  }

  let currentUser: Profile | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      currentUser = profile
    } else {
      // Mock profile if DB trigger has not run yet
      currentUser = {
        id: user.id,
        campus_id: 'CL-000101',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'KIET Member',
        username: user.email?.split('@')[0] || 'kietian',
        email: user.email || 'user@kiet.edu',
        role: user.user_metadata?.role || 'student',
        department: user.user_metadata?.department || 'Computer Science & Engineering',
        year: 3,
        bio: 'Learning and building on CampusLoop',
        avatar_url: null,
        is_verified: true,
        is_banned: false,
        is_muted: false,
        muted_until: null,
        helpful_count: 5,
        reputation: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  } else {
    // Check if demo user cookie exists
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get('campus_loop_demo_user')
    if (demoCookie?.value) {
      try {
        currentUser = JSON.parse(decodeURIComponent(demoCookie.value))
      } catch {}
    }

    if (!currentUser) {
      // Default preview profile
      currentUser = {
        id: 'demo-user-id',
        campus_id: 'CL-000001',
        full_name: 'Demo Student',
        username: 'student_kiet',
        email: 'student@kiet.edu',
        role: 'student',
        department: 'Computer Science & Engineering',
        year: 3,
        bio: 'KIET Student Explorer',
        avatar_url: null,
        is_verified: true,
        is_banned: false,
        is_muted: false,
        muted_until: null,
        helpful_count: 12,
        reputation: 40,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  // Fetch groups from Supabase
  let groups: GroupWithMeta[] = []
  try {
    const { data: dbGroups } = await supabase
      .from('groups')
      .select('*')
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })

    if (dbGroups && dbGroups.length > 0) {
      groups = dbGroups
    } else {
      groups = DEFAULT_PREVIEW_GROUPS
    }
  } catch {
    groups = DEFAULT_PREVIEW_GROUPS
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* 1. Left Narrow Rail (Desktop only) */}
      <Sidebar currentUser={currentUser} />

      {/* 2. Group List + Main content — DashboardShell handles mobile toggling */}
      <DashboardShell groupList={<GroupList groups={groups} />}>
        {children}
      </DashboardShell>
    </div>
  )
}
