'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  User,
  Award,
  ThumbsUp,
  Bookmark,
  Calendar,
  Building,
  Mail,
  Shield,
  Edit3,
  Check,
  Save,
  MessageSquare,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '@/components/shared/Avatar'
import RoleBadge from '@/components/shared/RoleBadge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getReputationLevel } from '@/lib/constants'
import type { Profile, UserRole } from '@/types'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile>({
    id: 'my-user-id',
    campus_id: 'CL-000101',
    full_name: 'Aarav Kumar',
    username: 'aarav_k',
    email: 'aarav.kumar@kiet.edu',
    role: 'student' as UserRole,
    department: 'Computer Science & Engineering',
    year: 3,
    bio: 'Pre-final year B.Tech student @ KIET. Building full-stack systems and exploring distributed databases.',
    avatar_url: null,
    is_verified: true,
    is_banned: false,
    is_muted: false,
    muted_until: null,
    helpful_count: 18,
    reputation: 95,
    created_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    updated_at: new Date().toISOString(),
  })

  const [editForm, setEditForm] = useState({
    full_name: profile.full_name,
    username: profile.username || '',
    bio: profile.bio || '',
    department: profile.department || '',
    year: profile.year || 3,
  })

  const [savedBookmarks, setSavedBookmarks] = useState<any[]>([])

  // Hydrate user and bookmarks from localStorage and Supabase
  useEffect(() => {
    try {
      const stored = localStorage.getItem('campus_loop_current_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setProfile((prev) => ({ ...prev, ...parsed }))
        setEditForm({
          full_name: parsed.full_name || 'Aarav Kumar',
          username: parsed.username || 'aarav_k',
          bio: parsed.bio || '',
          department: parsed.department || 'Computer Science & Engineering',
          year: parsed.year || 3,
        })
      }
    } catch {}

    try {
      const bms = JSON.parse(localStorage.getItem('campus_loop_bookmarks') || '[]')
      if (Array.isArray(bms) && bms.length > 0) {
        setSavedBookmarks(bms)
      } else {
        // Fallback demo saved items
        const defaultBms = [
          {
            id: 'opp-1',
            groupId: 'internships-jobs',
            groupName: 'Internships & Jobs',
            senderName: 'T&P Cell Official',
            content: 'Microsoft Summer Internship 2026: Applications open for Software Engineer Intern. Stipend: ₹1,25,000/month.',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
          {
            id: 'demo-msg-ad-2',
            groupId: 'academic-doubts',
            groupName: 'Academic Doubts',
            senderName: 'Dr. R. K. Sharma',
            content: 'A process is an executing instance of a program with its own dedicated memory address space. A thread is a lightweight execution unit inside a process.',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]
        setSavedBookmarks(defaultBms)
        localStorage.setItem('campus_loop_bookmarks', JSON.stringify(defaultBms))
      }
    } catch {}
  }, [])

  const repLevel = getReputationLevel(profile.reputation)

  const handleSaveProfile = async () => {
    const updated: Profile = {
      ...profile,
      full_name: editForm.full_name,
      username: editForm.username || null,
      bio: editForm.bio,
      department: editForm.department,
      year: editForm.year,
      updated_at: new Date().toISOString(),
    }

    setProfile(updated)
    setIsEditing(false)

    // Save to localStorage & session cookie
    try {
      const jsonStr = JSON.stringify(updated)
      localStorage.setItem('campus_loop_current_user', jsonStr)
      document.cookie = `campus_loop_user=${encodeURIComponent(jsonStr)}; path=/; max-age=604800; SameSite=Lax`
      document.cookie = `campus_loop_demo_user=${encodeURIComponent(jsonStr)}; path=/; max-age=604800; SameSite=Lax`

      // Also update in registered users registry
      const regRaw = localStorage.getItem('campus_loop_registered_users')
      if (regRaw) {
        const users = JSON.parse(regRaw)
        if (Array.isArray(users)) {
          const updatedUsers = users.map((u: any) =>
            u.id === updated.id || u.email?.toLowerCase() === updated.email?.toLowerCase()
              ? { ...u, ...updated }
              : u
          )
          localStorage.setItem('campus_loop_registered_users', JSON.stringify(updatedUsers))
        }
      }
    } catch {}

    // Also update Supabase profiles table if authenticated
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(updated.id)
      if (isUUID) {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.full_name,
            username: updated.username,
            bio: updated.bio,
            department: updated.department,
            year: updated.year,
          })
          .eq('id', updated.id)
      }
    } catch {}

    toast.success('Profile updated successfully!')
  }

  const handleRemoveBookmark = (id: string) => {
    setSavedBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id)
      try {
        localStorage.setItem('campus_loop_bookmarks', JSON.stringify(next))
      } catch {}
      return next
    })
    toast.success('Bookmark removed')
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Profile Card Header */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
          {/* Accent banner */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/30 via-indigo-500/20 to-purple-500/30" />

          <div className="relative pt-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              <Avatar
                profile={profile}
                size="xl"
                className="w-24 h-24 ring-4 ring-card shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                  <h1 className="text-2xl font-black text-foreground">
                    {profile.full_name}
                  </h1>
                  <RoleBadge role={profile.role} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono justify-center md:justify-start">
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {profile.campus_id}
                  </span>
                  <span>@{profile.username || 'user'}</span>
                  <span>•</span>
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditing) handleSaveProfile()
                else setIsEditing(true)
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-8 mt-6 border-t border-border/60 text-center">
            <div className="p-3 bg-muted/40 rounded-2xl">
              <div className="flex items-center justify-center gap-1.5 text-amber-500 font-black text-xl">
                <span>{repLevel.badge}</span>
                <span>{profile.reputation}</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                Reputation ({repLevel.label})
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-emerald-500 font-black text-xl">
                <ThumbsUp size={18} />
                <span>{profile.helpful_count}</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                Helpful Upvotes
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-primary font-black text-xl">
                <Bookmark size={18} />
                <span>{savedBookmarks.length}</span>
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                Saved Items
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form or Bio View */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-foreground">
            Academic & Profile Information
          </h2>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Unique Username (@)</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Year</label>
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5 font-medium">About</span>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
                  <Building size={16} className="text-primary" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Department</span>
                    <span className="font-semibold text-foreground">{profile.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40">
                  <Calendar size={16} className="text-primary" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Academic Year</span>
                    <span className="font-semibold text-foreground">Year {profile.year}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bookmarked / Saved Items */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bookmark size={18} className="text-primary" />
              <span>Saved Messages & Opportunities</span>
            </h2>
            <span className="text-xs text-muted-foreground">{savedBookmarks.length} saved</span>
          </div>

          {savedBookmarks.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No saved items yet. Tap the bookmark icon on any message or opportunity to save it here.
            </div>
          ) : (
            <div className="space-y-3">
              {savedBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3.5 rounded-2xl border border-border bg-background flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <span>{bm.groupName}</span>
                      <span className="text-muted-foreground font-normal">• by {bm.senderName}</span>
                    </div>
                    <p className="text-xs text-foreground/90 line-clamp-2">{bm.content}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <Link
                      href={`/dashboard/g/${bm.groupId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <MessageSquare size={13} />
                      <span>View in chat</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
