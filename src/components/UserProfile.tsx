import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  Crown,
  Shield,
  Users,
  Building2,
  CreditCard,
  Bell,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UserProfileProps {
  variant?: 'dropdown' | 'sidebar' | 'header';
  showCompany?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  variant = 'dropdown',
  showCompany = true 
}) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Account settings state for toggles in Account Settings modal
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    projectUpdates: true,
    paymentAlerts: true,
    profileVisibility: true,
    activityStatus: true,
  });

  const handleSettingToggle = (key: keyof typeof accountSettings) => {
    setAccountSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'project_manager':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'contractor':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'client':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'project_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contractor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'client':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSubscriptionColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleSaveProfile = () => {
    updateUser({
      name: profileData.name,
      email: profileData.email,
      company: profileData.company
    });
    setEditingProfile(false);
    alert('Profile updated successfully!');
  };

  const handleNavigateToBilling = () => {
    navigate('/payments');
  };

  // Fix: Payment engine link from profile
  const handleChangePlan = () => {
    setShowBilling(false);
    navigate('/payments');
  };

  // Optional stubs to avoid undefined handlers in UI
  const handleCancelSubscription = () => {
    setShowBilling(false);
    navigate('/payments');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real app, this would request a signed URL or trigger a download
    alert(`Downloading invoice ${invoiceId}…`);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      alert('Account deletion flow is not implemented in this demo.');
    }
  };

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New lead received',
      message: 'Sarah Johnson submitted a kitchen renovation request',
      time: '2 hours ago',
      type: 'lead',
      unread: true
    },
    {
      id: '2',
      title: 'Payment received',
      message: 'ABC Development Corp paid invoice INV-001',
      time: '1 day ago',
      type: 'payment',
      unread: true
    },
    {
      id: '3',
      title: 'Project milestone completed',
      message: 'Foundation work completed for Downtown Office Building',
      time: '2 days ago',
      type: 'project',
      unread: false
    }
  ]);
  
  const unreadNotificationCount = notifications.filter(n => n.unread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      unread: false
    })));
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, unread: false }
        : notification
    ));
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // Here you would typically call an API to change the password
      console.log('Password change requested', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Password updated successfully');
    } catch (error) {
      console.error('Password change failed:', error);
      alert('Failed to update password');
    }
  };

  if (variant === 'dropdown') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-auto px-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  {user.subscription?.status === 'active' && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {unreadNotificationCount > 0 && (
                    <div className="absolute -top-2 -left-2 h-5 w-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-80" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </div>
                  {user.subscription && (
                    <Badge className={getSubscriptionColor(user.subscription.plan)}>
                      {user.subscription.plan}
                    </Badge>
                  )}
                </div>
                
                {showCompany && user.company && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Building2 className="w-3 h-3" />
                    <span>{user.company}</span>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setShowNotifications(true)}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={(e) => e.preventDefault()} className="flex items-center justify-between">
              <span>Theme</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ThemeToggle />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  Switch between light and dark mode
                </TooltipContent>
              </Tooltip>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setShowBilling(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Payments</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setShowAccountSettings(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Settings Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Profile Settings</h3>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <ThemeToggle />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        Toggle app theme (light/dark)
                      </TooltipContent>
                    </Tooltip>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowProfileModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      ×
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Profile Info */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingProfile(!editingProfile)}
                        >
                          {editingProfile ? 'Cancel' : 'Edit'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        {user.avatar ? (
                          <img
                            className="h-16 w-16 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-xl font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          {editingProfile ? (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input
                                  id="edit-name"
                                  value={profileData.name}
                                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={profileData.email}
                                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-company">Company</Label>
                                <Input
                                  id="edit-company"
                                  value={profileData.company}
                                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveProfile}>
                                  Save Changes
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h4 className="text-lg font-medium">{user.name}</h4>
                              <p className="text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {getRoleIcon(user.role)}
                                <Badge variant="outline" className={getRoleColor(user.role)}>
                                  {user.role.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {user.company && !editingProfile && (
                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{user.company}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Subscription Info */}
                  {user.subscription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Subscription</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge className={getSubscriptionColor(user.subscription.plan)}>
                              {user.subscription.plan.toUpperCase()}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: <span className="capitalize">{user.subscription.status}</span>
                            </p>
                            {user.subscription.expiresAt && (
                              <p className="text-xs text-gray-500">
                                Expires: {new Date(user.subscription.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Manage Billing
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Permissions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {user.permissions.map((permission, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="capitalize">{permission.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProfileModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Modal */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Notifications</h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                        notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium ${
                                notification.unread ? 'text-gray-900' : 'text-gray-700'
                              }`}>{notification.title}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={markAllNotificationsAsRead}
                    disabled={unreadNotificationCount === 0}
                  >
                    Mark All as Read ({unreadNotificationCount})
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNotifications(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Modal */}
        {showBilling && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Billing & Payments</h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowBilling(false)}
                    title="Close"
                    data-tooltip="Close"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Current Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge className={`${getSubscriptionColor(user.subscription?.plan || 'free')} text-sm`}>
                              {(user.subscription?.plan || 'free').toUpperCase()}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: <span className={`capitalize ${
                                user.subscription?.status === 'active' ? 'text-green-600' :
                                user.subscription?.status === 'cancelled' ? 'text-orange-600' :
                                'text-red-600'
                              }`}>{user.subscription?.status || 'inactive'}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {user.subscription?.plan === 'enterprise' ? '$199.99' :
                               user.subscription?.plan === 'professional' ? '$99.99' :
                               user.subscription?.plan === 'basic' ? '$49.99' : '$0.00'}/month
                            </p>
                            <p className="text-xs text-gray-500">Billed monthly</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Next billing date: {user.subscription?.nextBilling ? new Date(user.subscription.nextBilling).toLocaleDateString() : 'N/A'}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleChangePlan}
                          >
                            Change Plan
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleCancelSubscription}
                            disabled={user.subscription?.status === 'cancelled'}
                            className={user.subscription?.status === 'cancelled' ? 'opacity-50' : ''}
                          >
                            {user.subscription?.status === 'cancelled' ? 'Cancelled' : 'Cancel Subscription'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              •••• •••• •••• {user.subscription?.paymentMethod?.last4 || '****'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.subscription?.paymentMethod?.brand?.toUpperCase() || 'VISA'} • Expires {user.subscription?.paymentMethod?.expMonth || '**'}/{user.subscription?.paymentMethod?.expYear || '**'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert('Payment method update coming soon!')}
                        >
                          Update
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Invoices */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(user.subscription?.invoices || []).map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between py-2 border-b">
                            <div>
                              <p className="font-medium">{invoice.id}</p>
                              <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right flex items-center space-x-2">
                              <div>
                                <p className="font-medium">{invoice.amount}</p>
                                <Badge variant="outline" className={`text-xs ${
                                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                className="h-8 w-8 p-0"
                              >
                                ↓
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        View All Invoices
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBilling(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Modal */}
        {showAccountSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Account Settings</h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowAccountSettings(false)}
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Security Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                      </div>
                      <Button 
                        size="sm"
                        onClick={handlePasswordChange}
                        disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      >
                        Update Password
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch 
                          id="email-notifications" 
                          checked={accountSettings.emailNotifications}
                          onCheckedChange={() => handleSettingToggle('emailNotifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notifications">SMS Notifications</Label>
                          <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                        </div>
                        <Switch 
                          id="sms-notifications" 
                          checked={accountSettings.smsNotifications}
                          onCheckedChange={() => handleSettingToggle('smsNotifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="project-updates">Project Updates</Label>
                          <p className="text-sm text-gray-500">Notifications for project milestone updates</p>
                        </div>
                        <Switch 
                          id="project-updates" 
                          checked={accountSettings.projectUpdates}
                          onCheckedChange={() => handleSettingToggle('projectUpdates')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="payment-alerts">Payment Alerts</Label>
                          <p className="text-sm text-gray-500">Notifications for payments and invoices</p>
                        </div>
                        <Switch 
                          id="payment-alerts" 
                          checked={accountSettings.paymentAlerts}
                          onCheckedChange={() => handleSettingToggle('paymentAlerts')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Privacy Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Privacy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profile-visibility">Profile Visibility</Label>
                          <p className="text-sm text-gray-500">Make profile visible to team members</p>
                        </div>
                        <Switch 
                          id="profile-visibility" 
                          checked={accountSettings.profileVisibility}
                          onCheckedChange={() => handleSettingToggle('profileVisibility')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="activity-status">Activity Status</Label>
                          <p className="text-sm text-gray-500">Show when you're online</p>
                        </div>
                        <Switch 
                          id="activity-status" 
                          checked={accountSettings.activityStatus}
                          onCheckedChange={() => handleSettingToggle('activityStatus')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-3">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleDeleteAccount}
                        >
                          Delete My Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAccountSettings(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Other variants can be implemented as needed
  return null;
};

export default UserProfile;
