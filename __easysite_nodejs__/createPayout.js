
function createPayout(amount, currency, connectedAccountId, metadata = {}) {
    // This function creates a payout to a connected Stripe account
    
    if (!amount || amount <= 0) {
        throw new Error('Invalid payout amount');
    }
    
    if (!connectedAccountId) {
        throw new Error('Connected account ID is required');
    }
    
    // Generate a mock payout ID for demo
    const payoutId = 'po_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    return {
        id: payoutId,
        amount: amount,
        currency: currency || 'usd',
        status: 'paid',
        arrival_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        destination: connectedAccountId,
        metadata: metadata
    };
}
