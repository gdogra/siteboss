
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plug,
  Plus,
  Settings,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Webhook,
  Key,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  FileText,
  BarChart,
  Users,
  Lock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id?: number;
  integration_name: string;
  integration_type: string;
  config_data: string;
  is_active: boolean;
  api_key?: string;
  webhook_url?: string;
  last_sync?: string;
  sync_status: string;
  created_at?: string;
  updated_at?: string;
}

interface IntegrationType {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  configFields: ConfigField[];
  webhookSupport: boolean;
  authType: 'api_key' | 'oauth' | 'webhook' | 'custom';
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'textarea' | 'select';
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

const CustomerPortalIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    integration_name: '',
    integration_type: '',
    config_data: '{}',
    is_active: false,
    sync_status: 'pending'
  });

  const integrationTypes: IntegrationType[] = [
    {
      key: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and billing integration',
      icon: <CreditCard className="h-6 w-6" />,
      category: 'payments',
      webhookSupport: true,
      authType: 'api_key',
      configFields: [
        { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
        { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
        { key: 'webhook_endpoint_secret', label: 'Webhook Endpoint Secret', type: 'password', required: false }
      ]
    },
    {
      key: 'mailgun',
      name: 'Mailgun',
      description: 'Email delivery and automation',
      icon: <Mail className="h-6 w-6" />,
      category: 'email',
      webhookSupport: true,
      authType: 'api_key',
      configFields: [
        { key: 'api_key', label: 'API Key', type: 'password', required: true },
        { key: 'domain', label: 'Domain', type: 'text', required: true },
        { key: 'region', label: 'Region', type: 'select', required: true, options: [
          { value: 'us', label: 'US' },
          { value: 'eu', label: 'EU' }
        ]}
      ]
    },
    {
      key: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: <MessageSquare className="h-6 w-6" />,
      category: 'communication',
      webhookSupport: true,
      authType: 'webhook',
      configFields: [
        { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
        { key: 'channel', label: 'Default Channel', type: 'text', required: false, placeholder: '#general' }
      ]
    },
    {
      key: 'google_calendar',
      name: 'Google Calendar',
      description: 'Calendar integration and scheduling',
      icon: <Calendar className="h-6 w-6" />,
      category: 'productivity',
      webhookSupport: false,
      authType: 'oauth',
      configFields: [
        { key: 'calendar_id', label: 'Calendar ID', type: 'text', required: true },
        { key: 'time_zone', label: 'Time Zone', type: 'select', required: true, options: [
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'America/Chicago', label: 'Central Time' },
          { value: 'America/Denver', label: 'Mountain Time' },
          { value: 'America/Los_Angeles', label: 'Pacific Time' }
        ]}
      ]
    },
    {
      key: 'zapier',
      name: 'Zapier',
      description: 'Workflow automation and app connections',
      icon: <Plug className="h-6 w-6" />,
      category: 'automation',
      webhookSupport: true,
      authType: 'webhook',
      configFields: [
        { key: 'webhook_url', label: 'Zapier Webhook URL', type: 'url', required: true }
      ]
    },
    {
      key: 'analytics',
      name: 'Google Analytics',
      description: 'Website and app analytics tracking',
      icon: <BarChart className="h-6 w-6" />,
      category: 'analytics',
      webhookSupport: false,
      authType: 'api_key',
      configFields: [
        { key: 'tracking_id', label: 'Tracking ID', type: 'text', required: true, placeholder: 'GA-XXXXXXXXX-X' },
        { key: 'property_id', label: 'Property ID', type: 'text', required: true }
      ]
    }
  ];

  const categories = [
    { key: 'all', name: 'All Integrations', count: integrationTypes.length },
    { key: 'payments', name: 'Payments', count: integrationTypes.filter(t => t.category === 'payments').length },
    { key: 'email', name: 'Email', count: integrationTypes.filter(t => t.category === 'email').length },
    { key: 'communication', name: 'Communication', count: integrationTypes.filter(t => t.category === 'communication').length },
    { key: 'productivity', name: 'Productivity', count: integrationTypes.filter(t => t.category === 'productivity').length },
    { key: 'automation', name: 'Automation', count: integrationTypes.filter(t => t.category === 'automation').length },
    { key: 'analytics', name: 'Analytics', count: integrationTypes.filter(t => t.category === 'analytics').length }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: integrationsData, error } = await window.ezsite.apis.tablePage(35453, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (!error && integrationsData?.List) {
        setIntegrations(integrationsData.List);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading integrations',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (integrationType: IntegrationType) => {
    try {
      const integration: Integration = {
        integration_name: integrationType.name,
        integration_type: integrationType.key,
        config_data: '{}',
        is_active: false,
        sync_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableCreate(35453, integration);

      toast({
        title: 'Integration added',
        description: `${integrationType.name} integration has been added. Configure it to start using.`
      });

      await loadIntegrations();
      await trackIntegrationEvent('integration_created', integrationType.key);

    } catch (error: any) {
      toast({
        title: 'Error creating integration',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateIntegration = async (integration: Integration) => {
    try {
      const updatedIntegration = {
        ...integration,
        updated_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableUpdate(35453, {
        ID: integration.id,
        ...updatedIntegration
      });

      toast({
        title: 'Integration updated',
        description: 'Integration configuration has been saved successfully.'
      });

      await loadIntegrations();
      await trackIntegrationEvent('integration_updated', integration.integration_type);

    } catch (error: any) {
      toast({
        title: 'Error updating integration',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    const updatedIntegration = { ...integration, is_active: !integration.is_active };
    await updateIntegration(updatedIntegration);
    await trackIntegrationEvent('integration_toggled', integration.integration_type, {
      new_state: !integration.is_active
    });
  };

  const testConnection = async (integration: Integration) => {
    setTestingConnection(integration.id?.toString() || '');
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedIntegration = { 
        ...integration, 
        sync_status: 'connected',
        last_sync: new Date().toISOString()
      };
      
      await updateIntegration(updatedIntegration);
      
      toast({
        title: 'Connection successful',
        description: `Successfully connected to ${integration.integration_name}.`
      });

      await trackIntegrationEvent('connection_tested', integration.integration_type, {
        success: true
      });

    } catch (error: any) {
      const updatedIntegration = { 
        ...integration, 
        sync_status: 'error'
      };
      
      await updateIntegration(updatedIntegration);

      toast({
        title: 'Connection failed',
        description: error.message || 'Failed to connect to the integration.',
        variant: 'destructive'
      });

      await trackIntegrationEvent('connection_tested', integration.integration_type, {
        success: false,
        error: error.message
      });

    } finally {
      setTestingConnection(null);
    }
  };

  const trackIntegrationEvent = async (eventType: string, integrationType: string, additionalData?: any) => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();
      await window.ezsite.apis.tableCreate(35465, {
        customer_id: 1,
        user_id: userInfo?.ID,
        event_type: eventType,
        event_data: JSON.stringify({ 
          integration_type: integrationType, 
          ...additionalData 
        }),
        timestamp: new Date().toISOString(),
        session_id: `session_${Date.now()}`,
        ip_address: '0.0.0.0',
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to track integration event:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The text has been copied to your clipboard.'
    });
  };

  const filteredIntegrationTypes = selectedCategory === 'all' 
    ? integrationTypes 
    : integrationTypes.filter(t => t.category === selectedCategory);

  const activeIntegrations = integrations.filter(i => i.is_active);
  const connectedIntegrations = integrations.filter(i => i.sync_status === 'connected');

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
          <h2 className="text-2xl font-bold tracking-tight">Integration Settings</h2>
          <p className="text-muted-foreground">
            Connect your portal with external services and tools
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeIntegrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{connectedIntegrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Plus className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{integrationTypes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-3xl grid-cols-7">
            {categories.map(category => (
              <TabsTrigger key={category.key} value={category.key} className="text-xs">
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Current Integrations */}
          {integrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {integrations.map(integration => {
                    const integrationType = integrationTypes.find(t => t.key === integration.integration_type);
                    
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {integrationType?.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{integration.integration_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last sync: {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(integration.sync_status)}
                          
                          <Switch
                            checked={integration.is_active}
                            onCheckedChange={() => toggleIntegration(integration)}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(integration)}
                            disabled={testingConnection === integration.id?.toString()}
                          >
                            {testingConnection === integration.id?.toString() ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plug className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setShowConfigDialog(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrationTypes.map(integrationType => {
                  const existingIntegration = integrations.find(i => i.integration_type === integrationType.key);
                  
                  return (
                    <div key={integrationType.key} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {integrationType.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{integrationType.name}</h3>
                            <Badge variant="outline" className="mt-1">
                              {integrationType.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {integrationType.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {integrationType.authType === 'api_key' && (
                          <Badge variant="secondary">
                            <Key className="h-3 w-3 mr-1" />
                            API Key
                          </Badge>
                        )}
                        {integrationType.webhookSupport && (
                          <Badge variant="secondary">
                            <Webhook className="h-3 w-3 mr-1" />
                            Webhooks
                          </Badge>
                        )}
                      </div>
                      
                      <Button
                        className="w-full"
                        variant={existingIntegration ? "outline" : "default"}
                        onClick={() => {
                          if (existingIntegration) {
                            setSelectedIntegration(existingIntegration);
                            setShowConfigDialog(true);
                          } else {
                            createIntegration(integrationType);
                          }
                        }}
                      >
                        {existingIntegration ? (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Integration
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.integration_name}</DialogTitle>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-6">
              {/* Integration Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        Integration is {selectedIntegration.is_active ? 'active' : 'inactive'}
                      </p>
                    </div>
                    {getStatusBadge(selectedIntegration.sync_status)}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configuration</h3>
                
                {/* This would be dynamically generated based on integrationType.configFields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey[selectedIntegration.id?.toString() || ''] ? 'text' : 'password'}
                        placeholder="Enter your API key"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(prev => ({
                          ...prev,
                          [selectedIntegration.id?.toString() || '']: !prev[selectedIntegration.id?.toString() || '']
                        }))}
                      >
                        {showApiKey[selectedIntegration.id?.toString() || ''] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={`${window.location.origin}/webhooks/${selectedIntegration.integration_type}`}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/webhooks/${selectedIntegration.integration_type}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use this URL in your external service to send webhooks to this integration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfigDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateIntegration(selectedIntegration);
                    setShowConfigDialog(false);
                  }}
                  className="flex-1"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPortalIntegrations;
