
function aggregateAnalyticsData(timeRange = 'daily', tenantId = null) {
  const now = new Date();
  let periodStart, periodEnd;
  
  // Calculate time periods
  switch (timeRange) {
    case 'daily':
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodEnd = now;
      break;
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    default:
      periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      periodEnd = now;
  }

  // Mock aggregated data - In real implementation, this would query actual tables
  const metrics = [
    // Lead Management Metrics
    {
      metric_name: 'total_leads',
      metric_category: 'leads',
      metric_value: Math.floor(Math.random() * 100) + 50,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ source: 'lead_management' }),
      created_at: now.toISOString()
    },
    {
      metric_name: 'conversion_rate',
      metric_category: 'leads',
      metric_value: Math.round((Math.random() * 0.3 + 0.1) * 100) / 100,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'percentage' }),
      created_at: now.toISOString()
    },
    // Project Management Metrics
    {
      metric_name: 'active_projects',
      metric_category: 'projects',
      metric_value: Math.floor(Math.random() * 50) + 20,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ source: 'project_management' }),
      created_at: now.toISOString()
    },
    {
      metric_name: 'project_completion_rate',
      metric_category: 'projects',
      metric_value: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'percentage' }),
      created_at: now.toISOString()
    },
    // Financial Metrics
    {
      metric_name: 'total_revenue',
      metric_category: 'financial',
      metric_value: Math.floor(Math.random() * 100000) + 50000,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ currency: 'USD', unit: 'dollars' }),
      created_at: now.toISOString()
    },
    {
      metric_name: 'outstanding_invoices',
      metric_category: 'financial',
      metric_value: Math.floor(Math.random() * 20000) + 5000,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ currency: 'USD', unit: 'dollars' }),
      created_at: now.toISOString()
    },
    // Inventory Metrics
    {
      metric_name: 'low_stock_items',
      metric_category: 'inventory',
      metric_value: Math.floor(Math.random() * 15) + 2,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'count' }),
      created_at: now.toISOString()
    },
    {
      metric_name: 'inventory_turnover',
      metric_category: 'inventory',
      metric_value: Math.round((Math.random() * 3 + 2) * 100) / 100,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'ratio' }),
      created_at: now.toISOString()
    },
    // Time Tracking Metrics
    {
      metric_name: 'total_hours_logged',
      metric_category: 'time_tracking',
      metric_value: Math.floor(Math.random() * 500) + 200,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'hours' }),
      created_at: now.toISOString()
    },
    {
      metric_name: 'productivity_score',
      metric_category: 'time_tracking',
      metric_value: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'percentage' }),
      created_at: now.toISOString()
    },
    // Subscription Metrics
    {
      metric_name: 'active_subscriptions',
      metric_category: 'subscriptions',
      metric_value: Math.floor(Math.random() * 100) + 50,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'count' }),
      created_at: now.toISOString()
    },
    {
      metric_name: 'churn_rate',
      metric_category: 'subscriptions',
      metric_value: Math.round((Math.random() * 0.1 + 0.02) * 100) / 100,
      time_period: timeRange,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      tenant_id: tenantId,
      metadata: JSON.stringify({ unit: 'percentage' }),
      created_at: now.toISOString()
    }
  ];

  return {
    metrics,
    timeRange,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    generatedAt: now.toISOString()
  };
}
