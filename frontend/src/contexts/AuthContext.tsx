import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase, signInWithEmail, signUpWithEmail, signOut, getCurrentUser } from '../services/supabase';
import logger from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  company_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for stored demo user or Supabase session
      const storedUser = localStorage.getItem('siteboss_user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email === 'demo@siteboss.com') {
          // Demo user - ensure email_verified is set
          parsedUser.email_verified = true;
          setUser(parsedUser);
          localStorage.setItem('siteboss_user', JSON.stringify(parsedUser));
          setIsLoading(false);
          return;
        }
      }

      // Check Supabase session
      try {
        const { user: supabaseUser, error } = await getCurrentUser();
        
        if (supabaseUser && !error) {
          const userData: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            first_name: supabaseUser.user_metadata?.first_name || 'User',
            last_name: supabaseUser.user_metadata?.last_name || '',
            role: supabaseUser.user_metadata?.role || 'company_admin',
            company_id: supabaseUser.user_metadata?.company_id || 'default-company',
            phone: supabaseUser.user_metadata?.phone,
            email_verified: true // If user has an active session, they are considered verified
          };
          
          setUser(userData);
          localStorage.setItem('siteboss_user', JSON.stringify(userData));
        } else if (storedUser) {
          // If we have a stored user but no Supabase session, try to use the stored user
          // but assume email is verified for existing users (backward compatibility)
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.email_verified === undefined) {
            parsedUser.email_verified = true; // Assume verified for existing users
            localStorage.setItem('siteboss_user', JSON.stringify(parsedUser));
          }
          setUser(parsedUser);
        }
      } catch (error) {
        logger.error('Failed to initialize auth', error);
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          localStorage.removeItem('siteboss_user');
          localStorage.removeItem('siteboss_token');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Demo mode - accept demo@siteboss.com with any password
    if (email === 'demo@siteboss.com') {
      const demoUser: User = {
        id: 'demo-user-1',
        email: 'demo@siteboss.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'company_admin',
        company_id: 'demo-company-1',
        phone: '(555) 123-4567',
        email_verified: true
      };
      
      setUser(demoUser);
      localStorage.setItem('siteboss_token', 'demo-token');
      localStorage.setItem('siteboss_user', JSON.stringify(demoUser));
      return;
    }

    try {
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Convert Supabase user to our User interface
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          first_name: data.user.user_metadata?.first_name || 'User',
          last_name: data.user.user_metadata?.last_name || '',
          role: data.user.user_metadata?.role || 'company_admin',
          company_id: data.user.user_metadata?.company_id || 'default-company',
          phone: data.user.user_metadata?.phone,
          email_verified: true // If user can login successfully, they are considered verified
        };

        setUser(userData);
        localStorage.setItem('siteboss_user', JSON.stringify(userData));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Use demo@siteboss.com for demo access.');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const metadata = {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        company_name: data.company_name,
        company_id: `company-${Date.now()}`
      };

      const { data: signUpData, error } = await signUpWithEmail(
        data.email, 
        data.password, 
        metadata,
        `http://localhost:3000/email-confirmation`
      );
      
      if (error) {
        throw new Error(error.message);
      }

      // Don't automatically log the user in - they need to confirm their email first
      // The user will be redirected to the email confirmation page
      
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    localStorage.removeItem('siteboss_token');
    localStorage.removeItem('siteboss_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('siteboss_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};