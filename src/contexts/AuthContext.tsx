import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  hasExistingUser: boolean;
  checkForExistingUsers: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  updatePassword: (newPassword: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasExistingUser, setHasExistingUser] = useState(false);
  const navigate = useNavigate();

  // Function to check if users exist in the system
  const checkForExistingUsers = async () => {
    try {
      // Count users in the profiles table as this will give us active users
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error("Error checking for existing users:", error);
        return false;
      }
      
      const userExists = count ? count > 0 : false;
      setHasExistingUser(userExists);
      return userExists;
    } catch (error) {
      console.error("Error checking for existing users:", error);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing users when the app loads
    checkForExistingUsers();
    
    // Set up auth state listener without automatic navigation
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        // Update auth state without triggering navigation
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        // Only navigate on successful explicit login
        navigate('/');
      }
      return { 
        error, 
        success: !error 
      };
    } catch (error) {
      return { 
        error: error as Error, 
        success: false 
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if users already exist
      const userExists = await checkForExistingUsers();
      
      if (userExists) {
        return { 
          error: new Error('Registration is disabled. Please contact the administrator.'), 
          success: false 
        };
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      return { 
        error, 
        success: !error 
      };
    } catch (error) {
      return { 
        error: error as Error, 
        success: false 
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/Mustaqeem-portfolio/#/reset-password`,
      });
      
      return {
        error,
        success: !error
      };
    } catch (error) {
      return {
        error: error as Error,
        success: false
      };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return {
        error,
        success: !error
      };
    } catch (error) {
      return {
        error: error as Error,
        success: false
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Only navigate on explicit logout
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        hasExistingUser,
        checkForExistingUsers,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
