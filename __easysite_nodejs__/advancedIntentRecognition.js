
// Advanced intent recognition with construction business domain knowledge
function advancedIntentRecognition(message, conversationHistory = [], userContext = {}) {
  const lowerMessage = message.toLowerCase();
  const tokens = lowerMessage.split(/\s+/);
  
  // Define construction business intents with patterns and confidence scoring
  const intents = {
    // Project related intents
    'project_quote': {
      patterns: ['quote', 'estimate', 'price', 'cost', 'budget', 'pricing', 'how much'],
      keywords: ['project', 'construction', 'build', 'renovation', 'remodel'],
      confidence_boost: 0.2,
      priority: 'high'
    },
    'project_timeline': {
      patterns: ['timeline', 'duration', 'how long', 'when', 'time', 'schedule', 'completion'],
      keywords: ['finish', 'complete', 'start', 'begin'],
      confidence_boost: 0.15,
      priority: 'high'
    },
    'project_consultation': {
      patterns: ['consultation', 'meeting', 'discuss', 'plan', 'design', 'architect'],
      keywords: ['schedule', 'appointment', 'visit', 'site visit'],
      confidence_boost: 0.18,
      priority: 'high'
    },
    
    // Service related intents
    'services_overview': {
      patterns: ['services', 'what do you do', 'capabilities', 'specialties', 'expertise'],
      keywords: ['construction', 'building', 'contracting'],
      confidence_boost: 0.15,
      priority: 'medium'
    },
    'residential_services': {
      patterns: ['residential', 'home', 'house', 'custom home', 'addition', 'renovation'],
      keywords: ['kitchen', 'bathroom', 'bedroom', 'living room', 'garage'],
      confidence_boost: 0.12,
      priority: 'medium'
    },
    'commercial_services': {
      patterns: ['commercial', 'business', 'office', 'retail', 'warehouse', 'industrial'],
      keywords: ['storefront', 'restaurant', 'medical', 'dental'],
      confidence_boost: 0.12,
      priority: 'medium'
    },
    
    // Emergency and urgent
    'emergency_service': {
      patterns: ['emergency', 'urgent', 'asap', 'immediate', 'help now', '911', 'disaster'],
      keywords: ['damage', 'leak', 'structural', 'safety', 'collapse'],
      confidence_boost: 0.3,
      priority: 'critical'
    },
    
    // Contact and support
    'contact_info': {
      patterns: ['contact', 'phone', 'email', 'address', 'location', 'office', 'reach'],
      keywords: ['call', 'speak', 'talk', 'visit'],
      confidence_boost: 0.1,
      priority: 'medium'
    },
    'support_request': {
      patterns: ['help', 'support', 'assistance', 'problem', 'issue', 'trouble'],
      keywords: ['customer service', 'representative', 'agent'],
      confidence_boost: 0.12,
      priority: 'medium'
    },
    
    // Business credentials and trust
    'credentials_inquiry': {
      patterns: ['licensed', 'insured', 'bonded', 'certified', 'qualified', 'credentials'],
      keywords: ['license', 'insurance', 'bond', 'certification', 'accredited'],
      confidence_boost: 0.15,
      priority: 'medium'
    },
    
    // Financial and payment
    'payment_inquiry': {
      patterns: ['payment', 'pay', 'billing', 'invoice', 'financing', 'loan'],
      keywords: ['credit', 'cash', 'check', 'installment', 'down payment'],
      confidence_boost: 0.12,
      priority: 'medium'
    },
    
    // Materials and quality
    'materials_inquiry': {
      patterns: ['materials', 'supplies', 'quality', 'brands', 'suppliers'],
      keywords: ['lumber', 'concrete', 'steel', 'drywall', 'flooring', 'roofing'],
      confidence_boost: 0.1,
      priority: 'low'
    },
    
    // Conversational intents
    'greeting': {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings'],
      keywords: ['there', 'everyone'],
      confidence_boost: 0.05,
      priority: 'low'
    },
    'farewell': {
      patterns: ['bye', 'goodbye', 'see you', 'farewell', 'talk later', 'have a good'],
      keywords: ['thanks', 'thank you'],
      confidence_boost: 0.05,
      priority: 'low'
    },
    'gratitude': {
      patterns: ['thank', 'thanks', 'appreciate', 'grateful'],
      keywords: ['you', 'help', 'assistance'],
      confidence_boost: 0.05,
      priority: 'low'
    }
  };
  
  // Calculate intent scores
  const intentScores = {};
  
  for (const [intentName, intentData] of Object.entries(intents)) {
    let score = 0;
    let matchCount = 0;
    
    // Check for pattern matches
    for (const pattern of intentData.patterns) {
      if (lowerMessage.includes(pattern)) {
        score += 0.4;
        matchCount++;
      }
    }
    
    // Check for keyword matches
    for (const keyword of intentData.keywords) {
      if (lowerMessage.includes(keyword)) {
        score += 0.2;
        matchCount++;
      }
    }
    
    // Apply confidence boost
    if (matchCount > 0) {
      score += intentData.confidence_boost;
    }
    
    // Context-based scoring adjustments
    if (conversationHistory.length > 0) {
      const recentTopics = conversationHistory.slice(-3)
        .map(msg => msg.topics || [])
        .flat();
      
      // Boost score if related to recent conversation topics
      if (recentTopics.some(topic => intentName.includes(topic.replace('_inquiry', '').replace('_service', '')))) {
        score += 0.15;
      }
    }
    
    // User context adjustments
    if (userContext.userRole === 'Administrator' && intentName.includes('emergency')) {
      score += 0.1;
    }
    
    if (score > 0) {
      intentScores[intentName] = {
        score: Math.min(score, 1.0),
        priority: intentData.priority,
        matchCount
      };
    }
  }
  
  // Find the highest scoring intent
  const topIntents = Object.entries(intentScores)
    .sort(([,a], [,b]) => b.score - a.score)
    .slice(0, 3);
  
  const primaryIntent = topIntents[0];
  
  return {
    primaryIntent: primaryIntent ? {
      name: primaryIntent[0],
      confidence: primaryIntent[1].score,
      priority: primaryIntent[1].priority
    } : null,
    alternativeIntents: topIntents.slice(1).map(([name, data]) => ({
      name,
      confidence: data.score,
      priority: data.priority
    })),
    complexity: tokens.length > 15 ? 'high' : tokens.length > 8 ? 'medium' : 'low',
    entities: extractEntities(message),
    sentiment: analyzeSentiment(message)
  };
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
  
  if (positive.some(word => lowerMessage.includes(word))) {
    sentiment = 'positive';
  } else if (negative.some(word => lowerMessage.includes(word))) {
    sentiment = 'negative';
  } else if (urgent.some(word => lowerMessage.includes(word))) {
    sentiment = 'urgent';
  }
  
  return sentiment;
}
