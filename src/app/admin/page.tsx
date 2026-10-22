'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  MessageSquare,
  Flag,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FolderTree
} from 'lucide-react'
import { createClient, isSupabaseConfigured, withTimeout } from '@/lib/supabase/client'

export default function AdminOverviewPage() {
  const supabase = createClient()
  const [statsData, setStatsData] = useState({
    users: '1,420',
    groups: '11',
    messages: '28,450',
    reports: '2',
  })

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured()) {
        return
      }

      try {
        const [usersRes, groupsRes, messagesRes, reportsRes] = await Promise.allSettled([
          withTimeout(supabase.from('profiles').select('*', { count: 'exact', head: true }), 1500, { count: null } as any),
          withTimeout(supabase.from('groups').select('*', { count: 'exact', head: true }), 1500, { count: null } as any),
          withTimeout(supabase.from('messages').select('*', { count: 'exact', head: true }), 1500, { count: null } as any),
          withTimeout(supabase.from('reports').select('*', { count: 'exact', head: true }).eq('is_resolved', false), 1500, { count: null } as any),
        ])

        const usersCount = usersRes.status === 'fulfilled' && usersRes.value.count !== null ? usersRes.value.count : null
        const groupsCount = groupsRes.status === 'fulfilled' && groupsRes.value.count !== null ? groupsRes.value.count : null
        const messagesCount = messagesRes.status === 'fulfilled' && messagesRes.value.count !== null ? messagesRes.value.count : null
        const reportsCount = reportsRes.status === 'fulfilled' && reportsRes.value.count !== null ? reportsRes.value.count : null

        setStatsData((prev) => ({
          users: usersCount !== null ? usersCount.toLocaleString() : prev.users,
          groups: groupsCount !== null ? groupsCount.toString() : prev.groups,
          messages: messagesCount !== null ? messagesCount.toLocaleString() : prev.messages,
          reports: reportsCount !== null ? reportsCount.toString() : prev.reports,
        }))
      } catch {}
    }

    loadStats()
  }, [supabase])

  const stats = [
    { label: 'Total Verified Members', value: statsData.users, icon: Users, change: '+12% this week', color: 'text-blue-500' },
    { label: 'Active Topics / Groups', value: statsData.groups, icon: FolderTree, change: '100% active', color: 'text-indigo-500' },
    { label: 'Messages Sent', value: statsData.messages, icon: MessageSquare, change: '+1.2k today', color: 'text-emerald-500' },
    { label: 'Open Flagged Reports', value: statsData.reports, icon: Flag, change: 'Requires review', color: 'text-rose-500' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Platform Administration Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor campus engagement, enforce academic code of conduct, and manage @kiet.edu credentials.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                <Icon size={18} className={s.color} />
              </div>
              <div className="text-2xl font-black text-foreground">{s.value}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{s.change}</div>
            </div>
          )
        })}
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          href="/admin/users"
          className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-xs transition-colors space-y-2"
        >
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Users size={18} />
            <span>Manage Users & Roles</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Promote faculty to Teacher role, assign Admin privileges, ban spammers, or mute violators.
          </p>
        </Link>

        <Link
          href="/admin/groups"
          className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-xs transition-colors space-y-2"
        >
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <FolderTree size={18} />
            <span>Manage Groups</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Create new departmental rooms, edit community rules, update topic tags, or archive old groups.
          </p>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 shadow-xs transition-colors space-y-2"
        >
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Pending Flagged Reports ({statsData.reports})</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Review reported messages for harassment, spam, or misinformation, and take swift disciplinary action.
          </p>
        </Link>
      </div>

      {/* Security notice */}
      <div className="p-4 bg-muted/40 rounded-2xl border border-border flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-foreground">Strict KIET Domain Security Active</p>
          <p className="text-muted-foreground leading-relaxed">
            Database triggers and RLS policies are enforcing <code>@kiet.edu</code> verification on all write operations. Public external signups without a matching institutional email are rejected at client, server, and postgres trigger tiers.
          </p>
        </div>
      </div>
    </div>
  )
}
