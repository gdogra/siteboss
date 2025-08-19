
// Downgrade user subscription to a lower tier
function downgradeSubscription(subscriptionId, newPlanId, effectiveAt = 'period_end') {
  // Mock Stripe subscription downgrade
  const downgradeResponse = {
    subscription_id: subscriptionId,
    new_plan_id: newPlanId,
    effective_date: effectiveAt === 'immediately' ? new Date().toISOString() : null,
    credit_amount: Math.floor(Math.random() * 5000) + 500, // Random credit in cents
    next_billing_amount: newPlanId === 1 ? 9900 : 29900, // Basic $99 or Professional $299
    status: 'active',
    scheduled_change: effectiveAt !== 'immediately'
  };
  
  return downgradeResponse;
}
