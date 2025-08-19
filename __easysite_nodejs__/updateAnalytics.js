
// Update analytics for a conversation session
function updateAnalytics(sessionId, userId, totalMessages, sessionDuration, topics = [], satisfactionRating = 0) {
  const now = new Date().toISOString();

  return {
    session_id: sessionId,
    user_id: userId || 'anonymous',
    total_messages: totalMessages,
    session_duration: sessionDuration,
    satisfaction_rating: satisfactionRating,
    topics_discussed: JSON.stringify(topics),
    created_at: now
  };
}