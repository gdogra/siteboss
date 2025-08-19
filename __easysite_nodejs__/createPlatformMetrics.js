
function createPlatformMetrics() {
  // This function would create sample data for testing the platform administration dashboard
  // In a real implementation, this data would come from actual system monitoring

  const now = new Date();
  const metrics = [];

  // Generate sample health metrics
  const metricTypes = ['cpu', 'memory', 'disk', 'network', 'database'];
  const servers = ['web-server-1', 'web-server-2', 'db-server-1', 'cache-server-1'];

  metricTypes.forEach((type) => {
    servers.forEach((server) => {
      const baseValue = Math.random() * 100;
      const status = baseValue > 85 ? 'critical' : baseValue > 70 ? 'warning' : 'healthy';

      metrics.push({
        metric_type: type,
        metric_name: `${type}_usage_percent`,
        server_instance: server,
        service_name: type === 'database' ? 'PostgreSQL' : type === 'cache' ? 'Redis' : 'Application',
        metric_value: Math.round(baseValue),
        metric_unit: '%',
        threshold_warning: 70,
        threshold_critical: 85,
        status: status,
        timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
        additional_data: JSON.stringify({ region: 'us-east-1' }),
        collection_interval_seconds: 60,
        data_retention_days: 30,
        is_anomaly: Math.random() > 0.9,
        anomaly_score: Math.random(),
        created_at: now.toISOString()
      });
    });
  });

  return {
    success: true,
    message: `Generated ${metrics.length} sample health metrics`,
    data: metrics
  };
}