/*
  # VersePass ID Africa Database Schema

  ## Overview
  Complete database schema for VersePass ID Africa platform supporting:
  - Student verification and digital identity
  - Skill matching and discovery
  - Startup team formation
  - Course outline sharing
  - Connection management

  ## New Tables

  1. **user_roles**
     - `id` (uuid, primary key) - Role assignment identifier
     - `user_id` (uuid, foreign key) - Links to auth.users
     - `role` (text) - User role (student/admin)
     - `created_at` (timestamptz) - Role assignment time

  2. **universities**
     - `id` (uuid, primary key) - Unique identifier for each university
     - `name` (text) - Official university name
     - `country` (text) - Country location (Uganda, Kenya, etc.)
     - `abbreviation` (text) - Short name/acronym
     - `created_at` (timestamptz) - Record creation timestamp

  3. **student_profiles**
     - `id` (uuid, primary key) - Profile unique identifier
     - `user_id` (uuid, foreign key) - Links to auth.users
     - `university_id` (uuid, foreign key) - Student's university
     - `full_name` (text) - Student's full name
     - `student_number` (text) - Registration/student number
     - `program` (text) - Degree program (e.g., Computer Science)
     - `year_of_study` (integer) - Current academic year (1-5)
     - `passion_field` (text) - What student wants to pursue
     - `bio` (text) - Personal description
     - `is_verified` (boolean) - Verification status
     - `is_open_to_startups` (boolean) - Availability for teams
     - `privacy_level` (text) - Privacy setting
     - Portfolio links and social media URLs
     - Timestamps

  4. **skills** - Student skills/capabilities
  5. **interests** - Student interest areas
  6. **connections** - Student-to-student connections
  7. **startup_ideas** - Startup/project ideas
  8. **team_members** - Team membership records
  9. **course_outlines** - Course curriculum data
  10. **course_comments** - Discussions on courses

  ## Security
  - Enable RLS on all tables
  - Restrictive policies requiring authentication
  - Users can only modify their own data
  - Admins have elevated access
*/

-- Create user_roles table first (needed for admin checks)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- User roles: Users can view own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- User roles: Users can insert own role during signup
CREATE POLICY "System can assign roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL DEFAULT 'Uganda',
  abbreviation text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Universities: Anyone authenticated can read
CREATE POLICY "Authenticated users can view universities"
  ON universities FOR SELECT
  TO authenticated
  USING (true);

-- Universities: Only admins can insert
CREATE POLICY "Admins can insert universities"
  ON universities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  university_id uuid REFERENCES universities(id) NOT NULL,
  full_name text NOT NULL,
  student_number text NOT NULL,
  program text NOT NULL,
  year_of_study integer NOT NULL CHECK (year_of_study >= 1 AND year_of_study <= 5),
  passion_field text,
  bio text,
  is_verified boolean DEFAULT false,
  is_open_to_startups boolean DEFAULT false,
  privacy_level text DEFAULT 'full' CHECK (privacy_level IN ('full', 'skills_only', 'status_only', 'hidden')),
  github_url text,
  linkedin_url text,
  portfolio_url text,
  behance_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on student_profiles
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Student profiles: Users can view non-hidden profiles
CREATE POLICY "Users can view non-hidden student profiles"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (privacy_level != 'hidden' OR user_id = auth.uid());

-- Student profiles: Users can create own profile
CREATE POLICY "Users can create own profile"
  ON student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Student profiles: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Student profiles: Admins can update any profile (for verification)
CREATE POLICY "Admins can update verification status"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Skills: Anyone can view skills
CREATE POLICY "Users can view skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

-- Skills: Users can add own skills
CREATE POLICY "Users can add own skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Skills: Users can delete own skills
CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on interests
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Interests: Anyone can view interests
CREATE POLICY "Users can view interests"
  ON interests FOR SELECT
  TO authenticated
  USING (true);

-- Interests: Users can add own interests
CREATE POLICY "Users can add own interests"
  ON interests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Interests: Users can delete own interests
CREATE POLICY "Users can delete own interests"
  ON interests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable RLS on connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Connections: Users can view own connections
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Connections: Users can send connection requests
CREATE POLICY "Users can send connection requests"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Connections: Receivers can update connection status
CREATE POLICY "Receivers can update connection status"
  ON connections FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Create startup_ideas table
CREATE TABLE IF NOT EXISTS startup_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  problem text NOT NULL,
  target_sector text NOT NULL,
  required_roles text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on startup_ideas
ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;

-- Startup ideas: Anyone can view
CREATE POLICY "Users can view startup ideas"
  ON startup_ideas FOR SELECT
  TO authenticated
  USING (true);

-- Startup ideas: Users can create
CREATE POLICY "Users can create startup ideas"
  ON startup_ideas FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Startup ideas: Creators can update
CREATE POLICY "Creators can update own startup ideas"
  ON startup_ideas FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Startup ideas: Creators can delete
CREATE POLICY "Creators can delete own startup ideas"
  ON startup_ideas FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid REFERENCES startup_ideas(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(startup_id, profile_id)
);

-- Enable RLS on team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team members: Users can view
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

-- Team members: Startup creators can invite
CREATE POLICY "Startup creators can invite team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM startup_ideas
      WHERE startup_ideas.id = startup_id
      AND startup_ideas.creator_id = auth.uid()
    )
  );

-- Team members: Invited users can update status
CREATE POLICY "Invited users can update team status"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Create course_outlines table
CREATE TABLE IF NOT EXISTS course_outlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  university_id uuid REFERENCES universities(id) NOT NULL,
  course_name text NOT NULL,
  course_code text NOT NULL,
  semester text NOT NULL,
  year integer NOT NULL,
  modules text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on course_outlines
ALTER TABLE course_outlines ENABLE ROW LEVEL SECURITY;

-- Course outlines: Anyone can view
CREATE POLICY "Users can view course outlines"
  ON course_outlines FOR SELECT
  TO authenticated
  USING (true);

-- Course outlines: Users can create
CREATE POLICY "Users can create course outlines"
  ON course_outlines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Course outlines: Users can update own
CREATE POLICY "Users can update own course outlines"
  ON course_outlines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Create course_comments table
CREATE TABLE IF NOT EXISTS course_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES course_outlines(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  comment_text text NOT NULL,
  resource_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on course_comments
ALTER TABLE course_comments ENABLE ROW LEVEL SECURITY;

-- Course comments: Anyone can view
CREATE POLICY "Users can view course comments"
  ON course_comments FOR SELECT
  TO authenticated
  USING (true);

-- Course comments: Users can create
CREATE POLICY "Users can create course comments"
  ON course_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = profile_id
      AND student_profiles.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_university_id ON student_profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_skills_profile_id ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_interests_profile_id ON interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_connections_sender ON connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_startup_ideas_creator ON startup_ideas(creator_id);
CREATE INDEX IF NOT EXISTS idx_team_members_startup ON team_members(startup_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile ON team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_course_outlines_university ON course_outlines(university_id);
CREATE INDEX IF NOT EXISTS idx_course_comments_course ON course_comments(course_id);