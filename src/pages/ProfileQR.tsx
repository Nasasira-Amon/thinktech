// Import React hooks
import { useEffect, useState } from 'react';

// Import Link for navigation
import { Link } from 'react-router-dom';

// Import QRCode component for generating QR codes
import { QRCodeSVG } from 'qrcode.react';

// Import Supabase and authentication
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces
import type { StudentProfile, University } from '../types';

// Import Digital ID component
import DigitalStudentID from '../components/DigitalStudentID';

// ProfileQR page - generates a QR code for sharing student profile
// QR code links to a shareable profile page respecting privacy settings
export function ProfileQR() {
  // Get authenticated user from context
  const { user } = useAuth();

  // State for student profile data
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // State for university data
  const [university, setUniversity] = useState<University | null>(null);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // Fetch user's profile on component mount
  useEffect(() => {
    // Async function to load profile
    const fetchProfile = async () => {
      // Exit if no user authenticated
      if (!user) return;

      // Query student_profiles table for current user
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Update profile state if successful
      if (data) {
        setProfile(data);

        // Fetch university data
        const { data: uniData } = await supabase
          .from('universities')
          .select('*')
          .eq('id', data.university_id)
          .single();

        if (uniData) setUniversity(uniData);
      }

      // Log any errors
      if (error) console.error('Error:', error);

      // Mark loading complete
      setLoading(false);
    };

    // Execute fetch
    fetchProfile();
  }, [user]); // Re-run if user changes

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If no profile exists, show message
  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md p-8 bg-gray-900 border border-gray-800 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">
            Please create your profile first.
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

  // Generate shareable URL for profile
  // In production, this would be the actual domain
  const profileUrl = `https://versepass.africa/profile/${profile.id}`;

  return (
    // Main container with black background
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content wrapper with max width */}
      <div className="max-w-2xl mx-auto">
        {/* Back navigation link */}
        <Link to="/profile" className="text-gray-400 hover:text-white mb-6 inline-block">
          ← Back to Profile
        </Link>

        {/* Card header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Digital Student ID</h1>
          <p className="text-gray-400">
            Your official verified student identity card with QR code verification
          </p>
        </div>

        {/* Digital Student ID Card */}
        <div className="mb-8">
          <DigitalStudentID profile={profile} university={university} />
        </div>

        {/* Additional QR Code for Sharing */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          {/* Card header */}
          <h2 className="text-2xl font-bold mb-4">Share Your Profile</h2>

          {/* Description text */}
          <p className="text-gray-400 mb-8">
            Share this QR code to let others view your verified student profile.
            Only information allowed by your privacy settings will be visible.
          </p>

          {/* QR code container with white background for contrast */}
          <div className="bg-white p-8 rounded-lg inline-block mb-6">
            {/* QRCode component generates the QR code SVG */}
            <QRCodeSVG
              value={profileUrl} // URL encoded in QR code
              size={256} // QR code size in pixels
              level="H" // Error correction level (High)
              includeMargin={true} // Add margin around QR code
            />
          </div>

          {/* Profile URL display */}
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Profile URL</p>
            {/* URL in monospace font for readability */}
            <p className="text-green-500 font-mono text-sm break-all">
              {profileUrl}
            </p>
          </div>

          {/* Privacy level indicator */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Current Privacy Level</p>
            {/* Show current privacy setting */}
            <p className="text-white font-medium capitalize">
              {profile.privacy_level.replace('_', ' ')}
            </p>
            {/* Link to edit privacy settings */}
            <Link
              to="/profile/edit"
              className="text-green-500 text-sm hover:underline mt-2 inline-block"
            >
              Change privacy settings
            </Link>
          </div>

          {/* Information about what's visible */}
          <div className="text-left bg-black border border-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What others will see:</p>
            {/* List of visible information based on privacy level */}
            <ul className="text-sm text-gray-400 space-y-1">
              {/* Show different info based on privacy level */}
              {profile.privacy_level === 'full' && (
                <>
                  <li>✓ Full name and verification status</li>
                  <li>✓ University and program</li>
                  <li>✓ Skills and interests</li>
                  <li>✓ Bio and portfolio links</li>
                </>
              )}
              {profile.privacy_level === 'skills_only' && (
                <>
                  <li>✓ First name and verification status</li>
                  <li>✓ Skills and interests only</li>
                  <li>✗ Personal details hidden</li>
                </>
              )}
              {profile.privacy_level === 'status_only' && (
                <>
                  <li>✓ First name and verification status</li>
                  <li>✓ University name only</li>
                  <li>✗ Skills and details hidden</li>
                </>
              )}
              {profile.privacy_level === 'hidden' && (
                <>
                  <li>✗ Profile is completely hidden</li>
                  <li>✗ QR code will not work for public viewing</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
