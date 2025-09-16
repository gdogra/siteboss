import React, { useState } from 'react';
import { useFeedback, Feedback } from '@/contexts/FeedbackContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Star,
  Bug,
  Lightbulb,
  ThumbsUp,
  Search,
  Filter,
  Plus,
  X,
  Save,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

interface FeedbackCollectionProps {
  className?: string;
}

const FeedbackCollection: React.FC<FeedbackCollectionProps> = ({ className }) => {
  const {
    feedback,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    convertFeedbackToTicket
  } = useFeedback();

  const [activeTab, setActiveTab] = useState('submit');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newFeedback, setNewFeedback] = useState({
    type: 'general' as Feedback['type'],
    rating: 0,
    title: '',
    message: '',
    category: 'general',
    submittedByName: 'Current User',
    submittedBy: 'user-current',
    page: window.location.pathname,
    browserInfo: navigator.userAgent
  });

  const getFeedbackTypeIcon = (type: Feedback['type']) => {
    switch (type) {
      case 'bug_report': return <Bug className="w-4 h-4" />;
      case 'feature_request': return <Lightbulb className="w-4 h-4" />;
      case 'satisfaction': return <ThumbsUp className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'acted_upon': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitFeedback = () => {
    if (!newFeedback.title || !newFeedback.message) return;

    addFeedback({
      ...newFeedback,
      browserInfo: navigator.userAgent,
      page: window.location.pathname
    });

    setNewFeedback({
      type: 'general',
      rating: 0,
      title: '',
      message: '',
      category: 'general',
      submittedByName: 'Current User',
      submittedBy: 'user-current',
      page: window.location.pathname,
      browserInfo: navigator.userAgent
    });

    setShowFeedbackModal(false);
    alert('Thank you for your feedback! We\'ll review it soon.');
  };

  const handleConvertToTicket = (feedbackId: string) => {
    const ticketId = convertFeedbackToTicket(feedbackId);
    if (ticketId) {
      alert(`Feedback converted to ticket ${ticketId}`);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const renderStarRating = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const FeedbackCard: React.FC<{ item: Feedback }> = ({ item }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getFeedbackTypeIcon(item.type)}
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(item.status)} variant="outline">
              {item.status.replace('_', ' ')}
            </Badge>
            {item.rating && renderStarRating(item.rating)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 line-clamp-3">{item.message}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>By {item.submittedByName}</span>
            <span>•</span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
            {item.page && (
              <Badge variant="outline" className="text-xs">
                {item.page}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedFeedback(item);
                setShowFeedbackModal(true);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {item.status === 'new' && (item.type === 'bug_report' || item.type === 'feature_request') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConvertToTicket(item.id)}
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Convert to Ticket
              </Button>
            )}
          </div>
          <Select
            value={item.status}
            onValueChange={(newStatus) => updateFeedback(item.id, { status: newStatus as Feedback['status'] })}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="acted_upon">Acted Upon</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedback & Suggestions</h2>
          <p className="text-gray-600">Help us improve SiteBoss with your feedback</p>
        </div>
        <Button onClick={() => setShowFeedbackModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Submit Feedback
        </Button>
      </div>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Items</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter(f => f.status === 'new').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bug Reports</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter(f => f.type === 'bug_report').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Requests</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.filter(f => f.type === 'feature_request').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="manage">Manage Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Feedback</CardTitle>
              <CardDescription>
                Share your thoughts, report bugs, or suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feedbackType">Feedback Type</Label>
                  <Select
                    value={newFeedback.type}
                    onValueChange={(value) => setNewFeedback({...newFeedback, type: value as Feedback['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="satisfaction">Satisfaction Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newFeedback.category}
                    onValueChange={(value) => setNewFeedback({...newFeedback, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="functionality">Functionality</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newFeedback.type === 'satisfaction' && (
                <div>
                  <Label>Overall Rating</Label>
                  <div className="mt-2">
                    {renderStarRating(newFeedback.rating, true, (rating) => 
                      setNewFeedback({...newFeedback, rating})
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({...newFeedback, title: e.target.value})}
                  placeholder="Brief description of your feedback"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({...newFeedback, message: e.target.value})}
                  placeholder="Detailed feedback, steps to reproduce (for bugs), or feature description"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmitFeedback}
                disabled={!newFeedback.title || !newFeedback.message}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="acted_upon">Acted Upon</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedback.map(item => (
              <FeedbackCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {selectedFeedback ? 'Feedback Details' : 'Submit New Feedback'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedFeedback(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {selectedFeedback ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    {getFeedbackTypeIcon(selectedFeedback.type)}
                    <h4 className="text-lg font-medium">{selectedFeedback.title}</h4>
                    <Badge className={getStatusColor(selectedFeedback.status)}>
                      {selectedFeedback.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {selectedFeedback.rating && (
                    <div>
                      <Label>Rating</Label>
                      {renderStarRating(selectedFeedback.rating)}
                    </div>
                  )}

                  <div>
                    <Label>Message</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      {selectedFeedback.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Submitted by:</strong> {selectedFeedback.submittedByName}
                    </div>
                    <div>
                      <strong>Date:</strong> {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Category:</strong> {selectedFeedback.category}
                    </div>
                    <div>
                      <strong>Page:</strong> {selectedFeedback.page}
                    </div>
                  </div>

                  {selectedFeedback.convertedToTicket && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-800">
                          Converted to ticket: {selectedFeedback.convertedToTicket}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {!selectedFeedback.convertedToTicket && (
                      selectedFeedback.type === 'bug_report' || selectedFeedback.type === 'feature_request'
                    ) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleConvertToTicket(selectedFeedback.id);
                          setShowFeedbackModal(false);
                        }}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Convert to Ticket
                      </Button>
                    )}
                    <Button onClick={() => setShowFeedbackModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div>This should not show - use the submit tab instead</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackCollection;