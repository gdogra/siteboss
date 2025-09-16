import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  Banknote,
  Target
} from 'lucide-react';

interface CashFlowItem {
  id: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: 'payment' | 'expense' | 'milestone' | 'material' | 'labor' | 'equipment';
  amount: number;
  description: string;
  status: 'scheduled' | 'pending' | 'completed';
  probability: number; // 0-100 for predictions
}

interface CashFlowDashboardProps {
  projectId: string;
}

const CashFlowDashboard: React.FC<CashFlowDashboardProps> = ({ projectId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [viewType, setViewType] = useState<'chart' | 'table'>('chart');

  // Mock cash flow data - in production this would come from API
  const mockCashFlowData: CashFlowItem[] = [
    {
      id: '1',
      date: '2024-09-15',
      type: 'inflow',
      category: 'milestone',
      amount: 125000,
      description: 'Foundation Milestone Payment',
      status: 'pending',
      probability: 90
    },
    {
      id: '2',
      date: '2024-09-18',
      type: 'outflow',
      category: 'material',
      amount: -45000,
      description: 'Concrete and Rebar Delivery',
      status: 'scheduled',
      probability: 95
    },
    {
      id: '3',
      date: '2024-09-20',
      type: 'outflow',
      category: 'labor',
      amount: -32000,
      description: 'Weekly Labor Payroll',
      status: 'scheduled',
      probability: 100
    },
    {
      id: '4',
      date: '2024-09-25',
      type: 'inflow',
      category: 'payment',
      amount: 75000,
      description: 'Client Progress Payment',
      status: 'scheduled',
      probability: 85
    },
    {
      id: '5',
      date: '2024-10-01',
      type: 'outflow',
      category: 'equipment',
      amount: -18000,
      description: 'Crane Rental - October',
      status: 'scheduled',
      probability: 90
    },
    {
      id: '6',
      date: '2024-10-05',
      type: 'outflow',
      category: 'material',
      amount: -67000,
      description: 'Steel Frame Materials',
      status: 'scheduled',
      probability: 85
    },
    {
      id: '7',
      date: '2024-10-15',
      type: 'inflow',
      category: 'milestone',
      amount: 150000,
      description: 'Structural Milestone Payment',
      status: 'scheduled',
      probability: 80
    },
    {
      id: '8',
      date: '2024-10-20',
      type: 'outflow',
      category: 'labor',
      amount: -85000,
      description: 'Specialized Labor - Structural',
      status: 'scheduled',
      probability: 90
    },
    {
      id: '9',
      date: '2024-11-01',
      type: 'inflow',
      category: 'payment',
      amount: 100000,
      description: 'Monthly Progress Payment',
      status: 'scheduled',
      probability: 75
    },
    {
      id: '10',
      date: '2024-11-10',
      type: 'outflow',
      category: 'material',
      amount: -95000,
      description: 'MEP Systems Materials',
      status: 'scheduled',
      probability: 80
    }
  ];

  // Calculate running cash flow with probabilities
  const calculateCashFlow = useMemo(() => {
    const sortedData = [...mockCashFlowData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = 200000; // Starting balance
    
    const flowData = sortedData.map((item, index) => {
      const adjustedAmount = item.amount * (item.probability / 100);
      runningBalance += adjustedAmount;
      
      return {
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actualBalance: runningBalance,
        projectedInflow: item.type === 'inflow' ? item.amount : 0,
        projectedOutflow: item.type === 'outflow' ? Math.abs(item.amount) : 0,
        probability: item.probability,
        cumulativeFlow: runningBalance,
        riskAdjusted: runningBalance - (item.amount * ((100 - item.probability) / 100))
      };
    });

    return flowData;
  }, [mockCashFlowData]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { inflow: number; outflow: number; count: number } } = {};
    
    mockCashFlowData.forEach(item => {
      if (!breakdown[item.category]) {
        breakdown[item.category] = { inflow: 0, outflow: 0, count: 0 };
      }
      
      if (item.type === 'inflow') {
        breakdown[item.category].inflow += item.amount;
      } else {
        breakdown[item.category].outflow += Math.abs(item.amount);
      }
      breakdown[item.category].count++;
    });

    return Object.entries(breakdown).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow,
      count: data.count
    }));
  }, [mockCashFlowData]);

  const totalInflow = mockCashFlowData.filter(item => item.type === 'inflow').reduce((sum, item) => sum + item.amount, 0);
  const totalOutflow = Math.abs(mockCashFlowData.filter(item => item.type === 'outflow').reduce((sum, item) => sum + item.amount, 0));
  const netFlow = totalInflow - totalOutflow;
  const averageProbability = mockCashFlowData.reduce((sum, item) => sum + item.probability, 0) / mockCashFlowData.length;

  const pieData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.outflow,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 90) return 'text-green-600';
    if (probability >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalInflow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Expected over next 3 months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalOutflow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Projected expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <DollarSign className={`h-4 w-4 ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netFlow.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {netFlow >= 0 ? 'Positive flow' : 'Cash deficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(averageProbability)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average prediction confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </Button>
          <Button
            variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quarter
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewType === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('chart')}
          >
            Chart View
          </Button>
          <Button
            variant={viewType === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('table')}
          >
            Table View
          </Button>
        </div>
      </div>

      {/* Charts */}
      {viewType === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calculateCashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: any, name) => [
                        `$${value.toLocaleString()}`,
                        name === 'actualBalance' ? 'Projected Balance' : name === 'riskAdjusted' ? 'Risk-Adjusted' : name
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actualBalance" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      name="Projected Balance"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="riskAdjusted" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Risk-Adjusted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Net Flow by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="inflow" fill="#10b981" name="Inflow" />
                    <Bar dataKey="outflow" fill="#ef4444" name="Outflow" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Table */}
      {viewType === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCashFlowData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      item.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {item.type === 'inflow' ? 
                        <TrendingUp className="h-4 w-4 text-green-600" /> : 
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()} • {item.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className={`text-lg font-semibold ${
                      item.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'inflow' ? '+' : '-'}${Math.abs(item.amount).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <span className={`text-sm ${getProbabilityColor(item.probability)}`}>
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium">High Risk Items</span>
              </div>
              <div className="space-y-1">
                {mockCashFlowData.filter(item => item.probability < 80).map(item => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.description} ({item.probability}%)
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Pending Actions</span>
              </div>
              <div className="space-y-1">
                {mockCashFlowData.filter(item => item.status === 'pending').map(item => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.description}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Upcoming Milestones</span>
              </div>
              <div className="space-y-1">
                {mockCashFlowData.filter(item => item.category === 'milestone').map(item => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.description}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowDashboard;