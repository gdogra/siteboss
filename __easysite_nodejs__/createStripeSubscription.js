
// Create a new Stripe subscription with free trial
function createStripeSubscription(userId, planId, paymentMethodId = null, trialDays = 30) {
  // This is a mock implementation - in production you would integrate with Stripe API
  const subscriptionId = `sub_${Date.now()}_${userId}`;
  const customerId = `cus_${userId}`;

  const now = new Date();
  const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  const nextBilling = new Date(trialEnd.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    subscription_id: subscriptionId,
    customer_id: customerId,
    status: 'trialing',
    trial_start: now.toISOString(),
    trial_end: trialEnd.toISOString(),
    current_period_start: now.toISOString(),
    current_period_end: nextBilling.toISOString(),
    next_billing_date: nextBilling.toISOString()
  };
}