import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Define strict types for roles
type UserRole = "admin" | "customer";

interface UserWithRole extends User {
  role?: UserRole;
}

interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserWithRole | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, expectedRole: UserRole) => Promise<boolean>;
  signup: (data: SignUpData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to extract and validate role from user metadata
  const extractUserRole = (authUser: User): UserWithRole => {
    const metadata = authUser.user_metadata || {};
    const role = metadata.role as UserRole;

    // Validate role
    if (!role || !["admin", "customer"].includes(role)) {
      throw new Error('Invalid or missing role in user metadata');
    }

    return {
      ...authUser,
      role
    };
  };

  const signup = async ({ email, password, full_name, role }: SignUpData): Promise<boolean> => {
    try {
      setError(null);
      console.log('Starting signup process...', { email, role });

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role
          }
        }
      });

      if (signupError) {
        throw new Error('Signup failed: ' + signupError.message);
      }

      if (!data?.user) {
        throw new Error('Signup failed: No user data returned');
      }

      // Verify metadata was set correctly
      const userRole = data.user.user_metadata?.role;
      if (userRole !== role) {
        throw new Error('Signup failed: Role not set correctly');
    }

      toast.success('Signup successful! Please check your email to verify your account.');
      return true;
    } catch (err) {
      console.error('Signup process error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const login = async (email: string, password: string, expectedRole: UserRole): Promise<boolean> => {
    try {
      setError(null);
      console.log('Login attempt:', { email, expectedRole });

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        throw new Error('Login failed: ' + loginError.message);
      }

      if (!data?.user) {
        throw new Error('Login failed: No user data returned');
      }

      // Extract and validate role from user metadata
      try {
        const userWithRole = extractUserRole(data.user);

        // Verify role matches expected role
      if (userWithRole.role !== expectedRole) {
          await supabase.auth.signOut();
          throw new Error(`Access denied. You are a ${userWithRole.role}, not a ${expectedRole}.`);
      }

        setUser(userWithRole);
      console.log('Login successful with role:', userWithRole.role);
      return true;
      } catch (roleError) {
        await supabase.auth.signOut();
        throw roleError;
      }
    } catch (err) {
      console.error('Login process error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to sign out');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            const userWithRole = extractUserRole(session.user);
            setUser(userWithRole);
          } catch (error) {
            console.error('Error extracting user role:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const userWithRole = extractUserRole(session.user);
          setUser(userWithRole);
        } catch (error) {
          console.error('Auth state change role extraction error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};