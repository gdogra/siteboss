
// Get conversation history for a user
function getConversationHistory(userId, sessionId = null, limit = 50) {
    return {
        user_id: userId,
        session_id: sessionId,
        limit: limit,
        order_by: 'timestamp',
        order_direction: 'DESC'
    };
}
