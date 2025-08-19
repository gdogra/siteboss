
// Enhanced chatbot controller integrating all advanced AI capabilities
async function enhancedChatController(userMessage, conversationId, userId, userContext = {}) {
  try {
    const startTime = Date.now();

    // Initialize conversation context if needed
    let conversationHistory = [];
    let conversationContext = {};

    try {
      // In a real implementation, you would fetch from database
      conversationHistory = await fetchConversationHistory(conversationId);
      conversationContext = await buildConversationContext(conversationId, conversationHistory, userContext);
    } catch (contextError) {
      console.log('Context building failed, using fallback:', contextError.message);
      conversationContext = buildFallbackContext(userContext);
    }

    // Step 1: Advanced Intent Recognition
    const intentAnalysis = await performIntentRecognition(userMessage, conversationHistory, userContext);

    // Step 2: Conversation Context Management
    const enhancedContext = await enhanceConversationContext(
      conversationId,
      userMessage,
      conversationHistory,
      userContext,
      intentAnalysis
    );

    // Step 3: Conversation Flow Management (if applicable)
    let flowResult = null;
    if (enhancedContext.activeFlow) {
      flowResult = await manageConversationFlow(
        conversationId,
        enhancedContext.currentFlowStep,
        userMessage,
        enhancedContext
      );
    }

    // Step 4: Enhanced Response Generation
    const responseResult = await generateEnhancedResponse(
      intentAnalysis,
      enhancedContext,
      userMessage,
      flowResult
    );

    // Step 5: Response Optimization
    const analyticsData = await getAnalyticsData(userId, conversationId);
    const optimizedResponse = await optimizeResponse(
      responseResult,
      enhancedContext,
      analyticsData
    );

    // Step 6: Learning and Analytics
    const interactionData = {
      user_message: userMessage,
      intent_analysis: intentAnalysis,
      response_data: optimizedResponse,
      context: enhancedContext,
      processing_time: Date.now() - startTime,
      conversation_id: conversationId,
      user_id: userId
    };

    // Async learning (don't wait for completion)
    performAsyncLearning(interactionData);

    // Step 7: Save interaction and update analytics
    await saveEnhancedInteraction(interactionData);

    // Return enhanced response
    return {
      success: true,
      response: optimizedResponse.response,
      confidence: optimizedResponse.confidence,
      topics: optimizedResponse.topics,
      suggestedActions: optimizedResponse.suggestedActions,
      metadata: {
        ...optimizedResponse.responseMetadata,
        processing_time: Date.now() - startTime,
        intent_recognized: intentAnalysis.primaryIntent?.name || 'unknown',
        intent_confidence: intentAnalysis.primaryIntent?.confidence || 0,
        context_enhanced: true,
        optimized: true,
        learning_enabled: true,
        conversation_turn: enhancedContext.turnIndex + 1
      },
      conversationFlow: flowResult ? {
        active: flowResult.flowActive,
        currentStep: flowResult.currentStep,
        progress: flowResult.progress,
        completed: flowResult.flowCompleted
      } : null,
      quickReplies: generateQuickReplies(intentAnalysis, enhancedContext),
      smartSuggestions: generateSmartSuggestions(optimizedResponse, enhancedContext)
    };

  } catch (error) {
    console.error('Enhanced chat controller error:', error);

    // Fallback response with basic functionality
    return await generateFallbackResponse(userMessage, conversationId, userId, userContext);
  }
}

// Perform advanced intent recognition
async function performIntentRecognition(userMessage, conversationHistory, userContext) {
  try {
    // Use the advanced intent recognition function
    return advancedIntentRecognition(userMessage, conversationHistory, userContext);
  } catch (error) {
    console.error('Intent recognition failed:', error);
    return {
      primaryIntent: null,
      alternativeIntents: [],
      complexity: 'unknown',
      entities: {},
      sentiment: 'neutral'
    };
  }
}

// Enhance conversation context with advanced capabilities
async function enhanceConversationContext(conversationId, userMessage, conversationHistory, userContext, intentAnalysis) {
  try {
    // Build comprehensive conversation context
    const baseContext = conversationContextManager(conversationId, userMessage, conversationHistory, userContext);

    // Add intent analysis to context
    baseContext.currentIntent = intentAnalysis.primaryIntent;
    baseContext.alternativeIntents = intentAnalysis.alternativeIntents;
    baseContext.messageEntities = intentAnalysis.entities;
    baseContext.messageSentiment = intentAnalysis.sentiment;
    baseContext.messageComplexity = intentAnalysis.complexity;

    // Determine if a conversation flow should be active
    const flowAnalysis = determineConversationFlow(baseContext, userMessage);
    baseContext.activeFlow = flowAnalysis.activeFlow;
    baseContext.currentFlowStep = flowAnalysis.currentStep;

    return baseContext;
  } catch (error) {
    console.error('Context enhancement failed:', error);
    return buildFallbackContext(userContext);
  }
}

