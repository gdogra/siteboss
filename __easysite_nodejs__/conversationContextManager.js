
// Advanced conversation context management and memory
function conversationContextManager(conversationId, message, conversationHistory = [], userContext = {}) {
  const currentTurn = {
    timestamp: new Date().toISOString(),
    message: message,
    turnIndex: conversationHistory.length
  };
  
  // Analyze conversation patterns
  const contextAnalysis = analyzeConversationContext(conversationHistory, currentTurn);
  
  // Build comprehensive context
  const conversationContext = {
    // Current session info
    sessionId: conversationId,
    turnIndex: currentTurn.turnIndex,
    
    // Conversation state
    currentTopic: contextAnalysis.currentTopic,
    topicHistory: contextAnalysis.topicHistory,
    conversationFlow: contextAnalysis.conversationFlow,
    
    // User context
    userProfile: {
      userId: userContext.userId || 'anonymous',
      userName: userContext.userName || 'there',
      userRole: userContext.userRole || 'user',
      preferences: userContext.preferences || {},
      previousInteractions: userContext.previousInteractions || []
    },
    
    // Conversation memory
    shortTermMemory: extractShortTermMemory(conversationHistory.slice(-5)),
    longTermMemory: extractLongTermMemory(conversationHistory),
    keyFacts: extractKeyFacts(conversationHistory),
    
    // Intent and entity tracking
    intentHistory: conversationHistory.map(msg => msg.intent).filter(Boolean),
    entityAccumulation: accumulateEntities(conversationHistory),
    
    // Conversation quality metrics
    engagementLevel: calculateEngagementLevel(conversationHistory),
    satisfactionIndicators: detectSatisfactionIndicators(conversationHistory),
    
    // Business context
    projectContext: extractProjectContext(conversationHistory),
    serviceInterest: identifyServiceInterests(conversationHistory),
    urgencyLevel: assessUrgencyLevel(conversationHistory, message)
  };
  
  return conversationContext;
}

// Analyze conversation context patterns
function analyzeConversationContext(history, currentTurn) {
  const recentHistory = history.slice(-5);
  const topics = recentHistory.map(msg => msg.topics || []).flat();
  const intents = recentHistory.map(msg => msg.intent).filter(Boolean);
  
  // Determine current topic
  const topicCounts = {};
  topics.forEach(topic => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });
  
  const currentTopic = Object.keys(topicCounts).reduce((a, b) => 
    topicCounts[a] > topicCounts[b] ? a : b, 'general'
  );
  
  // Track topic transitions
  const topicHistory = [];
  let lastTopic = null;
  
  history.forEach(msg => {
    if (msg.topics && msg.topics.length > 0) {
      const mainTopic = msg.topics[0];
      if (mainTopic !== lastTopic) {
        topicHistory.push({
          topic: mainTopic,
          timestamp: msg.timestamp,
          transition: lastTopic ? `${lastTopic} -> ${mainTopic}` : `start -> ${mainTopic}`
        });
        lastTopic = mainTopic;
      }
    }
  });
  
  // Identify conversation flow pattern
  const flowPatterns = {
    'information_seeking': ['greeting', 'services', 'contact'],
    'quote_request': ['greeting', 'services', 'quote', 'consultation'],
    'emergency_support': ['greeting', 'emergency', 'contact'],
    'detailed_consultation': ['greeting', 'services', 'timeline', 'materials', 'quote']
  };
  
  let conversationFlow = 'exploratory';
  const currentTopics = topics.slice(-3);
  
  for (const [pattern, sequence] of Object.entries(flowPatterns)) {
    if (sequence.every(topic => currentTopics.includes(topic))) {
      conversationFlow = pattern;
      break;
    }
  }
  
  return {
    currentTopic,
    topicHistory,
    conversationFlow,
    topicDiversity: Object.keys(topicCounts).length,
    conversationDepth: history.length
  };
}

