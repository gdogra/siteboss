
function calculateLeadScore(lead) {
    let score = 0;
    
    // Budget scoring (0-30 points)
    const maxBudget = lead.budget_max || 0;
    if (maxBudget > 100000) score += 30;
    else if (maxBudget > 50000) score += 25;
    else if (maxBudget > 25000) score += 20;
    else if (maxBudget > 10000) score += 15;
    else if (maxBudget > 5000) score += 10;
    else if (maxBudget > 0) score += 5;
    
    // Lead source scoring (0-20 points)
    const sourceScores = {
        'referral': 20,
        'repeat_customer': 18,
        'website': 15,
        'social_media': 12,
        'google_ads': 10,
        'cold_call': 5,
        'other': 3
    };
    score += sourceScores[lead.lead_source] || 3;
    
    // Contact completeness (0-15 points)
    if (lead.contact_email) score += 5;
    if (lead.contact_phone) score += 5;
    if (lead.company) score += 5;
    
    // Project details completeness (0-10 points)
    if (lead.project_description && lead.project_description.length > 50) score += 5;
    if (lead.project_type) score += 5;
    
    // Timeline urgency (0-10 points) - based on status progression
    const statusScores = {
        'NEW': 2,
        'QUALIFYING': 4,
        'CONTACTED': 6,
        'ESTIMATE_SENT': 8,
        'NEGOTIATING': 10,
        'WON': 0,
        'LOST': 0
    };
    score += statusScores[lead.status] || 0;
    
    // Recent activity boost (0-15 points)
    // This would need to be calculated based on lead_activities
    // For now, we'll add a base score
    score += 10;
    
    return Math.min(100, Math.max(0, score));
}
