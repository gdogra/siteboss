
// Check if user has access to a specific feature based on subscription
function checkFeatureAccess(userSubscriptionId, featureKey, requestedUsage = 1) {
  // This would typically query the database to check current usage against limits
  // For demo purposes, we'll return mock data based on feature key
  
  const mockLimits = {
    'api_calls': { limit: 10000, current: Math.floor(Math.random() * 12000) },
    'storage_gb': { limit: 100, current: Math.floor(Math.random() * 120) },
    'users': { limit: 10, current: Math.floor(Math.random() * 12) },
    'projects': { limit: 50, current: Math.floor(Math.random() * 60) }
  };
  
  const feature = mockLimits[featureKey] || { limit: -1, current: 0 };
  const hasAccess = feature.limit === -1 || (feature.current + requestedUsage <= feature.limit);
  const overageAmount = hasAccess ? 0 : (feature.current + requestedUsage - feature.limit);
  
  return {
    has_access: hasAccess,
    feature_key: featureKey,
    current_usage: feature.current,
    limit: feature.limit,
    requested_usage: requestedUsage,
    remaining: feature.limit === -1 ? -1 : Math.max(0, feature.limit - feature.current),
    overage: overageAmount,
    warning_threshold: feature.limit * 0.8, // 80% warning
    approaching_limit: feature.current >= (feature.limit * 0.8)
  };
}
