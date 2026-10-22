import Link from 'next/link'
import { GraduationCap, MessageSquare, Sparkles, Search, ShieldCheck } from 'lucide-react'

export default function DashboardIndexPage() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full p-8 text-center bg-card/20 select-none">
      <div className="max-w-md flex flex-col items-center space-y-4">
        {/* Animated Icon */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
          <GraduationCap size={44} />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome to CampusLoop
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            The collaborative educational hub for KIET students and faculty. Select any pre-created group on the left to ask questions, discover internships, or share study material.
          </p>
        </div>

        {/* Feature quick tiles */}
        <div className="grid grid-cols-2 gap-3 w-full pt-4">
          <Link
            href="/dashboard/g/academic-doubts"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/80 hover:bg-muted transition-all text-left shadow-xs"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <MessageSquare size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Academic Doubts</p>
              <p className="text-[10px] text-muted-foreground">Ask subject queries</p>
            </div>
          </Link>

          <Link
            href="/dashboard/opportunities"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/80 hover:bg-muted transition-all text-left shadow-xs"
          >
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Opportunities</p>
              <p className="text-[10px] text-muted-foreground">Jobs & hackathons</p>
            </div>
          </Link>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/75 pt-6 border-t border-border/40">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Strictly restricted to verified <strong>@kiet.edu</strong> members</span>
        </div>
      </div>
    </div>
  )
}
