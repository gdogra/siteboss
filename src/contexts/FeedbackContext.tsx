import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'ui' | 'functionality' | 'performance' | 'integration' | 'other';
  submittedBy: string;
  submittedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments?: string[];
  comments: Comment[];
  severity?: 'minor' | 'major' | 'critical' | 'blocker';
  reproducible?: boolean;
  browserInfo?: string;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface Feedback {
  id: string;
  type: 'general' | 'feature_request' | 'bug_report' | 'satisfaction';
  rating?: number; // 1-5 stars
  title: string;
  message: string;
  category: string;
  submittedBy: string;
  submittedByName: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'acted_upon' | 'dismissed';
  page?: string;
  browserInfo?: string;
  convertedToTicket?: string; // ticket ID if converted
}

interface FeedbackContextType {
  tickets: Ticket[];
  feedback: Feedback[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => string;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addComment: (ticketId: string, content: string, author: string, authorName: string, isInternal?: boolean) => void;
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => string;
  updateFeedback: (id: string, updates: Partial<Feedback>) => void;
  deleteFeedback: (id: string) => void;
  convertFeedbackToTicket: (feedbackId: string) => string;
  getTicketsByType: (type: Ticket['type']) => Ticket[];
  getTicketsByStatus: (status: Ticket['status']) => Ticket[];
  getTicketsByPriority: (priority: Ticket['priority']) => Ticket[];
  searchTickets: (query: string) => Ticket[];
  getTicketMetrics: () => {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    avgResolutionTime: number;
    bugCount: number;
    featureCount: number;
    criticalCount: number;
  };
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

interface FeedbackProviderProps {
  children: ReactNode;
}

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const stored = localStorage.getItem('siteboss_tickets');
      if (stored) {
        return JSON.parse(stored) as Ticket[];
      }
    } catch {}
    return [
      {
        id: 'ticket-1',
        title: 'Dashboard loading slowly on Chrome',
        description: 'The project dashboard takes more than 10 seconds to load on Chrome browser. This happens consistently with large projects.',
        type: 'bug',
        priority: 'high',
        status: 'open',
        category: 'performance',
        submittedBy: 'user-1',
        submittedByName: 'John Smith',
        createdAt: '2024-01-15T09:30:00Z',
        updatedAt: '2024-01-15T09:30:00Z',
        tags: ['performance', 'chrome', 'dashboard'],
        comments: [],
        severity: 'major',
        reproducible: true,
        browserInfo: 'Chrome 120.0.6099.109',
        stepsToReproduce: [
          'Open project dashboard',
          'Select a project with >100 tasks',
          'Observe loading time'
        ],
        expectedBehavior: 'Dashboard should load within 3 seconds',
        actualBehavior: 'Dashboard takes 10+ seconds to load'
      },
      {
        id: 'ticket-2',
        title: 'Add dark mode support',
        description: 'Users have requested a dark mode theme for better usability during night work sessions.',
        type: 'feature',
        priority: 'medium',
        status: 'in_progress',
        category: 'ui',
        submittedBy: 'user-2',
        submittedByName: 'Sarah Johnson',
        assignedTo: 'dev-1',
        assignedToName: 'Development Team',
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-12T10:15:00Z',
        tags: ['ui', 'theme', 'accessibility'],
        comments: [
          {
            id: 'comment-1',
            ticketId: 'ticket-2',
            content: 'Started working on this. Will implement using CSS variables for theming.',
            author: 'dev-1',
            authorName: 'Development Team',
            createdAt: '2024-01-12T10:15:00Z'
          }
        ]
      }
    ];
  });

  const [feedback, setFeedback] = useState<Feedback[]>(() => {
    try {
      const stored = localStorage.getItem('siteboss_feedback');
      if (stored) {
        return JSON.parse(stored) as Feedback[];
      }
    } catch {}
    return [
      {
        id: 'feedback-1',
        type: 'satisfaction',
        rating: 4,
        title: 'Great project management features',
        message: 'Love the new project dashboard! The timeline view is especially helpful for tracking progress.',
        category: 'general',
        submittedBy: 'user-1',
        submittedByName: 'John Smith',
        createdAt: '2024-01-14T16:45:00Z',
        status: 'reviewed',
        page: '/projects'
      },
      {
        id: 'feedback-2',
        type: 'feature_request',
        title: 'Export project data to Excel',
        message: 'It would be great to have an export feature that allows exporting project data to Excel format for reporting.',
        category: 'functionality',
        submittedBy: 'user-2',
        submittedByName: 'Sarah Johnson',
        createdAt: '2024-01-13T11:20:00Z',
        status: 'new',
        page: '/projects'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('siteboss_tickets', JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem('siteboss_feedback', JSON.stringify(feedback));
    } catch {}
  }, [feedback]);

  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): string => {
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTicket: Ticket = {
      ...ticketData,
      id: ticketId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };
    setTickets(prev => [...prev, newTicket]);
    return ticketId;
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === id 
        ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
        : ticket
    ));
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
  };

  const addComment = (ticketId: string, content: string, author: string, authorName: string, isInternal = false) => {
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newComment: Comment = {
      id: commentId,
      ticketId,
      content,
      author,
      authorName,
      createdAt: new Date().toISOString(),
      isInternal
    };

    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { 
            ...ticket, 
            comments: [...ticket.comments, newComment],
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
  };

  const addFeedback = (feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'status'>): string => {
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFeedback: Feedback = {
      ...feedbackData,
      id: feedbackId,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    setFeedback(prev => [...prev, newFeedback]);
    return feedbackId;
  };

  const updateFeedback = (id: string, updates: Partial<Feedback>) => {
    setFeedback(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteFeedback = (id: string) => {
    setFeedback(prev => prev.filter(item => item.id !== id));
  };

  const convertFeedbackToTicket = (feedbackId: string): string => {
    const feedbackItem = feedback.find(f => f.id === feedbackId);
    if (!feedbackItem) return '';

    const ticketType: Ticket['type'] = 
      feedbackItem.type === 'bug_report' ? 'bug' :
      feedbackItem.type === 'feature_request' ? 'feature' : 'improvement';

    const ticketId = addTicket({
      title: feedbackItem.title,
      description: feedbackItem.message,
      type: ticketType,
      priority: 'medium',
      status: 'open',
      category: feedbackItem.category as Ticket['category'] || 'other',
      submittedBy: feedbackItem.submittedBy,
      submittedByName: feedbackItem.submittedByName,
      tags: ['converted-from-feedback'],
      browserInfo: feedbackItem.browserInfo
    });

    updateFeedback(feedbackId, { 
      status: 'acted_upon',
      convertedToTicket: ticketId
    });

    return ticketId;
  };

  const getTicketsByType = (type: Ticket['type']) => {
    return tickets.filter(ticket => ticket.type === type);
  };

  const getTicketsByStatus = (status: Ticket['status']) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getTicketsByPriority = (priority: Ticket['priority']) => {
    return tickets.filter(ticket => ticket.priority === priority);
  };

  const searchTickets = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(lowercaseQuery) ||
      ticket.description.toLowerCase().includes(lowercaseQuery) ||
      ticket.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getTicketMetrics = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    
    const resolvedWithTimes = tickets.filter(t => t.resolvedAt && t.createdAt);
    const avgResolutionTime = resolvedWithTimes.length > 0 
      ? resolvedWithTimes.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    const bugCount = tickets.filter(t => t.type === 'bug').length;
    const featureCount = tickets.filter(t => t.type === 'feature').length;
    const criticalCount = tickets.filter(t => t.severity === 'critical' || t.severity === 'blocker').length;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      bugCount,
      featureCount,
      criticalCount
    };
  };

  return (
    <FeedbackContext.Provider value={{
      tickets,
      feedback,
      addTicket,
      updateTicket,
      deleteTicket,
      addComment,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      convertFeedbackToTicket,
      getTicketsByType,
      getTicketsByStatus,
      getTicketsByPriority,
      searchTickets,
      getTicketMetrics
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};