import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import GroupChatClient from './GroupChatClient'
import type { GroupWithMeta, MessageWithSender, Profile } from '@/types'

// Mock faculty and student profiles for fallback demo chat
const DEMO_PROFILES: Record<string, Profile> = {
  teacher: {
    id: 'u-faculty-1',
    campus_id: 'CL-000010',
    full_name: 'Dr. R. K. Sharma',
    username: 'prof_sharma',
    email: 'rk.sharma@kiet.edu',
    role: 'teacher',
    department: 'Computer Science & Engineering',
    year: null,
    bio: 'Faculty & Coordinator @ KIET',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 56,
    reputation: 340,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'u-admin-1',
    campus_id: 'CL-000001',
    full_name: 'CampusLoop Official',
    username: 'campus_admin',
    email: 'admin@kiet.edu',
    role: 'admin',
    department: 'Administration',
    year: null,
    bio: 'Official Academic Administration Desk',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 120,
    reputation: 800,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  },
  student1: {
    id: 'u-student-1',
    campus_id: 'CL-000188',
    full_name: 'Priya Verma',
    username: 'priya_v',
    email: 'priya.verma@kiet.edu',
    role: 'student',
    department: 'Information Technology',
    year: 3,
    bio: 'B.Tech IT student @ KIET',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 14,
    reputation: 68,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  student2: {
    id: 'u-student-2',
    campus_id: 'CL-000215',
    full_name: 'Kshitij Singh',
    username: 'kshitij_s',
    email: 'kshitij.singh@kiet.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    year: 4,
    bio: 'Competitive programmer & full-stack builder',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 32,
    reputation: 175,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
}

// Starter fallback messages when DB messages are empty
const DEFAULT_SAMPLE_MESSAGES: Record<string, Partial<MessageWithSender>[]> = {
  'academic-doubts': [
    {
      id: 'demo-msg-ad-1',
      sender_id: DEMO_PROFILES.student1.id,
      content: 'Can someone explain the core difference between a Process and a Thread in Operating Systems? Preparing for mid-terms next week.',
      tag: 'question',
      is_answer: false,
      helpful_count: 2,
      sender: DEMO_PROFILES.student1,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'demo-msg-ad-2',
      sender_id: DEMO_PROFILES.teacher.id,
      content: 'A process is an executing instance of a program with its own dedicated memory address space. A thread is a lightweight execution unit inside a process that shares code, data, and resources with fellow threads. Example: A browser tab is typically a process, while spell-check and audio inside that tab run as threads.',
      tag: 'answer',
      is_answer: true,
      helpful_count: 8,
      sender: DEMO_PROFILES.teacher,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
  'courses-study-material': [
    {
      id: 'demo-msg-cs-1',
      sender_id: DEMO_PROFILES.student2.id,
      content: 'Uploaded handwritten unit 1-3 lecture notes for Data Structures (KCS-301). Covers Linked Lists, Binary Trees, and AVL Rotations with dry-run diagrams.',
      tag: 'resource',
      is_answer: false,
      helpful_count: 15,
      sender: DEMO_PROFILES.student2,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  'internships-jobs': [
    {
      id: 'demo-msg-ij-1',
      sender_id: DEMO_PROFILES.admin.id,
      content: 'Summer Internship 2026 applications are officially open for Microsoft, Cisco, and Infosys. Eligible branches: CSE, IT, ECE with CGPA >= 7.5. Apply before the deadline via official campus T&P link.',
      tag: 'opportunity',
      is_answer: false,
      helpful_count: 22,
      sender: DEMO_PROFILES.admin,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
  'hackathons-competitions': [
    {
      id: 'demo-msg-hc-1',
      sender_id: DEMO_PROFILES.student2.id,
      content: 'Forming a team of 4 for Smart India Hackathon (SIH 2026)! Looking for 1 backend developer (Node.js/Postgres) and 1 UI/UX designer. Drop your GitHub or DM here if interested.',
      tag: 'opportunity',
      is_answer: false,
      helpful_count: 6,
      sender: DEMO_PROFILES.student2,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
  ],
  'holidays-notices': [
    {
      id: 'demo-msg-hn-1',
      sender_id: DEMO_PROFILES.admin.id,
      content: 'Official Circular: Institute will remain closed on upcoming official holidays as per AKTU university calendar. Regular classes will resume on Monday.',
      tag: 'announcement',
      is_answer: false,
      helpful_count: 35,
      sender: DEMO_PROFILES.admin,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ],
  'examinations-results': [
    {
      id: 'demo-msg-er-1',
      sender_id: DEMO_PROFILES.teacher.id,
      content: 'Pre-University Examination (PUE) tentative schedules have been published on the student ERP portal. Please verify your subject codes and report clashes to department exam cell.',
      tag: 'announcement',
      is_answer: false,
      helpful_count: 18,
      sender: DEMO_PROFILES.teacher,
      created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    },
  ],
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }> | { groupId: string }
}) {
  const { groupId } = await Promise.resolve(params)
  const supabase = await createClient()

  // 1. Fetch current authenticated user
  let user = null
  try {
    const res = await supabase.auth.getUser()
    user = res.data?.user || null
  } catch {
    user = null
  }

  let currentUser: Profile
  if (user) {
    let profile: Profile | null = null
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    } catch {}

    currentUser = profile || {
      id: user.id,
      campus_id: 'CL-000101',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'KIET Member',
      username: user.email?.split('@')[0] || 'member',
      email: user.email || 'user@kiet.edu',
      role: user.user_metadata?.role || 'student',
      department: user.user_metadata?.department || 'Computer Science & Engineering',
      year: user.user_metadata?.year ? Number(user.user_metadata?.year) : 2,
      bio: null,
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 0,
      reputation: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } else {
    // Check if demo/local session cookie exists
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get('campus_loop_demo_user')
    let foundDemoUser: Profile | null = null
    if (demoCookie?.value) {
      try {
        foundDemoUser = JSON.parse(decodeURIComponent(demoCookie.value))
      } catch {}
    }

    currentUser = foundDemoUser || {
      id: 'demo-user-id',
      campus_id: 'CL-000001',
      full_name: 'KIET Student',
      username: 'student_kiet',
      email: 'student@kiet.edu',
      role: 'student',
      department: 'Computer Science & Engineering',
      year: 2,
      bio: null,
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 0,
      reputation: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // 2. Fetch Group from database (safe against invalid UUID syntax)
  let group: GroupWithMeta | null = null
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId)
    const query = supabase.from('groups').select('*')
    const { data: dbGroup } = isUUID
      ? await query.or(`id.eq.${groupId},slug.eq.${groupId}`).maybeSingle()
      : await query.eq('slug', groupId).maybeSingle()

    if (dbGroup) {
      group = dbGroup
    }
  } catch {}

  // Fallback metadata for default groups if DB is still syncing
  if (!group) {
    const groupMap: Record<string, { name: string; slug: string; icon: string; color: string; tags: string[]; desc: string; rules: string }> = {
      'academic-doubts': {
        name: 'Academic Doubts',
        slug: 'academic-doubts',
        icon: '🎓',
        color: '#6366f1',
        tags: ['Maths', 'Programming', 'Physics', 'Electronics', 'Core Subjects'],
        desc: 'Ask and answer academic questions across all subjects.',
        rules: '1. Be specific.\n2. Tag your question.\n3. Mark helpful answers.',
      },
      'acad-doubts': {
        name: 'Academic Doubts',
        slug: 'academic-doubts',
        icon: '🎓',
        color: '#6366f1',
        tags: ['Maths', 'Programming', 'Physics', 'Electronics', 'Core Subjects'],
        desc: 'Ask and answer academic questions across all subjects.',
        rules: '1. Be specific.\n2. Tag your question.\n3. Mark helpful answers.',
      },
      'courses-study-material': {
        name: 'Courses & Study Material',
        slug: 'courses-study-material',
        icon: '📚',
        color: '#8b5cf6',
        tags: ['Notes', 'Books', 'Videos', 'Slides', 'Practice Papers'],
        desc: 'Share and discover course recommendations, notes, slides, books, and study resources.',
        rules: '1. Only share resources you have rights to distribute.\n2. No pirated content.',
      },
      'courses-notes': {
        name: 'Courses & Study Material',
        slug: 'courses-study-material',
        icon: '📚',
        color: '#8b5cf6',
        tags: ['Notes', 'Books', 'Videos', 'Slides', 'Practice Papers'],
        desc: 'Share and discover course recommendations, notes, slides, books, and study resources.',
        rules: '1. Only share resources you have rights to distribute.\n2. No pirated content.',
      },
      'examinations-results': {
        name: 'Examinations & Results',
        slug: 'examinations-results',
        icon: '📝',
        color: '#f59e0b',
        tags: ['Date Sheet', 'Results', 'Syllabus', 'Preparation Tips'],
        desc: 'Exam schedules, date sheets, result announcements, and exam preparation tips.',
        rules: '1. Official notices only.\n2. No unverified rumors.',
      },
      'exam-results': {
        name: 'Examinations & Results',
        slug: 'examinations-results',
        icon: '📝',
        color: '#f59e0b',
        tags: ['Date Sheet', 'Results', 'Syllabus', 'Preparation Tips'],
        desc: 'Exam schedules, date sheets, result announcements, and exam preparation tips.',
        rules: '1. Official notices only.\n2. No unverified rumors.',
      },
      'holidays-notices': {
        name: 'College Holidays & Notices',
        slug: 'holidays-notices',
        icon: '📅',
        color: '#10b981',
        tags: ['Holidays', 'Events', 'Notices', 'Schedule Changes'],
        desc: 'Official college notices, holiday announcements, schedule changes, and administrative updates.',
        rules: '1. Official circulars only.',
      },
      'campus-notices': {
        name: 'College Holidays & Notices',
        slug: 'holidays-notices',
        icon: '📅',
        color: '#10b981',
        tags: ['Holidays', 'Events', 'Notices', 'Schedule Changes'],
        desc: 'Official college notices, holiday announcements, schedule changes, and administrative updates.',
        rules: '1. Official circulars only.',
      },
      'scholarships-funding': {
        name: 'Scholarships & Funding',
        slug: 'scholarships-funding',
        icon: '💰',
        color: '#f97316',
        tags: ['Government Schemes', 'Private Scholarships', 'International', 'Research Grants'],
        desc: 'Scholarship opportunities, government schemes, fellowships, and financial aid information.',
        rules: '1. Always include deadline, eligibility, and official link.\n2. Tag as Opportunity.',
      },
      'scholarships': {
        name: 'Scholarships & Funding',
        slug: 'scholarships-funding',
        icon: '💰',
        color: '#f97316',
        tags: ['Government Schemes', 'Private Scholarships', 'International', 'Research Grants'],
        desc: 'Scholarship opportunities, government schemes, fellowships, and financial aid information.',
        rules: '1. Always include deadline, eligibility, and official link.\n2. Tag as Opportunity.',
      },
      'bootcamps-workshops': {
        name: 'Bootcamps & Workshops',
        slug: 'bootcamps-workshops',
        icon: '🛠️',
        color: '#06b6d4',
        tags: ['Technical', 'Non-Technical', 'Free', 'Paid', 'Online', 'Offline'],
        desc: 'Upcoming bootcamps, technical workshops, training programs, and skill development courses.',
        rules: '1. Include date, mode, cost, and registration link.\n2. Tag as Opportunity.',
      },
      'bootcamps': {
        name: 'Bootcamps & Workshops',
        slug: 'bootcamps-workshops',
        icon: '🛠️',
        color: '#06b6d4',
        tags: ['Technical', 'Non-Technical', 'Free', 'Paid', 'Online', 'Offline'],
        desc: 'Upcoming bootcamps, technical workshops, training programs, and skill development courses.',
        rules: '1. Include date, mode, cost, and registration link.\n2. Tag as Opportunity.',
      },
      'internships-jobs': {
        name: 'Internships & Jobs',
        slug: 'internships-jobs',
        icon: '💼',
        color: '#3b82f6',
        tags: ['Internship', 'Full-time', 'Part-time', 'Remote', 'On-site', 'Research'],
        desc: 'Internship openings, part-time jobs, research positions, and work experience opportunities.',
        rules: '1. Include company, role, stipend, and link.\n2. Tag as Opportunity.',
      },
      'internships': {
        name: 'Internships & Jobs',
        slug: 'internships-jobs',
        icon: '💼',
        color: '#3b82f6',
        tags: ['Internship', 'Full-time', 'Part-time', 'Remote', 'On-site', 'Research'],
        desc: 'Internship openings, part-time jobs, research positions, and work experience opportunities.',
        rules: '1. Include company, role, stipend, and link.\n2. Tag as Opportunity.',
      },
      'hackathons-competitions': {
        name: 'Hackathons & Competitions',
        slug: 'hackathons-competitions',
        icon: '🏆',
        color: '#ec4899',
        tags: ['Hackathon', 'Coding Contest', 'Case Study', 'Design', 'Team Building'],
        desc: 'Hackathons, coding contests, case study competitions, and design challenges.',
        rules: '1. Include theme, team size, prizes, deadline, and registration link.',
      },
      'hackathons': {
        name: 'Hackathons & Competitions',
        slug: 'hackathons-competitions',
        icon: '🏆',
        color: '#ec4899',
        tags: ['Hackathon', 'Coding Contest', 'Case Study', 'Design', 'Team Building'],
        desc: 'Hackathons, coding contests, case study competitions, and design challenges.',
        rules: '1. Include theme, team size, prizes, deadline, and registration link.',
      },
      'placements-interview-prep': {
        name: 'Placements & Interview Prep',
        slug: 'placements-interview-prep',
        icon: '🎯',
        color: '#14b8a6',
        tags: ['DSA', 'System Design', 'Resume', 'Interview Experience', 'Company Info'],
        desc: 'Placement drives, company interviews, resume tips, DSA prep, and career guidance.',
        rules: '1. Share interview experience.\n2. Respect NDAs.',
      },
      'placements': {
        name: 'Placements & Interview Prep',
        slug: 'placements-interview-prep',
        icon: '🎯',
        color: '#14b8a6',
        tags: ['DSA', 'System Design', 'Resume', 'Interview Experience', 'Company Info'],
        desc: 'Placement drives, company interviews, resume tips, DSA prep, and career guidance.',
        rules: '1. Share interview experience.\n2. Respect NDAs.',
      },
      'projects-collaboration': {
        name: 'Projects & Collaboration',
        slug: 'projects-collaboration',
        icon: '🔧',
        color: '#a855f7',
        tags: ['Web Dev', 'App Dev', 'AI/ML', 'IoT', 'Research', 'Open Source'],
        desc: 'Find project partners, showcase your work, discuss ideas, and collaborate on projects.',
        rules: '1. Clearly state tech stack and needed skills.\n2. Give credit to contributors.',
      },
      'projects': {
        name: 'Projects & Collaboration',
        slug: 'projects-collaboration',
        icon: '🔧',
        color: '#a855f7',
        tags: ['Web Dev', 'App Dev', 'AI/ML', 'IoT', 'Research', 'Open Source'],
        desc: 'Find project partners, showcase your work, discuss ideas, and collaborate on projects.',
        rules: '1. Clearly state tech stack and needed skills.\n2. Give credit to contributors.',
      },
      'general-campus': {
        name: 'General Campus Chat',
        slug: 'general-campus',
        icon: '🏫',
        color: '#64748b',
        tags: ['Casual', 'Events', 'Food', 'Campus Life'],
        desc: 'Casual conversation, campus life, memes, events, and community chats.',
        rules: '1. Be respectful and positive.\n2. No NSFW content.',
      },
      'general-chat': {
        name: 'General Campus Chat',
        slug: 'general-campus',
        icon: '🏫',
        color: '#64748b',
        tags: ['Casual', 'Events', 'Food', 'Campus Life'],
        desc: 'Casual conversation, campus life, memes, events, and community chats.',
        rules: '1. Be respectful and positive.\n2. No NSFW content.',
      },
    }

    const matched = groupMap[groupId] || {
      name: 'KIET Discussion Room',
      slug: groupId,
      icon: '💬',
      color: '#6366f1',
      tags: ['General'],
      desc: 'Open educational room for verified KIET members.',
      rules: '1. Be respectful\n2. Share verified academic info',
    }

    group = {
      id: groupId,
      name: matched.name,
      slug: matched.slug || groupId,
      description: matched.desc,
      rules: matched.rules,
      icon: matched.icon,
      color: matched.color || '#6366f1',
      tags: matched.tags,
      is_archived: false,
      is_pinnable: true,
      sort_order: 1,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // 3. Fetch Real Messages from database (safe against non-UUID group id)
  let messages: MessageWithSender[] = []
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(group.id)
    if (isUUID) {
      const { data: dbMessages } = await supabase
        .from('messages')
        .select('*, sender:profiles(*)')
        .eq('group_id', group.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100)

      if (dbMessages && dbMessages.length > 0) {
        messages = dbMessages.map((m: any) => ({
          ...m,
          reply_to: null,
          reactions: [],
          is_bookmarked: false,
          user_has_voted_helpful: false,
        }))
      }
    }
  } catch {
    messages = []
  }

  // Fallback to sample discussion messages if room is fresh
  if (messages.length === 0) {
    const groupKey = group.slug || group.id
    const samples = DEFAULT_SAMPLE_MESSAGES[groupKey] || DEFAULT_SAMPLE_MESSAGES['academic-doubts'] || []
    messages = samples.map((sample, idx) => ({
      id: sample.id || `sample-${group.id}-${idx}`,
      group_id: group!.id,
      sender_id: sample.sender_id || DEMO_PROFILES.student1.id,
      content: sample.content || 'Welcome to this room!',
      reply_to_id: null,
      tag: sample.tag || 'general',
      is_answer: sample.is_answer || false,
      answer_marked_by: sample.is_answer ? DEMO_PROFILES.teacher.id : null,
      helpful_count: sample.helpful_count || 0,
      attachment_url: null,
      attachment_name: null,
      attachment_type: null,
      attachment_size: null,
      is_pinned: false,
      pinned_by: null,
      pinned_at: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: sample.created_at || new Date(Date.now() - 3600000 * (idx + 1)).toISOString(),
      updated_at: new Date().toISOString(),
      sender: sample.sender || DEMO_PROFILES.student1,
      reply_to: null,
      reactions: [],
      is_bookmarked: false,
      user_has_voted_helpful: false,
    }))
  }

  // 4. Fetch Active Members or provide active demo members
  let activeMembers: Profile[] = [currentUser, DEMO_PROFILES.teacher, DEMO_PROFILES.student1, DEMO_PROFILES.student2]
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(group.id)
    if (isUUID) {
      const { data: memberRows } = await supabase
        .from('messages')
        .select('sender:profiles(*)')
        .eq('group_id', group.id)
        .limit(20)

      if (memberRows && memberRows.length > 0) {
        const unique = new Map<string, Profile>()
        unique.set(currentUser.id, currentUser)
        memberRows.forEach((row: any) => {
          if (row.sender) unique.set(row.sender.id, row.sender)
        })
        activeMembers = Array.from(unique.values())
      }
    }
  } catch {}

  return (
    <GroupChatClient
      initialGroup={group}
      initialMessages={messages}
      currentUser={currentUser}
      initialMembers={activeMembers}
    />
  )
}
