import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTasks } from '@/contexts/TasksContext';
import { projectApi, taskApi } from '@/services/api';
import { offlineService } from '@/services/offlineService';
import { 
  generateTasksFromProject, 
  estimateProjectDuration, 
  generateRecurringTasks 
} from '@/utils/taskGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddressForm from '@/components/AddressForm';
import InfoTooltip, { HelpTooltip, MetricTooltip } from '@/components/InfoTooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings,
  UserCheck,
  Phone,
  Mail,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Sparkles } from 'lucide-react';

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useProjects();
  const { addTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState('basic');
  const [autoGenerateTasks, setAutoGenerateTasks] = useState(true);
  const [useAiWizard, setUseAiWizard] = useState(true);
  const [previewTasks, setPreviewTasks] = useState<any[]>([]);
  const [autoFillDescription, setAutoFillDescription] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  
  // Refs for auto-focus
  const nameRef = useRef<HTMLInputElement>(null);
  const budgetRef = useRef<HTMLInputElement>(null);
  const managerRef = useRef<HTMLInputElement>(null);
  const clientEmailRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    formatted_address: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    latitude: '' as string | number,
    longitude: '' as string | number,
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

  const tabs = [
    { id: 'basic', label: 'Project Info', icon: Building2 },
    { id: 'details', label: 'Details', icon: Settings },
    { id: 'team', label: 'Team', icon: UserCheck },
    { id: 'client', label: 'Client', icon: Mail }
  ];

  // Auto-focus when changing tabs
  useEffect(() => {
    const focusMap: Record<string, React.RefObject<HTMLInputElement>> = {
      'basic': nameRef,
      'details': budgetRef,
      'team': managerRef,
      'client': clientEmailRef
    };
    
    const ref = focusMap[currentTab];
    if (ref?.current) {
      setTimeout(() => ref.current?.focus(), 100);
    }
  }, [currentTab]);

  // Generate task preview when project details change
  useEffect(() => {
    if (autoGenerateTasks && formData.name && formData.description) {
      const tempProjectId = 'preview';
      const generatedTasks = generateTasksFromProject(
        tempProjectId,
        formData.name,
        formData.description,
        formData.projectType
      );
      
      // Generate preview of recurring tasks if dates are available
      const recurringTasksPreview = (formData.startDate && formData.endDate) ? 
        generateRecurringTasks(
          tempProjectId,
          formData.startDate,
          formData.endDate,
          ['Construction'] // Simplified for preview
        ).slice(0, 3) : []; // Show first 3 recurring tasks
      
      const allTasks = [...generatedTasks, ...recurringTasksPreview];
      setPreviewTasks(allTasks.slice(0, 8)); // Show first 8 tasks total for preview
    } else {
      setPreviewTasks([]);
    }
  }, [formData.name, formData.description, formData.projectType, formData.startDate, formData.endDate, autoGenerateTasks]);

  // Auto-fill description when enabled and key fields change
  useEffect(() => {
    if (!autoFillDescription) return;
    if (!formData.name) return;
    const desc = buildAutoDescription(
      formData.name,
      formData.projectType,
      formData.formatted_address,
      formData.manager,
      formData.teamSize,
      formData.budget
    );
    setFormData(prev => ({ ...prev, description: desc }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, formData.projectType, formData.formatted_address, formData.manager, formData.teamSize, formData.budget, autoFillDescription]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      setCurrentTab(nextTab.id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      setCurrentTab(prevTab.id);
    }
  };

  const canContinue = (tabId: string) => {
    switch (tabId) {
      case 'basic':
        return formData.name.trim() && formData.formatted_address.trim();
      case 'details':
        return formData.budget && formData.startDate && formData.endDate;
      case 'team':
        return formData.manager.trim();
      case 'client':
        return formData.clientEmail.trim() && formData.clientPhone.trim();
      default:
        return false;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.formatted_address.trim()) {
      newErrors.formatted_address = 'Address is required';
    }
    if (!formData.manager.trim()) {
      newErrors.manager = 'Project manager is required';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Valid budget is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Email validation (required)
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Valid email address is required';
    }

    // Phone validation (required)
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Client phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare backend payload (backend maps to Supabase Postgres)
      const coordsSuffix = (formData.latitude && formData.longitude)
        ? ` (Lat: ${formData.latitude}, Lng: ${formData.longitude})`
        : '';
      // Use the structured address from the simplified form
      const payload = {
        name: formData.name,
        description: formData.description,
        address: `${formData.formatted_address}${coordsSuffix}`.trim(),
        street_address: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postal_code: formData.postal_code || undefined,
        country: formData.country || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        start_date: formData.startDate || undefined,
        end_date: formData.endDate || undefined,
        total_budget: formData.budget ? parseFloat(formData.budget) : undefined,
        // client_id, project_manager_id could be looked up by email/name later
      } as any;

      // Create project via API
      let createdProjectId: string | undefined;
      try {
        const resp = await projectApi.createProject(payload);
        // API returns { success, data: project }
        const created = (resp as any).data || (resp as any).project || resp;
        createdProjectId = created.id;
      } catch (apiErr) {
        // If offline or API fails, queue offline creation and continue with temp id
        await offlineService.queueAction({ type: 'CREATE', entity: 'project', data: payload });
        createdProjectId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Update local UI context so the project appears immediately
      const actualProjectId = addProject({
        name: formData.name,
        description: formData.description,
        location: formData.formatted_address,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        manager: formData.manager,
        budget: parseFloat(formData.budget) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority as 'high' | 'medium' | 'low',
        status: formData.status as 'active' | 'planning' | 'on-hold',
        teamSize: parseInt(formData.teamSize) || 0,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        projectType: formData.projectType
      }, createdProjectId);
      
      // If AI wizard is selected, skip auto-generation and go to wizard
      if (useAiWizard) {
        navigate(`/projects/${actualProjectId}/ai-wizard`);
        return;
      }

      // Otherwise, generate and add tasks if auto-generation is enabled
      if (autoGenerateTasks) {
        try {
          // Generate main project tasks
          const generatedTasks = generateTasksFromProject(
            actualProjectId,
            formData.name,
            formData.description,
            formData.projectType,
            formData.startDate
          );
          
          // Generate recurring tasks for the project duration
          const recurringTasks = formData.endDate ? generateRecurringTasks(
            actualProjectId,
            formData.startDate || new Date().toISOString().split('T')[0],
            formData.endDate,
            ['Pre-Construction', 'Construction', 'Post-Construction'] // Default phases
          ) : [];
          
          // Combine all tasks
          const allTasks = [...generatedTasks, ...recurringTasks];
          
          // Persist all tasks via API and update local context
          for (const t of allTasks) {
            const taskPayload: any = {
              project_id: actualProjectId,
              title: t.title,
              description: t.description,
              start_date: t.start_date,
              due_date: t.due_date,
              estimated_hours: t.estimated_hours,
              priority: t.priority,
            };
            try {
              await taskApi.createTask(taskPayload);
            } catch (err) {
              // Queue offline if needed
              await offlineService.queueAction({ type: 'CREATE', entity: 'task', data: taskPayload });
            }
            // Always reflect in UI context
            addTask({ ...t, project_id: actualProjectId });
          }
        } catch (taskError) {
          console.error('Error generating tasks:', taskError);
          // Continue anyway - don't fail the whole project creation
        }
      }
      
      // Navigate to the projects page
      navigate('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Set lat/lng and provisional location
        setFormData(prev => ({
          ...prev,
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          location: prev.location || `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`
        }));
        // Reverse geocode to structured fields
        try {
          const rev = await (async () => {
            // Try Google if available
            if ((window as any).google?.maps?.Geocoder) {
              const geocoder = new (window as any).google.maps.Geocoder();
              return await new Promise<any>((resolve) => {
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], status: string) => {
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
                  } else {
                    resolve(null);
                  }
                });
              });
            }
            // Fallback to Nominatim
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
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
          })();
          if (rev) {
            setFormData(prev => ({
              ...prev,
              location: rev.formatted || prev.location,
              streetAddress: rev.street || prev.streetAddress,
              city: rev.city || prev.city,
              state: rev.state || prev.state,
              postalCode: rev.postal || prev.postalCode,
              country: rev.country || prev.country,
            }));
          }
        } catch {}
        setGeoLoading(false);
      },
      (err) => {
        console.error('Geolocation error', err);
        setGeoLoading(false);
        alert('Unable to get your location. Please grant permission or try again.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const buildAutoDescription = (
    name: string,
    type: string,
    location: string,
    manager: string,
    teamSize: string,
    budget: string
  ): string => {
    const parts: string[] = [];
    parts.push(`${name} is a ${type} construction project`);
    if (location) parts.push(`located in ${location}`);
    if (teamSize) parts.push(`with an estimated team of ${teamSize}`);
    if (budget) parts.push(`and a working budget of $${Number(budget).toLocaleString()}`);
    if (manager) parts.push(`managed by ${manager}`);
    const sentence = parts.join(', ') + '.';
    return `${sentence} Scope includes site preparation, structural work, MEP, and finishes. Key milestones will be defined upon kickoff with stakeholders.`;
  };

  // Address Autocomplete with Google Places (if key present) fallback to Nominatim
  interface AddressPick { display_name: string; lat?: string; lon?: string; place_id?: string; }
  const GOOGLE_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const googleReadyRef = useRef(false);
  const ensureGoogle = async (): Promise<boolean> => {
    if (!GOOGLE_KEY) return false;
    if (googleReadyRef.current && (window as any).google?.maps?.places) return true;
    await new Promise<void>((resolve, reject) => {
      if (document.getElementById('google-places-sdk')) return resolve();
      const s = document.createElement('script');
      s.id = 'google-places-sdk';
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(s);
    }).catch(() => {});
    if ((window as any).google?.maps?.places) {
      googleReadyRef.current = true;
      return true;
    }
    return false;
  };

  const [addrOpen, setAddrOpen] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrResults, setAddrResults] = useState<AddressPick[]>([]);
  const addrTimer = useRef<number | null>(null);

  const handleAddressChange = (v: string) => {
    setFormData(prev => ({ ...prev, location: v }));
    // do not clear structured fields immediately; wait for selection
  };

  useEffect(() => {
    const v = formData.location;
    if (!v || v.length < 3) {
      setAddrResults([]);
      setAddrOpen(false);
      return;
    }
    if (addrTimer.current) window.clearTimeout(addrTimer.current);
    addrTimer.current = window.setTimeout(async () => {
      try {
        setAddrLoading(true);
        if (await ensureGoogle()) {
          const svc = new (window as any).google.maps.places.AutocompleteService();
          svc.getPlacePredictions({ input: v }, (preds: any[], status: any) => {
            if (status !== (window as any).google.maps.places.PlacesServiceStatus.OK || !preds) {
              setAddrResults([]); setAddrOpen(false); setAddrLoading(false); return;
            }
            setAddrResults(preds.map(p => ({ display_name: p.description, place_id: p.place_id })) as AddressPick[]);
            setAddrOpen(true); setAddrLoading(false);
          });
          return;
        }
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}&limit=5`);
        const data = await resp.json();
        setAddrResults((data || []).map((d: any) => ({ display_name: d.display_name, lat: d.lat, lon: d.lon })));
        setAddrOpen(true);
      } catch {
        setAddrResults([]); setAddrOpen(false);
      } finally {
        setAddrLoading(false);
      }
    }, 350);
    return () => { if (addrTimer.current) window.clearTimeout(addrTimer.current); };
  }, [formData.location]);

  const handleAddressSelect = async (item: AddressPick) => {
    // Try Google details for structured fields
    if (item.place_id && (window as any).google?.maps?.places) {
      try {
        const svc = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
        await new Promise<void>((resolve) => {
          svc.getDetails({ placeId: item.place_id, fields: ['geometry','formatted_address','address_components'] }, (place: any) => {
            const lat = place?.geometry?.location?.lat?.();
            const lng = place?.geometry?.location?.lng?.();
            const comps: any[] = place?.address_components || [];
            const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';
            const streetNumber = get('street_number');
            const route = get('route');
            const locality = get('locality') || get('sublocality') || get('postal_town');
            const adminArea = get('administrative_area_level_1');
            const postal = get('postal_code');
            const country = get('country');
            setFormData(prev => ({
              ...prev,
              location: place?.formatted_address || item.display_name,
              streetAddress: [streetNumber, route].filter(Boolean).join(' ') || prev.streetAddress,
              city: locality || prev.city,
              state: adminArea || prev.state,
              postalCode: postal || prev.postalCode,
              country: country || prev.country,
              latitude: lat !== undefined ? Number(lat).toFixed(6) : prev.latitude,
              longitude: lng !== undefined ? Number(lng).toFixed(6) : prev.longitude,
            }));
            resolve();
          });
        });
        setAddrOpen(false);
        return;
      } catch {}
    }
    // Fallback: Nominatim; best-effort parsing of display_name
    const parts = (item.display_name || '').split(',').map(s => s.trim());
    const country = parts.pop() || '';
    const stateZip = parts.pop() || '';
    const city = parts.pop() || '';
    const street = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      location: item.display_name,
      streetAddress: street || prev.streetAddress,
      city: city || prev.city,
      state: stateZip.split(' ')[0] || prev.state,
      postalCode: stateZip.split(' ').slice(1).join(' ') || prev.postalCode,
      country: country || prev.country,
      latitude: item.lat ? Number(item.lat).toFixed(6) : prev.latitude,
      longitude: item.lon ? Number(item.lon).toFixed(6) : prev.longitude,
    }));
    setAddrOpen(false);
  };

  // Street address autocomplete (for structured street input)
  const [streetOpen, setStreetOpen] = useState(false);
  const [streetLoading, setStreetLoading] = useState(false);
  const [streetResults, setStreetResults] = useState<AddressPick[]>([]);
  const streetTimer = useRef<number | null>(null);

  const handleStreetChange = (v: string) => {
    setFormData(prev => ({ ...prev, streetAddress: v }));
  };

  useEffect(() => {
    const v = formData.streetAddress;
    if (!v || v.length < 3) { setStreetResults([]); setStreetOpen(false); return; }
    if (streetTimer.current) window.clearTimeout(streetTimer.current);
    streetTimer.current = window.setTimeout(async () => {
      try {
        setStreetLoading(true);
        if (await ensureGoogle()) {
          const svc = new (window as any).google.maps.places.AutocompleteService();
          // Bias to address-type predictions if supported
          svc.getPlacePredictions({ input: v, types: ['address'] as any }, (preds: any[], status: any) => {
            if (status !== (window as any).google.maps.places.PlacesServiceStatus.OK || !preds) {
              setStreetResults([]); setStreetOpen(false); setStreetLoading(false); return;
            }
            setStreetResults(preds.map(p => ({ display_name: p.description, place_id: p.place_id })) as AddressPick[]);
            setStreetOpen(true); setStreetLoading(false);
          });
          return;
        }
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(v)}&limit=5`);
        const data = await resp.json();
        setStreetResults((data || []).map((d: any) => ({ display_name: d.display_name, lat: d.lat, lon: d.lon })));
        setStreetOpen(true);
      } catch {
        setStreetResults([]); setStreetOpen(false);
      } finally {
        setStreetLoading(false);
      }
    }, 350);
    return () => { if (streetTimer.current) window.clearTimeout(streetTimer.current); };
  }, [formData.streetAddress]);

  const handleStreetSelect = async (item: AddressPick) => {
    // Use Google details when available
    if (item.place_id && (window as any).google?.maps?.places) {
      try {
        const svc = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
        await new Promise<void>((resolve) => {
          svc.getDetails({ placeId: item.place_id, fields: ['geometry','formatted_address','address_components'] }, (place: any) => {
            const lat = place?.geometry?.location?.lat?.();
            const lng = place?.geometry?.location?.lng?.();
            const comps: any[] = place?.address_components || [];
            const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || '';
            const streetNumber = get('street_number');
            const route = get('route');
            const locality = get('locality') || get('sublocality') || get('postal_town');
            const adminArea = get('administrative_area_level_1');
            const postal = get('postal_code');
            const country = get('country');
            setFormData(prev => ({
              ...prev,
              location: place?.formatted_address || item.display_name,
              streetAddress: [streetNumber, route].filter(Boolean).join(' '),
              city: locality || prev.city,
              state: adminArea || prev.state,
              postalCode: postal || prev.postalCode,
              country: country || prev.country,
              latitude: lat !== undefined ? Number(lat).toFixed(6) : prev.latitude,
              longitude: lng !== undefined ? Number(lng).toFixed(6) : prev.longitude,
            }));
            resolve();
          });
        });
        setStreetOpen(false);
        return;
      } catch {}
    }
    // Fallback to Nominatim parsed fields
    const parts = (item.display_name || '').split(',').map(s => s.trim());
    const country = parts.pop() || '';
    const stateZip = parts.pop() || '';
    const city = parts.pop() || '';
    const street = parts.join(', ');
    setFormData(prev => ({
      ...prev,
      location: item.display_name,
      streetAddress: street || prev.streetAddress,
      city: city || prev.city,
      state: stateZip.split(' ')[0] || prev.state,
      postalCode: stateZip.split(' ').slice(1).join(' ') || prev.postalCode,
      country: country || prev.country,
      latitude: item.lat ? Number(item.lat).toFixed(6) : prev.latitude,
      longitude: item.lon ? Number(item.lon).toFixed(6) : prev.longitude,
    }));
    setStreetOpen(false);
  };

  // Postal code validation pattern by country
  const postalPattern = (() => {
    if (formData.country === 'United States') return '^[0-9]{5}(?:-[0-9]{4})?$';
    if (formData.country === 'Canada') return '^[A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d$';
    return undefined;
  })();
  const postalTitle = formData.country === 'United States' ? 'US ZIP (12345 or 12345-6789)'
    : formData.country === 'Canada' ? 'CA Postal (A1A 1A1)'
    : 'Postal code';

  const handleCancel = () => {
    navigate('/projects');
  };

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
                  <h1 className="text-xl font-bold text-foreground">New Project</h1>
                  <p className="text-xs text-muted-foreground">Create a new construction project</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form id="project-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isCompleted = tabs.slice(0, index).every(t => canContinue(t.id));
                const isCurrent = tab.id === currentTab;
                const canAccess = index === 0 || tabs.slice(0, index).every(t => canContinue(t.id));
                
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className={`flex items-center gap-2 ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    } ${
                      !canAccess ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canAccess}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isCompleted && index < tabs.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-green-500" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      ref={nameRef}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
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
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (autoFillDescription) setAutoFillDescription(false);
                    }}
                    className="pl-10 min-h-[100px]"
                    placeholder="Describe the project scope and objectives"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={autoFillDescription} onChange={(e) => setAutoFillDescription(e.target.checked)} />
                    Auto-fill description
                  </label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAutoFillDescription(true)}>
                    Auto Fill Now
                  </Button>
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
                  errors={errors}
                  required={true}
                  showCoordinates={true}
                />

                <div className="flex items-center gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation} disabled={geoLoading}>
                    {geoLoading ? 'Detecting…' : 'Use Current Location'}
                  </Button>
                </div>

              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="button"
                  onClick={handleNextTab}
                  disabled={!canContinue('basic')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Project Details Tab */}
            <TabsContent value="details">
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
                      ref={budgetRef}
                      id="budget"
                      name="budget"
                      type="number"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.budget ? 'border-red-500' : ''}`}
                      placeholder="0"
                      required
                    />
                  </div>
                  {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
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
                  <Label htmlFor="status">Initial Status</Label>
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
                  </select>
                </div>
              </div>

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
                      className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
                </div>
                
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="endDate">Expected End Date *</Label>
                    <HelpTooltip
                      content="Planned completion date for final project delivery."
                      impact="End date drives milestone scheduling and resource planning. Realistic timelines reduce stress and improve quality."
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.endDate ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleNextTab}
                  disabled={!canContinue('details')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team & Management Tab */}
            <TabsContent value="team">
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
                      ref={managerRef}
                      id="manager"
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.manager ? 'border-red-500' : ''}`}
                      placeholder="Project manager name"
                      required
                    />
                  </div>
                  {errors.manager && <p className="text-sm text-red-500 mt-1">{errors.manager}</p>}
                </div>
                
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="teamSize">Estimated Team Size</Label>
                    <MetricTooltip
                      content="Estimated number of people working on this project simultaneously."
                      impact="Team size affects project velocity, communication complexity, and resource costs. Right-sizing prevents bottlenecks and overruns."
                      calculation="Core team + Specialists + Subcontractors + Support staff"
                    />
                  </div>
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

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleNextTab}
                  disabled={!canContinue('team')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Information Tab */}
            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <HelpTooltip
                      content="The client or organization commissioning this project."
                      impact="Client information is essential for contracts, communications, and billing. Clear client identification prevents project confusion."
                    />
                  </div>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Client company or name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientEmail">Client Email *</Label>
                  <Input
                    ref={clientEmailRef}
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className={errors.clientEmail ? 'border-red-500' : ''}
                    placeholder="client@example.com"
                    required
                  />
                  {errors.clientEmail && <p className="text-sm text-red-500 mt-1">{errors.clientEmail}</p>}
                </div>
                
                <div>
                  <Label htmlFor="clientPhone">Client Phone *</Label>
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    className={errors.clientPhone ? 'border-red-500' : ''}
                    placeholder="(555) 123-4567"
                    required
                  />
                  {errors.clientPhone && <p className="text-sm text-red-500 mt-1">{errors.clientPhone}</p>}
                </div>
              </div>

              {/* Task Generation Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Automatic Task Generation</h3>
                    <p className="text-sm text-gray-500">Generate construction tasks based on project details</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoGenerateTasks}
                      onChange={(e) => setAutoGenerateTasks(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoGenerateTasks ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoGenerateTasks ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                {/* AI Wizard option */}
                <div className="flex items-center justify-between mb-4 rounded-md bg-blue-50 p-3 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">Use AI Task Wizard after creation</div>
                      <div className="text-xs text-blue-800">
                        Opens an interactive wizard to tailor questions and generate a prioritized plan. When enabled, automatic generation is skipped.
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useAiWizard}
                      onChange={(e) => setUseAiWizard(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useAiWizard ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useAiWizard ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                {autoGenerateTasks && !useAiWizard && previewTasks.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Task Preview ({previewTasks.length} tasks will be created)
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {previewTasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-gray-500">{task.phase_name} • {task.estimated_hours}h</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Estimated duration: {Math.ceil(previewTasks.reduce((sum, task) => sum + task.estimated_hours, 0) / 40)} weeks
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevTab}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !canContinue('client')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Creating Project...' : 'Create Project'}
                </Button>
              </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectPage;