// Extract short-term memory (recent context)
function extractShortTermMemory(recentHistory) {
  const memory = {
    recentTopics: [],
    recentEntities: {},
    recentIntents: [],
    conversationTone: 'neutral'
  };
  
  recentHistory.forEach(msg => {
    if (msg.topics) memory.recentTopics.push(...msg.topics);
    if (msg.entities) Object.assign(memory.recentEntities, msg.entities);
    if (msg.intent) memory.recentIntents.push(msg.intent);
  });
  
  // Determine conversation tone
  const toneIndicators = recentHistory.map(msg => msg.sentiment || 'neutral');
  if (toneIndicators.includes('urgent')) memory.conversationTone = 'urgent';
  else if (toneIndicators.includes('positive')) memory.conversationTone = 'positive';
  else if (toneIndicators.includes('negative')) memory.conversationTone = 'negative';
  
  return memory;
}

// Extract long-term memory (session facts)
function extractLongTermMemory(fullHistory) {
  const memory = {
    primaryInterests: [],
    preferredContactMethod: null,
    projectDetails: {},
    budgetRange: null,
    timelinePreference: null,
    serviceHistory: []
  };
  
  // Analyze primary interests based on topic frequency
  const allTopics = fullHistory.map(msg => msg.topics || []).flat();
  const topicFrequency = {};
  allTopics.forEach(topic => {
    topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
  });
  
  memory.primaryInterests = Object.entries(topicFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
  
  // Extract project details from entities
  fullHistory.forEach(msg => {
    if (msg.entities) {
      if (msg.entities.projectType && !memory.projectDetails.type) {
        memory.projectDetails.type = msg.entities.projectType;
      }
      if (msg.entities.budget && !memory.budgetRange) {
        memory.budgetRange = msg.entities.budget;
      }
      if (msg.entities.timeline && !memory.timelinePreference) {
        memory.timelinePreference = msg.entities.timeline;
      }
    }
  });
  
  return memory;
}

// Extract key facts mentioned in conversation
function extractKeyFacts(history) {
  const facts = [];
  
  history.forEach((msg, index) => {
    if (msg.entities) {
      Object.entries(msg.entities).forEach(([key, value]) => {
        facts.push({
          fact: `${key}: ${value}`,
          confidence: 0.8,
          turnIndex: index,
          timestamp: msg.timestamp
        });
      });
    }
    
    // Extract explicit facts from content
    if (msg.content && msg.message_type === 'user') {
      const factPatterns = [
        /my budget is \$?[\d,]+/gi,
        /i need it done in \d+\s*\w+/gi,
        /my project is \w+/gi,
        /i live in [\w\s,]+/gi
      ];
      
      factPatterns.forEach(pattern => {
        const matches = msg.content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            facts.push({
              fact: match.trim(),
              confidence: 0.9,
              turnIndex: index,
              timestamp: msg.timestamp
            });
          });
        }
      });
    }
  });
  
  return facts;
}

// Accumulate entities across conversation
function accumulateEntities(history) {
  const accumulated = {};
  
  history.forEach(msg => {
    if (msg.entities) {
      Object.entries(msg.entities).forEach(([key, value]) => {
        if (!accumulated[key]) {
          accumulated[key] = [];
        }
        if (!accumulated[key].includes(value)) {
          accumulated[key].push(value);
        }
      });
    }
  });
  
  return accumulated;
}

// Calculate engagement level
function calculateEngagementLevel(history) {
  if (history.length === 0) return 0;
  
  const averageMessageLength = history
    .filter(msg => msg.message_type === 'user')
    .reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / 
    Math.max(1, history.filter(msg => msg.message_type === 'user').length);
  
  const responseRate = history.filter(msg => msg.message_type === 'user').length / history.length;
  const conversationLength = history.length;
  
  // Normalize engagement score (0-1)
  const lengthScore = Math.min(averageMessageLength / 100, 1);
  const rateScore = responseRate;
  const durationScore = Math.min(conversationLength / 20, 1);
  
  return (lengthScore + rateScore + durationScore) / 3;
}

