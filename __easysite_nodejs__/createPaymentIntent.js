
function createPaymentIntent(amount, currency, customerId, metadata = {}) {
    // This function creates a Stripe payment intent for processing payments
    // In a real implementation, you would integrate with Stripe's API
    
    if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
    }
    
    if (!customerId) {
        throw new Error('Customer ID is required');
    }
    
    // Generate a mock payment intent ID for demo
    const paymentIntentId = 'pi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    return {
        id: paymentIntentId,
        amount: amount,
        currency: currency || 'usd',
        status: 'requires_payment_method',
        client_secret: paymentIntentId + '_secret_' + Math.random().toString(36).substr(2, 9),
        customer: customerId,
        metadata: metadata
    };
}
