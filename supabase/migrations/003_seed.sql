-- ============================================================
-- CampusLoop Seed Data
-- ============================================================
-- NOTE: Run this AFTER creating an admin user in Supabase Auth.
-- Replace 'ADMIN_USER_UUID' with the actual UUID from auth.users.
-- The admin user email must be: admin@kiet.edu
-- ============================================================

-- Seed all 11 groups
INSERT INTO groups (name, slug, description, rules, icon, color, tags, sort_order) VALUES
(
  'Academic Doubts',
  'academic-doubts',
  'Ask and answer academic questions across all subjects. Post your doubts, get help from peers and teachers. Use sub-tags to categorize your question.',
  '1. Be specific — share error messages, code, or problem context.\n2. Search before posting to avoid duplicates.\n3. Tag your question with the right subject.\n4. Mark answers as helpful to reward contributors.\n5. No homework completion requests.',
  '🎓',
  '#6366f1',
  ARRAY['Maths', 'Programming', 'Physics', 'Electronics', 'Core Subjects'],
  1
),
(
  'Courses & Study Material',
  'courses-study-material',
  'Share and discover course recommendations, notes, slides, books, and study resources. Help each other learn better.',
  '1. Only share resources you have rights to distribute.\n2. Tag posts as Resource so they appear in the Resources tab.\n3. Include course name, semester, and subject when sharing.\n4. No pirated content.',
  '📚',
  '#8b5cf6',
  ARRAY['Notes', 'Books', 'Videos', 'Slides', 'Practice Papers'],
  2
),
(
  'Examinations & Results',
  'examinations-results',
  'Exam schedules, date sheets, result announcements, grade discussions, and exam preparation tips.',
  '1. Only post official information with source links.\n2. Do not spread unverified rumors about results.\n3. Tag as Announcement for official notices.\n4. Be supportive — results affect mental health.',
  '📝',
  '#f59e0b',
  ARRAY['Date Sheet', 'Results', 'Syllabus', 'Preparation Tips'],
  3
),
(
  'College Holidays & Notices',
  'holidays-notices',
  'Official college notices, holiday announcements, schedule changes, and administrative updates.',
  '1. Only Teachers and Admins should post announcements.\n2. Always include the source or official circular.\n3. Keep discussions civil and on-topic.',
  '📅',
  '#10b981',
  ARRAY['Holidays', 'Events', 'Notices', 'Schedule Changes'],
  4
),
(
  'Scholarships & Funding',
  'scholarships-funding',
  'Scholarship opportunities, government schemes, fellowships, research grants, and financial aid information.',
  '1. Always include deadline, eligibility, and official link.\n2. Tag as Opportunity for it to appear on the Opportunities page.\n3. No scam or unofficial scholarship postings.\n4. Verify information before sharing.',
  '💰',
  '#f97316',
  ARRAY['Government Schemes', 'Private Scholarships', 'International', 'Research Grants'],
  5
),
(
  'Bootcamps & Workshops',
  'bootcamps-workshops',
  'Upcoming bootcamps, technical workshops, training programs, and skill development courses relevant to students.',
  '1. Include date, duration, mode (online/offline), cost, and registration link.\n2. Tag as Opportunity.\n3. No spam or repeated postings.',
  '🛠️',
  '#06b6d4',
  ARRAY['Technical', 'Non-Technical', 'Free', 'Paid', 'Online', 'Offline'],
  6
),
(
  'Internships & Jobs',
  'internships-jobs',
  'Internship openings, part-time jobs, research positions, and work experience opportunities.',
  '1. Include company, role, duration, stipend, deadline, and apply link.\n2. Tag as Opportunity.\n3. Verify the posting before sharing — no fake opportunities.',
  '💼',
  '#3b82f6',
  ARRAY['Internship', 'Full-time', 'Part-time', 'Remote', 'On-site', 'Research'],
  7
),
(
  'Hackathons & Competitions',
  'hackathons-competitions',
  'Hackathons, coding contests, case study competitions, design challenges, and other student competitions.',
  '1. Include theme, team size, prizes, deadline, and registration link.\n2. Looking-for-team posts are welcome — describe your skills.\n3. Tag as Opportunity.',
  '🏆',
  '#ec4899',
  ARRAY['Hackathon', 'Coding Contest', 'Case Study', 'Design', 'Team Building'],
  8
),
(
  'Placements & Interview Prep',
  'placements-interview-prep',
  'Placement drives, company interviews, resume tips, DSA prep, system design, and career guidance.',
  '1. Share your interview experience to help juniors.\n2. Keep company-specific info accurate.\n3. Respect NDA — do not share confidential questions.',
  '🎯',
  '#14b8a6',
  ARRAY['DSA', 'System Design', 'Resume', 'Interview Experience', 'Company Info', 'Mock Tests'],
  9
),
(
  'Projects & Collaboration',
  'projects-collaboration',
  'Find project partners, showcase your work, discuss ideas, and collaborate on open-source or college projects.',
  '1. Clearly state the tech stack, goal, and what collaborators you need.\n2. Include your contact or GitHub link.\n3. Respect contributors — give credit.',
  '🔧',
  '#a855f7',
  ARRAY['Web Dev', 'App Dev', 'AI/ML', 'IoT', 'Research', 'Open Source'],
  10
),
(
  'General Campus Chat',
  'general-campus',
  'Casual conversation, campus life, memes (keep it appropriate), events, and anything that does not fit elsewhere.',
  '1. Be respectful and inclusive.\n2. No political or religious arguments.\n3. No NSFW content.\n4. Keep it fun and positive!',
  '🏫',
  '#64748b',
  ARRAY['Casual', 'Events', 'Food', 'Campus Life'],
  11
)
ON CONFLICT (slug) DO NOTHING;

-- Storage bucket policy helper comment
-- Run this in Supabase SQL editor after creating the 'campus-loop-files' bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('campus-loop-files', 'campus-loop-files', false);
-- Then add storage policies in Supabase dashboard.
