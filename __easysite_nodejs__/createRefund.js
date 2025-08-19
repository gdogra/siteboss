
function createRefund(paymentIntentId, amount, reason = 'requested_by_customer') {
  // This function creates a refund for a payment

  if (!paymentIntentId) {
    throw new Error('Payment intent ID is required');
  }

  // Generate a mock refund ID for demo
  const refundId = 're_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  return {
    id: refundId,
    amount: amount,
    currency: 'usd',
    payment_intent: paymentIntentId,
    reason: reason,
    status: 'succeeded',
    created: Math.floor(Date.now() / 1000)
  };
}