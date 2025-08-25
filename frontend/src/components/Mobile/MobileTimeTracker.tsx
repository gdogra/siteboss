import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  CameraIcon,
  MicrophoneIcon,
  MapPinIcon 
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { offlineService } from '../../services/offlineService';

interface TimeEntry {
  id?: string;
  project_id: string;
  task_id?: string;
  start_time: Date;
  end_time?: Date;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  photos?: string[];
  voice_notes?: string[];
}

interface MobileTimeTrackerProps {
  projectId?: string;
  taskId?: string;
  onTimeLogged?: (entry: TimeEntry) => void;
}

const MobileTimeTracker: React.FC<MobileTimeTrackerProps> = ({
  projectId,
  taskId,
  onTimeLogged
}) => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking && !isPaused && currentEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - currentEntry.start_time.getTime();
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking, isPaused, currentEntry]);

  // Get location when starting tracking
  useEffect(() => {
    if (isTracking && !location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          console.log('📍 Location acquired:', position.coords);
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, [isTracking, location]);

  const formatTime = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTracking = async () => {
    if (!projectId && !taskId) {
      alert('Please select a project or task to track time');
      return;
    }

    const entry: TimeEntry = {
      project_id: projectId!,
      task_id: taskId,
      start_time: new Date(),
      description,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      } : undefined,
      photos: [],
      voice_notes: []
    };

    setCurrentEntry(entry);
    setIsTracking(true);
    setIsPaused(false);
    setElapsedTime(0);

    // Request wake lock to prevent screen from sleeping
    if ('wakeLock' in navigator) {
      try {
        await (navigator as any).wakeLock.request('screen');
        console.log('🔒 Wake lock acquired');
      } catch (error) {
        console.error('Wake lock failed:', error);
      }
    }

    // Start background location tracking if supported
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => setLocation(position),
        (error) => console.error('Location tracking error:', error),
        {
          enableHighAccuracy: false,
          maximumAge: 600000, // 10 minutes
          timeout: 30000
        }
      );
    }
  };

  const pauseTracking = () => {
    setIsPaused(true);
  };

  const resumeTracking = () => {
    setIsPaused(false);
  };

  const stopTracking = async () => {
    if (!currentEntry) return;

    const endTime = new Date();
    const finalEntry: TimeEntry = {
      ...currentEntry,
      end_time: endTime,
      description,
      photos,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      } : currentEntry.location
    };

    try {
      // Save time entry offline
      await offlineService.logTimeOffline({
        ...finalEntry,
        user_id: user?.id,
        hours_worked: (endTime.getTime() - currentEntry.start_time.getTime()) / 3600000,
        date: format(currentEntry.start_time, 'yyyy-MM-dd')
      });

      // Reset state
      setCurrentEntry(null);
      setIsTracking(false);
      setIsPaused(false);
      setElapsedTime(0);
      setDescription('');
      setPhotos([]);

      // Callback
      onTimeLogged?.(finalEntry);

      // Show success message
      alert('Time logged successfully!');
    } catch (error) {
      console.error('Failed to log time:', error);
      alert('Failed to log time. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      setPhotos(prev => [...prev, dataURL]);

      // Stop the camera
      stream.getTracks().forEach(track => track.stop());

      console.log('📸 Photo captured');
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);
        
        // Store voice note offline
        const reader = new FileReader();
        reader.onload = async () => {
          const mediaId = await offlineService.storeMediaOffline(
            new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' }),
            {
              project_id: projectId,
              task_id: taskId,
              title: `Voice Note - ${format(new Date(), 'MMM d, h:mm a')}`,
              category: 'voice_note',
              type: 'voice_note'
            }
          );
          console.log('🎙️ Voice note stored:', mediaId);
        };
        reader.readAsDataURL(blob);

        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      console.log('🎙️ Voice recording started');
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(elapsedTime)}
        </div>
        <div className="text-sm text-gray-600">
          {isTracking ? (isPaused ? 'Paused' : 'Tracking') : 'Ready to track'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isTracking ? (
          <button
            onClick={startTracking}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors"
          >
            <PlayIcon className="h-8 w-8" />
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? resumeTracking : pauseTracking}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full shadow-lg transition-colors"
            >
              {isPaused ? <PlayIcon className="h-8 w-8" /> : <PauseIcon className="h-8 w-8" />}
            </button>
            <button
              onClick={stopTracking}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-colors"
            >
              <StopIcon className="h-8 w-8" />
            </button>
          </>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          rows={3}
          disabled={!isTracking}
        />
      </div>

      {/* Media Controls */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={takePhoto}
          disabled={!isTracking}
          className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CameraIcon className="h-6 w-6 text-gray-600 mb-1" />
          <span className="text-xs text-gray-600">Photo</span>
        </button>

        <button
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          disabled={!isTracking}
          className={`flex flex-col items-center p-3 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <MicrophoneIcon className={`h-6 w-6 mb-1 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
          <span className="text-xs text-gray-600">
            {isRecording ? 'Stop' : 'Voice'}
          </span>
        </button>

        <div className="flex flex-col items-center p-3 border border-gray-300 rounded-md">
          <MapPinIcon className={`h-6 w-6 mb-1 ${location ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-xs text-gray-600">
            {location ? 'GPS' : 'No GPS'}
          </span>
        </div>
      </div>

      {/* Photos Preview */}
      {photos.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Photos ({photos.length})
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Location Info */}
      {location && (
        <div className="text-xs text-gray-500 text-center">
          📍 Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
          <br />
          Accuracy: ±{Math.round(location.coords.accuracy)}m
        </div>
      )}

      {/* Offline Indicator */}
      {!navigator.onLine && (
        <div className="mt-4 p-2 bg-yellow-100 border border-yellow-300 rounded-md text-center">
          <div className="text-sm text-yellow-800">
            📱 Working offline - data will sync when connected
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTimeTracker;