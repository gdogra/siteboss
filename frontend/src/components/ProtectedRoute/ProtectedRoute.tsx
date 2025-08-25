import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { getRoutePermissions } from '../../config/routePermissions';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canAccessRoute, userRole } = useRBAC();
  const location = useLocation();

  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check route permissions
  const routePermissions = getRoutePermissions(location.pathname);
  const hasRouteAccess = canAccessRoute(routePermissions);

  // Show access denied if user doesn't have required permissions
  if (requireAuth && isAuthenticated && !hasRouteAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Current role: <span className="font-medium">{userRole}</span>
            </p>
            <p className="text-xs text-gray-500">
              Required permissions: {routePermissions.join(', ')}
            </p>
          </div>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;