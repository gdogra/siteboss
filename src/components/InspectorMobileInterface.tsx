
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  MapPin,
  Navigation,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Plus,
  Trash2,
  Save,
  Upload,
  PhoneCall,
  MessageSquare,
  Calendar,
  User,
  Home,
  Thermometer,
  CloudRain,
  Sun,
  Wind } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Inspection {
  id?: number;
  permit_application_id: number;
  inspection_type: string;
  inspector_user_id: number;
  scheduled_at: string;
  completed_at?: string;
  status: string;
  result?: string;
  notes?: string;
  violations?: string;
  checklist_data?: string;
  photos?: string;
  gps_coordinates?: string;
  weather_conditions?: string;
  reinspection_required: boolean;
  next_inspection_date?: string;
}

interface Violation {
  id?: string;
  code: string;
  type: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  photos: string[];
  notes: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
  checked: boolean;
  notes: string;
  photos: string[];
}

interface WeatherData {
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
}

const InspectorMobileInterface = () => {
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{lat: number;lng: number;} | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'inspection' | 'checklist' | 'violations' | 'photos'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInspections();
    getCurrentLocation();
  }, []);

  const loadInspections = async () => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (!userInfo.data) return;

      const { data: inspectionsData, error } = await window.ezsite.apis.tablePage(35424, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'scheduled_at',
        IsAsc: true,
        Filters: [
        { name: 'inspector_user_id', op: 'Equal', value: userInfo.data.ID },
        { name: 'status', op: 'StringContains', value: 'scheduled' }]

      });

      if (error) throw error;
      setInspections(inspectionsData?.List || []);
    } catch (error) {
      console.error('Error loading inspections:', error);
      toast({
        title: "Error",
        description: "Failed to load inspections",
        variant: "destructive"
      });
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          getWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Unable to get current location",
            variant: "destructive"
          });
        }
      );
    }
  };

  const getWeatherData = async (lat: number, lng: number) => {
    // Simulate weather data - in real app, would call weather API
    setWeather({
      temperature: '72°F',
      condition: 'Clear',
      humidity: '45%',
      windSpeed: '8 mph'
    });
  };

  const initializeChecklist = (inspectionType: string) => {
    // Initialize checklist based on inspection type
    const defaultChecklist: ChecklistItem[] = [
    {
      id: '1',
      category: 'Safety',
      item: 'Personal protective equipment available and in use',
      required: true,
      checked: false,
      notes: '',
      photos: []
    },
    {
      id: '2',
      category: 'Safety',
      item: 'Work area properly secured',
      required: true,
      checked: false,
      notes: '',
      photos: []
    },
    {
      id: '3',
      category: 'Code Compliance',
      item: 'Work matches approved plans',
      required: true,
      checked: false,
      notes: '',
      photos: []
    },
    {
      id: '4',
      category: 'Code Compliance',
      item: 'Proper permits posted on site',
      required: true,
      checked: false,
      notes: '',
      photos: []
    },
    {
      id: '5',
      category: 'Quality',
      item: 'Materials meet specification requirements',
      required: false,
      checked: false,
      notes: '',
      photos: []
    }];


    setChecklist(defaultChecklist);
  };

  const startInspection = (inspection: Inspection) => {
    setActiveInspection({
      ...inspection,
      gps_coordinates: location ? `${location.lat},${location.lng}` : '',
      weather_conditions: weather ? JSON.stringify(weather) : ''
    });
    setCurrentView('inspection');
    initializeChecklist(inspection.inspection_type);
    setViolations([]);
    setPhotos([]);
  };

  const capturePhoto = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      setLoading(true);

      // Upload photo
      const { data: fileId, error: uploadError } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (uploadError) throw uploadError;

      const { data: fileUrl, error: urlError } = await window.ezsite.apis.getUploadUrl(fileId);
      if (urlError) throw urlError;

      setPhotos((prev) => [...prev, fileUrl]);

      toast({
        title: "Photo Captured",
        description: "Photo uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addViolation = () => {
    const newViolation: Violation = {
      id: Date.now().toString(),
      code: '',
      type: '',
      description: '',
      severity: 'minor',
      photos: [],
      notes: ''
    };
    setViolations((prev) => [...prev, newViolation]);
  };

  const updateViolation = (id: string, updates: Partial<Violation>) => {
    setViolations((prev) => prev.map((v) => v.id === id ? { ...v, ...updates } : v));
  };

  const removeViolation = (id: string) => {
    setViolations((prev) => prev.filter((v) => v.id !== id));
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklist((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
  };

  const completeInspection = async () => {
    if (!activeInspection) return;

    try {
      setLoading(true);

      const completedInspection: Inspection = {
        ...activeInspection,
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: violations.some((v) => v.severity === 'critical') ? 'failed' :
        violations.some((v) => v.severity === 'major') ? 'conditional' : 'passed',
        violations: JSON.stringify(violations),
        checklist_data: JSON.stringify(checklist),
        photos: JSON.stringify(photos),
        reinspection_required: violations.some((v) => v.severity === 'critical' || v.severity === 'major'),
        updated_at: new Date().toISOString()
      };

      // Update inspection
      const { error: updateError } = await window.ezsite.apis.tableUpdate(35424, completedInspection);
      if (updateError) throw updateError;

      // Create violation records
      for (const violation of violations) {
        await window.ezsite.apis.tableCreate(35505, {
          permit_inspection_id: activeInspection.id,
          permit_application_id: activeInspection.permit_application_id,
          violation_code: violation.code,
          violation_type: violation.type,
          description: violation.description,
          severity: violation.severity,
          status: 'open',
          identified_at: new Date().toISOString(),
          inspector_notes: violation.notes,
          photos: JSON.stringify(violation.photos),
          created_by: activeInspection.inspector_user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      toast({
        title: "Inspection Complete",
        description: `Inspection completed with result: ${completedInspection.result}`
      });

      setActiveInspection(null);
      setCurrentView('list');
      loadInspections();

    } catch (error) {
      console.error('Error completing inspection:', error);
      toast({
        title: "Error",
        description: "Failed to complete inspection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':return 'bg-blue-100 text-blue-800';
      case 'in_progress':return 'bg-yellow-100 text-yellow-800';
      case 'completed':return 'bg-green-100 text-green-800';
      case 'cancelled':return 'bg-red-100 text-red-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':return 'bg-red-100 text-red-800';
      case 'major':return 'bg-orange-100 text-orange-800';
      case 'minor':return 'bg-yellow-100 text-yellow-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  // Mobile-first responsive design
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Inspector App</h1>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            {location ? 'Located' : 'No GPS'}
          </div>
        </div>
        {weather &&
        <div className="flex items-center justify-between mt-2 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              {weather.condition} {weather.temperature}
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              {weather.windSpeed}
            </div>
          </div>
        }
      </div>

      {/* Navigation */}
      {activeInspection && currentView !== 'list' &&
      <div className="bg-gray-100 p-2">
          <div className="flex gap-1 text-xs">
            <Button
            variant={currentView === 'inspection' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('inspection')}>

              Overview
            </Button>
            <Button
            variant={currentView === 'checklist' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('checklist')}>

              Checklist
            </Button>
            <Button
            variant={currentView === 'violations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('violations')}>

              Violations
            </Button>
            <Button
            variant={currentView === 'photos' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentView('photos')}>

              Photos
            </Button>
          </div>
        </div>
      }

      {/* Content */}
      <div className="p-4">
        {/* Inspections List */}
        {currentView === 'list' &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today's Inspections</h2>
              <Button size="sm" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>

            {inspections.length > 0 ?
          <div className="space-y-3">
                {inspections.map((inspection) =>
            <Card key={inspection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(inspection.status)}>
                            {inspection.status.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            #{inspection.permit_application_id}
                          </span>
                        </div>
                        
                        <h3 className="font-medium">{inspection.inspection_type}</h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(inspection.scheduled_at).toLocaleString()}
                        </div>

                        <Button
                    className="w-full mt-3"
                    onClick={() => startInspection(inspection)}>

                          Start Inspection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
            )}
              </div> :

          <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No inspections scheduled for today</p>
                </CardContent>
              </Card>
          }
          </div>
        }

        {/* Inspection Overview */}
        {currentView === 'inspection' && activeInspection &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('list')}>

                ← Back
              </Button>
              <Button
              variant="outline"
              size="sm"
              onClick={completeInspection}
              disabled={loading}>

                Complete
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {activeInspection.inspection_type}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Inspection Notes</Label>
                  <Textarea
                  id="notes"
                  value={activeInspection.notes || ''}
                  onChange={(e) => setActiveInspection((prev) => prev ? {
                    ...prev,
                    notes: e.target.value
                  } : null)}
                  placeholder="Add your inspection notes..."
                  rows={4} />

                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-600">GPS Location</Label>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'No location'}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Weather</Label>
                    <div className="flex items-center gap-1">
                      <Sun className="w-3 h-3" />
                      <span>{weather ? `${weather.condition} ${weather.temperature}` : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-green-600">{checklist.filter((item) => item.checked).length}</div>
                <div className="text-xs text-gray-600">Items Checked</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-red-600">{violations.length}</div>
                <div className="text-xs text-gray-600">Violations</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{photos.length}</div>
                <div className="text-xs text-gray-600">Photos</div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setCurrentView('checklist')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Checklist
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('violations')}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Violations
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('photos')}>
                <Camera className="w-4 h-4 mr-2" />
                Photos
              </Button>
              <Button variant="outline" onClick={capturePhoto}>
                <Plus className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            </div>

            <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden" />

          </div>
        }

        {/* Checklist View */}
        {currentView === 'checklist' && activeInspection &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Inspection Checklist</h2>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('inspection')}>

                ← Back
              </Button>
            </div>

            <div className="space-y-3">
              {checklist.map((item) =>
            <Card key={item.id} className={item.required ? 'border-l-4 border-l-red-500' : ''}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                      updateChecklistItem(item.id, { checked: !!checked })
                      }
                      className="mt-0.5" />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{item.item}</p>
                            {item.required &&
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                        }
                          </div>
                          <p className="text-xs text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      
                      <Textarea
                    value={item.notes}
                    onChange={(e) =>
                    updateChecklistItem(item.id, { notes: e.target.value })
                    }
                    placeholder="Add notes..."
                    rows={2}
                    className="text-sm" />

                    </div>
                  </CardContent>
                </Card>
            )}
            </div>
          </div>
        }

        {/* Violations View */}
        {currentView === 'violations' && activeInspection &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Violations</h2>
              <div className="flex gap-2">
                <Button
                size="sm"
                onClick={addViolation}>

                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('inspection')}>

                  ← Back
                </Button>
              </div>
            </div>

            {violations.length > 0 ?
          <div className="space-y-3">
                {violations.map((violation) =>
            <Card key={violation.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity.toUpperCase()}
                        </Badge>
                        <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeViolation(violation.id!)}>

                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        <div>
                          <Label className="text-xs">Violation Code</Label>
                          <Input
                      value={violation.code}
                      onChange={(e) => updateViolation(violation.id!, { code: e.target.value })}
                      placeholder="e.g., SAFETY-001"
                      className="text-sm" />

                        </div>

                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select
                      value={violation.type}
                      onValueChange={(value) => updateViolation(violation.id!, { type: value })}>

                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="safety">Safety</SelectItem>
                              <SelectItem value="code">Code Compliance</SelectItem>
                              <SelectItem value="structural">Structural</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                              <SelectItem value="plumbing">Plumbing</SelectItem>
                              <SelectItem value="environmental">Environmental</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Severity</Label>
                          <Select
                      value={violation.severity}
                      onValueChange={(value) => updateViolation(violation.id!, { severity: value as any })}>

                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minor">Minor</SelectItem>
                              <SelectItem value="major">Major</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                      value={violation.description}
                      onChange={(e) => updateViolation(violation.id!, { description: e.target.value })}
                      placeholder="Describe the violation..."
                      rows={3}
                      className="text-sm" />

                        </div>

                        <div>
                          <Label className="text-xs">Notes</Label>
                          <Textarea
                      value={violation.notes}
                      onChange={(e) => updateViolation(violation.id!, { notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={2}
                      className="text-sm" />

                        </div>
                      </div>
                    </CardContent>
                  </Card>
            )}
              </div> :

          <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-600">No violations found</p>
                  <Button className="mt-3" onClick={addViolation}>
                    <Plus className="w-4 h-4 mr-2" />
                    Report Violation
                  </Button>
                </CardContent>
              </Card>
          }
          </div>
        }

        {/* Photos View */}
        {currentView === 'photos' && activeInspection &&
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Photos</h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={capturePhoto}>
                  <Camera className="w-4 h-4 mr-1" />
                  Take Photo
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('inspection')}>

                  ← Back
                </Button>
              </div>
            </div>

            {photos.length > 0 ?
          <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) =>
            <div key={index} className="relative aspect-square">
                    <img
                src={photo}
                alt={`Inspection photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg" />

                    <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 w-8 h-8 p-0"
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}>

                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
            )}
              </div> :

          <Card>
                <CardContent className="text-center py-12">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No photos captured yet</p>
                  <Button onClick={capturePhoto}>
                    <Camera className="w-4 h-4 mr-2" />
                    Take First Photo
                  </Button>
                </CardContent>
              </Card>
          }
          </div>
        }
      </div>
    </div>);

};

export default InspectorMobileInterface;