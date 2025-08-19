
// Process conversation end and save final analytics
function processConversationEnd(sessionId, userId, finalAnalytics, userFeedback = null) {
    const now = new Date().toISOString();
    
    // Calculate conversation quality score
    let qualityScore = 0;
    if (finalAnalytics.avgResponseTime < 2000) qualityScore += 25;
    if (finalAnalytics.totalMessages >= 5) qualityScore += 25;
    if (finalAnalytics.sessionDuration > 60) qualityScore += 25;
    if (finalAnalytics.satisfactionRating >= 4) qualityScore += 25;
    
    // Determine conversation outcome
    let conversationOutcome = 'incomplete';
    if (finalAnalytics.topicsDiscussed.includes('quote')) conversationOutcome = 'lead_generated';
    else if (finalAnalytics.topicsDiscussed.includes('contact')) conversationOutcome = 'contact_requested';
    else if (finalAnalytics.totalMessages >= 5) conversationOutcome = 'information_provided';
    
    return {
        session_id: sessionId,
        user_id: userId || 'anonymous',
        total_messages: finalAnalytics.totalMessages,
        session_duration: finalAnalytics.sessionDuration,
        satisfaction_rating: finalAnalytics.satisfactionRating || 0,
        topics_discussed: JSON.stringify(finalAnalytics.topicsDiscussed || []),
        created_at: now,
        conversation_outcome: conversationOutcome,
        quality_score: qualityScore,
        user_feedback: userFeedback,
        avg_response_time: finalAnalytics.avgResponseTime || 0,
        completed_at: now
    };
}
