
// Upgrade user subscription to a higher tier
function upgradeSubscription(subscriptionId, newPlanId, prorationBehavior = 'create_prorations') {
  // Mock Stripe subscription upgrade
  const upgradeResponse = {
    subscription_id: subscriptionId,
    new_plan_id: newPlanId,
    proration_amount: Math.floor(Math.random() * 10000) + 1000, // Random proration in cents
    effective_date: new Date().toISOString(),
    next_billing_amount: newPlanId === 2 ? 29900 : 59900, // Professional $299 or Enterprise $599
    status: 'active'
  };
  
  return upgradeResponse;
}
