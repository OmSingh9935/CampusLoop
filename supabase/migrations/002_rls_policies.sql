-- ============================================================
-- CampusLoop RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user verified kiet.edu user?
CREATE OR REPLACE FUNCTION is_verified_kiet_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_verified = true
    AND is_banned = false
    AND email ~* '^[a-zA-Z0-9._%+\-]+@kiet\.edu$'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: is current user a teacher or admin?
CREATE OR REPLACE FUNCTION is_teacher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('teacher', 'admin')
    AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "profiles_select_verified" ON profiles
  FOR SELECT USING (is_verified_kiet_user() OR id = auth.uid());

CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (is_admin());

-- ============================================================
-- GROUPS
-- ============================================================

CREATE POLICY "groups_select_verified" ON groups
  FOR SELECT USING (is_verified_kiet_user());

CREATE POLICY "groups_insert_admin" ON groups
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "groups_update_admin" ON groups
  FOR UPDATE USING (is_admin());

CREATE POLICY "groups_delete_admin" ON groups
  FOR DELETE USING (is_admin());

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE POLICY "messages_select_verified" ON messages
  FOR SELECT USING (
    is_verified_kiet_user() AND
    EXISTS (SELECT 1 FROM groups WHERE id = messages.group_id AND is_archived = false)
  );

CREATE POLICY "messages_insert_verified" ON messages
  FOR INSERT WITH CHECK (
    is_verified_kiet_user() AND
    sender_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_muted = true AND (muted_until IS NULL OR muted_until > now()))
    )
  );

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid() AND
    is_deleted = false
  );

CREATE POLICY "messages_update_admin" ON messages
  FOR UPDATE USING (is_admin() OR is_teacher_or_admin());

CREATE POLICY "messages_delete_own" ON messages
  FOR DELETE USING (sender_id = auth.uid() OR is_admin());

-- ============================================================
-- REACTIONS
-- ============================================================

CREATE POLICY "reactions_select" ON reactions
  FOR SELECT USING (is_verified_kiet_user());

CREATE POLICY "reactions_insert" ON reactions
  FOR INSERT WITH CHECK (is_verified_kiet_user() AND user_id = auth.uid());

CREATE POLICY "reactions_delete_own" ON reactions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- HELPFUL VOTES
-- ============================================================

CREATE POLICY "helpful_votes_select" ON helpful_votes
  FOR SELECT USING (is_verified_kiet_user());

CREATE POLICY "helpful_votes_insert" ON helpful_votes
  FOR INSERT WITH CHECK (is_verified_kiet_user() AND user_id = auth.uid());

CREATE POLICY "helpful_votes_delete_own" ON helpful_votes
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- GROUP READS
-- ============================================================

CREATE POLICY "group_reads_own" ON group_reads
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- USER GROUP PREFS
-- ============================================================

CREATE POLICY "user_group_prefs_own" ON user_group_prefs
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- BOOKMARKS
-- ============================================================

CREATE POLICY "bookmarks_own" ON bookmarks
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- REPORTS
-- ============================================================

CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (is_verified_kiet_user() AND reporter_id = auth.uid());

CREATE POLICY "reports_select_admin" ON reports
  FOR SELECT USING (is_admin() OR reporter_id = auth.uid());

CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE USING (is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- TYPING INDICATORS
-- ============================================================

CREATE POLICY "typing_select" ON typing_indicators
  FOR SELECT USING (is_verified_kiet_user());

CREATE POLICY "typing_own" ON typing_indicators
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- MENTIONS
-- ============================================================

CREATE POLICY "mentions_select_own" ON mentions
  FOR SELECT USING (mentioned_user_id = auth.uid() OR is_admin());

CREATE POLICY "mentions_insert" ON mentions
  FOR INSERT WITH CHECK (is_verified_kiet_user());
