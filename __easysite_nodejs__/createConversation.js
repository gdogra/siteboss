
// Create a new conversation session
function createConversation(userId) {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    return {
        user_id: userId || 'anonymous',
        session_id: sessionId,
        created_at: now,
        updated_at: now
    };
}
