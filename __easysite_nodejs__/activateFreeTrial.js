
function activateFreeTrial(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const now = new Date();
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

  const trialData = {
    user_id: userId,
    trial_start_date: now.toISOString(),
    trial_end_date: trialEndDate.toISOString(),
    trial_status: 'active',
    features_used: JSON.stringify([]),
    onboarding_completed: false,
    trial_extension_days: 0
  };

  return {
    trialData,
    daysRemaining: 30,
    trialEndDate: trialEndDate.toISOString(),
    status: 'active'
  };
}