// Manage conversation flows for complex interactions
async function manageConversationFlow(conversationId, currentStep, userMessage, context) {
  try {
    return conversationFlowManager(conversationId, currentStep, userMessage, context);
  } catch (error) {
    console.error('Flow management failed:', error);
    return {
      flowActive: false,
      currentStep: null,
      response: null,
      flowCompleted: false
    };
  }
}

// Generate enhanced AI responses
async function generateEnhancedResponse(intentAnalysis, context, userMessage, flowResult) {
  try {
    // If flow is handling the response, use that
    if (flowResult && flowResult.flowActive && flowResult.response) {
      return {
        response: flowResult.response,
        confidence: 0.9,
        topics: ['conversation_flow'],
        suggestedActions: flowResult.suggestedActions || [],
        responseMetadata: {
          source: 'conversation_flow',
          flowStep: flowResult.currentStep,
          flowProgress: flowResult.progress
        }
      };
    }

    // Otherwise, use enhanced response generation
    return enhancedResponseGenerator(intentAnalysis, context, userMessage);
  } catch (error) {
    console.error('Enhanced response generation failed:', error);

    // Fallback to basic response
    const basicResponse = generateChatResponse(userMessage, [], context.userProfile);
    return {
      response: basicResponse.response,
      confidence: basicResponse.confidence || 0.7,
      topics: basicResponse.topics || ['general'],
      suggestedActions: basicResponse.suggestedActions || [],
      responseMetadata: {
        source: 'fallback_generation',
        error_occurred: true
      }
    };
  }
}

// Optimize responses using analytics and learning
async function optimizeResponse(responseResult, context, analyticsData) {
  try {
    return responseOptimizer(responseResult, context, analyticsData);
  } catch (error) {
    console.error('Response optimization failed:', error);
    return responseResult; // Return unoptimized response
  }
}

// Get analytics data for optimization
async function getAnalyticsData(userId, conversationId) {
  try {
    // In a real implementation, this would fetch from analytics database
    return {
      averageResponseLength: 300,
      userSentimentTrend: 'neutral',
      successfulResponsePatterns: {
        successfulPhrases: ['I understand', 'Let me help', 'Great question'],
        successfulStructures: ['greeting + information + action']
      },
      actionSuccessRates: {
        'get_quote': 0.8,
        'schedule_consultation': 0.7,
        'contact_support': 0.9
      },
      userTechnicalTermUsage: 0.2,
      recentBotResponses: []
    };
  } catch (error) {
    console.error('Analytics data fetch failed:', error);
    return {};
  }
}

// Perform asynchronous learning
async function performAsyncLearning(interactionData) {
  try {
    // Don't wait for learning completion
    setTimeout(() => {
      chatbotLearningEngine(
        interactionData.conversation_id,
        [interactionData],
        null
      );
    }, 100);
  } catch (error) {
    console.error('Async learning failed:', error);
    // Learning failure shouldn't affect user experience
  }
}

// Save enhanced interaction data
async function saveEnhancedInteraction(interactionData) {
  try {
    // Save message to database
    const messageData = saveMessage(
      interactionData.conversation_id,
      'user',
      interactionData.user_message,
      0,
      0
    );

    const responseData = saveMessage(
      interactionData.conversation_id,
      'bot',
      interactionData.response_data.response,
      interactionData.processing_time,
      interactionData.response_data.confidence
    );

    // Update analytics asynchronously
    setTimeout(() => {
      updateAnalytics({
        conversation_id: interactionData.conversation_id,
        user_id: interactionData.user_id,
        intent_recognized: interactionData.intent_analysis.primaryIntent?.name,
        confidence_score: interactionData.response_data.confidence,
        response_time: interactionData.processing_time,
        user_satisfaction: null // Will be updated when feedback is provided
      });
    }, 50);

    return { messageData, responseData };
  } catch (error) {
    console.error('Failed to save interaction:', error);
    // Don't fail the response if saving fails
    return null;
  }
}

