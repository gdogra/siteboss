import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  settings: {
    branding: {
      logo?: string;
      primaryColor: string;
      secondaryColor: string;
      companyName: string;
    };
    features: {
      aiAssistant: boolean;
      advancedAnalytics: boolean;
      customReports: boolean;
      apiAccess: boolean;
      whiteLabeling: boolean;
    };
    limits: {
      maxUsers: number;
      maxLeads: number;
      maxDeals: number;
      storageGB: number;
    };
  };
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    expiresAt: Date;
    billingCycle: 'monthly' | 'yearly';
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => Promise<void>;
  getTenantFeature: (feature: keyof Tenant['settings']['features']) => boolean;
  getTenantLimit: (limit: keyof Tenant['settings']['limits']) => number;
  isWithinLimit: (resource: keyof Tenant['settings']['limits'], currentCount: number) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Extract tenant from subdomain or domain
  const getTenantFromDomain = (): string | null => {
    const hostname = window.location.hostname;
    
    // For development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'demo-tenant'; // Default tenant for development
    }
    
    // For Netlify deployment
    if (hostname.includes('netlify.app') || hostname.includes('siteboss-construction-management')) {
      return 'demo-tenant'; // Use demo tenant for Netlify
    }
    
    // Check if it's a subdomain (e.g., acme.siteboss.com)
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[1] === 'siteboss') {
      return parts[0]; // Extract subdomain
    }
    
    // Check if it's a custom domain
    const customDomainMapping: { [key: string]: string } = {
      'acme-crm.com': 'acme-corp',
      'buildtech.app': 'buildtech'
    };
    
    return customDomainMapping[hostname] || 'demo-tenant'; // Default to demo-tenant if no mapping found
  };

  // Load tenant data
  useEffect(() => {
    const loadTenant = async () => {
      try {
        setIsLoading(true);
        const tenantIdentifier = getTenantFromDomain();
        
        if (!tenantIdentifier) {
          throw new Error('No tenant found for this domain');
        }

        // Mock tenant data - in real implementation, this would be an API call
        const mockTenant: Tenant = {
          id: tenantIdentifier,
          name: tenantIdentifier === 'demo-tenant' ? 'Demo Construction Co.' : 'ACME Corporation',
          domain: tenantIdentifier === 'demo-tenant' ? 'localhost:3000' : 'acme.siteboss.com',
          subdomain: tenantIdentifier,
          settings: {
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
              companyName: tenantIdentifier === 'demo-tenant' ? 'Demo Construction Co.' : 'ACME Corporation',
              logo: undefined
            },
            features: {
              aiAssistant: true,
              advancedAnalytics: tenantIdentifier !== 'starter-tenant',
              customReports: tenantIdentifier === 'enterprise-tenant',
              apiAccess: tenantIdentifier !== 'starter-tenant',
              whiteLabeling: tenantIdentifier === 'enterprise-tenant'
            },
            limits: {
              maxUsers: tenantIdentifier === 'starter-tenant' ? 5 : tenantIdentifier === 'professional-tenant' ? 25 : 100,
              maxLeads: tenantIdentifier === 'starter-tenant' ? 1000 : tenantIdentifier === 'professional-tenant' ? 10000 : -1,
              maxDeals: tenantIdentifier === 'starter-tenant' ? 100 : tenantIdentifier === 'professional-tenant' ? 1000 : -1,
              storageGB: tenantIdentifier === 'starter-tenant' ? 5 : tenantIdentifier === 'professional-tenant' ? 50 : 500
            }
          },
          subscription: {
            plan: tenantIdentifier === 'starter-tenant' ? 'starter' : tenantIdentifier === 'professional-tenant' ? 'professional' : 'enterprise',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            billingCycle: 'monthly'
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        };

        // Apply custom branding to document
        document.documentElement.style.setProperty('--primary-color', mockTenant.settings.branding.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', mockTenant.settings.branding.secondaryColor);
        document.title = `${mockTenant.settings.branding.companyName} CRM`;

        setTenant(mockTenant);
      } catch (error) {
        console.error('Failed to load tenant:', error);
        // Set a default tenant instead of redirecting
        const defaultTenant: Tenant = {
          id: 'demo-tenant',
          name: 'SiteBoss Demo',
          domain: window.location.hostname,
          subdomain: 'demo-tenant',
          settings: {
            branding: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1E40AF',
              companyName: 'SiteBoss Construction Management',
              logo: undefined
            },
            features: {
              aiAssistant: true,
              advancedAnalytics: true,
              customReports: true,
              apiAccess: true,
              whiteLabeling: true
            },
            limits: {
              maxUsers: 100,
              maxLeads: -1,
              maxDeals: -1,
              storageGB: 500
            }
          },
          subscription: {
            plan: 'enterprise',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            billingCycle: 'monthly'
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        };
        setTenant(defaultTenant);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenant();
  }, []);

  const switchTenant = async (tenantId: string): Promise<void> => {
    try {
      setIsLoading(true);
      // In real implementation, this would switch context and reload data
      console.log(`Switching to tenant: ${tenantId}`);
      // Reload the page with new tenant context
      window.location.href = `https://${tenantId}.siteboss.com`;
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTenantSettings = async (settings: Partial<Tenant['settings']>): Promise<void> => {
    if (!tenant) throw new Error('No tenant loaded');

    try {
      // In real implementation, this would be an API call
      const updatedTenant = {
        ...tenant,
        settings: {
          ...tenant.settings,
          ...settings
        },
        updatedAt: new Date()
      };

      setTenant(updatedTenant);

      // Update CSS custom properties if branding changed
      if (settings.branding) {
        if (settings.branding.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', settings.branding.primaryColor);
        }
        if (settings.branding.secondaryColor) {
          document.documentElement.style.setProperty('--secondary-color', settings.branding.secondaryColor);
        }
        if (settings.branding.companyName) {
          document.title = `${settings.branding.companyName} CRM`;
        }
      }
    } catch (error) {
      console.error('Failed to update tenant settings:', error);
      throw error;
    }
  };

  const getTenantFeature = (feature: keyof Tenant['settings']['features']): boolean => {
    // Admin users have access to all features
    if (user?.role === 'super_admin' || user?.role === 'company_admin') {
      return true;
    }
    return tenant?.settings.features[feature] || false;
  };

  const getTenantLimit = (limit: keyof Tenant['settings']['limits']): number => {
    return tenant?.settings.limits[limit] || 0;
  };

  const isWithinLimit = (resource: keyof Tenant['settings']['limits'], currentCount: number): boolean => {
    // Admin users have unlimited access
    if (user?.role === 'super_admin' || user?.role === 'company_admin') {
      return true;
    }
    const limit = getTenantLimit(resource);
    return limit === -1 || currentCount < limit; // -1 means unlimited
  };

  const value: TenantContextType = {
    tenant,
    isLoading,
    switchTenant,
    updateTenantSettings,
    getTenantFeature,
    getTenantLimit,
    isWithinLimit
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};