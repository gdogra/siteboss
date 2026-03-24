export interface Resource {
  id: string;
  name: string;
  type: 'labor' | 'equipment' | 'material' | 'subcontractor';
  category: string;
  skills?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  availability: ResourceAvailability;
  performance: ResourcePerformance;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  capacity: number;
  currentUtilization: number;
  certifications?: string[];
  experience: number; // years
}

export interface ResourceAvailability {
  isAvailable: boolean;
  availableFrom: Date;
  availableUntil: Date;
  scheduledTasks: string[];
  maintenanceSchedule: MaintenanceWindow[];
  workingHours: {
    start: string; // "08:00"
    end: string;   // "17:00"
    daysOfWeek: number[]; // [1,2,3,4,5] for Mon-Fri
  };
}

export interface MaintenanceWindow {
  id: string;
  startDate: Date;
  endDate: Date;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ResourcePerformance {
  efficiency: number; // 0-1 scale
  qualityScore: number; // 0-1 scale
  reliabilityScore: number; // 0-1 scale
  completionRate: number; // 0-1 scale
  averageTaskTime: number; // hours
  customerRating?: number; // 1-5 scale
  onTimeDelivery: number; // 0-1 scale
  safetyRecord: {
    incidentCount: number;
    lastIncident: Date | null;
    safetyRating: number; // 0-1 scale
  };
}

export interface AllocationRequest {
  projectId: string;
  taskId: string;
  taskName: string;
  requiredSkills: string[];
  requiredResourceTypes: ('labor' | 'equipment' | 'material' | 'subcontractor')[];
  startDate: Date;
  endDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  estimatedHours: number;
  safetyRequirements: string[];
}

export interface AllocationRecommendation {
  resourceId: string;
  resource: Resource;
  suitabilityScore: number; // 0-100
  reasoning: string[];
  estimatedCost: number;
  riskFactors: string[];
  alternatives: {
    resourceId: string;
    score: number;
    reason: string;
  }[];
  availability: {
    canStartImmediately: boolean;
    earliestStart: Date;
    conflictingTasks: string[];
  };
}

export interface AllocationOptimization {
  requestId: string;
  recommendations: AllocationRecommendation[];
  totalCost: number;
  totalRisk: number;
  completionProbability: number;
  alternativeStrategies: AllocationStrategy[];
  costBreakdown: {
    labor: number;
    equipment: number;
    materials: number;
    subcontractors: number;
  };
  timelineImpact: {
    estimatedDuration: number;
    criticalPath: boolean;
    bufferTime: number;
  };
}

export interface AllocationStrategy {
  name: string;
  description: string;
  resources: string[];
  totalCost: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  advantages: string[];
  disadvantages: string[];
}

export interface ResourceConflict {
  resourceId: string;
  conflictingTasks: {
    taskId: string;
    taskName: string;
    priority: string;
    projectId: string;
  }[];
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  resolutionOptions: ConflictResolution[];
}

export interface ConflictResolution {
  type: 'reschedule' | 'substitute' | 'split_resource' | 'extend_timeline';
  description: string;
  impact: string;
  cost: number;
  timeDelay: number;
  riskIncrease: number;
}

class ResourceAllocationService {
  private resources: Map<string, Resource> = new Map();
  private allocationHistory: Map<string, AllocationOptimization[]> = new Map();
  private performanceMetrics: Map<string, ResourcePerformance> = new Map();

  constructor() {
    this.initializeResources();
  }

