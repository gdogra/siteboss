export interface SchedulingConstraint {
  id: string;
  type: 'weather' | 'resource' | 'dependency' | 'regulatory' | 'seasonal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  startDate: Date;
  endDate: Date;
  affectedTasks: string[];
  probability: number;
  impact: 'minor' | 'moderate' | 'major' | 'severe';
}

export interface SmartScheduleOptimization {
  originalSchedule: TaskSchedule[];
  optimizedSchedule: TaskSchedule[];
  improvements: ScheduleImprovement[];
  riskMitigation: RiskMitigation[];
  resourceOptimization: ResourceOptimization[];
  timelineSavings: number; // days
  costSavings: number; // dollars
  confidenceScore: number;
}

export interface TaskSchedule {
  taskId: string;
  taskName: string;
  originalStart: Date;
  originalEnd: Date;
  optimizedStart: Date;
  optimizedEnd: Date;
  duration: number;
  dependencies: string[];
  assignedResources: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  bufferTime: number;
}

export interface ScheduleImprovement {
  type: 'parallel_execution' | 'resource_optimization' | 'weather_avoidance' | 'dependency_optimization';
  description: string;
  affectedTasks: string[];
  timeSaved: number;
  riskReduction: number;
}

export interface RiskMitigation {
  riskType: string;
  mitigation: string;
  probability: number;
  impact: string;
  cost: number;
}

export interface ResourceOptimization {
  resourceType: 'labor' | 'equipment' | 'material';
  resourceId: string;
  optimization: string;
  utilization: number;
  savings: number;
}

export interface WeatherData {
  date: Date;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow';
  temperature: number;
  precipitation: number;
  windSpeed: number;
  workableHours: number;
}

export interface ResourceAvailability {
  resourceId: string;
  resourceType: 'labor' | 'equipment' | 'material';
  available: boolean;
  availableFrom: Date;
  availableUntil: Date;
  capacity: number;
  utilizationRate: number;
}

class SmartSchedulingService {
  private weatherCache: Map<string, WeatherData[]> = new Map();
  private resourceCache: Map<string, ResourceAvailability[]> = new Map();
  private optimizationHistory: Map<string, SmartScheduleOptimization[]> = new Map();

  constructor() {
    this.initializeSchedulingEngine();
  }

  private initializeSchedulingEngine() {
    // Initialize AI scheduling models and constraint solvers
    console.log('Smart Scheduling Engine initialized');
  }

  async optimizeProjectSchedule(
    projectId: string,
    tasks: Record<string, unknown>[],
    constraints: SchedulingConstraint[] = [],
    preferences: Record<string, unknown> = {}
  ): Promise<SmartScheduleOptimization> {
    try {
      // Get weather forecast
      const weatherData = await this.getWeatherForecast(projectId);
      
      // Get resource availability
      const resourceData = await this.getResourceAvailability(projectId);
      
      // Generate scheduling constraints automatically
      const autoConstraints = await this.generateSmartConstraints(projectId, tasks, weatherData, resourceData);
      
      // Combine manual and auto-generated constraints
      const allConstraints = [...constraints, ...autoConstraints];
      
      // Run optimization algorithm
      const optimization = await this.runScheduleOptimization(tasks, allConstraints, weatherData, resourceData, preferences);
      
      // Store optimization history
      this.storeOptimizationHistory(projectId, optimization);
      
      return optimization;
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      throw new Error('Failed to optimize project schedule');
    }
  }

  private async getWeatherForecast(projectId: string): Promise<WeatherData[]> {
    // Check cache first
    if (this.weatherCache.has(projectId)) {
      return this.weatherCache.get(projectId)!;
    }

    // Simulate weather API call
    const weatherData: WeatherData[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < 90; i++) { // 90 days forecast
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'stormy'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      let workableHours = 8;
      if (condition === 'rainy') workableHours = 4;
      else if (condition === 'stormy') workableHours = 0;
      else if (condition === 'cloudy') workableHours = 6;
      
      weatherData.push({
        date,
        condition,
        temperature: 15 + Math.random() * 20, // 15-35°C
        precipitation: condition === 'rainy' || condition === 'stormy' ? Math.random() * 10 : 0,
        windSpeed: Math.random() * 25,
        workableHours
      });
    }
    
    this.weatherCache.set(projectId, weatherData);
    return weatherData;
  }

