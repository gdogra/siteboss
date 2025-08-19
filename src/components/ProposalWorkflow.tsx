import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, CheckCircle, XCircle, Clock, User, 
  ArrowRight, Settings, AlertCircle, FileText,
  Users, Calendar, Bell, Workflow
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: 'status_change' | 'amount_threshold' | 'time_based' | 'user_action';
  conditions: any;
  actions: any;
  isActive: boolean;
  priority: number;
}

interface ApprovalStep {
  id: string;
  stepName: string;
  approverRole: string;
  approverEmail: string;
  isRequired: boolean;
  timeoutHours: number;
  escalationEmail?: string;
}

interface ProposalWorkflowProps {}

const ProposalWorkflow: React.FC<ProposalWorkflowProps> = () => {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);

  const [newWorkflow, setNewWorkflow] = useState<Partial<WorkflowRule>>({
    name: '',
    description: '',
    trigger: 'status_change',
    conditions: {},
    actions: {},
    isActive: true,
    priority: 1
  });

  const [newApprovalStep, setNewApprovalStep] = useState<Partial<ApprovalStep>>({
    stepName: '',
    approverRole: '',
    approverEmail: '',
    isRequired: true,
    timeoutHours: 24
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      // In a real application, these would be stored in the database
      // For now, we'll use local storage or initialize with defaults
      const savedWorkflows = localStorage.getItem('proposalWorkflows');
      const savedSteps = localStorage.getItem('approvalSteps');
      
      if (savedWorkflows) {
        setWorkflows(JSON.parse(savedWorkflows));
      } else {
        // Initialize with default workflows
        const defaultWorkflows: WorkflowRule[] = [
          {
            id: '1',
            name: 'High Value Approval',
            description: 'Require approval for proposals over $50,000',
            trigger: 'amount_threshold',
            conditions: { minAmount: 5000000 }, // $50,000 in cents
            actions: { requireApproval: true, notifyManager: true },
            isActive: true,
            priority: 1
          },
          {
            id: '2',
            name: 'Auto-send on Creation',
            description: 'Automatically send proposals to clients when created',
            trigger: 'status_change',
            conditions: { fromStatus: 'draft', toStatus: 'ready' },
            actions: { sendToClient: true, trackAnalytics: true },
            isActive: false,
            priority: 2
          },
          {
            id: '3',
            name: 'Follow-up Reminder',
            description: 'Send reminder if no response after 7 days',
            trigger: 'time_based',
            conditions: { daysAfterSent: 7, status: 'sent' },
            actions: { sendReminder: true, escalateToManager: false },
            isActive: true,
            priority: 3
          }
        ];
        setWorkflows(defaultWorkflows);
        localStorage.setItem('proposalWorkflows', JSON.stringify(defaultWorkflows));
      }

      if (savedSteps) {
        setApprovalSteps(JSON.parse(savedSteps));
      } else {
        // Initialize with default approval steps
        const defaultSteps: ApprovalStep[] = [
          {
            id: '1',
            stepName: 'Manager Review',
            approverRole: 'Administrator',
            approverEmail: 'manager@company.com',
            isRequired: true,
            timeoutHours: 24,
            escalationEmail: 'director@company.com'
          },
          {
            id: '2',
            stepName: 'Director Approval',
            approverRole: 'Administrator',
            approverEmail: 'director@company.com',
            isRequired: false,
            timeoutHours: 48
          }
        ];
        setApprovalSteps(defaultSteps);
        localStorage.setItem('approvalSteps', JSON.stringify(defaultSteps));
      }

      // Fetch pending approvals from proposals
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      // Fetch proposals that need approval
      const { data, error } = await window.ezsite.apis.tablePage(35433, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'created_at',
        IsAsc: false,
        Filters: [
          { name: 'status', op: 'Equal', value: 'pending_approval' }
        ]
      });

      if (error) throw error;
      setPendingApprovals(data?.List || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const saveWorkflows = (updatedWorkflows: WorkflowRule[]) => {
    setWorkflows(updatedWorkflows);
    localStorage.setItem('proposalWorkflows', JSON.stringify(updatedWorkflows));
  };

  const saveApprovalSteps = (updatedSteps: ApprovalStep[]) => {
    setApprovalSteps(updatedSteps);
    localStorage.setItem('approvalSteps', JSON.stringify(updatedSteps));
  };

  const createWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const workflow: WorkflowRule = {
      id: Date.now().toString(),
      name: newWorkflow.name!,
      description: newWorkflow.description!,
      trigger: newWorkflow.trigger!,
      conditions: newWorkflow.conditions!,
      actions: newWorkflow.actions!,
      isActive: newWorkflow.isActive!,
      priority: newWorkflow.priority!
    };

    saveWorkflows([...workflows, workflow]);
    setNewWorkflow({
      name: '',
      description: '',
      trigger: 'status_change',
      conditions: {},
      actions: {},
      isActive: true,
      priority: 1
    });
    setShowCreateDialog(false);

    toast({
      title: 'Success',
      description: 'Workflow rule created successfully'
    });
  };

  const toggleWorkflow = (id: string) => {
    const updatedWorkflows = workflows.map(w =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    saveWorkflows(updatedWorkflows);

    toast({
      title: 'Success',
      description: 'Workflow status updated'
    });
  };

  const deleteWorkflow = (id: string) => {
    const updatedWorkflows = workflows.filter(w => w.id !== id);
    saveWorkflows(updatedWorkflows);

    toast({
      title: 'Success',
      description: 'Workflow rule deleted'
    });
  };

  const approveProposal = async (proposalId: number, step: string) => {
    try {
      // Update proposal status
      const { error } = await window.ezsite.apis.tableUpdate(35433, {
        ID: proposalId,
        status: 'approved',
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      // Record approval in analytics
      await window.ezsite.apis.tableCreate(35436, {
        proposal_id: proposalId,
        event_type: 'approval',
        event_data: JSON.stringify({
          step: step,
          approved_by: 'current_user', // TODO: Get from auth
          approved_at: new Date().toISOString()
        }),
        user_email: 'current_user@company.com', // TODO: Get from auth
        created_at: new Date().toISOString()
      });

      // Send notification email
      await window.ezsite.apis.sendEmail({
        from: 'workflow@company.com',
        to: ['team@company.com'],
        subject: 'Proposal Approved',
        html: `<p>Proposal #${proposalId} has been approved at step: ${step}</p>`
      });

      fetchPendingApprovals();
      
      toast({
        title: 'Success',
        description: 'Proposal approved successfully'
      });
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve proposal',
        variant: 'destructive'
      });
    }
  };

  const rejectProposal = async (proposalId: number, reason: string) => {
    try {
      // Update proposal status
      const { error } = await window.ezsite.apis.tableUpdate(35433, {
        ID: proposalId,
        status: 'rejected',
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      // Record rejection in analytics
      await window.ezsite.apis.tableCreate(35436, {
        proposal_id: proposalId,
        event_type: 'rejection',
        event_data: JSON.stringify({
          rejected_by: 'current_user', // TODO: Get from auth
          rejected_at: new Date().toISOString(),
          reason: reason
        }),
        user_email: 'current_user@company.com', // TODO: Get from auth
        created_at: new Date().toISOString()
      });

      fetchPendingApprovals();
      
      toast({
        title: 'Success',
        description: 'Proposal rejected'
      });
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject proposal',
        variant: 'destructive'
      });
    }
  };

  const addApprovalStep = () => {
    if (!newApprovalStep.stepName || !newApprovalStep.approverEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const step: ApprovalStep = {
      id: Date.now().toString(),
      stepName: newApprovalStep.stepName!,
      approverRole: newApprovalStep.approverRole!,
      approverEmail: newApprovalStep.approverEmail!,
      isRequired: newApprovalStep.isRequired!,
      timeoutHours: newApprovalStep.timeoutHours!,
      escalationEmail: newApprovalStep.escalationEmail
    };

    saveApprovalSteps([...approvalSteps, step]);
    setNewApprovalStep({
      stepName: '',
      approverRole: '',
      approverEmail: '',
      isRequired: true,
      timeoutHours: 24
    });

    toast({
      title: 'Success',
      description: 'Approval step added successfully'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading workflow data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Proposal Workflow Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Workflow Rules</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="settings">Approval Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No workflow rules configured</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                            {workflow.isActive ? (
                              <><Play className="w-3 h-3 mr-1" /> Active</>
                            ) : (
                              <><Pause className="w-3 h-3 mr-1" /> Inactive</>
                            )}
                          </Badge>
                          <Badge variant="outline">
                            Priority: {workflow.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{workflow.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Settings className="w-4 h-4" />
                            Trigger: {workflow.trigger.replace('_', ' ')}
                          </span>
                          
                          {workflow.trigger === 'amount_threshold' && workflow.conditions.minAmount && (
                            <span>
                              Min Amount: {formatCurrency(workflow.conditions.minAmount)}
                            </span>
                          )}
                          
                          {workflow.trigger === 'time_based' && workflow.conditions.daysAfterSent && (
                            <span>
                              After {workflow.conditions.daysAfterSent} days
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWorkflow(workflow.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingApprovals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Approval
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p><strong>Proposal #:</strong> {proposal.proposal_number}</p>
                            <p><strong>Client:</strong> {proposal.client_name}</p>
                          </div>
                          <div>
                            <p><strong>Amount:</strong> {formatCurrency(proposal.total_amount)}</p>
                            <p><strong>Created:</strong> {new Date(proposal.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {approvalSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-700">{step.stepName}</span>
                              </div>
                              {index < approvalSteps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveProposal(proposal.id, 'manual')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectProposal(proposal.id, 'Manual rejection')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/proposal/${proposal.id}/view`, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvalSteps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.stepName}</h4>
                      <p className="text-sm text-gray-600">{step.approverEmail}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{step.approverRole}</span>
                        <span>{step.timeoutHours}h timeout</span>
                        {step.isRequired && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedSteps = approvalSteps.filter(s => s.id !== step.id);
                      saveApprovalSteps(updatedSteps);
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                <div>
                  <Label htmlFor="step_name">Step Name</Label>
                  <Input
                    id="step_name"
                    value={newApprovalStep.stepName}
                    onChange={(e) => setNewApprovalStep(prev => ({ ...prev, stepName: e.target.value }))}
                    placeholder="e.g., Manager Review"
                  />
                </div>

                <div>
                  <Label htmlFor="approver_email">Approver Email</Label>
                  <Input
                    id="approver_email"
                    type="email"
                    value={newApprovalStep.approverEmail}
                    onChange={(e) => setNewApprovalStep(prev => ({ ...prev, approverEmail: e.target.value }))}
                    placeholder="approver@company.com"
                  />
                </div>

                <div>
                  <Label htmlFor="approver_role">Approver Role</Label>
                  <Select 
                    value={newApprovalStep.approverRole} 
                    onValueChange={(value) => setNewApprovalStep(prev => ({ ...prev, approverRole: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Contractor">Contractor</SelectItem>
                      <SelectItem value="GeneralUser">General User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeout_hours">Timeout (Hours)</Label>
                  <Input
                    id="timeout_hours"
                    type="number"
                    min="1"
                    value={newApprovalStep.timeoutHours}
                    onChange={(e) => setNewApprovalStep(prev => ({ ...prev, timeoutHours: parseInt(e.target.value) || 24 }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_required"
                      checked={newApprovalStep.isRequired}
                      onCheckedChange={(checked) => setNewApprovalStep(prev => ({ ...prev, isRequired: checked }))}
                    />
                    <Label htmlFor="is_required">Required Step</Label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Button onClick={addApprovalStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Approval Step
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Workflow Rule</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule_name">Rule Name *</Label>
              <Input
                id="rule_name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter rule name..."
              />
            </div>

            <div>
              <Label htmlFor="rule_description">Description *</Label>
              <Textarea
                id="rule_description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this rule does..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="trigger_type">Trigger Type</Label>
              <Select 
                value={newWorkflow.trigger} 
                onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, trigger: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status_change">Status Change</SelectItem>
                  <SelectItem value="amount_threshold">Amount Threshold</SelectItem>
                  <SelectItem value="time_based">Time Based</SelectItem>
                  <SelectItem value="user_action">User Action</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newWorkflow.priority?.toString()} 
                  onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, priority: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Highest)</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5 (Lowest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="is_active"
                  checked={newWorkflow.isActive}
                  onCheckedChange={(checked) => setNewWorkflow(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createWorkflow}>
                Create Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalWorkflow;