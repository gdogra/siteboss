
// Cancel user subscription
function cancelSubscription(subscriptionId, cancelImmediately = false, cancellationReason = '') {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
  
  return {
    subscription_id: subscriptionId,
    status: cancelImmediately ? 'canceled' : 'cancel_at_period_end',
    cancelled_at: now.toISOString(),
    cancellation_reason: cancellationReason,
    access_until: cancelImmediately ? now.toISOString() : periodEnd.toISOString(),
    final_invoice_amount: cancelImmediately ? 0 : null
  };
}
