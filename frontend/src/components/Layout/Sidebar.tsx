import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ClockIcon,
  XMarkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
  { name: 'My Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Time Tracking', href: '/time-tracking', icon: ClockIcon },
  { name: 'Budget & Expenses', href: '/budget', icon: CurrencyDollarIcon },
  { name: 'Contractors', href: '/contractors', icon: BuildingOfficeIcon, roles: ['company_admin', 'project_manager'] },
  { name: 'Team', href: '/team', icon: UsersIcon, roles: ['company_admin', 'project_manager'] },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['company_admin', 'project_manager'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['company_admin'] },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, onMobileMenuClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-gray-50 md:border-r md:border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-6 w-6 transition-colors`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden"
            onClick={onMobileMenuClose}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-gray-50 border-r border-gray-200 z-40 md:hidden">
            <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onMobileMenuClose}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onMobileMenuClose}
                      className={`${
                        isActive
                          ? 'bg-primary-100 border-primary-500 text-primary-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6 transition-colors`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;