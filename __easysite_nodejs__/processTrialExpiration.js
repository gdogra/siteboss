
// Process trial expiration and convert to paid or cancel
function processTrialExpiration(userSubscriptionId, shouldConvert = false, planId = null) {
  const now = new Date();
  
  if (shouldConvert && planId) {
    // Convert trial to paid subscription
    const nextBilling = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return {
      action: 'converted',
      status: 'active',
      converted_at: now.toISOString(),
      trial_ended_at: now.toISOString(),
      next_billing_date: nextBilling.toISOString(),
      plan_id: planId
    };
  } else {
    // Cancel subscription after trial
    return {
      action: 'cancelled',
      status: 'canceled',
      cancelled_at: now.toISOString(),
      trial_ended_at: now.toISOString(),
      access_until: now.toISOString()
    };
  }
}
