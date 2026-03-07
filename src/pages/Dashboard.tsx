// Import React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Import Link for navigation between pages
import { Link } from 'react-router-dom';

// Import icon components for visual elements
import { User, Users, Briefcase, BookOpen, Shield, Settings, MessageCircle, Sparkles } from 'lucide-react';

// Import Supabase client and authentication hook
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces for type safety
import type { StudentProfile } from '../types';

// Dashboard component - main hub after user logs in
// Shows profile summary, quick stats, and navigation to key features
export function Dashboard() {
  // Get current authenticated user from context
  const { user } = useAuth();

  // State to store student profile data
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // State to track data loading status
  const [loading, setLoading] = useState(true);

  // Fetch user's student profile data on component mount or when user changes
  useEffect(() => {
    // Async function to load profile from database
    const fetchProfile = async () => {
      // If no user is logged in, exit early
      if (!user) return;

      // Query student_profiles table for current user's profile
      const { data, error } = await supabase
        .from('student_profiles') // Table name
        .select('*') // Select all columns
        .eq('user_id', user.id) // Filter by current user's ID
        .single(); // Expect exactly one result

      // If query succeeds, update profile state
      if (data) setProfile(data);

      // If query fails, log error to console
      if (error) console.error('Error fetching profile:', error);

      // Set loading to false once fetch completes
      setLoading(false);
    };

    // Execute the fetch function
    fetchProfile();
  }, [user]); // Re-run effect if user changes

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      // Full-screen centered loading container
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Spinning loader with green accent */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If profile doesn't exist after loading, prompt user to create profile
  if (!profile) {
    return (
      // Full-screen centered message container
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Card with message and action button */}
        <div className="max-w-md p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
          {/* Alert heading */}
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
          {/* Explanation text */}
          <p className="text-gray-400 mb-6">
            You need to set up your student profile to access the dashboard.
          </p>
          {/* Link to profile setup page */}
          <Link
            to="/profile/setup"
            className="inline-block px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Set Up Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Main dashboard container with black background
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content container with max width for large screens */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome header section */}
        <div className="mb-8">
          {/* Greeting with user's name */}
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile.full_name}!
          </h1>
          {/* Subtitle with verification status */}
          <p className="text-gray-400">
            {/* Show verified badge if profile is verified */}
            {profile.is_verified ? (
              <span className="inline-flex items-center gap-1 text-green-500">
                <Shield className="w-4 h-4" />
                Verified Student
              </span>
            ) : (
              // Show pending verification message if not verified
              <span className="text-yellow-500">Verification pending</span>
            )}
          </p>
        </div>

        {/* Quick stats cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {/* Profile card - links to user's profile page */}
          <Link
            to="/profile"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            {/* Icon container with subtle green background */}
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-green-500" />
            </div>
            {/* Card title */}
            <h3 className="text-lg font-bold mb-1">My Profile</h3>
            {/* Card description */}
            <p className="text-gray-400 text-sm">View and edit your Digital ID</p>
          </Link>

          {/* AI Matching card - AI-powered collaboration discovery */}
          <Link
            to="/matching"
            className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/50 rounded-lg p-6 hover:border-green-400 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-xl"></div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 relative">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-green-400">AI Matching</h3>
            <p className="text-gray-300 text-sm">Find perfect collaborators</p>
          </Link>

          {/* Discover students card - links to discovery page */}
          <Link
            to="/discover"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            {/* Icon container */}
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            {/* Card title */}
            <h3 className="text-lg font-bold mb-1">Discover</h3>
            {/* Card description */}
            <p className="text-gray-400 text-sm">Browse student directory</p>
          </Link>

          {/* Startups card - links to startup team builder */}
          <Link
            to="/startups"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            {/* Icon container */}
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-green-500" />
            </div>
            {/* Card title */}
            <h3 className="text-lg font-bold mb-1">Startups</h3>
            {/* Card description */}
            <p className="text-gray-400 text-sm">Build and join teams</p>
          </Link>

          {/* Courses card - links to course outline exchange */}
          <Link
            to="/courses"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            {/* Icon container */}
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            {/* Card title */}
            <h3 className="text-lg font-bold mb-1">Courses</h3>
            {/* Card description */}
            <p className="text-gray-400 text-sm">Share and compare outlines</p>
          </Link>

          {/* Messages card - links to messages page */}
          <Link
            to="/messages"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            {/* Icon container */}
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
            {/* Card title */}
            <h3 className="text-lg font-bold mb-1">Messages</h3>
            {/* Card description */}
            <p className="text-gray-400 text-sm">Chat with connections</p>
          </Link>

          {/* Settings card - links to settings page */}
          <Link
            to="/settings"
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500 transition-colors"
          >
            {/* Icon container */}
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-green-500" />
            </div>
            {/* Card title */}
            <h3 className="text-lg font-bold mb-1">Settings</h3>
            {/* Card description */}
            <p className="text-gray-400 text-sm">Manage your preferences</p>
          </Link>
        </div>

        {/* Profile summary section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          {/* Section heading */}
          <h2 className="text-xl font-bold mb-4">Your Profile Summary</h2>

          {/* Grid layout for profile details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program information */}
            <div>
              <p className="text-gray-400 text-sm">Program</p>
              <p className="font-medium">{profile.program}</p>
            </div>

            {/* Year of study */}
            <div>
              <p className="text-gray-400 text-sm">Year of Study</p>
              <p className="font-medium">Year {profile.year_of_study}</p>
            </div>

            {/* Passion field if specified */}
            {profile.passion_field && (
              <div>
                <p className="text-gray-400 text-sm">Passion Field</p>
                <p className="font-medium">{profile.passion_field}</p>
              </div>
            )}

            {/* Startup availability status */}
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className="font-medium">
                {/* Show different message based on availability toggle */}
                {profile.is_open_to_startups
                  ? '🟢 Open to join startups'
                  : '⚪ Not available'}
              </p>
            </div>
          </div>

          {/* Button to view full profile */}
          <div className="mt-6">
            <Link
              to="/profile"
              className="inline-block px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              View Full Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