  private async getResourceAvailability(projectId: string): Promise<ResourceAvailability[]> {
    if (this.resourceCache.has(projectId)) {
      return this.resourceCache.get(projectId)!;
    }

    // Simulate resource availability data
    const resources: ResourceAvailability[] = [
      {
        resourceId: 'crane-001',
        resourceType: 'equipment',
        available: true,
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        capacity: 1,
        utilizationRate: 0.75
      },
      {
        resourceId: 'crew-alpha',
        resourceType: 'labor',
        available: true,
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        capacity: 8,
        utilizationRate: 0.85
      },
      {
        resourceId: 'concrete-supplier',
        resourceType: 'material',
        available: true,
        availableFrom: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        availableUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        capacity: 1000,
        utilizationRate: 0.60
      }
    ];

    this.resourceCache.set(projectId, resources);
    return resources;
  }

  private async generateSmartConstraints(
    projectId: string,
    tasks: Record<string, unknown>[],
    weatherData: WeatherData[],
    resourceData: ResourceAvailability[]
  ): Promise<SchedulingConstraint[]> {
    const constraints: SchedulingConstraint[] = [];

    // Weather-based constraints
    const stormyDays = weatherData.filter(w => w.condition === 'stormy' || w.workableHours === 0);
    if (stormyDays.length > 0) {
      constraints.push({
        id: 'weather-stormy-constraint',
        type: 'weather',
        severity: 'high',
        description: 'Stormy weather prevents outdoor work',
        startDate: stormyDays[0].date,
        endDate: stormyDays[stormyDays.length - 1].date,
        affectedTasks: tasks.filter(t => t.category === 'outdoor').map(t => t.id),
        probability: 0.9,
        impact: 'major'
      });
    }

    // Resource availability constraints
    resourceData.forEach(resource => {
      if (resource.utilizationRate > 0.8) {
        constraints.push({
          id: `resource-constraint-${resource.resourceId}`,
          type: 'resource',
          severity: 'medium',
          description: `${resource.resourceId} is at high utilization`,
          startDate: resource.availableFrom,
          endDate: resource.availableUntil,
          affectedTasks: tasks.filter(t => t.requiredResources?.includes(resource.resourceId)).map(t => t.id),
          probability: 0.7,
          impact: 'moderate'
        });
      }
    });

    // Seasonal constraints
    const currentMonth = new Date().getMonth();
    if ([11, 0, 1, 2].includes(currentMonth)) { // Winter months
      constraints.push({
        id: 'seasonal-winter-constraint',
        type: 'seasonal',
        severity: 'medium',
        description: 'Winter season may affect outdoor work efficiency',
        startDate: new Date(new Date().getFullYear(), 11, 1), // Dec 1
        endDate: new Date(new Date().getFullYear() + 1, 2, 31), // Mar 31
        affectedTasks: tasks.filter(t => t.category === 'outdoor').map(t => t.id),
        probability: 0.6,
        impact: 'moderate'
      });
    }

    return constraints;
  }

  private async runScheduleOptimization(
    tasks: Record<string, unknown>[],
    constraints: SchedulingConstraint[],
    weatherData: WeatherData[],
    resourceData: ResourceAvailability[],
    preferences: Record<string, unknown>
  ): Promise<SmartScheduleOptimization> {
    // Create task schedules
    const originalSchedule = this.createTaskSchedules(tasks);
    
    // Apply optimization algorithms
    const optimizedSchedule = await this.optimizeTaskSchedule(originalSchedule, constraints, weatherData, resourceData, preferences);
    
    // Calculate improvements
    const improvements = this.calculateImprovements(originalSchedule, optimizedSchedule);
    
    // Generate risk mitigation strategies
    const riskMitigation = this.generateRiskMitigation(constraints, optimizedSchedule);
    
    // Calculate resource optimizations
    const resourceOptimization = this.calculateResourceOptimizations(originalSchedule, optimizedSchedule, resourceData);
    
    // Calculate savings
    const timelineSavings = this.calculateTimelineSavings(originalSchedule, optimizedSchedule);
    const costSavings = this.calculateCostSavings(improvements, resourceOptimization);
    
    return {
      originalSchedule,
      optimizedSchedule,
      improvements,
      riskMitigation,
      resourceOptimization,
      timelineSavings,
      costSavings,
      confidenceScore: 0.87
    };
  }

