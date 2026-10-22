-- ============================================================
-- CampusLoop Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- SEQUENCES
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS campus_id_seq START 1;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE message_tag AS ENUM ('question', 'answer', 'resource', 'opportunity', 'announcement', 'general');
CREATE TYPE attachment_type AS ENUM ('image', 'pdf', 'file', 'link');
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'misinformation', 'harassment', 'other');
CREATE TYPE notification_type AS ENUM ('mention', 'reply', 'reaction', 'answer_marked', 'announcement');

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  campus_id TEXT UNIQUE NOT NULL,                    -- CL-000001 format
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,                              -- @username, optional
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  department TEXT,
  year INTEGER CHECK (year BETWEEN 1 AND 6),
  bio TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,       -- email verified
  is_banned BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  muted_until TIMESTAMPTZ,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce @kiet.edu domain at DB level (case insensitive, strict suffix match)
ALTER TABLE profiles
  ADD CONSTRAINT profiles_email_kiet_edu
  CHECK (email ~* '^[a-zA-Z0-9._%+\-]+@kiet\.edu$');

CREATE INDEX idx_profiles_username ON profiles (lower(username)) WHERE username IS NOT NULL;
CREATE INDEX idx_profiles_campus_id ON profiles (campus_id);
CREATE INDEX idx_profiles_email ON profiles (lower(email));
CREATE INDEX idx_profiles_role ON profiles (role);

-- ============================================================
-- GROUPS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  rules TEXT,
  icon TEXT NOT NULL DEFAULT '💬',                  -- emoji icon
  color TEXT NOT NULL DEFAULT '#6366f1',             -- accent color
  tags TEXT[] DEFAULT '{}',                          -- sub-tags
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_pinnable BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_groups_slug ON groups (slug);
CREATE INDEX idx_groups_sort ON groups (sort_order);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  tag message_tag NOT NULL DEFAULT 'general',
  is_answer BOOLEAN NOT NULL DEFAULT false,          -- marked as answer
  answer_marked_by UUID REFERENCES profiles(id),     -- who marked it
  helpful_count INTEGER NOT NULL DEFAULT 0,          -- upvote count
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type attachment_type,
  attachment_size INTEGER,                           -- bytes
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  pinned_by UUID REFERENCES profiles(id),
  pinned_at TIMESTAMPTZ,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,         -- soft delete
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full-text search index
CREATE INDEX idx_messages_fts ON messages 
  USING gin(to_tsvector('english', coalesce(content, '')));

CREATE INDEX idx_messages_group_id ON messages (group_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_tag ON messages (tag) WHERE is_deleted = false;
CREATE INDEX idx_messages_answer ON messages (is_answer) WHERE is_answer = true;
CREATE INDEX idx_messages_pinned ON messages (group_id, is_pinned) WHERE is_pinned = true;

-- ============================================================
-- REACTIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (length(emoji) > 0 AND length(emoji) <= 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)                -- one per emoji per user per message
);

CREATE INDEX idx_reactions_message ON reactions (message_id);

-- ============================================================
-- HELPFUL VOTES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS helpful_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX idx_helpful_votes_message ON helpful_votes (message_id);

-- ============================================================
-- GROUP READS (for unread counts)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_reads (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_reads_user ON group_reads (user_id);

-- ============================================================
-- USER GROUP PREFERENCES (pin/mute per user)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_group_prefs (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (group_id, user_id)
);

-- ============================================================
-- BOOKMARKS
-- ============================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks (user_id, created_at DESC);

-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  details TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_message ON reports (message_id);
CREATE INDEX idx_reports_resolved ON reports (is_resolved);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB DEFAULT '{}',
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = false;

-- ============================================================
-- TYPING INDICATORS (ephemeral, auto-cleaned)
-- ============================================================

CREATE TABLE IF NOT EXISTS typing_indicators (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- ============================================================
-- MENTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentions_user ON mentions (mentioned_user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Generate campus ID: CL-XXXXXX (zero-padded 6 digits)
CREATE OR REPLACE FUNCTION generate_campus_id()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('campus_id_seq');
  RETURN 'CL-' || lpad(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    campus_id,
    full_name,
    email,
    role,
    department,
    year,
    is_verified
  ) VALUES (
    NEW.id,
    generate_campus_id(),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    NEW.raw_user_meta_data->>'department',
    NULLIF(NEW.raw_user_meta_data->>'year', '')::INTEGER,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_verified when email is confirmed
CREATE OR REPLACE FUNCTION handle_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET is_verified = true, updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment helpful_count on message and reputation on sender
CREATE OR REPLACE FUNCTION handle_helpful_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE messages SET helpful_count = helpful_count + 1 WHERE id = NEW.message_id;
    UPDATE profiles SET helpful_count = helpful_count + 1, reputation = reputation + 2
      WHERE id = (SELECT sender_id FROM messages WHERE id = NEW.message_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE messages SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = OLD.message_id;
    UPDATE profiles SET helpful_count = GREATEST(0, helpful_count - 1), reputation = GREATEST(0, reputation - 2)
      WHERE id = (SELECT sender_id FROM messages WHERE id = OLD.message_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Boost reputation when message is marked as answer
CREATE OR REPLACE FUNCTION handle_answer_marked()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_answer = true AND OLD.is_answer = false THEN
    UPDATE profiles SET reputation = reputation + 10
      WHERE id = NEW.sender_id;
  ELSIF NEW.is_answer = false AND OLD.is_answer = true THEN
    UPDATE profiles SET reputation = GREATEST(0, reputation - 10)
      WHERE id = NEW.sender_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification on @mention
CREATE OR REPLACE FUNCTION handle_mention_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  group_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM profiles WHERE id = 
    (SELECT sender_id FROM messages WHERE id = NEW.message_id);
  SELECT name INTO group_name FROM groups WHERE id = 
    (SELECT group_id FROM messages WHERE id = NEW.message_id);

  INSERT INTO notifications (user_id, type, title, body, message_id, group_id, actor_id)
  VALUES (
    NEW.mentioned_user_id,
    'mention',
    sender_name || ' mentioned you',
    'In ' || group_name,
    NEW.message_id,
    (SELECT group_id FROM messages WHERE id = NEW.message_id),
    (SELECT sender_id FROM messages WHERE id = NEW.message_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update profile.is_verified when email confirmed
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_email_confirmed();

-- updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Helpful vote triggers
CREATE TRIGGER on_helpful_vote_insert
  AFTER INSERT ON helpful_votes
  FOR EACH ROW EXECUTE FUNCTION handle_helpful_vote();

CREATE TRIGGER on_helpful_vote_delete
  AFTER DELETE ON helpful_votes
  FOR EACH ROW EXECUTE FUNCTION handle_helpful_vote();

-- Answer marked trigger
CREATE TRIGGER on_answer_marked
  AFTER UPDATE OF is_answer ON messages
  FOR EACH ROW EXECUTE FUNCTION handle_answer_marked();

-- Mention notification trigger
CREATE TRIGGER on_mention_created
  AFTER INSERT ON mentions
  FOR EACH ROW EXECUTE FUNCTION handle_mention_notification();
