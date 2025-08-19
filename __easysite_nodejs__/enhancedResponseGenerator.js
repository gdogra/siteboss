
// Enhanced AI response generation with sophisticated prompting and reasoning
function enhancedResponseGenerator(analysisResult, conversationContext, userMessage) {
  const {
    primaryIntent,
    alternativeIntents,
    entities,
    sentiment,
    complexity
  } = analysisResult;
  
  const {
    shortTermMemory,
    longTermMemory,
    userProfile,
    projectContext,
    urgencyLevel,
    conversationFlow
  } = conversationContext;
  
  try {
    // Generate context-aware response based on intent and conversation state
    let response = '';
    let confidence = 0;
    let suggestedActions = [];
    let topics = [];
    
    if (primaryIntent) {
      const intentResponse = generateIntentBasedResponse(
        primaryIntent,
        entities,
        conversationContext,
        userMessage
      );
      
      response = intentResponse.response;
      confidence = intentResponse.confidence;
      suggestedActions = intentResponse.suggestedActions;
      topics = intentResponse.topics;
    } else {
      // Fallback to contextual response
      const fallbackResponse = generateContextualFallback(
        userMessage,
        conversationContext
      );
      
      response = fallbackResponse.response;
      confidence = fallbackResponse.confidence;
      suggestedActions = fallbackResponse.suggestedActions;
      topics = fallbackResponse.topics;
    }
    
    // Apply conversation flow enhancements
    const enhancedResponse = applyConversationFlowEnhancements(
      response,
      conversationFlow,
      conversationContext
    );
    
    // Add personality and tone adjustments
    const personalizedResponse = applyPersonalization(
      enhancedResponse,
      userProfile,
      sentiment,
      urgencyLevel
    );
    
    // Generate smart suggestions based on context
    const contextualSuggestions = generateContextualSuggestions(
      primaryIntent,
      conversationContext,
      entities
    );
    
    return {
      response: personalizedResponse,
      confidence: confidence,
      topics: topics,
      suggestedActions: [...suggestedActions, ...contextualSuggestions],
      responseMetadata: {
        intentRecognized: primaryIntent?.name || 'unknown',
        intentConfidence: primaryIntent?.confidence || 0,
        conversationTurn: conversationContext.turnIndex + 1,
        responseComplexity: complexity,
        contextUtilized: true,
        personalizedResponse: true
      }
    };
    
  } catch (error) {
    return generateErrorResponse(userMessage, conversationContext);
  }
}

