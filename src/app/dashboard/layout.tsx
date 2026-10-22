import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, isSupabaseConfigured, withTimeout } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import GroupList from '@/components/dashboard/GroupList'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { ROUTES } from '@/lib/constants'
import type { GroupWithMeta, Profile } from '@/types'

// Mock fallback groups with authentic last messages
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
    last_message: {
      id: 'demo-msg-ad-2',
      content: 'A process is an executing instance of a program with its own memory space...',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      sender: { full_name: 'Dr. R. K. Sharma', role: 'teacher' },
    },
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
    last_message: {
      id: 'demo-msg-cs-1',
      content: 'Uploaded handwritten unit 1-3 lecture notes for Data Structures (KCS-301)...',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      sender: { full_name: 'Aarav Kumar', role: 'student' },
    },
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
    last_message: {
      id: 'demo-msg-er-1',
      content: 'Pre-University Examination (PUE) tentative schedules published on ERP.',
      created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
      sender: { full_name: 'Dr. R. K. Sharma', role: 'teacher' },
    },
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
    last_message: {
      id: 'demo-msg-hn-1',
      content: 'Official Circular: Institute will remain closed on upcoming official holidays.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      sender: { full_name: 'T&P Official', role: 'admin' },
    },
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
    last_message: {
      id: 'demo-msg-sf-1',
      content: 'UP Post-Matric Scholarship: Submit documents to Student Section Room 102.',
      created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      sender: { full_name: 'Scholarship Desk', role: 'admin' },
    },
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
    last_message: {
      id: 'demo-msg-bw-1',
      content: '3-Day Hands-on Cloud Computing & Docker Workshop starting this Saturday!',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      sender: { full_name: 'Tech Club KIET', role: 'student' },
    },
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
    last_message: {
      id: 'demo-msg-ij-1',
      content: 'Summer Internship 2026 applications are officially open for Microsoft & Cisco.',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      sender: { full_name: 'T&P Cell Official', role: 'admin' },
    },
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
    last_message: {
      id: 'demo-msg-hc-1',
      content: 'Forming a team of 4 for Smart India Hackathon (SIH 2026)! Looking for 1 dev.',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      sender: { full_name: 'Priya Verma', role: 'student' },
    },
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
    last_message: {
      id: 'demo-msg-pip-1',
      content: 'Top 50 Dynamic Programming & Graph interview questions practice sheet shared.',
      created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
      sender: { full_name: 'Aman Deep', role: 'student' },
    },
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
    last_message: {
      id: 'demo-msg-pc-1',
      content: 'Looking for 1 frontend developer (Next.js/Tailwind) for Final Year Project.',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      sender: { full_name: 'Rohan Gupta', role: 'student' },
    },
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
    last_message: {
      id: 'demo-msg-gc-1',
      content: 'Inter-branch Cricket & Badminton Tournament registrations are now open!',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      sender: { full_name: 'Sports Committee', role: 'student' },
    },
  },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data } = await withTimeout(
        supabase.auth.getUser(),
        1500,
        { data: { user: null }, error: null } as any
      )
      user = data?.user || null
    } catch {
      user = null
    }
  }

  let currentUser: Profile | null = null

  if (user && isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: profile } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        1500,
        { data: null, error: null } as any
      )

      if (profile) {
        currentUser = profile
      }
    } catch {}

    if (!currentUser) {
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
    // Check if real user session cookie exists
    const cookieStore = await cookies()
    const sessionCookie =
      cookieStore.get('campus_loop_user') ||
      cookieStore.get('campus_loop_demo_user')

    if (sessionCookie?.value) {
      try {
        currentUser = JSON.parse(decodeURIComponent(sessionCookie.value))
      } catch {}
    }

    // Strict security: User must create account and log in
    if (!currentUser) {
      redirect(ROUTES.LOGIN)
    }
  }

  // Fetch groups from Supabase or use preloaded defaults
  let groups: GroupWithMeta[] = []
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: dbGroups } = await withTimeout(
        supabase
          .from('groups')
          .select('*')
          .eq('is_archived', false)
          .order('sort_order', { ascending: true }),
        1500,
        { data: null, error: null } as any
      )

      if (dbGroups && dbGroups.length > 0) {
        groups = dbGroups
      } else {
        groups = DEFAULT_PREVIEW_GROUPS
      }
    } catch {
      groups = DEFAULT_PREVIEW_GROUPS
    }
  } else {
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
