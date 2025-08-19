
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  MapPin, 
  Play, 
  Square, 
  Coffee, 
  Navigation, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Timer,
  Battery,
  Signal,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

interface CurrentSession {
  id?: number;
  project_id: number;
  start_time: string;
  status: string;
  work_duration: number;
  break_duration: number;
  total_distance: number;
  geofence_violations: number;
}

const MobileTimeTracker: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isTracking, setIsTracking] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(navigator.onLine);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [breakTimer, setBreakTimer] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationTrackingRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    checkLocationPermission();
    checkBatteryStatus();
    setupConnectionListener();
    loadActiveSession();
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current);
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
      if (locationTrackingRef.current) clearInterval(locationTrackingRef.current);
    };
  }, []);

  const loadProjects = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [{ name: 'status', op: 'Equal', value: 'In Progress' }]
      });
      
      if (response.error) throw response.error;
      setProjects(response.data?.List || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadActiveSession = async () => {
    try {
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) return;

      const response = await window.ezsite.apis.tablePage(35439, {
        PageNo: 1,
        PageSize: 1,
        OrderByField: 'start_time',
        IsAsc: false,
        Filters: [
          { name: 'user_id', op: 'Equal', value: userInfo.data.ID },
          { name: 'status', op: 'Equal', value: 'active' }
        ]
      });
      
      if (response.data?.List?.length > 0) {
        const session = response.data.List[0];
        setCurrentSession(session);
        setSelectedProject(session.project_id.toString());
        startSessionTimer();
        startLocationTracking();
        
        // Check if on break by looking for unclosed break_start event
        const breakResponse = await window.ezsite.apis.tablePage(35437, {
          PageNo: 1,
          PageSize: 1,
          OrderByField: 'timestamp',
          IsAsc: false,
          Filters: [
            { name: 'session_id', op: 'Equal', value: session.id },
            { name: 'event_type', op: 'Equal', value: 'break_start' }
          ]
        });
        
        if (breakResponse.data?.List?.length > 0) {
          // Check if there's a corresponding break_end
          const breakEndResponse = await window.ezsite.apis.tablePage(35437, {
            PageNo: 1,
            PageSize: 1,
            OrderByField: 'timestamp',
            IsAsc: false,
            Filters: [
              { name: 'session_id', op: 'Equal', value: session.id },
              { name: 'event_type', op: 'Equal', value: 'break_end' }
            ]
          });
          
          const breakStart = new Date(breakResponse.data.List[0].timestamp);
          const breakEnd = breakEndResponse.data?.List?.length > 0 
            ? new Date(breakEndResponse.data.List[0].timestamp) 
            : null;
            
          if (!breakEnd || breakStart > breakEnd) {
            setIsOnBreak(true);
            startBreakTimer(breakStart);
          }
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    }
  };

  const checkBatteryStatus = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setBatteryLevel(battery.level * 100);
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100);
        });
      } catch (error) {
        console.error('Error checking battery status:', error);
      }
    }
  };

  const setupConnectionListener = () => {
    const updateConnectionStatus = () => setConnectionStatus(navigator.onLine);
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          setCurrentLocation(locationData);
          setGpsAccuracy(position.coords.accuracy);

          // Try to get address (reverse geocoding)
          try {
            // This would typically use a geocoding service
            locationData.address = `Lat: ${locationData.latitude.toFixed(6)}, Lng: ${locationData.longitude.toFixed(6)}`;
          } catch (error) {
            console.error('Error getting address:', error);
          }

          resolve(locationData);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        options
      );
    });
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation || isTracking) return;

    setIsTracking(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 30000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        setCurrentLocation(locationData);
        setGpsAccuracy(position.coords.accuracy);

        // Save location to database if session is active
        if (currentSession?.id) {
          saveLocationData(locationData);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
        toast({
          title: 'Location Error',
          description: 'Failed to track location. Please check GPS settings.',
          variant: 'destructive'
        });
      },
      options
    );

    // Also set up periodic location saving
    locationTrackingRef.current = setInterval(async () => {
      if (currentSession?.id && currentLocation) {
        await saveLocationData(currentLocation);
      }
    }, 60000); // Save location every minute
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationTrackingRef.current) {
      clearInterval(locationTrackingRef.current);
      locationTrackingRef.current = null;
    }
    setIsTracking(false);
  };

  const saveLocationData = async (location: LocationData) => {
    if (!currentSession?.id) return;

    try {
      await window.ezsite.apis.tableCreate(35438, {
        session_id: currentSession.id,
        user_id: (await window.ezsite.apis.getUserInfo()).data?.ID,
        timestamp: new Date(location.timestamp).toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address || '',
        quality_score: location.accuracy <= 10 ? 100 : location.accuracy <= 50 ? 80 : 60
      });
    } catch (error) {
      console.error('Error saving location data:', error);
    }
  };

  const startSessionTimer = () => {
    if (sessionIntervalRef.current) return;
    
    sessionIntervalRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = null;
    }
  };

  const startBreakTimer = (startTime?: Date) => {
    if (breakIntervalRef.current) return;
    
    const start = startTime ? startTime.getTime() : Date.now();
    
    breakIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setBreakTimer(elapsed);
    }, 1000);
  };

  const stopBreakTimer = () => {
    if (breakIntervalRef.current) {
      clearInterval(breakIntervalRef.current);
      breakIntervalRef.current = null;
    }
    setBreakTimer(0);
  };

  const clockIn = async () => {
    if (!selectedProject) {
      toast({
        title: 'Project Required',
        description: 'Please select a project before clocking in.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const location = await getCurrentLocation();
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      // Create new session
      const sessionResponse = await window.ezsite.apis.tableCreate(35439, {
        user_id: userInfo.data.ID,
        project_id: parseInt(selectedProject),
        start_time: new Date().toISOString(),
        status: 'active',
        work_duration: 0,
        break_duration: 0,
        total_distance: 0,
        geofence_violations: 0,
        productivity_score: 100
      });

      if (sessionResponse.error) throw sessionResponse.error;

      const sessionId = sessionResponse.data?.id || sessionResponse.data?.ID;

      // Create clock-in event
      await window.ezsite.apis.tableCreate(35437, {
        user_id: userInfo.data.ID,
        project_id: parseInt(selectedProject),
        session_id: sessionId,
        event_type: 'clock_in',
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address || '',
        geofence_status: 'unknown', // Would be determined by geofence check
        verification_status: 'pending',
        notes: notes
      });

      setCurrentSession({
        id: sessionId,
        project_id: parseInt(selectedProject),
        start_time: new Date().toISOString(),
        status: 'active',
        work_duration: 0,
        break_duration: 0,
        total_distance: 0,
        geofence_violations: 0
      });

      startSessionTimer();
      startLocationTracking();
      setNotes('');

      toast({
        title: 'Clocked In',
        description: 'Successfully clocked in with GPS location.',
      });

    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Clock In Failed',
        description: 'Failed to clock in. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const clockOut = async () => {
    if (!currentSession) return;

    try {
      const location = await getCurrentLocation();
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      // If on break, end break first
      if (isOnBreak) {
        await endBreak();
      }

      // Create clock-out event
      await window.ezsite.apis.tableCreate(35437, {
        user_id: userInfo.data.ID,
        project_id: currentSession.project_id,
        session_id: currentSession.id,
        event_type: 'clock_out',
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address || '',
        geofence_status: 'unknown',
        verification_status: 'pending',
        notes: notes
      });

      // Update session
      const totalMinutes = Math.floor(sessionTimer / 60);
      const breakMinutes = Math.floor(breakTimer / 60);
      
      await window.ezsite.apis.tableUpdate(35439, {
        ID: currentSession.id,
        end_time: new Date().toISOString(),
        status: 'completed',
        total_duration: totalMinutes,
        work_duration: totalMinutes - breakMinutes,
        break_duration: breakMinutes
      });

      setCurrentSession(null);
      setIsOnBreak(false);
      setSessionTimer(0);
      setBreakTimer(0);
      stopSessionTimer();
      stopBreakTimer();
      stopLocationTracking();
      setNotes('');

      toast({
        title: 'Clocked Out',
        description: 'Successfully clocked out.',
      });

    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Clock Out Failed',
        description: 'Failed to clock out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const startBreak = async () => {
    if (!currentSession || isOnBreak) return;

    try {
      const location = await getCurrentLocation();
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      await window.ezsite.apis.tableCreate(35437, {
        user_id: userInfo.data.ID,
        project_id: currentSession.project_id,
        session_id: currentSession.id,
        event_type: 'break_start',
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address || '',
        geofence_status: 'unknown',
        verification_status: 'pending',
        notes: notes
      });

      setIsOnBreak(true);
      startBreakTimer();
      setNotes('');

      toast({
        title: 'Break Started',
        description: 'Break time started.',
      });

    } catch (error) {
      console.error('Error starting break:', error);
      toast({
        title: 'Break Start Failed',
        description: 'Failed to start break. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const endBreak = async () => {
    if (!currentSession || !isOnBreak) return;

    try {
      const location = await getCurrentLocation();
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.error) throw userInfo.error;

      await window.ezsite.apis.tableCreate(35437, {
        user_id: userInfo.data.ID,
        project_id: currentSession.project_id,
        session_id: currentSession.id,
        event_type: 'break_end',
        timestamp: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address || '',
        geofence_status: 'unknown',
        verification_status: 'pending',
        notes: notes
      });

      setIsOnBreak(false);
      stopBreakTimer();
      setNotes('');

      toast({
        title: 'Break Ended',
        description: 'Break time ended.',
      });

    } catch (error) {
      console.error('Error ending break:', error);
      toast({
        title: 'Break End Failed',
        description: 'Failed to end break. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLocationStatus = () => {
    if (locationPermission === 'denied') {
      return { icon: <Navigation className="h-4 w-4 text-red-500" />, text: 'GPS Disabled', color: 'text-red-500' };
    }
    if (!currentLocation) {
      return { icon: <Navigation className="h-4 w-4 text-yellow-500" />, text: 'Getting Location...', color: 'text-yellow-500' };
    }
    if (gpsAccuracy && gpsAccuracy <= 10) {
      return { icon: <Target className="h-4 w-4 text-green-500" />, text: `High Accuracy (${Math.round(gpsAccuracy)}m)`, color: 'text-green-500' };
    }
    if (gpsAccuracy && gpsAccuracy <= 50) {
      return { icon: <Navigation className="h-4 w-4 text-yellow-500" />, text: `Good Accuracy (${Math.round(gpsAccuracy)}m)`, color: 'text-yellow-500' };
    }
    return { icon: <Navigation className="h-4 w-4 text-red-500" />, text: `Poor Accuracy (${Math.round(gpsAccuracy || 0)}m)`, color: 'text-red-500' };
  };

  const locationStatus = getLocationStatus();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Status Bar */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {connectionStatus ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span>Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span>Offline</span>
              </div>
            )}
            
            <div className={`flex items-center gap-1 ${locationStatus.color}`}>
              {locationStatus.icon}
              <span>{locationStatus.text}</span>
            </div>
            
            {batteryLevel && (
              <div className="flex items-center gap-1">
                <Battery className="h-4 w-4" />
                <span>{Math.round(batteryLevel)}%</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="font-mono text-lg">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Session Card */}
        {currentSession ? (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Active Session
                </span>
                <Badge variant={isOnBreak ? "destructive" : "default"}>
                  {isOnBreak ? 'On Break' : 'Working'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Time Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-mono font-bold text-blue-600">
                    {formatTime(sessionTimer)}
                  </div>
                  <div className="text-sm text-blue-600">Total Time</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-mono font-bold text-orange-600">
                    {formatTime(breakTimer)}
                  </div>
                  <div className="text-sm text-orange-600">Break Time</div>
                </div>
              </div>

              {/* Current Location */}
              {currentLocation && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{currentLocation.address}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {isOnBreak ? (
                  <Button onClick={endBreak} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    End Break
                  </Button>
                ) : (
                  <Button onClick={startBreak} variant="outline" className="w-full">
                    <Coffee className="h-4 w-4 mr-2" />
                    Start Break
                  </Button>
                )}
                
                <Button onClick={clockOut} variant="destructive" className="w-full">
                  <Square className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Clock In Card */
          <Card>
            <CardHeader>
              <CardTitle>Start Work Session</CardTitle>
              <CardDescription>Select a project and clock in to begin tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} - {project.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Permission Alert */}
              {locationPermission === 'denied' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Location access is required for time tracking. Please enable location permissions in your browser settings.
                  </AlertDescription>
                </Alert>
              )}

              {/* Current Location Preview */}
              {currentLocation && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Location acquired: {currentLocation.address}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this work session..."
                  rows={3}
                />
              </div>

              {/* Clock In Button */}
              <Button 
                onClick={clockIn} 
                className="w-full h-12 text-lg"
                disabled={!selectedProject || locationPermission === 'denied'}
              >
                <Clock className="h-5 w-5 mr-2" />
                Clock In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(sessionTimer)}</div>
                <div className="text-sm text-muted-foreground">Today's Work</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileTimeTracker;
