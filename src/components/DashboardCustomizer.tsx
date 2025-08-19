
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Move, 
  Eye, 
  EyeOff,
  Grid,
  Layout,
  Palette,
  Save,
  Undo
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Widget {
  id: string;
  name: string;
  type: 'kpi' | 'chart' | 'table' | 'alert';
  position: { x: number; y: number; w: number; h: number };
  config: any;
  visible: boolean;
}

interface DashboardLayout {
  id?: number;
  name: string;
  widgets: Widget[];
  settings: {
    theme: string;
    refreshInterval: number;
    showGrid: boolean;
  };
}

interface DashboardCustomizerProps {
  userId: number;
  roleCode: string;
  onLayoutChange?: (layout: DashboardLayout) => void;
}

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  userId,
  roleCode,
  onLayoutChange
}) => {
  const [layout, setLayout] = useState<DashboardLayout>({
    name: 'My Dashboard',
    widgets: [],
    settings: {
      theme: 'light',
      refreshInterval: 30,
      showGrid: true
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const availableWidgets = [
    { id: 'revenue-kpi', name: 'Total Revenue', type: 'kpi', category: 'financial' },
    { id: 'leads-kpi', name: 'Lead Conversion', type: 'kpi', category: 'sales' },
    { id: 'projects-kpi', name: 'Active Projects', type: 'kpi', category: 'operations' },
    { id: 'revenue-chart', name: 'Revenue Trend', type: 'chart', category: 'financial' },
    { id: 'leads-chart', name: 'Leads Pipeline', type: 'chart', category: 'sales' },
    { id: 'alerts-panel', name: 'System Alerts', type: 'alert', category: 'monitoring' }
  ];

  const loadDashboardLayout = async () => {
    try {
      // In a real implementation, this would load from the analytics_dashboards table
      const { data, error } = await window.ezsite.apis.tablePage(35583, {
        PageNo: 1,
        PageSize: 10,
        OrderByField: "ID",
        IsAsc: false,
        Filters: [
          { name: "user_id", op: "Equal", value: userId },
          { name: "is_active", op: "Equal", value: true }
        ]
      });

      if (error) throw new Error(error);

      if (data.List && data.List.length > 0) {
        const savedLayout = data.List[0];
        const parsedLayout = JSON.parse(savedLayout.layout_config || '{}');
        setLayout({
          id: savedLayout.id,
          name: savedLayout.name,
          widgets: parsedLayout.widgets || [],
          settings: parsedLayout.settings || layout.settings
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    }
  };

  const saveDashboardLayout = async () => {
    try {
      setSaving(true);
      const layoutConfig = JSON.stringify({
        widgets: layout.widgets,
        settings: layout.settings
      });

      const layoutData = {
        name: layout.name,
        user_id: userId,
        role_code: roleCode,
        layout_config: layoutConfig,
        is_default: true,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      let result;
      if (layout.id) {
        // Update existing
        result = await window.ezsite.apis.tableUpdate(35583, {
          ID: layout.id,
          ...layoutData
        });
      } else {
        // Create new
        result = await window.ezsite.apis.tableCreate(35583, {
          ...layoutData,
          created_at: new Date().toISOString()
        });
      }

      if (result.error) throw new Error(result.error);

      toast({
        title: "Dashboard Saved",
        description: "Your dashboard layout has been saved successfully.",
      });

      if (onLayoutChange) {
        onLayoutChange(layout);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save dashboard layout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addWidget = (widgetType: string) => {
    const widget: Widget = {
      id: `${widgetType}-${Date.now()}`,
      name: availableWidgets.find(w => w.id === widgetType)?.name || 'New Widget',
      type: availableWidgets.find(w => w.id === widgetType)?.type as any || 'kpi',
      position: { x: 0, y: 0, w: 4, h: 3 },
      config: {},
      visible: true
    };

    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget]
    }));
  };

  const removeWidget = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    }));
  };

  const updateSettings = (key: string, value: any) => {
    setLayout(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  useEffect(() => {
    if (isOpen) {
      loadDashboardLayout();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Customize your dashboard layout, widgets, and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="widgets" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="widgets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Widgets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Widgets</CardTitle>
                  <CardDescription>
                    Add widgets to your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availableWidgets.map(widget => (
                    <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{widget.name}</p>
                        <p className="text-sm text-muted-foreground">{widget.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{widget.type}</Badge>
                        <Button
                          size="sm"
                          onClick={() => addWidget(widget.id)}
                          disabled={layout.widgets.some(w => w.name === widget.name)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Current Widgets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Widgets ({layout.widgets.length})</CardTitle>
                  <CardDescription>
                    Manage your dashboard widgets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {layout.widgets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No widgets added yet
                    </p>
                  ) : (
                    layout.widgets.map(widget => (
                      <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{widget.name}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {widget.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                          >
                            {widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeWidget(widget.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Layout Configuration</CardTitle>
                <CardDescription>
                  Configure dashboard layout and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dashboard-name">Dashboard Name</Label>
                    <Input
                      id="dashboard-name"
                      value={layout.name}
                      onChange={(e) => setLayout(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Grid Display</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layout.settings.showGrid}
                        onCheckedChange={(checked) => updateSettings('showGrid', checked)}
                      />
                      <span className="text-sm">Show grid lines</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Widget Preview</h4>
                  <div className="grid grid-cols-4 gap-2 min-h-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    {layout.widgets.map(widget => (
                      <div
                        key={widget.id}
                        className={`p-2 border rounded text-xs text-center ${
                          widget.visible ? 'bg-primary/10 border-primary' : 'bg-muted border-muted-foreground'
                        }`}
                      >
                        {widget.name}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard Settings</CardTitle>
                <CardDescription>
                  Configure global dashboard preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={layout.settings.theme}
                      onValueChange={(value) => updateSettings('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <Select
                      value={layout.settings.refreshInterval.toString()}
                      onValueChange={(value) => updateSettings('refreshInterval', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            <Undo className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button onClick={saveDashboardLayout} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Layout'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCustomizer;
