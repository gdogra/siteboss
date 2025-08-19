
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Upload, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Download,
  MapPin,
  CreditCard,
  FileCheck,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';

interface PermitApplication {
  id?: number;
  permit_type_id: number;
  application_number?: string;
  status?: string;
  priority?: string;
  property_address: string;
  property_coordinates?: string;
  work_description: string;
  estimated_value: number;
  contractor_name: string;
  contractor_license: string;
  applicant_notes?: string;
  fee_paid?: boolean;
  submitted_at?: string;
  expires_at?: string;
}

interface PermitType {
  id: number;
  name: string;
  code: string;
  description: string;
  fee_amount: number;
  inspection_required: boolean;
  processing_time_days: number;
  required_documents: string;
}

interface DocumentUpload {
  id?: number;
  document_type: string;
  document_name: string;
  file?: File;
  is_required: boolean;
  is_approved?: boolean;
  uploaded?: boolean;
}

const ApplicantPortal = () => {
  const [activeTab, setActiveTab] = useState('new-application');
  const [userApplications, setUserApplications] = useState<PermitApplication[]>([]);
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<PermitApplication>({
    permit_type_id: 0,
    property_address: '',
    work_description: '',
    estimated_value: 0,
    contractor_name: '',
    contractor_license: ''
  });
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user's applications
      const userInfo = await window.ezsite.apis.getUserInfo();
      if (userInfo.data) {
        const { data: applicationsData, error: applicationsError } = await window.ezsite.apis.tablePage(35423, {
          PageNo: 1,
          PageSize: 50,
          OrderByField: 'created_at',
          IsAsc: false,
          Filters: [{ name: 'applicant_user_id', op: 'Equal', value: userInfo.data.ID }]
        });
        
        if (applicationsError) throw applicationsError;
        setUserApplications(applicationsData?.List || []);
      }

      // Load permit types
      const { data: typesData, error: typesError } = await window.ezsite.apis.tablePage(35422, {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'name',
        IsAsc: true,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }]
      });
      
      if (typesError) throw typesError;
      setPermitTypes(typesData?.List || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermitTypeChange = (permitTypeId: string) => {
    const selectedType = permitTypes.find(type => type.id === parseInt(permitTypeId));
    if (selectedType) {
      setCurrentApplication(prev => ({
        ...prev,
        permit_type_id: selectedType.id
      }));

      // Setup required documents
      try {
        const requiredDocs = selectedType.required_documents ? JSON.parse(selectedType.required_documents) : [];
        const docList = requiredDocs.map((docType: string) => ({
          document_type: docType,
          document_name: '',
          is_required: true,
          uploaded: false
        }));
        setDocuments(docList);
      } catch (e) {
        setDocuments([]);
      }
    }
  };

  const FileUploadZone = ({ document, index }: { document: DocumentUpload; index: number }) => {
    const onDrop = (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const updatedDocs = [...documents];
        updatedDocs[index] = {
          ...document,
          file: file,
          document_name: file.name,
          uploaded: false
        };
        setDocuments(updatedDocs);
      }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {document.file ? (
          <div>
            <p className="text-sm font-medium">{document.file.name}</p>
            <p className="text-xs text-gray-500">{(document.file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p className="text-sm">
              {isDragActive ? 'Drop file here...' : `Upload ${document.document_type}`}
            </p>
            <p className="text-xs text-gray-500">
              {document.is_required ? 'Required' : 'Optional'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleSubmitApplication = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!currentApplication.permit_type_id || !currentApplication.property_address || 
          !currentApplication.work_description || !currentApplication.contractor_name) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Generate application number
      const applicationNumber = `PERM${Date.now()}`;
      
      const userInfo = await window.ezsite.apis.getUserInfo();
      
      const applicationData = {
        ...currentApplication,
        application_number: applicationNumber,
        applicant_user_id: userInfo.data?.ID,
        status: 'draft',
        priority: 'normal',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userInfo.data?.ID,
        updated_by: userInfo.data?.ID
      };

      // Create application
      const { error: applicationError } = await window.ezsite.apis.tableCreate(35423, applicationData);
      if (applicationError) throw applicationError;

      // Upload documents
      for (const doc of documents) {
        if (doc.file) {
          try {
            const { data: fileId, error: uploadError } = await window.ezsite.apis.upload({
              filename: doc.file.name,
              file: doc.file
            });

            if (uploadError) throw uploadError;

            const { data: fileUrl, error: urlError } = await window.ezsite.apis.getUploadUrl(fileId);
            if (urlError) throw urlError;

            // Save document record
            await window.ezsite.apis.tableCreate(35425, {
              permit_application_id: applicationNumber, // Will need to get actual ID
              document_type: doc.document_type,
              document_name: doc.document_name,
              file_path: fileUrl,
              file_url: fileUrl,
              file_size: doc.file.size,
              mime_type: doc.file.type,
              version: 1,
              is_required: doc.is_required,
              uploaded_by: userInfo.data?.ID,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } catch (docError) {
            console.error('Error uploading document:', docError);
            // Continue with other documents
          }
        }
      }

      toast({
        title: "Success",
        description: `Application ${applicationNumber} submitted successfully!`,
      });

      // Reset form and reload data
      setCurrentApplication({
        permit_type_id: 0,
        property_address: '',
        work_description: '',
        estimated_value: 0,
        contractor_name: '',
        contractor_license: ''
      });
      setDocuments([]);
      setStep(1);
      setActiveTab('my-applications');
      loadData();

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedPermitType = permitTypes.find(type => type.id === currentApplication.permit_type_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Permit Application Portal</h1>
        <Badge variant="outline" className="px-3 py-1">
          <Bell className="w-4 h-4 mr-2" />
          Applicant Portal
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-application">New Application</TabsTrigger>
          <TabsTrigger value="my-applications">My Applications</TabsTrigger>
          <TabsTrigger value="permit-types">Available Permits</TabsTrigger>
        </TabsList>

        {/* New Application Tab */}
        <TabsContent value="new-application" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Create New Permit Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {stepNum}
                      </div>
                      {stepNum < 4 && (
                        <div className={`w-16 h-1 mx-4 ${
                          step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Permit Type Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Step 1: Select Permit Type</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="permit-type">Permit Type *</Label>
                        <Select onValueChange={handlePermitTypeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select permit type" />
                          </SelectTrigger>
                          <SelectContent>
                            {permitTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                <div>
                                  <div className="font-medium">{type.name}</div>
                                  <div className="text-sm text-gray-500">${(type.fee_amount / 100).toFixed(2)} - {type.processing_time_days} days</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedPermitType && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900">{selectedPermitType.name}</h4>
                          <p className="text-sm text-blue-800 mb-2">{selectedPermitType.description}</p>
                          <div className="flex gap-4 text-sm">
                            <span>Fee: ${(selectedPermitType.fee_amount / 100).toFixed(2)}</span>
                            <span>Processing Time: {selectedPermitType.processing_time_days} days</span>
                            {selectedPermitType.inspection_required && (
                              <Badge className="bg-blue-100 text-blue-800">Inspection Required</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Application Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Step 2: Application Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="property-address">Property Address *</Label>
                        <Input
                          id="property-address"
                          value={currentApplication.property_address}
                          onChange={(e) => setCurrentApplication(prev => ({
                            ...prev,
                            property_address: e.target.value
                          }))}
                          placeholder="Enter complete property address"
                        />
                      </div>

                      <div>
                        <Label htmlFor="estimated-value">Estimated Project Value *</Label>
                        <Input
                          id="estimated-value"
                          type="number"
                          value={currentApplication.estimated_value / 100}
                          onChange={(e) => setCurrentApplication(prev => ({
                            ...prev,
                            estimated_value: Math.round(parseFloat(e.target.value || '0') * 100)
                          }))}
                          placeholder="Enter estimated value in dollars"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contractor-name">Contractor Name *</Label>
                        <Input
                          id="contractor-name"
                          value={currentApplication.contractor_name}
                          onChange={(e) => setCurrentApplication(prev => ({
                            ...prev,
                            contractor_name: e.target.value
                          }))}
                          placeholder="Enter contractor/company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contractor-license">Contractor License Number *</Label>
                        <Input
                          id="contractor-license"
                          value={currentApplication.contractor_license}
                          onChange={(e) => setCurrentApplication(prev => ({
                            ...prev,
                            contractor_license: e.target.value
                          }))}
                          placeholder="Enter license number"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="work-description">Work Description *</Label>
                        <Textarea
                          id="work-description"
                          value={currentApplication.work_description}
                          onChange={(e) => setCurrentApplication(prev => ({
                            ...prev,
                            work_description: e.target.value
                          }))}
                          placeholder="Provide detailed description of the work to be performed"
                          rows={4}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="applicant-notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="applicant-notes"
                          value={currentApplication.applicant_notes || ''}
                          onChange={(e) => setCurrentApplication(prev => ({
                            ...prev,
                            applicant_notes: e.target.value
                          }))}
                          placeholder="Any additional information or special requests"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Document Upload */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Step 3: Upload Required Documents</h3>
                    {documents.length > 0 ? (
                      <div className="grid gap-4">
                        {documents.map((doc, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{doc.document_type}</h4>
                              {doc.is_required ? (
                                <Badge variant="destructive">Required</Badge>
                              ) : (
                                <Badge variant="secondary">Optional</Badge>
                              )}
                            </div>
                            <FileUploadZone document={doc} index={index} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileCheck className="w-12 h-12 mx-auto mb-4" />
                        <p>No documents required for this permit type.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Review and Submit */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Step 4: Review and Submit</h3>
                    
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Application Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Permit Type</Label>
                              <p>{selectedPermitType?.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Property Address</Label>
                              <p>{currentApplication.property_address}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Contractor</Label>
                              <p>{currentApplication.contractor_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">License Number</Label>
                              <p>{currentApplication.contractor_license}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Estimated Value</Label>
                              <p>${(currentApplication.estimated_value / 100).toLocaleString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Application Fee</Label>
                              <p>${(selectedPermitType?.fee_amount || 0) / 100}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label className="text-sm font-medium text-gray-600">Work Description</Label>
                            <p className="mt-1">{currentApplication.work_description}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {documents.filter(doc => doc.file).length > 0 ? (
                            <div className="space-y-2">
                              {documents.filter(doc => doc.file).map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <span className="text-sm">{doc.document_type}: {doc.document_name}</span>
                                  <Badge variant="outline">Ready to upload</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No documents attached</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                  >
                    Previous
                  </Button>

                  {step < 4 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={step === 1 && !currentApplication.permit_type_id}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitApplication}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="my-applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Applications</h2>
            <Button onClick={() => setActiveTab('new-application')}>
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>

          {userApplications.length > 0 ? (
            <div className="grid gap-4">
              {userApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">#{application.application_number}</h3>
                          <Badge className={getStatusColor(application.status || '')}>
                            {application.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {application.fee_paid && (
                            <Badge className="bg-green-100 text-green-800">
                              <CreditCard className="w-3 h-3 mr-1" />
                              PAID
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {application.property_address}
                        </p>
                        <p className="text-sm">{application.work_description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Submitted: {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Draft'}</span>
                          <span>Value: ${((application.estimated_value || 0) / 100).toLocaleString()}</span>
                          {application.expires_at && (
                            <span>Expires: {new Date(application.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {!application.fee_paid && application.status !== 'draft' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Fees
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first permit application.</p>
                <Button onClick={() => setActiveTab('new-application')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Application
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Available Permits Tab */}
        <TabsContent value="permit-types" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Available Permit Types</h2>
          </div>

          <div className="grid gap-6">
            {permitTypes.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{type.name}</h3>
                        <Badge variant="outline">{type.code}</Badge>
                        {type.inspection_required && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Inspection Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{type.description}</p>
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>Fee: ${(type.fee_amount / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Processing: {type.processing_time_days} days</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        handlePermitTypeChange(type.id.toString());
                        setActiveTab('new-application');
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicantPortal;
