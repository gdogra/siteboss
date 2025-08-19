
// Save a message to the database
function saveMessage(conversationId, messageType, content, responseTime = 0, confidenceScore = 0) {
    const now = new Date().toISOString();
    
    return {
        conversation_id: conversationId,
        message_type: messageType, // 'user' or 'bot'
        content: content,
        timestamp: now,
        response_time: responseTime,
        nlp_confidence_score: confidenceScore
    };
}
