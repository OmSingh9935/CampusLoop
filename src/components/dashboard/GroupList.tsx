'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import GroupListItem from './GroupListItem'
import { GroupListSkeleton } from '@/components/shared/SkeletonLoader'
import { cn } from '@/lib/utils'
import type { GroupWithMeta } from '@/types'

interface GroupListProps {
  groups: GroupWithMeta[]
  isLoading?: boolean
  onSelectGroup?: () => void
}

export default function GroupList({
  groups,
  isLoading = false,
  onSelectGroup,
}: GroupListProps) {
  const params = useParams()
  const activeGroupId = params?.groupId as string | undefined

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  // Extract all unique tags across all groups
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    groups.forEach((g) => {
      g.tags?.forEach((t) => tags.add(t))
    })
    return Array.from(tags)
  }, [groups])

  // Filter and sort groups
  const filteredGroups = useMemo(() => {
    return groups
      .filter((group) => {
        const matchesQuery =
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesTag =
          selectedTag === 'all' ||
          group.tags?.includes(selectedTag)

        return matchesQuery && matchesTag
      })
      .sort((a, b) => {
        // Pinned groups always on top
        const aPinned = a.user_prefs?.is_pinned ? 1 : 0
        const bPinned = b.user_prefs?.is_pinned ? 1 : 0
        if (aPinned !== bPinned) return bPinned - aPinned

        // Then by last message time if exists
        const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0
        const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0
        if (aTime !== bTime) return bTime - aTime

        // Fallback to sort_order
        return a.sort_order - b.sort_order
      })
  }, [groups, searchQuery, selectedTag])

  return (
    <div className="flex flex-col h-full bg-card/40 border-r border-border select-none">
      {/* Header */}
      <div className="p-4 border-b border-border/60 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">KIET Groups</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {groups.length}
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups or topics..."
            className={cn(
              'w-full pl-9 pr-8 py-2 rounded-xl text-sm border border-border/80 bg-background',
              'placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              'transition-all'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick filter pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
                selectedTag === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              All
            </button>
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                className={cn(
                  'px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Group List Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {isLoading ? (
          <GroupListSkeleton />
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-10 px-4 text-muted-foreground">
            <p className="text-sm font-medium">No groups match your search</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Try another keyword or clear filters</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <GroupListItem
              key={group.id}
              group={group}
              isActive={activeGroupId === group.id}
              onClick={onSelectGroup}
            />
          ))
        )}
      </div>
    </div>
  )
}