// Generate quick replies based on context
function generateQuickReplies(intentAnalysis, context) {
  const quickReplies = [];

  // Add contextual quick replies based on intent
  if (intentAnalysis.primaryIntent) {
    switch (intentAnalysis.primaryIntent.name) {
      case 'project_quote':
        quickReplies.push('Schedule site visit', 'Upload project photos', 'Discuss timeline');
        break;
      case 'services_overview':
        quickReplies.push('Residential services', 'Commercial services', 'Get quote');
        break;
      case 'contact_info':
        quickReplies.push('Schedule callback', 'Send location', 'Emergency contact');
        break;
    }
  }

  // Add general helpful replies
  if (quickReplies.length < 3) {
    quickReplies.push('Get quote', 'Schedule consultation', 'View services');
  }

  // Add urgency-based replies
  if (context.urgencyLevel?.level === 'high' || context.urgencyLevel?.level === 'critical') {
    quickReplies.unshift('Emergency help', 'Immediate assistance');
  }

  return quickReplies.slice(0, 4); // Limit to 4 quick replies
}

// Generate smart suggestions based on context and response
function generateSmartSuggestions(responseData, context) {
  const suggestions = [];

  // Add suggestions based on response content
  if (responseData.response.includes('quote') || responseData.response.includes('estimate')) {
    suggestions.push({
      text: 'Get detailed project estimate',
      action: 'get_quote',
      priority: 'high'
    });
  }

  if (responseData.response.includes('consultation') || responseData.response.includes('meeting')) {
    suggestions.push({
      text: 'Schedule consultation',
      action: 'schedule_consultation',
      priority: 'high'
    });
  }

  // Add user-specific suggestions
  if (context.userProfile.userRole === 'Administrator') {
    suggestions.push({
      text: 'Access admin dashboard',
      action: 'admin_dashboard',
      priority: 'medium'
    });
  }

  // Add contextual suggestions based on conversation history
  if (context.longTermMemory.primaryInterests.includes('residential')) {
    suggestions.push({
      text: 'Explore residential services',
      action: 'residential_services',
      priority: 'medium'
    });
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Generate fallback response when main system fails
async function generateFallbackResponse(userMessage, conversationId, userId, userContext) {
  try {
    const basicResponse = generateChatResponse(userMessage, [], userContext);

    return {
      success: true,
      response: basicResponse.response,
      confidence: basicResponse.confidence || 0.5,
      topics: basicResponse.topics || ['general'],
      suggestedActions: basicResponse.suggestedActions || ['contact_support'],
      metadata: {
        fallback_used: true,
        processing_time: 0,
        intent_recognized: 'unknown',
        intent_confidence: 0,
        context_enhanced: false,
        optimized: false,
        learning_enabled: false
      },
      conversationFlow: null,
      quickReplies: ['Get help', 'Contact support', 'Try again'],
      smartSuggestions: [
      {
        text: 'Speak to a specialist',
        action: 'contact_support',
        priority: 'high'
      }]

    };
  } catch (error) {
    console.error('Fallback response generation failed:', error);

    return {
      success: false,
      response: "I apologize, but I'm experiencing technical difficulties. Please contact our support team at (555) 123-4567 for immediate assistance.",
      confidence: 0.1,
      topics: ['error'],
      suggestedActions: ['contact_support'],
      metadata: {
        error_occurred: true,
        fallback_failed: true
      }
    };
  }
}

// Helper functions
async function fetchConversationHistory(conversationId) {
  // In a real implementation, this would fetch from database
  // For now, return empty array
  return [];
}

async function buildConversationContext(conversationId, history, userContext) {
  return conversationContextManager(conversationId, '', history, userContext);
}

function buildFallbackContext(userContext) {
  return {
    sessionId: 'fallback_session',
    turnIndex: 0,
    currentTopic: 'general',
    userProfile: {
      userId: userContext.userId || 'anonymous',
      userName: userContext.userName || 'there',
      userRole: userContext.userRole || 'user',
      preferences: {},
      previousInteractions: []
    },
    shortTermMemory: {
      recentTopics: [],
      recentIntents: [],
      conversationTone: 'neutral'
    },
    longTermMemory: {
      primaryInterests: [],
      projectDetails: {}
    },
    urgencyLevel: {
      level: 'normal',
      score: 0
    }
  };
}

function determineConversationFlow(context, userMessage) {
  // Simple flow determination logic
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
    return {
      activeFlow: 'emergency_assessment',
      currentStep: 'urgency_level'
    };
  }

  if (lowerMessage.includes('quote') || lowerMessage.includes('estimate')) {
    return {
      activeFlow: 'quote_collection',
      currentStep: 'project_type'
    };
  }

  return {
    activeFlow: null,
    currentStep: null
  };
}

function updateAnalytics(analyticsData) {
  // This would update the analytics database
  console.log('Analytics updated:', analyticsData);
}