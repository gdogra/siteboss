import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Filter,
  Search,
  Plus,
  X,
  Save,
  Settings,
  Grid,
  List,
  PieChart
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'progress' | 'safety' | 'quality' | 'custom';
  generatedBy: string;
  generatedDate: string;
  description: string;
  status: 'ready' | 'generating' | 'scheduled';
}

const ReportsAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [customReport, setCustomReport] = useState({
    name: '',
    description: '',
    sections: {
      projectInfo: false,
      financials: false,
      tasks: false,
      safety: false,
      quality: false,
      timeline: false,
      resources: false,
      photos: false
    },
    format: 'pdf',
    schedule: 'manual'
  });

  // Mock analytics data
  const analytics = {
    projectProgress: {
      current: 67,
      target: 70,
      trend: 'up'
    },
    budgetStatus: {
      spent: 1675000,
      total: 2500000,
      variance: -3.2
    },
    taskCompletion: {
      completed: 156,
      total: 234,
      overdue: 8
    },
    teamEfficiency: {
      hoursWorked: 1240,
      hoursPlanned: 1200,
      productivity: 103
    }
  };

  // Mock report templates and recent reports
  const reportTemplates = [
    {
      id: '1',
      name: 'Weekly Progress Report',
      type: 'progress' as const,
      description: 'Comprehensive weekly project status update'
    },
    {
      id: '2',
      name: 'Financial Summary',
      type: 'financial' as const,
      description: 'Budget analysis and cost tracking report'
    },
    {
      id: '3',
      name: 'Safety Compliance Report',
      type: 'safety' as const,
      description: 'Safety incidents and compliance metrics'
    },
    {
      id: '4',
      name: 'Quality Control Report',
      type: 'quality' as const,
      description: 'Inspections, defects, and quality metrics'
    }
  ];

  const recentReports: Report[] = [
    {
      id: '1',
      name: 'Weekly Progress Report - Week 36',
      type: 'progress',
      generatedBy: 'Sarah Johnson',
      generatedDate: '2024-09-08',
      description: 'Comprehensive weekly project status for Sep 2-8',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Monthly Financial Summary - August',
      type: 'financial',
      generatedBy: 'Mike Chen',
      generatedDate: '2024-09-01',
      description: 'Budget analysis and expenditure report for August 2024',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Safety Compliance Report - Q3',
      type: 'safety',
      generatedBy: 'Lisa Rodriguez',
      generatedDate: '2024-09-07',
      description: 'Quarterly safety metrics and incident analysis',
      status: 'ready'
    },
    {
      id: '4',
      name: 'Quality Control Report - Foundation Phase',
      type: 'quality',
      generatedBy: 'David Park',
      generatedDate: '2024-09-06',
      description: 'Foundation inspection results and quality metrics',
      status: 'generating'
    }
  ];

  const getReportIcon = (type: Report['type']) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'progress':
        return <BarChart3 className="w-5 h-5 text-blue-600" />;
      case 'safety':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'quality':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    const variants = {
      ready: 'default',
      generating: 'secondary',
      scheduled: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const filteredReports = recentReports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create report content based on type
  const createReportContent = (templateName: string, type: string) => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    
    let content = '';
    
    switch (type) {
      case 'progress':
        content = `
PROJECT PROGRESS REPORT
Generated: ${date} ${time}

PROJECT OVERVIEW
================
Project Progress: ${analytics.projectProgress.current}%
Target Progress: ${analytics.projectProgress.target}%
Status: ${analytics.projectProgress.trend === 'up' ? 'On Track' : 'Behind Schedule'}

TASK COMPLETION
===============
Completed Tasks: ${analytics.taskCompletion.completed}
Total Tasks: ${analytics.taskCompletion.total}
Overdue Tasks: ${analytics.taskCompletion.overdue}
Completion Rate: ${Math.round((analytics.taskCompletion.completed / analytics.taskCompletion.total) * 100)}%

TEAM EFFICIENCY
===============
Hours Worked: ${analytics.teamEfficiency.hoursWorked}
Hours Planned: ${analytics.teamEfficiency.hoursPlanned}
Productivity: ${analytics.teamEfficiency.productivity}%

NEXT STEPS
==========
1. Address ${analytics.taskCompletion.overdue} overdue tasks
2. Continue monitoring progress against targets
3. Review resource allocation for upcoming milestones

This report was generated automatically by SiteBoss Construction Management System.
        `;
        break;
        
      case 'financial':
        content = `
FINANCIAL SUMMARY REPORT
Generated: ${date} ${time}

BUDGET OVERVIEW
===============
Total Budget: $${(analytics.budgetStatus.total / 1000000).toFixed(2)}M
Amount Spent: $${(analytics.budgetStatus.spent / 1000000).toFixed(2)}M
Remaining: $${((analytics.budgetStatus.total - analytics.budgetStatus.spent) / 1000000).toFixed(2)}M
Budget Utilization: ${Math.round((analytics.budgetStatus.spent / analytics.budgetStatus.total) * 100)}%

VARIANCE ANALYSIS
=================
Budget Variance: ${analytics.budgetStatus.variance > 0 ? '+' : ''}${analytics.budgetStatus.variance}%
Status: ${Math.abs(analytics.budgetStatus.variance) < 5 ? 'On Budget' : 'Needs Attention'}

COST BREAKDOWN
==============
Labor: 45% - $${((analytics.budgetStatus.spent * 0.45) / 1000000).toFixed(2)}M
Materials: 35% - $${((analytics.budgetStatus.spent * 0.35) / 1000000).toFixed(2)}M
Equipment: 15% - $${((analytics.budgetStatus.spent * 0.15) / 1000000).toFixed(2)}M
Other: 5% - $${((analytics.budgetStatus.spent * 0.05) / 1000000).toFixed(2)}M

RECOMMENDATIONS
===============
${analytics.budgetStatus.variance > 5 ? 
  '• Review spending in high-variance categories\n• Implement cost control measures\n• Reassess budget allocations' : 
  '• Continue current spending patterns\n• Monitor upcoming major expenditures\n• Maintain budget discipline'}

This report was generated automatically by SiteBoss Construction Management System.
        `;
        break;
        
      case 'safety':
        content = `
SAFETY COMPLIANCE REPORT
Generated: ${date} ${time}

SAFETY METRICS
==============
Total Inspections: 15
Passed Inspections: 13
Failed Inspections: 2
Safety Score: 87%

INCIDENTS SUMMARY
=================
Total Incidents: 3
Minor Incidents: 2
Major Incidents: 1
Days Since Last Incident: 7

COMPLIANCE STATUS
=================
OSHA Compliance: 95%
Local Regulations: 100%
Company Standards: 90%
Training Compliance: 98%

RECENT INCIDENTS
================
1. Minor cut injury - First Aid administered - 7 days ago
2. Near miss - Fall hazard identified and corrected - 14 days ago
3. Equipment damage - No injury - 21 days ago

ACTION ITEMS
============
• Complete safety training for 2 team members
• Install additional safety barriers in identified areas
• Review and update emergency procedures
• Schedule monthly safety meetings

RECOMMENDATIONS
===============
• Increase safety inspections frequency
• Implement additional fall protection measures
• Enhance safety communication protocols

This report was generated automatically by SiteBoss Construction Management System.
        `;
        break;
        
      case 'quality':
        content = `
QUALITY CONTROL REPORT
Generated: ${date} ${time}

QUALITY METRICS
===============
Overall Quality Score: 88%
Inspections Passed: 92%
Defects Identified: 12
Defects Resolved: 10
Pending Issues: 2

INSPECTION SUMMARY
==================
Foundation Quality: 95% - Excellent
Structural Work: 85% - Good  
MEP Systems: 82% - Satisfactory
Finishes: 90% - Excellent

DEFECT ANALYSIS
===============
Critical Defects: 0
Major Defects: 3
Minor Defects: 9
Cosmetic Issues: 0

RESOLUTION STATUS
=================
Resolved This Week: 5
Pending Resolution: 2
Average Resolution Time: 3.2 days

TOP QUALITY CONCERNS
====================
1. Electrical conduit alignment - In Progress
2. Concrete surface finish - Pending
3. Plumbing connections - Resolved

QUALITY TRENDS
==============
Quality Score Trend: Improving (+3% from last month)
Defect Rate: Decreasing
Resolution Time: Stable

RECOMMENDATIONS
===============
• Focus on electrical work quality control
• Implement additional concrete finishing checks
• Continue current quality management practices

This report was generated automatically by SiteBoss Construction Management System.
        `;
        break;
        
      default:
        content = `
CUSTOM REPORT: ${templateName}
Generated: ${date} ${time}

This is a sample custom report generated by SiteBoss Construction Management System.
Report content would be customized based on user specifications.

PROJECT DATA SUMMARY
=====================
Progress: ${analytics.projectProgress.current}%
Budget Used: ${Math.round((analytics.budgetStatus.spent / analytics.budgetStatus.total) * 100)}%
Team Efficiency: ${analytics.teamEfficiency.productivity}%
Task Completion: ${Math.round((analytics.taskCompletion.completed / analytics.taskCompletion.total) * 100)}%

This report was generated automatically by SiteBoss Construction Management System.
        `;
    }
    
    return content;
  };

  const downloadReport = (content: string, filename: string, format: 'txt' | 'html' = 'txt') => {
    let blob: Blob;
    let finalFilename = filename;
    
    if (format === 'html') {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        .header { background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 20px; }
        .metrics { background: #f1f5f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
        pre { background: #f8fafc; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SiteBoss Construction Management Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <pre>${content}</pre>
</body>
</html>`;
      blob = new Blob([htmlContent], { type: 'text/html' });
      finalFilename = filename.replace('.txt', '.html');
    } else {
      blob = new Blob([content], { type: 'text/plain' });
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Report action handlers
  const handleGenerateReport = async (templateId: string, templateName: string) => {
    setGenerating(templateId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = reportTemplates.find(t => t.id === templateId);
      const content = createReportContent(templateName, template?.type || 'custom');
      const filename = `${templateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      
      downloadReport(content, filename);
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadReport = (report: Report) => {
    const content = createReportContent(report.name, report.type);
    const filename = `${report.name.replace(/\s+/g, '_')}.txt`;
    downloadReport(content, filename);
  };

  const handleViewReport = (report: Report) => {
    const content = createReportContent(report.name, report.type);
    const filename = `${report.name.replace(/\s+/g, '_')}_preview.html`;
    downloadReport(content, filename, 'html');
  };

  const handleExportPDF = async () => {
    const content = `
COMPREHENSIVE PROJECT REPORT
Generated: ${new Date().toLocaleString()}

${createReportContent('Complete Project Analysis', 'progress')}

${createReportContent('Financial Analysis', 'financial')}

${createReportContent('Safety Report', 'safety')}

${createReportContent('Quality Report', 'quality')}
    `;
    
    downloadReport(content, `Project_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.html`, 'html');
  };

  const handleExportExcel = async () => {
    const csvContent = `Project Data Export
Generated,${new Date().toLocaleString()}

Metric,Value,Unit
Project Progress,${analytics.projectProgress.current},%
Budget Total,${analytics.budgetStatus.total},USD
Budget Spent,${analytics.budgetStatus.spent},USD
Budget Variance,${analytics.budgetStatus.variance},%
Tasks Completed,${analytics.taskCompletion.completed},count
Tasks Total,${analytics.taskCompletion.total},count
Tasks Overdue,${analytics.taskCompletion.overdue},count
Hours Worked,${analytics.teamEfficiency.hoursWorked},hours
Hours Planned,${analytics.teamEfficiency.hoursPlanned},hours
Team Productivity,${analytics.teamEfficiency.productivity},%

This data was exported from SiteBoss Construction Management System.
    `;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `Project_Data_Export_${new Date().toISOString().split('T')[0]}.csv`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleScheduleReports = async () => {
    setShowScheduleModal(true);
  };

  const handleCreateCustomReport = async () => {
    setShowCustomReportModal(true);
  };

  const handleGenerateCustomReport = async () => {
    const selectedSections = Object.entries(customReport.sections)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    if (selectedSections.length === 0) {
      alert('Please select at least one section for your report.');
      return;
    }

    const reportContent = generateCustomReportContent(selectedSections);
    const filename = `${customReport.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    
    if (customReport.format === 'pdf') {
      downloadReport(reportContent, `${filename}.html`, 'html');
    } else {
      downloadReport(reportContent, `${filename}.txt`, 'txt');
    }

    setShowCustomReportModal(false);
    setCustomReport({
      name: '',
      description: '',
      sections: {
        projectInfo: false,
        financials: false,
        tasks: false,
        safety: false,
        quality: false,
        timeline: false,
        resources: false,
        photos: false
      },
      format: 'pdf',
      schedule: 'manual'
    });
  };

  const generateCustomReportContent = (sections: string[]) => {
    let content = `CUSTOM PROJECT REPORT: ${customReport.name}
Generated: ${new Date().toLocaleString()}

${customReport.description ? `Description: ${customReport.description}\n\n` : ''}`;

    sections.forEach(section => {
      switch (section) {
        case 'projectInfo':
          content += `PROJECT INFORMATION
==================
Progress: ${analytics.projectProgress.current}%
Target Progress: ${analytics.projectProgress.target}%
Status: ${analytics.projectProgress.trend === 'up' ? 'On Track' : 'Behind Schedule'}

`;
          break;
        case 'financials':
          content += `FINANCIAL SUMMARY
================
Total Budget: $${(analytics.budgetStatus.total / 1000000).toFixed(2)}M
Amount Spent: $${(analytics.budgetStatus.spent / 1000000).toFixed(2)}M
Remaining: $${((analytics.budgetStatus.total - analytics.budgetStatus.spent) / 1000000).toFixed(2)}M
Budget Variance: ${analytics.budgetStatus.variance > 0 ? '+' : ''}${analytics.budgetStatus.variance}%

`;
          break;
        case 'tasks':
          content += `TASK OVERVIEW
=============
Completed Tasks: ${analytics.taskCompletion.completed}
Total Tasks: ${analytics.taskCompletion.total}
Overdue Tasks: ${analytics.taskCompletion.overdue}
Completion Rate: ${Math.round((analytics.taskCompletion.completed / analytics.taskCompletion.total) * 100)}%

`;
          break;
        case 'safety':
          content += `SAFETY METRICS
==============
Recent Safety Score: 87%
Incidents This Month: 1
Days Since Last Incident: 7
Safety Training Compliance: 98%

`;
          break;
        case 'quality':
          content += `QUALITY CONTROL
===============
Overall Quality Score: 88%
Inspections Passed: 92%
Defects Identified: 12
Defects Resolved: 10

`;
          break;
        case 'timeline':
          content += `PROJECT TIMELINE
================
Start Date: ${new Date().toLocaleDateString()}
Target Completion: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Current Phase: Construction
Milestones Completed: 3 of 8

`;
          break;
        case 'resources':
          content += `RESOURCE UTILIZATION
===================
Team Size: 15 members
Equipment Utilization: 78%
Material Inventory: Adequate
Subcontractor Performance: Good

`;
          break;
        case 'photos':
          content += `PROGRESS DOCUMENTATION
=====================
Progress Photos: 24 uploaded this week
Inspection Photos: 8 quality control images
Before/After Documentation: Complete
360° Site Tours: 2 virtual walkthroughs

`;
          break;
      }
    });

    content += `

This custom report was generated by SiteBoss Construction Management System.
Report generated on ${new Date().toLocaleString()} for timeframe: ${selectedTimeframe}.`;

    return content;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate insights and track project performance</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          <Button 
            onClick={handleCreateCustomReport}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Project Progress</div>
                <div className="text-xl font-bold flex items-center gap-1">
                  {analytics.projectProgress.current}%
                  {analytics.projectProgress.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            <Progress value={analytics.projectProgress.current} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Budget Status</div>
                <div className="text-xl font-bold">
                  ${(analytics.budgetStatus.spent / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-muted-foreground">
                  of ${(analytics.budgetStatus.total / 1000000).toFixed(1)}M 
                  ({analytics.budgetStatus.variance > 0 ? '+' : ''}{analytics.budgetStatus.variance}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Task Completion</div>
                <div className="text-xl font-bold">
                  {analytics.taskCompletion.completed}/{analytics.taskCompletion.total}
                </div>
                <div className="text-sm text-red-600">
                  {analytics.taskCompletion.overdue} overdue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Team Efficiency</div>
                <div className="text-xl font-bold">{analytics.teamEfficiency.productivity}%</div>
                <div className="text-sm text-muted-foreground">
                  {analytics.teamEfficiency.hoursWorked}h worked
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <div key={template.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                {getReportIcon(template.type)}
                <div className="flex-1">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleGenerateReport(template.id, template.name)}
                  disabled={generating === template.id}
                >
                  {generating === template.id ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {getReportIcon(report.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{report.name}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {report.generatedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.generatedDate}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status === 'ready' && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">PDF Reports</h3>
              <p className="text-sm text-muted-foreground mb-3">Professional formatted reports</p>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>Export PDF</Button>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Excel Export</h3>
              <p className="text-sm text-muted-foreground mb-3">Raw data for analysis</p>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>Export Excel</Button>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Scheduled Reports</h3>
              <p className="text-sm text-muted-foreground mb-3">Automated report delivery</p>
              <Button variant="outline" size="sm" onClick={handleScheduleReports}>Schedule</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder Modal */}
      {showCustomReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Custom Report Builder</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCustomReportModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Report Configuration */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-4">Report Details</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="report-name">Report Name *</Label>
                        <Input
                          id="report-name"
                          value={customReport.name}
                          onChange={(e) => setCustomReport({...customReport, name: e.target.value})}
                          placeholder="Enter report name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="report-description">Description</Label>
                        <Textarea
                          id="report-description"
                          value={customReport.description}
                          onChange={(e) => setCustomReport({...customReport, description: e.target.value})}
                          placeholder="Brief description of the report purpose"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="report-format">Format</Label>
                          <Select
                            value={customReport.format}
                            onValueChange={(value) => setCustomReport({...customReport, format: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF (Formatted)</SelectItem>
                              <SelectItem value="txt">Text Document</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="report-schedule">Schedule</Label>
                          <Select
                            value={customReport.schedule}
                            onValueChange={(value) => setCustomReport({...customReport, schedule: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Generate Now</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Section Selection */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-4">Report Sections</h4>
                    <p className="text-sm text-gray-600 mb-4">Select the sections to include in your custom report:</p>
                    
                    <div className="space-y-3">
                      {[
                        { key: 'projectInfo', label: 'Project Information', icon: Settings, description: 'Progress, status, and overview' },
                        { key: 'financials', label: 'Financial Summary', icon: DollarSign, description: 'Budget, costs, and variance analysis' },
                        { key: 'tasks', label: 'Task Overview', icon: CheckCircle, description: 'Task completion and progress tracking' },
                        { key: 'safety', label: 'Safety Metrics', icon: AlertTriangle, description: 'Safety scores and incident reports' },
                        { key: 'quality', label: 'Quality Control', icon: Settings, description: 'Inspections and quality metrics' },
                        { key: 'timeline', label: 'Project Timeline', icon: Calendar, description: 'Milestones and schedule tracking' },
                        { key: 'resources', label: 'Resource Utilization', icon: Users, description: 'Team, equipment, and materials' },
                        { key: 'photos', label: 'Progress Documentation', icon: FileText, description: 'Photos and visual documentation' }
                      ].map((section) => {
                        const Icon = section.icon;
                        return (
                          <div key={section.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                            <Checkbox
                              id={section.key}
                              checked={customReport.sections[section.key as keyof typeof customReport.sections]}
                              onCheckedChange={(checked) => 
                                setCustomReport({
                                  ...customReport,
                                  sections: {
                                    ...customReport.sections,
                                    [section.key]: checked
                                  }
                                })
                              }
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-gray-500" />
                                <Label htmlFor={section.key} className="font-medium cursor-pointer">
                                  {section.label}
                                </Label>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Report Preview</h5>
                <div className="text-xs text-gray-600">
                  <p><strong>Name:</strong> {customReport.name || 'Untitled Report'}</p>
                  <p><strong>Format:</strong> {customReport.format.toUpperCase()}</p>
                  <p><strong>Sections:</strong> {Object.values(customReport.sections).filter(Boolean).length} selected</p>
                  <p><strong>Schedule:</strong> {customReport.schedule === 'manual' ? 'Generate immediately' : `Generate ${customReport.schedule}`}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomReportModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateCustomReport}
                  disabled={!customReport.name.trim() || Object.values(customReport.sections).every(v => !v)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {customReport.schedule === 'manual' ? 'Generate Report' : 'Schedule Report'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Reports Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Schedule Automated Reports</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowScheduleModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report Type Selection */}
                  <div>
                    <Label>Report Type</Label>
                    <Select defaultValue="weekly-summary">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily-status">Daily Status Report</SelectItem>
                        <SelectItem value="weekly-summary">Weekly Project Summary</SelectItem>
                        <SelectItem value="monthly-financial">Monthly Financial Report</SelectItem>
                        <SelectItem value="safety-weekly">Weekly Safety Report</SelectItem>
                        <SelectItem value="custom">Custom Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label>Delivery Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Day of Week */}
                  <div>
                    <Label>Delivery Day</Label>
                    <Select defaultValue="monday">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time */}
                  <div>
                    <Label>Delivery Time</Label>
                    <Select defaultValue="09:00">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <Label htmlFor="recipients">Email Recipients</Label>
                  <Textarea
                    id="recipients"
                    placeholder="Enter email addresses separated by commas&#10;e.g., manager@company.com, client@clientcompany.com"
                    className="mt-2"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Reports will be automatically generated and sent to these recipients
                  </p>
                </div>

                {/* Current Scheduled Reports */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-3">Current Scheduled Reports</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'Weekly Project Summary', frequency: 'Every Monday 9:00 AM', recipients: 2, status: 'active' },
                      { type: 'Monthly Financial Report', frequency: 'First Monday of month 8:00 AM', recipients: 3, status: 'active' },
                      { type: 'Daily Status Report', frequency: 'Every weekday 7:00 AM', recipients: 1, status: 'paused' }
                    ].map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{schedule.type}</div>
                          <div className="text-xs text-gray-600">{schedule.frequency} • {schedule.recipients} recipients</div>
                        </div>
                        <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                          {schedule.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;