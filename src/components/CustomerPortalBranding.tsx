
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Palette,
  Upload,
  Eye,
  Download,
  Trash2,
  Image as ImageIcon,
  Type,
  Code,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingConfig {
  id?: number;
  customer_id: number;
  logo_file_id?: number;
  company_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  custom_css: string;
  favicon_file_id?: number;
  created_at?: string;
  updated_at?: string;
}

const CustomerPortalBranding: React.FC = () => {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    customer_id: 1,
    company_name: '',
    primary_color: '#3B82F6',
    secondary_color: '#64748B',
    accent_color: '#10B981',
    font_family: 'Inter',
    custom_css: ''
  });
  
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [faviconUrl, setFaviconUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
    'Poppins', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather'
  ];

  const colorPresets = [
    { name: 'Blue Ocean', primary: '#3B82F6', secondary: '#64748B', accent: '#10B981' },
    { name: 'Purple Magic', primary: '#8B5CF6', secondary: '#6B7280', accent: '#F59E0B' },
    { name: 'Green Forest', primary: '#10B981', secondary: '#6B7280', accent: '#3B82F6' },
    { name: 'Orange Sunset', primary: '#F97316', secondary: '#71717A', accent: '#EF4444' },
    { name: 'Pink Blossom', primary: '#EC4899', secondary: '#6B7280', accent: '#8B5CF6' },
    { name: 'Dark Professional', primary: '#1F2937', secondary: '#6B7280', accent: '#3B82F6' }
  ];

  useEffect(() => {
    loadBrandingConfig();
  }, []);

  const loadBrandingConfig = async () => {
    try {
      const { data: configData, error } = await window.ezsite.apis.tablePage(35466, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          { name: 'customer_id', op: 'Equal', value: 1 }
        ]
      });

      if (!error && configData?.List?.length > 0) {
        const config = configData.List[0];
        setBrandingConfig(config);

        // Load logo and favicon URLs if they exist
        if (config.logo_file_id) {
          const { data: logoUrlData } = await window.ezsite.apis.getUploadUrl(config.logo_file_id);
          if (logoUrlData) setLogoUrl(logoUrlData);
        }

        if (config.favicon_file_id) {
          const { data: faviconUrlData } = await window.ezsite.apis.getUploadUrl(config.favicon_file_id);
          if (faviconUrlData) setFaviconUrl(faviconUrlData);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error loading branding config',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveBrandingConfig = async () => {
    setIsSaving(true);
    try {
      const configToSave = {
        ...brandingConfig,
        updated_at: new Date().toISOString()
      };

      if (brandingConfig.id) {
        // Update existing config
        await window.ezsite.apis.tableUpdate(35466, {
          ID: brandingConfig.id,
          ...configToSave
        });
      } else {
        // Create new config
        const result = await window.ezsite.apis.tableCreate(35466, {
          ...configToSave,
          created_at: new Date().toISOString()
        });
        setBrandingConfig(prev => ({ ...prev, id: result.data?.ID }));
      }

      toast({
        title: 'Branding saved',
        description: 'Your branding configuration has been saved successfully.'
      });

      // Apply branding to current page
      applyBrandingToPage();

    } catch (error: any) {
      toast({
        title: 'Error saving branding',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFile = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const { data: fileId, error } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (error) throw new Error(error);

      const { data: fileUrl } = await window.ezsite.apis.getUploadUrl(fileId);

      if (type === 'logo') {
        setBrandingConfig(prev => ({ ...prev, logo_file_id: fileId }));
        setLogoUrl(fileUrl);
      } else {
        setBrandingConfig(prev => ({ ...prev, favicon_file_id: fileId }));
        setFaviconUrl(fileUrl);
      }

      toast({
        title: 'File uploaded',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully.`
      });

    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const applyBrandingToPage = () => {
    // Apply CSS variables to the current page for preview
    const root = document.documentElement;
    root.style.setProperty('--primary', brandingConfig.primary_color);
    root.style.setProperty('--secondary', brandingConfig.secondary_color);
    root.style.setProperty('--accent', brandingConfig.accent_color);
    
    // Apply font family
    root.style.setProperty('--font-family', brandingConfig.font_family);
    
    // Apply custom CSS
    let customStyleElement = document.getElementById('custom-branding-css');
    if (!customStyleElement) {
      customStyleElement = document.createElement('style');
      customStyleElement.id = 'custom-branding-css';
      document.head.appendChild(customStyleElement);
    }
    customStyleElement.textContent = brandingConfig.custom_css;
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setBrandingConfig(prev => ({
      ...prev,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent
    }));
  };

  const exportBrandingConfig = () => {
    const exportData = {
      ...brandingConfig,
      logo_url: logoUrl,
      favicon_url: faviconUrl
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `branding-config-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const PreviewFrame = () => (
    <div className={`
      border rounded-lg overflow-hidden transition-all duration-300
      ${previewMode === 'desktop' ? 'w-full h-[600px]' : ''}
      ${previewMode === 'tablet' ? 'w-[768px] h-[600px] mx-auto' : ''}
      ${previewMode === 'mobile' ? 'w-[375px] h-[600px] mx-auto' : ''}
    `}>
      <div 
        className="h-full bg-white"
        style={{
          '--primary': brandingConfig.primary_color,
          '--secondary': brandingConfig.secondary_color,
          '--accent': brandingConfig.accent_color,
          fontFamily: brandingConfig.font_family
        } as React.CSSProperties}
      >
        {/* Preview Header */}
        <div 
          className="h-16 px-4 flex items-center justify-between border-b"
          style={{ backgroundColor: brandingConfig.primary_color, color: 'white' }}
        >
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
            )}
            <span className="text-lg font-semibold">
              {brandingConfig.company_name || 'Your Company'}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/20"
          >
            Menu
          </Button>
        </div>

        {/* Preview Content */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: brandingConfig.primary_color }}>
              Welcome to Your Portal
            </h1>
            <p style={{ color: brandingConfig.secondary_color }}>
              This is how your branded customer portal will look with the current settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-2" style={{ color: brandingConfig.primary_color }}>
                Primary Content
              </h3>
              <p className="text-sm" style={{ color: brandingConfig.secondary_color }}>
                Sample content using your secondary color.
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: brandingConfig.accent_color + '20' }}>
              <h3 className="font-semibold mb-2" style={{ color: brandingConfig.accent_color }}>
                Accent Section
              </h3>
              <p className="text-sm" style={{ color: brandingConfig.secondary_color }}>
                Highlighted content with your accent color.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button style={{ backgroundColor: brandingConfig.primary_color, color: 'white' }}>
              Primary Button
            </Button>
            <Button 
              variant="outline" 
              style={{ 
                borderColor: brandingConfig.accent_color, 
                color: brandingConfig.accent_color 
              }}
            >
              Accent Button
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <h2 className="text-2xl font-bold tracking-tight">White-label Branding</h2>
          <p className="text-muted-foreground">
            Customize your portal's appearance and branding
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBrandingConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Branding Preview</span>
                  <div className="flex gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <PreviewFrame />
            </DialogContent>
          </Dialog>
          <Button onClick={saveBrandingConfig} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo & Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo & Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={brandingConfig.company_name}
                onChange={(e) => setBrandingConfig(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {logoUrl ? (
                    <div className="space-y-2">
                      <img src={logoUrl} alt="Logo" className="h-12 mx-auto" />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) uploadFile(file, 'logo');
                            };
                            input.click();
                          }}
                        >
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setLogoUrl('');
                            setBrandingConfig(prev => ({ ...prev, logo_file_id: undefined }));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) uploadFile(file, 'logo');
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload Logo</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {faviconUrl ? (
                    <div className="space-y-2">
                      <img src={faviconUrl} alt="Favicon" className="h-8 mx-auto" />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) uploadFile(file, 'favicon');
                            };
                            input.click();
                          }}
                        >
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFaviconUrl('');
                            setBrandingConfig(prev => ({ ...prev, favicon_file_id: undefined }));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/x-icon,image/png';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) uploadFile(file, 'favicon');
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Upload Favicon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Scheme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => applyColorPreset(preset)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={brandingConfig.primary_color}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={brandingConfig.primary_color}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={brandingConfig.secondary_color}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={brandingConfig.secondary_color}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#64748B"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={brandingConfig.accent_color}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={brandingConfig.accent_color}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, accent_color: e.target.value }))}
                    placeholder="#10B981"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <select
                value={brandingConfig.font_family}
                onChange={(e) => setBrandingConfig(prev => ({ ...prev, font_family: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                {fontOptions.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 border rounded-lg" style={{ fontFamily: brandingConfig.font_family }}>
              <h3 className="font-bold text-lg mb-2">Font Preview</h3>
              <p className="text-sm text-muted-foreground mb-2">
                This is how your selected font will appear in headings and body text.
              </p>
              <p className="text-xs">
                The quick brown fox jumps over the lazy dog. 123456789
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom CSS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Custom CSS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Additional Styles</Label>
              <Textarea
                value={brandingConfig.custom_css}
                onChange={(e) => setBrandingConfig(prev => ({ ...prev, custom_css: e.target.value }))}
                placeholder="/* Your custom CSS here */"
                className="font-mono text-sm"
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Add custom CSS to further customize your portal's appearance. 
                Use CSS variables like --primary, --secondary, and --accent for consistent theming.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <PreviewFrame />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPortalBranding;
