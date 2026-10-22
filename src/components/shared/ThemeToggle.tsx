'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className={cn('p-2 rounded-lg text-muted-foreground', compact ? 'w-8 h-8' : 'w-24 h-8 bg-muted')} />
    )
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'Auto' },
  ] as const

  if (compact) {
    const isDark = theme === 'dark'
    const nextTheme = isDark ? 'light' : 'dark'
    const Icon = isDark ? Sun : Moon
    return (
      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
        aria-label={`Switch to ${nextTheme} mode`}
        title={`Switch to ${nextTheme} mode`}
      >
        <Icon size={18} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
            theme === value
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={`${label} theme`}
        >
          <Icon size={13} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
