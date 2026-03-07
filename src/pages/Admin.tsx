// Import React hooks
import { useEffect, useState } from 'react';

// Import Link and icons
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { HomeButton } from '../components/HomeButton';

// Import Supabase and authentication
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces
import type { StudentProfile, University } from '../types';

// Extended interface with university data
interface ProfileWithUniversity extends StudentProfile {
  university?: University;
}

// Admin page - allows admin users to verify student accounts
// Only accessible to users with 'admin' role
export function Admin() {
  // Get authenticated user
  const { user } = useAuth();

  // State for list of pending verification profiles
  const [pendingProfiles, setPendingProfiles] = useState<ProfileWithUniversity[]>([]);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State to check if current user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user has admin role on mount
  useEffect(() => {
    // Async function to check admin status
    const checkAdminStatus = async () => {
      // Exit if no user
      if (!user) return;

      // Query user_roles table for current user
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // If user has 'admin' role, set isAdmin to true
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      }

      // Log errors
      if (error) console.error('Error:', error);
    };

    // Execute check
    checkAdminStatus();
  }, [user]); // Re-run if user changes

  // Fetch pending verification profiles if user is admin
  useEffect(() => {
    // Async function to load pending profiles
    const fetchPendingProfiles = async () => {
      // Exit if not admin
      if (!isAdmin) return;

      // Query student_profiles for unverified profiles
      const { data, error } = await supabase
        .from('student_profiles')
        .select(`
          *,
          university:universities(*)
        `) // Join university data
        .eq('is_verified', false) // Filter for unverified only
        .order('created_at', { ascending: false }); // Newest first

      // Update state if successful
      if (data) setPendingProfiles(data);

      // Log errors
      if (error) console.error('Error:', error);

      // Mark loading complete
      setLoading(false);
    };

    // Execute fetch
    fetchPendingProfiles();
  }, [isAdmin]); // Re-run when admin status changes

  // Function to approve a student verification
  const handleApprove = async (profileId: string) => {
    try {
      // Update profile to set is_verified to true
      const { error } = await supabase
        .from('student_profiles')
        .update({ is_verified: true })
        .eq('id', profileId);

      // Throw error if update fails
      if (error) throw error;

      // Remove approved profile from pending list
      setPendingProfiles(pendingProfiles.filter((p) => p.id !== profileId));
    } catch (err) {
      // Log errors
      console.error('Error approving profile:', err);
    }
  };

  // Function to reject a verification request
  const handleReject = async (profileId: string) => {
    try {
      // Keep profile but maintain is_verified as false
      // In production, might send notification to user
      // For now, just remove from pending list
      setPendingProfiles(pendingProfiles.filter((p) => p.id !== profileId));
    } catch (err) {
      // Log errors
      console.error('Error rejecting profile:', err);
    }
  };

  // Show loading spinner while checking admin status and loading data
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If user is not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-white">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You do not have permission to access this page.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Main admin container
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white">
              ← Back to Dashboard
            </Link>
            <HomeButton />
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-500" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Review and verify student accounts.
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <p className="text-gray-400 text-sm mb-1">Pending Verifications</p>
          <p className="text-3xl font-bold text-green-500">{pendingProfiles.length}</p>
        </div>

        {/* Pending profiles list */}
        <div className="space-y-4">
          {/* Map over pending profiles */}
          {pendingProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6"
            >
              {/* Profile card grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left section: student details */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">{profile.full_name}</h3>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Email (would need to fetch from auth.users in production) */}
                    <div>
                      <p className="text-sm text-gray-400">Student Number</p>
                      <p className="text-white">{profile.student_number}</p>
                    </div>

                    {/* University */}
                    <div>
                      <p className="text-sm text-gray-400">University</p>
                      <p className="text-white">
                        {profile.university?.name || 'N/A'}
                      </p>
                    </div>

                    {/* Program */}
                    <div>
                      <p className="text-sm text-gray-400">Program</p>
                      <p className="text-white">{profile.program}</p>
                    </div>

                    {/* Year of study */}
                    <div>
                      <p className="text-sm text-gray-400">Year of Study</p>
                      <p className="text-white">Year {profile.year_of_study}</p>
                    </div>
                  </div>

                  {/* Bio if provided */}
                  {profile.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-1">Bio</p>
                      <p className="text-gray-300">{profile.bio}</p>
                    </div>
                  )}
                </div>

                {/* Right section: action buttons */}
                <div className="flex flex-col gap-3">
                  {/* Approve button */}
                  <button
                    onClick={() => handleApprove(profile.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>

                  {/* Reject button */}
                  <button
                    onClick={() => handleReject(profile.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 border border-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>

                  {/* View full profile link */}
                  <Link
                    to={`/profile/${profile.id}`}
                    className="text-center px-4 py-3 border border-gray-700 rounded-lg hover:border-green-500 transition-colors"
                  >
                    View Full Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state - no pending verifications */}
        {pendingProfiles.length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-400">No pending verifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
