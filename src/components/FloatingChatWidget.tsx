import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Move } from 'lucide-react';
import EnhancedChatBot from '@/components/EnhancedChatBot';

const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Initialize position on mount
  useEffect(() => {
    const initPosition = () => {
      setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    };
    initPosition();
    window.addEventListener('resize', initPosition);
    return () => window.removeEventListener('resize', initPosition);
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!widgetRef.current) return;

    setIsDragging(true);
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep widget within screen bounds
    const maxX = window.innerWidth - 56; // 56px for widget width
    const maxY = window.innerHeight - 56; // 56px for widget height

    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Attach global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={widgetRef}
      className={`fixed z-50 transition-all duration-200 ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}>


      {/* Chat Interface - appears when open */}
      <div
        ref={chatRef}
        className={`mb-4 transition-all duration-300 ease-in-out transform ${
        isOpen ?
        'opacity-100 scale-100 translate-y-0' :
        'opacity-0 scale-95 translate-y-2 pointer-events-none'}`
        }
        style={{
          transformOrigin: position.x > window.innerWidth / 2 ? 'bottom-right' : 'bottom-left'
        }}>


        <div className="w-96 h-96 max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Chat Header with Drag Handle */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                onMouseDown={handleMouseDown}
                className={`p-1 rounded hover:bg-white/10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-colors`}
                title="Drag to move">

                <Move size={16} />
              </div>
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
            <EnhancedChatBot isFloatingMode={true} />
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <Button
        onClick={!isDragging ? toggleChat : undefined}
        onMouseDown={handleMouseDown}
        className={`rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 ${
        isOpen ? 'rotate-0' : 'rotate-0 hover:scale-110'} ${isDragging ? 'cursor-grabbing scale-95' : 'cursor-grab hover:cursor-grab'}`
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