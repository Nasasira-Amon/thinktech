// Import React hooks for state management and lifecycle operations
import { createContext, useContext, useEffect, useState } from 'react';

// Import Supabase types for type safety
import type { User } from '@supabase/supabase-js';

// Import the configured Supabase client instance
import { supabase } from '../lib/supabase';

// Define the shape of the authentication context
// This interface specifies all authentication-related data and functions available to consuming components
interface AuthContextType {
  user: User | null; // Currently authenticated user object or null if not authenticated
  loading: boolean; // Loading state during initial authentication check
  signUp: (email: string, password: string) => Promise<any>; // Function to register new user
  signIn: (email: string, password: string) => Promise<any>; // Function to log in existing user
  signOut: () => Promise<void>; // Function to log out current user
}

// Create the authentication context with undefined as initial value
// This context will be provided at the app root and consumed by child components
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component wraps the application and provides authentication state
// Props: children - React nodes to be wrapped with authentication context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to store the currently authenticated user
  // null indicates no user is logged in
  const [user, setUser] = useState<User | null>(null);

  // State to track if authentication status is being determined
  // true while checking for existing session, false once check is complete
  const [loading, setLoading] = useState(true);

  // useEffect hook runs once on component mount
  // Sets up authentication state and listener for auth changes
  useEffect(() => {
    // Async function to check for existing authenticated session
    const initializeAuth = async () => {
      // Get current session from Supabase (checks for valid JWT)
      const { data: { session } } = await supabase.auth.getSession();

      // If session exists, set the user state with the session's user object
      setUser(session?.user ?? null);

      // Mark loading as complete since initial auth check is done
      setLoading(false);
    };

    // Execute the initialization function
    initializeAuth();

    // Subscribe to authentication state changes
    // This listener fires whenever user signs in, signs out, or token refreshes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Async block inside callback to avoid deadlock (as per Supabase best practices)
        (async () => {
          // Update user state with new session data
          setUser(session?.user ?? null);
        })();
      }
    );

    // Cleanup function: unsubscribe from auth changes when component unmounts
    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  // signUp function: creates a new user account with email and password
  // Parameters: email - user's email address, password - user's chosen password
  // Returns: Promise with signup result (user data or error)
  const signUp = async (email: string, password: string) => {
    // Call Supabase auth signup method
    return await supabase.auth.signUp({
      email,
      password,
    });
  };

  // signIn function: authenticates existing user with email and password
  // Parameters: email - user's email address, password - user's password
  // Returns: Promise with signin result (session data or error)
  const signIn = async (email: string, password: string) => {
    // Call Supabase auth signin method with password strategy
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  // signOut function: logs out the current user and clears session
  // Returns: Promise that resolves when signout is complete
  const signOut = async () => {
    // Call Supabase auth signout method
    await supabase.auth.signOut();
  };

  // Provide authentication context value to all child components
  // This makes user, loading state, and auth functions available via useAuth hook
  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access authentication context
// This hook simplifies accessing auth data in components
// Throws error if used outside of AuthProvider
export function useAuth() {
  // Get context value from AuthContext
  const context = useContext(AuthContext);

  // If context is undefined, hook is being used outside of AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Return the context value containing user, loading, and auth functions
  return context;
}
