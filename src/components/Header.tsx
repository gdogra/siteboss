import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ScheduleVisitModal from '@/components/ScheduleVisitModal';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' }];


  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-12 h-12 luxury-gradient rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-heading font-bold text-lg">LB</span>
            </div>
            <div>
              <h1 className="font-heading font-semibold text-xl text-gray-900">Laguna Bay</h1>
              <p className="text-xs text-gray-600 -mt-1">Development</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) =>
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive(item.href) ? 'text-primary' : 'text-gray-700'}`
              }>

                {item.name}
              </Link>
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">Admin Portal</Button>
            </Link>
            <ScheduleVisitModal>
              <Button className="luxury-gradient text-white hover:opacity-90">
                Schedule Visit
              </Button>
            </ScheduleVisitModal>
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
                {navItems.map((item) =>
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-gray-700'}`
                  }>

                    {item.name}
                  </Link>
                )}
                <div className="pt-6 border-t space-y-4">
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Admin Portal</Button>
                  </Link>
                  <ScheduleVisitModal>
                    <Button className="w-full luxury-gradient text-white hover:opacity-90">
                      Schedule Visit
                    </Button>
                  </ScheduleVisitModal>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>);

};

export default Header;