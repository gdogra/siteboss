
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Target,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Geofence {
  id: number;
  name: string;
  description: string;
  project_id: number;
  geometry_type: 'circle' | 'polygon';
  center_latitude: number;
  center_longitude: number;
  radius: number;
  polygon_coordinates: string;
  is_active: boolean;
  violation_tolerance: number;
  created_by: number;
}

interface GeofenceViolation {
  id: number;
  session_id: number;
  geofence_id: number;
  user_id: number;
  violation_type: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  duration_minutes: number;
  resolved: boolean;
}

const GeofenceManager: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id: '',
    geometry_type: 'circle' as 'circle' | 'polygon',
    center_latitude: '',
    center_longitude: '',
    radius: '100',
    is_active: true,
    violation_tolerance: '5'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load geofences
      const geofencesResponse = await window.ezsite.apis.tablePage(35508, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: []
      });

      if (geofencesResponse.error) throw geofencesResponse.error;
      setGeofences(geofencesResponse.data?.List || []);

      // Load projects
      const projectsResponse = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'name',
        IsAsc: true,
        Filters: []
      });

      if (projectsResponse.error) throw projectsResponse.error;
      setProjects(projectsResponse.data?.List || []);

      // Load recent violations (simulated for now)
      loadViolations();

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load geofence data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadViolations = async () => {
    // This would query actual violations from location data
    // For now, we'll simulate some violations
    try {
      const locationsResponse = await window.ezsite.apis.tablePage(35438, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'timestamp',
        IsAsc: false,
        Filters: []
      });

      if (locationsResponse.data?.List) {
        const simulatedViolations = locationsResponse.data.List
          .filter((location: any) => Math.random() > 0.95) // Simulate 5% violation rate
          .map((location: any, index: number) => ({
            id: index + 1,
            session_id: location.session_id,
            geofence_id: 1, // Assume first geofence
            user_id: location.user_id,
            violation_type: 'exit',
            timestamp: location.timestamp,
            latitude: location.latitude,
            longitude: location.longitude,
            duration_minutes: Math.floor(Math.random() * 30) + 1,
            resolved: Math.random() > 0.3
          }));

        setViolations(simulatedViolations);
      }
    } catch (error) {
      console.error('Error loading violations:', error);
    }
  };

  const handleSave = async () => {
    try {
      const userData = await window.ezsite.apis.getUserInfo();
      if (userData.error) throw userData.error;

      const saveData = {
        name: formData.name,
        description: formData.description,
        project_id: parseInt(formData.project_id),
        geometry_type: formData.geometry_type,
        center_latitude: parseFloat(formData.center_latitude),
        center_longitude: parseFloat(formData.center_longitude),
        radius: parseFloat(formData.radius),
        polygon_coordinates: '', // Would be populated for polygon type
        is_active: formData.is_active,
        violation_tolerance: parseFloat(formData.violation_tolerance),
        created_by: userData.data.ID
      };

      let response;
      if (selectedGeofence) {
        response = await window.ezsite.apis.tableUpdate(35508, {
          ID: selectedGeofence.id,
          ...saveData
        });
      } else {
        response = await window.ezsite.apis.tableCreate(35508, saveData);
      }

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: `Geofence ${selectedGeofence ? 'updated' : 'created'} successfully`
      });

      setIsDialogOpen(false);
      resetForm();
      loadData();

    } catch (error) {
      console.error('Error saving geofence:', error);
      toast({
        title: 'Error',
        description: 'Failed to save geofence',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description,
      project_id: geofence.project_id.toString(),
      geometry_type: geofence.geometry_type,
      center_latitude: geofence.center_latitude.toString(),
      center_longitude: geofence.center_longitude.toString(),
      radius: geofence.radius.toString(),
      is_active: geofence.is_active,
      violation_tolerance: geofence.violation_tolerance.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this geofence?')) return;

    try {
      const response = await window.ezsite.apis.tableDelete(35508, { ID: id });
      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: 'Geofence deleted successfully'
      });

      loadData();
    } catch (error) {
      console.error('Error deleting geofence:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete geofence',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (geofence: Geofence) => {
    try {
      const response = await window.ezsite.apis.tableUpdate(35508, {
        ID: geofence.id,
        is_active: !geofence.is_active
      });

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: `Geofence ${!geofence.is_active ? 'activated' : 'deactivated'}`
      });

      loadData();
    } catch (error) {
      console.error('Error toggling geofence:', error);
      toast({
        title: 'Error',
        description: 'Failed to update geofence',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setSelectedGeofence(null);
    setFormData({
      name: '',
      description: '',
      project_id: '',
      geometry_type: 'circle',
      center_latitude: '',
      center_longitude: '',
      radius: '100',
      is_active: true,
      violation_tolerance: '5'
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            center_latitude: position.coords.latitude.toFixed(6),
            center_longitude: position.coords.longitude.toFixed(6)
          }));
          
          toast({
            title: 'Location Set',
            description: 'Current location has been set as geofence center'
          });
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Failed to get current location',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project ? (project as any).name : 'Unknown Project';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Geofences</p>
                <p className="text-2xl font-bold">{geofences.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Geofences</p>
                <p className="text-2xl font-bold">
                  {geofences.filter(g => g.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Violations</p>
                <p className="text-2xl font-bold">{violations.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold">
                  {violations.filter(v => !v.resolved).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geofence Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Geofence Management</CardTitle>
              <CardDescription>Create and manage geographic boundaries for work areas</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Geofence
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedGeofence ? 'Edit Geofence' : 'Create New Geofence'}
                  </DialogTitle>
                  <DialogDescription>
                    Define a geographic boundary to monitor worker locations
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Site entrance"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select
                        value={formData.project_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project: any) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description of the geofenced area"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Geometry Type</Label>
                    <Select
                      value={formData.geometry_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, geometry_type: value as 'circle' | 'polygon' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Center Latitude</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={formData.center_latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, center_latitude: e.target.value }))}
                        placeholder="40.7128"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Center Longitude</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={formData.center_longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, center_longitude: e.target.value }))}
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Use Current Location
                    </Button>
                  </div>

                  {formData.geometry_type === 'circle' && (
                    <div className="space-y-2">
                      <Label>Radius (meters)</Label>
                      <Input
                        type="number"
                        value={formData.radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Violation Tolerance (minutes)</Label>
                      <Input
                        type="number"
                        value={formData.violation_tolerance}
                        onChange={(e) => setFormData(prev => ({ ...prev, violation_tolerance: e.target.value }))}
                        placeholder="5"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      {selectedGeofence ? 'Update' : 'Create'} Geofence
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {geofences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No geofences configured yet
            </div>
          ) : (
            <div className="space-y-4">
              {geofences.map((geofence) => (
                <div key={geofence.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{geofence.name}</h4>
                      <Badge variant={geofence.is_active ? 'default' : 'secondary'}>
                        {geofence.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {geofence.geometry_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {geofence.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Project: {getProjectName(geofence.project_id)} • 
                      Tolerance: {geofence.violation_tolerance}min
                      {geofence.geometry_type === 'circle' && ` • Radius: ${geofence.radius}m`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(geofence)}
                    >
                      {geofence.is_active ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(geofence)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(geofence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Recent Violations
          </CardTitle>
          <CardDescription>Geofence violations detected in location tracking</CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No violations detected
            </div>
          ) : (
            <div className="space-y-3">
              {violations.slice(0, 10).map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">
                        User {violation.user_id} exited geofence
                      </span>
                      {violation.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(violation.timestamp)} • 
                      Duration: {violation.duration_minutes} minutes • 
                      Session: {violation.session_id}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant={violation.resolved ? 'default' : 'destructive'}>
                      {violation.resolved ? 'Resolved' : 'Active'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeofenceManager;
