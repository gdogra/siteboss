import React, { useState } from 'react';
import { useFeedback, Ticket, Comment } from '@/contexts/FeedbackContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Bug,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  X,
  Save,
  MessageSquare,
  Calendar,
  Tag,
  Archive,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Eye,
  Users
} from 'lucide-react';

interface TicketingSystemProps {
  className?: string;
}

const TicketingSystem: React.FC<TicketingSystemProps> = ({ className }) => {
  const {
    tickets,
    addTicket,
    updateTicket,
    deleteTicket,
    addComment,
    getTicketsByType,
    getTicketsByStatus,
    getTicketsByPriority,
    searchTickets,
    getTicketMetrics
  } = useFeedback();

  const [activeTab, setActiveTab] = useState('overview');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    type: 'bug' as Ticket['type'],
    priority: 'medium' as Ticket['priority'],
    category: 'functionality' as Ticket['category'],
    submittedBy: 'user-current',
    submittedByName: 'Current User',
    status: 'open' as Ticket['status'],
    tags: [] as string[],
    severity: 'minor' as Ticket['severity'],
    reproducible: true,
    stepsToReproduce: [''],
    expectedBehavior: '',
    actualBehavior: ''
  });

  const [newComment, setNewComment] = useState({
    content: '',
    isInternal: false
  });

  const metrics = getTicketMetrics();

  const getTypeIcon = (type: Ticket['type']) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4" />;
      case 'feature': return <Lightbulb className="w-4 h-4" />;
      case 'improvement': return <ArrowUp className="w-4 h-4" />;
      case 'question': return <MessageSquare className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent': return <Zap className="w-4 h-4 text-red-600" />;
      case 'high': return <ArrowUp className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'low': return <ArrowDown className="w-4 h-4 text-green-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity?: Ticket['severity']) => {
    switch (severity) {
      case 'blocker': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddTicket = () => {
    if (!newTicket.title || !newTicket.description) return;

    addTicket({
      ...newTicket,
      browserInfo: navigator.userAgent,
      stepsToReproduce: newTicket.stepsToReproduce.filter(step => step.trim() !== '')
    });

    setNewTicket({
      title: '',
      description: '',
      type: 'bug',
      priority: 'medium',
      category: 'functionality',
      submittedBy: 'user-current',
      submittedByName: 'Current User',
      status: 'open',
      tags: [],
      severity: 'minor',
      reproducible: true,
      stepsToReproduce: [''],
      expectedBehavior: '',
      actualBehavior: ''
    });

    setShowTicketModal(false);
    alert('Ticket created successfully!');
  };

  const handleAddComment = () => {
    if (!selectedTicket || !newComment.content) return;

    addComment(
      selectedTicket.id,
      newComment.content,
      'user-current',
      'Current User',
      newComment.isInternal
    );

    setNewComment({ content: '', isInternal: false });
    setShowCommentModal(false);

    setSelectedTicket(tickets.find(t => t.id === selectedTicket.id) || null);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || ticket.type === filterType;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3" onClick={() => {
        setSelectedTicket(ticket);
        setShowTicketModal(true);
      }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(ticket.type)}
            <div>
              <CardTitle className="text-sm font-medium">{ticket.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(ticket.status)} variant="outline">
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                  <div className="flex items-center">
                    {getPriorityIcon(ticket.priority)}
                    <span className="ml-1">{ticket.priority}</span>
                  </div>
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">#{ticket.id.slice(-8)}</div>
            {ticket.severity && (
              <Badge className={getSeverityColor(ticket.severity)} variant="outline">
                {ticket.severity}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 line-clamp-2">{ticket.description}</p>
        
        {ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {ticket.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{ticket.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {ticket.submittedByName}
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {ticket.comments.length > 0 && (
              <div className="flex items-center">
                <MessageSquare className="w-3 h-3 mr-1" />
                {ticket.comments.length}
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              {ticket.category}
            </Badge>
          </div>
        </div>

        {ticket.assignedToName && (
          <div className="flex items-center text-xs text-gray-600 pt-2 border-t">
            <Users className="w-3 h-3 mr-1" />
            Assigned to: {ticket.assignedToName}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ticket Management</h2>
          <p className="text-gray-600">Track bugs, features, and improvements</p>
        </div>
        <Button onClick={() => {
          setSelectedTicket(null);
          setShowTicketModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.openTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.resolvedTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.bugCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.featureCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResolutionTime}d</div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="board">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTicketsByType('bug').map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTicketsByType('feature').map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['open', 'in_progress', 'resolved', 'closed'].map((status) => {
              const statusTickets = getTicketsByStatus(status as Ticket['status']);
              return (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm capitalize border-b pb-2 flex-1">
                      {status.replace('_', ' ')} ({statusTickets.length})
                    </h3>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {statusTickets.map(ticket => (
                      <Card key={ticket.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(ticket.type)}
                              <span className="text-sm font-medium line-clamp-2">{ticket.title}</span>
                            </div>
                            {getPriorityIcon(ticket.priority)}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {ticket.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              #{ticket.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {selectedTicket ? `Ticket #${selectedTicket.id.slice(-8)}` : 'Create New Ticket'}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setShowTicketModal(false);
                    setSelectedTicket(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {selectedTicket ? (
                // View/Edit Ticket
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-medium mb-2">{selectedTicket.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedTicket.status)}>
                          {selectedTicket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(selectedTicket.priority)}>
                          <div className="flex items-center">
                            {getPriorityIcon(selectedTicket.priority)}
                            <span className="ml-1">{selectedTicket.priority}</span>
                          </div>
                        </Badge>
                        {selectedTicket.severity && (
                          <Badge className={getSeverityColor(selectedTicket.severity)}>
                            {selectedTicket.severity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCommentModal(true)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(newStatus) => {
                          updateTicket(selectedTicket.id, { 
                            status: newStatus as Ticket['status'],
                            ...(newStatus === 'resolved' && { resolvedAt: new Date().toISOString() })
                          });
                          setSelectedTicket({...selectedTicket, status: newStatus as Ticket['status']});
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Description</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          {selectedTicket.description}
                        </div>
                      </div>

                      {selectedTicket.stepsToReproduce && selectedTicket.stepsToReproduce.length > 0 && (
                        <div>
                          <Label className="font-medium">Steps to Reproduce</Label>
                          <ol className="mt-1 pl-4 space-y-1">
                            {selectedTicket.stepsToReproduce.map((step, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                {index + 1}. {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {selectedTicket.expectedBehavior && (
                        <div>
                          <Label className="font-medium">Expected Behavior</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                            {selectedTicket.expectedBehavior}
                          </div>
                        </div>
                      )}

                      {selectedTicket.actualBehavior && (
                        <div>
                          <Label className="font-medium">Actual Behavior</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                            {selectedTicket.actualBehavior}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="font-medium">Type</Label>
                          <div className="flex items-center mt-1">
                            {getTypeIcon(selectedTicket.type)}
                            <span className="ml-1 capitalize">{selectedTicket.type}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Category</Label>
                          <div className="mt-1">{selectedTicket.category}</div>
                        </div>
                        <div>
                          <Label className="font-medium">Submitted By</Label>
                          <div className="mt-1">{selectedTicket.submittedByName}</div>
                        </div>
                        <div>
                          <Label className="font-medium">Created</Label>
                          <div className="mt-1">{new Date(selectedTicket.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {selectedTicket.tags.length > 0 && (
                        <div>
                          <Label className="font-medium">Tags</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedTicket.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTicket.assignedToName && (
                        <div>
                          <Label className="font-medium">Assigned To</Label>
                          <div className="flex items-center mt-1">
                            <Users className="w-4 h-4 mr-1" />
                            {selectedTicket.assignedToName}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments */}
                  {selectedTicket.comments.length > 0 && (
                    <div>
                      <Label className="font-medium">Comments ({selectedTicket.comments.length})</Label>
                      <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                        {selectedTicket.comments.map((comment) => (
                          <div key={comment.id} className="border rounded-md p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="w-3 h-3" />
                                <span className="text-sm font-medium">{comment.authorName}</span>
                                {comment.isInternal && (
                                  <Badge variant="outline" className="text-xs">Internal</Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700">{comment.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Create New Ticket
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                        placeholder="Brief description of the issue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newTicket.type}
                        onValueChange={(value) => setNewTicket({...newTicket, type: value as Ticket['type']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value) => setNewTicket({...newTicket, priority: value as Ticket['priority']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value) => setNewTicket({...newTicket, category: value as Ticket['category']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ui">UI</SelectItem>
                          <SelectItem value="functionality">Functionality</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="integration">Integration</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newTicket.type === 'bug' && (
                      <div>
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                          value={newTicket.severity}
                          onValueChange={(value) => setNewTicket({...newTicket, severity: value as Ticket['severity']})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="blocker">Blocker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      placeholder="Detailed description of the issue, feature request, or improvement"
                      rows={4}
                    />
                  </div>

                  {newTicket.type === 'bug' && (
                    <>
                      <div>
                        <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                        <Textarea
                          id="expectedBehavior"
                          value={newTicket.expectedBehavior}
                          onChange={(e) => setNewTicket({...newTicket, expectedBehavior: e.target.value})}
                          placeholder="What should happen?"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="actualBehavior">Actual Behavior</Label>
                        <Textarea
                          id="actualBehavior"
                          value={newTicket.actualBehavior}
                          onChange={(e) => setNewTicket({...newTicket, actualBehavior: e.target.value})}
                          placeholder="What actually happens?"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Steps to Reproduce</Label>
                        <div className="space-y-2 mt-1">
                          {newTicket.stepsToReproduce.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 min-w-[20px]">{index + 1}.</span>
                              <Input
                                value={step}
                                onChange={(e) => {
                                  const newSteps = [...newTicket.stepsToReproduce];
                                  newSteps[index] = e.target.value;
                                  setNewTicket({...newTicket, stepsToReproduce: newSteps});
                                }}
                                placeholder={`Step ${index + 1}`}
                              />
                              {index > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newSteps = newTicket.stepsToReproduce.filter((_, i) => i !== index);
                                    setNewTicket({...newTicket, stepsToReproduce: newSteps});
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNewTicket({...newTicket, stepsToReproduce: [...newTicket.stepsToReproduce, '']});
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Step
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTicketModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddTicket}
                      disabled={!newTicket.title || !newTicket.description}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {showCommentModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Comment</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCommentModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    value={newComment.content}
                    onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                    placeholder="Add your comment..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="internal"
                    checked={newComment.isInternal}
                    onChange={(e) => setNewComment({...newComment, isInternal: e.target.checked})}
                  />
                  <Label htmlFor="internal" className="text-sm">
                    Internal comment (not visible to user)
                  </Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCommentModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.content}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketingSystem;