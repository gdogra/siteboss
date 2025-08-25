import pool from '../database/connection';
import { ProjectPrediction, RiskAssessment, WeatherData } from '../types/enhanced';

export class AIAnalyticsService {
  // Project Delay Prediction Algorithm
  static async predictProjectDelay(projectId: string): Promise<ProjectPrediction> {
    const query = `
      SELECT 
        p.*,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 END) as overdue_tasks,
        AVG(CASE WHEN t.status = 'completed' THEN 
          EXTRACT(DAY FROM t.updated_at - t.start_date) 
        END) as avg_task_duration,
        COALESCE(SUM(e.amount), 0) as spent_amount
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN expenses e ON p.id = e.project_id AND e.is_approved = true
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await pool.query(query, [projectId]);
    const projectData = result.rows[0];

    if (!projectData) {
      throw new Error('Project not found');
    }

    // Simple ML-like algorithm for delay prediction
    const completionRate = projectData.completed_tasks / projectData.total_tasks;
    const overdueRate = projectData.overdue_tasks / projectData.total_tasks;
    const budgetUtilization = projectData.spent_amount / (projectData.total_budget || 1);
    
    // Risk factors
    const riskFactors = {
      low_completion_rate: completionRate < 0.3 ? 0.4 : 0,
      high_overdue_rate: overdueRate > 0.2 ? 0.3 : 0,
      budget_overrun: budgetUtilization > 0.8 ? 0.2 : 0,
      weather_risk: await this.getWeatherRiskFactor(projectId),
      resource_constraints: await this.getResourceConstraintFactor(projectId)
    };

    const totalRiskScore = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0);
    const delayProbability = Math.min(totalRiskScore * 100, 95);
    
    // Predicted delay in days
    const baselineDelay = projectData.avg_task_duration * overdueRate;
    const predictedDelay = baselineDelay * (1 + totalRiskScore);

    const prediction: ProjectPrediction = {
      id: '',
      project_id: projectId,
      prediction_type: 'delay',
      predicted_value: predictedDelay,
      predicted_date: null,
      confidence_score: 100 - delayProbability,
      factors: riskFactors,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save prediction to database
    await this.savePrediction(prediction);
    
    return prediction;
  }

  // Cost Overrun Prediction
  static async predictCostOverrun(projectId: string): Promise<ProjectPrediction> {
    const query = `
      SELECT 
        p.*,
        COALESCE(SUM(e.amount), 0) as current_spent,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::float / NULLIF(COUNT(t.id), 0) as completion_percentage,
        AVG(CASE WHEN bc.budgeted_amount > 0 THEN 
          COALESCE(SUM(e2.amount), 0) / bc.budgeted_amount 
        END) as avg_category_utilization
      FROM projects p
      LEFT JOIN expenses e ON p.id = e.project_id AND e.is_approved = true
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN budget_categories bc ON p.id = bc.project_id
      LEFT JOIN expenses e2 ON bc.id = e2.budget_category_id AND e2.is_approved = true
      WHERE p.id = $1
      GROUP BY p.id
    `;

    const result = await pool.query(query, [projectId]);
    const projectData = result.rows[0];

    if (!projectData) {
      throw new Error('Project not found');
    }

    const currentBudgetUtilization = projectData.current_spent / (projectData.total_budget || 1);
    const projectedSpend = projectData.current_spent / (projectData.completion_percentage || 0.01);
    const predictedOverrun = Math.max(0, projectedSpend - projectData.total_budget);
    
    const riskFactors = {
      current_utilization: currentBudgetUtilization > 0.7 ? 0.3 : 0,
      burn_rate: projectedSpend > projectData.total_budget ? 0.4 : 0,
      category_overruns: projectData.avg_category_utilization > 1.0 ? 0.2 : 0,
      change_orders: await this.getChangeOrderFactor(projectId)
    };

    const confidenceScore = Math.max(20, 90 - (Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) * 100));

    const prediction: ProjectPrediction = {
      id: '',
      project_id: projectId,
      prediction_type: 'cost_overrun',
      predicted_value: predictedOverrun,
      predicted_date: null,
      confidence_score: confidenceScore,
      factors: riskFactors,
      created_at: new Date(),
      updated_at: new Date()
    };

    await this.savePrediction(prediction);
    return prediction;
  }

  // Risk Assessment Generation
  static async generateRiskAssessment(projectId: string): Promise<RiskAssessment[]> {
    const risks: RiskAssessment[] = [];

    // Weather Risk Assessment
    const weatherRisk = await this.assessWeatherRisk(projectId);
    if (weatherRisk) risks.push(weatherRisk);

    // Budget Risk Assessment
    const budgetRisk = await this.assessBudgetRisk(projectId);
    if (budgetRisk) risks.push(budgetRisk);

    // Schedule Risk Assessment
    const scheduleRisk = await this.assessScheduleRisk(projectId);
    if (scheduleRisk) risks.push(scheduleRisk);

    // Resource Risk Assessment
    const resourceRisk = await this.assessResourceRisk(projectId);
    if (resourceRisk) risks.push(resourceRisk);

    // Save risks to database
    for (const risk of risks) {
      await this.saveRiskAssessment(risk);
    }

    return risks;
  }

  // Weather Integration
  static async updateWeatherData(jobSiteId: string, weatherApiData: any): Promise<void> {
    const weatherData: WeatherData = {
      id: '',
      job_site_id: jobSiteId,
      date: new Date(weatherApiData.date),
      temperature_high: weatherApiData.temp_high,
      temperature_low: weatherApiData.temp_low,
      precipitation_chance: weatherApiData.precipitation,
      wind_speed: weatherApiData.wind_speed,
      conditions: weatherApiData.conditions,
      work_suitability_score: this.calculateWorkSuitability(weatherApiData),
      created_at: new Date()
    };

    const query = `
      INSERT INTO weather_data 
      (job_site_id, date, temperature_high, temperature_low, precipitation_chance, 
       wind_speed, conditions, work_suitability_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (job_site_id, date) 
      DO UPDATE SET 
        temperature_high = EXCLUDED.temperature_high,
        temperature_low = EXCLUDED.temperature_low,
        precipitation_chance = EXCLUDED.precipitation_chance,
        wind_speed = EXCLUDED.wind_speed,
        conditions = EXCLUDED.conditions,
        work_suitability_score = EXCLUDED.work_suitability_score
    `;

    await pool.query(query, [
      weatherData.job_site_id,
      weatherData.date,
      weatherData.temperature_high,
      weatherData.temperature_low,
      weatherData.precipitation_chance,
      weatherData.wind_speed,
      weatherData.conditions,
      weatherData.work_suitability_score
    ]);
  }

  // Helper Methods
  private static calculateWorkSuitability(weatherData: any): number {
    let score = 100;

    // Temperature factors
    if (weatherData.temp_high > 95 || weatherData.temp_low < 25) score -= 30;
    else if (weatherData.temp_high > 85 || weatherData.temp_low < 35) score -= 15;

    // Precipitation factors
    if (weatherData.precipitation > 70) score -= 40;
    else if (weatherData.precipitation > 30) score -= 20;

    // Wind factors
    if (weatherData.wind_speed > 25) score -= 25;
    else if (weatherData.wind_speed > 15) score -= 10;

    // Condition factors
    const badConditions = ['storm', 'heavy_rain', 'snow', 'ice'];
    if (badConditions.includes(weatherData.conditions)) score -= 50;

    return Math.max(0, score);
  }

  private static async getWeatherRiskFactor(projectId: string): Promise<number> {
    const query = `
      SELECT AVG(wd.work_suitability_score) as avg_suitability
      FROM weather_data wd
      JOIN job_sites js ON wd.job_site_id = js.id
      WHERE js.project_id = $1 
        AND wd.date >= CURRENT_DATE - INTERVAL '7 days'
        AND wd.date <= CURRENT_DATE + INTERVAL '7 days'
    `;

    const result = await pool.query(query, [projectId]);
    const avgSuitability = result.rows[0]?.avg_suitability || 75;
    
    return avgSuitability < 50 ? 0.3 : avgSuitability < 70 ? 0.1 : 0;
  }

  private static async getResourceConstraintFactor(projectId: string): Promise<number> {
    const query = `
      SELECT 
        COUNT(DISTINCT t.assigned_to) as assigned_workers,
        COUNT(DISTINCT t.id) as active_tasks
      FROM tasks t
      WHERE t.project_id = $1 
        AND t.status IN ('not_started', 'in_progress')
    `;

    const result = await pool.query(query, [projectId]);
    const data = result.rows[0];
    
    if (!data.assigned_workers) return 0.4; // No workers assigned = high risk
    
    const tasksPerWorker = data.active_tasks / data.assigned_workers;
    return tasksPerWorker > 5 ? 0.2 : tasksPerWorker > 8 ? 0.3 : 0;
  }

  private static async getChangeOrderFactor(projectId: string): Promise<number> {
    // Placeholder for change order analysis
    // In real implementation, would analyze historical change orders
    return 0.1;
  }

  private static async assessWeatherRisk(projectId: string): Promise<RiskAssessment | null> {
    const weatherRisk = await this.getWeatherRiskFactor(projectId);
    
    if (weatherRisk > 0.2) {
      return {
        id: '',
        project_id: projectId,
        risk_category: 'weather',
        risk_level: weatherRisk > 0.3 ? 'high' : 'medium',
        description: 'Adverse weather conditions may impact project timeline',
        probability: weatherRisk * 100,
        impact_score: 60,
        mitigation_plan: 'Monitor weather forecasts, adjust schedules, prepare contingency plans',
        assigned_to: null,
        status: 'identified',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    return null;
  }

  private static async assessBudgetRisk(projectId: string): Promise<RiskAssessment | null> {
    const prediction = await this.predictCostOverrun(projectId);
    
    if (prediction.predicted_value > 0) {
      return {
        id: '',
        project_id: projectId,
        risk_category: 'budget',
        risk_level: prediction.predicted_value > 50000 ? 'high' : 'medium',
        description: `Potential cost overrun of $${prediction.predicted_value.toLocaleString()}`,
        probability: 100 - prediction.confidence_score,
        impact_score: Math.min(100, prediction.predicted_value / 1000),
        mitigation_plan: 'Review budget categories, control discretionary spending, negotiate with suppliers',
        assigned_to: null,
        status: 'identified',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    return null;
  }

  private static async assessScheduleRisk(projectId: string): Promise<RiskAssessment | null> {
    const query = `
      SELECT COUNT(*) as overdue_count
      FROM tasks
      WHERE project_id = $1 
        AND due_date < CURRENT_DATE 
        AND status != 'completed'
    `;

    const result = await pool.query(query, [projectId]);
    const overdueCount = parseInt(result.rows[0].overdue_count);
    
    if (overdueCount > 0) {
      return {
        id: '',
        project_id: projectId,
        risk_category: 'schedule',
        risk_level: overdueCount > 5 ? 'high' : 'medium',
        description: `${overdueCount} tasks are overdue, potentially impacting project schedule`,
        probability: Math.min(90, overdueCount * 15),
        impact_score: Math.min(100, overdueCount * 10),
        mitigation_plan: 'Reallocate resources, extend work hours, parallel task execution',
        assigned_to: null,
        status: 'identified',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    return null;
  }

  private static async assessResourceRisk(projectId: string): Promise<RiskAssessment | null> {
    const resourceConstraint = await this.getResourceConstraintFactor(projectId);
    
    if (resourceConstraint > 0.2) {
      return {
        id: '',
        project_id: projectId,
        risk_category: 'resource',
        risk_level: resourceConstraint > 0.3 ? 'high' : 'medium',
        description: 'Resource allocation constraints may impact project delivery',
        probability: resourceConstraint * 100,
        impact_score: 70,
        mitigation_plan: 'Hire additional workers, redistribute tasks, consider subcontracting',
        assigned_to: null,
        status: 'identified',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
    
    return null;
  }

  private static async savePrediction(prediction: ProjectPrediction): Promise<void> {
    const query = `
      INSERT INTO project_predictions 
      (project_id, prediction_type, predicted_value, predicted_date, confidence_score, factors)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await pool.query(query, [
      prediction.project_id,
      prediction.prediction_type,
      prediction.predicted_value,
      prediction.predicted_date,
      prediction.confidence_score,
      JSON.stringify(prediction.factors)
    ]);
  }

  private static async saveRiskAssessment(risk: RiskAssessment): Promise<void> {
    const query = `
      INSERT INTO risk_assessments 
      (project_id, risk_category, risk_level, description, probability, impact_score, 
       mitigation_plan, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await pool.query(query, [
      risk.project_id,
      risk.risk_category,
      risk.risk_level,
      risk.description,
      risk.probability,
      risk.impact_score,
      risk.mitigation_plan,
      risk.status
    ]);
  }

  // Batch Analytics Processing
  static async runDailyAnalytics(): Promise<void> {
    try {
      console.log('Starting daily analytics processing...');

      // Get all active projects
      const activeProjects = await pool.query(`
        SELECT id FROM projects WHERE status = 'active'
      `);

      for (const project of activeProjects.rows) {
        try {
          // Run predictions
          await this.predictProjectDelay(project.id);
          await this.predictCostOverrun(project.id);
          
          // Generate risk assessments
          await this.generateRiskAssessment(project.id);
          
          console.log(`Analytics completed for project ${project.id}`);
        } catch (error) {
          console.error(`Error processing analytics for project ${project.id}:`, error);
        }
      }

      console.log('Daily analytics processing completed');
    } catch (error) {
      console.error('Error in daily analytics processing:', error);
    }
  }
}