import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileImage,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react';

interface ChangeOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  reason: 'scope_change' | 'design_change' | 'site_conditions' | 'client_request' | 'code_requirement' | 'weather' | 'other';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  cost_impact: number;
  time_impact_days: number;
  requested_by: string;
  requested_date: string;
  approved_by?: string;
  approved_date?: string;
  estimated_cost: number;
  actual_cost?: number;
  start_date?: string;
  completion_date?: string;
  affected_tasks: string[];
  documents: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

interface ChangeOrdersManagementProps {
  projectId: string;
}

const ChangeOrdersManagement: React.FC<ChangeOrdersManagementProps> = ({ projectId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    reason: '',
    search: ''
  });

  const [newChangeOrder, setNewChangeOrder] = useState({
    title: '',
    description: '',
    reason: 'scope_change' as ChangeOrder['reason'],
    priority: 'medium' as ChangeOrder['priority'],
    estimated_cost: 0,
    time_impact_days: 0,
    requested_by: 'Current User',
    notes: '',
    affected_tasks: [] as string[]
  });

  // Mock change orders data - in production this would come from API
  const mockChangeOrders: ChangeOrder[] = [
    {
      id: '1',
      number: 'CO-001',
      title: 'Foundation Depth Increase',
      description: 'Increase foundation depth by 2 feet due to poor soil conditions discovered during excavation',
      reason: 'site_conditions',
      status: 'approved',
      priority: 'high',
      cost_impact: 15000,
      time_impact_days: 5,
      requested_by: 'Site Engineer',
      requested_date: '2024-09-01',
      approved_by: 'Project Manager',
      approved_date: '2024-09-03',
      estimated_cost: 15000,
      actual_cost: 14500,
      start_date: '2024-09-05',
      completion_date: '2024-09-10',
      affected_tasks: ['Foundation Excavation', 'Foundation Pour'],
      documents: ['soil-report.pdf', 'revised-foundation-plans.pdf'],
      notes: 'Geotechnical engineer recommended additional depth. Work completed within budget.',
      created_at: '2024-09-01T08:00:00Z',
      updated_at: '2024-09-10T17:00:00Z'
    },
    {
      id: '2',
      number: 'CO-002',
      title: 'HVAC System Upgrade',
      description: 'Client requested upgrade to higher efficiency HVAC system with smart controls',
      reason: 'client_request',
      status: 'pending_approval',
      priority: 'medium',
      cost_impact: 25000,
      time_impact_days: 7,
      requested_by: 'Client',
      requested_date: '2024-09-05',
      estimated_cost: 25000,
      affected_tasks: ['HVAC Installation', 'Electrical Systems'],
      documents: ['hvac-upgrade-specs.pdf', 'cost-estimate.pdf'],
      notes: 'Client wants to upgrade to smart HVAC system. Waiting for final approval.',
      created_at: '2024-09-05T10:30:00Z',
      updated_at: '2024-09-05T10:30:00Z'
    },
    {
      id: '3',
      number: 'CO-003',
      title: 'Electrical Panel Upgrade',
      description: 'Code requirement for upgraded electrical panel to meet new safety standards',
      reason: 'code_requirement',
      status: 'approved',
      priority: 'critical',
      cost_impact: 8000,
      time_impact_days: 3,
      requested_by: 'Electrical Inspector',
      requested_date: '2024-09-08',
      approved_by: 'Project Manager',
      approved_date: '2024-09-08',
      estimated_cost: 8000,
      start_date: '2024-09-12',
      affected_tasks: ['Electrical Rough-In', 'Final Electrical'],
      documents: ['inspection-report.pdf', 'code-requirements.pdf'],
      notes: 'Required by building inspector. Critical for passing electrical inspection.',
      created_at: '2024-09-08T14:00:00Z',
      updated_at: '2024-09-08T16:00:00Z'
    },
    {
      id: '4',
      number: 'CO-004',
      title: 'Flooring Material Change',
      description: 'Change from standard laminate to hardwood flooring in main areas',
      reason: 'design_change',
      status: 'draft',
      priority: 'low',
      cost_impact: 12000,
      time_impact_days: 2,
      requested_by: 'Interior Designer',
      requested_date: '2024-09-10',
      estimated_cost: 12000,
      affected_tasks: ['Flooring Installation'],
      documents: ['flooring-samples.pdf'],
      notes: 'Design team recommends hardwood for better aesthetics and durability.',
      created_at: '2024-09-10T09:00:00Z',
      updated_at: '2024-09-10T09:00:00Z'
    },
    {
      id: '5',
      number: 'CO-005',
      title: 'Weather Protection Structure',
      description: 'Temporary weather protection structure due to unexpected early winter conditions',
      reason: 'weather',
      status: 'on_hold',
      priority: 'high',
      cost_impact: 5500,
      time_impact_days: 1,
      requested_by: 'Site Supervisor',
      requested_date: '2024-09-12',
      estimated_cost: 5500,
      affected_tasks: ['Exterior Work', 'Roofing'],
      documents: ['weather-forecast.pdf', 'protection-plan.pdf'],
      notes: 'Waiting for weather conditions to improve before implementing.',
      created_at: '2024-09-12T07:30:00Z',
      updated_at: '2024-09-12T07:30:00Z'
    }
  ];

  const filteredChangeOrders = useMemo(() => {
    return mockChangeOrders.filter(co => {
      const matchesStatus = !filters.status || co.status === filters.status;
      const matchesPriority = !filters.priority || co.priority === filters.priority;
      const matchesReason = !filters.reason || co.reason === filters.reason;
      const matchesSearch = !filters.search || 
        co.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        co.number.toLowerCase().includes(filters.search.toLowerCase()) ||
        co.description.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesReason && matchesSearch;
    });
  }, [filters, mockChangeOrders]);

  const statistics = useMemo(() => {
    return {
      total: mockChangeOrders.length,
      pending: mockChangeOrders.filter(co => co.status === 'pending_approval').length,
      approved: mockChangeOrders.filter(co => co.status === 'approved').length,
      totalCostImpact: mockChangeOrders.reduce((sum, co) => sum + co.cost_impact, 0),
      totalTimeImpact: mockChangeOrders.reduce((sum, co) => sum + co.time_impact_days, 0)
    };
  }, [mockChangeOrders]);

  const getStatusColor = (status: ChangeOrder['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ChangeOrder['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleCreateChangeOrder = () => {
    const changeOrder: ChangeOrder = {
      id: Date.now().toString(),
      number: `CO-${String(mockChangeOrders.length + 1).padStart(3, '0')}`,
      ...newChangeOrder,
      status: 'draft',
      cost_impact: newChangeOrder.estimated_cost,
      requested_date: new Date().toISOString().split('T')[0],
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Created change order:', changeOrder);
    setShowCreateModal(false);
    setNewChangeOrder({
      title: '',
      description: '',
      reason: 'scope_change',
      priority: 'medium',
      estimated_cost: 0,
      time_impact_days: 0,
      requested_by: 'Current User',
      notes: '',
      affected_tasks: []
    });
  };

  const reasonLabels: { [key in ChangeOrder['reason']]: string } = {
    scope_change: 'Scope Change',
    design_change: 'Design Change',
    site_conditions: 'Site Conditions',
    client_request: 'Client Request',
    code_requirement: 'Code Requirement',
    weather: 'Weather',
    other: 'Other'
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Change Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${statistics.totalCostImpact.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Impact</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.totalTimeImpact} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search change orders..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-8 w-64"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setFilters({ status: '', priority: '', reason: '', search: '' })}
          >
            Clear Filters
          </Button>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Change Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Change Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newChangeOrder.title}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of change"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Select 
                    value={newChangeOrder.reason} 
                    onValueChange={(value: ChangeOrder['reason']) => 
                      setNewChangeOrder(prev => ({ ...prev, reason: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reasonLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newChangeOrder.description}
                  onChange={(e) => setNewChangeOrder(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the change"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newChangeOrder.priority} 
                    onValueChange={(value: ChangeOrder['priority']) => 
                      setNewChangeOrder(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cost">Estimated Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newChangeOrder.estimated_cost}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, estimated_cost: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time Impact (Days)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={newChangeOrder.time_impact_days}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, time_impact_days: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newChangeOrder.notes}
                  onChange={(e) => setNewChangeOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or comments"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChangeOrder}>
                  Create Change Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Change Orders List */}
      <div className="space-y-4">
        {filteredChangeOrders.map((changeOrder) => (
          <Card key={changeOrder.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{changeOrder.number}</h3>
                        <Badge className={getStatusColor(changeOrder.status)}>
                          {changeOrder.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(changeOrder.priority)} variant="outline">
                          {changeOrder.priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{changeOrder.title}</h4>
                      <p className="text-gray-600 mb-3">{changeOrder.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-600">Cost Impact:</span>
                      <span className="font-medium">${changeOrder.cost_impact.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-gray-600">Time Impact:</span>
                      <span className="font-medium">{changeOrder.time_impact_days} days</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">Requested by:</span>
                      <span className="font-medium">{changeOrder.requested_by}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium">{reasonLabels[changeOrder.reason]}</span>
                    </div>
                  </div>

                  {changeOrder.documents.length > 0 && (
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {changeOrder.documents.length} document(s) attached
                      </span>
                    </div>
                  )}

                  {changeOrder.notes && (
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-700">{changeOrder.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {changeOrder.status === 'draft' && (
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChangeOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No change orders found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(filter => filter) 
                ? "No change orders match your current filters." 
                : "Get started by creating your first change order."
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Change Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChangeOrdersManagement;