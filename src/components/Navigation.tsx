import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Home, 
  FolderOpen, 
  Plus, 
  CreditCard,
  Settings,
  Bell,
  Users,
  MessageSquare,
  Bug
} from 'lucide-react';

interface NavigationProps {
  variant?: 'header' | 'sidebar';
}

const Navigation: React.FC<NavigationProps> = ({ variant = 'header' }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/projects/new', label: 'New Project', icon: Plus },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/tickets', label: 'Tickets', icon: Bug },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (variant === 'header') {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">SiteBoss</span>
              </Link>

              {isAuthenticated && (
                <nav className="hidden md:flex items-center space-x-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right Side - User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* User Profile */}
                  <UserProfile variant="dropdown" showCompany={true} />
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" asChild>
                    <Link to="/admin-login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/trial-signup">Start Free Trial</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden border-t bg-gray-50">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex flex-col items-center space-y-1 p-2 rounded-md text-xs transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  // Sidebar variant can be implemented later if needed
  return null;
};

export default Navigation;