  private createTaskSchedules(tasks: Record<string, unknown>[]): TaskSchedule[] {
    return tasks.map((task, index) => ({
      taskId: task.id || `task-${index}`,
      taskName: task.name || `Task ${index + 1}`,
      originalStart: task.startDate || new Date(),
      originalEnd: task.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      optimizedStart: task.startDate || new Date(),
      optimizedEnd: task.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: task.duration || 7,
      dependencies: task.dependencies || [],
      assignedResources: task.assignedResources || [],
      priority: task.priority || 'medium',
      bufferTime: 0
    }));
  }

  private async optimizeTaskSchedule(
    schedule: TaskSchedule[],
    constraints: SchedulingConstraint[],
    weatherData: WeatherData[],
    resourceData: ResourceAvailability[],
    preferences: Record<string, unknown>
  ): Promise<TaskSchedule[]> {
    const optimized = [...schedule];

    // Critical path optimization
    optimized.forEach(task => {
      if (task.priority === 'critical') {
        // Add buffer time for critical tasks
        task.bufferTime = Math.ceil(task.duration * 0.2);
        task.optimizedEnd = new Date(task.optimizedEnd.getTime() + task.bufferTime * 24 * 60 * 60 * 1000);
      }
    });

    // Weather-aware scheduling
    optimized.forEach(task => {
      if (task.taskName.toLowerCase().includes('outdoor') || 
          task.taskName.toLowerCase().includes('concrete') ||
          task.taskName.toLowerCase().includes('foundation')) {
        
        // Find best weather window
        const goodWeatherDays = weatherData.filter(w => 
          w.workableHours >= 6 && 
          w.condition !== 'stormy' &&
          w.date >= task.originalStart
        );

        if (goodWeatherDays.length > 0) {
          task.optimizedStart = goodWeatherDays[0].date;
          task.optimizedEnd = new Date(task.optimizedStart.getTime() + task.duration * 24 * 60 * 60 * 1000);
        }
      }
    });

    // Resource availability optimization
    optimized.forEach(task => {
      task.assignedResources.forEach(resourceId => {
        const resource = resourceData.find(r => r.resourceId === resourceId);
        if (resource && !resource.available) {
          // Delay task until resource is available
          if (task.optimizedStart < resource.availableFrom) {
            const delay = resource.availableFrom.getTime() - task.optimizedStart.getTime();
            task.optimizedStart = resource.availableFrom;
            task.optimizedEnd = new Date(task.optimizedEnd.getTime() + delay);
          }
        }
      });
    });

    return optimized;
  }

  private calculateImprovements(original: TaskSchedule[], optimized: TaskSchedule[]): ScheduleImprovement[] {
    const improvements: ScheduleImprovement[] = [];

    // Parallel execution opportunities
    const parallelTasks = optimized.filter((task, index) => {
      const originalTask = original[index];
      return task.optimizedStart.getTime() === originalTask.originalStart.getTime() &&
             task.dependencies.length === 0;
    });

    if (parallelTasks.length > 1) {
      improvements.push({
        type: 'parallel_execution',
        description: `${parallelTasks.length} tasks can be executed in parallel`,
        affectedTasks: parallelTasks.map(t => t.taskId),
        timeSaved: Math.max(...parallelTasks.map(t => t.duration)) - parallelTasks.reduce((sum, t) => sum + t.duration, 0),
        riskReduction: 0.15
      });
    }

    // Weather optimization
    const weatherOptimizedTasks = optimized.filter((task, index) => 
      task.optimizedStart.getTime() !== original[index].originalStart.getTime()
    );

    if (weatherOptimizedTasks.length > 0) {
      improvements.push({
        type: 'weather_avoidance',
        description: 'Tasks rescheduled to avoid adverse weather conditions',
        affectedTasks: weatherOptimizedTasks.map(t => t.taskId),
        timeSaved: 2.5,
        riskReduction: 0.25
      });
    }

    return improvements;
  }

  private generateRiskMitigation(constraints: SchedulingConstraint[], schedule: TaskSchedule[]): RiskMitigation[] {
    return constraints.map(constraint => ({
      riskType: constraint.type,
      mitigation: this.getMitigationStrategy(constraint),
      probability: constraint.probability,
      impact: constraint.impact,
      cost: this.calculateMitigationCost(constraint)
    }));
  }

