'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  FileText,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import RoleBadge from '@/components/shared/RoleBadge'
import TagBadge from '@/components/shared/TagBadge'
import EmptyState from '@/components/shared/EmptyState'
import { createClient, isSupabaseConfigured, withTimeout } from '@/lib/supabase/client'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { MessageTag, UserRole } from '@/types'

interface SearchItem {
  id: string
  type: 'message' | 'resource'
  groupName: string
  groupId: string
  groupIcon: string
  sender: {
    id: string
    campus_id: string
    full_name: string
    role: UserRole
    avatar_url: string | null
  }
  content: string
  attachmentName?: string | null
  tag: MessageTag
  isAnswer: boolean
  helpfulCount: number
  createdAt: string
}

const DEFAULT_INDEX_ITEMS: SearchItem[] = [
  {
    id: 's-1',
    type: 'message',
    groupName: 'Academic Doubts',
    groupId: 'academic-doubts',
    groupIcon: '🎓',
    sender: {
      id: 'faculty-1',
      campus_id: 'CL-000010',
      full_name: 'Dr. R. K. Sharma',
      role: 'teacher',
      avatar_url: null,
    },
    content: 'A process is an executing program with its own memory space. A thread is a lightweight execution unit inside a process that shares the same address space.',
    tag: 'answer',
    isAnswer: true,
    helpfulCount: 8,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 's-2',
    type: 'message',
    groupName: 'Academic Doubts',
    groupId: 'academic-doubts',
    groupIcon: '🎓',
    sender: {
      id: 'student-1',
      campus_id: 'CL-000188',
      full_name: 'Priya Verma',
      role: 'student',
      avatar_url: null,
    },
    content: 'Can someone explain the difference between Process and Thread in Operating Systems? Preparing for mid-terms next week.',
    tag: 'question',
    isAnswer: false,
    helpfulCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 's-3',
    type: 'resource',
    groupName: 'Courses & Study Material',
    groupId: 'courses-study-material',
    groupIcon: '📚',
    sender: {
      id: 'student-2',
      campus_id: 'CL-000215',
      full_name: 'Kshitij Singh',
      role: 'student',
      avatar_url: null,
    },
    content: 'Uploaded handwritten unit 1-3 lecture notes for Data Structures (KCS-301). Covers Linked Lists, Binary Trees, and AVL Rotations with dry-run diagrams.',
    attachmentName: 'KCS301_DSA_Notes_Units1-3.pdf',
    tag: 'resource',
    isAnswer: false,
    helpfulCount: 15,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 's-4',
    type: 'message',
    groupName: 'Internships & Jobs',
    groupId: 'internships-jobs',
    groupIcon: '💼',
    sender: {
      id: 'admin-1',
      campus_id: 'CL-000001',
      full_name: 'T&P Cell Official',
      role: 'admin',
      avatar_url: null,
    },
    content: 'Microsoft Summer Internship 2026: Applications open for Software Engineer Intern. Stipend: ₹1,25,000/month. Eligibility: 2nd & 3rd Year B.Tech (CSE, IT, ECE).',
    tag: 'opportunity',
    isAnswer: false,
    helpfulCount: 22,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 's-5',
    type: 'message',
    groupName: 'Examinations & Results',
    groupId: 'examinations-results',
    groupIcon: '📝',
    sender: {
      id: 'teacher-2',
      campus_id: 'CL-000010',
      full_name: 'Dr. R. K. Sharma',
      role: 'teacher',
      avatar_url: null,
    },
    content: 'Pre-University Examination (PUE) tentative schedules have been published on the student ERP portal. Please verify your subject codes.',
    tag: 'announcement',
    isAnswer: false,
    helpfulCount: 18,
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 's-6',
    type: 'message',
    groupName: 'Academic Doubts',
    groupId: 'academic-doubts',
    groupIcon: '🎓',
    sender: {
      id: 'student-3',
      campus_id: 'CL-000101',
      full_name: 'Aarav Kumar',
      role: 'student',
      avatar_url: null,
    },
    content: 'How do you prevent SQL injection attacks in modern web APIs? Is parameterized queries enough or do we need ORM escaping too?',
    tag: 'question',
    isAnswer: false,
    helpfulCount: 4,
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [unansweredOnly, setUnansweredOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'resources' | 'unanswered'>('all')
  const [results, setResults] = useState<SearchItem[]>(DEFAULT_INDEX_ITEMS)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Real database search with fallback
  useEffect(() => {
    async function performSearch() {
      setIsLoading(true)

      const filterFallback = () => {
        let filtered = [...DEFAULT_INDEX_ITEMS]
        if (query.trim()) {
          const q = query.toLowerCase()
          filtered = filtered.filter(
            (i) =>
              i.content.toLowerCase().includes(q) ||
              i.groupName.toLowerCase().includes(q) ||
              i.sender.full_name.toLowerCase().includes(q)
          )
        }
        if (selectedTag !== 'all') {
          filtered = filtered.filter((i) => i.tag === selectedTag)
        }
        if (selectedRole !== 'all') {
          filtered = filtered.filter((i) => i.sender.role === selectedRole)
        }
        if (unansweredOnly || activeTab === 'unanswered') {
          filtered = filtered.filter((i) => i.tag === 'question' && !i.isAnswer)
        }
        if (activeTab === 'resources') {
          filtered = filtered.filter((i) => !!i.attachmentName)
        }
        setResults(filtered)
      }

      if (!isSupabaseConfigured()) {
        filterFallback()
        setIsLoading(false)
        return
      }

      try {
        let req = supabase
          .from('messages')
          .select('id, content, tag, is_answer, helpful_count, attachment_name, created_at, group_id, groups(name, icon), profiles(id, campus_id, full_name, role, avatar_url)')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(50)

        if (query.trim()) {
          req = req.ilike('content', `%${query.trim()}%`)
        }

        if (selectedTag !== 'all') {
          req = req.eq('tag', selectedTag)
        }

        if (unansweredOnly || activeTab === 'unanswered') {
          req = req.eq('tag', 'question').eq('is_answer', false)
        }

        if (activeTab === 'resources') {
          req = req.not('attachment_url', 'is', null)
        }

        const { data } = await withTimeout(req, 1500, { data: null } as any)

        if (data && data.length > 0) {
          const mapped: SearchItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.attachment_name ? 'resource' : 'message',
            groupName: item.groups?.name || 'KIET Room',
            groupId: item.group_id,
            groupIcon: item.groups?.icon || '💬',
            sender: item.profiles || {
              id: 'unknown',
              campus_id: 'CL-000000',
              full_name: 'KIET Member',
              role: 'student' as UserRole,
              avatar_url: null,
            },
            content: item.content,
            attachmentName: item.attachment_name,
            tag: item.tag,
            isAnswer: item.is_answer,
            helpfulCount: item.helpful_count || 0,
            createdAt: item.created_at,
          }))

          if (selectedRole !== 'all') {
            setResults(mapped.filter((m) => m.sender.role === selectedRole))
          } else {
            setResults(mapped)
          }
        } else {
          filterFallback()
        }
      } catch {
        filterFallback()
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      performSearch()
    }, 250)

    return () => clearTimeout(timer)
  }, [query, selectedTag, selectedRole, unansweredOnly, activeTab, supabase])

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Global Campus Discovery
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search messages, verified answers, academic study material, and active faculty across all KIET groups.
          </p>
        </div>

        {/* Big Search Input with Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search algorithms, scholarships, course codes, professors, or exam circulars..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Quick filter tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/50 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all', label: 'All Results' },
                  { id: 'unanswered', label: '❓ Unanswered Doubts' },
                  { id: 'resources', label: '📎 Files & Notes' },
                  { id: 'messages', label: '💬 Messages' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setUnansweredOnly(tab.id === 'unanswered')
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter by role & tags */}
            <div className="flex items-center gap-2">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-muted px-2.5 py-1.5 rounded-lg border-0 text-xs font-medium cursor-pointer"
              >
                <option value="all">All Tags</option>
                <option value="question">Questions</option>
                <option value="answer">Answers</option>
                <option value="resource">Resources</option>
                <option value="opportunity">Opportunities</option>
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-muted px-2.5 py-1.5 rounded-lg border-0 text-xs font-medium cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Faculty Only</option>
                <option value="student">Student</option>
                <option value="admin">Official Notice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {results.length} Results Found
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No messages found"
              description={query ? "No posts match your search query." : "Messages sent in any group will be indexed here automatically."}
            />
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-4 shadow-xs hover:border-primary/40 transition-colors"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{item.groupIcon}</span>
                    <Link
                      href={`/dashboard/g/${item.groupId}`}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {item.groupName}
                    </Link>
                    <span className="text-muted-foreground text-xs">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">
                        {item.sender.full_name}
                      </span>
                      <RoleBadge role={item.sender.role} compact />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.tag && <TagBadge tag={item.tag} />}
                    {item.isAnswer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} /> Verified Answer
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-foreground/90 leading-relaxed mb-3">
                  {item.content}
                </p>

                {/* Attached file link if resource */}
                {item.attachmentName && (
                  <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted text-xs font-semibold text-primary">
                    <FileText size={14} />
                    <span>{item.attachmentName}</span>
                  </div>
                )}

                {/* Footer Jump link */}
                <div className="flex justify-end pt-2 border-t border-border/40">
                  <Link
                    href={`/dashboard/g/${item.groupId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Open in group chat</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
