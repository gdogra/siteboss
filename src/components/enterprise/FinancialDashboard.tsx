import React, { useState, useEffect } from 'react';
import { useFinancials } from '@/contexts/FinancialsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calculator,
  PieChart,
  BarChart3,
  Plus,
  Download,
  Filter,
  Search
} from 'lucide-react';

interface CostCode {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'labor' | 'materials' | 'equipment' | 'subcontractor' | 'overhead' | 'other';
  budgeted_amount: number;
  actual_amount: number;
  committed_amount: number;
  variance: number;
  variance_percentage: number;
  forecast_amount: number;
  is_over_budget: boolean;
}

interface ChangeOrderSummary {
  id: string;
  co_number: string;
  title: string;
  impact_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'implemented';
  created_at: string;
  approved_at?: string;
}

interface ProjectFinancials {
  total_budget: number;
  total_actual: number;
  total_committed: number;
  total_forecast: number;
  labor_budget: number;
  labor_actual: number;
  material_budget: number;
  material_actual: number;
  equipment_budget: number;
  equipment_actual: number;
  subcontractor_budget: number;
  subcontractor_actual: number;
  overhead_budget: number;
  overhead_actual: number;
  change_orders_approved: number;
  change_orders_pending: number;
  profit_margin: number;
  current_profit: number;
  completion_percentage: number;
  cost_codes: CostCode[];
  recent_change_orders: ChangeOrderSummary[];
}

