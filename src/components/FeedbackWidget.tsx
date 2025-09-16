import React, { useState } from 'react';
import { useFeedback, Feedback } from '@/contexts/FeedbackContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Star,
  Bug,
  Lightbulb,
  ThumbsUp,
  X,
  Send,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ 
  position = 'bottom-right',
  className 
}) => {
  const { addFeedback } = useFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [feedbackType, setFeedbackType] = useState<Feedback['type']>('general');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getFeedbackTypeIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'bug_report': return <Bug className="w-4 h-4" />;
      case 'feature_request': return <Lightbulb className="w-4 h-4" />;
      case 'satisfaction': return <ThumbsUp className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const renderStarRating = (currentRating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= currentRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = () => {
    if (!title || !message) return;

    addFeedback({
      type: feedbackType,
      rating: feedbackType === 'satisfaction' ? rating : undefined,
      title,
      message,
      category: 'general',
      submittedByName: 'Current User',
      submittedBy: 'user-current',
      page: window.location.pathname,
      browserInfo: navigator.userAgent
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
      setTitle('');
      setMessage('');
      setRating(0);
      setFeedbackType('general');
    }, 2000);
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setRating(0);
    setFeedbackType('general');
    setIsSubmitted(false);
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl border w-80 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Quick Feedback</h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Thank you!</h4>
                <p className="text-sm text-gray-600">Your feedback has been submitted.</p>
              </div>
            ) : (
              <>
                <div>
                  <Label className="text-sm font-medium">Feedback Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { type: 'general' as const, label: 'General', icon: MessageSquare },
                      { type: 'bug_report' as const, label: 'Bug Report', icon: Bug },
                      { type: 'feature_request' as const, label: 'Feature', icon: Lightbulb },
                      { type: 'satisfaction' as const, label: 'Rating', icon: ThumbsUp }
                    ].map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => setFeedbackType(type)}
                        className={`flex items-center space-x-2 p-2 rounded-md text-xs transition-colors ${
                          feedbackType === type
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {feedbackType === 'satisfaction' && (
                  <div>
                    <Label className="text-sm font-medium">Overall Rating</Label>
                    <div className="mt-2">
                      {renderStarRating(rating, true, setRating)}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="widget-title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="widget-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      feedbackType === 'bug_report' ? 'Brief description of the bug' :
                      feedbackType === 'feature_request' ? 'Feature you\'d like to see' :
                      'Brief summary of your feedback'
                    }
                    className="mt-1 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="widget-message" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="widget-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'bug_report' ? 'Steps to reproduce, expected vs actual behavior...' :
                      feedbackType === 'feature_request' ? 'How would this feature help you?' :
                      'Share your thoughts, suggestions, or concerns...'
                    }
                    rows={3}
                    className="mt-1 text-sm resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Badge variant="outline" className="text-xs">
                    Page: {window.location.pathname}
                  </Badge>
                  <Button
                    onClick={handleSubmit}
                    disabled={!title || !message}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;