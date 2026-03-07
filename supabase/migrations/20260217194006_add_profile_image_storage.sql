/*
  # Add Profile Image Storage Support

  ## Overview
  This migration adds support for profile image uploads and avatar selection.

  ## Changes Made

  ### 1. Add Profile Image Columns to student_profiles
  - `profile_image_url` (text) - URL to uploaded image or selected avatar
  - `image_type` (text) - Type: 'upload' or 'avatar'

  ### 2. Create Storage Bucket for Profile Images
  - Create 'profile-images' bucket for user uploads
  - Enable public access for profile images
  - Set up size and file type restrictions

  ### 3. Storage Policies
  - Users can upload to their own folder
  - Anyone can view profile images (public bucket)
  - Users can update/delete their own images

  ## Security Notes
  - RLS policies ensure users only manage their own images
  - File size limited to 5MB
  - Only image file types allowed (jpg, jpeg, png, gif, webp)
*/

-- ===================================================================
-- 1. ADD PROFILE IMAGE COLUMNS
-- ===================================================================

-- Add profile image columns to student_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN profile_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'student_profiles' AND column_name = 'image_type'
  ) THEN
    ALTER TABLE student_profiles ADD COLUMN image_type text DEFAULT 'avatar' CHECK (image_type IN ('upload', 'avatar'));
  END IF;
END $$;

-- ===================================================================
-- 2. CREATE STORAGE BUCKET
-- ===================================================================

-- Create profile-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 3. STORAGE POLICIES
-- ===================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile image" ON storage.objects;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own profile image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Allow anyone to view profile images (public bucket)
CREATE POLICY "Anyone can view profile images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own profile image"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own profile image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );