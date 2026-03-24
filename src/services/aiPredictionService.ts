export interface ProjectPrediction {
  projectId: string;
  riskScore: number; // 0-100
  delayProbability: number;
  costOverrunProbability: number;
  qualityRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedCompletionDate: Date;
  predictedFinalCost: number;
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  confidenceLevel: number;
  lastUpdated: Date;
}

export interface RiskFactor {
  type: 'weather' | 'supply_chain' | 'labor' | 'regulatory' | 'technical' | 'financial';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  probability: number;
  mitigation?: string;
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'schedule' | 'budget' | 'resources' | 'quality' | 'safety';
  action: string;
  expectedImpact: string;
  estimatedCost?: number;
  timeToImplement?: number;
}

export interface PredictionModel {
  modelId: string;
  version: string;
  accuracy: number;
  trainingData: {
    projectCount: number;
    lastTrained: Date;
  };
}

class AIPredictionService {
  private models: Map<string, PredictionModel> = new Map();
  private predictionCache: Map<string, ProjectPrediction> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Initialize AI prediction models
    this.models.set('delay_prediction', {
      modelId: 'delay_prediction_v2',
      version: '2.1.0',
      accuracy: 0.87,
      trainingData: {
        projectCount: 15000,
        lastTrained: new Date('2024-01-15')
      }
    });

    this.models.set('cost_prediction', {
      modelId: 'cost_overrun_v2',
      version: '2.0.5',
      accuracy: 0.82,
      trainingData: {
        projectCount: 12000,
        lastTrained: new Date('2024-01-10')
      }
    });