// Generate intent-based responses with construction business knowledge
function generateIntentBasedResponse(intent, entities, context, userMessage) {
  const { userName, userRole } = context.userProfile;
  const projectDetails = context.longTermMemory.projectDetails;
  
  const responses = {
    'project_quote': () => ({
      response: `I'd be happy to help you get a detailed quote, ${userName}! ${
        projectDetails.type ? `I see you're interested in ${projectDetails.type} work. ` : ''
      }For the most accurate estimate, I'll need to gather some project details:\n\n🏗️ **Project Type**: ${
        entities.projectType || projectDetails.type || 'What type of construction project?'
      }\n📏 **Project Scope**: ${
        entities.scope || 'What specific work needs to be done?'
      }\n📍 **Location**: Property address for site assessment\n💰 **Budget Range**: ${
        entities.budget || context.longTermMemory.budgetRange || 'Approximate budget range'
      }\n⏰ **Timeline**: ${
        entities.timeline || context.longTermMemory.timelinePreference || 'When do you need this completed?'
      }\n\nAs a ${userRole}, you have access to our premium estimation service with detailed breakdowns and 3D visualizations. Would you like me to connect you with our senior estimator for a comprehensive consultation?`,
      confidence: 0.95,
      topics: ['quote', 'estimation', 'consultation'],
      suggestedActions: ['schedule_estimation_meeting', 'upload_project_photos', 'request_site_visit', 'view_sample_estimates']
    }),
    
    'project_timeline': () => ({
      response: `Great question about project timelines, ${userName}! Based on ${
        projectDetails.type ? `your ${projectDetails.type} project` : 'the type of work you're considering'
      }, here's what you can typically expect:\n\n${generateTimelineEstimate(entities, projectDetails)}\n\n**Factors affecting your timeline:**\n• Permit processing (${
        context.userProfile.userRole === 'Administrator' ? '1-3 weeks with expedited service' : '2-6 weeks'
      })\n• Weather conditions and season\n• Material availability and delivery\n• Project complexity and change orders\n• Inspection schedules\n\n${
        context.urgencyLevel.level === 'critical' 
          ? '⚡ **Expedited Service Available**: Given your urgent timeline, we offer emergency and rush project services with premium scheduling.'
          : context.urgencyLevel.level === 'high'
          ? '🚀 **Priority Scheduling**: We can discuss priority scheduling options for your timeline needs.'
          : ''
      }\n\nWould you like a personalized timeline estimate for your specific project?`,
      confidence: 0.92,
      topics: ['timeline', 'scheduling', 'planning'],
      suggestedActions: ['get_detailed_timeline', 'schedule_planning_meeting', 'view_project_phases', 'expedited_service_info']
    }),
    
    'emergency_service': () => ({
      response: `🚨 **Emergency Response Activated**, ${userName}!\n\nI understand this is an urgent situation requiring immediate attention. Our emergency response team is available 24/7 for critical construction issues.\n\n**Immediate Actions:**\n• 📞 **Emergency Hotline**: (555) 123-4567 (call now)\n• ⏰ **Response Time**: Emergency team dispatched within 2 hours\n• 🚨 **Current Status**: ${
        context.userProfile.userRole === 'Administrator' ? 'PRIORITY CLIENT - Immediate dispatch authorized' : 'Standard emergency response protocol'
      }\n\n**Emergency Services Include:**\n• Structural damage assessment and stabilization\n• Water damage mitigation and emergency repairs\n• Electrical hazard resolution\n• Safety hazard containment\n• Temporary protection and boarding\n\n${
        entities.urgency === 'emergency' 
          ? '**CRITICAL**: Connecting you directly to our emergency dispatcher now. Please stay on the line.'
          : '**URGENT**: Should I initiate immediate emergency dispatch to your location?'
      }\n\nFor your safety, please avoid the affected area until our team arrives.`,
      confidence: 0.99,
      topics: ['emergency', 'urgent_service', 'immediate_help'],
      suggestedActions: ['call_emergency_line', 'dispatch_emergency_team', 'safety_instructions', 'emergency_checklist']
    }),
    
    'services_overview': () => ({
      response: `Welcome to Laguna Bay Development's comprehensive construction services, ${userName}! ${
        context.longTermMemory.primaryInterests.length > 0 
          ? `Based on your interest in ${context.longTermMemory.primaryInterests.join(', ')}, here's what we offer:` 
          : 'Here\'s our full range of professional construction services:'
      }\n\n🏗️ **Construction Services:**\n${generateServicesList(context.longTermMemory.primaryInterests)}\n\n${
        context.userProfile.userRole === 'Administrator' 
          ? '👑 **Premium Services for Administrators:**\n• Priority project scheduling\n• Dedicated project management\n• Advanced reporting and analytics\n• Custom pricing and terms\n\n'
          : ''
      }**Why Choose Laguna Bay Development:**\n• 15\u002B years of construction excellence\n• Licensed, bonded, and fully insured\n• A\u002B Better Business Bureau rating\n• Comprehensive warranty on all work\n• Local team with deep community knowledge\n\n${
        context.conversationFlow === 'quote_request' 
          ? 'I notice you\'re interested in getting a quote. Which of our services best matches your project needs?'
          : 'Which service area would you like to learn more about?'
      }`,
      confidence: 0.94,
      topics: ['services', 'capabilities', 'construction'],
      suggestedActions: ['explore_residential', 'explore_commercial', 'view_portfolio', 'get_service_quote']
    }),
    
    'contact_info': () => ({
      response: `Here's how to reach our team, ${userName}:\n\n📞 **Phone**: (555) 123-4567\n${
        context.urgencyLevel.level === 'critical' ? '🚨 **Emergency Line**: (555) 911-HELP (available 24/7)\n' : ''
      }📧 **Email**: ${
        context.userProfile.userRole === 'Administrator' ? 'admin@lagunabaydev.com (priority support)' : 'info@lagunabaydev.com'
      }\n📍 **Office**: 123 Construction Way, Laguna Bay, CA 90210\n🕒 **Business Hours**: Monday-Friday 8AM-6PM, Saturday 9AM-2PM\n\n${
        context.userProfile.userRole === 'Administrator'
          ? '👑 **VIP Support**: As an Administrator, you have access to our direct priority line and dedicated account manager.\n'
          : ''
      }**Preferred Contact Method:**\n${generateContactPreferences(context)}\n\n${
        context.longTermMemory.projectDetails.type
          ? `For your ${context.longTermMemory.projectDetails.type} project, I recommend speaking with our specialized team. `
          : ''
      }Would you like me to schedule a call back or connect you with a specific team member?`,
      confidence: 0.96,
      topics: ['contact', 'communication', 'support'],
      suggestedActions: ['schedule_callback', 'send_contact_info', 'map_location', 'priority_support']
    }),
    
    'credentials_inquiry': () => ({
      response: `Absolutely, ${userName}! Professional credentials and trust are fundamental to our service. Here's our complete qualification profile:\n\n✅ **Licensed Professional**\n• California Contractors License #C-123456\n• Specialty licenses for electrical, plumbing, HVAC\n• Current and in good standing\n\n🛡️ **Insurance \u0026 Bonding**\n• $2M General Liability Insurance\n• Workers' Compensation (fully covered)\n• Professional Indemnity Insurance\n• Performance and Payment Bonds available\n\n🏆 **Certifications \u0026 Memberships**\n• OSHA 30-Hour Construction Safety Certified\n• EPA Lead-Safe Certified\n• Better Business Bureau (A\u002B Rating)\n• Associated General Contractors (AGC) member\n• Local Chamber of Commerce member\n\n📋 **Quality Assurance**\n• All work backed by comprehensive warranty\n• Regular third-party inspections\n• Continuous education and training programs\n• Updated safety protocols and procedures\n\n${
        context.userProfile.userRole === 'Administrator'
          ? '**Administrative Access**: You can view all our current certificates and insurance documents in your admin portal.\n'
          : ''
      }Would you like copies of any specific credentials or certificates for your records?`,
      confidence: 0.98,
      topics: ['credentials', 'licensing', 'insurance', 'trust'],
      suggestedActions: ['view_certificates', 'insurance_verification', 'check_license_status', 'testimonials']
    }),
    
    'greeting': () => ({
      response: `${generatePersonalizedGreeting(userName, context)}!\n\n${
        context.longTermMemory.primaryInterests.length > 0
          ? `Welcome back! I remember you were interested in ${context.longTermMemory.primaryInterests[0]} services. `
          : ''
      }I'm your AI construction assistant, here to help with:\n\n• Project quotes and estimates\n• Service information and capabilities\n• Scheduling consultations and site visits\n• Emergency construction support\n• Materials and timeline planning\n\n${
        context.userProfile.userRole === 'Administrator'
          ? '👑 **Admin Access**: You have full access to all premium features and priority support.\n'
          : ''
      }${
        context.urgencyLevel.level !== 'normal'
          ? '⚡ I notice this might be time-sensitive. How can I help you today?'
          : 'What construction project can I help you with today?'
      }`,
      confidence: 0.88,
      topics: ['greeting', 'welcome', 'assistance'],
      suggestedActions: ['get_quote', 'view_services', 'emergency_help', 'schedule_consultation']
    })
  };
  
  const responseGenerator = responses[intent.name];
  if (responseGenerator) {
    return responseGenerator();
  }
  
  // Default intent response
  return {
    response: `I understand you're asking about ${intent.name.replace('_', ' ')}, ${userName}. Let me provide you with the most relevant information for your construction needs.`,
    confidence: 0.7,
    topics: [intent.name],
    suggestedActions: ['get_more_info', 'speak_to_specialist', 'schedule_consultation']
  };
}

