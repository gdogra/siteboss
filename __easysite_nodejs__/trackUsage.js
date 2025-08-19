
// Track usage metrics for subscription limits
function trackUsage(userSubscriptionId, metricName, incrementValue, metadata = {}) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of current month

  return {
    user_subscription_id: userSubscriptionId,
    metric_name: metricName,
    increment_value: incrementValue,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    recorded_at: now.toISOString(),
    metadata: JSON.stringify(metadata)
  };
}