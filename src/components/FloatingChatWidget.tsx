import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import EnhancedChatBot from '@/components/EnhancedChatBot';

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Interface - appears when open */}
      <div
        className={`mb-4 transition-all duration-300 ease-in-out transform origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="w-96 h-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-white hover:bg-blue-800 h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
          
          {/* Chat Content */}
          <div className="h-[calc(100%-4rem)]">
            <EnhancedChatBot />
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <Button
        onClick={toggleChat}
        className={`rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 ${
          isOpen ? 'rotate-0' : 'rotate-0 hover:scale-110'
        }`}
        size="sm"
      >
        <MessageCircle 
          size={24} 
          className={`text-white transition-transform duration-200 ${
            isOpen ? 'scale-90' : 'scale-100'
          }`} 
        />
      </Button>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .w-96 {
            width: calc(100vw - 2rem) !important;
          }
          .h-96 {
            height: 70vh !important;
          }
        }
        
        @media (max-width: 480px) {
          .w-14 {
            width: 3rem !important;
            height: 3rem !important;
          }
          .bottom-4 {
            bottom: 1rem !important;
          }
          .right-4 {
            right: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingChatWidget;