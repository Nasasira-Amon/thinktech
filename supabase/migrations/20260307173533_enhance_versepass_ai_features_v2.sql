/*
  # VersePass ID Africa - AI Enhancement Migration
  
  Enhances existing schema with AI-powered features
  
  ## New AI-Powered Tables
  
  - student_skills_enhanced: Advanced skill tracking
  - student_interests_enhanced: Interest profiling
  - student_verifications: Verification system
  - collaboration_requests: Enhanced connections
  - teams_enhanced: Team formation
  - student_portfolios: Portfolio management
  - ai_recommendations: AI matching
  - skill_endorsements: Peer endorsements
  - academic_resources: Resource sharing
  
  ## Security
  
  All tables protected with RLS
*/

-- Enhance universities table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'email_domain'
  ) THEN
    ALTER TABLE universities ADD COLUMN email_domain text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'verification_required'
  ) THEN
    ALTER TABLE universities ADD COLUMN verification_required boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE universities ADD COLUMN verified_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE universities ADD COLUMN logo_url text;
  END IF;
END $$;

-- Enhance student_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN verification_status text DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'profile_completeness'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN profile_completeness integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'collaboration_preferences'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN collaboration_preferences jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'availability_status'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN availability_status text DEFAULT 'available';
  END IF;
END $$;

-- Create enhanced skills table
CREATE TABLE IF NOT EXISTS student_skills_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  skill_category text NOT NULL,
  proficiency_level text DEFAULT 'intermediate',
  verified boolean DEFAULT false,
  endorsement_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create enhanced interests table
CREATE TABLE IF NOT EXISTS student_interests_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name text NOT NULL,
  interest_category text NOT NULL,
  intensity integer DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  created_at timestamptz DEFAULT now()
);

-- Create verifications table
CREATE TABLE IF NOT EXISTS student_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  university_id uuid REFERENCES universities(id),
  verification_type text NOT NULL,
  verification_status text DEFAULT 'pending',
  verified_by uuid,
  verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create collaboration requests table
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  request_type text NOT NULL,
  status text DEFAULT 'pending',
  message text,
  match_score numeric,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT different_students_collab CHECK (requester_id != recipient_id)
);

-- Create enhanced teams table
CREATE TABLE IF NOT EXISTS teams_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  team_type text NOT NULL,
  innovation_sector text,
  creator_id uuid REFERENCES student_profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'forming',
  required_skills jsonb DEFAULT '[]'::jsonb,
  max_members integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Create enhanced team members table
CREATE TABLE IF NOT EXISTS team_members_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams_enhanced(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  contribution_area text,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, student_id)
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS student_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text,
  project_url text,
  github_url text,
  technologies jsonb DEFAULT '[]'::jsonb,
  impact_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  recommendation_type text NOT NULL,
  recommended_student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE,
  recommended_team_id uuid REFERENCES teams_enhanced(id) ON DELETE CASCADE,
  match_score numeric,
  matching_factors jsonb DEFAULT '{}'::jsonb,
  viewed boolean DEFAULT false,
  actioned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create endorsements table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid REFERENCES student_skills_enhanced(id) ON DELETE CASCADE NOT NULL,
  endorser_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  endorsement_note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(skill_id, endorser_id)
);

-- Create resources table
CREATE TABLE IF NOT EXISTS academic_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  university_id uuid REFERENCES universities(id),
  resource_type text NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  visibility text DEFAULT 'public',
  downloads integer DEFAULT 0,
  rating_sum integer DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_skills_enh_student ON student_skills_enhanced(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_enh_category ON student_skills_enhanced(skill_category);
CREATE INDEX IF NOT EXISTS idx_student_interests_enh_student ON student_interests_enhanced(student_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_req_recipient ON collaboration_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_teams_enh_creator ON teams_enhanced(creator_id);
CREATE INDEX IF NOT EXISTS idx_ai_recs_student ON ai_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_student ON student_portfolios(student_id);
CREATE INDEX IF NOT EXISTS idx_resources_university ON academic_resources(university_id);

-- Enable RLS
ALTER TABLE student_skills_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_interests_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view all enhanced skills"
  ON student_skills_enhanced FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can manage own enhanced skills"
  ON student_skills_enhanced FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view all enhanced interests"
  ON student_interests_enhanced FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can manage own enhanced interests"
  ON student_interests_enhanced FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view own verifications"
  ON student_verifications FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view collab requests involving them"
  ON collaboration_requests FOR SELECT TO authenticated
  USING (
    requester_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can create collab requests"
  ON collaboration_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Recipients can update collab requests"
  ON collaboration_requests FOR UPDATE TO authenticated
  USING (recipient_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (recipient_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view all active teams"
  ON teams_enhanced FOR SELECT TO authenticated USING (status != 'deleted');

CREATE POLICY "Students can create teams"
  ON teams_enhanced FOR INSERT TO authenticated
  WITH CHECK (creator_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators can update teams"
  ON teams_enhanced FOR UPDATE TO authenticated
  USING (creator_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (creator_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view team members"
  ON team_members_enhanced FOR SELECT TO authenticated USING (true);

CREATE POLICY "Creators can add members"
  ON team_members_enhanced FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams_enhanced WHERE creator_id IN (
        SELECT id FROM student_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can leave teams"
  ON team_members_enhanced FOR DELETE TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view all portfolios"
  ON student_portfolios FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can manage own portfolios"
  ON student_portfolios FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view own recommendations"
  ON ai_recommendations FOR SELECT TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own recommendations"
  ON ai_recommendations FOR UPDATE TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view all endorsements"
  ON skill_endorsements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can create endorsements"
  ON skill_endorsements FOR INSERT TO authenticated
  WITH CHECK (endorser_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view accessible resources"
  ON academic_resources FOR SELECT TO authenticated
  USING (
    visibility = 'public' OR
    (visibility = 'university_only' AND university_id IN (
      SELECT university_id FROM student_profiles WHERE user_id = auth.uid()
    )) OR
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can manage own resources"
  ON academic_resources FOR ALL TO authenticated
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));