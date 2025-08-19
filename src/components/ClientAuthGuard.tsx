
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ClientAuthGuardProps {
  children: React.ReactNode;
}

const ClientAuthGuard: React.FC<ClientAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: userInfo, error } = await window.ezsite.apis.getUserInfo();

      if (error || !userInfo) {
        setIsAuthenticated(false);
        return;
      }

      const roles = userInfo.Roles ? userInfo.Roles.split(',') : [];
      setUserRoles(roles);

      // Check if user has client role or general user role
      const hasClientAccess = roles.includes('GeneralUser') || roles.includes('Client');
      setIsAuthenticated(hasClientAccess);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>);

  }

  if (!isAuthenticated) {
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ClientAuthGuard;