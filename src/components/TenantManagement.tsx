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
import DataTable from '@/components/DataTable';
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
  XCircle,
  BarChart3,
  Monitor,
  FileText,
  Play,
  Pause,
  Search,
  Filter,
  MoreVertical,
  AlertTriangle,
  Clock,
  HardDrive,
  Activity,
  Eye,
  UserX,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import TenantMetricsOverview from '@/components/TenantMetricsOverview';
import TenantResourceMonitor from '@/components/TenantResourceMonitor';
import BulkTenantOperations from '@/components/BulkTenantOperations';
import TenantAuditLogger from '@/components/TenantAuditLogger';

interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  custom_domain?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'pending' | 'maintenance';
  created_at: string;
  last_active: string;
  user_count: number;
  storage_used: number;
  storage_limit: number;
  monthly_active_users: number;
  billing_status: 'current' | 'overdue' | 'cancelled';
  admin_name: string;
  admin_email: string;
  trial_ends_at?: string;
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

interface TenantMetrics {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  pending_tenants: number;
  total_users: number;
  total_storage_used: number;
  avg_monthly_growth: number;
  revenue_this_month: number;
}

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedTenantIds, setSelectedTenantIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [metrics, setMetrics] = useState<TenantMetrics>({
    total_tenants: 0,
    active_tenants: 0,
    suspended_tenants: 0,
    pending_tenants: 0,
    total_users: 0,
    total_storage_used: 0,
    avg_monthly_growth: 0,
    revenue_this_month: 0,
  });
  const { toast } = useToast();
  const { tenant: currentTenant } = useTenant();

  useEffect(() => {
    loadTenants();
    loadMetrics();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35554, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedTenants = data.List.map((tenant: any) => ({
        ...tenant,
        storage_used: tenant.storage_used || 0,
        storage_limit: tenant.storage_limit || 10000, // 10GB default
        monthly_active_users: tenant.monthly_active_users || 0,
        last_active: tenant.last_active || tenant.created_at,
      }));

      setTenants(transformedTenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
      // Fallback to mock data for development
      setTenants(getMockTenants());
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Load tenant metrics - in production this would be from analytics tables
      const totalTenants = tenants.length;
      const activeTenants = tenants.filter(t => t.status === 'active').length;
      const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;
      const pendingTenants = tenants.filter(t => t.status === 'pending').length;
      
      setMetrics({
        total_tenants: totalTenants,
        active_tenants: activeTenants,
        suspended_tenants: suspendedTenants,
        pending_tenants: pendingTenants,
        total_users: tenants.reduce((sum, t) => sum + t.user_count, 0),
        total_storage_used: tenants.reduce((sum, t) => sum + t.storage_used, 0),
        avg_monthly_growth: 12.5,
        revenue_this_month: 45230,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const getMockTenants = (): Tenant[] => [
    {
      id: 1,
      name: 'SiteBoss Demo',
      subdomain: 'siteboss',
      custom_domain: 'demo.siteboss.com',
      plan: 'professional',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z',
      last_active: '2024-03-15T14:20:00Z',
      user_count: 25,
      storage_used: 2500,
      storage_limit: 10000,
      monthly_active_users: 22,
      billing_status: 'current',
      admin_name: 'John Smith',
      admin_email: 'john@siteboss.com',
    },
    {
      id: 2,
      name: 'ABC Construction',
      subdomain: 'abc-construction',
      plan: 'enterprise',
      status: 'active',
      created_at: '2024-02-01T09:15:00Z',
      last_active: '2024-03-15T16:45:00Z',
      user_count: 50,
      storage_used: 8200,
      storage_limit: 50000,
      monthly_active_users: 48,
      billing_status: 'current',
      admin_name: 'Sarah Johnson',
      admin_email: 'sarah@abcconstruction.com',
    },
    {
      id: 3,
      name: 'Metro Builders',
      subdomain: 'metro-builders',
      plan: 'starter',
      status: 'suspended',
      created_at: '2024-03-10T11:00:00Z',
      last_active: '2024-03-12T10:30:00Z',
      user_count: 8,
      storage_used: 512,
      storage_limit: 5000,
      monthly_active_users: 3,
      billing_status: 'overdue',
      admin_name: 'Mike Wilson',
      admin_email: 'mike@metrobuilders.com',
      trial_ends_at: '2024-03-20T23:59:59Z',
    },
  ];

  const suspendTenant = async (tenantId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(35554, {
        ID: tenantId,
        status: 'suspended',
        suspended_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant suspended successfully"
      });

      loadTenants();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend tenant",
        variant: "destructive"
      });
    }
  };

  const activateTenant = async (tenantId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate(35554, {
        ID: tenantId,
        status: 'active',
        suspended_at: null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant activated successfully"
      });

      loadTenants();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate tenant",
        variant: "destructive"
      });
    }
  };

  const deleteTenant = async (tenantId: number) => {
    if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await window.ezsite.apis.tableDelete(35554, { ID: tenantId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant deleted successfully"
      });

      loadTenants();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive"
      });
    }
  };

  const handleCreateTenant = async (tenantData: any) => {
    try {
      const { error } = await window.ezsite.apis.tableCreate(35554, {
        name: tenantData.name,
        subdomain: tenantData.subdomain,
        plan: tenantData.plan,
        status: 'pending',
        admin_name: tenantData.admin_name,
        admin_email: tenantData.admin_email,
        created_at: new Date().toISOString(),
        user_count: 1,
        storage_used: 0,
        storage_limit: getStorageLimit(tenantData.plan),
        billing_status: 'current'
      });

      if (error) throw error;

      toast({
        title: "Tenant Created",
        description: `New tenant "${tenantData.name}" has been created successfully.`
      });

      setDialogOpen(false);
      loadTenants();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive"
      });
    }
  };

  const getStorageLimit = (plan: string): number => {
    switch (plan) {
      case 'starter': return 5000; // 5GB
      case 'professional': return 10000; // 10GB
      case 'enterprise': return 50000; // 50GB
      default: return 5000;
    }
  };

  const formatStorageSize = (sizeInMB: number): string => {
    if (sizeInMB < 1024) return `${sizeInMB} MB`;
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-blue-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'destructive';
      case 'pending': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.admin_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const tenantColumns = [
    {
      key: 'name',
      label: 'Tenant',
      render: (tenant: Tenant) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium">{tenant.name}</div>
            <div className="text-sm text-gray-500">{tenant.subdomain}.siteboss.com</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (tenant: Tenant) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(tenant.status)}
          <Badge variant={getStatusBadgeVariant(tenant.status)}>
            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (tenant: Tenant) => (
        <div className="flex items-center space-x-2">
          {getPlanIcon(tenant.plan)}
          <span className="capitalize">{tenant.plan}</span>
        </div>
      )
    },
    {
      key: 'users',
      label: 'Users',
      render: (tenant: Tenant) => (
        <div className="text-center">
          <div className="font-medium">{tenant.user_count}</div>
          <div className="text-xs text-gray-500">{tenant.monthly_active_users} MAU</div>
        </div>
      )
    },
    {
      key: 'storage',
      label: 'Storage',
      render: (tenant: Tenant) => (
        <div>
          <div className="text-sm font-medium">
            {formatStorageSize(tenant.storage_used)} / {formatStorageSize(tenant.storage_limit)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min((tenant.storage_used / tenant.storage_limit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (tenant: Tenant) => formatDate(tenant.created_at)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (tenant: Tenant) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTenant(tenant)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {tenant.status === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => suspendTenant(tenant.id)}
            >
              <UserX className="w-4 h-4 text-red-500" />
            </Button>
          ) : tenant.status === 'suspended' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => activateTenant(tenant.id)}
            >
              <UserCheck className="w-4 h-4 text-green-500" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTenant(tenant.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Super Admin - Tenant Management</h1>
          <p className="text-slate-600 mt-2">
            Comprehensive tenant administration and monitoring
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Tenants</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Bulk Ops</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TenantMetricsOverview />
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Tenant Directory</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline">{filteredTenants.length} Results</Badge>
              </div>
            </div>

            <DataTable
              data={filteredTenants}
              columns={tenantColumns}
              loading={loading}
            />
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <TenantResourceMonitor />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkTenantOperations />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <TenantAuditLogger />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <TenantSettings />
        </TabsContent>
      </Tabs>

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tenant Details: {selectedTenant.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Basic Information</Label>
                  <div className="bg-gray-50 p-3 rounded-md space-y-2 mt-1">
                    <div><strong>Name:</strong> {selectedTenant.name}</div>
                    <div><strong>Subdomain:</strong> {selectedTenant.subdomain}</div>
                    <div><strong>Plan:</strong> {selectedTenant.plan}</div>
                    <div><strong>Status:</strong> {selectedTenant.status}</div>
                    <div><strong>Created:</strong> {formatDate(selectedTenant.created_at)}</div>
                    <div><strong>Last Active:</strong> {formatDate(selectedTenant.last_active)}</div>
                  </div>
                </div>
                <div>
                  <Label>Admin Contact</Label>
                  <div className="bg-gray-50 p-3 rounded-md space-y-2 mt-1">
                    <div><strong>Name:</strong> {selectedTenant.admin_name}</div>
                    <div><strong>Email:</strong> {selectedTenant.admin_email}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Usage Statistics</Label>
                  <div className="bg-gray-50 p-3 rounded-md space-y-2 mt-1">
                    <div><strong>Users:</strong> {selectedTenant.user_count}</div>
                    <div><strong>MAU:</strong> {selectedTenant.monthly_active_users}</div>
                    <div><strong>Storage:</strong> {formatStorageSize(selectedTenant.storage_used)} / {formatStorageSize(selectedTenant.storage_limit)}</div>
                    <div><strong>Billing:</strong> {selectedTenant.billing_status}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {selectedTenant.status === 'active' ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        suspendTenant(selectedTenant.id);
                        setSelectedTenant(null);
                      }}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Suspend Tenant
                    </Button>
                  ) : selectedTenant.status === 'suspended' ? (
                    <Button
                      variant="default"
                      onClick={() => {
                        activateTenant(selectedTenant.id);
                        setSelectedTenant(null);
                      }}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate Tenant
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTenant(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
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
            <span>Platform Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Multi-Tenant Mode</Label>
              <p className="text-sm text-slate-600">Allow multiple tenants on this instance</p>
            </div>
            <Switch defaultChecked />
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

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Scaling</Label>
              <p className="text-sm text-slate-600">Automatically scale resources</p>
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

          <div className="flex items-center justify-between">
            <div>
              <Label>Audit Logging</Label>
              <p className="text-sm text-slate-600">Log all tenant actions</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>2FA Requirement</Label>
              <p className="text-sm text-slate-600">Require 2FA for admins</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Tenant Creation Form Component
const TenantCreationForm: React.FC<{onSubmit: (data: any) => void}> = ({ onSubmit }) => {
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