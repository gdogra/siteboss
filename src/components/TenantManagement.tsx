import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/DataTable';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Palette, 
  Settings, 
  Users, 
  Database,
  Shield,
  Zap,
  Crown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  user_count: number;
  storage_used: string;
  billing_status: 'current' | 'overdue' | 'cancelled';
}

interface TenantBranding {
  company_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  custom_css: string;
  login_background: string;
}

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [branding, setBranding] = useState<TenantBranding>({
    company_name: 'SiteBoss',
    tagline: 'Construction Management Made Simple',
    logo_url: '',
    favicon_url: '',
    primary_color: '#0f172a',
    secondary_color: '#1e293b',
    accent_color: '#3b82f6',
    background_color: '#ffffff',
    text_color: '#1f2937',
    font_family: 'Inter, system-ui, sans-serif',
    custom_css: '',
    login_background: ''
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { tenant: currentTenant, updateTenantBranding } = useTenant();

  useEffect(() => {
    loadTenants();
    if (currentTenant?.branding) {
      setBranding(prev => ({ ...prev, ...currentTenant.branding }));
    }
  }, [currentTenant]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockTenants: Tenant[] = [
        {
          id: '1',
          name: 'SiteBoss Demo',
          subdomain: 'siteboss',
          custom_domain: 'demo.siteboss.com',
          plan: 'professional',
          status: 'active',
          created_at: '2024-01-15',
          user_count: 25,
          storage_used: '2.5 GB',
          billing_status: 'current'
        },
        {
          id: '2',
          name: 'ABC Construction',
          subdomain: 'abc-construction',
          plan: 'enterprise',
          status: 'active',
          created_at: '2024-02-01',
          user_count: 50,
          storage_used: '8.2 GB',
          billing_status: 'current'
        },
        {
          id: '3',
          name: 'Metro Builders',
          subdomain: 'metro-builders',
          plan: 'starter',
          status: 'pending',
          created_at: '2024-03-10',
          user_count: 8,
          storage_used: '512 MB',
          billing_status: 'current'
        }
      ];
      setTenants(mockTenants);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandingUpdate = async () => {
    try {
      await updateTenantBranding({
        branding: branding
      });
      toast({
        title: "Branding Updated",
        description: "Your branding settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branding settings",
        variant: "destructive",
      });
    }
  };

  const handleCreateTenant = async (tenantData: any) => {
    try {
      // Create tenant logic would go here
      toast({
        title: "Tenant Created",
        description: `New tenant "${tenantData.name}" has been created successfully.`,
      });
      setDialogOpen(false);
      loadTenants();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      });
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter':
        return <Zap className="w-4 h-4" />;
      case 'professional':
        return <Building2 className="w-4 h-4" />;
      case 'enterprise':
        return <Crown className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-yellow-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const tenantColumns = [
    { key: 'name', label: 'Tenant Name' },
    { key: 'subdomain', label: 'Subdomain' },
    { key: 'plan', label: 'Plan' },
    { key: 'status', label: 'Status' },
    { key: 'user_count', label: 'Users' },
    { key: 'storage_used', label: 'Storage' },
    { key: 'created_at', label: 'Created' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Multi-Tenant Management</h1>
          <p className="text-slate-600 mt-2">
            Manage tenants, branding, and white-label configurations for SiteBoss
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Set up a new tenant with their own branding and configuration
              </DialogDescription>
            </DialogHeader>
            <TenantCreationForm onSubmit={handleCreateTenant} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenants" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Tenants</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Domains</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Tenant Overview</span>
              </CardTitle>
              <CardDescription>
                Manage all tenants and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <Card key={tenant.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {tenant.name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {tenant.subdomain}.siteboss.com
                            </p>
                            {tenant.custom_domain && (
                              <p className="text-sm text-blue-600">
                                Custom: {tenant.custom_domain}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              {getPlanIcon(tenant.plan)}
                              <Badge variant={tenant.plan === 'enterprise' ? 'default' : 'secondary'}>
                                {tenant.plan}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(tenant.status)}
                              <span className="text-sm text-slate-600">{tenant.status}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <p>{tenant.user_count} users</p>
                            <p>{tenant.storage_used}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Brand Configuration</span>
                </CardTitle>
                <CardDescription>
                  Customize your SiteBoss branding and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={branding.company_name}
                      onChange={(e) => setBranding(prev => ({ ...prev, company_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={branding.tagline}
                      onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={branding.logo_url}
                    onChange={(e) => setBranding(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={branding.primary_color}
                        onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={branding.primary_color}
                        onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={branding.accent_color}
                        onChange={(e) => setBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={branding.accent_color}
                        onChange={(e) => setBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="font_family">Font Family</Label>
                  <Select
                    value={branding.font_family}
                    onValueChange={(value) => setBranding(prev => ({ ...prev, font_family: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                      <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                      <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                      <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                      <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="custom_css">Custom CSS</Label>
                  <Textarea
                    id="custom_css"
                    value={branding.custom_css}
                    onChange={(e) => setBranding(prev => ({ ...prev, custom_css: e.target.value }))}
                    placeholder="/* Add custom CSS here */"
                    rows={6}
                  />
                </div>

                <Button onClick={handleBrandingUpdate} className="w-full">
                  Update Branding
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your branding changes will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg p-6 space-y-4"
                  style={{
                    backgroundColor: branding.background_color,
                    color: branding.text_color,
                    fontFamily: branding.font_family
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: branding.primary_color }}
                    >
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {branding.company_name}
                      </h3>
                      <p className="text-sm opacity-70">
                        {branding.tagline}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      className="px-4 py-2 rounded-md text-white font-medium"
                      style={{ backgroundColor: branding.accent_color }}
                    >
                      Primary Button
                    </button>
                    
                    <div className="p-3 border rounded-md">
                      <p className="text-sm">This is how your content will appear with the selected branding.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains">
          <DomainManagement />
        </TabsContent>

        <TabsContent value="settings">
          <TenantSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Domain Management Component
const DomainManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>Custom Domains</span>
        </CardTitle>
        <CardDescription>
          Manage custom domains for white-label deployments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Input placeholder="Enter custom domain (e.g., app.yourcompany.com)" />
            <Button>Add Domain</Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">DNS Configuration</h4>
            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-sm text-slate-600 mb-2">Add these DNS records to your domain provider:</p>
              <div className="font-mono text-xs space-y-1">
                <div>CNAME: app.yourcompany.com → siteboss.app</div>
                <div>TXT: _siteboss-verification → abc123def456</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Tenant Settings Component
const TenantSettings: React.FC = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Tenant Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Multi-Tenant Mode</Label>
              <p className="text-sm text-slate-600">Allow multiple tenants on this instance</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>White-Label Mode</Label>
              <p className="text-sm text-slate-600">Hide SiteBoss branding</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Custom Domain Support</Label>
              <p className="text-sm text-slate-600">Enable custom domains</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Tenant Isolation</Label>
              <p className="text-sm text-slate-600">Strict data separation</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>API Rate Limiting</Label>
              <p className="text-sm text-slate-600">Per-tenant rate limits</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Tenant Creation Form Component
const TenantCreationForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    plan: 'starter',
    admin_email: '',
    admin_name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tenant_name">Tenant Name</Label>
        <Input
          id="tenant_name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="ABC Construction"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="subdomain">Subdomain</Label>
        <div className="flex">
          <Input
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
            placeholder="abc-construction"
            required
          />
          <div className="flex items-center px-3 bg-slate-100 border border-l-0 rounded-r-md">
            .siteboss.com
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="plan">Plan</Label>
        <Select value={formData.plan} onValueChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="starter">Starter - $49/month</SelectItem>
            <SelectItem value="professional">Professional - $99/month</SelectItem>
            <SelectItem value="enterprise">Enterprise - $199/month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="admin_name">Admin Name</Label>
          <Input
            id="admin_name"
            value={formData.admin_name}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="admin_email">Admin Email</Label>
          <Input
            id="admin_email"
            type="email"
            value={formData.admin_email}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
            placeholder="admin@abcconstruction.com"
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Create Tenant
      </Button>
    </form>
  );
};

export default TenantManagement;