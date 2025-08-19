
export const CHATBOT_CONFIG = {
  name: 'Construction AI Assistant',
  greeting: 'Hello! I\'m your AI construction assistant. I can help you with project management, lead inquiries, payments, and construction-related questions. How can I assist you today?',
  placeholder: 'Ask about projects, leads, payments, or construction services...',
  maxMessages: 100,
  typingDelay: 800,
  avatar: '🏗️',
  theme: {
    primary: '#2563eb',
    secondary: '#f8fafc',
    accent: '#f59e0b',
    text: '#1e293b',
    background: '#ffffff',
    border: '#e2e8f0'
  }
};

// Enhanced fallback responses with more intelligence
export const FALLBACK_RESPONSES = [
"I understand you're looking for information about that. Based on our conversation, let me connect you with one of our construction specialists who can provide the detailed guidance you need.",
"That's an excellent question about your construction project! For the most accurate and personalized information, I recommend speaking with our expert team who can address your specific requirements.",
"I'd be happy to help you explore that further. Could you provide a bit more detail about what you're looking for? This will help me give you the most relevant information for your construction needs.",
"Our team at Laguna Bay Development has extensive experience with that type of project. Let me get you connected with the right specialist who can provide comprehensive assistance tailored to your situation.",
"I want to make sure I understand your needs correctly so I can provide the best possible guidance. Could you help me by sharing a few more details about your specific construction requirements?"];


// Enhanced quick actions with intelligent categorization
export const QUICK_ACTIONS = {
  // Project Planning & Quotes
  'get_quote': 'I would like to get a detailed quote for my project',
  'schedule_consultation': 'I would like to schedule a consultation with your team',
  'project_timeline': 'How long will my project take to complete?',
  'material_consultation': 'I need guidance on materials and options',

  // Service Information
  'view_services': 'What construction services do you offer?',
  'residential_services': 'Tell me about your residential construction services',
  'commercial_services': 'What commercial construction services are available?',
  'speciality_services': 'Do you offer specialized construction services?',

  // Support & Contact
  'contact_support': 'I need to contact customer support',
  'emergency_service': 'I have an emergency construction issue',
  'schedule_callback': 'Please have someone call me back',
  'priority_support': 'I need priority assistance',

  // Business Information
  'payment_options': 'What payment options and financing do you accept?',
  'credentials_info': 'Tell me about your licenses and insurance',
  'portfolio_examples': 'Can I see examples of your work?',
  'testimonials': 'What do your customers say about you?',

  // Process & Planning
  'project_process': 'How does your construction process work?',
  'permit_assistance': 'Do you help with permits and approvals?',
  'design_services': 'Do you provide design and planning services?',
  'warranty_info': 'What warranties do you provide on your work?'
};

// Advanced conversation starters for different scenarios
export const CONVERSATION_STARTERS = {
  new_visitor: [
  "👋 Welcome to Laguna Bay Development! I'm here to help with all your construction needs.",
  "🏗️ Planning a construction project? I can help you get started with quotes, timelines, and expert guidance.",
  "✨ Hello! Whether you need renovation, new construction, or emergency services, I'm here to assist you."],

  returning_user: [
  "Welcome back! I remember we were discussing your [PROJECT_TYPE] project. How can I help you today?",
  "Great to see you again! Ready to move forward with your construction plans?",
  "Hello again! I'm here to continue helping with your construction project needs."],

  emergency_context: [
  "🚨 I understand this may be urgent. I'm here to help coordinate immediate assistance for your construction emergency.",
  "Emergency construction support is available 24/7. Let me help you get the immediate assistance you need."],

  business_hours: [
  "Good [TIME_OF_DAY]! Our team is available to help with your construction project needs.",
  "Hello! I'm ready to assist you with project planning, quotes, scheduling, and any construction questions you have."]

};

// Enhanced intent patterns for better recognition
export const INTENT_PATTERNS = {
  high_priority: [
  'emergency', 'urgent', 'asap', 'immediate', 'help now', 'crisis', 'damage'],

  quote_related: [
  'quote', 'estimate', 'price', 'cost', 'budget', 'pricing', 'how much', 'expensive'],

  service_inquiry: [
  'services', 'what do you do', 'capabilities', 'offer', 'provide', 'specialize'],

  scheduling: [
  'schedule', 'appointment', 'meeting', 'consultation', 'visit', 'when available'],

  project_planning: [
  'timeline', 'duration', 'how long', 'process', 'steps', 'phases', 'planning']

};

// Response quality metrics for continuous improvement
export const QUALITY_METRICS = {
  response_length: {
    optimal_range: [150, 600],
    user_preference_adaptive: true
  },
  confidence_thresholds: {
    high_confidence: 0.85,
    medium_confidence: 0.65,
    low_confidence: 0.45
  },
  engagement_indicators: [
  'follow_up_questions',
  'action_taken',
  'conversation_continuation',
  'positive_feedback']

};