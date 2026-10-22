'use client'

import { useState } from 'react'
import {
  X,
  Pin,
  Volume2,
  VolumeX,
  FileText,
  Download,
  ShieldAlert,
  Users,
  CheckCircle2,
  Bookmark
} from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import RoleBadge from '@/components/shared/RoleBadge'
import { formatFileSize, formatRelativeTime, cn } from '@/lib/utils'
import type { GroupWithMeta, MessageWithSender, Profile } from '@/types'

interface GroupInfoPanelProps {
  group: GroupWithMeta
  pinnedMessages: MessageWithSender[]
  resources: MessageWithSender[]
  members: Profile[]
  onClose: () => void
  onTogglePinGroup?: (groupId: string, isPinned: boolean) => void
  onToggleMuteGroup?: (groupId: string, isMuted: boolean) => void
}

export default function GroupInfoPanel({
  group,
  pinnedMessages,
  resources,
  members,
  onClose,
  onTogglePinGroup,
  onToggleMuteGroup,
}: GroupInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'pinned' | 'resources' | 'members'>('about')

  const isPinned = group.user_prefs?.is_pinned || false
  const isMuted = group.user_prefs?.is_muted || false

  return (
    <aside className="w-80 border-l border-border bg-card/60 backdrop-blur-sm flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h3 className="font-bold text-sm">Group Overview</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Group Hero banner */}
      <div className="flex flex-col items-center p-6 border-b border-border/40 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm border border-border/50"
          style={{ backgroundColor: `${group.color}20` }}
        >
          {group.icon}
        </div>
        <h2 className="font-bold text-base text-foreground leading-tight">{group.name}</h2>
        <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
          {group.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Toggles: Pin / Mute group */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => onTogglePinGroup?.(group.id, !isPinned)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors',
              isPinned
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                : 'hover:bg-muted border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Pin size={13} className={isPinned ? 'fill-amber-500 rotate-45' : ''} />
            <span>{isPinned ? 'Pinned' : 'Pin Group'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleMuteGroup?.(group.id, !isMuted)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors',
              isMuted
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                : 'hover:bg-muted border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isMuted ? 'Muted' : 'Mute'}</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-border/60 text-xs font-medium px-2">
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={cn(
            'flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors',
            activeTab === 'about'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          About
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pinned')}
          className={cn(
            'flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors',
            activeTab === 'pinned'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Pinned ({pinnedMessages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={cn(
            'flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors',
            activeTab === 'resources'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Files ({resources.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={cn(
            'flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors',
            activeTab === 'members'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Members
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Description
              </h4>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {group.description || 'No description provided.'}
              </p>
            </div>

            {group.rules && (
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2">
                  <ShieldAlert size={14} className="text-amber-500" />
                  <span>Group Rules</span>
                </div>
                <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {group.rules}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pinned' && (
          <div className="space-y-2">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No pinned messages in this group yet.
              </div>
            ) : (
              pinnedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl border border-border bg-background/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">{msg.sender.full_name}</span>
                    <span>{formatRelativeTime(msg.created_at)}</span>
                  </div>
                  <p className="line-clamp-3 text-foreground">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-2">
            {resources.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No files or resources shared yet.
              </div>
            ) : (
              resources.map((msg) => (
                <a
                  key={msg.id}
                  href={msg.attachment_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{msg.attachment_name || 'Resource'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      By {msg.sender.full_name} • {msg.attachment_size ? formatFileSize(msg.attachment_size) : ''}
                    </p>
                  </div>
                  <Download size={14} className="text-muted-foreground" />
                </a>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-1">
              Active verified participants in this topic
            </div>
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/60 transition-colors"
              >
                <Avatar profile={member} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold truncate text-foreground">
                      {member.full_name}
                    </span>
                    <RoleBadge role={member.role} compact />
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {member.campus_id} {member.department ? `• ${member.department}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