  private initializeResources() {
    // Initialize with sample resources
    const sampleResources: Resource[] = [
      {
        id: 'crew-001',
        name: 'Construction Crew Alpha',
        type: 'labor',
        category: 'general_construction',
        skills: ['concrete', 'framing', 'electrical', 'plumbing'],
        hourlyRate: 45,
        availability: {
          isAvailable: true,
          availableFrom: new Date(),
          availableUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          scheduledTasks: [],
          maintenanceSchedule: [],
          workingHours: { start: '07:00', end: '16:00', daysOfWeek: [1,2,3,4,5] }
        },
        performance: {
          efficiency: 0.92,
          qualityScore: 0.88,
          reliabilityScore: 0.95,
          completionRate: 0.91,
          averageTaskTime: 8.2,
          customerRating: 4.6,
          onTimeDelivery: 0.89,
          safetyRecord: { incidentCount: 1, lastIncident: new Date('2023-08-15'), safetyRating: 0.94 }
        },
        location: { latitude: 37.7749, longitude: -122.4194, address: 'San Francisco, CA' },
        capacity: 8,
        currentUtilization: 0.75,
        certifications: ['OSHA 30', 'First Aid'],
        experience: 12
      },
      {
        id: 'crane-001',
        name: 'Tower Crane TC-500',
        type: 'equipment',
        category: 'lifting_equipment',
        dailyRate: 1200,
        availability: {
          isAvailable: true,
          availableFrom: new Date(),
          availableUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          scheduledTasks: ['task-steel-frame'],
          maintenanceSchedule: [
            {
              id: 'maint-001',
              startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
              description: 'Monthly safety inspection',
              priority: 'high'
            }
          ],
          workingHours: { start: '06:00', end: '18:00', daysOfWeek: [1,2,3,4,5,6] }
        },
        performance: {
          efficiency: 0.95,
          qualityScore: 0.92,
          reliabilityScore: 0.88,
          completionRate: 0.96,
          averageTaskTime: 10.5,
          onTimeDelivery: 0.92,
          safetyRecord: { incidentCount: 0, lastIncident: null, safetyRating: 0.98 }
        },
        location: { latitude: 37.7849, longitude: -122.4094, address: 'San Francisco, CA' },
        capacity: 1,
        currentUtilization: 0.60,
        certifications: ['Crane Operator License', 'Safety Certification'],
        experience: 8
      },
      {
        id: 'electrician-001',
        name: 'Advanced Electrical Services',
        type: 'subcontractor',
        category: 'electrical',
        skills: ['wiring', 'panel_installation', 'lighting', 'industrial'],
        hourlyRate: 85,
        availability: {
          isAvailable: true,
          availableFrom: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          availableUntil: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          scheduledTasks: ['proj-002-electrical'],
          maintenanceSchedule: [],
          workingHours: { start: '08:00', end: '17:00', daysOfWeek: [1,2,3,4,5] }
        },
        performance: {
          efficiency: 0.89,
          qualityScore: 0.96,
          reliabilityScore: 0.93,
          completionRate: 0.94,
          averageTaskTime: 7.8,
          customerRating: 4.8,
          onTimeDelivery: 0.91,
          safetyRecord: { incidentCount: 0, lastIncident: null, safetyRating: 0.97 }
        },
        location: { latitude: 37.7649, longitude: -122.4294, address: 'South Bay, CA' },
        capacity: 4,
        currentUtilization: 0.80,
        certifications: ['Licensed Electrician', 'NECA Certification'],
        experience: 15
      }
    ];

    sampleResources.forEach(resource => {
      this.resources.set(resource.id, resource);
    });
  }

  async optimizeResourceAllocation(request: AllocationRequest): Promise<AllocationOptimization> {
    try {
      // Find suitable resources
      const suitableResources = await this.findSuitableResources(request);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(request, suitableResources);
      
      // Calculate optimization metrics
      const totalCost = this.calculateTotalCost(recommendations);
      const totalRisk = this.calculateTotalRisk(recommendations);
      const completionProbability = this.calculateCompletionProbability(recommendations);
      
      // Generate alternative strategies
      const alternativeStrategies = await this.generateAlternativeStrategies(request, suitableResources);
      
      // Calculate cost breakdown
      const costBreakdown = this.calculateCostBreakdown(recommendations);
      
      // Assess timeline impact
      const timelineImpact = this.assessTimelineImpact(request, recommendations);
      
      const optimization: AllocationOptimization = {
        requestId: request.taskId,
        recommendations,
        totalCost,
        totalRisk,
        completionProbability,
        alternativeStrategies,
        costBreakdown,
        timelineImpact
      };

      // Store optimization history
      this.storeOptimizationHistory(request.projectId, optimization);
      
      return optimization;
    } catch (error) {
      console.error('Resource allocation optimization failed:', error);
      throw new Error('Failed to optimize resource allocation');
    }
  }

  private async findSuitableResources(request: AllocationRequest): Promise<Resource[]> {
    const suitable: Resource[] = [];

    for (const resource of this.resources.values()) {
      if (this.isResourceSuitable(resource, request)) {
        suitable.push(resource);
      }
    }

    // Sort by suitability score
    return suitable.sort((a, b) => 
      this.calculateSuitabilityScore(b, request) - this.calculateSuitabilityScore(a, request)
    );
  }

