
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Globe,
  Shield,
  Bell,
  Mail,
  Server,
  AlertCircle } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  backupEnabled: boolean;
  debugMode: boolean;
  maxUsers: number;
  sessionTimeout: number;
  apiRateLimit: number;
  logLevel: string;
  defaultUserRole: string;
}

const SystemConfigurationPanel = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'ContractPro Platform',
    siteDescription: 'Enterprise contracting management platform',
    adminEmail: 'admin@contractpro.com',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    backupEnabled: true,
    debugMode: false,
    maxUsers: 1000,
    sessionTimeout: 30,
    apiRateLimit: 1000,
    logLevel: 'info',
    defaultUserRole: 'GeneralUser'
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to a system_settings table
      // For now, we'll simulate the save operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSaved(new Date());
      toast({
        title: "Configuration Saved",
        description: "System configuration has been updated successfully."
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save system configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      siteName: 'ContractPro Platform',
      siteDescription: 'Enterprise contracting management platform',
      adminEmail: 'admin@contractpro.com',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      backupEnabled: true,
      debugMode: false,
      maxUsers: 1000,
      sessionTimeout: 30,
      apiRateLimit: 1000,
      logLevel: 'info',
      defaultUserRole: 'GeneralUser'
    });
    toast({
      title: "Reset Complete",
      description: "Configuration has been reset to defaults"
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Configuration
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastSaved &&
            <span className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            }
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveConfiguration} disabled={saving} size="sm">
              <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Server className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={config.siteName}
                  onChange={(e) => handleConfigChange('siteName', e.target.value)}
                  placeholder="Enter site name" />

              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={config.siteDescription}
                  onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
                  placeholder="Enter site description"
                  rows={3} />

              </div>
              
              <div>
                <Label htmlFor="adminEmail">Administrator Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={config.adminEmail}
                  onChange={(e) => handleConfigChange('adminEmail', e.target.value)}
                  placeholder="admin@example.com" />

              </div>

              <div>
                <Label htmlFor="defaultUserRole">Default User Role</Label>
                <Select
                  value={config.defaultUserRole}
                  onValueChange={(value) => handleConfigChange('defaultUserRole', value)}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select default role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GeneralUser">General User</SelectItem>
                    <SelectItem value="r-QpoZrh">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registrationEnabled">User Registration</Label>
                  <p className="text-sm text-gray-600">Allow new users to register</p>
                </div>
                <Switch
                  id="registrationEnabled"
                  checked={config.registrationEnabled}
                  onCheckedChange={(checked) => handleConfigChange('registrationEnabled', checked)} />

              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Temporarily disable site access</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)} />

              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={config.sessionTimeout}
                  onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))} />

              </div>

              <div>
                <Label htmlFor="maxUsers">Maximum Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={config.maxUsers}
                  onChange={(e) => handleConfigChange('maxUsers', parseInt(e.target.value))} />

              </div>

              {config.maintenanceMode &&
              <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Maintenance mode is enabled. Users will not be able to access the site.
                  </AlertDescription>
                </Alert>
              }
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send system notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={config.emailNotifications}
                  onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)} />

              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Settings</h4>
                <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Alerts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Updates</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Registration</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Reports</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backupEnabled">Automatic Backups</Label>
                  <p className="text-sm text-gray-600">Enable scheduled system backups</p>
                </div>
                <Switch
                  id="backupEnabled"
                  checked={config.backupEnabled}
                  onCheckedChange={(checked) => handleConfigChange('backupEnabled', checked)} />

              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                </div>
                <Switch
                  id="debugMode"
                  checked={config.debugMode}
                  onCheckedChange={(checked) => handleConfigChange('debugMode', checked)} />

              </div>

              <div>
                <Label htmlFor="logLevel">Log Level</Label>
                <Select
                  value={config.logLevel}
                  onValueChange={(value) => handleConfigChange('logLevel', value)}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select log level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  min="100"
                  max="10000"
                  value={config.apiRateLimit}
                  onChange={(e) => handleConfigChange('apiRateLimit', parseInt(e.target.value))} />

              </div>

              {config.debugMode &&
              <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Debug mode is enabled. This may impact performance and should not be used in production.
                  </AlertDescription>
                </Alert>
              }
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>);

};

export default SystemConfigurationPanel;