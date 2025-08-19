
function getAnalyticsTrends(category = 'all', timeRange = 'monthly', tenantId = null) {
  const now = new Date();
  const trends = {};
  
  // Generate trend data based on category
  const categories = category === 'all' ? 
    ['financial', 'leads', 'projects', 'inventory', 'productivity'] : [category];
  
  categories.forEach(cat => {
    trends[cat] = generateTrendData(cat, timeRange, now);
  });
  
  return {
    trends,
    category,
    timeRange,
    tenantId,
    generatedAt: now.toISOString()
  };
}

function generateTrendData(category, timeRange, now) {
  let dataPoints = 30; // Default for monthly
  let timeUnit = 'day';
  
  switch (timeRange) {
    case 'weekly':
      dataPoints = 7;
      timeUnit = 'day';
      break;
    case 'monthly':
      dataPoints = 30;
      timeUnit = 'day';
      break;
    case 'quarterly':
      dataPoints = 12;
      timeUnit = 'week';
      break;
    case 'yearly':
      dataPoints = 12;
      timeUnit = 'month';
      break;
  }
  
  const data = Array.from({length: dataPoints}, (_, i) => {
    const date = new Date(now.getTime() - (dataPoints - 1 - i) * getTimeMultiplier(timeUnit));
    return {
      date: date.toISOString().split('T')[0],
      ...generateCategoryMetrics(category, i, dataPoints)
    };
  });
  
  return {
    data,
    summary: calculateTrendSummary(data, category),
    forecast: generateForecast(data, category)
  };
}

function getTimeMultiplier(unit) {
  const multipliers = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
  };
  return multipliers[unit] || multipliers.day;
}

function generateCategoryMetrics(category, index, total) {
  const baseValue = Math.sin(index / total * Math.PI) * 0.3 + 1;
  const randomFactor = Math.random() * 0.4 + 0.8;
  
  switch (category) {
    case 'financial':
      return {
        revenue: Math.floor(baseValue * randomFactor * 25000),
        profit: Math.floor(baseValue * randomFactor * 8000),
        expenses: Math.floor(baseValue * randomFactor * 17000)
      };
    case 'leads':
      return {
        newLeads: Math.floor(baseValue * randomFactor * 20),
        convertedLeads: Math.floor(baseValue * randomFactor * 6),
        conversionRate: Math.round(baseValue * randomFactor * 30) / 100
      };
    case 'projects':
      return {
        activeProjects: Math.floor(baseValue * randomFactor * 15),
        completedProjects: Math.floor(baseValue * randomFactor * 5),
        onTimeCompletion: Math.round(baseValue * randomFactor * 85) / 100
      };
    case 'inventory':
      return {
        stockValue: Math.floor(baseValue * randomFactor * 50000),
        turnoverRate: Math.round(baseValue * randomFactor * 2.5 * 100) / 100,
        lowStockItems: Math.floor(baseValue * randomFactor * 8)
      };
    case 'productivity':
      return {
        hoursLogged: Math.floor(baseValue * randomFactor * 200),
        productivity: Math.round(baseValue * randomFactor * 85) / 100,
        utilization: Math.round(baseValue * randomFactor * 90) / 100
      };
    default:
      return { value: Math.floor(baseValue * randomFactor * 100) };
  }
}

function calculateTrendSummary(data, category) {
  if (data.length < 2) return {};
  
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  
  const summary = {
    direction: 'stable',
    changePercentage: 0,
    volatility: 'low'
  };
  
  // Calculate primary metric change based on category
  let primaryMetric;
  switch (category) {
    case 'financial':
      primaryMetric = 'revenue';
      break;
    case 'leads':
      primaryMetric = 'newLeads';
      break;
    case 'projects':
      primaryMetric = 'activeProjects';
      break;
    case 'inventory':
      primaryMetric = 'stockValue';
      break;
    case 'productivity':
      primaryMetric = 'productivity';
      break;
    default:
      primaryMetric = 'value';
  }
  
  if (firstValue[primaryMetric] && lastValue[primaryMetric]) {
    const change = ((lastValue[primaryMetric] - firstValue[primaryMetric]) / firstValue[primaryMetric]) * 100;
    summary.changePercentage = Math.round(change * 100) / 100;
    
    if (change > 5) summary.direction = 'increasing';
    else if (change < -5) summary.direction = 'decreasing';
    else summary.direction = 'stable';
  }
  
  return summary;
}

function generateForecast(data, category) {
  // Simple linear regression forecast for next 7 days
  if (data.length < 3) return [];
  
  const lastThreePoints = data.slice(-3);
  const forecast = [];
  
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(new Date(data[data.length - 1].date).getTime() + i * 24 * 60 * 60 * 1000);
    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      ...extrapolateMetrics(lastThreePoints, category, i),
      isForecast: true
    });
  }
  
  return forecast;
}

function extrapolateMetrics(points, category, daysAhead) {
  // Simple linear extrapolation based on last 3 points
  const metrics = {};
  Object.keys(points[0]).forEach(key => {
    if (key === 'date') return;
    
    const values = points.map(p => p[key]);
    const trend = (values[2] - values[0]) / 2; // Average change per day
    const predicted = values[2] + trend * daysAhead;
    metrics[key] = Math.max(0, Math.round(predicted * 100) / 100);
  });
  
  return metrics;
}
