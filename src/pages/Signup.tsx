// Import necessary React hooks and routing components
import { useState, useEffect } from 'react'; // useState for state, useEffect for data fetching
import { Link, useNavigate } from 'react-router-dom'; // For navigation

// Import authentication hook and Supabase client
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Import TypeScript interface for type safety
import type { University } from '../types';

// Signup page component - allows new users to create accounts
export function Signup() {
  // useNavigate hook for redirecting after successful signup
  const navigate = useNavigate();

  // Destructure signUp function from authentication context
  const { signUp } = useAuth();

  // Authentication fields state
  const [email, setEmail] = useState(''); // User's email address
  const [password, setPassword] = useState(''); // User's chosen password
  const [confirmPassword, setConfirmPassword] = useState(''); // Password confirmation

  // Profile fields state
  const [fullName, setFullName] = useState(''); // Student's full name
  const [studentNumber, setStudentNumber] = useState(''); // Registration/student number
  const [universityId, setUniversityId] = useState(''); // Selected university ID
  const [program, setProgram] = useState(''); // Degree program name
  const [yearOfStudy, setYearOfStudy] = useState('1'); // Academic year (1-5)

  // UI state
  const [loading, setLoading] = useState(false); // Loading indicator during signup
  const [error, setError] = useState(''); // Error message display

  // Universities data state
  const [universities, setUniversities] = useState<University[]>([]); // List of available universities

  // Fetch universities from database on component mount
  useEffect(() => {
    // Async function to load universities
    const fetchUniversities = async () => {
      // Query Supabase universities table
      const { data, error } = await supabase
        .from('universities') // Table name
        .select('*') // Select all columns
        .order('name'); // Sort alphabetically by name

      // If query successful, update state with universities
      if (data) setUniversities(data);

      // If query fails, log error to console
      if (error) console.error('Error fetching universities:', error);
    };

    // Execute the fetch function
    fetchUniversities();
  }, []); // Empty dependency array = run once on mount

  // Handle form submission when user clicks "Create Account"
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission (page reload)
    e.preventDefault();

    // Clear any previous error messages
    setError('');

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return; // Stop execution if passwords don't match
    }

    // Validate that password meets minimum length requirement
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Set loading state to true (shows loading indicator, disables button)
    setLoading(true);

    try {
      // Step 1: Create authentication account with Supabase Auth
      const { data: authData, error: authError } = await signUp(email, password);

      // If authentication signup fails, throw error
      if (authError) throw authError;

      // If no user data returned, something went wrong
      if (!authData.user) throw new Error('Signup failed');

      // Step 2: Assign 'student' role to new user
      const { error: roleError } = await supabase
        .from('user_roles') // user_roles table
        .insert({
          user_id: authData.user.id, // Link role to authenticated user
          role: 'student', // Default role for all new signups
        });

      // If role assignment fails, log error but don't block signup
      if (roleError) console.error('Error assigning role:', roleError);

      // Step 3: Create student profile with provided information
      const { error: profileError } = await supabase
        .from('student_profiles') // student_profiles table
        .insert({
          user_id: authData.user.id, // Link profile to authenticated user
          university_id: universityId, // Selected university
          full_name: fullName, // Student's name
          student_number: studentNumber, // Registration number
          program: program, // Degree program
          year_of_study: parseInt(yearOfStudy), // Convert string to integer
          is_verified: false, // New profiles start as unverified
          is_open_to_startups: false, // Default availability setting
          privacy_level: 'full', // Default privacy setting
        });

      // If profile creation fails, throw error
      if (profileError) throw profileError;

      // Success! Navigate to profile setup page to add skills/interests
      navigate('/profile/setup');
    } catch (err: any) {
      // If any step fails, display error message to user
      setError(err.message || 'Failed to create account');
    } finally {
      // Always set loading to false when operation completes
      setLoading(false);
    }
  };

  return (
    // Full-screen container with black background and centered content
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      {/* Card container for signup form */}
      <div className="max-w-md w-full">
        {/* Card content with dark background */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Logo/branding section */}
          <div className="text-center mb-8">
            {/* Brand name as heading */}
            <h1 className="text-3xl font-bold mb-2">
              {/* Brand name with green accent */}
              VersePass ID <span className="text-green-500">Africa</span>
            </h1>
            {/* Subtitle explaining page purpose */}
            <p className="text-gray-400">Create your verified student account</p>
          </div>

          {/* Error message display - only shown when error exists */}
          {error && (
            // Red alert box for error visibility
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Signup form - calls handleSubmit on submission */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name input field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Full Name</label>
              <input
                type="text" // Text input type
                value={fullName} // Controlled input
                onChange={(e) => setFullName(e.target.value)} // Update state
                required // HTML5 validation
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                placeholder="John Doe"
              />
            </div>

            {/* Email input field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email</label>
              <input
                type="email" // Email validation
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                placeholder="your.email@university.ac.ug"
              />
            </div>

            {/* Password input field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
              <input
                type="password" // Hide password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} // Minimum 6 characters
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                placeholder="At least 6 characters"
              />
            </div>

            {/* Confirm password input field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                placeholder="Re-enter your password"
              />
            </div>

            {/* University selection dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">University</label>
              <select
                value={universityId} // Controlled select
                onChange={(e) => setUniversityId(e.target.value)} // Update state
                required // Must select a university
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
              >
                {/* Default placeholder option */}
                <option value="">Select your university</option>
                {/* Map over universities array to create options */}
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student number input field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Student Number</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                placeholder="e.g., 2021/HD07/1234"
              />
            </div>

            {/* Program/course input field */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Program</label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
                placeholder="e.g., Computer Science"
              />
            </div>

            {/* Year of study selection dropdown */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Year of Study</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none text-white"
              >
                {/* Options for years 1 through 5 */}
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
                <option value="5">Year 5</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading} // Disable during signup process
              className="w-full py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Button text changes based on loading state */}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Link to login page for existing users */}
          <p className="mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 hover:underline">
              Sign in
            </Link>
          </p>

          {/* Link back to landing page */}
          <p className="mt-4 text-center">
            <Link to="/" className="text-gray-400 hover:text-white">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
