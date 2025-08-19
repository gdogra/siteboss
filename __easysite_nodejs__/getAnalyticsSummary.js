
// Get analytics summary for dashboard
function getAnalyticsSummary(userId = null, days = 7) {
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return {
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        days: days,
        summary_type: 'dashboard'
    };
}
