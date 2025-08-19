import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const InvoiceSubmissionForm = () => {
  const [formData, setFormData] = useState({
    projectName: '',
    invoiceNumber: '',
    amount: '',
    description: '',
    workPeriod: '',
    category: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const projects = [
  'Oceanview Residences',
  'Sunset Villas',
  'Marina Heights',
  'Coastal Gardens'];


  const categories = [
  'Construction',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Landscaping',
  'Interior Design',
  'Other'];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Invoice Submitted!",
      description: "Your invoice has been submitted for review and will be processed within 2-3 business days."
    });

    // Reset form
    setFormData({
      projectName: '',
      invoiceNumber: '',
      amount: '',
      description: '',
      workPeriod: '',
      category: ''
    });
    setFiles([]);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Submit Invoice</CardTitle>
        <p className="text-gray-600">
          Fill out the form below to submit your invoice for approval and payment processing.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="projectName">Project *</Label>
              <Select
                value={formData.projectName}
                onValueChange={(value) => setFormData({ ...formData, projectName: value })}>

                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) =>
                  <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                required
                className="mt-2"
                placeholder="INV-2024-001" />

            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="mt-2"
                placeholder="0.00" />

            </div>
            
            <div>
              <Label htmlFor="category">Service Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}>

                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) =>
                  <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="workPeriod">Work Period *</Label>
            <Input
              id="workPeriod"
              name="workPeriod"
              value={formData.workPeriod}
              onChange={handleInputChange}
              required
              className="mt-2"
              placeholder="January 1-15, 2024" />

          </div>

          <div>
            <Label htmlFor="description">Work Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="mt-2 min-h-24"
              placeholder="Detailed description of work completed..." />

          </div>

          {/* File Upload */}
          <div>
            <Label>Supporting Documents</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, JPG, PNG up to 10MB each
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload" />

              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">

                Select Files
              </Label>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 &&
            <div className="mt-4 space-y-2">
                {files.map((file, index) =>
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}>

                      <X className="h-4 w-4" />
                    </Button>
                  </div>
              )}
              </div>
            }
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 luxury-gradient text-white hover:opacity-90">

              Submit Invoice
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setFormData({
                  projectName: '',
                  invoiceNumber: '',
                  amount: '',
                  description: '',
                  workPeriod: '',
                  category: ''
                });
                setFiles([]);
              }}>

              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);

};

export default InvoiceSubmissionForm;