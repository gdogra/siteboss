import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import {
  Building2,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Users,
  FileText,
  Save,
  X,
  Trash2,
  Map
} from 'lucide-react';
import AddressForm from '@/components/AddressForm';
import { projectApi } from '@/services/api';
import InfoTooltip, { HelpTooltip, MetricTooltip } from '@/components/InfoTooltip';

const EditProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { getProject, updateProject, deleteProject } = useProjects();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [jobSites, setJobSites] = useState<any[]>([]);
  const [newSite, setNewSite] = useState({ name: '', address: '', latitude: '', longitude: '', street_address: '', city: '', state: '', postal_code: '', country: '' } as any);
  const [savingSite, setSavingSite] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editSite, setEditSite] = useState({ name: '', address: '', latitude: '', longitude: '', street_address: '', city: '', state: '', postal_code: '', country: '' } as any);
  const [users, setUsers] = useState<any[]>([]);
  const [siteGeoLoading, setSiteGeoLoading] = useState(false);
  const countryOptions = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'IN', name: 'India' },
  ];
  const usStates = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  const caProvinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

  // Reverse geocode helper for sites
  const reverseGeocode = async (lat: number, lng: number): Promise<{ formatted?: string; street?: string; city?: string; state?: string; postal?: string; country?: string } | null> => {
    // Try Google
    try {
      if ((window as any).google?.maps?.Geocoder) {
        const geocoder = new (window as any).google.maps.Geocoder();
        const result = await new Promise<any>((resolve) => {
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === 'OK' && results?.[0]) {
              const place = results[0];
              const comps: any[] = place.address_components || [];
              const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';
              resolve({
                formatted: place.formatted_address,
                street: [get('street_number'), get('route')].filter(Boolean).join(' '),
                city: get('locality') || get('sublocality') || get('postal_town'),
                state: get('administrative_area_level_1'),
                postal: get('postal_code'),
                country: get('country'),
              });
            } else { resolve(null); }
          });
        });
        if (result) return result;
      }
    } catch {}
    // Fallback to Nominatim
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await resp.json();
      const a = data?.address || {};
      return {
        formatted: data?.display_name,
        street: [a.house_number, a.road].filter(Boolean).join(' '),
        city: a.city || a.town || a.village || a.hamlet || '',
        state: a.state || '',
        postal: a.postcode || '',
        country: a.country || '',
      };
    } catch {}
    return null;
  };
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formatted_address: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    manager: '',
    budget: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    status: 'planning',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectType: 'residential',
    teamSize: '5'
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const project = getProject(projectId || '');
        if (project) {
          setFormData({
            name: project.name,
            description: project.description,
            location: project.location,
            streetAddress: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            manager: project.manager,
            budget: project.budget.toString(),
            startDate: project.startDate,
            endDate: project.endDate,
            priority: project.priority,
            status: project.status,
            clientName: project.clientName || '',
            clientEmail: project.clientEmail || '',
            clientPhone: project.clientPhone || '',
            projectType: project.projectType || 'residential',
            teamSize: project.teamSize.toString()
          });
          // Load structured fields from backend
          try {
            const resp = await projectApi.getProject(projectId!);
            const row: any = (resp as any).data;
            if (row) {
              setFormData(prev => ({
                ...prev,
                streetAddress: row.street_address || prev.streetAddress,
                city: row.city || prev.city,
                state: row.state || prev.state,
                postalCode: row.postal_code || prev.postalCode,
                country: row.country || prev.country,
              }));
            }
          } catch {}
        } else {
          // Project not found, redirect to projects page
          navigate('/projects');
          return;
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        navigate('/projects');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProject();
    // Load job sites for display
    const loadSites = async () => {
      if (!projectId) return;
      try {
        const resp = await projectApi.getProjectSites(projectId);
        const rows = (resp as any).data || [];
        setJobSites(rows);
      } catch (e) {
        // ignore
      }
    };
    loadSites();
    // Load users for supervisor selection
    const loadUsers = async () => {
      try {
        const resp = await userApi.getUsers();
        const rows = (resp as any).data || [];
        setUsers(rows);
      } catch {}
    };
    loadUsers();
  }, [projectId, navigate, getProject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build full address from structured fields
      const fullAddress = [
        formData.streetAddress || formData.location,
        formData.city,
        [formData.state, formData.postalCode].filter(Boolean).join(' '),
        formData.country,
      ].filter(Boolean).join(', ');

      // Persist to backend
      await projectApi.updateProject(projectId!, {
        name: formData.name,
        description: formData.description,
        address: fullAddress || formData.location,
        street_address: formData.streetAddress || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postalCode || undefined,
        country: formData.country || undefined,
        start_date: formData.startDate,
        end_date: formData.endDate,
        estimated_duration: undefined,
        status: formData.status === 'on-hold' ? 'on_hold' : formData.status,
        total_budget: parseFloat(formData.budget) || 0,
      });

      // Update local context
      updateProject(projectId!, {
        name: formData.name,
        description: formData.description,
        location: fullAddress || formData.location,
        manager: formData.manager,
        budget: parseFloat(formData.budget) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority as 'high' | 'medium' | 'low',
        status: formData.status as 'active' | 'planning' | 'on-hold' | 'completed',
        teamSize: parseInt(formData.teamSize) || 0,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        projectType: formData.projectType,
      });
      
      // Navigate back to projects page
      navigate('/projects');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Delete the project using the context
        deleteProject(projectId!);
        
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/projects" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Edit Project</h1>
                  <p className="text-xs text-muted-foreground">Modify project details</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                form="project-form" 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form id="project-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="renovation">Renovation</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="pl-10 min-h-[100px]"
                    placeholder="Describe the project scope and objectives"
                  />
                </div>
              </div>

              {/* Simplified Address Form */}
              <AddressForm
                data={{
                  formatted_address: formData.formatted_address,
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.postal_code,
                  country: formData.country,
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                }}
                onChange={(addressData) => {
                  setFormData(prev => ({ ...prev, ...addressData }));
                }}
                required={true}
                showCoordinates={true}
              />
          </CardContent>
        </Card>

        {/* Job Sites */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Job Sites</CardTitle>
              <HelpTooltip
                title="Project Job Sites"
                content="Multiple work locations within a single project. Each site can have its own supervisor, coordinates, and progress tracking."
                impact="Proper site management enables accurate progress tracking, resource allocation, and logistics coordination."
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add Site Form */}
            <div className="border rounded p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <Input placeholder="Name" value={newSite.name} onChange={(e) => setNewSite({ ...newSite, name: e.target.value })} />
                <AddressAutocomplete
                  value={newSite.address}
                  onChange={(v) => setNewSite({ ...newSite, address: v })}
                  onAddressSelect={(pick) => {
                    setNewSite({
                      ...newSite,
                      address: pick.formatted_address,
                      latitude: pick.lat !== undefined ? Number(pick.lat).toFixed(6) : (newSite as any).latitude,
                      longitude: pick.lon !== undefined ? Number(pick.lon).toFixed(6) : (newSite as any).longitude,
                      street_address: pick.street || (newSite as any).street_address,
                      city: pick.city || (newSite as any).city,
                      state: pick.state || (newSite as any).state,
                      postal_code: pick.postal_code || (newSite as any).postal_code,
                      country: pick.country || (newSite as any).country,
                    } as any);
                  }}
                  placeholder="Address"
                  countryBias={(newSite.country === 'United States' && 'US') || (newSite.country === 'Canada' && 'CA') || undefined}
                />
                <div className="flex gap-2">
                  <Input placeholder="Latitude" value={newSite.latitude} onChange={(e) => setNewSite({ ...newSite, latitude: e.target.value })} />
                  <Input placeholder="Longitude" value={newSite.longitude} onChange={(e) => setNewSite({ ...newSite, longitude: e.target.value })} />
                </div>
                <select
                  className="px-3 py-2 border border-input rounded-md bg-background"
                  value={newSite.site_supervisor_id || ''}
                  onChange={(e) => setNewSite({ ...newSite, site_supervisor_id: e.target.value })}
                >
                  <option value="">Supervisor</option>
                  {users.filter((u) => ['project_manager','foreman'].includes(u.role)).map((u) => (
                    <option key={u.id} value={u.id}>{u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.email}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {newSite.latitude && newSite.longitude ? `Lat: ${newSite.latitude}, Lng: ${newSite.longitude}` : 'Coordinates optional'}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    if (!('geolocation' in navigator)) {
                      alert('Geolocation not supported by your browser');
                      return;
                    }
                    setSiteGeoLoading(true);
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setNewSite((prev: any) => ({
                          ...prev,
                          latitude: Number(latitude.toFixed(6)),
                          longitude: Number(longitude.toFixed(6)),
                          address: prev.address || `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
                        }));
                        try {
                          const rev = await reverseGeocode(latitude, longitude);
                          if (rev) {
                            setNewSite((prev: any) => ({
                              ...prev,
                              address: rev.formatted || prev.address,
                              street_address: rev.street || prev.street_address,
                              city: rev.city || prev.city,
                              state: rev.state || prev.state,
                              postal_code: rev.postal || prev.postal_code,
                              country: rev.country || prev.country,
                            }));
                          }
                        } catch {}
                setSiteGeoLoading(false);
                      },
                      (err) => {
                        console.error('Geolocation error', err);
                        setSiteGeoLoading(false);
                        alert('Unable to get your location. Please grant permission or try again.');
                      },
                      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                    );
                  }}
                  disabled={siteGeoLoading}
                >
                  {siteGeoLoading ? 'Detecting…' : 'Use Current Location'}
                </Button>
              </div>
              <div className="flex justify-end">
                <Button size="sm" disabled={savingSite || !newSite.name.trim()} onClick={async () => {
                  if (!projectId) return;
                  try {
                    setSavingSite(true);
                    const payload: any = {
                      name: newSite.name.trim(),
                      address: newSite.address || undefined,
                      latitude: newSite.latitude ? Number(newSite.latitude) : undefined,
                      longitude: newSite.longitude ? Number(newSite.longitude) : undefined,
                      site_supervisor_id: newSite.site_supervisor_id || undefined,
                      street_address: newSite.street_address || undefined,
                      city: newSite.city || undefined,
                      state: newSite.state || undefined,
                      postal_code: newSite.postal_code || undefined,
                      country: newSite.country || undefined,
                    };
                    const resp = await projectApi.createProjectSite(projectId, payload);
                    const row = (resp as any).data;
                    setJobSites((prev) => [row, ...prev]);
                    setNewSite({ name: '', address: '', latitude: '', longitude: '' } as any);
              } catch (e) {
                    alert('Failed to add site');
                  } finally {
                    setSavingSite(false);
                  }
                }}>Add Site</Button>
              </div>
            </div>

            {jobSites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job sites recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {jobSites.map((s) => (
                  <li key={s.id} className="flex items-start justify-between border rounded p-2 gap-3">
                    <div className="text-sm flex-1">
                      {editingSiteId === s.id ? (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          <Input value={editSite.name} onChange={(e) => setEditSite({ ...editSite, name: e.target.value })} />
                          <AddressAutocomplete
                            value={editSite.address}
                            onChange={(v) => setEditSite({ ...editSite, address: v })}
                            onAddressSelect={(pick) => {
                              setEditSite({
                                ...editSite,
                                address: pick.formatted_address,
                                latitude: pick.lat !== undefined ? Number(pick.lat).toFixed(6) as any : (editSite as any).latitude,
                                longitude: pick.lon !== undefined ? Number(pick.lon).toFixed(6) as any : (editSite as any).longitude,
                                street_address: pick.street || (editSite as any).street_address,
                                city: pick.city || (editSite as any).city,
                                state: pick.state || (editSite as any).state,
                                postal_code: pick.postal_code || (editSite as any).postal_code,
                                country: pick.country || (editSite as any).country,
                              } as any);
                            }}
                            placeholder="Address"
                            countryBias={(editSite.country === 'United States' && 'US') || (editSite.country === 'Canada' && 'CA') || undefined}
                          />
                          <Input value={editSite.latitude} onChange={(e) => setEditSite({ ...editSite, latitude: e.target.value })} />
                          <Input value={editSite.longitude} onChange={(e) => setEditSite({ ...editSite, longitude: e.target.value })} />
                          <select
                            className="px-3 py-2 border border-input rounded-md bg-background"
                            value={editSite.site_supervisor_id || s.site_supervisor_id || ''}
                            onChange={(e) => setEditSite({ ...editSite, site_supervisor_id: e.target.value })}
                          >
                            <option value="">Supervisor</option>
                            {users.filter((u) => ['project_manager','foreman'].includes(u.role)).map((u) => (
                              <option key={u.id} value={u.id}>{u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.email}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
                          <Input placeholder="Street" value={editSite.street_address} onChange={(e) => setEditSite({ ...editSite, street_address: e.target.value })} />
                          <Input placeholder="City" value={editSite.city} onChange={(e) => setEditSite({ ...editSite, city: e.target.value })} />
                          {(editSite.country === 'United States') ? (
                            <select className="px-3 py-2 border border-input rounded-md bg-background" value={editSite.state} onChange={(e) => setEditSite({ ...editSite, state: e.target.value })}>
                              <option value="">State</option>
                              {usStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          ) : (editSite.country === 'Canada') ? (
                            <select className="px-3 py-2 border border-input rounded-md bg-background" value={editSite.state} onChange={(e) => setEditSite({ ...editSite, state: e.target.value })}>
                              <option value="">Province</option>
                              {caProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          ) : (
                            <Input placeholder="State" value={editSite.state} onChange={(e) => setEditSite({ ...editSite, state: e.target.value })} />
                          )}
                          <Input placeholder="Postal" value={editSite.postal_code} onChange={(e) => setEditSite({ ...editSite, postal_code: e.target.value })} />
                          <select className="px-3 py-2 border border-input rounded-md bg-background" value={editSite.country} onChange={(e) => setEditSite({ ...editSite, country: e.target.value })}>
                            <option value="">Country</option>
                            {countryOptions.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">{s.name || 'Site'}</div>
                          <div className="text-muted-foreground">
                            {s.address || '—'}
                            {s.latitude && s.longitude ? (
                              <span>{` • Lat ${Number(s.latitude).toFixed(6)}, Lng ${Number(s.longitude).toFixed(6)}`}</span>
                            ) : null}
                            {s.site_supervisor_id ? (
                              <span>{` • Supervisor: ${(() => { const u = users.find((x) => x.id === s.site_supervisor_id); return u ? (u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.email) : s.site_supervisor_id; })()}`}</span>
                            ) : null}
                          </div>
                          {(s.street_address || s.city || s.state || s.postal_code || s.country) && (
                            <div className="text-xs text-muted-foreground">
                              {[s.street_address, s.city, [s.state, s.postal_code].filter(Boolean).join(' '), s.country].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Map preview (if coords) */}
                    {s.latitude && s.longitude ? (
                      <div className="hidden md:block w-48 h-28 overflow-hidden rounded border">
                        <iframe
                          title={`map-${s.id}`}
                          width="100%"
                          height="100%"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${s.latitude},${s.longitude}&z=15&output=embed`}
                        />
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2 min-w-fit">
                      {s.latitude && s.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <Map className="w-4 h-4" />
                          Map
                        </a>
                      ) : null}
                    {editingSiteId === s.id ? (
                        <Button size="sm" variant="outline" type="button" onClick={() => {
                          if (!('geolocation' in navigator)) { alert('Geolocation not supported'); return; }
                          navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                              const { latitude, longitude } = pos.coords;
                              setEditSite((prev: any) => ({
                                ...prev,
                                latitude: Number(latitude.toFixed(6)),
                                longitude: Number(longitude.toFixed(6)),
                                address: prev.address || `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
                              }));
                              try {
                                const rev = await reverseGeocode(latitude, longitude);
                                if (rev) {
                                  setEditSite((prev: any) => ({
                                    ...prev,
                                    address: rev.formatted || prev.address,
                                    street_address: rev.street || prev.street_address,
                                    city: rev.city || prev.city,
                                    state: rev.state || prev.state,
                                    postal_code: rev.postal || prev.postal_code,
                                    country: rev.country || prev.country,
                                  }));
                                }
                              } catch {}
                            },
                            (err) => { console.error(err); alert('Unable to get location'); },
                            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                          );
                        }}>Use Current Location</Button>
                      ) : null}
                      {editingSiteId === s.id ? (
                        <>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (!projectId) return;
                            try {
                          const payload: any = {
                            name: editSite.name || undefined,
                            address: editSite.address || undefined,
                            latitude: editSite.latitude ? Number(editSite.latitude) : undefined,
                            longitude: editSite.longitude ? Number(editSite.longitude) : undefined,
                            site_supervisor_id: editSite.site_supervisor_id || undefined,
                            street_address: editSite.street_address || undefined,
                            city: editSite.city || undefined,
                            state: editSite.state || undefined,
                            postal_code: editSite.postal_code || undefined,
                            country: editSite.country || undefined,
                          };
                              const resp = await projectApi.updateProjectSite(projectId, s.id, payload);
                              const row = (resp as any).data;
                              setJobSites(prev => prev.map(js => js.id === s.id ? row : js));
                              setEditingSiteId(null);
                            } catch (e) {
                              alert('Failed to update site');
                            }
                          }}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingSiteId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingSiteId(s.id);
                            setEditSite({
                              name: s.name || '',
                              address: s.address || '',
                              latitude: s.latitude ? String(s.latitude) : '',
                              longitude: s.longitude ? String(s.longitude) : '',
                              site_supervisor_id: s.site_supervisor_id || '',
                            } as any);
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (!projectId) return;
                            if (!confirm('Delete this job site?')) return;
                            try {
                              await projectApi.deleteProjectSite(projectId, s.id);
                              setJobSites(prev => prev.filter(js => js.id !== s.id));
                            } catch (e) {
                              alert('Failed to delete site');
                            }
                          }}>Delete</Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget">Total Budget ($) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="status">Project Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

            {/* Map preview for Add Site */}
            {(newSite.latitude && newSite.longitude) ? (
              <div className="w-full md:w-2/3 h-40 overflow-hidden rounded border">
                <iframe
                  title="map-new-site"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${newSite.latitude},${newSite.longitude}&z=15&output=embed`}
                />
              </div>
            ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="endDate">Expected End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team & Management */}
          <Card>
            <CardHeader>
              <CardTitle>Team & Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manager">Project Manager *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="manager"
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Project manager name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="teamSize"
                      name="teamSize"
                      type="number"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Client company or name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    placeholder="client@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientPhone">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </Button>
            
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;
