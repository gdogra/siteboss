import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  payment?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project_id: payment?.project_id || 0,
    log_id: payment?.log_id || 0,
    amount: payment?.amount || 0,
    payment_type: payment?.payment_type || 'Client Payment',
    check_number: payment?.check_number || '',
    description: payment?.description || '',
    recipient: payment?.recipient || '',
    status: payment?.status || 'Pending'
  });
  const [datePaid, setDatePaid] = useState<Date | undefined>(
    payment?.date_paid ? new Date(payment.date_paid) : new Date()
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32232, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "name",
        IsAsc: true
      });
      if (!response.error) {
        setProjects(response.data?.List || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        date_paid: datePaid ? datePaid.toISOString() : new Date().toISOString(),
        project_id: Number(formData.project_id),
        log_id: Number(formData.log_id),
        amount: Number(formData.amount)
      };

      let response;
      if (payment?.id) {
        // Update existing payment
        response = await window.ezsite.apis.tableUpdate(32235, {
          ID: payment.id,
          ...submitData
        });
      } else {
        // Create new payment
        response = await window.ezsite.apis.tableCreate(32235, submitData);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `Payment ${payment?.id ? 'updated' : 'recorded'} successfully`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: "Error",
        description: `Failed to ${payment?.id ? 'update' : 'record'} payment`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {payment?.id ? 'Edit Payment' : 'Record Payment'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_id">Project *</Label>
                <Select
                  value={formData.project_id.toString()}
                  onValueChange={(value) => handleInputChange('project_id', Number(value))}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) =>
                    <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value) => handleInputChange('payment_type', value)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client Payment">Client Payment</SelectItem>
                    <SelectItem value="Vendor Payment">Vendor Payment</SelectItem>
                    <SelectItem value="Labor Payment">Labor Payment</SelectItem>
                    <SelectItem value="Material Payment">Material Payment</SelectItem>
                    <SelectItem value="Subcontractor Payment">Subcontractor Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                  placeholder="1500"
                  min="0"
                  step="0.01"
                  required />

              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_number">Check Number</Label>
                <Input
                  id="check_number"
                  value={formData.check_number}
                  onChange={(e) => handleInputChange('check_number', e.target.value)}
                  placeholder="1001" />

              </div>
              <div className="space-y-2">
                <Label>Date Paid</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal">

                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {datePaid ? format(datePaid, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={datePaid}
                      onSelect={setDatePaid}
                      initialFocus />

                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={formData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                placeholder="Home Depot, John Smith, ABC Plumbing..." />

            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Payment for materials, labor, etc..."
                rows={3} />

            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.project_id === 0}>
                {loading ? 'Saving...' : payment?.id ? 'Update Payment' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default PaymentForm;