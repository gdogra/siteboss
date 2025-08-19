
function calculateNextActionAt(status) {
    const now = new Date();
    const slaHours = {
        'NEW': 24,
        'QUALIFYING': 24,
        'CONTACTED': 72,
        'ESTIMATE_SENT': 72,
        'NEGOTIATING': 72,
        'WON': 0,
        'LOST': 0
    };
    
    const hours = slaHours[status] || 24;
    if (hours === 0) return null;
    
    const nextAction = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    return nextAction.toISOString();
}
