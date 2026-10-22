'use client'

import { useState } from 'react'
import {
  Flag,
  CheckCircle,
  AlertTriangle,
  Trash2,
  UserX,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ReportReason } from '@/types'

interface ReportItem {
  id: string
  messageId: string
  groupName: string
  authorName: string
  authorCampusId: string
  messageContent: string
  reporterName: string
  reason: ReportReason
  details: string | null
  createdAt: string
  isResolved: boolean
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep-1',
      messageId: 'msg-99',
      groupName: 'General Campus Chat',
      authorName: 'Rohan Gupta',
      authorCampusId: 'CL-000412',
      messageContent: 'Buy leaked midterm question paper for CS301! DM on Telegram @cheatsheet_fast for paid answers.',
      reporterName: 'Priya Verma',
      reason: 'spam',
      details: 'Academic cheating scam targeting 2nd year students.',
      createdAt: '1 hour ago',
      isResolved: false,
    },
    {
      id: 'rep-2',
      messageId: 'msg-104',
      groupName: 'Examinations & Results',
      authorName: 'Anonymous User',
      authorCampusId: 'CL-000521',
      messageContent: 'AKTU has officially cancelled all semester exams and will give everyone mass promotion! Circular coming tonight.',
      reporterName: 'Dr. R. K. Sharma',
      reason: 'misinformation',
      details: 'Unverified rumor causing exam panic.',
      createdAt: '3 hours ago',
      isResolved: false,
    },
  ])

  const handleResolve = (id: string, action: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isResolved: true } : r))
    )
    toast.success(`Report resolved: ${action}`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-black text-foreground">
          Moderation & Flagged Content
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review community reports submitted by KIET members and take disciplinary actions.
        </p>
      </div>

      <div className="space-y-4">
        {reports.filter((r) => !r.isResolved).length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <CheckCircle size={36} className="text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-foreground text-sm">All clear!</h3>
            <p className="text-xs mt-1">No pending reports to moderate.</p>
          </div>
        ) : (
          reports
            .filter((r) => !r.isResolved)
            .map((item) => (
              <div
                key={item.id}
                className="bg-card border border-destructive/20 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-destructive/10 text-destructive">
                      {item.reason}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      in {item.groupName}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Reported {item.createdAt} by {item.reporterName}
                  </span>
                </div>

                <div className="p-3 bg-muted/50 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <span>{item.authorName}</span>
                    <span className="font-mono text-muted-foreground text-[10px]">
                      ({item.authorCampusId})
                    </span>
                  </div>
                  <p className="text-foreground/90 italic">"{item.messageContent}"</p>
                </div>

                {item.details && (
                  <div className="text-xs text-muted-foreground bg-background p-2.5 rounded-lg border border-border">
                    <span className="font-semibold text-foreground">Reporter note: </span>
                    {item.details}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => handleResolve(item.id, 'Dismissed as false report')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolve(item.id, 'Deleted message')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                  >
                    <Trash2 size={13} />
                    <span>Delete Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolve(item.id, 'Banned user & deleted post')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <UserX size={13} />
                    <span>Ban User & Remove</span>
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
