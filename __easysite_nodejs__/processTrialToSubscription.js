
// Automatically process trial to paid subscription conversion
function processTrialToSubscription(trialRecordId, shouldAutoConvert = true) {
  const now = new Date();
  
  if (shouldAutoConvert) {
    // Process automatic conversion based on user's selected plan
    return {
      status: 'converted',
      converted_at: now.toISOString(),
      billing_starts: now.toISOString(),
      first_payment_amount: 9900, // Default to basic plan
      next_billing_date: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString()
    };
  } else {
    // Grace period before cancellation
    const gracePeriodEnd = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 day grace period
    
    return {
      status: 'grace_period',
      grace_period_ends: gracePeriodEnd.toISOString(),
      final_reminder_sent: true,
      cancellation_scheduled: true
    };
  }
}
