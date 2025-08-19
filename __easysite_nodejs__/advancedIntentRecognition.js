
function advancedIntentRecognition(message, context) {
  // Advanced construction-specific intent recognition
  const constructionIntents = {
    greeting: {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings'],
      confidence: 0.95,
      weight: 1.0
    },
    project_status: {
      patterns: ['project status', 'progress', 'update', 'how is my project', 'project progress', 'completion'],
      confidence: 0.9,
      weight: 1.2
    },
    project_general: {
      patterns: ['project', 'construction', 'build', 'job', 'work', 'site'],
      confidence: 0.85,
      weight: 1.1
    },
    pricing_quote: {
      patterns: ['quote', 'estimate', 'how much', 'pricing', 'cost estimate'],
      confidence: 0.9,
      weight: 1.2
    },
    pricing_general: {
      patterns: ['price', 'cost', 'budget', 'fee', 'rate', 'charges'],
      confidence: 0.8,
      weight: 1.0
    },
    services: {
      patterns: ['services', 'what do you do', 'offerings', 'capabilities', 'construction services'],
      confidence: 0.85,
      weight: 1.1
    },
    lead_status: {
      patterns: ['lead status', 'inquiry status', 'application status', 'where is my lead'],
      confidence: 0.9,
      weight: 1.2
    },
    lead_new: {
      patterns: ['new lead', 'inquiry', 'interested', 'potential client', 'prospect'],
      confidence: 0.8,
      weight: 1.0
    },
    payment_invoice: {
      patterns: ['invoice', 'submit invoice', 'billing', 'payment submission'],
      confidence: 0.9,
      weight: 1.1
    },
    payment_status: {
      patterns: ['payment status', 'when will i be paid', 'payment received'],
      confidence: 0.85,
      weight: 1.1
    },
    materials: {
      patterns: ['materials', 'supplies', 'equipment', 'concrete', 'steel', 'lumber', 'tools'],
      confidence: 0.8,
      weight: 1.0
    },
    permits: {
      patterns: ['permit', 'license', 'approval', 'regulation', 'code', 'inspection', 'compliance'],
      confidence: 0.85,
      weight: 1.0
    },
    safety: {
      patterns: ['safety', 'hazard', 'protection', 'osha', 'accident', 'injury', 'precaution'],
      confidence: 0.9,
      weight: 1.1
    },
    timeline: {
      patterns: ['timeline', 'schedule', 'deadline', 'completion', 'duration', 'when', 'how long'],
      confidence: 0.85,
      weight: 1.0
    },
    contact: {
      patterns: ['contact', 'phone', 'email', 'address', 'location', 'reach', 'office'],
      confidence: 0.8,
      weight: 0.9
    },
    help: {
      patterns: ['help', 'support', 'assistance', 'problem', 'issue', 'trouble'],
      confidence: 0.7,
      weight: 0.8
    },
    general: {
      patterns: [],
      confidence: 0.5,
      weight: 0.5
    }
  };

  const message_lower = message.toLowerCase();
  const messageWords = message_lower.split(/\s+/);
  const results = [];

  // Check for multi-word patterns first (higher priority)
  for (const [intentName, intentData] of Object.entries(constructionIntents)) {
    let bestMatch = 0;
    let matchedPatterns = [];

    for (const pattern of intentData.patterns) {
      if (pattern.includes(' ')) {
        // Multi-word pattern - check for phrase match
        if (message_lower.includes(pattern)) {
          bestMatch = Math.max(bestMatch, intentData.confidence * intentData.weight * 1.5);
          matchedPatterns.push(pattern);
        }
      } else {
        // Single word pattern - check for word matches
        const patternWords = pattern.split(' ');
        const wordMatches = patternWords.filter((word) =>
        messageWords.some((msgWord) =>
        msgWord.includes(word) || word.includes(msgWord)
        )
        );

        if (wordMatches.length > 0) {
          const matchRatio = wordMatches.length / patternWords.length;
          const score = intentData.confidence * intentData.weight * matchRatio;
          bestMatch = Math.max(bestMatch, score);
          matchedPatterns.push(pattern);
        }
      }
    }

    if (bestMatch > 0 || intentName === 'general') {
      results.push({
        intent: intentName,
        confidence: Math.min(bestMatch, 1.0),
        matchedPatterns: matchedPatterns,
        contextRelevance: getContextRelevance(intentName, context)
      });
    }
  }

  // Apply context boost
  results.forEach((result) => {
    result.confidence += result.contextRelevance * 0.1;
    result.confidence = Math.min(result.confidence, 1.0);
  });

  // Sort by confidence and return top match
  results.sort((a, b) => b.confidence - a.confidence);

  // If no strong match found, default to general with construction context
  const topMatch = results[0] || { intent: 'general', confidence: 0.5 };

  return {
    topIntent: topMatch,
    allIntents: results.slice(0, 3), // Return top 3 for analysis
    context: {
      ...context,
      lastIntent: topMatch.intent,
      confidence: topMatch.confidence,
      analysisTime: new Date().toISOString()
    },
    messageAnalysis: {
      wordCount: messageWords.length,
      hasQuestionMarks: message.includes('?'),
      hasNumbers: /\d/.test(message),
      constructionTerms: getConstructionTerms(message_lower)
    }
  };
}

