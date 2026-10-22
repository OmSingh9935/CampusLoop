'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  VolumeX,
  Volume2,
  CheckCircle2,
  MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '@/components/shared/Avatar'
import RoleBadge from '@/components/shared/RoleBadge'
import type { Profile, UserRole } from '@/types'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<Profile[]>([
    {
      id: 'u-1',
      campus_id: 'CL-000001',
      full_name: 'CampusLoop Administrator',
      username: 'admin',
      email: 'admin@kiet.edu',
      role: 'admin' as UserRole,
      department: 'Administration',
      year: null,
      bio: null,
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 50,
      reputation: 500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'u-2',
      campus_id: 'CL-000010',
      full_name: 'Dr. R. K. Sharma',
      username: 'prof_sharma',
      email: 'rk.sharma@kiet.edu',
      role: 'teacher' as UserRole,
      department: 'Computer Science & Engineering',
      year: null,
      bio: 'Head of Department',
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 42,
      reputation: 250,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'u-3',
      campus_id: 'CL-000101',
      full_name: 'Aarav Kumar',
      username: 'aarav_k',
      email: 'aarav.kumar@kiet.edu',
      role: 'student' as UserRole,
      department: 'Computer Science',
      year: 3,
      bio: null,
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 18,
      reputation: 95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'u-4',
      campus_id: 'CL-000188',
      full_name: 'Priya Verma',
      username: 'priya_v',
      email: 'priya.verma@kiet.edu',
      role: 'student' as UserRole,
      department: 'Information Technology',
      year: 2,
      bio: null,
      avatar_url: null,
      is_verified: true,
      is_banned: false,
      is_muted: false,
      muted_until: null,
      helpful_count: 6,
      reputation: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )
    toast.success(`Role changed to ${newRole}`)
  }

  const handleToggleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_banned: !u.is_banned } : u
      )
    )
    toast.success('User status updated')
  }

  const handleToggleMute = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_muted: !u.is_muted } : u
      )
    )
    toast.success('Mute status toggled')
  }

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.campus_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            User Accounts & Roles
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage permissions, promote faculty to verified Teacher status, ban or mute policy violators.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-card"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">Member</th>
                <th className="p-3.5">Campus ID</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Current Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar profile={user} size="sm" />
                      <div>
                        <div className="font-bold text-foreground">
                          {user.full_name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-primary font-bold">
                    {user.campus_id}
                  </td>

                  <td className="p-3.5 text-muted-foreground">
                    {user.department || 'General'}
                    {user.year ? ` (Yr ${user.year})` : ''}
                  </td>

                  <td className="p-3.5">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="bg-muted px-2.5 py-1 rounded-lg border-0 text-xs font-semibold cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher (Verified)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleMute(user.id)}
                      className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium hover:bg-muted cursor-pointer"
                      title={user.is_muted ? 'Unmute user' : 'Mute user'}
                    >
                      {user.is_muted ? (
                        <span className="text-amber-500 font-bold">Muted</span>
                      ) : (
                        'Mute'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBan(user.id)}
                      className="px-2.5 py-1 rounded-lg border border-destructive/30 text-[11px] font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      {user.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
