import React, { useState, useEffect } from 'react';
import {
  WrenchScrewdriverIcon,
  MapPinIcon,
  Battery0Icon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  CogIcon,
  CalendarIcon,
  DocumentTextIcon,
  SignalIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface Equipment {
  id: string;
  name: string;
  model: string;
  type: 'heavy-machinery' | 'power-tools' | 'vehicles' | 'safety-equipment' | 'measuring-tools';
  serialNumber: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  };
  status: 'active' | 'idle' | 'maintenance' | 'offline' | 'repair';
  batteryLevel?: number;
  lastSeen: Date;
  assignedTo?: string;
  currentProject?: string;
  maintenanceSchedule: MaintenanceRecord[];
  utilizationHours: number;
  totalHours: number;
  alerts: EquipmentAlert[];
  sensors?: EquipmentSensor[];
  value: number;
  purchaseDate: Date;
}

interface MaintenanceRecord {
  id: string;
  type: 'scheduled' | 'preventive' | 'corrective' | 'emergency';
  description: string;
  dueDate: Date;
  completedDate?: Date;
  technician?: string;
  cost?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface EquipmentAlert {
  id: string;
  type: 'maintenance-due' | 'battery-low' | 'offline' | 'unauthorized-use' | 'location-anomaly' | 'performance-issue';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface EquipmentSensor {
  type: 'temperature' | 'pressure' | 'vibration' | 'fuel' | 'location' | 'usage';
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: Date;
}

const EquipmentTracker: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'tracking' | 'maintenance' | 'analytics'>('overview');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const data = await generateMockEquipmentData();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockEquipmentData = async (): Promise<Equipment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'eq-001',
            name: 'Excavator Alpha',
            model: 'CAT 320GC',
            type: 'heavy-machinery',
            serialNumber: 'CAT320-2024-001',
            location: {
              latitude: 40.7128,
              longitude: -74.0060,
              address: '123 Construction Site Ave, New York, NY',
              zone: 'Zone A - Foundation'
            },
            status: 'active',
            batteryLevel: 78,
            lastSeen: new Date(Date.now() - 15 * 60 * 1000),
            assignedTo: 'Mike Johnson',
            currentProject: 'Downtown Office Complex',
            maintenanceSchedule: [
              {
                id: 'main-001',
                type: 'scheduled',
                description: '500-hour service interval',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'pending',
                priority: 'medium'
              }
            ],
            utilizationHours: 342,
            totalHours: 1250,
            alerts: [
              {
                id: 'alert-001',
                type: 'maintenance-due',
                severity: 'warning',
                message: 'Scheduled maintenance due in 7 days',
                timestamp: new Date(),
                resolved: false
              }
            ],
            sensors: [
              {
                type: 'temperature',
                value: 185,
                unit: '°F',
                status: 'normal',
                lastUpdate: new Date()
              },
              {
                type: 'fuel',
                value: 67,
                unit: '%',
                status: 'normal',
                lastUpdate: new Date()
              }
            ],
            value: 285000,
            purchaseDate: new Date('2023-08-15')
          },
          {
            id: 'eq-002',
            name: 'Concrete Mixer Bravo',
            model: 'Volvo FM',
            type: 'vehicles',
            serialNumber: 'VOLVO-CM-2023-005',
            location: {
              latitude: 40.7589,
              longitude: -73.9851,
              address: '456 Build Street, New York, NY',
              zone: 'Zone B - Structure'
            },
            status: 'maintenance',
            batteryLevel: 45,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
            assignedTo: 'Sarah Wilson',
            currentProject: 'Downtown Office Complex',
            maintenanceSchedule: [
              {
                id: 'main-002',
                type: 'corrective',
                description: 'Hydraulic system repair',
                dueDate: new Date(),
                status: 'in-progress',
                priority: 'high',
                technician: 'Tom Martinez'
              }
            ],
            utilizationHours: 89,
            totalHours: 890,
            alerts: [
              {
                id: 'alert-002',
                type: 'battery-low',
                severity: 'warning',
                message: 'Battery level below 50%',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                resolved: false
              }
            ],
            sensors: [
              {
                type: 'pressure',
                value: 2800,
                unit: 'PSI',
                status: 'warning',
                lastUpdate: new Date()
              }
            ],
            value: 175000,
            purchaseDate: new Date('2023-05-20')
          },
          {
            id: 'eq-003',
            name: 'Tower Crane Charlie',
            model: 'Liebherr 280 EC-H',
            type: 'heavy-machinery',
            serialNumber: 'LB-280-2024-003',
            location: {
              latitude: 40.7505,
              longitude: -73.9934,
              address: '789 Development Blvd, New York, NY',
              zone: 'Zone C - High Rise'
            },
            status: 'active',
            lastSeen: new Date(Date.now() - 5 * 60 * 1000),
            assignedTo: 'Carlos Rodriguez',
            currentProject: 'Downtown Office Complex',
            maintenanceSchedule: [
              {
                id: 'main-003',
                type: 'preventive',
                description: 'Monthly safety inspection',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                status: 'pending',
                priority: 'high'
              }
            ],
            utilizationHours: 156,
            totalHours: 567,
            alerts: [],
            sensors: [
              {
                type: 'vibration',
                value: 2.3,
                unit: 'mm/s',
                status: 'normal',
                lastUpdate: new Date()
              }
            ],
            value: 850000,
            purchaseDate: new Date('2024-01-10')
          },
          {
            id: 'eq-004',
            name: 'Laser Level Delta',
            model: 'Leica Builder 509',
            type: 'measuring-tools',
            serialNumber: 'LEICA-509-2023-012',
            location: {
              latitude: 40.7128,
              longitude: -74.0060,
              address: '123 Construction Site Ave, New York, NY',
              zone: 'Tool Storage'
            },
            status: 'idle',
            batteryLevel: 92,
            lastSeen: new Date(Date.now() - 45 * 60 * 1000),
            maintenanceSchedule: [
              {
                id: 'main-004',
                type: 'scheduled',
                description: 'Calibration check',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'pending',
                priority: 'low'
              }
            ],
            utilizationHours: 23,
            totalHours: 156,
            alerts: [],
            sensors: [
              {
                type: 'temperature',
                value: 72,
                unit: '°F',
                status: 'normal',
                lastUpdate: new Date()
              }
            ],
            value: 3500,
            purchaseDate: new Date('2023-11-05')
          }
        ]);
      }, 1000);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'idle': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'repair': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'heavy-machinery': return <WrenchScrewdriverIcon className="h-5 w-5" />;
      case 'vehicles': return <TruckIcon className="h-5 w-5" />;
      case 'power-tools': return <CogIcon className="h-5 w-5" />;
      case 'measuring-tools': return <BeakerIcon className="h-5 w-5" />;
      case 'safety-equipment': return <CheckCircleIcon className="h-5 w-5" />;
      default: return <WrenchScrewdriverIcon className="h-5 w-5" />;
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const typeMatch = filterType === 'all' || eq.type === filterType;
    const statusMatch = filterStatus === 'all' || eq.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const equipmentTypes = ['heavy-machinery', 'vehicles', 'power-tools', 'measuring-tools', 'safety-equipment'];
  const equipmentStatuses = ['active', 'idle', 'maintenance', 'offline', 'repair'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Equipment & Tool Tracker</h2>
            <p className="text-gray-600">Real-time equipment monitoring with GPS tracking and IoT sensors</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <MapPinIcon className="h-4 w-4 mr-2" />
            View Map
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
            <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Equipment</p>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(eq => eq.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Maintenance Due</p>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(eq => eq.maintenanceSchedule.some(m => m.status === 'pending' && m.dueDate <= new Date())).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {((equipment.reduce((sum, eq) => sum + (eq.utilizationHours / eq.totalHours), 0) / equipment.length) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <SignalIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {equipment.filter(eq => eq.status !== 'offline').length}/{equipment.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: WrenchScrewdriverIcon },
              { id: 'tracking', name: 'Live Tracking', icon: MapPinIcon },
              { id: 'maintenance', name: 'Maintenance', icon: CogIcon },
              { id: 'analytics', name: 'Analytics', icon: DocumentTextIcon }
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
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview */}
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex space-x-4">
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Types</option>
                    {equipmentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Status</option>
                    {equipmentStatuses.map(status => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Equipment Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEquipment(eq)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTypeIcon(eq.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{eq.name}</h3>
                          <p className="text-sm text-gray-600">{eq.model}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(eq.status)}`}>
                        {eq.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Location */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{eq.location.zone}</span>
                      </div>

                      {/* Battery Level */}
                      {eq.batteryLevel && (
                        <div className="flex items-center space-x-2">
                          <Battery0Icon className={`h-4 w-4 ${
                            eq.batteryLevel > 50 ? 'text-green-500' :
                            eq.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Battery</span>
                              <span className="font-medium">{eq.batteryLevel}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  eq.batteryLevel > 50 ? 'bg-green-500' :
                                  eq.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${eq.batteryLevel}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Utilization */}
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Utilization</span>
                            <span className="font-medium">
                              {((eq.utilizationHours / eq.totalHours) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 bg-blue-500 rounded-full"
                              style={{ width: `${(eq.utilizationHours / eq.totalHours) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Assigned To */}
                      {eq.assignedTo && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Assigned to:</span>
                          <span className="font-medium">{eq.assignedTo}</span>
                        </div>
                      )}

                      {/* Last Seen */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>Last seen: {eq.lastSeen.toLocaleString()}</span>
                      </div>

                      {/* Alerts */}
                      {eq.alerts.length > 0 && (
                        <div className="pt-3 border-t">
                          {eq.alerts.slice(0, 2).map((alert) => (
                            <div key={alert.id} className="flex items-center space-x-2 text-sm mb-1">
                              <ExclamationTriangleIcon className={`h-3 w-3 ${getSeverityColor(alert.severity)}`} />
                              <span className={getSeverityColor(alert.severity)}>
                                {alert.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Tracking */}
          {selectedView === 'tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Live Equipment Tracking</h3>
              
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive Map View</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Real-time GPS tracking of all equipment would be displayed here
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Active Equipment Locations</h4>
                  <div className="space-y-3">
                    {equipment.filter(eq => eq.status === 'active').map((eq) => (
                      <div key={eq.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(eq.type)}
                          <div>
                            <p className="font-medium text-gray-900">{eq.name}</p>
                            <p className="text-sm text-gray-600">{eq.location.zone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{eq.assignedTo}</p>
                          <p className="text-xs text-gray-600">
                            {Math.floor((Date.now() - eq.lastSeen.getTime()) / (1000 * 60))} min ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Location Alerts</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-green-800 font-medium">All equipment within designated zones</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-800">GPS tracking active on {equipment.length} devices</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance */}
          {selectedView === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Maintenance Schedule</h3>
              
              <div className="space-y-4">
                {equipment.flatMap(eq => 
                  eq.maintenanceSchedule.map(maintenance => ({
                    ...maintenance,
                    equipmentName: eq.name,
                    equipmentId: eq.id
                  }))
                )
                .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                .map((maintenance) => (
                  <div key={maintenance.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CogIcon className="h-5 w-5 text-gray-500" />
                          <h4 className="font-medium text-gray-900">{maintenance.equipmentName}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            maintenance.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            maintenance.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            maintenance.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {maintenance.priority}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{maintenance.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Due: {maintenance.dueDate.toLocaleDateString()}
                          </span>
                          <span className="capitalize">{maintenance.type}</span>
                          {maintenance.technician && (
                            <span>Technician: {maintenance.technician}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          maintenance.status === 'completed' ? 'bg-green-100 text-green-800' :
                          maintenance.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          maintenance.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {maintenance.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {maintenance.status === 'pending' && (
                      <div className="flex space-x-2 pt-3 border-t">
                        <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
                          Schedule
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics */}
          {selectedView === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Equipment Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Utilization by Type</h4>
                  <div className="space-y-4">
                    {equipmentTypes.map((type) => {
                      const typeEquipment = equipment.filter(eq => eq.type === type);
                      const avgUtilization = typeEquipment.length > 0 
                        ? typeEquipment.reduce((sum, eq) => sum + (eq.utilizationHours / eq.totalHours), 0) / typeEquipment.length 
                        : 0;
                      
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{type.replace('-', ' ')}</span>
                            <span className="font-medium">{(avgUtilization * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-primary-500 rounded-full"
                              style={{ width: `${avgUtilization * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Fleet Value</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fleet Value:</span>
                      <span className="font-bold text-lg">
                        ${equipment.reduce((sum, eq) => sum + eq.value, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Equipment:</span>
                      <span className="font-medium">
                        ${equipment.filter(eq => eq.status === 'active').reduce((sum, eq) => sum + eq.value, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">In Maintenance:</span>
                      <span className="font-medium text-yellow-600">
                        ${equipment.filter(eq => eq.status === 'maintenance').reduce((sum, eq) => sum + eq.value, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEquipment.name} - Equipment Details
              </h3>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Equipment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Equipment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{selectedEquipment.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial Number:</span>
                      <span className="font-medium">{selectedEquipment.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {selectedEquipment.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">${selectedEquipment.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium">{selectedEquipment.purchaseDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedEquipment.status)}`}>
                        {selectedEquipment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedEquipment.location.zone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned To:</span>
                      <span className="font-medium">{selectedEquipment.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Seen:</span>
                      <span className="font-medium">{selectedEquipment.lastSeen.toLocaleString()}</span>
                    </div>
                    {selectedEquipment.batteryLevel && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Battery Level:</span>
                        <span className={`font-medium ${
                          selectedEquipment.batteryLevel > 50 ? 'text-green-600' :
                          selectedEquipment.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {selectedEquipment.batteryLevel}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sensors */}
              {selectedEquipment.sensors && selectedEquipment.sensors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sensor Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedEquipment.sensors.map((sensor, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {sensor.type}
                          </span>
                          <span className={`text-xs font-medium ${getSensorStatusColor(sensor.status)}`}>
                            {sensor.status}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mb-1">
                          {sensor.value} {sensor.unit}
                        </div>
                        <div className="text-xs text-gray-600">
                          Updated: {sensor.lastUpdate.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts */}
              {selectedEquipment.alerts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Active Alerts</h4>
                  <div className="space-y-2">
                    {selectedEquipment.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <ExclamationTriangleIcon className={`h-5 w-5 mt-0.5 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.type.replace('-', ' ').toUpperCase()}
                          </p>
                          <p className="text-gray-700 text-sm">{alert.message}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t">
                <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-medium">
                  Schedule Maintenance
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium">
                  View Location
                </button>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentTracker;