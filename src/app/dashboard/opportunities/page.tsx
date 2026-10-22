'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Search, Loader2 } from 'lucide-react'
import OpportunityCard from '@/components/opportunities/OpportunityCard'
import EmptyState from '@/components/shared/EmptyState'
import { createClient, isSupabaseConfigured, withTimeout } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { OpportunityCard as OpportunityType } from '@/types'

const SAMPLE_OPPORTUNITIES: OpportunityType[] = [
  {
    id: 'opp-1',
    group_id: 'internships-jobs',
    group_name: 'Internships & Jobs',
    group_icon: '💼',
    content: 'Microsoft Summer Internship 2026: Applications open for Software Engineer Intern. Stipend: ₹1,25,000/month. Eligibility: 2nd & 3rd Year B.Tech (CSE, IT, ECE). Apply before Oct 30 on careers.microsoft.com',
    tag: 'opportunity',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    sender: {
      id: 'faculty-tp',
      campus_id: 'CL-000001',
      full_name: 'T&P Cell Official',
      username: 'tp_cell',
      email: 'placements@kiet.edu',
      role: 'admin',
      department: 'Training & Placement',
      year: null,
      bio: 'Official placement portal updates',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 85,
      reputation: 450,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'opp-2',
    group_id: 'scholarships-funding',
    group_name: 'Scholarships & Funding',
    group_icon: '💰',
    content: 'UP Post-Matric Scholarship 2026-27: Fresh & Renewal application portal is live. Eligible students with family income < ₹2.5 LPA must submit documents to Student Section Room 102 by Nov 15.',
    tag: 'opportunity',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    sender: {
      id: 'scholarship-officer',
      campus_id: 'CL-000002',
      full_name: 'Scholarship Desk',
      username: 'scholarships_kiet',
      email: 'scholarships@kiet.edu',
      role: 'admin',
      department: 'Administration',
      year: null,
      bio: 'Institutional Financial Aid',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 40,
      reputation: 210,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'opp-3',
    group_id: 'hackathons-competitions',
    group_name: 'Hackathons & Competitions',
    group_icon: '🏆',
    content: 'Smart India Hackathon (SIH 2026) Internal College Screening: Submit your 3-slide problem statement proposal before Nov 5. Top 30 teams will be nominated for National Finals. Cash prizes up to ₹1,00,000.',
    tag: 'opportunity',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    sender: {
      id: 'dr-sharma',
      campus_id: 'CL-000010',
      full_name: 'Dr. R. K. Sharma',
      username: 'prof_sharma',
      email: 'rk.sharma@kiet.edu',
      role: 'teacher',
      department: 'Computer Science & Engineering',
      year: null,
      bio: 'Hackathon Faculty Mentor',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 56,
      reputation: 340,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'opp-4',
    group_id: 'bootcamps-workshops',
    group_name: 'Bootcamps & Workshops',
    group_icon: '🛠️',
    content: 'Hands-on Generative AI & Cloud Architecture Bootcamp: Free 3-day weekend workshop in collaboration with AWS Student Club. Get free AWS credits and participation certificate.',
    tag: 'opportunity',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    sender: {
      id: 'student-club',
      campus_id: 'CL-000215',
      full_name: 'Kshitij Singh',
      username: 'kshitij_s',
      email: 'kshitij.singh@kiet.edu',
      role: 'student',
      department: 'Computer Science & Engineering',
      year: 4,
      bio: 'AWS Cloud Captain',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 32,
      reputation: 175,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export default function OpportunitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [opportunities, setOpportunities] = useState<OpportunityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load existing bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('campus_loop_bookmarks') || '[]')
      if (Array.isArray(stored)) {
        setBookmarkedIds(new Set(stored.map((b: any) => b.id)))
      }
    } catch {}
  }, [])

  // Fetch opportunities from Supabase with fallback
  useEffect(() => {
    async function loadOpportunities() {
      setIsLoading(true)
      if (!isSupabaseConfigured()) {
        let allOpps = [...SAMPLE_OPPORTUNITIES]
        try {
          const groupIds = [
            'internships-jobs',
            'hackathons-competitions',
            'scholarships-funding',
            'bootcamps-workshops',
            'projects-collaboration',
          ]
          groupIds.forEach((gid) => {
            const raw = localStorage.getItem(`campus_loop_msgs_${gid}`)
            if (raw) {
              const msgs = JSON.parse(raw)
              if (Array.isArray(msgs)) {
                msgs
                  .filter((m: any) => m.tag === 'opportunity')
                  .forEach((m: any) => {
                    if (!allOpps.some((o) => o.id === m.id)) {
                      allOpps.unshift({
                        id: m.id,
                        group_id: gid,
                        group_name: gid
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        group_icon: '💼',
                        content: m.content,
                        tag: 'opportunity',
                        created_at: m.created_at,
                        sender: m.sender || {
                          id: m.sender_id,
                          campus_id: 'CL-000000',
                          full_name: 'KIET Member',
                          username: 'member',
                          email: 'user@kiet.edu',
                          role: 'student',
                          department: 'Computer Science & Engineering',
                          year: 3,
                          bio: null,
                          avatar_url: null,
                          is_verified: true,
                          is_banned: false,
                          is_muted: false,
                          muted_until: null,
                          helpful_count: 0,
                          reputation: 15,
                          created_at: m.created_at,
                          updated_at: m.created_at,
                        },
                      })
                    }
                  })
              }
            }
          })
        } catch {}
        setOpportunities(allOpps)
        setIsLoading(false)
        return
      }

      try {
        const { data } = await withTimeout(
          supabase
            .from('messages')
            .select('id, content, tag, created_at, group_id, groups(name, icon), profiles(id, campus_id, full_name, role, department, avatar_url)')
            .eq('tag', 'opportunity')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false }),
          1500,
          { data: null } as any
        )

        if (data && data.length > 0) {
          const mapped: OpportunityType[] = data.map((item: any) => ({
            id: item.id,
            group_id: item.group_id,
            group_name: item.groups?.name || 'KIET Room',
            group_icon: item.groups?.icon || '🌟',
            content: item.content,
            tag: item.tag,
            created_at: item.created_at,
            sender: item.profiles || {
              id: 'unknown',
              campus_id: 'CL-000000',
              full_name: 'KIET Member',
              email: 'user@kiet.edu',
              role: 'student',
              department: null,
              year: null,
              bio: null,
              avatar_url: null,
              is_verified: true,
              is_banned: false,
              is_muted: false,
              muted_until: null,
              helpful_count: 0,
              reputation: 0,
              created_at: item.created_at,
              updated_at: item.created_at,
            },
          }))
          setOpportunities(mapped)
        } else {
          setOpportunities(SAMPLE_OPPORTUNITIES)
        }
      } catch {
        setOpportunities(SAMPLE_OPPORTUNITIES)
      } finally {
        setIsLoading(false)
      }
    }

    loadOpportunities()
  }, [supabase])

  const handleToggleBookmark = (id: string, isSaved: boolean) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.add(id)
      else next.delete(id)
      return next
    })

    // Sync to localStorage bookmarks so Profile page displays them
    try {
      const stored = JSON.parse(localStorage.getItem('campus_loop_bookmarks') || '[]')
      let updated = Array.isArray(stored) ? stored : []
      if (isSaved) {
        const opp = opportunities.find((o) => o.id === id)
        if (opp && !updated.some((b: any) => b.id === id)) {
          updated.push({
            id: opp.id,
            groupId: opp.group_id,
            groupName: opp.group_name,
            senderName: opp.sender.full_name,
            content: opp.content,
            createdAt: opp.created_at,
          })
        }
      } else {
        updated = updated.filter((b: any) => b.id !== id)
      }
      localStorage.setItem('campus_loop_bookmarks', JSON.stringify(updated))
    } catch {}
  }

  const categories = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'internship', label: 'Internships & Jobs', icon: '💼' },
    { id: 'scholarship', label: 'Scholarships & Funding', icon: '💰' },
    { id: 'hackathon', label: 'Hackathons', icon: '🏆' },
    { id: 'bootcamp', label: 'Bootcamps & Workshops', icon: '🛠️' },
  ]

  const filteredOpportunities = opportunities.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' ||
      item.group_id.toLowerCase().includes(selectedCategory) ||
      item.group_name.toLowerCase().includes(selectedCategory) ||
      item.content.toLowerCase().includes(selectedCategory)

    const matchesSearch =
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.full_name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCat && matchesSearch
  })

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-bold mb-2">
              <Sparkles size={14} />
              <span>CampusLoop Aggregator</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Opportunities & Drives
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live feed of scholarships, internships, hackathons, and training bootcamps tagged by students and faculty.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter opportunities..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border',
                selectedCategory === cat.id
                  ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Loading / Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <EmptyState
            icon="🌟"
            title="No opportunities found"
            description="Try selecting another category or clearing your search term."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-2">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                item={opp}
                isBookmarked={bookmarkedIds.has(opp.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
