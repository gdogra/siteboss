import axios from 'axios';

export interface AIAnalysisResult {
  confidence: number;
  insights: string[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface RiskAssessment {
  id: string;
  projectId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  overallScore: number;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskFactor {
  category: 'weather' | 'supply' | 'permit' | 'financial' | 'labor' | 'safety';
  description: string;
  impact: number; // 1-10
  probability: number; // 0-1
  mitigationStrategy?: string;
}

export interface CostEstimation {
  projectType: string;
  location: string;
  squareFootage: number;
  materials: MaterialCost[];
  labor: LaborCost[];
  overhead: number;
  profit: number;
  totalEstimate: number;
  confidence: number;
}

export interface MaterialCost {
  category: string;
  item: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  availability?: 'in-stock' | 'limited' | 'out-of-stock';
}

export interface LaborCost {
  role: string;
  hours: number;
  rate: number;
  totalCost: number;
}

export interface ProgressAnalysis {
  imageUrl: string;
  detectedFeatures: string[];
  completionPercentage: number;
  qualityIssues: QualityIssue[];
  safetyViolations: SafetyViolation[];
  timestamp: Date;
}

export interface QualityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  suggestedAction: string;
}

export interface SafetyViolation {
  type: string;
  severity: 'warning' | 'violation' | 'critical';
  description: string;
  regulation: string;
  requiredAction: string;
}

export interface WeatherImpact {
  date: Date;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  conditions: string;
  workabilityScore: number; // 0-10
  affectedTasks: string[];
  recommendations: string[];
}

export interface ScheduleOptimization {
  projectId: string;
  optimizedTasks: OptimizedTask[];
  resourceAllocation: ResourceAllocation[];
  weatherConsiderations: WeatherImpact[];
  estimatedCompletion: Date;
  efficiency: number;
}

export interface OptimizedTask {
  taskId: string;
  originalStart: Date;
  optimizedStart: Date;
  duration: number;
  assignedCrew: string[];
  dependencies: string[];
  priority: number;
}

export interface ResourceAllocation {
  resourceId: string;
  resourceType: 'crew' | 'equipment' | 'material';
  allocation: number; // percentage
  conflictScore: number;
}

class AIService {
  private baseURL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

  // Project Risk Assessment
  async analyzeProjectRisk(projectData: any): Promise<RiskAssessment> {
    try {
      // In production, this would call actual AI service
      // For now, we'll simulate intelligent risk analysis
      const response = await this.simulateRiskAnalysis(projectData);
      return response;
    } catch (error) {
      console.error('Risk analysis failed:', error);
      throw error;
    }
  }

  // Automated Cost Estimation
  async generateCostEstimate(projectSpecs: any): Promise<CostEstimation> {
    try {
      const response = await this.simulateCostEstimation(projectSpecs);
      return response;
    } catch (error) {
      console.error('Cost estimation failed:', error);
      throw error;
    }
  }

  // Photo Analysis for Progress Tracking
  async analyzeProgressPhoto(imageFile: File, projectContext: any): Promise<ProgressAnalysis> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('context', JSON.stringify(projectContext));

      // Simulate AI image analysis
      const analysis = await this.simulatePhotoAnalysis(imageFile, projectContext);
      return analysis;
    } catch (error) {
      console.error('Photo analysis failed:', error);
      throw error;
    }
  }

  // Weather Impact Analysis
  async analyzeWeatherImpact(location: string, dateRange: { start: Date; end: Date }): Promise<WeatherImpact[]> {
    try {
      const weatherData = await this.getWeatherForecast(location, dateRange);
      const impacts = await this.analyzeWeatherForConstruction(weatherData);
      return impacts;
    } catch (error) {
      console.error('Weather analysis failed:', error);
      throw error;
    }
  }

  // Schedule Optimization
  async optimizeSchedule(projectId: string, constraints: any): Promise<ScheduleOptimization> {
    try {
      const optimization = await this.simulateScheduleOptimization(projectId, constraints);
      return optimization;
    } catch (error) {
      console.error('Schedule optimization failed:', error);
      throw error;
    }
  }

  // Material Demand Prediction
  async predictMaterialNeeds(projectData: any, timeline: any): Promise<MaterialCost[]> {
    try {
      const predictions = await this.simulateMaterialPrediction(projectData, timeline);
      return predictions;
    } catch (error) {
      console.error('Material prediction failed:', error);
      throw error;
    }
  }

