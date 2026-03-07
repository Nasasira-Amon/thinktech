// Import Navigate component for programmatic navigation
import { Navigate } from 'react-router-dom';

// Import the authentication hook to check user login status
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute component ensures only authenticated users can access certain pages
// Props: children - The React components/pages to render if user is authenticated
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Destructure user and loading state from authentication context
  const { user, loading } = useAuth();

  // If authentication check is still in progress, show loading indicator
  // This prevents flashing of login page while checking for existing session
  if (loading) {
    return (
      // Full-screen centered loading container with black background
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Loading spinner with green border (brand color) */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If user is not authenticated (user is null), redirect to login page
  // Navigate component from react-router-dom handles the redirection
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the protected content (children)
  return <>{children}</>;
}
