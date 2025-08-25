import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'chart' | 'table' | 'action';
  metadata?: any;
}

interface AIContextType {
  isAIOpen: boolean;
  messages: AIMessage[];
  toggleAI: () => void;
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleAI = () => {
    setIsAIOpen(prev => !prev);
  };

  const addMessage = (message: AIMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: AIContextType = {
    isAIOpen,
    messages,
    toggleAI,
    addMessage,
    clearMessages,
    isProcessing,
    setIsProcessing
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};