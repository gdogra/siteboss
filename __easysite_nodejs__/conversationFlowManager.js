
// Advanced conversation flow management for complex multi-step interactions
function conversationFlowManager(conversationId, currentStep, userInput, conversationContext) {
  // Define conversation flows for different business scenarios
  const conversationFlows = {
    'quote_collection': {
      steps: [
      {
        id: 'project_type',
        question: 'What type of construction project are you planning?',
        type: 'selection',
        options: ['Kitchen Renovation', 'Bathroom Remodel', 'Home Addition', 'New Construction', 'Commercial Project', 'Other'],
        validation: (input) => input && input.length > 0,
        nextStep: (input) => {
          if (input.toLowerCase().includes('emergency') || input.toLowerCase().includes('repair')) {
            return 'urgency_assessment';
          }
          return 'location_details';
        }
      },
      {
        id: 'location_details',
        question: 'Where is your project located? (City, State or ZIP code)',
        type: 'text',
        validation: (input) => input && input.length > 5,
        nextStep: () => 'project_scope'
      },
      {
        id: 'project_scope',
        question: 'Could you describe the scope of work? What specific areas or features are you looking to address?',
        type: 'textarea',
        validation: (input) => input && input.length > 10,
        nextStep: (input, context) => {
          if (context.longTermMemory.budgetRange) {
            return 'timeline_preference';
          }
          return 'budget_range';
        }
      },
      {
        id: 'budget_range',
        question: 'What\'s your approximate budget range for this project?',
        type: 'selection',
        options: ['Under $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '$100,000+', 'I need guidance on budgeting'],
        validation: (input) => input && input.length > 0,
        nextStep: () => 'timeline_preference'
      },
      {
        id: 'timeline_preference',
        question: 'When would you ideally like to start this project?',
        type: 'selection',
        options: ['As soon as possible', 'Within 1 month', '2-3 months', '4-6 months', 'More than 6 months', 'Flexible timing'],
        validation: (input) => input && input.length > 0,
        nextStep: () => 'contact_preferences'
      },
      {
        id: 'contact_preferences',
        question: 'How would you prefer to receive your detailed estimate and discuss next steps?',
        type: 'selection',
        options: ['Phone call', 'Email with detailed breakdown', 'In-person consultation', 'Video call consultation'],
        validation: (input) => input && input.length > 0,
        nextStep: () => 'quote_summary'
      },
      {
        id: 'quote_summary',
        question: null, // This is a summary step, not a question
        type: 'summary',
        nextStep: () => 'completion'
      },
      {
        id: 'completion',
        question: null,
        type: 'completion',
        nextStep: () => null
      }],

      context: {
        flowType: 'quote_collection',
        purpose: 'Collect comprehensive project information for accurate quoting'
      }
    },

    'emergency_assessment': {
      steps: [
      {
        id: 'urgency_level',
        question: 'How urgent is this situation? Please select the level that best describes your needs:',
        type: 'selection',
        options: ['Life-threatening emergency (call 911 first)', 'Immediate safety hazard', 'Property damage requiring immediate attention', 'Urgent repair needed within 24 hours', 'Needs attention within a few days'],
        validation: (input) => input && input.length > 0,
        nextStep: (input) => {
          if (input.includes('Life-threatening') || input.includes('safety hazard')) {
            return 'safety_first';
          }
          return 'damage_assessment';
        }
      },
      {
        id: 'safety_first',
        question: null,
        type: 'safety_message',
        nextStep: () => 'damage_assessment'
      },
      {
        id: 'damage_assessment',
        question: 'Please describe the damage or issue you\'re experiencing:',
        type: 'textarea',
        validation: (input) => input && input.length > 10,
        nextStep: () => 'location_access'
      },
      {
        id: 'location_access',
        question: 'What\'s the property address, and will our emergency team have access?',
        type: 'text',
        validation: (input) => input && input.length > 10,
        nextStep: () => 'contact_immediate'
      },
      {
        id: 'contact_immediate',
        question: 'What\'s the best phone number to reach you immediately for our emergency response team?',
        type: 'phone',
        validation: (input) => /^\(?[\d\s\-\(\)]{10,}$/.test(input),
        nextStep: () => 'emergency_dispatch'
      },
      {
        id: 'emergency_dispatch',
        question: null,
        type: 'dispatch',
        nextStep: () => 'completion'
      },
      {
        id: 'completion',
        question: null,
        type: 'completion',
        nextStep: () => null
      }],

      context: {
        flowType: 'emergency_assessment',
        purpose: 'Assess and respond to emergency construction situations'
      }
    },

    'consultation_scheduling': {
      steps: [
      {
        id: 'consultation_type',
        question: 'What type of consultation would work best for you?',
        type: 'selection',
        options: ['Initial project discussion (30 min)', 'Detailed design consultation (1 hour)', 'Site visit and assessment', 'Virtual consultation via video call', 'Phone consultation'],
        validation: (input) => input && input.length > 0,
        nextStep: () => 'preferred_timing'
      },
      {
        id: 'preferred_timing',
        question: 'When would you prefer to schedule this consultation?',
        type: 'selection',
        options: ['This week', 'Next week', 'Within 2 weeks', 'Flexible - you choose the best time', 'Evenings or weekends preferred'],
        validation: (input) => input && input.length > 0,
        nextStep: () => 'contact_details'
      },
      {
        id: 'contact_details',
        question: 'Please provide your contact information for scheduling:',
        type: 'contact_form',
        validation: (input) => input.email && input.phone,
        nextStep: () => 'consultation_prep'
      },
      {
        id: 'consultation_prep',
        question: 'Is there anything specific you\'d like our team to prepare for the consultation?',
        type: 'textarea',
        validation: () => true, // Optional field
        nextStep: () => 'scheduling_confirmation'
      },
      {
        id: 'scheduling_confirmation',
        question: null,
        type: 'confirmation',
        nextStep: () => 'completion'
      },
      {
        id: 'completion',
        question: null,
        type: 'completion',
        nextStep: () => null
      }],

      context: {
        flowType: 'consultation_scheduling',
        purpose: 'Schedule and prepare for project consultations'
      }
    },

    'project_planning': {
      steps: [
      {
        id: 'project_goals',
        question: 'What are your main goals for this construction project?',
        type: 'textarea',
        validation: (input) => input && input.length > 20,
        nextStep: () => 'space_requirements'
      },
      {
        id: 'space_requirements',
        question: 'Tell me about your space requirements and how you plan to use the area:',
        type: 'textarea',
        validation: (input) => input && input.length > 15,
        nextStep: () => 'design_preferences'
      },
      {
        id: 'design_preferences',
        question: 'Do you have any specific design preferences, styles, or inspiration?',
        type: 'textarea',
        validation: () => true,
        nextStep: () => 'material_preferences'
      },
      {
        id: 'material_preferences',
        question: 'Are there specific materials or finishes you prefer or want to avoid?',
        type: 'textarea',
        validation: () => true,
        nextStep: () => 'sustainability_concerns'
      },
      {
        id: 'sustainability_concerns',
        question: 'Are sustainability and eco-friendly materials important to you?',
        type: 'selection',
        options: ['Very important - please prioritize green materials', 'Somewhat important - consider when cost-effective', 'Not a primary concern', 'I need more information about sustainable options'],
        validation: (input) => input && input.length > 0,
        nextStep: () => 'planning_summary'
      },
      {
        id: 'planning_summary',
        question: null,
        type: 'summary',
        nextStep: () => 'next_steps'
      },
      {
        id: 'next_steps',
        question: null,
        type: 'planning_completion',
        nextStep: () => 'completion'
      },
      {
        id: 'completion',
        question: null,
        type: 'completion',
        nextStep: () => null
      }],

      context: {
        flowType: 'project_planning',
        purpose: 'Comprehensive project planning and requirements gathering'
      }
    }
  };

  // Determine which flow to use based on conversation context
  let activeFlow = determineActiveFlow(conversationContext, userInput);

  if (!activeFlow) {
    return {
      flowActive: false,
      currentStep: null,
      response: generateFlowInitiationResponse(conversationContext),
      suggestedFlows: suggestAppropriateFlows(conversationContext)
    };
  }

  // Get the current step in the active flow
  const flow = conversationFlows[activeFlow];
  const stepIndex = flow.steps.findIndex((step) => step.id === currentStep);
  const step = flow.steps[stepIndex];

  if (!step) {
    // Flow completed or invalid step
    return {
      flowActive: false,
      flowCompleted: true,
      response: generateFlowCompletionResponse(activeFlow, conversationContext)
    };
  }

  // Process the current step
  return processFlowStep(step, userInput, conversationContext, flow, stepIndex);
}

// Determine which conversation flow should be active
function determineActiveFlow(context, userInput) {
  const { primaryIntent } = context.shortTermMemory.recentIntents?.[0] || {};
  const urgencyLevel = context.urgencyLevel.level;

  // Emergency situations take priority
  if (urgencyLevel === 'critical' || userInput.toLowerCase().includes('emergency')) {
    return 'emergency_assessment';
  }

  // Intent-based flow selection
  if (primaryIntent === 'project_quote' || userInput.toLowerCase().includes('quote') || userInput.toLowerCase().includes('estimate')) {
    return 'quote_collection';
  }

  if (primaryIntent === 'project_consultation' || userInput.toLowerCase().includes('consultation') || userInput.toLowerCase().includes('meeting')) {
    return 'consultation_scheduling';
  }

  if (userInput.toLowerCase().includes('planning') || userInput.toLowerCase().includes('design') || userInput.toLowerCase().includes('requirements')) {
    return 'project_planning';
  }

  // Check conversation history for flow indicators
  const recentTopics = context.shortTermMemory.recentTopics;
  if (recentTopics.includes('quote') && !recentTopics.includes('completed')) {
    return 'quote_collection';
  }

  return null;
}

// Process a specific step in the conversation flow
function processFlowStep(step, userInput, context, flow, stepIndex) {
  const { userName } = context.userProfile;

  // Handle different step types
  switch (step.type) {
    case 'selection':
      return processSelectionStep(step, userInput, context, flow, stepIndex);

    case 'text':
    case 'textarea':
      return processTextStep(step, userInput, context, flow, stepIndex);

    case 'contact_form':
      return processContactFormStep(step, userInput, context, flow, stepIndex);

    case 'phone':
      return processPhoneStep(step, userInput, context, flow, stepIndex);

    case 'summary':
      return generateSummaryStep(context, flow);

    case 'completion':
      return generateCompletionStep(flow, context);

    case 'safety_message':
      return generateSafetyMessage(context);

    case 'dispatch':
      return generateEmergencyDispatch(context);

    case 'confirmation':
      return generateConfirmationStep(context, flow);

    default:
      return processDefaultStep(step, userInput, context, flow, stepIndex);
  }
}

// Process selection-based steps
function processSelectionStep(step, userInput, context, flow, stepIndex) {
  const { userName } = context.userProfile;

  if (step.validation(userInput)) {
    // Valid selection, move to next step
    const nextStepId = typeof step.nextStep === 'function' ?
    step.nextStep(userInput, context) : step.nextStep;

    const nextStep = flow.steps.find((s) => s.id === nextStepId);

    // Store the answer
    const flowData = context.flowData || {};
    flowData[step.id] = userInput;

    if (nextStep) {
      return {
        flowActive: true,
        currentStep: nextStepId,
        response: `Thank you, ${userName}! ${generateStepAcknowledgment(step.id, userInput)}\n\n${generateStepQuestion(nextStep)}`,
        flowData: flowData,
        progress: `Step ${stepIndex + 2} of ${flow.steps.length - 1}` // Exclude completion step
      };
    } else {
      return {
        flowActive: false,
        flowCompleted: true,
        flowData: flowData,
        response: generateFlowCompletionResponse(flow.context.flowType, context)
      };
    }
  } else {
    // Invalid selection, ask again with options
    return {
      flowActive: true,
      currentStep: step.id,
      response: `I'd like to help you with that, ${userName}. Please choose one of the following options:\n\n${step.options.map((option, index) => `${index + 1}. ${option}`).join('\n')}\n\nYou can respond with the number or type your choice.`,
      requiresInput: true
    };
  }
}

// Process text input steps
function processTextStep(step, userInput, context, flow, stepIndex) {
  const { userName } = context.userProfile;

  if (step.validation(userInput)) {
    const nextStepId = typeof step.nextStep === 'function' ?
    step.nextStep(userInput, context) : step.nextStep;

    const nextStep = flow.steps.find((s) => s.id === nextStepId);

    const flowData = context.flowData || {};
    flowData[step.id] = userInput;

    if (nextStep) {
      return {
        flowActive: true,
        currentStep: nextStepId,
        response: `Perfect, ${userName}! I've noted that information.\n\n${generateStepQuestion(nextStep)}`,
        flowData: flowData,
        progress: `Step ${stepIndex + 2} of ${flow.steps.length - 1}`
      };
    } else {
      return {
        flowActive: false,
        flowCompleted: true,
        flowData: flowData,
        response: generateFlowCompletionResponse(flow.context.flowType, context)
      };
    }
  } else {
    return {
      flowActive: true,
      currentStep: step.id,
      response: `I'd like to get a bit more detail, ${userName}. ${step.question}\n\nPlease provide some additional information to help me assist you better.`,
      requiresInput: true
    };
  }
}

// Generate step questions
function generateStepQuestion(step) {
  if (!step.question) return '';

  let questionText = step.question;

  if (step.type === 'selection' && step.options) {
    questionText += '\n\n' + step.options.map((option, index) => `${index + 1}. ${option}`).join('\n');
    questionText += '\n\nYou can respond with the number or type your choice.';
  }

  return questionText;
}

// Generate step acknowledgments
function generateStepAcknowledgment(stepId, input) {
  const acknowledgments = {
    'project_type': `I understand you're planning ${input.toLowerCase()}.`,
    'location_details': 'I\'ve noted the project location.',
    'project_scope': 'That gives me a good understanding of your project scope.',
    'budget_range': 'I\'ve recorded your budget range.',
    'timeline_preference': 'I\'ve noted your timeline preference.',
    'urgency_level': 'I understand the urgency level.',
    'consultation_type': 'That consultation type sounds perfect.',
    'preferred_timing': 'I\'ve noted your scheduling preference.'
  };

  return acknowledgments[stepId] || 'I\'ve recorded that information.';
}

// Generate flow completion responses
function generateFlowCompletionResponse(flowType, context) {
  const { userName } = context.userProfile;

  const completionResponses = {
    'quote_collection': `Excellent, ${userName}! I have all the information needed for your project quote.\n\n**Next Steps:**\n• Our estimating team will review your requirements\n• You'll receive a detailed quote within 2-3 business days\n• A project specialist will contact you to discuss details\n• We'll schedule a site visit if needed\n\nThank you for choosing Laguna Bay Development! Is there anything else I can help you with today?`,

    'emergency_assessment': `Your emergency response request has been processed, ${userName}.\n\n**Emergency Response Activated:**\n• Our emergency team has been dispatched\n• You should receive a call within 15 minutes\n• Team arrival estimated within 2 hours\n• Emergency contact number: (555) 123-4567\n\nPlease keep your phone available for our emergency coordinator. Stay safe!`,

    'consultation_scheduling': `Perfect, ${userName}! Your consultation has been requested.\n\n**What Happens Next:**\n• Our scheduling team will contact you within 4 hours\n• We'll confirm your preferred time and format\n• You'll receive a calendar invitation with details\n• Preparation materials will be sent if needed\n\nLooking forward to discussing your project in detail!`,

    'project_planning': `Thank you for the detailed project information, ${userName}!\n\n**Your Project Planning Session:**\n• Our design team will review your requirements\n• We'll prepare initial concepts and suggestions\n• A senior project manager will be assigned\n• You'll receive a planning summary within 5 days\n\nThis comprehensive approach ensures your project exceeds expectations!`
  };

  return completionResponses[flowType] || `Thank you for providing that information, ${userName}! Our team will review everything and get back to you soon.`;
}

// Generate flow initiation response
function generateFlowInitiationResponse(context) {
  const { userName } = context.userProfile;

  return `I'm here to help guide you through your construction project, ${userName}! I can walk you through several helpful processes:\n\n🔨 **Project Quote Collection** - Get detailed estimates\n🚨 **Emergency Assessment** - For urgent construction issues\n📅 **Consultation Scheduling** - Plan your project meeting\n🏗️ **Project Planning** - Comprehensive requirement gathering\n\nWhich of these would be most helpful for you right now?`;
}

// Suggest appropriate flows based on context
function suggestAppropriateFlows(context) {
  const suggestions = [];

  if (context.urgencyLevel.level !== 'normal') {
    suggestions.push({
      name: 'emergency_assessment',
      description: 'Get immediate help for urgent construction issues'
    });
  }

  if (context.longTermMemory.primaryInterests.includes('quote')) {
    suggestions.push({
      name: 'quote_collection',
      description: 'Get a detailed project estimate'
    });
  }

  suggestions.push(
    {
      name: 'consultation_scheduling',
      description: 'Schedule a meeting with our experts'
    },
    {
      name: 'project_planning',
      description: 'Plan your project comprehensively'
    }
  );

  return suggestions;
}

// Additional step processors
function processContactFormStep(step, userInput, context, flow, stepIndex) {
  // This would typically parse contact information
  // For now, we'll assume basic validation
  const emailPattern = /\S+@\S+\.\S+/;
  const phonePattern = /[\d\s\-\(\)]{10,}/;

  const hasEmail = emailPattern.test(userInput);
  const hasPhone = phonePattern.test(userInput);

  if (hasEmail && hasPhone) {
    return processTextStep(step, userInput, context, flow, stepIndex);
  } else {
    return {
      flowActive: true,
      currentStep: step.id,
      response: `Please provide both your email address and phone number so we can schedule your consultation, ${context.userProfile.userName}.\n\nExample: john@email.com, (555) 123-4567`,
      requiresInput: true
    };
  }
}

function processPhoneStep(step, userInput, context, flow, stepIndex) {
  if (step.validation(userInput)) {
    return processTextStep(step, userInput, context, flow, stepIndex);
  } else {
    return {
      flowActive: true,
      currentStep: step.id,
      response: `Please provide a valid phone number where our emergency team can reach you, ${context.userProfile.userName}.\n\nExample: (555) 123-4567 or 555-123-4567`,
      requiresInput: true
    };
  }
}

function generateSafetyMessage(context) {
  return {
    flowActive: true,
    currentStep: 'damage_assessment',
    response: `🚨 **SAFETY FIRST** - If this is a life-threatening emergency, please call 911 immediately.\n\nIf the situation involves gas leaks, electrical hazards, or structural collapse, please evacuate the area and contact emergency services first.\n\nOnce you're safe, I'll help coordinate our emergency construction response. Please describe the damage or issue you're experiencing:`,
    requiresInput: true
  };
}

function generateEmergencyDispatch(context) {
  return {
    flowActive: false,
    flowCompleted: true,
    response: `🚨 **EMERGENCY DISPATCH INITIATED**\n\nYour emergency request has been processed with the following details:\n• **Priority Level**: URGENT\n• **Response Team**: Emergency Construction Unit\n• **Estimated Arrival**: Within 2 hours\n• **Emergency Contact**: (555) 123-4567\n\n**What Happens Next:**\n1. Our emergency coordinator will call you within 15 minutes\n2. Emergency team will be dispatched to your location\n3. Assessment and immediate stabilization will begin\n4. Detailed repair plan will be provided on-site\n\nPlease keep your phone available and ensure safe access for our team. Stay safe, ${context.userProfile.userName}!`,
    urgent: true
  };
}

function generateConfirmationStep(context, flow) {
  const flowData = context.flowData || {};

  return {
    flowActive: true,
    currentStep: 'completion',
    response: `Let me confirm your consultation request, ${context.userProfile.userName}:\n\n📋 **Consultation Details:**\n• **Type**: ${flowData.consultation_type || 'Standard consultation'}\n• **Timing**: ${flowData.preferred_timing || 'To be scheduled'}\n• **Contact**: ${flowData.contact_details || 'Provided'}\n\nOur team will contact you to finalize the scheduling. Is there anything you'd like to add or change?`,
    requiresConfirmation: true
  };
}

function processDefaultStep(step, userInput, context, flow, stepIndex) {
  return {
    flowActive: true,
    currentStep: step.id,
    response: `I'm here to help you with the next step, ${context.userProfile.userName}. ${step.question || 'Please provide the requested information.'}`,
    requiresInput: true
  };
}