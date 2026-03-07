// Import BrowserRouter for client-side routing
// Routes component for defining route structure
// Route component for individual route definitions
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import AuthProvider to wrap app with authentication context
import { AuthProvider } from './contexts/AuthContext';

// Import ProtectedRoute component to guard authenticated routes
import { ProtectedRoute } from './components/ProtectedRoute';

// Import all page components
import { Landing } from './pages/Landing'; // Public landing page
import { Login } from './pages/Login'; // Login page
import { Signup } from './pages/Signup'; // Registration page
import { Dashboard } from './pages/Dashboard'; // Main dashboard (protected)
import { Profile } from './pages/Profile'; // Profile view (protected)
import { ProfileSetup } from './pages/ProfileSetup'; // Profile setup (protected)
import { ProfileEdit } from './pages/ProfileEdit'; // Profile editing (protected)
import { ProfileQR } from './pages/ProfileQR'; // QR code sharing (protected)
import { Discover } from './pages/Discover'; // Student discovery (protected)
import { Startups } from './pages/Startups'; // Startup ideas (protected)
import { Courses } from './pages/Courses'; // Course outlines (protected)
import { Admin } from './pages/Admin'; // Admin dashboard (protected)
import { Settings } from './pages/Settings'; // Settings page (protected)
import Messages from './pages/Messages'; // Messages (protected)
import { AIMatching } from './pages/AIMatching'; // AI-powered matching (protected)

// Main App component - root component of the application
// Sets up routing structure and authentication context
function App() {
  return (
    // AuthProvider wraps entire app to provide authentication state
    // This makes useAuth hook available in all child components
    <AuthProvider>
      {/* BrowserRouter enables client-side routing without page reloads */}
      <BrowserRouter>
        {/* Routes container holds all route definitions */}
        <Routes>
          {/* Public Routes - accessible without authentication */}

          {/* Landing page route - shown at root path */}
          <Route path="/" element={<Landing />} />

          {/* Login page route - for existing users to sign in */}
          <Route path="/login" element={<Login />} />

          {/* Signup page route - for new users to create accounts */}
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - require authentication */}
          {/* Each protected route is wrapped in ProtectedRoute component */}
          {/* ProtectedRoute checks authentication and redirects to /login if needed */}

          {/* Dashboard route - main hub after login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile route - view own profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Profile setup route - complete profile after signup */}
          <Route
            path="/profile/setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />

          {/* Profile edit route - edit existing profile */}
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Profile QR code route - share profile via QR */}
          <Route
            path="/profile/qr"
            element={
              <ProtectedRoute>
                <ProfileQR />
              </ProtectedRoute>
            }
          />

          {/* Discover route - find and connect with other students */}
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />

          {/* Startups route - view and create startup ideas */}
          <Route
            path="/startups"
            element={
              <ProtectedRoute>
                <Startups />
              </ProtectedRoute>
            }
          />

          {/* Courses route - share and compare course outlines */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />

          {/* Admin route - admin dashboard for verification */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Settings route - user preferences and configuration */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Messages route - chat with other users */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* AI Matching route - AI-powered collaboration discovery */}
          <Route
            path="/matching"
            element={
              <ProtectedRoute>
                <AIMatching />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect any unknown paths to landing page */}
          {/* This prevents 404 errors and provides a better user experience */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Export App component as default export
export default App;
