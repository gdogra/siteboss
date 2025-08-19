import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Globe, Code, Eye, Save, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

interface WhiteLabelConfigProps {
  tenantId?: string;
  onSaved?: () => void;
}

const WhiteLabelConfig: React.FC<WhiteLabelConfigProps> = ({ tenantId, onSaved }) => {
  const { currentTenant, tenantBranding, applyTenantBranding } = useTenant();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Configuration state
  const [config, setConfig] = useState({
    // Basic branding
    company_name: '',
    tagline: '',
    logo_url: '',
    favicon_url: '',
    
    // Colors
    primary_color: '#1e40af',
    secondary_color: '#64748b',
    accent_color: '#059669',
    
    // Typography
    font_family: 'Inter',
    heading_font: 'Inter',
    
    // Messaging
    welcome_message: '',
    footer_text: '',
    
    // Contact
    support_email: '',
    support_phone: '',
    
    // Legal
    privacy_policy_url: '',
    terms_url: '',
    
    // Advanced
    custom_css: '',
    login_background_url: '',
    
    // Domain
    custom_domain: '',
    ssl_enabled: false
  });

  useEffect(() => {
    if (tenantBranding && currentTenant) {
      setConfig({
        company_name: tenantBranding.company_name || '',
        tagline: tenantBranding.tagline || '',
        logo_url: currentTenant.logo_url || '',
        favicon_url: tenantBranding.favicon_url || '',
        primary_color: currentTenant.primary_color || '#1e40af',
        secondary_color: currentTenant.secondary_color || '#64748b',
        accent_color: currentTenant.accent_color || '#059669',
        font_family: 'Inter',
        heading_font: 'Inter',
        welcome_message: tenantBranding.welcome_message || '',
        footer_text: tenantBranding.footer_text || '',
        support_email: tenantBranding.support_email || '',
        support_phone: tenantBranding.support_phone || '',
        privacy_policy_url: tenantBranding.privacy_policy_url || '',
        terms_url: tenantBranding.terms_url || '',
        custom_css: tenantBranding.custom_css || '',
        login_background_url: tenantBranding.login_background_url || '',
        custom_domain: currentTenant.custom_domain || '',
        ssl_enabled: false
      });
    }
  }, [tenantBranding, currentTenant]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update tenant basic info
      if (currentTenant) {
        const { error: tenantError } = await window.ezsite.apis.tableUpdate(35554, {
          id: currentTenant.id,
          logo_url: config.logo_url,
          primary_color: config.primary_color,
          secondary_color: config.secondary_color,
          accent_color: config.accent_color,
          custom_domain: config.custom_domain,
          updated_at: new Date().toISOString()
        });

        if (tenantError) throw tenantError;
      }

      // Update branding
      if (tenantBranding) {
        const { error: brandingError } = await window.ezsite.apis.tableUpdate(35555, {
          id: tenantBranding.id,
          company_name: config.company_name,
          tagline: config.tagline,
          welcome_message: config.welcome_message,
          footer_text: config.footer_text,
          support_email: config.support_email,
          support_phone: config.support_phone,
          privacy_policy_url: config.privacy_policy_url,
          terms_url: config.terms_url,
          custom_css: config.custom_css,
          favicon_url: config.favicon_url,
          login_background_url: config.login_background_url
        });

        if (brandingError) throw brandingError;
      }

      // Apply changes immediately
      applyTenantBranding();

      toast({
        title: 'Success',
        description: 'White-label configuration saved successfully',
      });

      onSaved?.();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = () => {
    // Apply temporary styles for preview
    const root = document.documentElement;
    root.style.setProperty('--preview-primary', config.primary_color);
    root.style.setProperty('--preview-secondary', config.secondary_color);
    root.style.setProperty('--preview-accent', config.accent_color);
  };

  const exportConfig = () => {
    const configData = {
      branding: config,
      tenant: currentTenant?.name,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTenant?.slug || 'tenant'}-branding-config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">White-Label Configuration</h2>
          <p className="text-muted-foreground">
            Customize the appearance and branding for your tenant
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" onClick={generatePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Basic Branding
              </CardTitle>
              <CardDescription>Configure your basic brand identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={config.company_name}
                    onChange={(e) => setConfig(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={config.tagline}
                    onChange={(e) => setConfig(prev => ({ ...prev, tagline: e.target.value }))}
                    placeholder="Your company tagline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={config.logo_url}
                    onChange={(e) => setConfig(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={config.favicon_url}
                    onChange={(e) => setConfig(prev => ({ ...prev, favicon_url: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
              
              {config.logo_url && (
                <div className="space-y-2">
                  <Label>Logo Preview</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img 
                      src={config.logo_url} 
                      alt="Logo preview" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Define your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={config.secondary_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={config.accent_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Color Preview</Label>
                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mb-2"
                      style={{ backgroundColor: config.primary_color }}
                    />
                    <p className="text-xs">Primary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mb-2"
                      style={{ backgroundColor: config.secondary_color }}
                    />
                    <p className="text-xs">Secondary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mb-2"
                      style={{ backgroundColor: config.accent_color }}
                    />
                    <p className="text-xs">Accent</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content & Messaging</CardTitle>
              <CardDescription>Customize text content and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Input
                  id="welcome_message"
                  value={config.welcome_message}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                  placeholder="Welcome to our platform!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer Text</Label>
                <Input
                  id="footer_text"
                  value={config.footer_text}
                  onChange={(e) => setConfig(prev => ({ ...prev, footer_text: e.target.value }))}
                  placeholder="© 2024 Your Company. All rights reserved."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={config.support_email}
                    onChange={(e) => setConfig(prev => ({ ...prev, support_email: e.target.value }))}
                    placeholder="support@yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_phone">Support Phone</Label>
                  <Input
                    id="support_phone"
                    value={config.support_phone}
                    onChange={(e) => setConfig(prev => ({ ...prev, support_phone: e.target.value }))}
                    placeholder="+1-555-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
                  <Input
                    id="privacy_policy_url"
                    value={config.privacy_policy_url}
                    onChange={(e) => setConfig(prev => ({ ...prev, privacy_policy_url: e.target.value }))}
                    placeholder="/privacy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms_url">Terms of Service URL</Label>
                  <Input
                    id="terms_url"
                    value={config.terms_url}
                    onChange={(e) => setConfig(prev => ({ ...prev, terms_url: e.target.value }))}
                    placeholder="/terms"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Advanced Customization
              </CardTitle>
              <CardDescription>Custom CSS and advanced styling options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login_background_url">Login Background Image URL</Label>
                <Input
                  id="login_background_url"
                  value={config.login_background_url}
                  onChange={(e) => setConfig(prev => ({ ...prev, login_background_url: e.target.value }))}
                  placeholder="https://example.com/background.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_css">Custom CSS</Label>
                <Textarea
                  id="custom_css"
                  value={config.custom_css}
                  onChange={(e) => setConfig(prev => ({ ...prev, custom_css: e.target.value }))}
                  placeholder="/* Your custom CSS here */"
                  className="font-mono min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Advanced users can add custom CSS to further customize the appearance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>Configure your custom domain settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom_domain">Custom Domain</Label>
                <Input
                  id="custom_domain"
                  value={config.custom_domain}
                  onChange={(e) => setConfig(prev => ({ ...prev, custom_domain: e.target.value }))}
                  placeholder="yourcompany.com"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your custom domain without https://
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ssl_enabled"
                  checked={config.ssl_enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ssl_enabled: checked }))}
                />
                <Label htmlFor="ssl_enabled">SSL Certificate Enabled</Label>
              </div>
              
              {config.custom_domain && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium">Domain Configuration Required</h4>
                  <p className="text-sm text-muted-foreground">
                    To use your custom domain, please add the following CNAME record to your DNS:
                  </p>
                  <div className="bg-background p-2 rounded border font-mono text-sm">
                    <strong>Type:</strong> CNAME<br/>
                    <strong>Name:</strong> {config.custom_domain}<br/>
                    <strong>Value:</strong> siteboss.app
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhiteLabelConfig;