import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  Menu,
  Bell,
  Settings,
  Users,
  FileText,
  BarChart3,
  LogOut,
  ChevronDown,
  Palette,
  Globe } from
'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant } = useTenant();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (!error && data) {
        setUser(data);
      }
    } catch (error) {
      console.log('User not logged in');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await window.ezsite.apis.logout();
      if (error) throw error;

      setUser(null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of SiteBoss."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigationItems = [
  { label: 'Dashboard', path: '/admin-dashboard', icon: BarChart3 },
  { label: 'Projects', path: '/admin-dashboard', icon: Building2 },
  { label: 'Team', path: '/admin-dashboard', icon: Users },
  { label: 'Documents', path: '/admin-dashboard', icon: FileText },
  { label: 'Leads', path: '/leads', icon: Users },
  { label: 'Payments', path: '/payments', icon: FileText },
  { label: 'Inventory', path: '/inventory', icon: Building2 },
  { label: 'Proposals', path: '/proposals', icon: FileText },
  { label: 'Permits', path: '/permits', icon: FileText },
  { label: 'Time Tracking', path: '/time-tracking', icon: FileText },
  { label: 'Subscriptions', path: '/subscriptions', icon: Settings }];


  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{
                background: tenant?.primary_color ?
                `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.accent_color || tenant.primary_color})` :
                'linear-gradient(135deg, #0f172a, #3b82f6)'
              }}>

              {tenant?.logo_url ?
              <img src={tenant.logo_url} alt="Logo" className="w-8 h-8 rounded" /> :

              <Building2 className="w-6 h-6" />
              }
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {tenant?.branding?.company_name || 'SiteBoss'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {tenant?.branding?.tagline || 'Construction Management Platform'}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems.slice(0, 6).map((item) =>
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActivePath(item.path) ?
            'bg-blue-100 text-blue-700' :
            'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
            }>

              {item.label}
            </Link>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notifications > 0 &&
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 text-white">
                {notifications}
              </Badge>
            }
          </Button>

          {/* User Menu */}
          {user ?
          <div className="flex items-center space-x-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900">{user.Name}</p>
                <p className="text-xs text-slate-500">{user.Email}</p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {user.Name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900">

                <LogOut className="w-4 h-4" />
              </Button>
            </div> :

          <div className="flex items-center space-x-2">
              <Button
              variant="ghost"
              onClick={() => navigate('/admin-login')}
              className="text-slate-600 hover:text-slate-900">

                Sign In
              </Button>
              <Button
              onClick={() => navigate('/trial-signup')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">

                Free Trial
              </Button>
            </div>
          }

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{
                      background: tenant?.primary_color ?
                      `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.accent_color || tenant.primary_color})` :
                      'linear-gradient(135deg, #0f172a, #3b82f6)'
                    }}>

                    <Building2 className="w-5 h-5" />
                  </div>
                  <span>{tenant?.branding?.company_name || 'SiteBoss'}</span>
                </SheetTitle>
                <SheetDescription>
                  {tenant?.branding?.tagline || 'Construction Management Platform'}
                </SheetDescription>
              </SheetHeader>

              <nav className="mt-8">
                <div className="space-y-2">
                  {navigationItems.map((item) =>
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path) ?
                    'bg-blue-100 text-blue-700' :
                    'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`
                    }>

                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                  <div className="border-t border-slate-200 my-4"></div>
                  <Link
                    to="/tenant-management"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100">

                    <Palette className="w-4 h-4" />
                    <span>Branding</span>
                  </Link>
                  <Link
                    to="/tenant-management"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100">

                    <Globe className="w-4 h-4" />
                    <span>Multi-Tenant</span>
                  </Link>
                </div>
              </nav>

              {/* Mobile User Section */}
              {user &&
              <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        {user.Name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{user.Name}</p>
                      <p className="text-xs text-slate-500">{user.Email}</p>
                    </div>
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-slate-900">

                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              }
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>);

};

export default Header;