import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branding?: {
    company_name: string;
    tagline?: string;
    favicon_url?: string;
    login_background?: string;
    custom_css?: string;
  };
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
  updateTenantBranding: (branding: Partial<Tenant>) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCurrentTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get subdomain from current URL
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // For localhost development, use 'demo' as default
      const tenantIdentifier = hostname === 'localhost' || hostname.includes('easysite.ai') 
        ? 'siteboss' 
        : subdomain;

      // Try to get tenant from local storage first
      const cachedTenant = localStorage.getItem('current_tenant');
      if (cachedTenant) {
        const parsed = JSON.parse(cachedTenant);
        setTenant(parsed);
        setLoading(false);
        return;
      }

      // If no cached tenant, create default SiteBoss tenant
      const defaultTenant: Tenant = {
        id: '1',
        name: 'SiteBoss',
        subdomain: 'siteboss',
        custom_domain: '',
        logo_url: '',
        primary_color: '#0f172a',
        secondary_color: '#1e293b',
        accent_color: '#3b82f6',
        background_color: '#ffffff',
        text_color: '#1f2937',
        font_family: 'Inter, system-ui, sans-serif',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        branding: {
          company_name: 'SiteBoss',
          tagline: 'Construction Management Made Simple',
          favicon_url: '',
          login_background: '',
          custom_css: ''
        }
      };

      setTenant(defaultTenant);
      localStorage.setItem('current_tenant', JSON.stringify(defaultTenant));
      
    } catch (err) {
      console.error('Error loading tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tenant');
      // Set default tenant even on error
      const defaultTenant: Tenant = {
        id: '1',
        name: 'SiteBoss',
        subdomain: 'siteboss',
        primary_color: '#0f172a',
        secondary_color: '#1e293b',
        accent_color: '#3b82f6',
        background_color: '#ffffff',
        text_color: '#1f2937',
        font_family: 'Inter, system-ui, sans-serif',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        branding: {
          company_name: 'SiteBoss',
          tagline: 'Construction Management Made Simple'
        }
      };
      setTenant(defaultTenant);
    } finally {
      setLoading(false);
    }
  };

  const refreshTenant = async () => {
    await getCurrentTenant();
  };

  const updateTenantBranding = async (branding: Partial<Tenant>) => {
    if (!tenant) return;
    
    try {
      const updatedTenant = { ...tenant, ...branding };
      setTenant(updatedTenant);
      localStorage.setItem('current_tenant', JSON.stringify(updatedTenant));
      
      toast({
        title: "Branding Updated",
        description: "Your branding settings have been saved successfully.",
      });
    } catch (err) {
      console.error('Error updating tenant branding:', err);
      toast({
        title: "Error",
        description: "Failed to update branding settings.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    getCurrentTenant();
  }, []);

  // Apply tenant branding to document
  useEffect(() => {
    if (tenant) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', tenant.primary_color);
      root.style.setProperty('--secondary-color', tenant.secondary_color);
      root.style.setProperty('--accent-color', tenant.accent_color);
      root.style.setProperty('--background-color', tenant.background_color);
      root.style.setProperty('--text-color', tenant.text_color);
      root.style.setProperty('--font-family', tenant.font_family);
      
      // Update document title
      document.title = tenant.branding?.company_name || tenant.name;
    }
  }, [tenant]);

  const value: TenantContextType = {
    tenant,
    setTenant,
    loading,
    error,
    refreshTenant,
    updateTenantBranding,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;