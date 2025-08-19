
function getAnalyticsDashboardData(userId, roleCode, timeRange = 'daily') {
  const now = new Date();
  
  // Generate comprehensive dashboard data
  const dashboardData = {
    kpis: [
      {
        title: 'Total Revenue',
        value: Math.floor(Math.random() * 500000) + 250000,
        change: Math.round((Math.random() * 20 - 10) * 100) / 100,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        format: 'currency',
        category: 'financial'
      },
      {
        title: 'Active Projects',
        value: Math.floor(Math.random() * 50) + 25,
        change: Math.round((Math.random() * 10 - 5) * 100) / 100,
        changeType: Math.random() > 0.6 ? 'increase' : 'decrease',
        format: 'number',
        category: 'projects'
      },
      {
        title: 'Lead Conversion Rate',
        value: Math.round((Math.random() * 0.3 + 0.15) * 100),
        change: Math.round((Math.random() * 5 - 2.5) * 100) / 100,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        format: 'percentage',
        category: 'leads'
      },
      {
        title: 'Team Productivity',
        value: Math.round((Math.random() * 0.2 + 0.8) * 100),
        change: Math.round((Math.random() * 3 - 1.5) * 100) / 100,
        changeType: Math.random() > 0.7 ? 'increase' : 'decrease',
        format: 'percentage',
        category: 'productivity'
      }
    ],
    
    charts: {
      revenueOverTime: {
        title: 'Revenue Over Time',
        type: 'line',
        data: Array.from({length: 30}, (_, i) => ({
          date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 20000) + 10000,
          profit: Math.floor(Math.random() * 8000) + 4000
        }))
      },
      
      leadsBySource: {
        title: 'Leads by Source',
        type: 'pie',
        data: [
          { name: 'Website', value: Math.floor(Math.random() * 50) + 30, color: '#8884d8' },
          { name: 'Referrals', value: Math.floor(Math.random() * 40) + 20, color: '#82ca9d' },
          { name: 'Social Media', value: Math.floor(Math.random() * 30) + 15, color: '#ffc658' },
          { name: 'Direct Contact', value: Math.floor(Math.random() * 25) + 10, color: '#ff7300' }
        ]
      },
      
      projectStatus: {
        title: 'Project Status Distribution',
        type: 'bar',
        data: [
          { status: 'Planning', count: Math.floor(Math.random() * 15) + 5, color: '#8884d8' },
          { status: 'In Progress', count: Math.floor(Math.random() * 25) + 15, color: '#82ca9d' },
          { status: 'Review', count: Math.floor(Math.random() * 10) + 3, color: '#ffc658' },
          { status: 'Completed', count: Math.floor(Math.random() * 20) + 10, color: '#ff7300' }
        ]
      },
      
      timeTrackingTrend: {
        title: 'Time Tracking Trend (Hours)',
        type: 'area',
        data: Array.from({length: 14}, (_, i) => ({
          date: new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalHours: Math.floor(Math.random() * 50) + 30,
          productiveHours: Math.floor(Math.random() * 40) + 25
        }))
      }
    },
    
    alerts: [
      {
        id: 1,
        title: 'Low Inventory Alert',
        message: '5 items are running low on stock',
        level: 'warning',
        timestamp: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
        category: 'inventory'
      },
      {
        id: 2,
        title: 'High Value Lead',
        message: 'New lead with estimated value of $50,000+',
        level: 'info',
        timestamp: new Date(now.getTime() - Math.random() * 43200000).toISOString(),
        category: 'leads'
      },
      {
        id: 3,
        title: 'Payment Overdue',
        message: 'Invoice #INV-001 is 7 days overdue',
        level: 'critical',
        timestamp: new Date(now.getTime() - Math.random() * 21600000).toISOString(),
        category: 'financial'
      }
    ],
    
    insights: [
      {
        title: 'Revenue Growth Opportunity',
        description: 'Converting 20% more leads could increase monthly revenue by $45,000',
        impact: 'high',
        category: 'revenue',
        actionable: true,
        recommendation: 'Focus on lead nurturing campaigns and follow-up automation'
      },
      {
        title: 'Resource Optimization',
        description: 'Team productivity has increased by 15% this month',
        impact: 'medium',
        category: 'productivity',
        actionable: false,
        recommendation: 'Continue current workflow processes'
      },
      {
        title: 'Inventory Management',
        description: 'Inventory turnover rate is below industry average',
        impact: 'medium',
        category: 'inventory',
        actionable: true,
        recommendation: 'Review slow-moving items and adjust reorder points'
      }
    ],
    
    recentActivity: [
      {
        type: 'project',
        title: 'New project created',
        description: 'Kitchen Renovation - Smith Residence',
        timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
        user: 'John Doe'
      },
      {
        type: 'lead',
        title: 'Lead converted',
        description: 'Jane Wilson - Bathroom Remodel',
        timestamp: new Date(now.getTime() - Math.random() * 7200000).toISOString(),
        user: 'Sarah Johnson'
      },
      {
        type: 'payment',
        title: 'Payment received',
        description: '$15,000 payment processed',
        timestamp: new Date(now.getTime() - Math.random() * 10800000).toISOString(),
        user: 'System'
      }
    ],
    
    metadata: {
      userId,
      roleCode,
      timeRange,
      generatedAt: now.toISOString(),
      refreshInterval: 30000 // 30 seconds
    }
  };
  
  return dashboardData;
}
