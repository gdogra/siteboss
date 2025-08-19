
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Navigation,
  Target,
  Satellite,
  TrendingUp,
  Clock,
  Route,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Square,
  Play } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPoint {
  id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address: string;
  quality_score: number;
  distance_from_previous: number;
}

interface GPSLocationTrackerProps {
  sessionId?: number;
  userId?: number;
  showRealTime?: boolean;
}

const GPSLocationTracker: React.FC<GPSLocationTrackerProps> = ({
  sessionId,
  userId,
  showRealTime = true
}) => {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingAccuracy, setTrackingAccuracy] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [averageSpeed, setAverageSpeed] = useState<number>(0);
  const [qualityScore, setQualityScore] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [batteryOptimized, setBatteryOptimized] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadLocationHistory();
    }

    if (showRealTime) {
      startRealTimeTracking();
    }

    return () => {
      stopRealTimeTracking();
    };
  }, [sessionId, showRealTime]);

  const loadLocationHistory = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await window.ezsite.apis.tablePage(35438, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'timestamp',
        IsAsc: true,
        Filters: [{ name: 'session_id', op: 'Equal', value: sessionId }]
      });

      if (response.error) throw response.error;

      const locationData = response.data?.List || [];
      setLocations(locationData);

      if (locationData.length > 0) {
        setCurrentLocation(locationData[locationData.length - 1]);
        calculateMetrics(locationData);
      }

    } catch (error) {
      console.error('Error loading location history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load location history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (locationData: LocationPoint[]) => {
    if (locationData.length === 0) return;

    // Calculate total distance
    const distance = locationData.reduce((sum, location) =>
    sum + (location.distance_from_previous || 0), 0
    );
    setTotalDistance(distance);

    // Calculate average accuracy
    const avgAccuracy = locationData.reduce((sum, location) =>
    sum + location.accuracy, 0
    ) / locationData.length;
    setTrackingAccuracy(avgAccuracy);

    // Calculate average quality score
    const avgQuality = locationData.reduce((sum, location) =>
    sum + (location.quality_score || 0), 0
    ) / locationData.length;
    setQualityScore(avgQuality);

    // Calculate average speed (simplified)
    if (locationData.length > 1) {
      const firstLocation = locationData[0];
      const lastLocation = locationData[locationData.length - 1];
      const timeSpan = (new Date(lastLocation.timestamp).getTime() -
      new Date(firstLocation.timestamp).getTime()) / 1000 / 3600; // hours

      if (timeSpan > 0) {
        setAverageSpeed(distance / 1000 / timeSpan); // km/h
      }
    }
  };

  const startRealTimeTracking = () => {
    if (!navigator.geolocation || isTracking) return;

    setIsTracking(true);

    const options = {
      enableHighAccuracy: true,
      timeout: batteryOptimized ? 30000 : 10000,
      maximumAge: batteryOptimized ? 120000 : 60000
    };

    const trackingInterval = batteryOptimized ? 120000 : 30000; // 2 minutes vs 30 seconds

    const trackLocation = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newLocation: Partial<LocationPoint> = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            };

            // Calculate distance from previous location
            if (currentLocation) {
              const distance = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                newLocation.latitude!,
                newLocation.longitude!
              );
              newLocation.distance_from_previous = distance;
            }

            // Calculate quality score based on accuracy and movement
            const qualityScore = calculateQualityScore(
              newLocation.accuracy!,
              newLocation.distance_from_previous || 0
            );
            newLocation.quality_score = qualityScore;

            // Reverse geocode address (simplified)
            newLocation.address = `${newLocation.latitude!.toFixed(6)}, ${newLocation.longitude!.toFixed(6)}`;

            // Save to database if session is active
            if (sessionId && userId) {
              try {
                await window.ezsite.apis.tableCreate(35438, {
                  session_id: sessionId,
                  user_id: userId,
                  ...newLocation
                });
              } catch (error) {
                console.error('Error saving location:', error);
              }
            }

            // Update local state
            setCurrentLocation(newLocation as LocationPoint);
            setLocations((prev) => [...prev, newLocation as LocationPoint]);
            setTrackingAccuracy(newLocation.accuracy!);

          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: 'Location Error',
              description: 'Failed to get current location',
              variant: 'destructive'
            });
          },
          options
        );
      } catch (error) {
        console.error('Tracking error:', error);
      }
    };

    // Initial track
    trackLocation();

    // Set up interval tracking
    const intervalId = setInterval(trackLocation, trackingInterval);

    // Store interval ID for cleanup
    (window as any).gpsTrackingInterval = intervalId;
  };

  const stopRealTimeTracking = () => {
    setIsTracking(false);
    if ((window as any).gpsTrackingInterval) {
      clearInterval((window as any).gpsTrackingInterval);
      delete (window as any).gpsTrackingInterval;
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateQualityScore = (accuracy: number, movement: number): number => {
    let score = 100;

    // Penalize poor accuracy
    if (accuracy > 100) score -= 40;else
    if (accuracy > 50) score -= 20;else
    if (accuracy > 20) score -= 10;

    // Penalize erratic movement (possible GPS drift)
    if (movement > 100) score -= 20; // Moving more than 100m in tracking interval

    // Reward consistent tracking
    score = Math.max(0, Math.min(100, score));

    return score;
  };

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy <= 5) return { color: 'text-green-600', label: 'Excellent', icon: Target };
    if (accuracy <= 20) return { color: 'text-blue-600', label: 'Good', icon: Satellite };
    if (accuracy <= 50) return { color: 'text-yellow-600', label: 'Fair', icon: Navigation };
    return { color: 'text-red-600', label: 'Poor', icon: AlertTriangle };
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const toggleBatteryOptimization = () => {
    setBatteryOptimized(!batteryOptimized);
    if (isTracking) {
      stopRealTimeTracking();
      setTimeout(() => startRealTimeTracking(), 1000);
    }

    toast({
      title: batteryOptimized ? 'High Accuracy Mode' : 'Battery Optimized Mode',
      description: batteryOptimized ?
      'Tracking with high frequency and accuracy' :
      'Tracking optimized for battery life'
    });
  };

  const accuracyStatus = getAccuracyStatus(trackingAccuracy);
  const AccuracyIcon = accuracyStatus.icon;

  return (
    <div className="space-y-6">
      {/* Current Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              GPS Location Tracker
            </span>
            <div className="flex items-center gap-2">
              {isTracking &&
              <Badge variant="default" className="animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                  Tracking
                </Badge>
              }
              <Button
                size="sm"
                variant="outline"
                onClick={toggleBatteryOptimization}>

                <Zap className={`h-4 w-4 mr-1 ${batteryOptimized ? 'text-green-500' : 'text-yellow-500'}`} />
                {batteryOptimized ? 'Battery' : 'Accuracy'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location */}
          {currentLocation &&
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Current Location</div>
                <div className="text-sm">{currentLocation.address}</div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {formatTime(currentLocation.timestamp)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">GPS Accuracy</div>
                <div className={`flex items-center gap-1 ${accuracyStatus.color}`}>
                  <AccuracyIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{accuracyStatus.label}</span>
                  <span className="text-xs">({Math.round(trackingAccuracy)}m)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Data Quality</div>
                <div className={`text-sm font-medium ${getQualityColor(qualityScore)}`}>
                  {Math.round(qualityScore)}% Quality Score
                </div>
                <Progress value={qualityScore} className="h-2" />
              </div>
            </div>
          }

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatDistance(totalDistance)}
              </div>
              <div className="text-xs text-blue-600">Total Distance</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {locations.length}
              </div>
              <div className="text-xs text-green-600">Location Points</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {averageSpeed.toFixed(1)} km/h
              </div>
              <div className="text-xs text-purple-600">Avg Speed</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {Math.round(trackingAccuracy)}m
              </div>
              <div className="text-xs text-orange-600">Avg Accuracy</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={showRealTime ? stopRealTimeTracking : startRealTimeTracking}
              variant={isTracking ? "destructive" : "default"}
              size="sm">

              {isTracking ?
              <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Tracking
                </> :

              <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking
                </>
              }
            </Button>
            
            <Button
              onClick={loadLocationHistory}
              variant="outline"
              size="sm"
              disabled={loading}>

              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Location History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="space-y-2">
              {[...Array(5)].map((_, i) =>
            <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
            )}
            </div> :
          locations.length === 0 ?
          <div className="text-center py-8 text-muted-foreground">
              No location data available
            </div> :

          <div className="space-y-2 max-h-96 overflow-y-auto">
              {locations.slice(-20).reverse().map((location, index) =>
            <div key={location.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${
                location.quality_score >= 90 ? 'bg-green-500' :
                location.quality_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`
                }></div>
                    <div>
                      <div className="text-sm font-medium">{location.address}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(location.timestamp)} • 
                        Accuracy: {Math.round(location.accuracy)}m • 
                        Quality: {Math.round(location.quality_score)}%
                      </div>
                      {location.distance_from_previous > 0 &&
                  <div className="text-xs text-blue-600">
                          Moved: {formatDistance(location.distance_from_previous)}
                        </div>
                  }
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {location.quality_score >= 90 ?
                <CheckCircle className="h-4 w-4 text-green-500" /> :
                location.quality_score >= 70 ?
                <Target className="h-4 w-4 text-yellow-500" /> :

                <AlertTriangle className="h-4 w-4 text-red-500" />
                }
                  </div>
                </div>
            )}
            </div>
          }
        </CardContent>
      </Card>

      {/* Quality Alerts */}
      {qualityScore < 70 &&
      <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            GPS tracking quality is below optimal. Consider enabling high accuracy mode or moving to an area with better satellite reception.
          </AlertDescription>
        </Alert>
      }
    </div>);

};

export default GPSLocationTracker;