import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'contractor' | 'client' | 'team_member';
  avatar?: string;
  company?: string;
  permissions: string[];
  lastLogin?: string;
  subscription?: {
    plan: 'trial' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt?: string;
  };
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  projectVolume?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  createAccount: (registrationData: RegistrationData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // Mock authentication - in real app this would check tokens/cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check logout state first
        const loggedOut = localStorage.getItem('has_logged_out');
        if (loggedOut === 'true') {
          setHasLoggedOut(true);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Simulate checking stored auth token
        const storedUser = localStorage.getItem('siteboss_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Auto-login with demo user for development (only if user hasn't explicitly logged out)
          const demoUser: User = {
            id: 'user_001',
            name: 'John Smith',
            email: 'john.smith@constructionco.com',
            role: 'project_manager',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            company: 'Smith Construction Co.',
            permissions: [
              'view_projects',
              'edit_projects', 
              'manage_tasks',
              'view_financials',
              'edit_financials',
              'manage_documents',
              'generate_reports',
              'manage_team'
            ],
            lastLogin: new Date().toISOString(),
            subscription: {
              plan: 'professional',
              status: 'active',
              expiresAt: '2025-12-31T23:59:59Z'
            }
          };
          setUser(demoUser);
          localStorage.setItem('siteboss_user', JSON.stringify(demoUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Auto-redirect to login if user becomes unauthenticated (except during initial load)
  useEffect(() => {
    if (!isLoading && !user && hasLoggedOut && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const allowedPaths = ['/admin-login', '/trial-signup', '/get-quote', '/'];
      
      if (!allowedPaths.includes(currentPath)) {
        console.log('Auto-redirecting unauthenticated user from', currentPath);
        window.location.replace('/admin-login');
      }
    }
  }, [user, isLoading, hasLoggedOut]);

  // Additional effect to ensure logout state is respected on page load
  useEffect(() => {
    const checkLogoutState = () => {
      const loggedOut = localStorage.getItem('has_logged_out');
      const currentPath = window.location.pathname;
      
      if (loggedOut === 'true' && currentPath !== '/admin-login' && currentPath !== '/trial-signup' && currentPath !== '/get-quote') {
        console.log('Logout state detected, redirecting to login');
        window.location.replace('/admin-login');
      }
    };

    // Run on mount and when focus returns to window
    checkLogoutState();
    window.addEventListener('focus', checkLogoutState);
    
    return () => window.removeEventListener('focus', checkLogoutState);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Try real API login first
      try {
        const resp = await authApi.login({ email, password });
        const d: any = (resp as any).data || {};
        const apiUser = d.user;
        const token = d.token;
        if (apiUser && token) {
          const userData: User = {
            id: apiUser.id,
            name: [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ') || apiUser.email,
            email: apiUser.email,
            role: (apiUser.role === 'company_admin' ? 'admin' : apiUser.role) || 'project_manager',
            avatar: apiUser.avatar_url,
            company: apiUser.company_id,
            permissions: ['view_projects','edit_projects','manage_tasks','view_financials','edit_financials','manage_documents','generate_reports','manage_team'],
            lastLogin: new Date().toISOString(),
            subscription: { plan: 'professional', status: 'active' }
          };
          setUser(userData);
          setHasLoggedOut(false);
          localStorage.setItem('siteboss_user', JSON.stringify(userData));
          localStorage.setItem('siteboss_token', token);
          localStorage.removeItem('has_logged_out');
          return true;
        }
      } catch (apiErr) {
        // Fallback to demo login when API is unavailable or credentials not set
        // eslint-disable-next-line no-console
        console.warn('Auth API login failed, falling back to demo auth');
      }

      // Mock authentication logic - create user based on email (demo)
      if (email && password && password !== 'trial-signup') {
        // Extract name from email or use default based on email
        let userName = 'User';
        let userId = 'user_001';
        let company = 'SiteBoss Company';
        let role: User['role'] = 'project_manager';
        
        if (email.includes('gdogra')) {
          userName = 'Gautam Dogra';
          userId = 'admin_001';
          role = 'admin';
          company = 'SiteBoss Admin';
        } else if (email.includes('admin')) {
          userName = 'Admin User';
          userId = 'admin_002';
          role = 'admin';
          company = 'Admin Company';
        } else if (email.includes('john')) {
          userName = 'John Smith';
          userId = 'user_001';
          role = 'project_manager';
          company = 'Smith Construction Co.';
        } else {
          // Extract name from email (before @)
          const emailName = email.split('@')[0];
          userName = emailName.split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
          userId = `user_${Date.now()}`;
        }
        
        const userData: User = {
          id: userId,
          name: userName,
          email: email,
          role: role,
          avatar: role === 'admin' 
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          company: company,
          permissions: role === 'admin' ? [
            'view_projects',
            'edit_projects',
            'manage_tasks',
            'view_financials',
            'edit_financials',
            'manage_documents',
            'generate_reports',
            'manage_team',
            'admin_access',
            'manage_users',
            'system_settings'
          ] : [
            'view_projects',
            'edit_projects',
            'manage_tasks',
            'view_financials',
            'edit_financials',
            'manage_documents',
            'generate_reports',
            'manage_team'
          ],
          lastLogin: new Date().toISOString(),
          subscription: {
            plan: role === 'admin' ? 'enterprise' : 'professional',
            status: 'active',
            expiresAt: '2025-12-31T23:59:59Z'
          }
        };
        
        setUser(userData);
        setHasLoggedOut(false);
        localStorage.setItem('siteboss_user', JSON.stringify(userData));
        // Provide demo token so API calls authenticate
        localStorage.setItem('siteboss_token', 'demo-token');
        localStorage.removeItem('has_logged_out');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear state first
    setUser(null);
    setHasLoggedOut(true);
    setIsLoading(false);
    
    // Clear all authentication-related localStorage items
    localStorage.removeItem('siteboss_user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.setItem('has_logged_out', 'true');
    
    // Clear any other potential auth storage
    sessionStorage.clear();
    
    // Multiple fallback approaches for redirect
    try {
      // First attempt: immediate redirect
      window.location.replace('/admin-login');
    } catch (error) {
      // Fallback 1: Use href
      try {
        window.location.href = '/admin-login';
      } catch (error2) {
        // Fallback 2: Use assign
        window.location.assign('/admin-login');
      }
    }
  };

  const createAccount = async (registrationData: RegistrationData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: `user_${Date.now()}`,
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        role: registrationData.projectVolume && ['5m-25m', '25m-100m', 'over-100m'].includes(registrationData.projectVolume) ? 'admin' : 'project_manager',
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150`,
        company: registrationData.companyName || 'Trial Company',
        permissions: [
          'view_projects',
          'edit_projects',
          'manage_tasks',
          'view_financials',
          'edit_financials',
          'manage_documents',
          'generate_reports',
          'manage_team'
        ],
        lastLogin: new Date().toISOString(),
        subscription: {
          plan: 'trial',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }
      };
      
      setUser(userData);
      setHasLoggedOut(false);
      localStorage.setItem('siteboss_user', JSON.stringify(userData));
      localStorage.removeItem('has_logged_out');
      return true;
    } catch (error) {
      console.error('Account creation error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('siteboss_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    createAccount,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
