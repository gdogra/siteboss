
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, X, Send, Bot, User, Star, History, Settings, ThumbsUp, ThumbsDown, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  topics?: string[];
  confidence?: number;
  suggestedActions?: string[];
  responseTime?: number;
  rating?: number;
}

interface Conversation {
  id: number;
  session_id: string;
  created_at: string;
  updated_at: string;
}

interface UserInfo {
  ID: number;
  Name: string;
  Email: string;
  Roles: string;
}

interface EnhancedChatBotProps {
  isFloatingMode?: boolean;
}

const EnhancedChatBot: React.FC<EnhancedChatBotProps> = ({ isFloatingMode = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    avgResponseTime: 0,
    sessionDuration: 0,
    topicsDiscussed: [] as string[]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-focus input after bot responds
  useEffect(() => {
    if (!isTyping && inputRef.current && messages.length > 0) {
      // Shorter delay for floating mode for better responsiveness
      const delay = isFloatingMode ? 200 : 300;
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isTyping, messages.length, isFloatingMode]);

  // Additional focus management for floating mode
  useEffect(() => {
    if (isFloatingMode && inputRef.current && !isTyping) {
      // Ensure input is focused when not typing in floating mode
      const timer = setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFloatingMode, isTyping]);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data, error } = await window.ezsite.apis.getUserInfo();
      if (!error && data) {
        setUserInfo(data);
        await loadConversationHistory(data.ID.toString());
      }
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const loadConversationHistory = async (userId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage(34879, { // chatbot_conversations table
        PageNo: 1,
        PageSize: 10,
        OrderByField: "created_at",
        IsAsc: false,
        Filters: [
        {
          name: "user_id",
          op: "Equal",
          value: userId
        }]

      });

      if (!error && data?.List) {
        setConversationHistory(data.List);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewConversation = async () => {
    try {
      if (!userInfo) {
        // For anonymous users, create a simple session
        const sessionId = 'session_' + Date.now();
        setCurrentConversation({
          id: 0,
          session_id: sessionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // For authenticated users, create in database
        const { data: conversationData } = await window.ezsite.apis.run({
          path: "createConversation",
          param: [userInfo.ID.toString()]
        });

        const { error } = await window.ezsite.apis.tableCreate(34879, conversationData);
        if (!error) {
          const newConversation = { ...conversationData, id: Date.now() }; // Temporary ID
          setCurrentConversation(newConversation);
          setConversationHistory((prev) => [newConversation, ...prev]);
        }
      }

      setMessages([{
        id: '1',
        text: userInfo ?
        `Hello ${userInfo.Name}! I'm your Laguna Bay Development assistant. How can I help you today?` :
        `Hello! I'm your Laguna Bay Development assistant. How can I help you today?`,
        isBot: true,
        timestamp: new Date(),
        confidence: 1.0
      }]);

      setSessionStartTime(new Date());
      setAnalytics({
        totalMessages: 0,
        avgResponseTime: 0,
        sessionDuration: 0,
        topicsDiscussed: []
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start new conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!currentConversation) {
      await startNewConversation();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const startTime = Date.now();

    try {
      // Save user message if authenticated
      if (userInfo && currentConversation) {
        const { data: messageData } = await window.ezsite.apis.run({
          path: "saveMessage",
          param: [currentConversation.id, 'user', userMessage.text, 0, 0]
        });
        await window.ezsite.apis.tableCreate(34880, messageData);
      }

      // Generate intelligent response
      const userContext = userInfo ? {
        userName: userInfo.Name,
        userRole: userInfo.Roles || 'user',
        userId: userInfo.ID.toString()
      } : {};

      const conversationContext = messages.slice(-5).map((m) => ({
        text: m.text,
        isBot: m.isBot,
        topics: m.topics || []
      }));

      const { data: responseData } = await window.ezsite.apis.run({
        path: "generateChatResponse",
        param: [userMessage.text, conversationContext, userContext]
      });

      const responseTime = Date.now() - startTime;

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseData.response,
        isBot: true,
        timestamp: new Date(),
        topics: responseData.topics,
        confidence: responseData.confidence,
        suggestedActions: responseData.suggestedActions,
        responseTime
      };

      setMessages((prev) => [...prev, botResponse]);

      // Save bot message if authenticated
      if (userInfo && currentConversation) {
        const { data: botMessageData } = await window.ezsite.apis.run({
          path: "saveMessage",
          param: [currentConversation.id, 'bot', botResponse.text, responseTime, responseData.confidence]
        });
        await window.ezsite.apis.tableCreate(34880, botMessageData);
      }

      // Update analytics
      const allTopics = [...analytics.topicsDiscussed, ...(responseData.topics || [])];
      const uniqueTopics = [...new Set(allTopics)];

      setAnalytics((prev) => ({
        totalMessages: prev.totalMessages + 2,
        avgResponseTime: (prev.avgResponseTime + responseTime) / 2,
        sessionDuration: sessionStartTime ? (Date.now() - sessionStartTime.getTime()) / 1000 : 0,
        topicsDiscussed: uniqueTopics
      }));

    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our support team at (555) 123-4567.",
        isBot: true,
        timestamp: new Date(),
        confidence: 0.1
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const rateMessage = async (messageId: string, rating: number) => {
    setMessages((prev) => prev.map((msg) =>
    msg.id === messageId ? { ...msg, rating } : msg
    ));

    toast({
      title: "Thank you!",
      description: "Your feedback helps us improve our service."
    });

    // Update analytics with user satisfaction if authenticated
    if (userInfo && currentConversation) {
      try {
        const { data: analyticsData } = await window.ezsite.apis.run({
          path: "updateAnalytics",
          param: [
          currentConversation.session_id,
          userInfo.ID.toString(),
          analytics.totalMessages,
          analytics.sessionDuration,
          analytics.topicsDiscussed,
          rating]

        });
        await window.ezsite.apis.tableCreate(34881, analyticsData);
      } catch (error) {
        console.error('Error saving analytics:', error);
      }
    }
  };

  const loadPreviousConversation = async (conversation: Conversation) => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(34880, { // chatbot_messages table
        PageNo: 1,
        PageSize: 100,
        OrderByField: "timestamp",
        IsAsc: true,
        Filters: [
        {
          name: "conversation_id",
          op: "Equal",
          value: conversation.id
        }]

      });

      if (!error && data?.List) {
        const loadedMessages: Message[] = data.List.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.content,
          isBot: msg.message_type === 'bot',
          timestamp: new Date(msg.timestamp),
          confidence: msg.nlp_confidence_score,
          responseTime: msg.response_time
        }));

        setMessages(loadedMessages);
        setCurrentConversation(conversation);
        toast({
          title: "Conversation Loaded",
          description: "Previous conversation has been restored."
        });
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Chat Window */}
      <div className="w-full h-full">
        <Card className="w-full h-full flex flex-col shadow-none border-0 bg-white">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-lg text-white">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-sm">LBD Assistant</h3>
                  <p className="text-xs opacity-90">
                    {userInfo ? `Hi, ${userInfo.Name}` : 'Online now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TabsList className="bg-white/20">
                  <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
                  {userInfo && <TabsTrigger value="history" className="text-xs">History</TabsTrigger>}
                  <TabsTrigger value="analytics" className="text-xs">Stats</TabsTrigger>
                </TabsList>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ display: 'none' }}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 &&
                  <div className="text-center py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                      <p className="text-gray-600 mb-4">
                        {userInfo ? `Welcome back, ${userInfo.Name}!` : 'Welcome to Laguna Bay Development!'}
                      </p>
                      <Button onClick={startNewConversation} className="bg-blue-600 hover:bg-blue-700">
                        Start New Conversation
                      </Button>
                    </div>
                  }
                  
                  {messages.map((message) =>
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-2",
                      !message.isBot && "flex-row-reverse space-x-reverse"
                    )}>
                      <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                      message.isBot ?
                      "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                        {message.isBot ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      </div>
                      
                      <div className="max-w-[70%]">
                        <div className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        message.isBot ?
                        "bg-gray-100 text-gray-900" :
                        "bg-blue-600 text-white"
                      )}>
                          <p className="whitespace-pre-line">{message.text}</p>
                          
                          {/* Message metadata */}
                          <div className={cn(
                          "flex items-center justify-between mt-2 text-xs opacity-70",
                          message.isBot ? "text-gray-500" : "text-blue-100"
                        )}>
                            <span>{formatTime(message.timestamp)}</span>
                            {message.isBot && message.confidence &&
                          <Badge variant="outline" className="text-xs">
                                {Math.round(message.confidence * 100)}% confidence
                              </Badge>
                          }
                            {message.responseTime &&
                          <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{message.responseTime}ms</span>
                              </span>
                          }
                          </div>
                          
                          {/* Topics */}
                          {message.topics && message.topics.length > 0 &&
                        <div className="flex flex-wrap gap-1 mt-2">
                              {message.topics.map((topic) =>
                          <Badge key={topic} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                          )}
                            </div>
                        }
                        </div>
                        
                        {/* Suggested Actions */}
                        {message.suggestedActions && message.suggestedActions.length > 0 &&
                      <div className="mt-2 space-y-1">
                            {message.suggestedActions.slice(0, 3).map((action) =>
                        <Button
                          key={action}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => {
                            setInputValue(action.replace(/_/g, ' '));
                            // Focus input after setting suggested action
                            setTimeout(() => {
                              if (inputRef.current) {
                                inputRef.current.focus();
                              }
                            }, 50);
                          }}>

                                {action.replace(/_/g, ' ')}
                              </Button>
                        )}
                          </div>
                      }
                        
                        {/* Rating for bot messages */}
                        {message.isBot && !message.rating &&
                      <div className="flex items-center space-x-1 mt-2">
                            <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rateMessage(message.id, 1)}
                          className="h-6 w-6 p-0 text-green-600 hover:bg-green-50">

                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rateMessage(message.id, -1)}
                          className="h-6 w-6 p-0 text-red-600 hover:bg-red-50">

                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                      }
                        
                        {message.rating &&
                      <div className="mt-1 flex items-center space-x-1">
                            {message.rating > 0 ?
                        <ThumbsUp className="h-3 w-3 text-green-600" /> :

                        <ThumbsDown className="h-3 w-3 text-red-600" />
                        }
                            <span className="text-xs text-gray-500">Thank you for your feedback!</span>
                          </div>
                      }
                      </div>
                    </div>
                  )}
                  
                  {isTyping &&
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
                  }
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
                    disabled={isTyping} />

                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Session Info */}
                {currentConversation &&
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Session: {formatDuration(analytics.sessionDuration)}</span>
                    <span>Messages: {analytics.totalMessages}</span>
                    {analytics.avgResponseTime > 0 &&
                  <span>Avg Response: {Math.round(analytics.avgResponseTime)}ms</span>
                  }
                  </div>
                }
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by Laguna Bay Development AI
                </p>
              </div>
            </TabsContent>

            {/* History Tab */}
            {userInfo &&
            <TabsContent value="history" className="flex-1 flex flex-col m-0">
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Conversation History</h3>
                    <Button
                    onClick={() => loadConversationHistory(userInfo.ID.toString())}
                    variant="outline"
                    size="sm"
                    disabled={isLoadingHistory}>

                      <History className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-96">
                    {isLoadingHistory ?
                  <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading history...</p>
                      </div> :
                  conversationHistory.length === 0 ?
                  <div className="text-center py-8">
                        <History className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No previous conversations</p>
                      </div> :

                  <div className="space-y-2">
                        {conversationHistory.map((conversation) =>
                    <Card
                      key={conversation.session_id}
                      className="p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => loadPreviousConversation(conversation)}>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">
                                  Session {conversation.session_id.slice(-8)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(conversation.created_at).toLocaleDateString()} at {new Date(conversation.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                              <MessageCircle className="h-4 w-4 text-blue-600" />
                            </div>
                          </Card>
                    )}
                      </div>
                  }
                  </ScrollArea>
                </div>
              </TabsContent>
            }

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="flex-1 flex flex-col m-0">
              <div className="p-4 flex-1">
                <h3 className="font-semibold mb-4">Session Analytics</h3>
                
                <div className="space-y-4">
                  <Card className="p-3">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Messages</p>
                        <p className="text-lg font-bold">{analytics.totalMessages}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Session Duration</p>
                        <p className="text-lg font-bold">{formatDuration(analytics.sessionDuration)}</p>
                      </div>
                    </div>
                  </Card>
                  
                  {analytics.avgResponseTime > 0 &&
                  <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Avg Response Time</p>
                          <p className="text-lg font-bold">{Math.round(analytics.avgResponseTime)}ms</p>
                        </div>
                      </div>
                    </Card>
                  }
                  
                  {analytics.topicsDiscussed.length > 0 &&
                  <Card className="p-3">
                      <p className="text-sm font-medium mb-2">Topics Discussed</p>
                      <div className="flex flex-wrap gap-1">
                        {analytics.topicsDiscussed.map((topic) =>
                      <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                      )}
                      </div>
                    </Card>
                  }
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>);

};

export default EnhancedChatBot;