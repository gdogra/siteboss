import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'chart' | 'table' | 'action';
  metadata?: any;
}

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: '1',
        content: `Hello ${user?.first_name}! I'm your AI assistant. I can help you with:\n\n• Managing leads and customers\n• Analyzing project performance\n• Creating reports and insights\n• Scheduling and planning\n• Answering business questions\n\nWhat would you like to know?`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, user?.first_name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response - in production, this would call OpenAI/Claude API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = generateAIResponse(inputMessage);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('revenue') || lowerInput.includes('sales')) {
      return "📊 **Sales Performance Overview**\n\nBased on your current data:\n• Q4 Revenue: $1,247,000 (↑ 23% from Q3)\n• Active Deals: 12 ($340,000 pipeline)\n• Conversion Rate: 68%\n• Top Customer: ABC Corporation ($180,000)\n\nWould you like me to break this down by project type or create a detailed report?";
    }
    
    if (lowerInput.includes('project') || lowerInput.includes('timeline')) {
      return "🏗️ **Project Insights**\n\nActive Projects: 8\n• On Schedule: 6 projects\n• Behind Schedule: 2 projects (Johnson Renovation, Metro Office)\n• Completed This Month: 3 projects\n\nUpcoming Deadlines:\n• Metro Office Phase 2: Dec 15\n• Johnson Kitchen: Dec 22\n\nNeed help creating a new project timeline or adjusting existing schedules?";
    }
    
    if (lowerInput.includes('customer') || lowerInput.includes('lead')) {
      return "👥 **Customer & Lead Summary**\n\nNew Leads This Week: 7\n• High Priority: 2 leads\n• Qualified: 4 leads\n• Follow-up Needed: 3 leads\n\nTop Customers by Value:\n1. ABC Corporation - $180,000\n2. Johnson Family - $85,000\n3. Metro Properties - $120,000\n\nShall I help you prioritize follow-ups or create a customer outreach plan?";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
      return "🤖 **Here's how I can assist you:**\n\n**Analytics & Reports**\n• Sales performance analysis\n• Project status reports\n• Customer insights\n• Financial summaries\n\n**Task Management**\n• Schedule optimization\n• Priority recommendations\n• Follow-up reminders\n\n**Business Intelligence**\n• Trend analysis\n• Forecasting\n• Risk assessment\n• Opportunity identification\n\nJust ask me about any aspect of your business!";
    }
    
    // Default response
    return `I understand you're asking about "${input}". While I'm still learning about your specific business, I can help with:\n\n• Analyzing your sales and project data\n• Creating reports and insights\n• Managing customer relationships\n• Planning and scheduling\n\nCould you be more specific about what you'd like to know? For example, you could ask about revenue, project status, or customer information.`;
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .split('\n')
      .map((line, index) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        line = line.replace(/^• (.*)/, '<span class="flex"><span class="mr-2">•</span><span>$1</span></span>');
        
        return (
          <div key={index} className={line.includes('•') ? 'ml-2' : ''}>
            <span dangerouslySetInnerHTML={{ __html: line }} />
          </div>
        );
      });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 z-50 group"
        title="Open AI Assistant"
      >
        <SparklesIcon className="h-6 w-6" />
        <div className="absolute -top-2 -left-2 bg-green-500 w-4 h-4 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-2 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-primary-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:bg-white/20 p-1 rounded-md transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">
                {message.role === 'assistant' ? (
                  formatMessage(message.content)
                ) : (
                  message.content
                )}
              </div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your business..."
              className="w-full p-2 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '80px' }}
            />
            <button
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-2 top-2 p-1 rounded-md transition-colors ${
                isListening 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? (
                <StopIcon className="h-5 w-5" />
              ) : (
                <MicrophoneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        
        {isListening && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            Listening...
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;