import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterRequest, UserRole } from '../types';
import { authApi } from '../services/api';

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
      const token = localStorage.getItem('siteboss_token');
      const storedUser = localStorage.getItem('siteboss_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('siteboss_user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('siteboss_token');
          localStorage.removeItem('siteboss_user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('siteboss_token', token);
        localStorage.setItem('siteboss_user', JSON.stringify(userData));
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const registerRequest: RegisterRequest = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        company_name: data.company_name
      };

      const response = await authApi.register(registerRequest);
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        setUser(userData);
        localStorage.setItem('siteboss_token', token);
        localStorage.setItem('siteboss_user', JSON.stringify(userData));
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('siteboss_token');
    localStorage.removeItem('siteboss_user');
    authApi.logout().catch(console.error);
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