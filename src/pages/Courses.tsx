// Import React hooks
import { useEffect, useState } from 'react';

// Import Link and icons
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { HomeButton } from '../components/HomeButton';

// Import Supabase and authentication
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import TypeScript interfaces
import type { CourseOutline, University } from '../types';

// Import centralized image functions for course images
import { getCourseImage, getImagePlaceholder } from '../data/studentImages';

// Extended interface with university data
interface CourseWithUniversity extends CourseOutline {
  university?: University; // Joined university data
}

// Courses page - allows students to share and compare course outlines
// Enables academic collaboration across universities
export function Courses() {
  // Get authenticated user
  const { user } = useAuth();

  // State for list of course outlines
  const [courses, setCourses] = useState<CourseWithUniversity[]>([]);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for create course modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State for new course form fields
  const [courseName, setCourseName] = useState(''); // Course name
  const [courseCode, setCourseCode] = useState(''); // Course code
  const [semester, setSemester] = useState(''); // Semester offered
  const [year, setYear] = useState('1'); // Academic year
  const [modulesInput, setModulesInput] = useState(''); // Comma-separated modules

  // State for universities list (for dropdown)
  const [universities, setUniversities] = useState<University[]>([]);

  // State for selected university in form
  const [selectedUniversityId, setSelectedUniversityId] = useState('');

  // State for form submission
  const [creating, setCreating] = useState(false);

  // Fetch universities on mount for dropdown
  useEffect(() => {
    // Async function to load universities
    const fetchUniversities = async () => {
      // Query universities table
      const { data } = await supabase
        .from('universities')
        .select('*')
        .order('name');

      // Update state if data returned
      if (data) setUniversities(data);
    };

    // Execute fetch
    fetchUniversities();
  }, []); // Run once

  // Fetch course outlines on mount
  useEffect(() => {
    // Async function to load courses
    const fetchCourses = async () => {
      // Query course_outlines with university joined
      const { data, error } = await supabase
        .from('course_outlines')
        .select(`
          *,
          university:universities(*)
        `) // Join university data
        .order('created_at', { ascending: false }); // Newest first

      // Update state if successful
      if (data) setCourses(data);

      // Log errors
      if (error) console.error('Error:', error);

      // Mark loading complete
      setLoading(false);
    };

    // Execute fetch
    fetchCourses();
  }, []); // Run once

  // Function to handle creating a new course outline
  const handleCreateCourse = async (e: React.FormEvent) => {
    // Prevent default form behavior
    e.preventDefault();

    // Exit if no user
    if (!user) return;

    // Set creating state
    setCreating(true);

    try {
      // First get user's profile to link course to profile
      const { data: profileData } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Exit if no profile found
      if (!profileData) throw new Error('Profile not found');

      // Parse modules from comma-separated string to array
      const modulesArray = modulesInput
        .split(',') // Split by comma
        .map((m) => m.trim()) // Remove whitespace
        .filter((m) => m.length > 0); // Remove empty strings

      // Insert new course outline
      const { data, error } = await supabase
        .from('course_outlines')
        .insert({
          profile_id: profileData.id, // Link to user's profile
          university_id: selectedUniversityId, // Selected university
          course_name: courseName, // Course name
          course_code: courseCode, // Course code
          semester, // Semester
          year: parseInt(year), // Convert to number
          modules: modulesArray, // Modules array
        })
        .select(`
          *,
          university:universities(*)
        `) // Return with university data
        .single();

      // Throw error if insert fails
      if (error) throw error;

      // Add new course to local state
      if (data) {
        setCourses([data, ...courses]);
      }

      // Clear form fields
      setCourseName('');
      setCourseCode('');
      setSemester('');
      setYear('1');
      setModulesInput('');
      setSelectedUniversityId('');

      // Close modal
      setShowCreateModal(false);
    } catch (err) {
      // Log errors
      console.error('Error creating course:', err);
    } finally {
      // Always set creating to false
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
    // Main courses container
    <div className="min-h-screen bg-black text-white p-4">
      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-8">
          {/* Left side */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-white">
                ← Back to Dashboard
              </Link>
              <HomeButton />
            </div>
            <h1 className="text-3xl font-bold mb-2">Course Outlines</h1>
            <p className="text-gray-400">
              Share and compare course curriculum across universities.
            </p>
          </div>

          {/* Right side: create button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map over courses array */}
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-500 transition-colors"
            >
              {/* Course hero image */}
              <div className="relative h-32">
                <img
                  src={getCourseImage(index)}
                  alt={`${course.course_name} education`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails
                    e.currentTarget.src = getImagePlaceholder(800, 300, 'Education');
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

                {/* Book icon overlay */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-green-500/30">
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
              </div>

              <div className="p-6">
                {/* Course card header */}
                <div className="mb-4">
                  {/* Course name and code */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{course.course_name}</h3>
                    <p className="text-gray-400">{course.course_code}</p>
                  </div>
                </div>

              {/* University badge */}
              {course.university && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm border border-green-500/30">
                    {course.university.name}
                  </span>
                </div>
              )}

              {/* Course details grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Semester */}
                <div>
                  <p className="text-xs text-gray-400">Semester</p>
                  <p className="text-sm">{course.semester}</p>
                </div>

                {/* Year */}
                <div>
                  <p className="text-xs text-gray-400">Year</p>
                  <p className="text-sm">Year {course.year}</p>
                </div>
              </div>

              {/* Modules section */}
              {course.modules && course.modules.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Modules ({course.modules.length})
                  </p>
                  {/* Module tags */}
                  <div className="flex flex-wrap gap-2">
                    {/* Show first 4 modules */}
                    {course.modules.slice(0, 4).map((module, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700"
                      >
                        {module}
                      </span>
                    ))}

                    {/* Show +X more if more than 4 modules */}
                    {course.modules.length > 4 && (
                      <span className="px-2 py-1 text-gray-400 text-xs">
                        +{course.modules.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {courses.length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No course outlines yet. Be the first to share!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Add Course Outline
            </button>
          </div>
        )}
      </div>

      {/* Create course modal */}
      {showCreateModal && (
        // Modal overlay
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          {/* Modal content */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <h2 className="text-2xl font-bold mb-6">Add Course Outline</h2>

            {/* Create course form */}
            <form onSubmit={handleCreateCourse} className="space-y-4">
              {/* Course name input */}
              <div>
                <label className="block text-sm font-medium mb-2">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>

              {/* Course code input */}
              <div>
                <label className="block text-sm font-medium mb-2">Course Code</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  placeholder="e.g., CS201"
                />
              </div>

              {/* University dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">University</label>
                <select
                  value={selectedUniversityId}
                  onChange={(e) => setSelectedUniversityId(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select university</option>
                  {universities.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid for semester and year */}
              <div className="grid grid-cols-2 gap-4">
                {/* Semester input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                    placeholder="e.g., Semester 1"
                  />
                </div>

                {/* Year dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                  </select>
                </div>
              </div>

              {/* Modules textarea */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Modules/Topics (comma-separated)
                </label>
                <textarea
                  value={modulesInput}
                  onChange={(e) => setModulesInput(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                  placeholder="e.g., Arrays, Linked Lists, Trees, Graphs, Sorting Algorithms"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple modules with commas
                </p>
              </div>

              {/* Form buttons */}
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
                  {creating ? 'Adding...' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