interface FinancialDashboardProps {
  projectId: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ projectId }) => {
  const { 
    getProjectFinancials,
    getCostCodesByProject,
    getChangeOrdersByProject,
    getExpensesByProject,
    addCostCode,
    updateCostCode,
    deleteCostCode,
    addChangeOrder,
    updateChangeOrder,
    approveChangeOrder,
    addExpense,
    updateExpense,
    approveExpense
  } = useFinancials();

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const financialData = getProjectFinancials(projectId);
  const costCodes = getCostCodesByProject(projectId);
  const changeOrders = getChangeOrdersByProject(projectId);
  const expenses = getExpensesByProject(projectId);

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error loading financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'labor': return 'bg-blue-100 text-blue-800';
      case 'materials': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-yellow-100 text-yellow-800';
      case 'subcontractor': return 'bg-purple-100 text-purple-800';
      case 'overhead': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCostCodes = financialData?.cost_codes?.filter(code => {
    const matchesCategory = !selectedCategory || code.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load financial data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.total_budget)}</div>
            <p className="text-xs text-muted-foreground">
              Original contract value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Costs</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.total_actual)}</div>
            <Progress 
              value={(financialData.total_actual / financialData.total_budget) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {((financialData.total_actual / financialData.total_budget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.total_forecast)}</div>
            <div className="flex items-center space-x-2 mt-2">
              {financialData.total_forecast > financialData.total_budget ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <span className={`text-sm ${
                financialData.total_forecast > financialData.total_budget ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(financialData.total_forecast - financialData.total_budget)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.current_profit}%</div>
            <Progress 
              value={(financialData.current_profit / financialData.profit_margin) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: {financialData.profit_margin}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cost-codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost-codes">Cost Codes</TabsTrigger>
          <TabsTrigger value="budget-summary">Budget Summary</TabsTrigger>
          <TabsTrigger value="change-orders">Change Orders</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="cost-codes" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cost codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="materials">Materials</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                <SelectItem value="overhead">Overhead</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Cost Codes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Code Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of project costs by cost code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCostCodes?.map((code) => (
                  <div key={code.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-sm">{code.code}</div>
                        <div className="font-semibold">{code.name}</div>
                        <Badge className={getCategoryColor(code.category)}>
                          {code.category}
                        </Badge>
                        {code.is_over_budget && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Over Budget
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(code.actual_amount)}</div>
                        <div className="text-sm text-gray-600">
                          of {formatCurrency(code.budgeted_amount)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{code.description}</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Budget</div>
                        <div className="text-sm font-medium">{formatCurrency(code.budgeted_amount)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Actual</div>
                        <div className="text-sm font-medium">{formatCurrency(code.actual_amount)}</div>
                      </div>
                      <div>
                        <div className="text xs text-gray-500 uppercase tracking-wide">Committed</div>
                        <div className="text-sm font-medium">{formatCurrency(code.committed_amount)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Variance</div>
                        <div className={`text-sm font-medium ${getVarianceColor(code.variance)}`}>
                          {formatCurrency(code.variance)} ({code.variance_percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{((code.actual_amount / code.budgeted_amount) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(code.actual_amount / code.budgeted_amount) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Labor</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(financialData.labor_actual)}</div>
                      <div className="text-sm text-gray-600">of {formatCurrency(financialData.labor_budget)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Materials</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(financialData.material_actual)}</div>
                      <div className="text-sm text-gray-600">of {formatCurrency(financialData.material_budget)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Equipment</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(financialData.equipment_actual)}</div>
                      <div className="text-sm text-gray-600">of {formatCurrency(financialData.equipment_budget)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span>Subcontractors</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(financialData.subcontractor_actual)}</div>
                      <div className="text-sm text-gray-600">of {formatCurrency(financialData.subcontractor_budget)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span>Overhead</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(financialData.overhead_actual)}</div>
                      <div className="text-sm text-gray-600">of {formatCurrency(financialData.overhead_budget)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Budget Performance</span>
                      <span>{((financialData.total_actual / financialData.total_budget) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(financialData.total_actual / financialData.total_budget) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Project Progress</span>
                      <span>{financialData.completion_percentage}%</span>
                    </div>
                    <Progress value={financialData.completion_percentage} />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Key Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cost Performance Index:</span>
                        <span className="font-medium">
                          {(financialData.total_budget / financialData.total_actual).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Schedule Performance:</span>
                        <span className="font-medium">
                          {((financialData.completion_percentage / 100) / 
                            (financialData.total_actual / financialData.total_budget)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="change-orders">
          <Card>
            <CardHeader>
              <CardTitle>Change Orders</CardTitle>
              <CardDescription>
                Track all project change orders and their financial impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.recent_change_orders?.map((co) => (
                  <div key={co.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{co.co_number}</span>
                        <Badge className={getStatusColor(co.status)}>
                          {co.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{co.title}</h4>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(co.created_at).toLocaleDateString()}
                        {co.approved_at && ` • Approved: ${new Date(co.approved_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        co.impact_amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {co.impact_amount > 0 ? '+' : ''}{formatCurrency(co.impact_amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow">
          <div className="space-y-6">
            {/* Cash Flow Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialData.total_budget * 0.65)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Payments received
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
                    {formatCurrency(financialData.total_actual)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Costs incurred
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency((financialData.total_budget * 0.65) - financialData.total_actual)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current position
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(financialData.total_budget * 0.15)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting payment
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Timeline</CardTitle>
                <CardDescription>Monthly cash flow projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'Nov 2024', inflow: 450000, outflow: 380000, net: 70000 },
                    { month: 'Dec 2024', inflow: 320000, outflow: 420000, net: -100000 },
                    { month: 'Jan 2025', inflow: 580000, outflow: 450000, net: 130000 },
                    { month: 'Feb 2025', inflow: 290000, outflow: 350000, net: -60000 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="font-medium">{item.month}</div>
                        <div className="text-sm text-gray-600">
                          In: {formatCurrency(item.inflow)} | Out: {formatCurrency(item.outflow)}
                        </div>
                      </div>
                      <div className={`font-semibold ${item.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.net >= 0 ? '+' : ''}{formatCurrency(item.net)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Scheduled payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Invoice', description: 'Progress Payment #4', amount: 125000, date: '2024-12-15', status: 'pending' },
                    { type: 'Payment', description: 'Material Supplier', amount: -85000, date: '2024-12-20', status: 'scheduled' },
                    { type: 'Invoice', description: 'Milestone Payment', amount: 200000, date: '2025-01-10', status: 'draft' },
                    { type: 'Payment', description: 'Subcontractor Fee', amount: -120000, date: '2025-01-15', status: 'scheduled' },
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant={payment.type === 'Invoice' ? 'default' : 'outline'}>
                          {payment.type}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">{payment.description}</div>
                          <div className="text-xs text-gray-500">{payment.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.amount >= 0 ? '+' : ''}{formatCurrency(payment.amount)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;