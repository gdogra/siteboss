import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Globe, Search, ArrowRight } from 'lucide-react';
import { useTenant, Tenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';

interface TenantSelectorProps {
  onTenantSelected?: (tenant: Tenant) => void;
  showSearch?: boolean;
  compact?: boolean;
}

const TenantSelector: React.FC<TenantSelectorProps> = ({
  onTenantSelected,
  showSearch = true,
  compact = false
}) => {
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { currentTenant, loadTenant } = useTenant();
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableTenants();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = availableTenants.filter((tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.custom_domain?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTenants(filtered);
    } else {
      setFilteredTenants(availableTenants);
    }
  }, [searchTerm, availableTenants]);

  const loadAvailableTenants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(35554, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });

      if (error) throw error;
      const tenants = data?.List || [];
      setAvailableTenants(tenants);
      setFilteredTenants(tenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available tenants',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTenantSelect = async (tenant: Tenant) => {
    try {
      await loadTenant(tenant.tenant_id);
      onTenantSelected?.(tenant);
      toast({
        title: 'Tenant Selected',
        description: `Switched to ${tenant.name}`
      });
    } catch (error) {
      console.error('Error selecting tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch tenant',
        variant: 'destructive'
      });
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <Select
          value={currentTenant?.tenant_id || ''}
          onValueChange={(value) => {
            const tenant = availableTenants.find((t) => t.tenant_id === value);
            if (tenant) handleTenantSelect(tenant);
          }}>

          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select tenant organization..." />
          </SelectTrigger>
          <SelectContent>
            {availableTenants.map((tenant) =>
            <SelectItem key={tenant.id} value={tenant.tenant_id}>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>{tenant.name}</span>
                  {tenant.custom_domain &&
                <Badge variant="outline" className="text-xs">
                      Custom Domain
                    </Badge>
                }
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select Your Organization</h2>
        <p className="text-muted-foreground">
          Choose the tenant organization you want to access
        </p>
      </div>

      {showSearch &&
      <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9" />

        </div>
      }

      {isLoading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) =>
        <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
        )}
        </div> :
      filteredTenants.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredTenants.map((tenant) =>
        <Card
          key={tenant.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          currentTenant?.id === tenant.id ?
          'ring-2 ring-primary bg-primary/5' :
          'hover:bg-muted/50'}`
          }
          onClick={() => handleTenantSelect(tenant)}>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${tenant.primary_color}15` }}>

                      <Building2
                    className="w-4 h-4"
                    style={{ color: tenant.primary_color }} />

                    </div>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <CardDescription className="text-sm">{tenant.tenant_id}</CardDescription>
                    </div>
                  </div>
                  {currentTenant?.id === tenant.id &&
              <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
              }
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {tenant.custom_domain &&
              <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-3 h-3 mr-1" />
                      <span className="truncate">{tenant.custom_domain}</span>
                    </div>
              }
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {tenant.subscription_tier}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}
        </div> :

      <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No organizations found</p>
              {searchTerm &&
            <p className="text-sm mt-1">
                  Try adjusting your search terms
                </p>
            }
            </div>
          </CardContent>
        </Card>
      }

      {!compact &&
      <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't see your organization?{' '}
            <Button variant="link" className="p-0 h-auto text-sm">
              Contact your administrator
            </Button>
          </p>
        </div>
      }
    </div>);

};

export default TenantSelector;