// Detect satisfaction indicators
function detectSatisfactionIndicators(history) {
  const indicators = {
    positive: 0,
    negative: 0,
    neutral: 0,
    overall: 'neutral'
  };
  
  history.forEach(msg => {
    if (msg.sentiment) {
      indicators[msg.sentiment] = (indicators[msg.sentiment] || 0) + 1;
    }
  });
  
  const total = indicators.positive + indicators.negative + indicators.neutral;
  if (total > 0) {
    if (indicators.positive / total > 0.6) indicators.overall = 'satisfied';
    else if (indicators.negative / total > 0.4) indicators.overall = 'unsatisfied';
  }
  
  return indicators;
}

// Extract project context
function extractProjectContext(history) {
  const projectContext = {
    projectType: null,
    scope: 'unknown',
    phase: 'inquiry',
    requirements: [],
    constraints: []
  };
  
  const allEntities = history.map(msg => msg.entities || {});
  
  // Determine project type
  const projectTypes = allEntities
    .map(entities => entities.projectType)
    .filter(Boolean);
  if (projectTypes.length > 0) {
    projectContext.projectType = projectTypes[projectTypes.length - 1];
  }
  
  // Determine project phase based on intent progression
  const intents = history.map(msg => msg.intent).filter(Boolean);
  if (intents.includes('emergency_service')) {
    projectContext.phase = 'emergency';
  } else if (intents.includes('project_consultation')) {
    projectContext.phase = 'consultation';
  } else if (intents.includes('project_quote')) {
    projectContext.phase = 'estimation';
  }
  
  return projectContext;
}

// Identify service interests
function identifyServiceInterests(history) {
  const interests = [];
  
  const serviceKeywords = {
    'residential': ['home', 'house', 'residential', 'kitchen', 'bathroom', 'bedroom'],
    'commercial': ['commercial', 'office', 'business', 'retail', 'warehouse'],
    'renovation': ['renovation', 'remodel', 'update', 'upgrade', 'improve'],
    'new_construction': ['new', 'build', 'construction', 'custom'],
    'emergency': ['emergency', 'urgent', 'damage', 'repair']
  };
  
  const allContent = history
    .map(msg => msg.content || '')
    .join(' ')
    .toLowerCase();
  
  Object.entries(serviceKeywords).forEach(([service, keywords]) => {
    const matches = keywords.filter(keyword => allContent.includes(keyword));
    if (matches.length > 0) {
      interests.push({
        service,
        confidence: matches.length / keywords.length,
        keywords: matches
      });
    }
  });
  
  return interests.sort((a, b) => b.confidence - a.confidence);
}

// Assess urgency level
function assessUrgencyLevel(history, currentMessage) {
  const urgencyKeywords = ['emergency', 'urgent', 'asap', 'immediate', 'help now', 'crisis'];
  const timeKeywords = ['today', 'tonight', 'tomorrow', 'this week', 'soon'];
  
  let urgencyLevel = 'normal';
  let urgencyScore = 0;
  
  // Check current message
  const currentLower = currentMessage.toLowerCase();
  urgencyKeywords.forEach(keyword => {
    if (currentLower.includes(keyword)) urgencyScore += 0.3;
  });
  
  timeKeywords.forEach(keyword => {
    if (currentLower.includes(keyword)) urgencyScore += 0.1;
  });
  
  // Check recent history
  history.slice(-3).forEach(msg => {
    if (msg.content) {
      const msgLower = msg.content.toLowerCase();
      urgencyKeywords.forEach(keyword => {
        if (msgLower.includes(keyword)) urgencyScore += 0.2;
      });
    }
  });
  
  if (urgencyScore > 0.5) urgencyLevel = 'critical';
  else if (urgencyScore > 0.2) urgencyLevel = 'high';
  else if (urgencyScore > 0.1) urgencyLevel = 'moderate';
  
  return {
    level: urgencyLevel,
    score: Math.min(urgencyScore, 1.0),
    indicators: urgencyKeywords.filter(k => currentMessage.toLowerCase().includes(k))
  };
}
