import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Laguna Bay Development assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getAutomatedResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Construction and project related responses
    if (message.includes('quote') || message.includes('estimate') || message.includes('price')) {
      return "I'd be happy to help you get a quote! You can request a detailed estimate by visiting our Get Quote page or calling us at (555) 123-4567. Our team will assess your project and provide a comprehensive quote within 24-48 hours.";
    }
    
    if (message.includes('service') || message.includes('what do you do')) {
      return "Laguna Bay Development specializes in residential and commercial construction, renovations, remodeling, and project management. We handle everything from small repairs to large-scale construction projects with professional expertise.";
    }
    
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return "You can reach us at:\n📞 Phone: (555) 123-4567\n📧 Email: info@lagunabaydev.com\n📍 Office: 123 Construction Way, Laguna Bay, CA\n🕒 Hours: Monday-Friday 8AM-6PM";
    }
    
    if (message.includes('timeline') || message.includes('how long') || message.includes('duration')) {
      return "Project timelines vary depending on scope and complexity. Small renovations typically take 1-2 weeks, while larger construction projects can take 2-6 months. We'll provide a detailed timeline with your project proposal.";
    }
    
    if (message.includes('license') || message.includes('insured') || message.includes('certified')) {
      return "Yes, Laguna Bay Development is fully licensed, bonded, and insured. We maintain all required certifications and our team consists of qualified professionals with years of experience in the construction industry.";
    }
    
    if (message.includes('payment') || message.includes('invoice') || message.includes('billing')) {
      return "We offer flexible payment options and transparent billing. You can submit invoices through our online portal, and we accept various payment methods. Contact our accounting department for specific payment arrangements.";
    }
    
    if (message.includes('emergency') || message.includes('urgent') || message.includes('asap')) {
      return "For emergency construction needs, please call us immediately at (555) 123-4567. We offer 24/7 emergency response for urgent situations. Our team will assess and address critical issues promptly.";
    }
    
    if (message.includes('materials') || message.includes('supply') || message.includes('quality')) {
      return "We use only high-quality materials from trusted suppliers. Our team can source materials directly or work with your preferred suppliers. We ensure all materials meet industry standards and project specifications.";
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! Is there anything else I can help you with regarding your construction needs?";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! Welcome to Laguna Bay Development. I'm here to assist you with any questions about our construction services, getting quotes, or general inquiries. How can I help you today?";
    }
    
    if (message.includes('bye') || message.includes('goodbye')) {
      return "Thank you for contacting Laguna Bay Development! Feel free to reach out anytime if you have more questions. Have a great day!";
    }
    
    // Default response
    return "I understand you're asking about '" + userMessage + "'. For detailed information about our construction services, quotes, or specific project requirements, I recommend contacting our team directly at (555) 123-4567 or visiting our Get Quote page. Is there a specific service you'd like to know more about?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutomatedResponse(userMessage.text),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}>
        <Card className="w-80 h-96 flex flex-col shadow-2xl border-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-lg text-white">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold text-sm">LBD Assistant</h3>
                <p className="text-xs opacity-90">Online now</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start space-x-2",
                    !message.isBot && "flex-row-reverse space-x-reverse"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    message.isBot 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {message.isBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  </div>
                  <div className={cn(
                    "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                    message.isBot
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-600 text-white"
                  )}>
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      message.isBot ? "text-gray-500" : "text-blue-100"
                    )}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
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
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Laguna Bay Development
            </p>
          </div>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600",
          isOpen && "rotate-180 transform"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white" />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              !
            </Badge>
          </div>
        )}
      </Button>
    </>
  );
};

export default ChatBot;