
function trackFeatureUsage(userId, featureName, usageData = {}) {
  if (!userId || !featureName) {
    throw new Error('User ID and feature name are required');
  }

  const now = new Date();
  const usageRecord = {
    userId,
    featureName,
    timestamp: now.toISOString(),
    sessionDuration: usageData.sessionDuration || 0,
    actionsPerformed: usageData.actionsPerformed || 1,
    dataCreated: usageData.dataCreated || false,
    ...usageData
  };

  // Calculate engagement score based on usage
  let engagementScore = 0;
  if (usageRecord.sessionDuration > 5) engagementScore += 20;
  if (usageRecord.actionsPerformed > 3) engagementScore += 30;
  if (usageRecord.dataCreated) engagementScore += 50;

  return {
    usageRecord,
    engagementScore,
    featureAdoption: {
      [featureName]: {
        firstUsed: now.toISOString(),
        totalSessions: 1,
        totalTimeSpent: usageRecord.sessionDuration,
        adoptionScore: engagementScore
      }
    },
    recommendations: generateFeatureRecommendations(featureName, engagementScore)
  };
}

function generateFeatureRecommendations(usedFeature, engagementScore) {
  const recommendations = {
    'project_management': ['invoice_processing', 'team_collaboration'],
    'invoice_processing': ['payment_tracking', 'financial_reports'],
    'lead_management': ['proposal_creation', 'customer_portal'],
    'team_collaboration': ['time_tracking', 'mobile_app']
  };

  const nextFeatures = recommendations[usedFeature] || [];

  return nextFeatures.map((feature) => ({
    feature,
    reason: `Based on your use of ${usedFeature}, you might also benefit from ${feature}`,
    priority: engagementScore > 50 ? 'high' : 'medium'
  }));
}