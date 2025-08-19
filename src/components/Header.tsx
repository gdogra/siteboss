import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, User, LogOut, Settings, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UserInfo {
  ID: number;
  Name: string;
  Email: string;
  CreateTime: string;
  Roles: string;
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const adminNavItems = [
  { name: 'Dashboard', href: '/admin-dashboard', icon: Home },
  { name: 'Lead Management', href: '/leads', icon: User },
  { name: 'Invoice Submission', href: '/invoice-submission', icon: Settings },
  { name: 'Payments', href: '/payments', icon: Settings }];


  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const checkAuthStatus = async () => {
    try {
      const response = await window.ezsite.apis.getUserInfo();
      if (!response.error && response.data) {
        setUserInfo(response.data);
        setIsLoggedIn(true);
      } else {
        setUserInfo(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      setUserInfo(null);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await window.ezsite.apis.logout();
      setUserInfo(null);
      setIsLoggedIn(false);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out'
      });
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplay = (roles: string) => {
    if (!roles) return 'User';

    const roleArray = roles.split(',');
    if (roleArray.includes('Administrator')) return 'Administrator';
    if (roleArray.includes('r-QpoZrh')) return 'Contractor';
    if (roleArray.includes('GeneralUser')) return 'General User';
    return 'User';
  };

  const getRoleColor = (roles: string) => {
    if (!roles) return 'bg-gray-100 text-gray-800';

    const roleArray = roles.split(',');
    if (roleArray.includes('Administrator')) return 'bg-red-100 text-red-800';
    if (roleArray.includes('r-QpoZrh')) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const isActive = (path: string) => location.pathname === path;

  // Don't show header on login page
  if (location.pathname === '/admin-login' || location.pathname === '/resetpassword') {
    return null;
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/admin-dashboard" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">LBD</span>
              </div>
              <div>
                <h1 className="font-semibold text-lg text-gray-900">Laguna Bay Development</h1>
                <p className="text-xs text-gray-600 -mt-1">Construction Management</p>
              </div>
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors hidden md:block">

              ← Back to Main Site
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isLoggedIn &&
          <nav className="hidden md:flex space-x-6">
              {adminNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-700'}`
                  }>

                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>);

            })}
            </nav>
          }

          {/* User Info and Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && userInfo ?
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {userInfo.Name?.slice(0, 2).toUpperCase() || userInfo.Email?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {userInfo.Name || userInfo.Email}
                    </span>
                    <Badge className={`text-xs ${getRoleColor(userInfo.Roles)}`}>
                      {getRoleDisplay(userInfo.Roles)}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div> :

            <Link to="/admin-login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            }
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-6 mt-8">
                {isLoggedIn && adminNavItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2 text-lg font-medium transition-colors hover:text-blue-600 ${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-700'}`
                      }>

                      <IconComponent className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>);

                })}
                
                <div className="pt-6 border-t space-y-4">
                  {isLoggedIn && userInfo ?
                  <>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {userInfo.Name?.slice(0, 2).toUpperCase() || userInfo.Email?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {userInfo.Name || userInfo.Email}
                          </p>
                          <Badge className={`text-xs ${getRoleColor(userInfo.Roles)}`}>
                            {getRoleDisplay(userInfo.Roles)}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </> :

                  <Link to="/admin-login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                  }
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>);

};

export default Header;