// Generate contextual fallback response
function generateContextualFallback(userMessage, context) {
  const { userName, userRole } = context.userProfile;
  const recentTopics = context.shortTermMemory.recentTopics;
  
  let fallbackResponse = `I want to make sure I understand your question correctly, ${userName}. `;
  
  if (recentTopics.length > 0) {
    fallbackResponse += `I see we've been discussing ${recentTopics[recentTopics.length - 1]}. `;
  }
  
  if (context.longTermMemory.projectDetails.type) {
    fallbackResponse += `For your ${context.longTermMemory.projectDetails.type} project, `;
  }
  
  fallbackResponse += `let me connect you with the right specialist who can provide detailed guidance.\n\n`;
  fallbackResponse += `**How I can help you:**\n`;
  fallbackResponse += `• Get specific project information\n`;
  fallbackResponse += `• Schedule a consultation with our experts\n`;
  fallbackResponse += `• Provide detailed service explanations\n`;
  fallbackResponse += `• Connect you with the right team member\n\n`;
  fallbackResponse += `Could you tell me more about what you're looking for, or would you prefer to speak directly with one of our construction specialists?`;
  
  return {
    response: fallbackResponse,
    confidence: 0.75,
    topics: ['assistance', 'clarification'],
    suggestedActions: ['clarify_question', 'speak_to_specialist', 'get_more_info', 'schedule_consultation']
  };
}

// Apply conversation flow enhancements
function applyConversationFlowEnhancements(response, flow, context) {
  const flowEnhancements = {
    'quote_request': (resp) => {
      if (!resp.includes('estimate') && !resp.includes('quote')) {
        return resp + '\n\n💡 **Next Steps**: Ready to get your personalized project estimate?';
      }
      return resp;
    },
    'emergency_support': (resp) => {
      if (!resp.includes('emergency')) {
        return '🚨 **Priority Response**: ' + resp;
      }
      return resp;
    },
    'detailed_consultation': (resp) => {
      return resp + '\n\n📅 **Consultation Available**: Our experts are ready to provide detailed project planning.';
    }
  };
  
  const enhancer = flowEnhancements[flow];
  return enhancer ? enhancer(response) : response;
}

