'use client'

import { useState } from 'react'
import {
  FolderTree,
  Plus,
  Edit2,
  Archive,
  Save,
  X,
  CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Group } from '@/types'

export default function AdminGroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Academic Doubts',
      slug: 'academic-doubts',
      description: 'Ask and answer academic questions across all subjects.',
      rules: '1. Be specific.\n2. No homework dumping.',
      icon: '🎓',
      color: '#6366f1',
      tags: ['Maths', 'Programming', 'Physics'],
      is_archived: false,
      is_pinnable: true,
      sort_order: 1,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Courses & Study Material',
      slug: 'courses-study-material',
      description: 'Share notes, textbooks, slides, and syllabus updates.',
      rules: '1. No pirated materials.',
      icon: '📚',
      color: '#8b5cf6',
      tags: ['Notes', 'Books', 'Videos'],
      is_archived: false,
      is_pinnable: true,
      sort_order: 2,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '7',
      name: 'Internships & Jobs',
      slug: 'internships-jobs',
      description: 'Off-campus internships, summer training, and job openings.',
      rules: '1. Official application links only.',
      icon: '💼',
      color: '#3b82f6',
      tags: ['Internships', 'Jobs'],
      is_archived: false,
      is_pinnable: true,
      sort_order: 7,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  const [newGroup, setNewGroup] = useState({
    name: '',
    slug: '',
    description: '',
    rules: '',
    icon: '💬',
    color: '#6366f1',
    tags: '',
  })

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroup.name || !newGroup.slug) {
      toast.error('Group name and slug are required')
      return
    }

    const created: Group = {
      id: `custom-${Date.now()}`,
      name: newGroup.name,
      slug: newGroup.slug.toLowerCase().replace(/\s+/g, '-'),
      description: newGroup.description,
      rules: newGroup.rules,
      icon: newGroup.icon || '💬',
      color: newGroup.color || '#6366f1',
      tags: newGroup.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_archived: false,
      is_pinnable: true,
      sort_order: groups.length + 1,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setGroups((prev) => [...prev, created])
    setShowCreateModal(false)
    setNewGroup({
      name: '',
      slug: '',
      description: '',
      rules: '',
      icon: '💬',
      color: '#6366f1',
      tags: '',
    })
    toast.success('Group created successfully!')
  }

  const handleToggleArchive = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, is_archived: !g.is_archived } : g
      )
    )
    toast.success('Group archive state updated')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Group & Topic Configuration
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create pre-seeded public groups, configure community rules, or archive inactive topics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={16} />
          <span>New Public Group</span>
        </button>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 rounded-xl bg-muted/60">
                    {group.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {group.name}
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      /{group.slug}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleArchive(group.id)}
                  className="text-xs font-semibold px-2 py-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {group.is_archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {group.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 pt-2 border-t border-border/40 text-[10px]">
              {group.tags?.map((t) => (
                <span
                  key={t}
                  className="bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                Create New Campus Topic Group
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Club"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Slug URL</label>
                <input
                  type="text"
                  required
                  placeholder="ai-robotics-club"
                  value={newGroup.slug}
                  onChange={(e) => setNewGroup({ ...newGroup, slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newGroup.icon}
                    onChange={(e) => setNewGroup({ ...newGroup, icon: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-border bg-background text-center text-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Accent Color Hex</label>
                  <input
                    type="color"
                    value={newGroup.color}
                    onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                    className="w-full h-10 p-1 rounded-xl border border-border bg-background cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What is this group for?"
                  className="w-full p-2.5 rounded-xl border border-border bg-background resize-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Sub-Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="ROS, Arduino, Python, Computer Vision"
                  value={newGroup.tags}
                  onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-border bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
