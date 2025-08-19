import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await window.ezsite.apis.getUserInfo();
      if (response.error) {
        setIsAuthenticated(false);
        navigate('/admin-login');
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
      navigate('/admin-login');
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>);

  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

export default AuthGuard;