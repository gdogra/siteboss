import pool from '../database/connection';
import { EquipmentSensor, EquipmentTelemetry, MaintenanceAlert, EquipmentLocation, EquipmentMetrics } from '../types/enhanced';
import mqtt from 'mqtt';
import { EventEmitter } from 'events';

export class IoTService extends EventEmitter {
  private mqttClient: mqtt.MqttApi | null = null;
  private isConnected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeMQTT();
  }

  private async initializeMQTT(): Promise<void> {
    try {
      const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
      
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `siteboss-iot-${Date.now()}`,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        keepalive: 60,
        reconnectPeriod: 5000,
        clean: true
      });

      this.mqttClient.on('connect', () => {
        console.log('🔗 Connected to IoT MQTT broker');
        this.isConnected = true;
        this.subscribeToTopics();
        this.emit('connected');
      });

      this.mqttClient.on('message', this.handleMqttMessage.bind(this));

      this.mqttClient.on('error', (error) => {
        console.error('❌ MQTT connection error:', error);
        this.isConnected = false;
        this.emit('error', error);
      });

      this.mqttClient.on('disconnect', () => {
        console.log('📡 Disconnected from IoT MQTT broker');
        this.isConnected = false;
        this.emit('disconnected');
      });

    } catch (error) {
      console.error('Failed to initialize MQTT client:', error);
    }
  }

  private subscribeToTopics(): void {
    if (!this.mqttClient || !this.isConnected) return;

    const topics = [
      'siteboss/equipment/+/gps',
      'siteboss/equipment/+/fuel',
      'siteboss/equipment/+/engine',
      'siteboss/equipment/+/diagnostic',
      'siteboss/equipment/+/maintenance',
      'siteboss/sensors/+/data'
    ];

    topics.forEach(topic => {
      this.mqttClient!.subscribe(topic, (error) => {
        if (error) {
          console.error(`Failed to subscribe to ${topic}:`, error);
        } else {
          console.log(`📡 Subscribed to ${topic}`);
        }
      });
    });
  }

  private async handleMqttMessage(topic: string, payload: Buffer): Promise<void> {
    try {
      const data = JSON.parse(payload.toString());
      const topicParts = topic.split('/');
      const equipmentId = topicParts[2];
      const dataType = topicParts[3];

      await this.processTelemetryData(equipmentId, dataType, data);
    } catch (error) {
      console.error(`Error processing MQTT message for topic ${topic}:`, error);
    }
  }

  // Register new IoT sensor
  async registerSensor(sensorData: Omit<EquipmentSensor, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const query = `
      INSERT INTO equipment_sensors (resource_id, sensor_type, sensor_id, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const result = await pool.query(query, [
      sensorData.resource_id,
      sensorData.sensor_type,
      sensorData.sensor_id,
      sensorData.is_active
    ]);

    console.log(`📟 Registered sensor ${sensorData.sensor_id} for equipment ${sensorData.resource_id}`);
    return result.rows[0].id;
  }

  // Process incoming telemetry data
  private async processTelemetryData(equipmentId: string, dataType: string, data: any): Promise<void> {
    try {
      // Find the sensor
      const sensorQuery = `
        SELECT es.*, r.name as equipment_name
        FROM equipment_sensors es
        JOIN resources r ON es.resource_id = r.id
        WHERE r.serial_number = $1 AND es.sensor_type = $2 AND es.is_active = true
      `;

      const sensor = await pool.query(sensorQuery, [equipmentId, dataType]);
      
      if (sensor.rows.length === 0) {
        console.warn(`No active sensor found for equipment ${equipmentId} and type ${dataType}`);
        return;
      }

      const sensorData = sensor.rows[0];

      // Store telemetry data
      await this.storeTelemetryData(sensorData.id, data);

      // Update sensor last reading
      await this.updateSensorLastReading(sensorData.id, data);

      // Process specific data types
      switch (dataType) {
        case 'gps':
          await this.processLocationData(sensorData.resource_id, data);
          break;
        case 'fuel':
          await this.processFuelData(sensorData.resource_id, data);
          break;
        case 'engine':
          await this.processEngineData(sensorData.resource_id, data);
          break;
        case 'diagnostic':
          await this.processDiagnosticData(sensorData.resource_id, data);
          break;
        case 'maintenance':
          await this.processMaintenanceData(sensorData.resource_id, data);
          break;
      }

      // Emit real-time event
      this.emit('telemetryReceived', {
        equipmentId: sensorData.resource_id,
        equipmentName: sensorData.equipment_name,
        sensorType: dataType,
        data
      });

    } catch (error) {
      console.error(`Error processing telemetry data for ${equipmentId}:`, error);
    }
  }

  private async storeTelemetryData(sensorId: string, data: any): Promise<void> {
    const query = `
      INSERT INTO equipment_telemetry (sensor_id, reading_data, reading_time)
      VALUES ($1, $2, $3)
    `;

    await pool.query(query, [
      sensorId,
      JSON.stringify(data),
      new Date(data.timestamp || Date.now())
    ]);
  }

  private async updateSensorLastReading(sensorId: string, data: any): Promise<void> {
    const query = `
      UPDATE equipment_sensors 
      SET last_reading = $1, 
          last_reading_time = $2, 
          battery_level = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;

    await pool.query(query, [
      JSON.stringify(data),
      new Date(data.timestamp || Date.now()),
      data.battery_level || null,
      sensorId
    ]);
  }

  // Process GPS location data
  private async processLocationData(resourceId: string, data: any): Promise<void> {
    const location: EquipmentLocation = {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy || 0,
      timestamp: new Date(data.timestamp),
      geofence_status: 'unknown'
    };

    // Check geofences
    const geofenceQuery = `
      SELECT js.id, js.name, js.latitude, js.longitude
      FROM job_sites js
      JOIN projects p ON js.project_id = p.id
      WHERE p.company_id = (
        SELECT company_id FROM resources WHERE id = $1
      )
    `;

    const geofences = await pool.query(geofenceQuery, [resourceId]);

    // Check if equipment is within any job site (simplified 1km radius check)
    for (const site of geofences.rows) {
      const distance = this.calculateDistance(
        location.latitude, 
        location.longitude, 
        site.latitude, 
        site.longitude
      );

      if (distance <= 1) { // Within 1km
        location.geofence_status = 'inside';
        break;
      }
    }

    if (location.geofence_status === 'unknown') {
      location.geofence_status = 'outside';
    }

    // Update resource location
    await pool.query(`
      UPDATE resources 
      SET last_location = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(location), resourceId]);

    // Generate geofence alert if needed
    if (location.geofence_status === 'outside') {
      await this.generateGeofenceAlert(resourceId, location);
    }
  }

  // Process fuel data
  private async processFuelData(resourceId: string, data: any): Promise<void> {
    const fuelLevel = data.fuel_level;
    const fuelConsumption = data.fuel_consumption_rate;

    if (fuelLevel !== undefined && fuelLevel < 20) {
      await this.generateMaintenanceAlert(resourceId, 'fuel', 'warning', 
        `Low fuel level: ${fuelLevel}%`, 'Refuel equipment');
    }

    // Track fuel efficiency
    await this.updateEquipmentMetrics(resourceId, { fuel_level: fuelLevel });
  }

  // Process engine data
  private async processEngineData(resourceId: string, data: any): Promise<void> {
    const metrics: EquipmentMetrics = {
      engine_hours: data.engine_hours,
      temperature: data.temperature,
      pressure: data.pressure,
      vibration_level: data.vibration_level,
      error_codes: data.error_codes || []
    };

    // Check for critical conditions
    if (data.temperature > 220) { // Engine overheating
      await this.generateMaintenanceAlert(resourceId, 'engine', 'critical',
        `Engine overheating: ${data.temperature}°F`, 'Stop equipment immediately and check cooling system');
    }

    if (data.pressure < 20) { // Low oil pressure
      await this.generateMaintenanceAlert(resourceId, 'engine', 'critical',
        `Low oil pressure: ${data.pressure} PSI`, 'Stop equipment and check oil level');
    }

    if (data.error_codes && data.error_codes.length > 0) {
      await this.generateMaintenanceAlert(resourceId, 'diagnostic', 'warning',
        `Diagnostic codes: ${data.error_codes.join(', ')}`, 'Check equipment diagnostic system');
    }

    await this.updateEquipmentMetrics(resourceId, metrics);

    // Check maintenance schedule based on engine hours
    await this.checkMaintenanceSchedule(resourceId, data.engine_hours);
  }

  // Process diagnostic data
  private async processDiagnosticData(resourceId: string, data: any): Promise<void> {
    if (data.fault_codes && data.fault_codes.length > 0) {
      const severity = data.severity || 'warning';
      const codes = data.fault_codes.join(', ');
      
      await this.generateMaintenanceAlert(resourceId, 'diagnostic', severity,
        `Fault codes detected: ${codes}`, 'Perform diagnostic check');
    }
  }

  // Process maintenance data
  private async processMaintenanceData(resourceId: string, data: any): Promise<void> {
    if (data.maintenance_required) {
      await this.generateMaintenanceAlert(resourceId, 'scheduled', 'info',
        data.message || 'Scheduled maintenance required', 
        data.action || 'Perform scheduled maintenance');
    }
  }

  // Generate maintenance alert
  private async generateMaintenanceAlert(
    resourceId: string, 
    alertType: string, 
    severity: string, 
    message: string, 
    recommendedAction: string
  ): Promise<void> {
    const alert: Omit<MaintenanceAlert, 'id'> = {
      resource_id: resourceId,
      alert_type: alertType as any,
      severity: severity as any,
      message,
      recommended_action: recommendedAction,
      created_at: new Date(),
      acknowledged: false,
      resolved: false,
      resolved_at: undefined,
      acknowledged_by: undefined
    };

    const query = `
      INSERT INTO maintenance_alerts (resource_id, alert_type, severity, message, recommended_action)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await pool.query(query, [
      alert.resource_id,
      alert.alert_type,
      alert.severity,
      alert.message,
      alert.recommended_action
    ]);

    // Emit real-time alert
    this.emit('maintenanceAlert', {
      id: result.rows[0].id,
      ...alert
    });

    console.log(`🚨 Generated maintenance alert for equipment ${resourceId}: ${message}`);
  }

  private async generateGeofenceAlert(resourceId: string, location: EquipmentLocation): Promise<void> {
    await this.generateMaintenanceAlert(resourceId, 'geofence', 'warning',
      `Equipment is outside authorized job sites`, 
      'Check equipment location and authorization');
  }

  // Update equipment metrics
  private async updateEquipmentMetrics(resourceId: string, metrics: Partial<EquipmentMetrics>): Promise<void> {
    const query = `
      UPDATE resources 
      SET current_metrics = COALESCE(current_metrics, '{}'::jsonb) || $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await pool.query(query, [JSON.stringify(metrics), resourceId]);
  }

  // Check maintenance schedule
  private async checkMaintenanceSchedule(resourceId: string, currentHours: number): Promise<void> {
    const query = `
      SELECT * FROM maintenance_schedules
      WHERE resource_id = $1 
        AND schedule_type = 'hours'
        AND status = 'scheduled'
        AND next_maintenance_hours <= $2
    `;

    const schedules = await pool.query(query, [resourceId, currentHours]);

    for (const schedule of schedules.rows) {
      await this.generateMaintenanceAlert(resourceId, 'scheduled', 'info',
        `Scheduled maintenance due: ${schedule.description}`,
        'Perform scheduled maintenance');

      // Update schedule status
      await pool.query(`
        UPDATE maintenance_schedules 
        SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [schedule.id]);
    }
  }

  // Get real-time equipment status
  async getEquipmentStatus(resourceId: string): Promise<any> {
    const query = `
      SELECT r.*, 
             r.current_metrics,
             r.last_location,
             COUNT(CASE WHEN ma.resolved = false THEN 1 END) as active_alerts,
             MAX(es.last_reading_time) as last_telemetry
      FROM resources r
      LEFT JOIN maintenance_alerts ma ON r.id = ma.resource_id
      LEFT JOIN equipment_sensors es ON r.id = es.resource_id
      WHERE r.id = $1
      GROUP BY r.id
    `;

    const result = await pool.query(query, [resourceId]);
    return result.rows[0];
  }

  // Get equipment telemetry history
  async getEquipmentTelemetry(
    resourceId: string, 
    sensorType?: string, 
    startDate?: Date, 
    endDate?: Date,
    limit: number = 1000
  ): Promise<any[]> {
    let query = `
      SELECT et.*, es.sensor_type, es.sensor_id
      FROM equipment_telemetry et
      JOIN equipment_sensors es ON et.sensor_id = es.id
      WHERE es.resource_id = $1
    `;

    const params: any[] = [resourceId];
    let paramIndex = 2;

    if (sensorType) {
      query += ` AND es.sensor_type = $${paramIndex}`;
      params.push(sensorType);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND et.reading_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND et.reading_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY et.reading_time DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get maintenance alerts
  async getMaintenanceAlerts(resourceId?: string, unresolved: boolean = true): Promise<MaintenanceAlert[]> {
    let query = `
      SELECT ma.*, r.name as equipment_name
      FROM maintenance_alerts ma
      JOIN resources r ON ma.resource_id = r.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (resourceId) {
      query += ` AND ma.resource_id = $${paramIndex}`;
      params.push(resourceId);
      paramIndex++;
    }

    if (unresolved) {
      query += ` AND ma.resolved = false`;
    }

    query += ` ORDER BY ma.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const query = `
      UPDATE maintenance_alerts 
      SET acknowledged = true, acknowledged_by = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await pool.query(query, [acknowledgedBy, alertId]);
    
    this.emit('alertAcknowledged', { alertId, acknowledgedBy });
  }

  // Resolve alert
  async resolveAlert(alertId: string): Promise<void> {
    const query = `
      UPDATE maintenance_alerts 
      SET resolved = true, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(query, [alertId]);
    
    this.emit('alertResolved', { alertId });
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Send command to equipment
  async sendEquipmentCommand(resourceId: string, command: string, parameters?: any): Promise<boolean> {
    if (!this.mqttClient || !this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const resource = await pool.query('SELECT serial_number FROM resources WHERE id = $1', [resourceId]);
    if (resource.rows.length === 0) {
      throw new Error('Equipment not found');
    }

    const topic = `siteboss/equipment/${resource.rows[0].serial_number}/commands`;
    const payload = JSON.stringify({
      command,
      parameters: parameters || {},
      timestamp: Date.now()
    });

    return new Promise((resolve, reject) => {
      this.mqttClient!.publish(topic, payload, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Cleanup and disconnect
  async disconnect(): Promise<void> {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }

    if (this.mqttClient) {
      this.mqttClient.end();
    }

    this.isConnected = false;
    console.log('🔌 IoT service disconnected');
  }
}

// Singleton instance
export const iotService = new IoTService();

// Equipment simulation for demo purposes
export class EquipmentSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  startSimulation(equipmentId: string, serialNumber: string): void {
    // GPS simulation
    const gpsInterval = setInterval(() => {
      const gpsData = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01, // NYC area with variation
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        accuracy: Math.random() * 10 + 5,
        speed: Math.random() * 50,
        heading: Math.random() * 360,
        timestamp: Date.now(),
        battery_level: 85 + Math.random() * 10
      };

      iotService.emit('simulationData', {
        equipmentId: serialNumber,
        type: 'gps',
        data: gpsData
      });
    }, 10000); // Every 10 seconds

    // Engine data simulation
    const engineInterval = setInterval(() => {
      const engineData = {
        engine_hours: Math.floor(Math.random() * 10000),
        temperature: 180 + Math.random() * 40,
        pressure: 30 + Math.random() * 20,
        vibration_level: Math.random() * 100,
        rpm: 1500 + Math.random() * 1000,
        error_codes: Math.random() > 0.9 ? ['P0001', 'P0002'] : [],
        timestamp: Date.now(),
        battery_level: 85 + Math.random() * 10
      };

      iotService.emit('simulationData', {
        equipmentId: serialNumber,
        type: 'engine',
        data: engineData
      });
    }, 30000); // Every 30 seconds

    // Fuel data simulation
    const fuelInterval = setInterval(() => {
      const fuelData = {
        fuel_level: Math.max(10, Math.random() * 100),
        fuel_consumption_rate: Math.random() * 5 + 2,
        timestamp: Date.now(),
        battery_level: 85 + Math.random() * 10
      };

      iotService.emit('simulationData', {
        equipmentId: serialNumber,
        type: 'fuel',
        data: fuelData
      });
    }, 60000); // Every minute

    this.intervals.set(equipmentId, gpsInterval);
    this.intervals.set(`${equipmentId}_engine`, engineInterval);
    this.intervals.set(`${equipmentId}_fuel`, fuelInterval);

    console.log(`🎭 Started simulation for equipment ${equipmentId}`);
  }

  stopSimulation(equipmentId: string): void {
    const keys = [`${equipmentId}`, `${equipmentId}_engine`, `${equipmentId}_fuel`];
    
    keys.forEach(key => {
      const interval = this.intervals.get(key);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(key);
      }
    });

    console.log(`🛑 Stopped simulation for equipment ${equipmentId}`);
  }

  stopAllSimulations(): void {
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    console.log('🛑 Stopped all equipment simulations');
  }
}

export const equipmentSimulator = new EquipmentSimulator();