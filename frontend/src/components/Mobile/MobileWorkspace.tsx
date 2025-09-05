import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon,
  WifiIcon,
  SignalIcon,
  Battery0Icon,
  CameraIcon,
  MicrophoneIcon,
  MapPinIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  ScaleIcon,
  ViewfinderCircleIcon
} from '@heroicons/react/24/outline';

interface OfflineData {
  id: string;
  type: 'time-entry' | 'photo' | 'inspection' | 'measurement' | 'voice-note';
  projectId: string;
  data: any;
  timestamp: Date;
  synced: boolean;
  location?: GeolocationPosition;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  available: boolean;
  lastUsed?: Date;
  usageCount: number;
}

interface ARMeasurement {
  id: string;
  type: 'distance' | 'area' | 'volume' | 'angle';
  value: number;
  unit: string;
  accuracy: number;
  location: string;
  timestamp: Date;
  photo?: string;
  notes?: string;
}

interface VoiceNote {
  id: string;
  duration: number;
  transcription?: string;
  confidence: number;
  tags: string[];
  projectId: string;
  timestamp: Date;
  synced: boolean;
}

const MobileWorkspace: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [measurements, setMeasurements] = useState<ARMeasurement[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'ar-tools' | 'voice' | 'offline'>('dashboard');
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [recording, setRecording] = useState(false);
  const [arMeasuring, setArMeasuring] = useState(false);

  const mobileFeatures: MobileFeature[] = [
    {
      id: 'ar-measuring',
      name: 'AR Measuring Tools',
      description: 'Measure distances, areas, and angles using augmented reality',
      icon: ScaleIcon,
      available: true,
      usageCount: 45
    },
    {
      id: 'voice-notes',
      name: 'Voice-to-Text',
      description: 'Record voice notes with automatic transcription',
      icon: MicrophoneIcon,
      available: true,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      usageCount: 28
    },
    {
      id: 'photo-capture',
      name: 'Smart Photo Capture',
      description: 'Capture photos with automatic tagging and analysis',
      icon: CameraIcon,
      available: true,
      lastUsed: new Date(Date.now() - 30 * 60 * 1000),
      usageCount: 156
    },
    {
      id: 'offline-forms',
      name: 'Offline Forms',
      description: 'Complete forms and inspections without internet connection',
      icon: DocumentTextIcon,
      available: true,
      usageCount: 89
    },
    {
      id: 'gps-tracking',
      name: 'GPS Location Tracking',
      description: 'Automatic location tagging for all activities',
      icon: MapPinIcon,
      available: locationPermission === 'granted',
      usageCount: 234
    },
    {
      id: 'offline-sync',
      name: 'Intelligent Sync',
      description: 'Smart data synchronization when connection is available',
      icon: CloudArrowUpIcon,
      available: true,
      usageCount: 67
    }
  ];

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineData.filter(item => !item.synced).length > 0) {
        syncOfflineData();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request permissions
    requestPermissions();

    // Load offline data from localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestPermissions = async () => {
    // Camera permission
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      cameraStream.getTracks().forEach(track => track.stop());
    } catch {
      setCameraPermission('denied');
    }

    // Microphone permission
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission('granted');
      audioStream.getTracks().forEach(track => track.stop());
    } catch {
      setMicrophonePermission('denied');
    }

    // Location permission
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermission('granted'),
        () => setLocationPermission('denied')
      );
    }
  };

  const loadOfflineData = () => {
    try {
      const storedData = localStorage.getItem('siteboss_offline_data');
      if (storedData) {
        const data = JSON.parse(storedData).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setOfflineData(data);
      }

      const storedMeasurements = localStorage.getItem('siteboss_measurements');
      if (storedMeasurements) {
        const data = JSON.parse(storedMeasurements).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setMeasurements(data);
      }

      const storedVoiceNotes = localStorage.getItem('siteboss_voice_notes');
      if (storedVoiceNotes) {
        const data = JSON.parse(storedVoiceNotes).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setVoiceNotes(data);
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveToOfflineStorage = (data: OfflineData) => {
    const updatedData = [...offlineData, data];
    setOfflineData(updatedData);
    localStorage.setItem('siteboss_offline_data', JSON.stringify(updatedData));
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;

    try {
      setSyncInProgress(true);
      const unsyncedData = offlineData.filter(item => !item.synced);
      
      // Simulate API calls to sync data
      for (const item of unsyncedData) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Mark as synced
        item.synced = true;
      }
      
      setOfflineData([...offlineData]);
      localStorage.setItem('siteboss_offline_data', JSON.stringify(offlineData));
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const startVoiceRecording = async () => {
    if (microphonePermission !== 'granted') {
      alert('Microphone permission required for voice notes');
      return;
    }

    try {
      setRecording(true);
      
      // Simulate voice recording
      setTimeout(() => {
        const newVoiceNote: VoiceNote = {
          id: Date.now().toString(),
          duration: Math.floor(Math.random() * 120) + 10,
          transcription: 'This is a sample transcription of the voice note recorded on site.',
          confidence: 0.95,
          tags: ['daily-report', 'progress-update'],
          projectId: 'proj-001',
          timestamp: new Date(),
          synced: isOnline
        };

        const updatedNotes = [...voiceNotes, newVoiceNote];
        setVoiceNotes(updatedNotes);
        localStorage.setItem('siteboss_voice_notes', JSON.stringify(updatedNotes));
        
        setRecording(false);

        if (!isOnline) {
          saveToOfflineStorage({
            id: newVoiceNote.id,
            type: 'voice-note',
            projectId: newVoiceNote.projectId,
            data: newVoiceNote,
            timestamp: newVoiceNote.timestamp,
            synced: false
          });
        }
      }, 3000);
      
    } catch (error) {
      console.error('Recording failed:', error);
      setRecording(false);
    }
  };

  const startARMeasuring = async () => {
    if (cameraPermission !== 'granted') {
      alert('Camera permission required for AR measuring');
      return;
    }

    try {
      setArMeasuring(true);
      
      // Simulate AR measurement
      setTimeout(() => {
        const newMeasurement: ARMeasurement = {
          id: Date.now().toString(),
          type: 'distance',
          value: Math.floor(Math.random() * 50) + 5,
          unit: 'ft',
          accuracy: 0.98,
          location: 'Construction Site - Zone A',
          timestamp: new Date(),
          notes: 'Distance measurement between foundation walls'
        };

        const updatedMeasurements = [...measurements, newMeasurement];
        setMeasurements(updatedMeasurements);
        localStorage.setItem('siteboss_measurements', JSON.stringify(updatedMeasurements));
        
        setArMeasuring(false);

        if (!isOnline) {
          saveToOfflineStorage({
            id: newMeasurement.id,
            type: 'measurement',
            projectId: 'proj-001',
            data: newMeasurement,
            timestamp: newMeasurement.timestamp,
            synced: false
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('AR measuring failed:', error);
      setArMeasuring(false);
    }
  };

  const capturePhoto = async () => {
    if (cameraPermission !== 'granted') {
      alert('Camera permission required for photo capture');
      return;
    }

    // Simulate photo capture
    const photoData = {
      id: Date.now().toString(),
      url: '/api/photos/temp-' + Date.now() + '.jpg',
      tags: ['progress', 'daily-update'],
      location: 'Construction Site - Zone A',
      timestamp: new Date(),
      analyzed: false
    };

    if (!isOnline) {
      saveToOfflineStorage({
        id: photoData.id,
        type: 'photo',
        projectId: 'proj-001',
        data: photoData,
        timestamp: photoData.timestamp,
        synced: false
      });
    }

    alert('Photo captured and saved locally');
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'granted': return 'text-green-600';
      case 'denied': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'granted': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'denied': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DevicePhoneMobileIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mobile Workspace</h2>
            <p className="text-gray-600">Offline-first mobile capabilities with AR tools and voice-to-text</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <WifiIcon className="h-5 w-5 text-green-500" />
            ) : (
              <WifiIcon className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {/* Sync Button */}
          {!isOnline && offlineData.filter(item => !item.synced).length > 0 && (
            <div className="flex items-center space-x-2">
              <CloudArrowUpIcon className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-orange-600">
                {offlineData.filter(item => !item.synced).length} items pending sync
              </span>
            </div>
          )}
          
          {isOnline && syncInProgress && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-600">Syncing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Permissions Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Device Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <CameraIcon className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Camera</span>
            </div>
            <div className="flex items-center space-x-2">
              {getPermissionIcon(cameraPermission)}
              <span className={`text-sm font-medium capitalize ${getPermissionColor(cameraPermission)}`}>
                {cameraPermission}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <MicrophoneIcon className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Microphone</span>
            </div>
            <div className="flex items-center space-x-2">
              {getPermissionIcon(microphonePermission)}
              <span className={`text-sm font-medium capitalize ${getPermissionColor(microphonePermission)}`}>
                {microphonePermission}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Location</span>
            </div>
            <div className="flex items-center space-x-2">
              {getPermissionIcon(locationPermission)}
              <span className={`text-sm font-medium capitalize ${getPermissionColor(locationPermission)}`}>
                {locationPermission}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Mobile Dashboard', icon: DevicePhoneMobileIcon },
              { id: 'ar-tools', name: 'AR Measuring Tools', icon: ViewfinderCircleIcon },
              { id: 'voice', name: 'Voice-to-Text', icon: MicrophoneIcon, count: voiceNotes.length },
              { id: 'offline', name: 'Offline Data', icon: CloudArrowDownIcon, count: offlineData.filter(item => !item.synced).length }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`${
                    selectedView === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard */}
          {selectedView === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Mobile Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mobileFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                        feature.available ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (feature.available) {
                          switch (feature.id) {
                            case 'ar-measuring':
                              setSelectedView('ar-tools');
                              break;
                            case 'voice-notes':
                              setSelectedView('voice');
                              break;
                            case 'photo-capture':
                              capturePhoto();
                              break;
                            case 'offline-sync':
                              if (isOnline) syncOfflineData();
                              break;
                          }
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <IconComponent className={`h-8 w-8 ${feature.available ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Usage: {feature.usageCount} times</span>
                        {feature.lastUsed && (
                          <span>Last: {feature.lastUsed.toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {!feature.available && (
                        <div className="mt-2 text-xs text-red-600">
                          Permission required or feature unavailable
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={capturePhoto}
                    disabled={cameraPermission !== 'granted'}
                    className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CameraIcon className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium">Take Photo</span>
                  </button>
                  
                  <button
                    onClick={startVoiceRecording}
                    disabled={microphonePermission !== 'granted' || recording}
                    className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MicrophoneIcon className={`h-8 w-8 mb-2 ${recording ? 'text-red-500' : 'text-green-500'}`} />
                    <span className="text-sm font-medium">
                      {recording ? 'Recording...' : 'Voice Note'}
                    </span>
                  </button>
                  
                  <button
                    onClick={startARMeasuring}
                    disabled={cameraPermission !== 'granted' || arMeasuring}
                    className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ScaleIcon className={`h-8 w-8 mb-2 ${arMeasuring ? 'text-orange-500' : 'text-purple-500'}`} />
                    <span className="text-sm font-medium">
                      {arMeasuring ? 'Measuring...' : 'AR Measure'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedView('offline')}
                    className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <CloudArrowDownIcon className="h-8 w-8 text-yellow-500 mb-2" />
                    <span className="text-sm font-medium">Offline Data</span>
                    {offlineData.filter(item => !item.synced).length > 0 && (
                      <span className="text-xs text-red-600 mt-1">
                        {offlineData.filter(item => !item.synced).length} pending
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AR Tools */}
          {selectedView === 'ar-tools' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">AR Measuring Tools</h3>
                <button
                  onClick={startARMeasuring}
                  disabled={cameraPermission !== 'granted' || arMeasuring}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {arMeasuring ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Measuring...
                    </>
                  ) : (
                    <>
                      <ViewfinderCircleIcon className="h-4 w-4 mr-2" />
                      Start AR Measuring
                    </>
                  )}
                </button>
              </div>

              {/* AR Camera View Placeholder */}
              <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-white">
                  <ViewfinderCircleIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">AR Camera View</p>
                  <p className="text-sm opacity-75 mt-2">
                    Point camera at objects to measure distances, areas, and angles
                  </p>
                </div>
              </div>

              {/* Recent Measurements */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Measurements</h4>
                <div className="space-y-3">
                  {measurements.slice(0, 5).map((measurement) => (
                    <div key={measurement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <ScaleIcon className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-gray-900 capitalize">
                            {measurement.type} Measurement
                          </span>
                          <span className="text-sm text-gray-500">
                            {measurement.accuracy * 100}% accuracy
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{measurement.location}</p>
                        <p className="text-xs text-gray-500">
                          {measurement.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {measurement.value} {measurement.unit}
                        </div>
                        {measurement.notes && (
                          <p className="text-xs text-gray-500 mt-1">{measurement.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Voice-to-Text */}
          {selectedView === 'voice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Voice-to-Text Notes</h3>
                <button
                  onClick={startVoiceRecording}
                  disabled={microphonePermission !== 'granted' || recording}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recording ? (
                    <>
                      <div className="animate-pulse h-4 w-4 bg-red-500 rounded-full mr-2"></div>
                      Recording...
                    </>
                  ) : (
                    <>
                      <MicrophoneIcon className="h-4 w-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </button>
              </div>

              {/* Voice Notes List */}
              <div className="space-y-4">
                {voiceNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <SpeakerWaveIcon className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">
                          Voice Note ({note.duration}s)
                        </span>
                        <span className="text-sm text-gray-500">
                          {(note.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {note.synced ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <CloudArrowUpIcon className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {note.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {note.transcription && (
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <p className="text-gray-800">{note.transcription}</p>
                      </div>
                    )}
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Data */}
          {selectedView === 'offline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Offline Data Management</h3>
                {isOnline && offlineData.filter(item => !item.synced).length > 0 && (
                  <button
                    onClick={syncOfflineData}
                    disabled={syncInProgress}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {syncInProgress ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                        Sync All Data
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Offline Data Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CloudArrowDownIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">Total Offline Items</p>
                      <p className="text-2xl font-bold text-blue-600">{offlineData.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-900">Pending Sync</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {offlineData.filter(item => !item.synced).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-900">Synced</p>
                      <p className="text-2xl font-bold text-green-600">
                        {offlineData.filter(item => item.synced).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline Items List */}
              <div className="space-y-3">
                {offlineData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {item.type === 'photo' && <PhotoIcon className="h-5 w-5 text-blue-500" />}
                      {item.type === 'voice-note' && <MicrophoneIcon className="h-5 w-5 text-green-500" />}
                      {item.type === 'measurement' && <ScaleIcon className="h-5 w-5 text-purple-500" />}
                      {item.type === 'time-entry' && <ClockIcon className="h-5 w-5 text-yellow-500" />}
                      {item.type === 'inspection' && <DocumentTextIcon className="h-5 w-5 text-red-500" />}
                      
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {item.type.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.synced ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">Synced</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {offlineData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CloudArrowDownIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No offline data stored</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileWorkspace;