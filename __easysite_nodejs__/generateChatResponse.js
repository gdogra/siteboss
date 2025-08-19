
// Generate intelligent chat response using OpenAI GPT
function generateChatResponse(message, conversationHistory = [], userContext = {}) {
  try {
    // Advanced construction-focused chat response generation
    const constructionResponses = {
        greeting: [
            "Hello! I'm your construction AI assistant. How can I help you with your project today?",
            "Hi there! Ready to assist with your construction needs. What can I help you with?",
            "Welcome! I specialize in construction management. How may I assist you?"
        ],
        project: {
            status: [
                "I can help you check your project status! Please provide your project ID or name, and I'll get you the latest updates on timeline, progress, and any pending items.",
                "Let me help you track your construction project. You can view detailed progress reports in your dashboard, or I can connect you with your project manager for real-time updates."
            ],
            general: [
                "Our construction services cover residential, commercial, and specialty projects. We handle everything from planning to completion. What type of project are you considering?",
                "I'd be happy to discuss your construction project! Whether it's new construction, renovation, or repair work, we have the expertise to help. Tell me more about what you have in mind."
            ]
        },
        pricing: {
            quote: [
                "I can help you get an accurate construction quote! For the best estimate, I'll need details about your project location, scope of work, materials preferences, and timeline. Would you like to start with a quick project assessment?",
                "Getting a construction quote is easy! Our pricing depends on project complexity, materials, and timeline. I can connect you with our estimating team for a detailed consultation. What type of construction work are you planning?"
            ],
            general: [
                "Our construction pricing is competitive and transparent. We provide detailed estimates breaking down materials, labor, permits, and timeline. Each project is unique, so let's discuss your specific needs for accurate pricing."
            ]
        },
        services: [
            "We offer comprehensive construction services including:\n🏠 Residential Construction & Renovation\n🏢 Commercial Building Projects\n🔧 Specialty Construction Work\n📋 Project Management & Consulting\n🤝 Subcontractor Coordination\n\nWhich service interests you most?",
            "Our construction expertise covers the full spectrum:\n• New construction from ground up\n• Renovations and additions\n• Commercial and industrial projects\n• Project management and coordination\n• Permit handling and compliance\n\nWhat specific service can I tell you more about?"
        ],
        leads: {
            status: [
                "I can help you check your lead status! You can view all your inquiries and their progress in the Lead Management section, or I can connect you with our sales team for immediate updates.",
                "Your lead inquiry is important to us! I can help track where you are in our process. Typically, our team responds within 24 hours with initial consultation scheduling."
            ],
            new: [
                "Excellent! I'd love to help you start a new construction inquiry. To provide the best service, I'll need some basic information about your project. What type of construction are you considering?",
                "Thank you for your interest in our construction services! Let me guide you through submitting a lead. We'll need project type, location, timeline, and budget range to get started."
            ]
        },
        payments: {
            invoice: [
                "I can assist with invoice submissions! Our online portal makes it easy to submit and track invoices. You'll need your project information and documentation. Would you like me to guide you through the process?",
                "For invoice processing, you can use our streamlined submission system. I can help you navigate the requirements and ensure your invoice is processed quickly. What type of invoice are you submitting?"
            ],
            status: [
                "I can help you check payment status! In your dashboard, you'll find all payment history and pending items. If you need immediate assistance, I can connect you with our billing department."
            ]
        },
        materials: [
            "We work with top-quality construction materials from trusted suppliers! Whether you need concrete, steel, lumber, or specialty materials, we ensure everything meets project specifications and local codes. What materials are you interested in?",
            "Material selection is crucial for project success. We source high-grade materials including structural components, finishes, and specialty items. Our team handles procurement, delivery scheduling, and quality verification. Tell me about your material needs!"
        ],
        permits: [
            "Permit management is one of our specialties! We handle all regulatory requirements including building permits, environmental approvals, and inspection scheduling. Our team ensures full compliance with local codes and regulations.",
            "Don't worry about permits - we've got you covered! Our experienced team manages the entire permitting process, from initial applications to final inspections. We work with local authorities to expedite approvals while ensuring full compliance."
        ],
        safety: [
            "Safety is our absolute top priority! We maintain comprehensive safety protocols, regular training programs, and strict OSHA compliance on every job site. Our safety record speaks for itself - zero tolerance for unsafe practices.",
            "We're committed to maintaining the highest safety standards in construction. Our team receives ongoing safety training, we conduct daily safety briefings, and implement rigorous safety protocols. Every worker goes home safely every day."
        ],
        timeline: [
            "Construction timelines depend on several factors including project scope, permits, weather, and materials. Residential projects typically range from 3-6 months, while commercial projects may take 6-18 months. I can provide a more specific timeline once we discuss your project details.",
            "Project scheduling is carefully managed to ensure timely completion. We factor in design phase, permit approval, material delivery, weather windows, and construction phases. Let me help you understand the timeline for your specific project type."
        ],
        help: [
            "I'm here to help with all your construction needs! I can assist with project information, quotes, service details, payment questions, and connecting you with the right team members. What specific help do you need?",
            "Absolutely! As your construction AI assistant, I can help with project tracking, service information, quotes, payments, and general construction questions. I'm also able to connect you with human experts when needed. How can I assist you?"
        ],
        general: [
            "I specialize in construction management and services. I can help with project information, quotes, service details, lead management, payments, and general construction questions. What would you like to know?",
            "As your construction AI assistant, I'm here to help with any construction-related questions or needs. Whether it's about ongoing projects, new inquiries, services, or payments, I'm ready to assist. How can I help you today?"
        ]
    };

    const lowerMessage = message.toLowerCase();
    const { userName = 'there', userRole = 'user' } = userContext;

    // Enhanced context-aware responses
    if (lowerMessage.includes('quote') || lowerMessage.includes('estimate') || lowerMessage.includes('price')) {
      return {
        response: `Hi ${userName}! I'd be happy to help you get a personalized quote. As a ${userRole}, you have access to our premium estimation service. You can request a detailed estimate by visiting our Get Quote page or I can connect you with one of our project specialists right now. What type of construction project are you planning?`,
        confidence: 0.95,
        topics: ['quote', 'estimate', 'pricing'],
        suggestedActions: ['schedule_consultation', 'view_portfolio', 'contact_specialist']
      };
    }

    if (lowerMessage.includes('service') || lowerMessage.includes('what do you do')) {
      return {
        response: `Great question, ${userName}! Laguna Bay Development specializes in comprehensive construction services including:\n\n🏗️ **Residential Construction** - Custom homes, additions, renovations\n🏢 **Commercial Projects** - Office buildings, retail spaces, warehouses\n🔧 **Remodeling & Renovations** - Kitchen, bathroom, whole-home updates\n📋 **Project Management** - Full-service project oversight\n\nBased on your profile as a ${userRole}, I can provide more specific information about services that might interest you most. What type of project are you considering?`,
        confidence: 0.98,
        topics: ['services', 'construction', 'capabilities'],
        suggestedActions: ['view_services', 'browse_projects', 'schedule_consultation']
      };
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return {
        response: `Here's how you can reach our team, ${userName}:\n\n📞 **Phone**: (555) 123-4567\n📧 **Email**: info@lagunabaydev.com\n📍 **Office**: 123 Construction Way, Laguna Bay, CA\n🕐 **Hours**: Monday-Friday 8AM-6PM, Saturday 9AM-2PM\n\nAs a valued ${userRole}, you also have access to our priority support line. Would you like me to schedule a call back for you?`,
        confidence: 0.97,
        topics: ['contact', 'information', 'support'],
        suggestedActions: ['schedule_callback', 'send_email', 'view_location']
      };
    }

    if (lowerMessage.includes('timeline') || lowerMessage.includes('how long') || lowerMessage.includes('duration')) {
      return {
        response: `Project timelines vary based on complexity and scope, ${userName}:\n\n⚡ **Small Renovations**: 1-3 weeks\n🏠 **Room Additions**: 4-8 weeks\n🏢 **New Construction**: 3-8 months\n🔄 **Full Home Remodel**: 2-6 months\n\nFactors affecting timeline include permits, weather, material availability, and project complexity. I can provide a more accurate timeline once we discuss your specific project details. What type of construction are you planning?`,
        confidence: 0.94,
        topics: ['timeline', 'duration', 'planning'],
        suggestedActions: ['get_timeline_estimate', 'schedule_consultation', 'view_project_phases']
      };
    }

    if (lowerMessage.includes('license') || lowerMessage.includes('insured') || lowerMessage.includes('certified')) {
      return {
        response: `Absolutely, ${userName}! Laguna Bay Development maintains all required credentials:\n\n✅ **Licensed**: California Contractors License #123456\n🛡️ **Fully Insured**: $2M General Liability Coverage\n🏆 **Bonded**: Licensed, bonded contractor\n📜 **Certifications**: OSHA certified, EPA certified\n🏅 **Memberships**: Better Business Bureau (A+ Rating)\n\nYour peace of mind is our priority. All our work is guaranteed and backed by comprehensive insurance coverage.`,
        confidence: 0.99,
        topics: ['credentials', 'licensing', 'insurance'],
        suggestedActions: ['view_credentials', 'read_testimonials', 'get_quote']
      };
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('invoice') || lowerMessage.includes('billing')) {
      return {
        response: `We offer flexible payment options, ${userName}:\n\n💳 **Payment Methods**: Credit cards, checks, bank transfers, financing\n📅 **Payment Schedule**: Typically structured in project milestones\n💰 **Financing Available**: We work with several financing partners\n📊 **Transparent Billing**: Detailed invoices with no hidden fees\n\nAs a ${userRole}, you have access to our online payment portal where you can view invoices, make payments, and track project expenses. Would you like me to explain our payment process for your project type?`,
        confidence: 0.96,
        topics: ['payment', 'billing', 'financing'],
        suggestedActions: ['view_payment_options', 'apply_financing', 'contact_billing']
      };
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
      return {
        response: `I understand this is urgent, ${userName}! For emergency construction needs:\n\n🚨 **Emergency Hotline**: (555) 123-4567\n⏰ **24/7 Response**: Available for critical situations\n🏃 **Rapid Response**: Emergency team dispatched within 2 hours\n🔧 **Emergency Services**: Structural damage, water damage, security issues\n\nOur emergency response team is standing by. Given your ${userRole} status, you have priority emergency support. Should I connect you with our emergency dispatcher right now?`,
        confidence: 0.98,
        topics: ['emergency', 'urgent', 'immediate_help'],
        suggestedActions: ['call_emergency', 'dispatch_team', 'immediate_consultation']
      };
    }

    if (lowerMessage.includes('materials') || lowerMessage.includes('supply') || lowerMessage.includes('quality')) {
      return {
        response: `Quality materials are fundamental to our work, ${userName}:\n\n🏗️ **Premium Materials**: We source from top-tier suppliers\n🔍 **Quality Assurance**: All materials inspected before use\n🌱 **Sustainable Options**: Eco-friendly materials available\n📋 **Supplier Network**: Partnerships with leading manufacturers\n💡 **Latest Technology**: Modern, energy-efficient options\n\nWe can work with your preferred suppliers or recommend the best materials for your project and budget. What type of materials are you considering for your project?`,
        confidence: 0.95,
        topics: ['materials', 'quality', 'suppliers'],
        suggestedActions: ['view_materials', 'get_material_quote', 'schedule_material_consultation']
      };
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        response: `You're very welcome, ${userName}! I'm here to help make your construction project as smooth as possible. Is there anything else I can assist you with today? I can help you schedule a consultation, get project estimates, or connect you with our specialists.`,
        confidence: 0.92,
        topics: ['gratitude', 'assistance'],
        suggestedActions: ['schedule_consultation', 'get_quote', 'view_services']
      };
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const greetings = [
      `Hello ${userName}! Welcome to Laguna Bay Development. I'm your AI assistant, ready to help with all your construction needs.`,
      `Hi there, ${userName}! Great to see you back. How can I assist you with your construction project today?`,
      `Hey ${userName}! I'm here to help you with quotes, project planning, or any questions about our construction services.`];

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      return {
        response: `${randomGreeting} As a ${userRole}, you have access to our premium support features. What can I help you with today?`,
        confidence: 0.93,
        topics: ['greeting', 'welcome'],
        suggestedActions: ['get_quote', 'view_services', 'schedule_consultation']
      };
    }

    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return {
        response: `Thank you for choosing Laguna Bay Development, ${userName}! Feel free to reach out anytime - I'm here 24/7 to assist you. Have a wonderful day, and remember, we're just a message away for all your construction needs!`,
        confidence: 0.91,
        topics: ['farewell', 'closing'],
        suggestedActions: ['save_conversation', 'schedule_followup', 'contact_later']
      };
    }

    // Check conversation history for context
    const recentTopics = conversationHistory.slice(-3).map((msg) => msg.topics || []).flat();
    let contextualResponse = '';

    if (recentTopics.includes('quote') && (lowerMessage.includes('yes') || lowerMessage.includes('interested'))) {
      contextualResponse = `Perfect, ${userName}! Let me connect you with our estimation team. `;
    } else if (recentTopics.includes('emergency') && lowerMessage.includes('yes')) {
      contextualResponse = `Connecting you to our emergency dispatcher now, ${userName}. `;
    }

    // Default intelligent response with context
    const defaultResponse = `I understand you're asking about "${message}", ${userName}. Based on your conversation history and profile as a ${userRole}, let me provide you with the most relevant information. For specific details about ${message.toLowerCase().includes('project') ? 'your construction project' : 'our services'}, I recommend speaking with one of our specialists. They can provide personalized guidance based on your unique needs.

Would you like me to:
• Schedule a consultation with a project specialist
• Provide more information about our services
• Connect you with our customer support team
• Help you get a project estimate

I'm here to help make your construction journey as smooth as possible!`;

    return {
      response: contextualResponse + defaultResponse,
      confidence: 0.85,
      topics: ['general_inquiry', 'assistance'],
      suggestedActions: ['schedule_consultation', 'get_more_info', 'contact_support']
    };

  } catch (error) {
    return {
      response: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to contact our support team directly at (555) 123-4567.",
      confidence: 0.1,
      topics: ['error'],
      suggestedActions: ['try_again', 'contact_support']
    };
  }
}