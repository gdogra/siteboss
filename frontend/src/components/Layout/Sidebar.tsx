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
  BuildingOfficeIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UserIcon,
  FunnelIcon,
  ChatBubbleLeftEllipsisIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../contexts/RBACContext';
import { useTenant } from '../../contexts/TenantContext';
import { Permission } from '../../types/permissions';
import RoleIndicator from '../UI/RoleIndicator';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permissions?: Permission[];
  roles?: string[]; // Keep for backward compatibility
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Leads', href: '/leads', icon: UserPlusIcon },
  { name: 'Sales Pipeline', href: '/pipeline', icon: FunnelIcon },
  { name: 'Contacts & Communications', href: '/contacts', icon: UserIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Projects', href: '/projects', icon: FolderOpenIcon, permissions: [Permission.PROJECT_VIEW] },
  { name: 'My Tasks', href: '/tasks', icon: CheckCircleIcon },
  { name: 'Time Tracking', href: '/time-tracking', icon: ClockIcon, permissions: [Permission.TIME_VIEW, Permission.TIME_TRACK] },
  { name: 'Budget & Expenses', href: '/budget', icon: CurrencyDollarIcon, permissions: [Permission.BUDGET_VIEW] },
  { name: 'Contractors', href: '/contractors', icon: BuildingOfficeIcon, permissions: [Permission.CONTRACTOR_VIEW] },
  { name: 'Resources', href: '/resources', icon: WrenchScrewdriverIcon, permissions: [Permission.PROJECT_VIEW] },
  { name: 'Team', href: '/team', icon: UsersIcon, permissions: [Permission.TEAM_VIEW] },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon, permissions: [Permission.DOCUMENT_VIEW] },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, permissions: [Permission.REPORT_VIEW] },
  { name: 'Settings', href: '/settings', icon: CogIcon, permissions: [Permission.SETTINGS_VIEW] },
  { name: 'Billing & Plans', href: '/subscription-plans', icon: CreditCardIcon },
  { name: 'Tenant Settings', href: '/tenant-settings', icon: BuildingStorefrontIcon, permissions: [Permission.ADMIN_PANEL] },
  { name: 'Administration', href: '/admin', icon: ShieldCheckIcon, permissions: [Permission.ADMIN_PANEL] },
];

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, onMobileMenuClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { hasAnyPermission, canAccessRoute } = useRBAC();
  const { tenant, getTenantFeature } = useTenant();

  const filteredNavigation = navigation.filter(item => {
    // If no permissions specified, show to all authenticated users
    if (!item.permissions && !item.roles) {
      // Check tenant feature access for core CRM features
      if (item.href === '/analytics' && !getTenantFeature('advancedAnalytics')) {
        return false;
      }
      return true;
    }
    
    // Check permissions first (new system)
    if (item.permissions) {
      const hasPermission = hasAnyPermission(item.permissions);
      
      // Additional tenant feature checks
      if (hasPermission && item.href === '/analytics' && !getTenantFeature('advancedAnalytics')) {
        return false;
      }
      
      return hasPermission;
    }
    
    // Fallback to roles (backward compatibility)
    if (item.roles) {
      return user && item.roles.includes(user.role);
    }
    
    return true;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-gray-50 md:border-r md:border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Tenant & User Profile Section */}
          <div className="px-4 mb-6 space-y-4">
            {/* Tenant Info */}
            {tenant && (
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-center space-x-2">
                  <BuildingStorefrontIcon className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-900">{tenant.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    tenant.subscription.plan === 'starter' ? 'bg-blue-100 text-blue-800' :
                    tenant.subscription.plan === 'professional' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tenant.subscription.plan.charAt(0).toUpperCase() + tenant.subscription.plan.slice(1)}
                  </span>
                  <span className="text-xs text-primary-700">{tenant.subdomain}</span>
                </div>
              </div>
            )}
            
            {/* User Profile */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <div className="mt-1">
                  <RoleIndicator />
                </div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-2 space-y-1">
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