    this.models.set('quality_prediction', {
      modelId: 'quality_risk_v1',
      version: '1.3.2',
      accuracy: 0.79,
      trainingData: {
        projectCount: 8000,
        lastTrained: new Date('2024-01-05')
      }
    });
  }

  async generateProjectPrediction(projectId: string, projectData: Record<string, unknown>): Promise<ProjectPrediction> {
    try {
      // Check cache first
      const cached = this.predictionCache.get(projectId);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Extract features for prediction
      const features = this.extractProjectFeatures(projectData);
      
      // Run AI models
      const delayPrediction = await this.predictDelayRisk(features);
      const costPrediction = await this.predictCostRisk(features);
      const qualityPrediction = await this.predictQualityRisk(features);

      // Generate risk factors
      const riskFactors = this.generateRiskFactors(features, delayPrediction, costPrediction);

      // Generate recommendations
      const recommendations = this.generateRecommendations(riskFactors, features);

      // Calculate overall risk score
      const riskScore = this.calculateOverallRisk(delayPrediction, costPrediction, qualityPrediction);

      const prediction: ProjectPrediction = {
        projectId,
        riskScore,
        delayProbability: delayPrediction.probability,
        costOverrunProbability: costPrediction.probability,
        qualityRiskLevel: qualityPrediction.level,
        predictedCompletionDate: delayPrediction.predictedDate,
        predictedFinalCost: costPrediction.predictedCost,
        riskFactors,
        recommendations,
        confidenceLevel: Math.min(delayPrediction.confidence, costPrediction.confidence),
        lastUpdated: new Date()
      };

      // Cache the prediction
      this.predictionCache.set(projectId, prediction);

      return prediction;
    } catch (error) {
      console.error('Error generating project prediction:', error);
      throw new Error('Failed to generate project prediction');
    }
  }

  private extractProjectFeatures(projectData: Record<string, unknown>): Record<string, unknown> {
    return {
      budget: projectData.budget,
      timeline: projectData.timeline,
      complexity: projectData.complexity || 'medium',
      teamSize: projectData.teamSize || 10,
      weather: this.getWeatherRisk(projectData.location),
      supplyChain: this.getSupplyChainRisk(projectData.materials),
      contractorExperience: projectData.contractorRating || 4.0,
      seasonality: this.getSeasonalityFactor(projectData.startDate),
      economicFactors: this.getEconomicFactors(),
      regulatoryComplexity: projectData.permits?.length || 0
    };
  }

  private async predictDelayRisk(features: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Simulate AI model prediction
    const baseDelayProb = 0.3;
    let adjustedProb = baseDelayProb;

    // Weather impact
    if (features.weather > 0.7) adjustedProb += 0.2;
    
    // Supply chain impact
    if (features.supplyChain > 0.6) adjustedProb += 0.15;
    
    // Team experience impact
    if (features.contractorExperience < 3.5) adjustedProb += 0.1;

    // Regulatory complexity
    if (features.regulatoryComplexity > 5) adjustedProb += 0.1;

    adjustedProb = Math.min(adjustedProb, 0.95);

    const originalDate = new Date(features.timeline.endDate);
    const delayDays = Math.round(adjustedProb * 30); // Max 30 days delay
    const predictedDate = new Date(originalDate.getTime() + delayDays * 24 * 60 * 60 * 1000);

    return {
      probability: adjustedProb,
      predictedDate,
      confidence: 0.85
    };
  }

  private async predictCostRisk(features: Record<string, unknown>): Promise<Record<string, unknown>> {
    const baseCostOverrun = 0.25;
    let adjustedProb = baseCostOverrun;

    // Budget size impact
    const budgetMM = features.budget / 1000000;
    if (budgetMM > 10) adjustedProb += 0.1;
    
    // Complexity impact
    if (features.complexity === 'high') adjustedProb += 0.15;
    
    // Supply chain volatility
    if (features.supplyChain > 0.6) adjustedProb += 0.2;

    adjustedProb = Math.min(adjustedProb, 0.9);

    const overrunPercentage = adjustedProb * 0.3; // Max 30% overrun
    const predictedCost = features.budget * (1 + overrunPercentage);

    return {
      probability: adjustedProb,
      predictedCost,
      confidence: 0.80
    };
  }

  private async predictQualityRisk(features: Record<string, unknown>): Promise<Record<string, unknown>> {
    let riskScore = 0;

    if (features.contractorExperience < 3.0) riskScore += 30;
    if (features.teamSize < 5) riskScore += 20;
    if (features.complexity === 'high') riskScore += 25;
    if (features.timeline.duration < 90) riskScore += 15; // Rushed projects

    let level: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 20) level = 'low';
    else if (riskScore < 40) level = 'medium';
    else if (riskScore < 70) level = 'high';
    else level = 'critical';

    return { level, confidence: 0.75 };
  }

  private generateRiskFactors(features: Record<string, unknown>, delayPred: Record<string, unknown>, costPred: Record<string, unknown>): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (features.weather > 0.6) {
      factors.push({
        type: 'weather',
        severity: features.weather > 0.8 ? 'high' : 'medium',
        impact: 'Adverse weather conditions may delay outdoor work',
        probability: features.weather,
        mitigation: 'Consider weather-protected work areas or adjusted scheduling'
      });
    }

    if (features.supplyChain > 0.5) {
      factors.push({
        type: 'supply_chain',
        severity: features.supplyChain > 0.7 ? 'high' : 'medium',
        impact: 'Material delivery delays and price volatility',
        probability: features.supplyChain,
        mitigation: 'Diversify suppliers and maintain buffer inventory'
      });
    }

    if (features.contractorExperience < 3.5) {
      factors.push({
        type: 'labor',
        severity: features.contractorExperience < 2.5 ? 'high' : 'medium',
        impact: 'Inexperienced team may lead to quality issues and delays',
        probability: 0.6,
        mitigation: 'Increase supervision and provide additional training'
      });
    }

    return factors;
  }

  private generateRecommendations(riskFactors: RiskFactor[], features: Record<string, unknown>): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // High-impact recommendations based on risk factors
    const highRiskFactors = riskFactors.filter(f => f.severity === 'high' || f.severity === 'critical');

    if (highRiskFactors.some(f => f.type === 'weather')) {
      recommendations.push({
        priority: 'high',
        category: 'schedule',
        action: 'Implement weather contingency plans',
        expectedImpact: 'Reduce weather-related delays by 40%',
        estimatedCost: 15000,
        timeToImplement: 7
      });
    }

    if (highRiskFactors.some(f => f.type === 'supply_chain')) {
      recommendations.push({
        priority: 'high',
        category: 'resources',
        action: 'Secure alternative suppliers for critical materials',
        expectedImpact: 'Reduce supply chain risk by 50%',
        estimatedCost: 25000,
        timeToImplement: 14
      });
    }

    if (features.contractorExperience < 3.0) {
      recommendations.push({
        priority: 'medium',
        category: 'quality',
        action: 'Implement additional quality control checkpoints',
        expectedImpact: 'Improve quality scores by 30%',
        estimatedCost: 10000,
        timeToImplement: 3
      });
    }

    return recommendations;
  }

  private calculateOverallRisk(delayPred: Record<string, unknown>, costPred: Record<string, unknown>, qualityPred: Record<string, unknown>): number {
    const delayWeight = 0.4;
    const costWeight = 0.4;
    const qualityWeight = 0.2;

    const qualityRiskScore = {
      'low': 0.2,
      'medium': 0.4,
      'high': 0.7,
      'critical': 0.9
    }[qualityPred.level];

    return Math.round((delayPred.probability * delayWeight + 
                     costPred.probability * costWeight + 
                     qualityRiskScore * qualityWeight) * 100);
  }

  private getWeatherRisk(location: string): number {
    // Simulate weather risk calculation
    const seasonalRisk = Math.random() * 0.5 + 0.2; // 0.2-0.7
    return seasonalRisk;
  }

  private getSupplyChainRisk(materials: any[]): number {
    // Simulate supply chain risk
    return Math.random() * 0.6 + 0.3; // 0.3-0.9
  }

  private getSeasonalityFactor(startDate: Date): number {
    const month = startDate.getMonth();
    // Winter months have higher risk
    return [1, 3, 11, 0].includes(month) ? 0.8 : 0.4;
  }

  private getEconomicFactors(): Record<string, number> {
    return {
      inflation: 0.03,
      interestRates: 0.055,
      materialPriceVolatility: 0.15
    };
  }

  private isCacheValid(prediction: ProjectPrediction): boolean {
    const cacheAge = Date.now() - prediction.lastUpdated.getTime();
    const maxCacheAge = 4 * 60 * 60 * 1000; // 4 hours
    return cacheAge < maxCacheAge;
  }

  async batchPredictions(projectIds: string[]): Promise<Map<string, ProjectPrediction>> {
    const predictions = new Map<string, ProjectPrediction>();
    
    const promises = projectIds.map(async (projectId) => {
      try {
        // This would typically fetch project data from your API
        const projectData = await this.fetchProjectData(projectId);
        const prediction = await this.generateProjectPrediction(projectId, projectData);
        predictions.set(projectId, prediction);
      } catch (error) {
        console.error(`Failed to generate prediction for project ${projectId}:`, error);
      }
    });

    await Promise.all(promises);
    return predictions;
  }

  private async fetchProjectData(projectId: string): Promise<Record<string, unknown>> {
    // Placeholder - integrate with your existing project data service
    return {
      budget: 500000,
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        duration: 120
      },
      complexity: 'medium',
      teamSize: 8,
      location: 'California',
      materials: ['concrete', 'steel', 'lumber'],
      permits: ['building', 'electrical', 'plumbing'],
      contractorRating: 4.2
    };
  }

  getModelInfo(): Map<string, PredictionModel> {
    return this.models;
  }

  clearCache(): void {
    this.predictionCache.clear();
  }
}

export const aiPredictionService = new AIPredictionService();