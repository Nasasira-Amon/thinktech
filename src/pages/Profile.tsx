// Import React hooks for state management and side effects
import { useEffect, useState } from 'react';

// Import Link for navigation and icons for visual elements
import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Globe, Palette, QrCode, Edit } from 'lucide-react';
import { HomeButton } from '../components/HomeButton';

// Import Supabase client and authentication hook
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces
import type { StudentProfile, University, Skill, Interest } from '../types';

// Import centralized image functions for avatar
import { getStudentAvatar, getFallbackAvatar } from '../data/studentImages';

// Profile page component - displays student's Digital ID
// Shows all profile information, skills, interests, and portfolio links
export function Profile() {
  // Get current authenticated user
  const { user } = useAuth();

  // State for profile data
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  // State for university data (joined from profiles)
  const [university, setUniversity] = useState<University | null>(null);
  // State for student's skills array
  const [skills, setSkills] = useState<Skill[]>([]);
  // State for student's interests array
  const [interests, setInterests] = useState<Interest[]>([]);
  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // Fetch all profile-related data when component mounts or user changes
  useEffect(() => {
    // Async function to load profile and related data
    const fetchProfileData = async () => {
      // Exit early if no user is authenticated
      if (!user) return;

      // Query 1: Fetch student profile
      const { data: profileData, error: profileError } = await supabase
        .from('student_profiles') // Table name
        .select('*') // Select all profile columns
        .eq('user_id', user.id) // Filter by authenticated user ID
        .single(); // Expect one result

      // If profile query succeeds, update state
      if (profileData) {
        setProfile(profileData);

        // Query 2: Fetch university details for this profile
        const { data: uniData } = await supabase
          .from('universities') // Universities table
          .select('*') // All university columns
          .eq('id', profileData.university_id) // Match profile's university_id
          .single(); // One result expected

        // Update university state if data returned
        if (uniData) setUniversity(uniData);

        // Query 3: Fetch all skills for this profile
        const { data: skillsData } = await supabase
          .from('skills') // Skills table
          .select('*') // All skill columns
          .eq('profile_id', profileData.id); // Match profile ID

        // Update skills state (array)
        if (skillsData) setSkills(skillsData);

        // Query 4: Fetch all interests for this profile
        const { data: interestsData } = await supabase
          .from('interests') // Interests table
          .select('*') // All interest columns
          .eq('profile_id', profileData.id); // Match profile ID

        // Update interests state (array)
        if (interestsData) setInterests(interestsData);
      }

      // Log any profile fetch errors
      if (profileError) console.error('Error:', profileError);

      // Mark loading as complete
      setLoading(false);
    };

    // Execute the fetch function
    fetchProfileData();
  }, [user]); // Re-run if user changes

  // Show loading spinner while data fetches
  if (loading) {
    return (
      // Centered loading container
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Animated spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If no profile exists, show setup prompt
  if (!profile) {
    return (
      // Centered message container
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Prompt card */}
        <div className="max-w-md p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Set Up Your Profile</h2>
          <p className="text-gray-400 mb-6">
            Create your Digital ID to start connecting with other students.
          </p>
          <Link
            to="/profile/setup"
            className="inline-block px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Main profile container with black background
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content wrapper with max width */}
      <div className="max-w-4xl mx-auto">
        {/* Header section with back button and actions */}
        <div className="flex justify-between items-center mb-6">
          {/* Back to dashboard link */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-white">
              ← Back to Dashboard
            </Link>
            <HomeButton />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            {/* QR code share button */}
            <Link
              to="/profile/qr"
              className="px-4 py-2 border border-gray-700 rounded-lg hover:border-green-500 transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Share QR
            </Link>

            {/* Edit profile button */}
            <Link
              to="/profile/edit"
              className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Main profile card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-6">
          {/* Profile avatar section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={profile.profile_image_url || getStudentAvatar(0)}
                alt={`${profile.full_name} avatar`}
                className="w-32 h-32 rounded-full border-4 border-green-500 object-cover"
                onError={(e) => {
                  // Fallback to initials avatar if image fails
                  e.currentTarget.src = getFallbackAvatar(profile.full_name, 128);
                }}
              />
              {/* Verification badge overlay on avatar */}
              {profile.is_verified && (
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-gray-900">
                  <Shield className="w-5 h-5 text-black" />
                </div>
              )}
            </div>
          </div>

          {/* Profile header with name and verification badge */}
          <div className="flex items-start justify-between mb-6">
            {/* Left side: name and university */}
            <div className="flex-1 text-center">
              {/* Student name with verification badge if verified */}
              <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                {profile.full_name}
                {/* Show green shield badge if verified */}
                {profile.is_verified && (
                  <Shield className="w-6 h-6 text-green-500" />
                )}
              </h1>

              {/* University name */}
              {university && (
                <p className="text-gray-400">{university.name}</p>
              )}

              {/* Availability status badge centered below university */}
              {profile.is_open_to_startups && (
                <div className="mt-3">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500">
                    Open to Startups
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Academic information grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Program column */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Program</p>
              <p className="font-medium">{profile.program}</p>
            </div>

            {/* Year of study column */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Year of Study</p>
              <p className="font-medium">Year {profile.year_of_study}</p>
            </div>

            {/* Student number column */}
            <div>
              <p className="text-gray-400 text-sm mb-1">Student Number</p>
              <p className="font-medium">{profile.student_number}</p>
            </div>

            {/* Passion field column (if specified) */}
            {profile.passion_field && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Passion Field</p>
                <p className="font-medium">{profile.passion_field}</p>
              </div>
            )}
          </div>

          {/* Bio section (if provided) */}
          {profile.bio && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">About</p>
              <p className="text-gray-200">{profile.bio}</p>
            </div>
          )}

          {/* Skills section */}
          {skills.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">Skills</p>
              {/* Flexbox container for skill tags */}
              <div className="flex flex-wrap gap-2">
                {/* Map over skills array to create tags */}
                {skills.map((skill) => (
                  // Individual skill tag with green accent
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/30"
                  >
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests section */}
          {interests.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">Interests</p>
              {/* Flexbox container for interest tags */}
              <div className="flex flex-wrap gap-2">
                {/* Map over interests array to create tags */}
                {interests.map((interest) => (
                  // Individual interest tag with gray styling
                  <span
                    key={interest.id}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                  >
                    {interest.interest_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio links section */}
          <div>
            <p className="text-gray-400 text-sm mb-3">Portfolio & Links</p>
            {/* Grid of portfolio links */}
            <div className="flex flex-wrap gap-4">
              {/* GitHub link (if provided) */}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank" // Open in new tab
                  rel="noopener noreferrer" // Security best practice
                  className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </a>
              )}

              {/* LinkedIn link (if provided) */}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </a>
              )}

              {/* Portfolio website link (if provided) */}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  Portfolio
                </a>
              )}

              {/* Behance link (if provided) */}
              {profile.behance_url && (
                <a
                  href={profile.behance_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors"
                >
                  <Palette className="w-5 h-5" />
                  Behance
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            Privacy Level: <span className="text-white font-medium">{profile.privacy_level}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
