
// Optimize chat response based on user context and analytics
function optimizeChatResponse(originalResponse, userContext, sessionAnalytics) {
  try {
    let optimizedResponse = originalResponse.response;
    const { userName = 'there', userRole = 'user', previousTopics = [] } = userContext;
    const { totalMessages = 0, avgResponseTime = 0, topicsDiscussed = [] } = sessionAnalytics;

    // Personalization based on user role
    if (userRole === 'Administrator') {
      optimizedResponse = optimizedResponse.replace(/you can/g, 'as an administrator, you have full access to');
    } else if (userRole === 'Contractor') {
      optimizedResponse = optimizedResponse.replace(/our team/g, 'your contractor network');
    }

    // Context-aware optimization
    if (totalMessages > 10) {
      optimizedResponse = `Since we've been talking for a while, let me provide a quick summary: ${optimizedResponse}`;
    }

    // Topic continuity
    if (topicsDiscussed.includes('quote') && originalResponse.topics.includes('services')) {
      optimizedResponse += '\n\nBased on our previous discussion about quotes, would you like me to connect you directly with our estimation team?';
    }

    // Performance-based adjustments
    if (avgResponseTime > 3000) {
      optimizedResponse = 'Thanks for your patience! ' + optimizedResponse;
    }

    return {
      ...originalResponse,
      response: optimizedResponse,
      optimization_applied: true,
      optimization_context: {
        user_role: userRole,
        message_count: totalMessages,
        topics_continuity: topicsDiscussed.length > 0
      }
    };

  } catch (error) {
    return originalResponse; // Return original if optimization fails
  }
}