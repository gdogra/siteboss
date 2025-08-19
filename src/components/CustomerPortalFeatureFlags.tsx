
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DataTable from  '@/components/DataTable';
import {
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeatureFlag {
  id?: number;
  flag_key: string;
  flag_name: string;
  description: string;
  is_enabled: boolean;
  target_audience: string;
  rollout_percentage: number;
  environment: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

const CustomerPortalFeatureFlags: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const [newFlag, setNewFlag] = useState<FeatureFlag>({
    flag_key: '',
    flag_name: '',
    description: '',
    is_enabled: false,
    target_audience: 'all',
    rollout_percentage: 100,
    environment: 'production'
  });

  const environments = ['development', 'staging', 'production'];
  const targetAudiences = ['all', 'beta_users', 'premium_users', 'admin_users', 'specific_users'];

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const { data: flagsData, error } = await window.ezsite.apis.tablePage(35455, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: []
      });

      if (error) throw new Error(error);

      if (flagsData?.List) {
        setFeatureFlags(flagsData.List);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading feature flags',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFeatureFlag = async () => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();
      
      const flagToCreate = {
        ...newFlag,
        flag_key: newFlag.flag_key.toLowerCase().replace(/\s+/g, '_'),
        created_by: userInfo?.ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableCreate(35455, flagToCreate);

      toast({
        title: 'Feature flag created',
        description: `Feature flag "${newFlag.flag_name}" has been created successfully.`
      });

      setShowCreateDialog(false);
      setNewFlag({
        flag_key: '',
        flag_name: '',
        description: '',
        is_enabled: false,
        target_audience: 'all',
        rollout_percentage: 100,
        environment: 'production'
      });
      
      await loadFeatureFlags();
      await trackFlagEvent('flag_created', newFlag.flag_key);

    } catch (error: any) {
      toast({
        title: 'Error creating feature flag',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateFeatureFlag = async (flag: FeatureFlag) => {
    try {
      const flagToUpdate = {
        ...flag,
        updated_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableUpdate(35455, {
        ID: flag.id,
        ...flagToUpdate
      });

      toast({
        title: 'Feature flag updated',
        description: `Feature flag "${flag.flag_name}" has been updated successfully.`
      });

      await loadFeatureFlags();
      await trackFlagEvent('flag_updated', flag.flag_key);

    } catch (error: any) {
      toast({
        title: 'Error updating feature flag',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleFeatureFlag = async (flag: FeatureFlag) => {
    const updatedFlag = { ...flag, is_enabled: !flag.is_enabled };
    await updateFeatureFlag(updatedFlag);
    await trackFlagEvent('flag_toggled', flag.flag_key, { 
      new_state: !flag.is_enabled 
    });
  };

  const deleteFeatureFlag = async (flagId: number, flagKey: string) => {
    try {
      await window.ezsite.apis.tableDelete(35455, { ID: flagId });

      toast({
        title: 'Feature flag deleted',
        description: 'Feature flag has been deleted successfully.'
      });

      await loadFeatureFlags();
      await trackFlagEvent('flag_deleted', flagKey);

    } catch (error: any) {
      toast({
        title: 'Error deleting feature flag',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const trackFlagEvent = async (eventType: string, flagKey: string, additionalData?: any) => {
    try {
      const { data: userInfo } = await window.ezsite.apis.getUserInfo();
      await window.ezsite.apis.tableCreate(35465, {
        customer_id: 1,
        user_id: userInfo?.ID,
        event_type: eventType,
        event_data: JSON.stringify({ 
          flag_key: flagKey, 
          ...additionalData 
        }),
        timestamp: new Date().toISOString(),
        session_id: `session_${Date.now()}`,
        ip_address: '0.0.0.0',
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to track flag event:', error);
    }
  };

  const getStatusBadge = (flag: FeatureFlag) => {
    if (flag.is_enabled) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Enabled
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <XCircle className="h-3 w-3 mr-1" />
          Disabled
        </Badge>
      );
    }
  };

  const getEnvironmentBadge = (environment: string) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      staging: 'bg-yellow-100 text-yellow-800',
      production: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[environment as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {environment}
      </Badge>
    );
  };

  const getTargetAudienceBadge = (audience: string) => {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Target className="h-3 w-3" />
        {audience.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.flag_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.flag_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEnvironment = filterEnvironment === 'all' || flag.environment === filterEnvironment;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'enabled' && flag.is_enabled) ||
                         (filterStatus === 'disabled' && !flag.is_enabled);
    
    return matchesSearch && matchesEnvironment && matchesStatus;
  });

  const flagColumns = [
    {
      header: 'Feature',
      accessor: 'feature',
      render: (flag: FeatureFlag) => (
        <div className="space-y-1">
          <div className="font-medium">{flag.flag_name}</div>
          <div className="text-xs text-muted-foreground font-mono">{flag.flag_key}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{flag.description}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (flag: FeatureFlag) => (
        <div className="space-y-2">
          {getStatusBadge(flag)}
          <div className="flex items-center gap-2">
            <Switch
              checked={flag.is_enabled}
              onCheckedChange={() => toggleFeatureFlag(flag)}
              className="scale-75"
            />
            <span className="text-xs text-muted-foreground">
              {flag.rollout_percentage}% rollout
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Environment',
      accessor: 'environment',
      render: (flag: FeatureFlag) => getEnvironmentBadge(flag.environment)
    },
    {
      header: 'Target',
      accessor: 'target',
      render: (flag: FeatureFlag) => getTargetAudienceBadge(flag.target_audience)
    },
    {
      header: 'Updated',
      accessor: 'updated',
      render: (flag: FeatureFlag) => (
        <div className="text-sm text-muted-foreground">
          {flag.updated_at ? new Date(flag.updated_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (flag: FeatureFlag) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedFlag(flag);
              setShowEditDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${flag.flag_name}"?`)) {
                deleteFeatureFlag(flag.id!, flag.flag_key);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const stats = {
    total: featureFlags.length,
    enabled: featureFlags.filter(f => f.is_enabled).length,
    disabled: featureFlags.filter(f => f.is_enabled === false).length,
    production: featureFlags.filter(f => f.environment === 'production').length
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
          <h2 className="text-2xl font-bold tracking-tight">Feature Flags</h2>
          <p className="text-muted-foreground">
            Manage feature toggles and gradual rollouts
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flag-name">Flag Name</Label>
                <Input
                  id="flag-name"
                  placeholder="New Feature"
                  value={newFlag.flag_name}
                  onChange={(e) => setNewFlag(prev => ({ 
                    ...prev, 
                    flag_name: e.target.value,
                    flag_key: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="flag-key">Flag Key</Label>
                <Input
                  id="flag-key"
                  placeholder="new_feature"
                  value={newFlag.flag_key}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, flag_key: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this feature flag controls..."
                  value={newFlag.description}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select value={newFlag.environment} onValueChange={(value) => setNewFlag(prev => ({ ...prev, environment: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.map(env => (
                        <SelectItem key={env} value={env}>
                          {env}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={newFlag.target_audience} onValueChange={(value) => setNewFlag(prev => ({ ...prev, target_audience: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map(audience => (
                        <SelectItem key={audience} value={audience}>
                          {audience.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rollout Percentage: {newFlag.rollout_percentage}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newFlag.rollout_percentage}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, rollout_percentage: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={newFlag.is_enabled}
                  onCheckedChange={(checked) => setNewFlag(prev => ({ ...prev, is_enabled: checked }))}
                />
                <Label htmlFor="enabled">Enable immediately</Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createFeatureFlag} className="flex-1">
                  Create Flag
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.disabled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.production}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search feature flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Envs</SelectItem>
                {environments.map(env => (
                  <SelectItem key={env} value={env}>{env}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredFlags}
            columns={flagColumns}
            searchKey="flag_name"
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Feature Flag</DialogTitle>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Flag Name</Label>
                <Input
                  value={selectedFlag.flag_name}
                  onChange={(e) => setSelectedFlag(prev => prev ? ({ ...prev, flag_name: e.target.value }) : null)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedFlag.description}
                  onChange={(e) => setSelectedFlag(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Rollout Percentage: {selectedFlag.rollout_percentage}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedFlag.rollout_percentage}
                  onChange={(e) => setSelectedFlag(prev => prev ? ({ ...prev, rollout_percentage: parseInt(e.target.value) }) : null)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedFlag.is_enabled}
                  onCheckedChange={(checked) => setSelectedFlag(prev => prev ? ({ ...prev, is_enabled: checked }) : null)}
                />
                <Label>Enabled</Label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedFlag) {
                      updateFeatureFlag(selectedFlag);
                      setShowEditDialog(false);
                    }
                  }} 
                  className="flex-1"
                >
                  Update Flag
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerPortalFeatureFlags;
