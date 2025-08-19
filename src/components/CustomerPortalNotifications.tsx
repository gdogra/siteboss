
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Monitor,
  Clock,
  Users,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle,
  Settings,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  id?: number;
  user_id: number;
  notification_type: string;
  category: string;
  is_enabled: boolean;
  frequency: string;
  delivery_time: string;
  created_at?: string;
  updated_at?: string;
}

interface NotificationCategory {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultEnabled: boolean;
  types: string[];
}

const CustomerPortalNotifications: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const notificationTypes = [
    { key: 'email', name: 'Email', icon: <Mail className="h-4 w-4" /> },
    { key: 'sms', name: 'SMS', icon: <Phone className="h-4 w-4" /> },
    { key: 'push', name: 'Push', icon: <Smartphone className="h-4 w-4" /> },
    { key: 'in_app', name: 'In-App', icon: <Bell className="h-4 w-4" /> }
  ];

  const categories: NotificationCategory[] = [
    {
      key: 'system',
      name: 'System Notifications',
      description: 'Important system updates and maintenance notifications',
      icon: <Monitor className="h-5 w-5" />,
      defaultEnabled: true,
      types: ['email', 'in_app']
    },
    {
      key: 'billing',
      name: 'Billing & Payments',
      description: 'Invoice notifications, payment confirmations, and billing updates',
      icon: <CreditCard className="h-5 w-5" />,
      defaultEnabled: true,
      types: ['email', 'sms', 'in_app']
    },
    {
      key: 'feature_updates',
      name: 'Feature Updates',
      description: 'New features, improvements, and product announcements',
      icon: <CheckCircle className="h-5 w-5" />,
      defaultEnabled: true,
      types: ['email', 'in_app']
    },
    {
      key: 'security',
      name: 'Security Alerts',
      description: 'Login alerts, password changes, and security notifications',
      icon: <AlertTriangle className="h-5 w-5" />,
      defaultEnabled: true,
      types: ['email', 'sms']
    },
    {
      key: 'user_activity',
      name: 'User Activity',
      description: 'User invitations, role changes, and team notifications',
      icon: <Users className="h-5 w-5" />,
      defaultEnabled: false,
      types: ['email', 'in_app']
    },
    {
      key: 'marketing',
      name: 'Marketing Communications',
      description: 'Promotional emails, newsletters, and marketing content',
      icon: <MessageSquare className="h-5 w-5" />,
      defaultEnabled: false,
      types: ['email']
    }
  ];

  const frequencies = [
    { key: 'immediate', name: 'Immediately' },
    { key: 'daily', name: 'Daily Digest' },
    { key: 'weekly', name: 'Weekly Summary' },
    { key: 'monthly', name: 'Monthly Report' }
  ];

  const deliveryTimes = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const { data: userInfo, error: userError } = await window.ezsite.apis.getUserInfo();
      if (userError) throw new Error(userError);

      const { data: prefsData, error } = await window.ezsite.apis.tablePage(35463, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userInfo.ID }
        ]
      });

      if (!error && prefsData?.List) {
        setPreferences(prefsData.List);
      } else {
        // Create default preferences
        await createDefaultPreferences(userInfo.ID);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading preferences',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultPreferences = async (userId: number) => {
    const defaultPrefs: NotificationPreference[] = [];

    for (const category of categories) {
      for (const type of category.types) {
        defaultPrefs.push({
          user_id: userId,
          notification_type: type,
          category: category.key,
          is_enabled: category.defaultEnabled,
          frequency: 'immediate',
          delivery_time: '09:00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    try {
      for (const pref of defaultPrefs) {
        await window.ezsite.apis.tableCreate(35463, pref);
      }
      setPreferences(defaultPrefs);
    } catch (error) {
      console.error('Failed to create default preferences:', error);
    }
  };

  const updatePreference = async (category: string, type: string, field: string, value: any) => {
    try {
      const existingPref = preferences.find(p => p.category === category && p.notification_type === type);
      
      if (existingPref) {
        const updatedPref = { ...existingPref, [field]: value, updated_at: new Date().toISOString() };
        
        await window.ezsite.apis.tableUpdate(35463, {
          ID: existingPref.id,
          ...updatedPref
        });

        setPreferences(prev => prev.map(p => 
          p.id === existingPref.id ? updatedPref : p
        ));
      } else {
        // Create new preference
        const { data: userInfo } = await window.ezsite.apis.getUserInfo();
        const newPref: NotificationPreference = {
          user_id: userInfo.ID,
          notification_type: type,
          category: category,
          is_enabled: field === 'is_enabled' ? value : true,
          frequency: field === 'frequency' ? value : 'immediate',
          delivery_time: field === 'delivery_time' ? value : '09:00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await window.ezsite.apis.tableCreate(35463, newPref);
        setPreferences(prev => [...prev, newPref]);
      }

      // Track the preference change
      await trackNotificationEvent('preference_updated', { 
        category, 
        type, 
        field, 
        value 
      });

    } catch (error: any) {
      toast({
        title: 'Error updating preference',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const bulkUpdateCategory = async (category: string, enabled: boolean) => {
    try {
      const categoryPrefs = preferences.filter(p => p.category === category);
      
      for (const pref of categoryPrefs) {
        await updatePreference(category, pref.notification_type, 'is_enabled', enabled);
      }

      toast({
        title: enabled ? 'Category enabled' : 'Category disabled',
        description: `All notifications for "${categories.find(c => c.key === category)?.name}" have been ${enabled ? 'enabled' : 'disabled'}.`
      });

      await trackNotificationEvent('bulk_category_update', { 
        category, 
        enabled 
      });

    } catch (error: any) {
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const saveAllPreferences = async () => {
    setIsSaving(true);
    try {
      toast({
        title: 'Preferences saved',
        description: 'All notification preferences have been saved successfully.'
      });

      await trackNotificationEvent('preferences_saved', {});

    } catch (error: any) {
      toast({
        title: 'Error saving preferences',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const trackNotificationEvent = async (eventType: string, eventData: any) => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();
      await window.ezsite.apis.tableCreate(35465, {
        customer_id: 1,
        user_id: userInfo?.ID,
        event_type: eventType,
        event_data: JSON.stringify(eventData),
        timestamp: new Date().toISOString(),
        session_id: `session_${Date.now()}`,
        ip_address: '0.0.0.0',
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to track notification event:', error);
    }
  };

  const getPreference = (category: string, type: string): NotificationPreference | null => {
    return preferences.find(p => p.category === category && p.notification_type === type) || null;
  };

  const isCategoryEnabled = (category: string): boolean => {
    const categoryPrefs = preferences.filter(p => p.category === category);
    return categoryPrefs.some(p => p.is_enabled);
  };

  const getEnabledTypesCount = (category: string): number => {
    return preferences.filter(p => p.category === category && p.is_enabled).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Preferences</h2>
          <p className="text-muted-foreground">
            Configure how and when you want to receive notifications
          </p>
        </div>
        <Button onClick={saveAllPreferences} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable All Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on all notification categories and types
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                categories.forEach(category => {
                  bulkUpdateCategory(category.key, true);
                });
              }}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Enable All
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Disable All Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn off all notification categories and types
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                categories.forEach(category => {
                  bulkUpdateCategory(category.key, false);
                });
              }}
            >
              <VolumeX className="h-4 w-4 mr-2" />
              Disable All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isCategoryEnabled(category.key) ? 'default' : 'secondary'}>
                    {getEnabledTypesCount(category.key)} active
                  </Badge>
                  <Switch
                    checked={isCategoryEnabled(category.key)}
                    onCheckedChange={(checked) => bulkUpdateCategory(category.key, checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Notification Types */}
                <div className="grid gap-4">
                  {category.types.map((typeKey) => {
                    const type = notificationTypes.find(t => t.key === typeKey);
                    const pref = getPreference(category.key, typeKey);
                    
                    if (!type) return null;

                    return (
                      <div key={typeKey} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            {type.icon}
                          </div>
                          <div>
                            <Label className="text-base">{type.name}</Label>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {pref?.is_enabled && typeKey === 'email' && (
                            <>
                              <Select 
                                value={pref.frequency} 
                                onValueChange={(value) => updatePreference(category.key, typeKey, 'frequency', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {frequencies.map(freq => (
                                    <SelectItem key={freq.key} value={freq.key}>
                                      {freq.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {(pref.frequency === 'daily' || pref.frequency === 'weekly') && (
                                <Select 
                                  value={pref.delivery_time} 
                                  onValueChange={(value) => updatePreference(category.key, typeKey, 'delivery_time', value)}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {deliveryTimes.map(time => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </>
                          )}
                          
                          <Switch
                            checked={pref?.is_enabled || false}
                            onCheckedChange={(checked) => updatePreference(category.key, typeKey, 'is_enabled', checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Delivery Time</Label>
              <Select defaultValue="09:00">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliveryTimes.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select defaultValue="UTC">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">EST</SelectItem>
                  <SelectItem value="PST">PST</SelectItem>
                  <SelectItem value="CST">CST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Do Not Disturb Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable all non-critical notifications
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Weekend Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications during weekends
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPortalNotifications;
