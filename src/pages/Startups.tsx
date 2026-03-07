// Import React hooks for state and side effects
import { useEffect, useState } from 'react';

// Import Link for navigation and icons
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Users } from 'lucide-react';
import { HomeButton } from '../components/HomeButton';

// Import Supabase client and authentication
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces
import type { StartupIdea, StudentProfile } from '../types';

// Import centralized image functions for startup images
import { getStartupImage, getImagePlaceholder } from '../data/studentImages';

// Extended interface with creator profile data
interface StartupWithCreator extends StartupIdea {
  creator?: StudentProfile; // Creator's profile joined from student_profiles
}

// Startups page component - displays startup ideas and allows team formation
// Users can create startup ideas, invite members, and join existing teams
export function Startups() {
  // Get authenticated user from context
  const { user } = useAuth();

  // State for list of startup ideas
  const [startups, setStartups] = useState<StartupWithCreator[]>([]);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for create startup modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State for new startup form fields
  const [title, setTitle] = useState(''); // Startup title
  const [description, setDescription] = useState(''); // Detailed description
  const [problem, setProblem] = useState(''); // Problem being solved
  const [targetSector, setTargetSector] = useState(''); // Industry sector
  const [requiredRoles, setRequiredRoles] = useState(''); // Comma-separated roles

  // State for form submission
  const [creating, setCreating] = useState(false);

  // Fetch all startup ideas on component mount
  useEffect(() => {
    // Async function to load startups from database
    const fetchStartups = async () => {
      // Query startup_ideas table
      const { data: startupsData, error: startupsError } = await supabase
        .from('startup_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (startupsError) {
        console.error('Error fetching startups:', startupsError);
        setLoading(false);
        return;
      }

      // Get creator profiles for each startup
      if (startupsData) {
        const creatorIds = [...new Set(startupsData.map(s => s.creator_id))];
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('*')
          .in('user_id', creatorIds);

        // Map profiles to startups
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const startupsWithCreators = startupsData.map(startup => ({
          ...startup,
          creator: profileMap.get(startup.creator_id)
        }));

        setStartups(startupsWithCreators);
      }

      setLoading(false);
    };

    // Execute fetch
    fetchStartups();
  }, []); // Run once on mount

  // Function to handle creating a new startup idea
  const handleCreateStartup = async (e: React.FormEvent) => {
    // Prevent form default behavior
    e.preventDefault();

    // Exit if no authenticated user
    if (!user) return;

    // Set creating state to true (shows loading indicator)
    setCreating(true);

    try {
      // Parse comma-separated roles into array
      const rolesArray = requiredRoles
        .split(',') // Split by comma
        .map((role) => role.trim()) // Remove whitespace from each role
        .filter((role) => role.length > 0); // Remove empty strings

      // Insert new startup idea into database
      const { data, error } = await supabase
        .from('startup_ideas')
        .insert({
          creator_id: user.id, // Current user is creator
          title, // Startup title
          description, // Full description
          problem, // Problem statement
          target_sector: targetSector, // Industry sector
          required_roles: rolesArray, // Array of needed roles
        })
        .select()
        .single(); // Expect one result

      // If insert fails, throw error
      if (error) throw error;

      // Get creator profile
      if (data) {
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setStartups([{ ...data, creator: profile }, ...startups]);
      }

      // Clear form fields
      setTitle('');
      setDescription('');
      setProblem('');
      setTargetSector('');
      setRequiredRoles('');

      // Close modal
      setShowCreateModal(false);
    } catch (err) {
      // Log any errors
      console.error('Error creating startup:', err);
    } finally {
      // Always set creating to false when done
      setCreating(false);
    }
  };

  // Show loading spinner while data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // Main startups container with black background
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content wrapper with max width */}
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          {/* Left side: back link and title */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-white">
                ← Back to Dashboard
              </Link>
              <HomeButton />
            </div>
            <h1 className="text-3xl font-bold mb-2">Startup Ideas</h1>
            <p className="text-gray-400">
              Discover startup opportunities and build your team.
            </p>
          </div>

          {/* Right side: create button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Startup Idea
          </button>
        </div>

        {/* Startups grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map over startups array to create cards */}
          {startups.map((startup, index) => (
            <div
              key={startup.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-colors"
            >
              {/* Startup hero image */}
              <div className="relative h-40">
                <img
                  src={getStartupImage(index)}
                  alt={`${startup.title} innovation`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails
                    e.currentTarget.src = getImagePlaceholder(800, 400, 'Innovation');
                  }}
                />
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

                {/* Briefcase icon overlay */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-green-500/30">
                  <Briefcase className="w-5 h-5 text-green-500" />
                </div>
              </div>

              <div className="p-6">
                {/* Startup card header */}
                <div className="mb-4">
                  {/* Startup title and creator */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{startup.title}</h3>
                    {/* Creator name (if available) */}
                    {startup.creator && (
                      <p className="text-sm text-gray-400">
                        by {startup.creator.full_name}
                      </p>
                    )}
                  </div>
                </div>

              {/* Target sector badge */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/30">
                  {startup.target_sector}
                </span>
              </div>

              {/* Problem statement */}
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Problem</p>
                <p className="text-gray-200">{startup.problem}</p>
              </div>

              {/* Full description */}
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Description</p>
                <p className="text-gray-200">{startup.description}</p>
              </div>

              {/* Required roles section */}
              {startup.required_roles && startup.required_roles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Looking for</p>
                  {/* Flexbox container for role tags */}
                  <div className="flex flex-wrap gap-2">
                    {/* Map over required roles */}
                    {startup.required_roles.map((role, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="mt-4">
                {/* Different button based on whether user is creator */}
                {user?.id === startup.creator_id ? (
                  // User is creator - show manage button
                  <Link
                    to={`/startups/${startup.id}`}
                    className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2 text-center"
                  >
                    <Users className="w-4 h-4" />
                    Manage Team
                  </Link>
                ) : (
                  // User is not creator - show view/join button
                  <Link
                    to={`/startups/${startup.id}`}
                    className="w-full py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 text-center"
                  >
                    View Details
                  </Link>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state - shown when no startups exist */}
        {startups.length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No startup ideas yet. Be the first to create one!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Create Startup Idea
            </button>
          </div>
        )}
      </div>

      {/* Create startup modal - shown when showCreateModal is true */}
      {showCreateModal && (
        // Modal overlay - semi-transparent black background
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          {/* Modal content card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <h2 className="text-2xl font-bold mb-6">Create Startup Idea</h2>

            {/* Create startup form */}
            <form onSubmit={handleCreateStartup} className="space-y-4">
              {/* Title input field */}
              <div>
                <label className="block text-sm font-medium mb-2">Startup Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="e.g., AgriTech Mobile Platform"
                />
              </div>

              {/* Target sector dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Sector</label>
                <select
                  value={targetSector}
                  onChange={(e) => setTargetSector(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select sector</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Climate">Climate</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Problem textarea */}
              <div>
                <label className="block text-sm font-medium mb-2">Problem Statement</label>
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                  placeholder="What problem are you solving?"
                />
              </div>

              {/* Description textarea */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                  placeholder="Describe your startup idea in detail"
                />
              </div>

              {/* Required roles input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Required Roles (comma-separated)
                </label>
                <input
                  type="text"
                  value={requiredRoles}
                  onChange={(e) => setRequiredRoles(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="e.g., Developer, Designer, Marketing, Hardware Engineer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple roles with commas
                </p>
              </div>

              {/* Form action buttons */}
              <div className="flex gap-4 mt-6">
                {/* Cancel button */}
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Startup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