function getContextRelevance(intent, context) {
  if (!context || !context.previousIntents) return 0;

  // Context relevance based on conversation flow
  const contextMap = {
    'project_status': ['project_general', 'timeline'],
    'pricing_quote': ['services', 'project_general'],
    'payment_status': ['payment_invoice', 'project_status'],
    'materials': ['project_general', 'pricing_general'],
    'permits': ['project_general', 'timeline'],
    'safety': ['project_general', 'help']
  };

  const relatedIntents = contextMap[intent] || [];
  const recentIntents = context.previousIntents.slice(-3);

  return recentIntents.some((prevIntent) => relatedIntents.includes(prevIntent)) ? 0.3 : 0;
}

function getConstructionTerms(message) {
  const constructionTerms = [
  'concrete', 'steel', 'lumber', 'foundation', 'framing', 'roofing', 'plumbing',
  'electrical', 'hvac', 'drywall', 'flooring', 'permit', 'inspection', 'blueprint',
  'contractor', 'subcontractor', 'excavation', 'demolition', 'renovation'];


  return constructionTerms.filter((term) => message.includes(term));
}

// Extract entities from the message
function extractEntities(message) {
  const entities = {};
  const lowerMessage = message.toLowerCase();

  // Extract project types
  const projectTypes = ['kitchen', 'bathroom', 'bedroom', 'garage', 'basement', 'roof', 'deck', 'patio', 'driveway', 'fence', 'pool'];
  for (const type of projectTypes) {
    if (lowerMessage.includes(type)) {
      entities.projectType = type;
      break;
    }
  }

  // Extract materials
  const materials = ['wood', 'concrete', 'steel', 'brick', 'stone', 'vinyl', 'aluminum', 'composite'];
  for (const material of materials) {
    if (lowerMessage.includes(material)) {
      entities.material = material;
      break;
    }
  }

  // Extract urgency indicators
  const urgencyWords = ['urgent', 'asap', 'emergency', 'immediate', 'soon', 'quickly'];
  for (const word of urgencyWords) {
    if (lowerMessage.includes(word)) {
      entities.urgency = word;
      break;
    }
  }

  // Extract budget indicators
  const budgetPattern = /\$[\d,]+|\d+k|\d+ thousand|\d+ million/gi;
  const budgetMatch = message.match(budgetPattern);
  if (budgetMatch) {
    entities.budget = budgetMatch[0];
  }

  // Extract timeline indicators
  const timelinePattern = /\d+\s*(day|week|month|year)s?|\d+\s*-\s*\d+\s*(day|week|month|year)s?/gi;
  const timelineMatch = message.match(timelinePattern);
  if (timelineMatch) {
    entities.timeline = timelineMatch[0];
  }

  return entities;
}

// Basic sentiment analysis
function analyzeSentiment(message) {
  const positive = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'happy', 'satisfied', 'pleased'];
  const negative = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'frustrated', 'angry', 'upset', 'poor'];
  const urgent = ['urgent', 'emergency', 'help', 'problem', 'issue', 'trouble', 'asap', 'immediate'];

  const lowerMessage = message.toLowerCase();
  let sentiment = 'neutral';

  if (positive.some((word) => lowerMessage.includes(word))) {
    sentiment = 'positive';
  } else if (negative.some((word) => lowerMessage.includes(word))) {
    sentiment = 'negative';
  } else if (urgent.some((word) => lowerMessage.includes(word))) {
    sentiment = 'urgent';
  }

  return sentiment;
}