  private isResourceSuitable(resource: Resource, request: AllocationRequest): boolean {
    // Check resource type
    if (!request.requiredResourceTypes.includes(resource.type)) {
      return false;
    }

    // Check skills match
    if (request.requiredSkills.length > 0 && resource.skills) {
      const skillMatch = request.requiredSkills.some(skill => 
        resource.skills!.some(resourceSkill => 
          resourceSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!skillMatch) return false;
    }

    // Check availability window
    if (resource.availability.availableFrom > request.endDate ||
        resource.availability.availableUntil < request.startDate) {
      return false;
    }

    // Check performance minimums
    if (resource.performance.reliabilityScore < 0.7 || 
        resource.performance.safetyRecord.safetyRating < 0.8) {
      return false;
    }

    return true;
  }

  private calculateSuitabilityScore(resource: Resource, request: AllocationRequest): number {
    let score = 0;

    // Performance factors (40% weight)
    score += resource.performance.efficiency * 15;
    score += resource.performance.qualityScore * 10;
    score += resource.performance.reliabilityScore * 10;
    score += resource.performance.safetyRecord.safetyRating * 5;

    // Skill match (25% weight)
    if (resource.skills && request.requiredSkills.length > 0) {
      const skillMatches = request.requiredSkills.filter(skill =>
        resource.skills!.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
      ).length;
      score += (skillMatches / request.requiredSkills.length) * 25;
    }

    // Availability (20% weight)
    const availabilityScore = resource.availability.isAvailable ? 20 : 0;
    const utilizationPenalty = resource.currentUtilization > 0.8 ? -5 : 0;
    score += availabilityScore + utilizationPenalty;

    // Experience (10% weight)
    const experienceScore = Math.min(resource.experience / 20, 1) * 10;
    score += experienceScore;

    // Location proximity (5% weight)
    const distance = this.calculateDistance(resource.location, request.location);
    const proximityScore = Math.max(0, 5 - (distance / 50)); // Penalty for distance > 50 miles
    score += proximityScore;

    return Math.round(score);
  }

  private calculateDistance(loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number {
    // Simplified distance calculation (Haversine formula approximation)
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(loc1.latitude)) * Math.cos(this.toRad(loc2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async generateRecommendations(
    request: AllocationRequest, 
    suitableResources: Resource[]
  ): Promise<AllocationRecommendation[]> {
    const recommendations: AllocationRecommendation[] = [];

    for (const resource of suitableResources.slice(0, 5)) { // Top 5 candidates
      const suitabilityScore = this.calculateSuitabilityScore(resource, request);
      const reasoning = this.generateReasoning(resource, request, suitabilityScore);
      const estimatedCost = this.calculateResourceCost(resource, request);
      const riskFactors = this.identifyRiskFactors(resource, request);
      const alternatives = this.findAlternatives(resource, suitableResources);
      const availability = this.checkDetailedAvailability(resource, request);

      recommendations.push({
        resourceId: resource.id,
        resource,
        suitabilityScore,
        reasoning,
        estimatedCost,
        riskFactors,
        alternatives,
        availability
      });
    }

    return recommendations;
  }

  private generateReasoning(resource: Resource, request: AllocationRequest, score: number): string[] {
    const reasons: string[] = [];

    if (resource.performance.efficiency > 0.9) {
      reasons.push('Excellent efficiency rating (>90%)');
    }

    if (resource.performance.safetyRecord.safetyRating > 0.95) {
      reasons.push('Outstanding safety record');
    }

    if (resource.experience > 10) {
      reasons.push(`Extensive experience (${resource.experience} years)`);
    }

    if (resource.performance.customerRating && resource.performance.customerRating > 4.5) {
      reasons.push(`High customer satisfaction (${resource.performance.customerRating}/5)`);
    }

    if (resource.currentUtilization < 0.7) {
      reasons.push('Good availability with low current utilization');
    }

    if (request.requiredSkills.length > 0 && resource.skills) {
      const matchingSkills = request.requiredSkills.filter(skill =>
        resource.skills!.some(rs => rs.toLowerCase().includes(skill.toLowerCase()))
      );
      if (matchingSkills.length > 0) {
        reasons.push(`Matches required skills: ${matchingSkills.join(', ')}`);
      }
    }

    return reasons;
  }

  private calculateResourceCost(resource: Resource, request: AllocationRequest): number {
    let baseCost = 0;

    if (resource.hourlyRate) {
      baseCost = resource.hourlyRate * request.estimatedHours;
    } else if (resource.dailyRate) {
      const days = Math.ceil(request.estimatedHours / 8);
      baseCost = resource.dailyRate * days;
    }

    // Add complexity multiplier
    const complexityMultiplier = {
      'simple': 1.0,
      'medium': 1.15,
      'complex': 1.3,
      'expert': 1.5
    };

    baseCost *= complexityMultiplier[request.complexity];

    // Add location adjustment for distance
    const distance = this.calculateDistance(resource.location, request.location);
    if (distance > 25) {
      baseCost += distance * 2; // $2 per mile for travel
    }

    return Math.round(baseCost);
  }

  private identifyRiskFactors(resource: Resource, request: AllocationRequest): string[] {
    const risks: string[] = [];

    if (resource.currentUtilization > 0.85) {
      risks.push('High utilization may affect availability');
    }

    if (resource.performance.reliabilityScore < 0.85) {
      risks.push('Below-average reliability rating');
    }

    if (resource.availability.maintenanceSchedule.length > 0) {
      risks.push('Scheduled maintenance may cause delays');
    }

    const distance = this.calculateDistance(resource.location, request.location);
    if (distance > 50) {
      risks.push('Significant travel distance may impact costs');
    }

    if (request.priority === 'critical' && resource.performance.onTimeDelivery < 0.9) {
      risks.push('On-time delivery rate below 90% for critical task');
    }

    return risks;
  }

  private findAlternatives(
    resource: Resource, 
    allSuitable: Resource[]
  ): Array<{ resourceId: string; score: number; reason: string }> {
    return allSuitable
      .filter(r => r.id !== resource.id && r.type === resource.type)
      .slice(0, 3)
      .map(alt => ({
        resourceId: alt.id,
        score: alt.performance.efficiency * 100,
        reason: this.getAlternativeReason(resource, alt)
      }));
  }

  private getAlternativeReason(primary: Resource, alternative: Resource): string {
    if (alternative.performance.efficiency > primary.performance.efficiency) {
      return 'Higher efficiency rating';
    }
    if (alternative.currentUtilization < primary.currentUtilization) {
      return 'Better availability';
    }
    if ((alternative.hourlyRate || 0) < (primary.hourlyRate || 0)) {
      return 'Lower cost option';
    }
    return 'Similar capability with different strengths';
  }

  private checkDetailedAvailability(resource: Resource, request: AllocationRequest): { canStartImmediately: boolean; earliestStart: Date; conflictingTasks: string[] } {
    const canStartImmediately = resource.availability.isAvailable && 
                               resource.availability.availableFrom <= request.startDate;
    
    const earliestStart = canStartImmediately ? 
                         request.startDate : 
                         resource.availability.availableFrom;

    const conflictingTasks = resource.availability.scheduledTasks.filter(taskId => {
      // This would typically check against actual task schedules
      return Math.random() < 0.3; // Simulate 30% chance of conflict
    });

    return {
      canStartImmediately,
      earliestStart,
      conflictingTasks
    };
  }

  private calculateTotalCost(recommendations: AllocationRecommendation[]): number {
    return recommendations.reduce((total, rec) => total + rec.estimatedCost, 0);
  }

  private calculateTotalRisk(recommendations: AllocationRecommendation[]): number {
    const riskScore = recommendations.reduce((total, rec) => {
      const resourceRisk = rec.riskFactors.length * 10;
      const performanceRisk = (1 - rec.resource.performance.reliabilityScore) * 50;
      return total + resourceRisk + performanceRisk;
    }, 0);

    return Math.min(Math.round(riskScore / recommendations.length), 100);
  }

  private calculateCompletionProbability(recommendations: AllocationRecommendation[]): number {
    const avgReliability = recommendations.reduce((sum, rec) => 
      sum + rec.resource.performance.reliabilityScore, 0) / recommendations.length;
    
    const avgEfficiency = recommendations.reduce((sum, rec) => 
      sum + rec.resource.performance.efficiency, 0) / recommendations.length;

    return Math.round((avgReliability * 0.6 + avgEfficiency * 0.4) * 100);
  }

  private async generateAlternativeStrategies(
    request: AllocationRequest, 
    resources: Resource[]
  ): Promise<AllocationStrategy[]> {
    const strategies: AllocationStrategy[] = [];

    // Strategy 1: High Quality, Higher Cost
    const premiumResources = resources.filter(r => 
      r.performance.qualityScore > 0.9 && r.performance.efficiency > 0.85
    );
    if (premiumResources.length > 0) {
      strategies.push({
        name: 'Premium Quality',
        description: 'Use top-tier resources for maximum quality and reliability',
        resources: premiumResources.slice(0, 2).map(r => r.id),
        totalCost: premiumResources.slice(0, 2).reduce((sum, r) => 
          sum + this.calculateResourceCost(r, request), 0),
        duration: request.estimatedHours * 0.85, // 15% faster
        riskLevel: 'low',
        advantages: ['Higher quality', 'Faster completion', 'Lower risk'],
        disadvantages: ['Higher cost', 'May be overqualified']
      });
    }

    // Strategy 2: Cost-Effective
    const economicalResources = resources.filter(r => 
      (r.hourlyRate || r.dailyRate || 0) < 60 && r.performance.reliabilityScore > 0.8
    );
    if (economicalResources.length > 0) {
      strategies.push({
        name: 'Cost-Effective',
        description: 'Balance cost and quality with reliable, affordable resources',
        resources: economicalResources.slice(0, 2).map(r => r.id),
        totalCost: economicalResources.slice(0, 2).reduce((sum, r) => 
          sum + this.calculateResourceCost(r, request), 0),
        duration: request.estimatedHours * 1.1, // 10% longer
        riskLevel: 'medium',
        advantages: ['Lower cost', 'Good value', 'Adequate quality'],
        disadvantages: ['Longer duration', 'Moderate risk']
      });
    }

    return strategies;
  }

  private calculateCostBreakdown(recommendations: AllocationRecommendation[]): { labor: number; equipment: number; materials: number; subcontractors: number } {
    const breakdown = { labor: 0, equipment: 0, materials: 0, subcontractors: 0 };

    recommendations.forEach(rec => {
      switch (rec.resource.type) {
        case 'labor':
          breakdown.labor += rec.estimatedCost;
          break;
        case 'equipment':
          breakdown.equipment += rec.estimatedCost;
          break;
        case 'material':
          breakdown.materials += rec.estimatedCost;
          break;
        case 'subcontractor':
          breakdown.subcontractors += rec.estimatedCost;
          break;
      }
    });

    return breakdown;
  }

  private assessTimelineImpact(request: AllocationRequest, recommendations: AllocationRecommendation[]): { estimatedDuration: number; criticalPath: boolean; bufferTime: number } {
    const avgEfficiency = recommendations.reduce((sum, rec) => 
      sum + rec.resource.performance.efficiency, 0) / recommendations.length;

    const estimatedDuration = request.estimatedHours / avgEfficiency;
    const bufferTime = estimatedDuration * 0.15; // 15% buffer

    return {
      estimatedDuration: Math.round(estimatedDuration),
      criticalPath: request.priority === 'critical',
      bufferTime: Math.round(bufferTime)
    };
  }

  private storeOptimizationHistory(projectId: string, optimization: AllocationOptimization): void {
    const history = this.allocationHistory.get(projectId) || [];
    history.push(optimization);
    
    if (history.length > 20) {
      history.shift();
    }
    
    this.allocationHistory.set(projectId, history);
  }

  async detectResourceConflicts(projectId: string): Promise<ResourceConflict[]> {
    const conflicts: ResourceConflict[] = [];
    
    // This would typically check against actual project schedules
    // For now, simulate some conflicts
    for (const resource of this.resources.values()) {
      if (resource.currentUtilization > 0.9) {
        conflicts.push({
          resourceId: resource.id,
          conflictingTasks: [
            {
              taskId: 'task-001',
              taskName: 'Foundation Work',
              priority: 'high',
              projectId: 'proj-001'
            },
            {
              taskId: 'task-002',
              taskName: 'Steel Installation',
              priority: 'critical',
              projectId: 'proj-002'
            }
          ],
          severity: resource.currentUtilization > 0.95 ? 'critical' : 'major',
          resolutionOptions: [
            {
              type: 'reschedule',
              description: 'Reschedule one task to avoid overlap',
              impact: '2-3 day delay for lower priority task',
              cost: 5000,
              timeDelay: 2.5,
              riskIncrease: 0.1
            },
            {
              type: 'substitute',
              description: 'Find alternative resource for one task',
              impact: 'Potential quality variation',
              cost: 8000,
              timeDelay: 0,
              riskIncrease: 0.15
            }
          ]
        });
      }
    }

    return conflicts;
  }

  async updateResourcePerformance(resourceId: string, performance: Partial<ResourcePerformance>): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (resource) {
      resource.performance = { ...resource.performance, ...performance };
      this.resources.set(resourceId, resource);
    }
  }

  async getAllResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResourceById(resourceId: string): Promise<Resource | undefined> {
    return this.resources.get(resourceId);
  }

  async getAllocationHistory(projectId: string): Promise<AllocationOptimization[]> {
    return this.allocationHistory.get(projectId) || [];
  }
}

export const resourceAllocationService = new ResourceAllocationService();