  // Safety Compliance Analysis
  async analyzeSafetyCompliance(siteData: any): Promise<SafetyViolation[]> {
    try {
      const violations = await this.simulateSafetyAnalysis(siteData);
      return violations;
    } catch (error) {
      console.error('Safety analysis failed:', error);
      throw error;
    }
  }

  // Simulation methods (to be replaced with actual AI service calls)
  private async simulateRiskAnalysis(projectData: any): Promise<RiskAssessment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const riskFactors: RiskFactor[] = [
          {
            category: 'weather',
            description: 'Upcoming storm system may delay outdoor work',
            impact: 7,
            probability: 0.6,
            mitigationStrategy: 'Schedule indoor tasks during storm period'
          },
          {
            category: 'supply',
            description: 'Steel prices trending upward, potential delays',
            impact: 5,
            probability: 0.3,
            mitigationStrategy: 'Lock in steel orders early'
          },
          {
            category: 'permit',
            description: 'Electrical permit approval pending',
            impact: 8,
            probability: 0.4,
            mitigationStrategy: 'Follow up with permit office daily'
          }
        ];

        const overallScore = riskFactors.reduce((acc, factor) => 
          acc + (factor.impact * factor.probability), 0) / riskFactors.length;

        resolve({
          id: Date.now().toString(),
          projectId: projectData.id,
          riskLevel: overallScore > 6 ? 'high' : overallScore > 4 ? 'medium' : 'low',
          factors: riskFactors,
          overallScore,
          recommendations: [
            'Consider accelerating permit approval process',
            'Prepare contingency plans for weather delays',
            'Secure material commitments to avoid price increases'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }, 1000);
    });
  }

  private async simulateCostEstimation(projectSpecs: any): Promise<CostEstimation> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const materials: MaterialCost[] = [
          {
            category: 'Structural',
            item: 'Steel Beams',
            quantity: 50,
            unitCost: 850,
            totalCost: 42500,
            supplier: 'Metro Steel Supply',
            availability: 'in-stock'
          },
          {
            category: 'Concrete',
            item: 'Ready Mix Concrete',
            quantity: 200,
            unitCost: 120,
            totalCost: 24000,
            supplier: 'City Concrete',
            availability: 'in-stock'
          }
        ];

        const labor: LaborCost[] = [
          {
            role: 'General Contractor',
            hours: 320,
            rate: 75,
            totalCost: 24000
          },
          {
            role: 'Electrician',
            hours: 120,
            rate: 85,
            totalCost: 10200
          }
        ];

        const materialTotal = materials.reduce((sum, m) => sum + m.totalCost, 0);
        const laborTotal = labor.reduce((sum, l) => sum + l.totalCost, 0);
        const overhead = (materialTotal + laborTotal) * 0.15;
        const profit = (materialTotal + laborTotal + overhead) * 0.12;

        resolve({
          projectType: projectSpecs.type,
          location: projectSpecs.location,
          squareFootage: projectSpecs.squareFootage,
          materials,
          labor,
          overhead,
          profit,
          totalEstimate: materialTotal + laborTotal + overhead + profit,
          confidence: 0.85
        });
      }, 1500);
    });
  }

  private async simulatePhotoAnalysis(imageFile: File, projectContext: any): Promise<ProgressAnalysis> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          imageUrl: URL.createObjectURL(imageFile),
          detectedFeatures: [
            'Foundation walls completed',
            'Rebar installation in progress',
            'Safety barriers in place',
            'Construction equipment visible'
          ],
          completionPercentage: 35,
          qualityIssues: [
            {
              type: 'Surface Finish',
              severity: 'low',
              description: 'Minor surface imperfections on north wall',
              location: 'North foundation wall, 15ft from east corner',
              suggestedAction: 'Apply additional concrete sealer'
            }
          ],
          safetyViolations: [
            {
              type: 'PPE Compliance',
              severity: 'warning',
              description: 'Worker without hard hat detected',
              regulation: 'OSHA 29 CFR 1926.95',
              requiredAction: 'Ensure all workers wear required PPE'
            }
          ],
          timestamp: new Date()
        });
      }, 2000);
    });
  }

  private async getWeatherForecast(location: string, dateRange: { start: Date; end: Date }): Promise<any> {
    // Simulate weather API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          location,
          forecast: [
            { date: dateRange.start, temp: 72, precipitation: 0, wind: 5, conditions: 'sunny' },
            { date: new Date(dateRange.start.getTime() + 86400000), temp: 68, precipitation: 0.3, wind: 12, conditions: 'partly cloudy' }
          ]
        });
      }, 500);
    });
  }

  private async analyzeWeatherForConstruction(weatherData: any): Promise<WeatherImpact[]> {
    return weatherData.forecast.map((day: any) => ({
      date: day.date,
      temperature: day.temp,
      precipitation: day.precipitation,
      windSpeed: day.wind,
      conditions: day.conditions,
      workabilityScore: this.calculateWorkabilityScore(day),
      affectedTasks: this.getAffectedTasks(day),
      recommendations: this.getWeatherRecommendations(day)
    }));
  }

  private calculateWorkabilityScore(weather: any): number {
    let score = 10;
    
    if (weather.precipitation > 0.1) score -= 3;
    if (weather.precipitation > 0.5) score -= 3;
    if (weather.windSpeed > 20) score -= 2;
    if (weather.temp < 40 || weather.temp > 95) score -= 2;
    
    return Math.max(0, score);
  }

  private getAffectedTasks(weather: any): string[] {
    const tasks = [];
    
    if (weather.precipitation > 0.1) {
      tasks.push('Concrete pouring', 'Exterior painting', 'Roofing');
    }
    if (weather.windSpeed > 15) {
      tasks.push('Crane operations', 'High-altitude work');
    }
    if (weather.temp < 40) {
      tasks.push('Concrete work', 'Mortar application');
    }
    
    return tasks;
  }

  private getWeatherRecommendations(weather: any): string[] {
    const recommendations = [];
    
    if (weather.precipitation > 0.1) {
      recommendations.push('Schedule indoor work', 'Protect materials from moisture');
    }
    if (weather.windSpeed > 15) {
      recommendations.push('Avoid crane operations', 'Secure loose materials');
    }
    if (weather.temp < 40) {
      recommendations.push('Use cold weather concrete additives', 'Provide heated enclosures');
    }
    
    return recommendations;
  }

  private async simulateScheduleOptimization(projectId: string, constraints: any): Promise<ScheduleOptimization> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          projectId,
          optimizedTasks: [
            {
              taskId: 'task-1',
              originalStart: new Date('2024-01-15'),
              optimizedStart: new Date('2024-01-16'),
              duration: 5,
              assignedCrew: ['crew-a', 'crew-b'],
              dependencies: [],
              priority: 1
            }
          ],
          resourceAllocation: [
            {
              resourceId: 'crew-a',
              resourceType: 'crew',
              allocation: 0.8,
              conflictScore: 0.2
            }
          ],
          weatherConsiderations: [],
          estimatedCompletion: new Date('2024-03-15'),
          efficiency: 0.92
        });
      }, 1500);
    });
  }

  private async simulateMaterialPrediction(projectData: any, timeline: any): Promise<MaterialCost[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            category: 'Concrete',
            item: 'Ready Mix Concrete',
            quantity: 150,
            unitCost: 125,
            totalCost: 18750,
            supplier: 'City Concrete',
            availability: 'in-stock'
          },
          {
            category: 'Steel',
            item: 'Rebar #4',
            quantity: 500,
            unitCost: 45,
            totalCost: 22500,
            supplier: 'Metro Steel',
            availability: 'limited'
          }
        ]);
      }, 1000);
    });
  }

  private async simulateSafetyAnalysis(siteData: any): Promise<SafetyViolation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            type: 'Fall Protection',
            severity: 'critical',
            description: 'Missing guardrails on elevated platform',
            regulation: 'OSHA 29 CFR 1926.501',
            requiredAction: 'Install guardrails immediately before work continues'
          },
          {
            type: 'Electrical Safety',
            severity: 'violation',
            description: 'Exposed wiring in work area',
            regulation: 'OSHA 29 CFR 1926.416',
            requiredAction: 'Cover or relocate exposed electrical connections'
          }
        ]);
      }, 800);
    });
  }
}

export const aiService = new AIService();