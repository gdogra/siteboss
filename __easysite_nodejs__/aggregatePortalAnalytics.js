
function aggregatePortalAnalytics(customerId, timeRange = '30d') {
  const dayjs = require('dayjs');

  // Calculate date ranges
  const endDate = dayjs();
  let startDate;

  switch (timeRange) {
    case '7d':
      startDate = endDate.subtract(7, 'days');
      break;
    case '30d':
      startDate = endDate.subtract(30, 'days');
      break;
    case '90d':
      startDate = endDate.subtract(90, 'days');
      break;
    default:
      startDate = endDate.subtract(30, 'days');
  }

  // Simulate analytics aggregation
  const analytics = {
    summary: {
      total_events: Math.floor(Math.random() * 10000) + 1000,
      unique_users: Math.floor(Math.random() * 500) + 50,
      session_count: Math.floor(Math.random() * 2000) + 200,
      average_session_duration: Math.floor(Math.random() * 1800) + 600, // seconds
      bounce_rate: (Math.random() * 0.4 + 0.1).toFixed(2), // 10-50%
      conversion_rate: (Math.random() * 0.05 + 0.01).toFixed(3) // 1-6%
    },

    feature_usage: {
      dashboard_views: Math.floor(Math.random() * 5000) + 500,
      feature_toggles: Math.floor(Math.random() * 200) + 20,
      user_management: Math.floor(Math.random() * 100) + 10,
      branding_updates: Math.floor(Math.random() * 50) + 5,
      integration_configs: Math.floor(Math.random() * 80) + 8,
      notification_changes: Math.floor(Math.random() * 150) + 15
    },

    user_activity: {
      daily_active_users: Math.floor(Math.random() * 100) + 20,
      weekly_active_users: Math.floor(Math.random() * 200) + 40,
      monthly_active_users: Math.floor(Math.random() * 400) + 80,
      new_users: Math.floor(Math.random() * 50) + 5
    },

    performance_metrics: {
      page_load_time: (Math.random() * 2 + 1).toFixed(2), // 1-3 seconds
      api_response_time: (Math.random() * 500 + 100).toFixed(0), // 100-600ms
      error_rate: (Math.random() * 0.02).toFixed(3), // 0-2%
      uptime: (99.5 + Math.random() * 0.5).toFixed(2) // 99.5-100%
    },

    integration_stats: {
      total_integrations: Math.floor(Math.random() * 10) + 3,
      active_integrations: Math.floor(Math.random() * 8) + 2,
      failed_webhooks: Math.floor(Math.random() * 5),
      api_calls: Math.floor(Math.random() * 50000) + 5000
    },

    time_series: generateTimeSeries(startDate, endDate),

    generated_at: dayjs().toISOString(),
    time_range: timeRange,
    customer_id: customerId
  };

  return analytics;
}

function generateTimeSeries(startDate, endDate) {
  const series = [];
  const dayjs = require('dayjs');
  let currentDate = dayjs(startDate);

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    series.push({
      date: currentDate.format('YYYY-MM-DD'),
      events: Math.floor(Math.random() * 500) + 50,
      users: Math.floor(Math.random() * 50) + 5,
      sessions: Math.floor(Math.random() * 100) + 10,
      page_views: Math.floor(Math.random() * 1000) + 100
    });
    currentDate = currentDate.add(1, 'day');
  }

  return series;
}