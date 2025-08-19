
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
  lead?: any;
}

const LeadForm: React.FC<LeadFormProps> = ({ isOpen, onClose, onSuccess, currentUser, lead }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company: '',
    address: '',
    project_type: '',
    project_description: '',
    budget_min: '',
    budget_max: '',
    lead_source: '',
    status: 'NEW',
    owner_id: currentUser?.ID || 0,
    notes: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        contact_name: lead.contact_name || '',
        contact_email: lead.contact_email || '',
        contact_phone: lead.contact_phone || '',
        company: lead.company || '',
        address: lead.address || '',
        project_type: lead.project_type || '',
        project_description: lead.project_description || '',
        budget_min: lead.budget_min?.toString() || '',
        budget_max: lead.budget_max?.toString() || '',
        lead_source: lead.lead_source || '',
        status: lead.status || 'NEW',
        owner_id: lead.owner_id || currentUser?.ID || 0,
        notes: lead.notes || ''
      });
    } else {
      setFormData({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company: '',
        address: '',
        project_type: '',
        project_description: '',
        budget_min: '',
        budget_max: '',
        lead_source: '',
        status: 'NEW',
        owner_id: currentUser?.ID || 0,
        notes: ''
      });
    }
  }, [lead, currentUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contact_name.trim()) {
      toast({
        title: "Error",
        description: "Contact name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate lead score
      const { data: score } = await window.ezsite.apis.run({
        path: "calculateLeadScore",
        param: [formData]
      });

      // Calculate next action date
      const { data: nextActionAt } = await window.ezsite.apis.run({
        path: "calculateNextActionAt",
        param: [formData.status]
      });

      const leadData = {
        ...formData,
        budget_min: parseFloat(formData.budget_min) || 0,
        budget_max: parseFloat(formData.budget_max) || 0,
        score: score || 0,
        next_action_at: nextActionAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let response;
      if (lead) {
        // Update existing lead
        response = await window.ezsite.apis.tableUpdate(33726, {
          ...leadData,
          ID: lead.ID
        });
      } else {
        // Create new lead
        response = await window.ezsite.apis.tableCreate(33726, leadData);
      }

      if (response.error) throw response.error;

      // Create activity log
      const activityData = {
        lead_id: lead?.ID || response.data?.id || 0,
        user_id: currentUser?.ID || 0,
        activity_type: 'NOTE',
        title: lead ? 'Lead Updated' : 'Lead Created',
        description: lead ? 'Lead information updated' : 'New lead created in system',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      await window.ezsite.apis.tableCreate(33727, activityData);

      toast({
        title: "Success",
        description: lead ? "Lead updated successfully" : "Lead created successfully"
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save lead:', error);
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'New Lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  required />

              </div>
              
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)} />

              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)} />

              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)} />

              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)} />

            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Information</h3>
            
            <div>
              <Label htmlFor="project_type">Project Type</Label>
              <Select value={formData.project_type} onValueChange={(value) => handleChange('project_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="project_description">Project Description</Label>
              <Textarea
                id="project_description"
                value={formData.project_description}
                onChange={(e) => handleChange('project_description', e.target.value)}
                rows={3} />

            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_min">Budget Min ($)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  min="0"
                  value={formData.budget_min}
                  onChange={(e) => handleChange('budget_min', e.target.value)} />

              </div>
              
              <div>
                <Label htmlFor="budget_max">Budget Max ($)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  min="0"
                  value={formData.budget_max}
                  onChange={(e) => handleChange('budget_max', e.target.value)} />

              </div>
            </div>
          </div>

          {/* Lead Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Lead Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead_source">Lead Source</Label>
                <Select value={formData.lead_source} onValueChange={(value) => handleChange('lead_source', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="repeat_customer">Repeat Customer</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="cold_call">Cold Call</SelectItem>
                    <SelectItem value="trade_show">Trade Show</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="QUALIFYING">Qualifying</SelectItem>
                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                    <SelectItem value="ESTIMATE_SENT">Estimate Sent</SelectItem>
                    <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                    <SelectItem value="WON">Won</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                placeholder="Any additional notes about this lead..." />

            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

};

export default LeadForm;