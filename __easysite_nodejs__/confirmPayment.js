
function confirmPayment(paymentIntentId, paymentMethodId) {
  // This function confirms a payment with Stripe

  if (!paymentIntentId) {
    throw new Error('Payment intent ID is required');
  }

  if (!paymentMethodId) {
    throw new Error('Payment method ID is required');
  }

  // Simulate payment confirmation
  const isSuccess = Math.random() > 0.1; // 90% success rate for demo

  if (!isSuccess) {
    throw new Error('Payment failed - insufficient funds or card declined');
  }

  return {
    id: paymentIntentId,
    status: 'succeeded',
    amount_received: Math.floor(Math.random() * 50000) + 1000, // Random amount for demo
    charges: {
      data: [{
        id: 'ch_' + Date.now(),
        payment_method: paymentMethodId,
        outcome: {
          network_status: 'approved_by_network',
          type: 'authorized'
        }
      }]
    }
  };
}