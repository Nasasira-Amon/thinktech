/*
  # Fix Startup Creator Relationship

  ## Overview
  This migration fixes the relationship between startup_ideas and student_profiles
  to enable proper joins when querying startups with creator information.

  ## Changes Made

  ### 1. Add Helper Function
  Create a function to get student profile by user_id for easier joins

  ### 2. Update Queries
  Enable proper joining of startup_ideas with student_profiles via user_id

  ## Security Notes
  - No changes to RLS policies
  - Maintains existing security model
*/

-- Create a view that joins startup_ideas with student_profiles
-- This makes it easier to query startups with creator information
CREATE OR REPLACE VIEW startup_ideas_with_creator AS
SELECT 
  s.*,
  p.id as creator_profile_id,
  p.full_name as creator_name,
  p.profile_image_url as creator_image_url,
  p.image_type as creator_image_type
FROM startup_ideas s
LEFT JOIN student_profiles p ON s.creator_id = p.user_id;