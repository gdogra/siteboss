
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Download,
  MessageSquare } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PermitStatus {
  applicationNumber: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  timeline: TimelineEvent[];
  nextAction?: string;
  estimatedCompletion?: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  actor?: string;
}

interface PermitStatusTrackerProps {
  applicationId?: number;
  applicationNumber?: string;
}

const PermitStatusTracker: React.FC<PermitStatusTrackerProps> = ({
  applicationId,
  applicationNumber
}) => {
  const [permitStatus, setPermitStatus] = useState<PermitStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (applicationId || applicationNumber) {
      loadPermitStatus();
    }
  }, [applicationId, applicationNumber]);

  const loadPermitStatus = async () => {
    try {
      setLoading(true);

      // Load permit application
      const filters = applicationId ?
      [{ name: 'id', op: 'Equal', value: applicationId }] :
      [{ name: 'application_number', op: 'Equal', value: applicationNumber }];

      const { data: applicationData, error } = await window.ezsite.apis.tablePage(35423, {
        PageNo: 1,
        PageSize: 1,
        Filters: filters
      });

      if (error) throw error;

      const application = applicationData?.List?.[0];
      if (!application) {
        throw new Error('Application not found');
      }

      // Generate timeline based on application status and data
      const timeline = generateTimeline(application);
      const progress = calculateProgress(application.status);

      setPermitStatus({
        applicationNumber: application.application_number,
        status: application.status,
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        timeline,
        nextAction: getNextAction(application.status),
        estimatedCompletion: calculateEstimatedCompletion(application)
      });

    } catch (error) {
      console.error('Error loading permit status:', error);
      toast({
        title: "Error",
        description: "Failed to load permit status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = (application: any): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [
    {
      date: application.created_at,
      title: 'Application Submitted',
      description: 'Permit application submitted for review',
      status: 'completed'
    }];


    if (application.submitted_at) {
      timeline.push({
        date: application.submitted_at,
        title: 'Documents Submitted',
        description: 'All required documents uploaded',
        status: 'completed'
      });
    }

    if (application.fee_paid) {
      timeline.push({
        date: application.submitted_at || application.created_at,
        title: 'Fees Paid',
        description: 'Application fees processed',
        status: 'completed'
      });
    }

    if (application.reviewed_at) {
      timeline.push({
        date: application.reviewed_at,
        title: 'Initial Review Complete',
        description: 'Application reviewed by staff',
        status: 'completed',
        actor: 'City Planning Department'
      });
    }

    // Add current status
    const currentStep = getCurrentStepFromStatus(application.status);
    if (currentStep) {
      timeline.push({
        date: new Date().toISOString(),
        title: currentStep.title,
        description: currentStep.description,
        status: 'current'
      });
    }

    // Add future steps
    const futureSteps = getFutureSteps(application.status);
    futureSteps.forEach((step) => {
      timeline.push({
        date: '', // TBD
        title: step.title,
        description: step.description,
        status: 'pending'
      });
    });

    return timeline;
  };

  const calculateProgress = (status: string) => {
    const statusProgress = {
      'draft': { currentStep: 1, totalSteps: 8 },
      'submitted': { currentStep: 2, totalSteps: 8 },
      'under_review': { currentStep: 3, totalSteps: 8 },
      'pending_documents': { currentStep: 4, totalSteps: 8 },
      'approved': { currentStep: 6, totalSteps: 8 },
      'inspection_scheduled': { currentStep: 7, totalSteps: 8 },
      'inspection_passed': { currentStep: 8, totalSteps: 8 },
      'rejected': { currentStep: 3, totalSteps: 8 }
    };

    return statusProgress[status] || { currentStep: 1, totalSteps: 8 };
  };

  const getCurrentStepFromStatus = (status: string) => {
    const stepMap = {
      'draft': { title: 'Draft in Progress', description: 'Complete your application and submit' },
      'submitted': { title: 'Under Initial Review', description: 'Application is being reviewed by staff' },
      'under_review': { title: 'Detailed Review', description: 'Technical review in progress' },
      'pending_documents': { title: 'Awaiting Documents', description: 'Additional documents required' },
      'approved': { title: 'Approved', description: 'Permit approved - scheduling inspection' },
      'inspection_scheduled': { title: 'Inspection Scheduled', description: 'Awaiting field inspection' },
      'inspection_passed': { title: 'Complete', description: 'All requirements satisfied' },
      'rejected': { title: 'Application Rejected', description: 'Review rejection details and resubmit' }
    };

    return stepMap[status];
  };

  const getFutureSteps = (status: string) => {
    const allSteps = [
    { title: 'Technical Review', description: 'Engineering and code compliance review' },
    { title: 'Plan Approval', description: 'Plans approved for construction' },
    { title: 'Inspection Scheduling', description: 'Schedule required inspections' },
    { title: 'Field Inspection', description: 'On-site inspection conducted' },
    { title: 'Final Approval', description: 'Certificate of occupancy issued' }];


    const statusIndex = {
      'draft': 0,
      'submitted': 1,
      'under_review': 2,
      'pending_documents': 1,
      'approved': 3,
      'inspection_scheduled': 4,
      'inspection_passed': 5,
      'rejected': 0
    };

    const startIndex = statusIndex[status] || 0;
    return allSteps.slice(startIndex);
  };

  const getNextAction = (status: string) => {
    const actions = {
      'draft': 'Complete and submit your application',
      'submitted': 'Wait for initial review (3-5 business days)',
      'under_review': 'No action required - review in progress',
      'pending_documents': 'Upload required documents',
      'approved': 'Schedule inspection online or by phone',
      'inspection_scheduled': 'Prepare site for scheduled inspection',
      'inspection_passed': 'Download permit certificate',
      'rejected': 'Review comments and resubmit application'
    };

    return actions[status];
  };

  const calculateEstimatedCompletion = (application: any) => {
    // Simple estimation based on permit type and current status
    const processingDays = application.processing_time_days || 14;
    const submittedDate = new Date(application.submitted_at || application.created_at);
    const estimatedDate = new Date(submittedDate.getTime() + processingDays * 24 * 60 * 60 * 1000);

    return estimatedDate.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'inspection_passed':return 'bg-green-100 text-green-800';
      case 'under_review':
      case 'inspection_scheduled':return 'bg-blue-100 text-blue-800';
      case 'pending_documents':return 'bg-yellow-100 text-yellow-800';
      case 'rejected':return 'bg-red-100 text-red-800';
      case 'draft':return 'bg-gray-100 text-gray-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading permit status...</p>
        </CardContent>
      </Card>);

  }

  if (!permitStatus) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Permit status not available</p>
        </CardContent>
      </Card>);

  }

  const progressPercentage = permitStatus.currentStep / permitStatus.totalSteps * 100;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Permit #{permitStatus.applicationNumber}
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getStatusColor(permitStatus.status)}>
                  {permitStatus.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">
                  Step {permitStatus.currentStep} of {permitStatus.totalSteps}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            
            {permitStatus.nextAction &&
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Next Action Required</p>
                    <p className="text-sm text-blue-800">{permitStatus.nextAction}</p>
                  </div>
                </div>
              </div>
            }

            {permitStatus.estimatedCompletion &&
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Estimated completion: {permitStatus.estimatedCompletion}</span>
              </div>
            }
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permitStatus.timeline.map((event, index) =>
            <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                event.status === 'completed' ? 'bg-green-100 text-green-600' :
                event.status === 'current' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'}`
                }>
                    {event.status === 'completed' ?
                  <CheckCircle className="w-4 h-4" /> :
                  event.status === 'current' ?
                  <Clock className="w-4 h-4" /> :

                  <div className="w-2 h-2 bg-current rounded-full" />
                  }
                  </div>
                  {index < permitStatus.timeline.length - 1 &&
                <div className={`w-px h-8 ${
                event.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'}`
                } />
                }
                </div>
                
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${
                    event.status === 'current' ? 'text-blue-900' : 'text-gray-900'}`
                    }>
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      {event.actor &&
                    <p className="text-xs text-gray-500 mt-1">by {event.actor}</p>
                    }
                    </div>
                    {event.date &&
                  <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                  }
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
        <Button variant="outline" className="flex-1">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Inspection
        </Button>
        <Button variant="outline" className="flex-1">
          <DollarSign className="w-4 h-4 mr-2" />
          Pay Additional Fees
        </Button>
      </div>
    </div>);

};

export default PermitStatusTracker;