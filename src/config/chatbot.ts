
export const CHATBOT_CONFIG = {
  // OpenAI Configuration (for production)
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7
  },

  // Chatbot Behavior
  behavior: {
    maxConversationHistory: 10,
    typingDelay: 1000,
    confidenceThreshold: 0.7,
    maxResponseTime: 5000
  },

  // Analytics
  analytics: {
    trackingEnabled: true,
    batchSize: 10,
    flushInterval: 30000 // 30 seconds
  },

  // UI Configuration
  ui: {
    maxHistoryItems: 20,
    animationDuration: 300,
    showTypingIndicator: true,
    showConfidenceScore: true,
    showResponseTime: true
  },

  // Database Table IDs
  tables: {
    conversations: 34879,
    messages: 34880,
    analytics: 34881
  }
};

export const FALLBACK_RESPONSES = [
"I understand you're looking for information about that. Let me connect you with one of our specialists who can provide detailed assistance.",
"That's a great question! For the most accurate information, I recommend speaking with our team directly at (555) 123-4567.",
"I'd be happy to help you with that. Could you provide a bit more detail about what you're looking for?",
"Our team at Laguna Bay Development has extensive experience with that. Let me get you connected with the right person to help."];


export const QUICK_ACTIONS = {
  'get_quote': 'I would like to get a quote for my project',
  'schedule_consultation': 'I would like to schedule a consultation',
  'view_services': 'What services do you offer?',
  'contact_support': 'I need to contact customer support',
  'emergency_service': 'I have an emergency construction issue',
  'project_timeline': 'How long will my project take?',
  'payment_options': 'What payment options do you accept?',
  'materials_info': 'Tell me about your materials and quality'
};