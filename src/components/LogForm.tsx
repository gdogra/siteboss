import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface LogFormProps {
  log?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ log, onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    project_id: log?.project_id || 0,
    labor_hours: log?.labor_hours || 0,
    labor_cost: log?.labor_cost || 0,
    materials_description: log?.materials_description || '',
    materials_cost: log?.materials_cost || 0,
    vendor: log?.vendor || '',
    subcontractor_id: log?.subcontractor_id || 0,
    activities: log?.activities || '',
    notes: log?.notes || '',
    receipt_file_id: log?.receipt_file_id || 0,
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    log?.date ? new Date(log.date) : new Date()
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
    loadSubcontractors();
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

  const loadSubcontractors = async () => {
    try {
      const response = await window.ezsite.apis.tablePage(32233, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: "name",
        IsAsc: true
      });
      if (!response.error) {
        setSubcontractors(response.data?.List || []);
      }
    } catch (error) {
      console.error('Error loading subcontractors:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let receiptFileId = formData.receipt_file_id;

      // Upload receipt file if provided
      if (receiptFile) {
        const uploadResponse = await window.ezsite.apis.upload({
          filename: receiptFile.name,
          file: receiptFile
        });

        if (uploadResponse.error) throw uploadResponse.error;
        receiptFileId = uploadResponse.data;
      }

      const submitData = {
        ...formData,
        date: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
        project_id: Number(formData.project_id),
        labor_hours: Number(formData.labor_hours),
        labor_cost: Number(formData.labor_cost),
        materials_cost: Number(formData.materials_cost),
        subcontractor_id: Number(formData.subcontractor_id),
        receipt_file_id: receiptFileId
      };

      let response;
      if (log?.id) {
        // Update existing log
        response = await window.ezsite.apis.tableUpdate(32234, {
          ID: log.id,
          ...submitData
        });
      } else {
        // Create new log
        response = await window.ezsite.apis.tableCreate(32234, submitData);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `Log entry ${log?.id ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving log:', error);
      toast({
        title: "Error",
        description: `Failed to ${log?.id ? 'update' : 'create'} log entry`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {log?.id ? 'Edit Log Entry' : 'New Log Entry'}
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
                  onValueChange={(value) => handleInputChange('project_id', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="labor_hours">Labor Hours</Label>
                <Input
                  id="labor_hours"
                  type="number"
                  value={formData.labor_hours}
                  onChange={(e) => handleInputChange('labor_hours', Number(e.target.value))}
                  placeholder="8"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labor_cost">Labor Cost</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  value={formData.labor_cost}
                  onChange={(e) => handleInputChange('labor_cost', Number(e.target.value))}
                  placeholder="400"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials_description">Materials Description</Label>
              <Textarea
                id="materials_description"
                value={formData.materials_description}
                onChange={(e) => handleInputChange('materials_description', e.target.value)}
                placeholder="2x4 lumber, drywall, screws..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materials_cost">Materials Cost</Label>
                <Input
                  id="materials_cost"
                  type="number"
                  value={formData.materials_cost}
                  onChange={(e) => handleInputChange('materials_cost', Number(e.target.value))}
                  placeholder="150"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  placeholder="Home Depot, Lowe's..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcontractor_id">Subcontractor</Label>
              <Select
                value={formData.subcontractor_id.toString()}
                onValueChange={(value) => handleInputChange('subcontractor_id', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcontractor (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {subcontractors.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.name} - {sub.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities</Label>
              <Textarea
                id="activities"
                value={formData.activities}
                onChange={(e) => handleInputChange('activities', e.target.value)}
                placeholder="Framing, drywall installation, electrical rough-in..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes and observations..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt Upload</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="receipt"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium"
                />
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Upload receipt images or PDFs</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.project_id === 0}>
                {loading ? 'Saving...' : log?.id ? 'Update Log' : 'Create Log Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogForm;