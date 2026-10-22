# CampusLoop 🎓

> **A collaborative educational community platform built specifically for students and faculty of KIET (kiet.edu).**

Information about academic doubts, courses, examinations, holidays, scholarships, bootcamps, and internships is traditionally scattered across dozens of external sites and unofficial WhatsApp groups. **CampusLoop** brings all campus communication into one place with a clean, responsive, WhatsApp-Web-style dashboard.

---

## ⚡ Key Architectural Differentiator

**NO Direct / Private Messaging.**  
Unlike generic chat apps, CampusLoop has zero direct 1-to-1 chats. Only **pre-created, public educational topic groups** exist. Every verified `@kiet.edu` user can read and post in all rooms without requiring invites or join approval, fostering open peer learning and faculty mentorship.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components & Actions)
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS + Radix UI Primitives + Lucide Icons
- **Database & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS) on every table
- **Realtime:** Supabase Realtime (WebSocket-based message streams, typing indicators, presence)
- **File Storage:** Supabase Storage (`campus-loop-files` bucket for documents and images)
- **Form & Validation:** React Hook Form + Zod

---

## 🔒 3-Tier Security & Authentication (@kiet.edu ONLY)

Only emails ending with `@kiet.edu` (case-insensitive) are allowed access. This is enforced at three distinct layers:
1. **Client Tier:** Zod schema regex validation (`/^[a-zA-Z0-9._%+\-]+@kiet\.edu$/i`) on signup and login forms. Rejects lookalikes such as `user@kiet.edu.fake.com`.
2. **Server Tier:** Server-side API and middleware checks rejecting non-conforming domains before hitting the database.
3. **Database Tier:** PostgreSQL table constraint and triggers:
   ```sql
   ALTER TABLE profiles
     ADD CONSTRAINT profiles_email_kiet_edu
     CHECK (email ~* '^[a-zA-Z0-9._%+\-]+@kiet\.edu$');
   ```

Each user receives an auto-generated unique identifier formatted as **`CL-XXXXXX`** (e.g. `CL-000123`) from a dedicated PostgreSQL sequence, alongside an optional `@username`.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Clone & Install Dependencies
```bash
cd campus-loop
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STORAGE_BUCKET=campus-loop-files
```

### 4. Database Setup (Supabase)
Run the migration scripts located in `supabase/migrations/` in order within the Supabase SQL Editor:
1. `supabase/migrations/001_init_schema.sql` (Creates tables, triggers, sequences, enums)
2. `supabase/migrations/002_rls_policies.sql` (Enables strict Row Level Security)
3. `supabase/migrations/003_seed.sql` (Seeds the 11 official KIET groups)

#### Storage Setup
1. In the Supabase Dashboard, go to **Storage** → **New bucket**.
2. Name the bucket `campus-loop-files`. Set it to Public or configure authenticated access policies.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Database Schema Overview

| Table | Purpose |
|---|---|
| `profiles` | Stores student/teacher metadata, Campus ID (`CL-XXXXXX`), reputation points, helpful count. |
| `groups` | 11 official pre-seeded topic rooms with rules, icons, and tags. Managed by admins. |
| `messages` | Chat messages with tags (`question`, `answer`, `resource`, `opportunity`, `announcement`), reply threading, verified answer flag, and attachments. |
| `reactions` | Emoji reactions per message per user. |
| `helpful_votes` | Community upvotes rewarding helpful responses with reputation points. |
| `bookmarks` | Saved messages and opportunities accessible in user profiles. |
| `reports` | Moderation queue for flagged spam or violations. |
| `group_reads` | Tracks last read timestamp per user per group for accurate unread badges. |
| `user_group_prefs`| User-specific pinned and muted room states. |

---

## 🏛️ Pre-seeded KIET Groups

1. **🎓 Academic Doubts** (Sub-tags: Maths, Programming, Physics, Electronics, Core)
2. **📚 Courses & Study Material**
3. **📝 Examinations & Results**
4. **📅 College Holidays & Notices**
5. **💰 Scholarships & Funding**
6. **🛠️ Bootcamps & Workshops**
7. **💼 Internships & Jobs**
8. **🏆 Hackathons & Competitions**
9. **🎯 Placements & Interview Prep**
10. **🔧 Projects & Collaboration**
11. **🏫 General Campus Chat**

---

## 🧪 Testing Verification Checklist

- [x] **Non-KIET Signup Rejection:** Attempting to register with `test@gmail.com` or `user@kiet.edu.fake.com` triggers an instant validation error.
- [x] **Valid KIET Signup:** Registering with `student@kiet.edu` generates the verification dispatch and assigns a unique `CL-XXXXXX` ID.
- [x] **Real-time Synchronization:** Multi-tab test shows immediate message broadcast and typing indicators without page reload.
- [x] **Verified Answer System:** Faculty or asker marking a doubt with "Mark as Answer" pins the verified badge and increases the author's reputation points.
- [x] **File Sharing:** PDF and image uploads render inside chat bubbles and auto-populate the group's "Files" tab.
- [x] **Opportunity Aggregator:** Any post tagged `#Opportunity` automatically surfaces in card format on `/dashboard/opportunities`.
- [x] **Admin Route Protection:** Non-admin accounts attempting to access `/admin` are redirected to the dashboard.

---

## 🌐 Deployment to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), import the project.
3. Add the environment variables from your `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).
4. Click **Deploy**. Vercel will build and serve the App Router application with automatic HTTPS.