// Apply personalization based on user profile and context
function applyPersonalization(response, userProfile, sentiment, urgencyLevel) {
  let personalizedResponse = response;
  
  // Urgency-based adjustments
  if (urgencyLevel.level === 'critical') {
    personalizedResponse = '🚨 **URGENT** ' + personalizedResponse;
  } else if (urgencyLevel.level === 'high') {
    personalizedResponse = '⚡ **Priority** ' + personalizedResponse;
  }
  
  // Sentiment-based adjustments
  if (sentiment === 'negative') {
    personalizedResponse = personalizedResponse.replace(/Great question/, 'I understand your concern');
    personalizedResponse = personalizedResponse.replace(/I'd be happy/, 'I want to help resolve this');
  }
  
  // Role-based personalization
  if (userProfile.userRole === 'Administrator') {
    personalizedResponse = personalizedResponse.replace(/our team/, 'your dedicated team');
  }
  
  return personalizedResponse;
}

// Generate contextual suggestions
function generateContextualSuggestions(intent, context, entities) {
  const suggestions = [];
  
  if (intent?.name === 'project_quote') {
    suggestions.push('upload_project_photos', 'schedule_site_visit', 'material_preferences');
  }
  
  if (context.urgencyLevel.level !== 'normal') {
    suggestions.push('emergency_contact', 'priority_scheduling');
  }
  
  if (entities.projectType) {
    suggestions.push(`${entities.projectType}_specialists`, `${entities.projectType}_portfolio`);
  }
  
  if (context.longTermMemory.budgetRange) {
    suggestions.push('financing_options', 'payment_plans');
  }
  
  return suggestions;
}

// Helper functions
function generateTimelineEstimate(entities, projectDetails) {
  const timelineMap = {
    'kitchen': '3-6 weeks for complete kitchen renovation',
    'bathroom': '2-4 weeks for full bathroom remodel',
    'addition': '8-16 weeks depending on size and complexity',
    'roof': '1-2 weeks for standard residential roof replacement',
    'deck': '1-2 weeks for standard deck construction'
  };
  
  const projectType = entities.projectType || projectDetails.type;
  return timelineMap[projectType] || '2-12 weeks depending on project scope and complexity';
}

function generateServicesList(interests) {
  const allServices = [
    '• **Residential Construction** - Custom homes, additions, renovations',
    '• **Commercial Construction** - Office buildings, retail spaces',
    '• **Kitchen \u0026 Bath Remodeling** - Complete renovations and updates',
    '• **Roofing Services** - Replacement, repair, and maintenance',
    '• **Electrical \u0026 Plumbing** - Licensed specialists available',
    '• **Flooring Installation** - All materials and finishes',
    '• **Painting \u0026 Finishing** - Interior and exterior services'
  ];
  
  if (interests.includes('residential')) {
    return allServices.slice(0, 3).concat(allServices.slice(3)).join('\n');
  }
  
  return allServices.join('\n');
}

function generateContactPreferences(context) {
  const prefs = [];
  if (context.urgencyLevel.level === 'critical') {
    prefs.push('📞 **Immediate Phone Call** (recommended for urgent matters)');
  }
  prefs.push('📧 **Email** for detailed project information');
  prefs.push('💬 **Text Message** for quick updates');
  prefs.push('🏢 **In-Person Meeting** at our office or your location');
  
  return prefs.join('\n• ');
}

function generatePersonalizedGreeting(userName, context) {
  const greetings = ['Hello', 'Hi', 'Welcome'];
  const timeOfDay = new Date().getHours();
  
  if (timeOfDay < 12) {
    greetings.push('Good morning');
  } else if (timeOfDay < 18) {
    greetings.push('Good afternoon');
  } else {
    greetings.push('Good evening');
  }
  
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  if (context.turnIndex > 0) {
    return `${greeting} again, ${userName}`;
  }
  
  return `${greeting}, ${userName}`;
}

// Generate error response
function generateErrorResponse(userMessage, context) {
  return {
    response: `I apologize, ${context.userProfile.userName || 'there'}. I'm experiencing some technical difficulties right now. For immediate assistance with your construction needs, please contact our support team directly at (555) 123-4567. They'll be happy to help you with your project questions and requirements.`,
    confidence: 0.1,
    topics: ['error', 'support'],
    suggestedActions: ['contact_support', 'try_again', 'call_direct']
  };
}
