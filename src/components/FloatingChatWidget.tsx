import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import EnhancedChatBot from '@/components/EnhancedChatBot';

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ bottom: '1rem', right: '1rem' });
  const chatRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Ensure chat stays within viewport bounds
  useEffect(() => {
    if (isOpen && chatRef.current) {
      const adjustPosition = () => {
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        // Chat dimensions
        const chatWidth = Math.min(384, viewport.width - 32); // w-96 = 384px, with margin
        const chatHeight = Math.min(384, viewport.height - 128); // h-96 = 384px, with margin

        // Calculate safe positioning
        let newBottom = '1rem';
        let newRight = '1rem';

        // Check if chat would go off screen horizontally
        if (viewport.width < chatWidth + 80) {// 80px for button and margins
          newRight = '0.5rem';
        }

        // Check if chat would go off screen vertically
        if (viewport.height < chatHeight + 120) {// 120px for button and margins
          newBottom = '0.5rem';
        }

        setPosition({ bottom: newBottom, right: newRight });
      };

      adjustPosition();
      window.addEventListener('resize', adjustPosition);

      return () => window.removeEventListener('resize', adjustPosition);
    }
  }, [isOpen]);

  return (
    <div
      className="fixed z-50"
      style={{
        bottom: position.bottom,
        right: position.right
      }}>

      {/* Chat Interface - appears when open */}
      <div
        ref={chatRef}
        className={`mb-4 transition-all duration-300 ease-in-out transform origin-bottom-right ${
        isOpen ?
        'opacity-100 scale-100 translate-y-0' :
        'opacity-0 scale-95 translate-y-2 pointer-events-none'}`
        }>

        <div className="w-96 h-96 max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
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
              className="text-white hover:bg-blue-800 h-8 w-8 p-0">

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
        isOpen ? 'rotate-0' : 'rotate-0 hover:scale-110'}`
        }
        size="sm">

        <MessageCircle
          size={24}
          className={`text-white transition-transform duration-200 ${
          isOpen ? 'scale-90' : 'scale-100'}`
          } />

      </Button>

      {/* Enhanced Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .w-96 {
            width: calc(100vw - 1rem) !important;
            max-width: calc(100vw - 1rem) !important;
          }
          .h-96 {
            height: calc(100vh - 8rem) !important;
            max-height: calc(100vh - 8rem) !important;
          }
        }
        
        @media (max-width: 640px) {
          .w-96 {
            width: calc(100vw - 0.5rem) !important;
            max-width: calc(100vw - 0.5rem) !important;
          }
          .h-96 {
            height: calc(100vh - 6rem) !important;
            max-height: calc(100vh - 6rem) !important;
          }
        }
        
        @media (max-width: 480px) {
          .w-14 {
            width: 3rem !important;
            height: 3rem !important;
          }
          .w-96 {
            width: calc(100vw - 0.5rem) !important;
            max-width: calc(100vw - 0.5rem) !important;
          }
          .h-96 {
            height: calc(100vh - 5rem) !important;
            max-height: calc(100vh - 5rem) !important;
          }
        }
        
        /* Ensure chat doesn't go off screen on very small devices */
        @media (max-width: 320px) {
          .w-96 {
            width: 100vw !important;
            max-width: 100vw !important;
            margin-left: -0.5rem;
            margin-right: -0.5rem;
            border-radius: 0.75rem 0.75rem 0 0 !important;
          }
          .h-96 {
            height: calc(100vh - 4rem) !important;
            max-height: calc(100vh - 4rem) !important;
          }
        }
      `}</style>
    </div>);

};

export default FloatingChatWidget;