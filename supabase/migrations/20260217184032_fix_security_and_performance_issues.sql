/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in the database audit:
  
  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index on `course_comments.profile_id` for FK `course_comments_profile_id_fkey`
  - Add index on `course_outlines.profile_id` for FK `course_outlines_profile_id_fkey`

  ### 2. Optimize RLS Policies for Performance
  Replace `auth.uid()` with `(select auth.uid())` in all RLS policies to prevent 
  re-evaluation for each row, significantly improving query performance at scale.
  
  Tables optimized:
  - user_roles (2 policies)
  - universities (1 policy)
  - student_profiles (4 policies)
  - connections (3 policies)
  - skills (2 policies)
  - interests (2 policies)
  - startup_ideas (3 policies)
  - team_members (2 policies)
  - course_outlines (2 policies)
  - course_comments (1 policy)

  ### 3. Fix Multiple Permissive Policies Issue
  Merge the two UPDATE policies on student_profiles into a single policy that handles
  both user self-updates and admin verification updates, eliminating policy conflicts.

  ## Security Notes
  - All RLS policies remain restrictive and secure
  - Performance optimization does not compromise security
  - Users can still only access their own data
  - Admins retain elevated privileges
*/

-- ===================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ===================================================================

-- Add index for course_comments.profile_id foreign key
CREATE INDEX IF NOT EXISTS idx_course_comments_profile ON course_comments(profile_id);

-- Add index for course_outlines.profile_id foreign key
CREATE INDEX IF NOT EXISTS idx_course_outlines_profile ON course_outlines(profile_id);

-- ===================================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- ===================================================================

-- ====== USER_ROLES TABLE ======

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "System can assign roles" ON user_roles;
CREATE POLICY "System can assign roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ====== UNIVERSITIES TABLE ======

DROP POLICY IF EXISTS "Admins can insert universities" ON universities;
CREATE POLICY "Admins can insert universities"
  ON universities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  );

-- ====== STUDENT_PROFILES TABLE ======
-- Fix multiple permissive policies issue by creating a single comprehensive UPDATE policy

DROP POLICY IF EXISTS "Users can view non-hidden student profiles" ON student_profiles;
CREATE POLICY "Users can view non-hidden student profiles"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (privacy_level != 'hidden' OR user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create own profile" ON student_profiles;
CREATE POLICY "Users can create own profile"
  ON student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop the two separate UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON student_profiles;
DROP POLICY IF EXISTS "Admins can update verification status" ON student_profiles;

-- Create single comprehensive UPDATE policy that handles both cases
CREATE POLICY "Users can update own profile or admins can update any"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = (select auth.uid())
      AND user_roles.role = 'admin'
    )
  );

-- ====== SKILLS TABLE ======

DROP POLICY IF EXISTS "Users can add own skills" ON skills;
CREATE POLICY "Users can add own skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own skills" ON skills;
CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

-- ====== INTERESTS TABLE ======

DROP POLICY IF EXISTS "Users can add own interests" ON interests;
CREATE POLICY "Users can add own interests"
  ON interests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own interests" ON interests;
CREATE POLICY "Users can delete own interests"
  ON interests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

-- ====== CONNECTIONS TABLE ======

DROP POLICY IF EXISTS "Users can view own connections" ON connections;
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (sender_id = (select auth.uid()) OR receiver_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can send connection requests" ON connections;
CREATE POLICY "Users can send connection requests"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

DROP POLICY IF EXISTS "Receivers can update connection status" ON connections;
CREATE POLICY "Receivers can update connection status"
  ON connections FOR UPDATE
  TO authenticated
  USING (receiver_id = (select auth.uid()))
  WITH CHECK (receiver_id = (select auth.uid()));

-- ====== STARTUP_IDEAS TABLE ======

DROP POLICY IF EXISTS "Users can create startup ideas" ON startup_ideas;
CREATE POLICY "Users can create startup ideas"
  ON startup_ideas FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can update own startup ideas" ON startup_ideas;
CREATE POLICY "Creators can update own startup ideas"
  ON startup_ideas FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can delete own startup ideas" ON startup_ideas;
CREATE POLICY "Creators can delete own startup ideas"
  ON startup_ideas FOR DELETE
  TO authenticated
  USING (creator_id = (select auth.uid()));

-- ====== TEAM_MEMBERS TABLE ======

DROP POLICY IF EXISTS "Startup creators can invite team members" ON team_members;
CREATE POLICY "Startup creators can invite team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM startup_ideas
      WHERE startup_ideas.id = startup_id
      AND startup_ideas.creator_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Invited users can update team status" ON team_members;
CREATE POLICY "Invited users can update team status"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

-- ====== COURSE_OUTLINES TABLE ======

DROP POLICY IF EXISTS "Users can create course outlines" ON course_outlines;
CREATE POLICY "Users can create course outlines"
  ON course_outlines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own course outlines" ON course_outlines;
CREATE POLICY "Users can update own course outlines"
  ON course_outlines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );

-- ====== COURSE_COMMENTS TABLE ======

DROP POLICY IF EXISTS "Users can create course comments" ON course_comments;
CREATE POLICY "Users can create course comments"
  ON course_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = (select auth.uid())
    )
  );