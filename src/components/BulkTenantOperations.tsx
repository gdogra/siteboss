
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Play, 
  Pause, 
  Trash2, 
  Mail, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: number;
  name: string;
  domain: string;
  status: string;
  subscription_status: string;
  created_at: string;
  monthly_revenue: number;
}

interface BulkTenantOperationsProps {
  tenants: Tenant[];
  selectedTenantIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onOperationComplete: () => void;
}

type BulkOperation = 'activate' | 'suspend' | 'delete' | 'email' | 'upgrade' | 'downgrade';

interface OperationProgress {
  operation: BulkOperation;
  total: number;
  completed: number;
  errors: string[];
  isRunning: boolean;
}

const BulkTenantOperations: React.FC<BulkTenantOperationsProps> = ({
  tenants,
  selectedTenantIds,
  onSelectionChange,
  onOperationComplete
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);
  const [progress, setProgress] = useState<OperationProgress | null>(null);
  const { toast } = useToast();

  const selectedTenants = tenants.filter(t => selectedTenantIds.includes(t.id));

  const handleSelectAll = () => {
    if (selectedTenantIds.length === tenants.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tenants.map(t => t.id));
    }
  };

  const handleTenantSelect = (tenantId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTenantIds, tenantId]);
    } else {
      onSelectionChange(selectedTenantIds.filter(id => id !== tenantId));
    }
  };

  const getOperationDetails = (operation: BulkOperation) => {
    switch (operation) {
      case 'activate':
        return {
          title: 'Activate Tenants',
          description: 'Activate selected tenants and restore their access',
          icon: Play,
          color: 'text-green-600',
          confirmText: 'This will activate the selected tenants and restore their full access.'
        };
      case 'suspend':
        return {
          title: 'Suspend Tenants',
          description: 'Suspend selected tenants and restrict their access',
          icon: Pause,
          color: 'text-yellow-600',
          confirmText: 'This will suspend the selected tenants and restrict their access to the platform.'
        };
      case 'delete':
        return {
          title: 'Delete Tenants',
          description: 'Permanently delete selected tenants and all their data',
          icon: Trash2,
          color: 'text-red-600',
          confirmText: 'This will permanently delete the selected tenants and ALL their data. This action cannot be undone.'
        };
      case 'email':
        return {
          title: 'Send Email',
          description: 'Send an email notification to selected tenants',
          icon: Mail,
          color: 'text-blue-600',
          confirmText: 'This will send an email notification to all selected tenants.'
        };
      case 'upgrade':
        return {
          title: 'Upgrade Subscriptions',
          description: 'Upgrade subscription plans for selected tenants',
          icon: Settings,
          color: 'text-purple-600',
          confirmText: 'This will upgrade the subscription plans for selected tenants.'
        };
      case 'downgrade':
        return {
          title: 'Downgrade Subscriptions',
          description: 'Downgrade subscription plans for selected tenants',
          icon: Settings,
          color: 'text-orange-600',
          confirmText: 'This will downgrade the subscription plans for selected tenants.'
        };
      default:
        return {
          title: 'Unknown Operation',
          description: '',
          icon: Settings,
          color: 'text-gray-600',
          confirmText: ''
        };
    }
  };

  const executeBulkOperation = async (operation: BulkOperation) => {
    setProgress({
      operation,
      total: selectedTenantIds.length,
      completed: 0,
      errors: [],
      isRunning: true
    });

    const errors: string[] = [];

    for (let i = 0; i < selectedTenantIds.length; i++) {
      const tenantId = selectedTenantIds[i];
      const tenant = tenants.find(t => t.id === tenantId);

      try {
        switch (operation) {
          case 'activate':
            await window.ezsite.apis.tableUpdate(35554, {
              ID: tenantId,
              status: 'active'
            });
            break;
          case 'suspend':
            await window.ezsite.apis.tableUpdate(35554, {
              ID: tenantId,
              status: 'suspended'
            });
            break;
          case 'delete':
            await window.ezsite.apis.tableDelete(35554, { ID: tenantId });
            break;
          case 'email':
            // Send email notification
            await window.ezsite.apis.sendEmail({
              from: 'Platform Admin <admin@platform.com>',
              to: [tenant?.admin_email || ''],
              subject: 'Important Platform Update',
              html: `
                <h2>Platform Notification</h2>
                <p>Dear ${tenant?.name || 'Tenant'},</p>
                <p>This is an important notification from the platform administration team.</p>
                <p>Please contact support if you have any questions.</p>
                <p>Best regards,<br>Platform Team</p>
              `
            });
            break;
          case 'upgrade':
          case 'downgrade':
            await window.ezsite.apis.tableUpdate(35606, {
              tenant_id: tenantId,
              plan_type: operation === 'upgrade' ? 'premium' : 'basic',
              updated_at: new Date().toISOString()
            });
            break;
        }

        setProgress(prev => prev ? { ...prev, completed: prev.completed + 1 } : null);
      } catch (error) {
        const errorMessage = `Failed to ${operation} tenant "${tenant?.name || tenantId}": ${error}`;
        errors.push(errorMessage);
        setProgress(prev => prev ? { ...prev, errors: [...prev.errors, errorMessage] } : null);
      }

      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setProgress(prev => prev ? { ...prev, isRunning: false } : null);

    if (errors.length === 0) {
      toast({
        title: "Success",
        description: `Successfully ${operation}d ${selectedTenantIds.length} tenant(s)`
      });
    } else {
      toast({
        title: "Partial Success",
        description: `Completed with ${errors.length} error(s)`,
        variant: "destructive"
      });
    }

    onOperationComplete();
  };

  const handleOperationClick = (operation: BulkOperation) => {
    if (selectedTenantIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one tenant to perform bulk operations",
        variant: "destructive"
      });
      return;
    }

    setSelectedOperation(operation);
    setShowConfirmDialog(true);
  };

  const handleConfirmOperation = () => {
    if (selectedOperation) {
      executeBulkOperation(selectedOperation);
      setShowConfirmDialog(false);
    }
  };

  const operationDetails = selectedOperation ? getOperationDetails(selectedOperation) : null;

  return (
    <div className="space-y-6">
      {/* Bulk Operations Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={selectedTenantIds.length === tenants.length && tenants.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedTenantIds.length} of {tenants.length} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperationClick('activate')}
              disabled={selectedTenantIds.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperationClick('suspend')}
              disabled={selectedTenantIds.length === 0}
            >
              <Pause className="h-4 w-4 mr-2" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOperationClick('email')}
              disabled={selectedTenantIds.length === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleOperationClick('delete')}
              disabled={selectedTenantIds.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Selected Tenants Preview */}
        {selectedTenantIds.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Selected Tenants:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTenants.slice(0, 10).map(tenant => (
                <Badge key={tenant.id} variant="secondary" className="text-xs">
                  {tenant.name}
                </Badge>
              ))}
              {selectedTenants.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedTenants.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Tenant Selection List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Tenant Selection</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tenants.map(tenant => (
            <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedTenantIds.includes(tenant.id)}
                  onCheckedChange={(checked) => handleTenantSelect(tenant.id, checked as boolean)}
                />
                <div>
                  <h4 className="font-medium">{tenant.name}</h4>
                  <p className="text-sm text-gray-500">{tenant.domain}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                  {tenant.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tenant.subscription_status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Progress Display */}
      {progress && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {getOperationDetails(progress.operation).title} Progress
              </h3>
              {progress.isRunning && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.completed} / {progress.total}</span>
              </div>
              <Progress value={(progress.completed / progress.total) * 100} />
            </div>

            {progress.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <details>
                    <summary className="cursor-pointer">
                      {progress.errors.length} error(s) occurred
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs">
                      {progress.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </details>
                </AlertDescription>
              </Alert>
            )}

            {!progress.isRunning && (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Operation completed</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {operationDetails && (
                <>
                  <operationDetails.icon className={`h-5 w-5 ${operationDetails.color}`} />
                  <span>{operationDetails.title}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {operationDetails?.confirmText}
            </p>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will affect {selectedTenantIds.length} tenant(s).
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmOperation}
              variant={selectedOperation === 'delete' ? 'destructive' : 'default'}
            >
              Confirm {operationDetails?.title}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkTenantOperations;
