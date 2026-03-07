// Import React hooks for state and lifecycle management
import { useEffect, useState } from 'react';

// Import Link for navigation and icons
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, UserPlus, CheckCircle, MessageCircle, Home } from 'lucide-react';

// Import Supabase client and authentication
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces
import type { StudentProfile, University, Skill } from '../types';

// Import centralized image functions for student avatars
import { getStudentAvatar, getFallbackAvatar } from '../data/studentImages';

// Extended interface that includes joined data for display
interface ProfileWithRelations extends StudentProfile {
  university?: University; // University data joined from universities table
  skills?: Skill[]; // Array of skills joined from skills table
}

// Discover page component - allows students to find and connect with peers
// Features search, filters, and connection request functionality
export function Discover() {
  // Get current authenticated user
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for list of discovered student profiles
  const [profiles, setProfiles] = useState<ProfileWithRelations[]>([]);

  // State for search query input
  const [searchQuery, setSearchQuery] = useState('');

  // State for university filter dropdown
  const [universityFilter, setUniversityFilter] = useState('');

  // State for verified-only toggle filter
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for available universities (for filter dropdown)
  const [universities, setUniversities] = useState<University[]>([]);

  // State to track connection statuses (maps profile_id to status)
  const [connections, setConnections] = useState<Record<string, string>>({});

  // Fetch universities on component mount for filter dropdown
  useEffect(() => {
    // Async function to load universities
    const fetchUniversities = async () => {
      // Query universities table, ordered alphabetically
      const { data } = await supabase
        .from('universities')
        .select('*')
        .order('name');

      // Update state if data returned
      if (data) setUniversities(data);
    };

    // Execute fetch
    fetchUniversities();
  }, []); // Run once on mount

  // Fetch student profiles whenever filters change
  useEffect(() => {
    // Async function to load and filter profiles
    const fetchProfiles = async () => {
      // Exit early if no authenticated user
      if (!user) return;

      // Start building query for student_profiles table
      let query = supabase
        .from('student_profiles')
        .select(`
          *,
          university:universities(*),
          skills(*)
        `) // Select profile, join university data and skills
        .neq('user_id', user.id); // Exclude current user from results

      // Apply verified filter if toggled on
      if (verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      // Apply university filter if selected
      if (universityFilter) {
        query = query.eq('university_id', universityFilter);
      }

      // Execute query
      const { data, error } = await query;

      // If query succeeds, filter by search query and update state
      if (data) {
        // Client-side filtering for search query
        // Checks if query matches name, program, or passion field
        const filtered = data.filter((p) => {
          // If no search query, include all
          if (!searchQuery) return true;

          // Convert search query to lowercase for case-insensitive search
          const query = searchQuery.toLowerCase();

          // Check if query matches any searchable field
          return (
            p.full_name.toLowerCase().includes(query) ||
            p.program.toLowerCase().includes(query) ||
            (p.passion_field && p.passion_field.toLowerCase().includes(query))
          );
        });

        // Update profiles state with filtered results
        setProfiles(filtered);
      }

      // Log any errors
      if (error) console.error('Error:', error);

      // Mark loading as complete
      setLoading(false);
    };

    // Execute fetch
    fetchProfiles();
  }, [user, searchQuery, universityFilter, verifiedOnly]); // Re-run when filters change

  // Fetch existing connections to show connection status for each profile
  useEffect(() => {
    // Async function to load connection statuses
    const fetchConnections = async () => {
      // Exit if no user
      if (!user) return;

      // Query connections table for all connections involving current user
      const { data } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`); // User is sender OR receiver

      // If data returned, create a map of profile_id to connection status
      if (data) {
        // Build object mapping each connected user to their connection status
        const statusMap: Record<string, string> = {};

        // Loop through each connection
        data.forEach((conn) => {
          // Determine the "other" user in the connection (not current user)
          const otherUserId = conn.sender_id === user.id ? conn.receiver_id : conn.sender_id;

          // Store the connection status for this user
          statusMap[otherUserId] = conn.status;
        });

        // Update connections state
        setConnections(statusMap);
      }
    };

    // Execute fetch
    fetchConnections();
  }, [user]); // Re-run if user changes

  // Function to send connection request to another student
  const handleConnect = async (profileUserId: string) => {
    // Exit if no authenticated user
    if (!user) return;

    try {
      // Insert new connection record with 'pending' status
      const { error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id, // Current user is sender
          receiver_id: profileUserId, // Target profile user is receiver
          status: 'pending', // Initial status
        });

      // If insert fails, throw error
      if (error) throw error;

      // On success, update local connections state to reflect new status
      setConnections({
        ...connections, // Spread existing connections
        [profileUserId]: 'pending', // Add/update this user's status
      });
    } catch (err) {
      // Log any errors to console
      console.error('Error sending connection request:', err);
    }
  };

  // Function to start a conversation with a connected user
  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId)
            .maybeSingle();

          if (otherParticipant) {
            navigate('/messages');
            return;
          }
        }
      }

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add both participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: user.id },
          { conversation_id: newConv.id, user_id: otherUserId },
        ]);

      if (partError) throw partError;

      navigate('/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Show loading spinner while initial data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // Main discover container with black background
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content wrapper with max width */}
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="mb-8">
          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mb-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white inline-block">
              ← Back to Dashboard
            </Link>
            <Link
              to="/dashboard"
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>

          {/* Page title */}
          <h1 className="text-3xl font-bold mb-2">Discover Students</h1>

          {/* Page description */}
          <p className="text-gray-400">
            Find and connect with verified students across East African universities.
          </p>
        </div>

        {/* Filters section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          {/* Grid layout for filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search input field */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              {/* Input with search icon */}
              <div className="relative">
                {/* Search icon positioned absolutely */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                {/* Text input with left padding for icon */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, program..."
                  className="w-full pl-10 pr-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* University filter dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2">University</label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              >
                {/* Default "All" option */}
                <option value="">All Universities</option>

                {/* Map universities to dropdown options */}
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Verified only toggle */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter</label>
              {/* Checkbox for verified filter */}
              <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <Shield className="w-4 h-4 text-green-500" />
                <span>Verified Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map over profiles array to create profile cards */}
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-colors"
            >
              {/* Profile avatar image */}
              <div className="h-32 bg-gradient-to-br from-green-500/20 to-gray-900 flex items-center justify-center">
                <img
                  src={profile.profile_image_url || getStudentAvatar(index)}
                  alt={`${profile.full_name} avatar`}
                  className="w-24 h-24 rounded-full border-4 border-gray-900 object-cover"
                  onError={(e) => {
                    // Fallback to SVG avatar with initials if image fails to load
                    e.currentTarget.src = getFallbackAvatar(profile.full_name, 96);
                  }}
                />
              </div>

              <div className="p-6">
                {/* Profile card header */}
                <div className="flex items-start justify-between mb-4">
                  {/* Student name with verification badge */}
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {profile.full_name}
                      {/* Show shield if verified */}
                      {profile.is_verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </h3>

                    {/* University name */}
                    {profile.university && (
                      <p className="text-sm text-gray-400">{profile.university.name}</p>
                    )}
                  </div>
                </div>

              {/* Program and year */}
              <div className="mb-4">
                <p className="text-gray-300">{profile.program}</p>
                <p className="text-sm text-gray-400">Year {profile.year_of_study}</p>
              </div>

              {/* Passion field (if specified) */}
              {profile.passion_field && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Passion Field</p>
                  <p className="text-green-500">{profile.passion_field}</p>
                </div>
              )}

              {/* Skills tags */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Skills</p>
                  {/* Flexbox container for skill tags */}
                  <div className="flex flex-wrap gap-2">
                    {/* Show first 3 skills */}
                    {profile.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs border border-green-500/30"
                      >
                        {skill.skill_name}
                      </span>
                    ))}

                    {/* Show "+X more" if more than 3 skills */}
                    {profile.skills.length > 3 && (
                      <span className="px-2 py-1 text-gray-400 text-xs">
                        +{profile.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Connection button */}
              <div className="mt-4 space-y-2">
                {/* Check connection status and show appropriate button */}
                {!connections[profile.user_id] ? (
                  // No connection - show "Connect" button
                  <button
                    onClick={() => handleConnect(profile.user_id)}
                    className="w-full py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Connect
                  </button>
                ) : connections[profile.user_id] === 'pending' ? (
                  // Pending connection - show disabled button
                  <button
                    disabled
                    className="w-full py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Pending
                  </button>
                ) : connections[profile.user_id] === 'accepted' ? (
                  // Accepted connection - show success state and chat button
                  <>
                    <button
                      disabled
                      className="w-full py-2 bg-green-500/20 text-green-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Connected
                    </button>
                    <button
                      onClick={() => handleStartChat(profile.user_id)}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Start Chat
                    </button>
                  </>
                ) : null}
              </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state - shown when no profiles match filters */}
        {profiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No students found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