  private getMitigationStrategy(constraint: SchedulingConstraint): string {
    switch (constraint.type) {
      case 'weather':
        return 'Implement weather protection measures and flexible scheduling';
      case 'resource':
        return 'Secure backup resources and optimize utilization';
      case 'dependency':
        return 'Create parallel work streams where possible';
      case 'regulatory':
        return 'Expedite permit processes and maintain compliance buffer';
      case 'seasonal':
        return 'Adjust work methods for seasonal conditions';
      default:
        return 'Monitor and adapt as conditions change';
    }
  }

  private calculateMitigationCost(constraint: SchedulingConstraint): number {
    const baseCost = {
      'weather': 15000,
      'resource': 25000,
      'dependency': 10000,
      'regulatory': 30000,
      'seasonal': 20000
    };

    const severityMultiplier = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5,
      'critical': 2.0
    };

    return (baseCost[constraint.type] || 15000) * severityMultiplier[constraint.severity];
  }

  private calculateResourceOptimizations(
    original: TaskSchedule[],
    optimized: TaskSchedule[],
    resourceData: ResourceAvailability[]
  ): ResourceOptimization[] {
    const optimizations: ResourceOptimization[] = [];

    resourceData.forEach(resource => {
      const utilization = resource.utilizationRate;
      let savings = 0;

      if (utilization < 0.6) {
        // Underutilized resource
        savings = resource.capacity * 0.2 * 1000; // $1000 per unit per day
        optimizations.push({
          resourceType: resource.resourceType,
          resourceId: resource.resourceId,
          optimization: 'Increase utilization or reduce allocation',
          utilization,
          savings
        });
      } else if (utilization > 0.9) {
        // Over-utilized resource
        optimizations.push({
          resourceType: resource.resourceType,
          resourceId: resource.resourceId,
          optimization: 'Add backup capacity or redistribute load',
          utilization,
          savings: 0
        });
      }
    });

    return optimizations;
  }

  private calculateTimelineSavings(original: TaskSchedule[], optimized: TaskSchedule[]): number {
    const originalEnd = Math.max(...original.map(t => t.originalEnd.getTime()));
    const optimizedEnd = Math.max(...optimized.map(t => t.optimizedEnd.getTime()));
    
    return Math.max(0, (originalEnd - optimizedEnd) / (24 * 60 * 60 * 1000));
  }

  private calculateCostSavings(
    improvements: ScheduleImprovement[],
    resourceOptimizations: ResourceOptimization[]
  ): number {
    const improvementSavings = improvements.reduce((sum, imp) => sum + (imp.timeSaved * 2000), 0); // $2000 per day
    const resourceSavings = resourceOptimizations.reduce((sum, opt) => sum + opt.savings, 0);
    
    return improvementSavings + resourceSavings;
  }

  private storeOptimizationHistory(projectId: string, optimization: SmartScheduleOptimization): void {
    const history = this.optimizationHistory.get(projectId) || [];
    history.push(optimization);
    
    // Keep only last 10 optimizations
    if (history.length > 10) {
      history.shift();
    }
    
    this.optimizationHistory.set(projectId, history);
  }

  async getOptimizationHistory(projectId: string): Promise<SmartScheduleOptimization[]> {
    return this.optimizationHistory.get(projectId) || [];
  }

  async validateScheduleConstraints(
    schedule: TaskSchedule[],
    constraints: SchedulingConstraint[]
  ): Promise<{ valid: boolean; violations: string[] }> {
    const violations: string[] = [];

    constraints.forEach(constraint => {
      const affectedTasks = schedule.filter(task => 
        constraint.affectedTasks.includes(task.taskId)
      );

      affectedTasks.forEach(task => {
        if (task.optimizedStart >= constraint.startDate && 
            task.optimizedStart <= constraint.endDate) {
          violations.push(
            `Task ${task.taskName} conflicts with ${constraint.type} constraint: ${constraint.description}`
          );
        }
      });
    });

    return {
      valid: violations.length === 0,
      violations
    };
  }

  clearCache(): void {
    this.weatherCache.clear();
    this.resourceCache.clear();
  }
}

export const smartSchedulingService = new SmartSchedulingService();