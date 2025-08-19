
function checkAnalyticsAlerts(tenantId = null) {
  const now = new Date();
  const triggeredAlerts = [];

  // Simulate checking various metrics against alert thresholds
  const mockMetrics = [
  { name: 'revenue_drop', value: -15, threshold: -10, level: 'warning' },
  { name: 'low_conversion_rate', value: 0.08, threshold: 0.1, level: 'critical' },
  { name: 'high_project_delays', value: 0.25, threshold: 0.2, level: 'warning' },
  { name: 'inventory_shortage', value: 5, threshold: 10, level: 'critical' },
  { name: 'overdue_payments', value: 25000, threshold: 20000, level: 'warning' }];


  mockMetrics.forEach((metric, index) => {
    const shouldTrigger = Math.random() > 0.7; // 30% chance to trigger

    if (shouldTrigger) {
      const alert = {
        id: index + 1,
        alert_name: metric.name.replace('_', ' ').toUpperCase(),
        metric_name: metric.name,
        metric_value: metric.value,
        threshold_value: metric.threshold,
        alert_level: metric.level,
        alert_message: generateAlertMessage(metric.name, metric.value, metric.threshold),
        status: 'triggered',
        triggered_at: now.toISOString(),
        tenant_id: tenantId
      };

      triggeredAlerts.push(alert);
    }
  });

  return {
    alertsTriggered: triggeredAlerts.length,
    alerts: triggeredAlerts,
    checkedAt: now.toISOString()
  };
}

function generateAlertMessage(metricName, value, threshold) {
  const messages = {
    revenue_drop: `Revenue has dropped by ${Math.abs(value)}%, exceeding the ${Math.abs(threshold)}% threshold`,
    low_conversion_rate: `Lead conversion rate is ${(value * 100).toFixed(1)}%, below the ${(threshold * 100).toFixed(1)}% minimum`,
    high_project_delays: `${(value * 100).toFixed(1)}% of projects are delayed, above the ${(threshold * 100).toFixed(1)}% threshold`,
    inventory_shortage: `${value} items are below minimum stock levels (threshold: ${threshold} items)`,
    overdue_payments: `$${value.toLocaleString()} in overdue payments exceeds threshold of $${threshold.toLocaleString()}`
  };

  return messages[metricName] || `Metric ${metricName} value ${value} has exceeded threshold ${threshold}`;
}