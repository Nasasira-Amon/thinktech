// Import necessary React hooks and routing components
import { useState } from 'react'; // For managing component state
import { Link, useNavigate } from 'react-router-dom'; // For navigation

// Import authentication hook to access sign-in functionality
import { useAuth } from '../contexts/AuthContext';

// Login page component - allows existing users to authenticate
export function Login() {
  // useNavigate hook provides programmatic navigation after successful login
  const navigate = useNavigate();

  // Destructure signIn function from authentication context
  const { signIn } = useAuth();

  // State for email input field value
  const [email, setEmail] = useState('');

  // State for password input field value
  const [password, setPassword] = useState('');

  // State to track loading status during authentication attempt
  const [loading, setLoading] = useState(false);

  // State to store and display error messages to user
  const [error, setError] = useState('');

  // Handle form submission when user clicks "Sign In" button
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior (page reload)
    e.preventDefault();

    // Clear any previous error messages
    setError('');

    // Set loading state to true (shows loading indicator, disables button)
    setLoading(true);

    try {
      // Attempt to sign in user with provided email and password
      const { error } = await signIn(email, password);

      // If authentication fails, Supabase returns an error object
      if (error) throw error;

      // On success, navigate to dashboard page
      navigate('/dashboard');
    } catch (err: any) {
      // If sign-in fails, display error message to user
      // err.message contains human-readable error from Supabase
      setError(err.message || 'Failed to sign in');
    } finally {
      // Always set loading to false when operation completes (success or failure)
      setLoading(false);
    }
  };

  return (
    // Full-screen container with black background and centered content
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Card container for login form with max width and padding */}
      <div className="max-w-md w-full">
        {/* Card content with dark background and border */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {/* Logo/branding section */}
          <div className="text-center mb-8">
            {/* Brand name as heading */}
            <h1 className="text-3xl font-bold mb-2">
              {/* "VersePass ID" in white, "Africa" in green for brand consistency */}
              VersePass ID <span className="text-green-500">Africa</span>
            </h1>
            {/* Subtitle explaining page purpose */}
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* Error message display - only shown when error state is not empty */}
          {error && (
            // Red background alert box for error visibility
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Login form - calls handleSubmit on submission */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input field group */}
            <div>
              {/* Label for email input (accessibility) */}
              <label className="block text-sm font-medium mb-2">Email</label>
              {/* Email input field */}
              <input
                type="email" // Browser validates email format
                value={email} // Controlled input - value from state
                onChange={(e) => setEmail(e.target.value)} // Update state on change
                required // HTML5 validation - field must not be empty
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="your.email@university.ac.ug"
              />
            </div>

            {/* Password input field group */}
            <div>
              {/* Label for password input (accessibility) */}
              <label className="block text-sm font-medium mb-2">Password</label>
              {/* Password input field */}
              <input
                type="password" // Hides password characters for security
                value={password} // Controlled input - value from state
                onChange={(e) => setPassword(e.target.value)} // Update state on change
                required // HTML5 validation - field must not be empty
                className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit" // Triggers form submission
              disabled={loading} // Disable button during authentication attempt
              className="w-full py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Button text changes based on loading state */}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Link to signup page for users without an account */}
          <p className="mt-6 text-center text-gray-400">
            {/* Text prompt */}
            Don't have an account?{' '}
            {/* Link to registration page with green hover effect */}
            <Link to="/signup" className="text-green-500 hover:underline">
              Sign up
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
