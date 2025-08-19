import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubcontractorFormProps {
  subcontractor?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const SubcontractorForm: React.FC<SubcontractorFormProps> = ({ subcontractor, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: subcontractor?.name || '',
    email: subcontractor?.email || '',
    phone: subcontractor?.phone || '',
    specialty: subcontractor?.specialty || '',
    hourly_rate: subcontractor?.hourly_rate || 0,
    address: subcontractor?.address || '',
    notes: subcontractor?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        hourly_rate: Number(formData.hourly_rate)
      };

      let response;
      if (subcontractor?.id) {
        // Update existing subcontractor
        response = await window.ezsite.apis.tableUpdate(32233, {
          ID: subcontractor.id,
          ...submitData
        });
      } else {
        // Create new subcontractor
        response = await window.ezsite.apis.tableCreate(32233, submitData);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `Subcontractor ${subcontractor?.id ? 'updated' : 'added'} successfully`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving subcontractor:', error);
      toast({
        title: "Error",
        description: `Failed to ${subcontractor?.id ? 'update' : 'add'} subcontractor`,
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
            {subcontractor?.id ? 'Edit Subcontractor' : 'Add Subcontractor'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="ABC Plumbing"
                  required />

              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty *</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="Plumbing, Electrical, Drywall..."
                  required />

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@abcplumbing.com" />

              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567" />

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => handleInputChange('hourly_rate', Number(e.target.value))}
                  placeholder="50"
                  min="0"
                  step="0.01" />

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business St, City, State 12345" />

            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this subcontractor..."
                rows={3} />

            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : subcontractor?.id ? 'Update Subcontractor' : 'Add Subcontractor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

};

export default SubcontractorForm;