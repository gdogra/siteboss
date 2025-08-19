
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  FolderOpen, 
  FileText, 
  Upload, 
  MessageSquare, 
  LogOut, 
  Menu,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientPortalLayoutProps {
  children: React.ReactNode;
}

const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const { data: userInfo, error } = await window.ezsite.apis.getUserInfo();
      if (error) throw new Error(error);
      setUser(userInfo);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      navigate('/client/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await window.ezsite.apis.logout();
      if (error) throw new Error(error);
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the client portal.",
      });
      
      navigate('/client/login');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigationItems = [
    { path: '/client/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/client/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/client/invoices', icon: FileText, label: 'Invoices' },
    { path: '/client/documents', icon: Upload, label: 'Documents' },
    { path: '/client/messages', icon: MessageSquare, label: 'Messages' },
  ];

  const NavigationContent = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === item.path
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-6">Client Portal</h2>
                  <NavigationContent />
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/client/dashboard" className="text-xl font-bold text-primary">
              Client Portal
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.Name || user.Email}</p>
                  <Badge variant="secondary" className="text-xs">Client</Badge>
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 bg-card rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-6">Navigation</h2>
            <NavigationContent />
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-card rounded-lg border p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalLayout;
