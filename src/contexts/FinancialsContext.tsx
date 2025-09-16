import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CostCode {
  id: string;
  projectId: string;
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
  created_at: string;
  updated_at: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  co_number: string;
  title: string;
  description?: string;
  impact_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'implemented';
  reason: string;
  requested_by: string;
  approved_by?: string;
  created_at: string;
  approved_at?: string;
  implemented_at?: string;
  attachments?: string[];
}

export interface ExpenseEntry {
  id: string;
  projectId: string;
  cost_code_id: string;
  description: string;
  amount: number;
  category: 'labor' | 'materials' | 'equipment' | 'subcontractor' | 'overhead' | 'other';
  date: string;
  vendor?: string;
  invoice_number?: string;
  receipt_url?: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  cost_code_id: string;
  category: string;
  description: string;
  budgeted_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFinancials {
  projectId: string;
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
}

interface FinancialsContextType {
  costCodes: CostCode[];
  changeOrders: ChangeOrder[];
  expenses: ExpenseEntry[];
  budgetItems: BudgetItem[];
  
  // Cost Code operations
  getCostCodesByProject: (projectId: string) => CostCode[];
  getCostCode: (costCodeId: string) => CostCode | undefined;
  addCostCode: (costCodeData: Omit<CostCode, 'id' | 'created_at' | 'updated_at'>) => CostCode;
  updateCostCode: (costCodeId: string, updates: Partial<CostCode>) => CostCode | null;
  deleteCostCode: (costCodeId: string) => boolean;

  // Change Order operations
  getChangeOrdersByProject: (projectId: string) => ChangeOrder[];
  getChangeOrder: (changeOrderId: string) => ChangeOrder | undefined;
  addChangeOrder: (changeOrderData: Omit<ChangeOrder, 'id' | 'created_at'>) => ChangeOrder;
  updateChangeOrder: (changeOrderId: string, updates: Partial<ChangeOrder>) => ChangeOrder | null;
  deleteChangeOrder: (changeOrderId: string) => boolean;
  approveChangeOrder: (changeOrderId: string, approvedBy: string) => ChangeOrder | null;
  implementChangeOrder: (changeOrderId: string) => ChangeOrder | null;

  // Expense operations
  getExpensesByProject: (projectId: string) => ExpenseEntry[];
  getExpensesByCostCode: (costCodeId: string) => ExpenseEntry[];
  getExpense: (expenseId: string) => ExpenseEntry | undefined;
  addExpense: (expenseData: Omit<ExpenseEntry, 'id' | 'created_at' | 'updated_at'>) => ExpenseEntry;
  updateExpense: (expenseId: string, updates: Partial<ExpenseEntry>) => ExpenseEntry | null;
  deleteExpense: (expenseId: string) => boolean;
  approveExpense: (expenseId: string, approvedBy: string) => ExpenseEntry | null;

  // Budget operations  
  getBudgetItemsByProject: (projectId: string) => BudgetItem[];
  addBudgetItem: (budgetData: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => BudgetItem;
  updateBudgetItem: (budgetItemId: string, updates: Partial<BudgetItem>) => BudgetItem | null;
  deleteBudgetItem: (budgetItemId: string) => boolean;

  // Financial summaries
  getProjectFinancials: (projectId: string) => ProjectFinancials;
  getCostCodeVariance: (costCodeId: string) => { variance: number; percentage: number };
  getProjectProfitMargin: (projectId: string) => number;
}

// Mock data
const mockCostCodes: CostCode[] = [
  {
    id: '1',
    projectId: 'demo',
    code: 'SITE-001',
    name: 'Site Preparation',
    description: 'Site clearing and excavation work',
    category: 'labor',
    budgeted_amount: 75000,
    actual_amount: 68500,
    committed_amount: 70000,
    variance: -6500,
    variance_percentage: -8.7,
    forecast_amount: 72000,
    is_over_budget: false,
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-20T17:30:00Z'
  },
  {
    id: '2',
    projectId: 'demo',
    code: 'CONC-001',
    name: 'Concrete Work',
    description: 'Foundation and structural concrete',
    category: 'materials',
    budgeted_amount: 125000,
    actual_amount: 135000,
    committed_amount: 130000,
    variance: 10000,
    variance_percentage: 8.0,
    forecast_amount: 138000,
    is_over_budget: true,
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-03-25T14:15:00Z'
  },
  // Cost codes for project 1757454115704
  {
    id: '3',
    projectId: '1757454115704',
    code: 'PLAN-001',
    name: 'Project Planning',
    description: 'Initial project planning and design phase',
    category: 'labor',
    budgeted_amount: 50000,
    actual_amount: 45000,
    committed_amount: 48000,
    variance: -5000,
    variance_percentage: -10.0,
    forecast_amount: 47000,
    is_over_budget: false,
    created_at: '2024-12-01T08:00:00Z',
    updated_at: '2024-12-09T17:30:00Z'
  },
  {
    id: '4',
    projectId: '1757454115704',
    code: 'FOUND-001',
    name: 'Foundation Work',
    description: 'Foundation excavation and concrete work',
    category: 'materials',
    budgeted_amount: 180000,
    actual_amount: 95000,
    committed_amount: 120000,
    variance: -85000,
    variance_percentage: -47.2,
    forecast_amount: 175000,
    is_over_budget: false,
    created_at: '2024-12-02T08:00:00Z',
    updated_at: '2024-12-09T14:15:00Z'
  },
  {
    id: '5',
    projectId: '1757454115704',
    code: 'STRUCT-001',
    name: 'Structural Framework',
    description: 'Steel and concrete structural elements',
    category: 'materials',
    budgeted_amount: 320000,
    actual_amount: 25000,
    committed_amount: 40000,
    variance: -295000,
    variance_percentage: -92.2,
    forecast_amount: 315000,
    is_over_budget: false,
    created_at: '2024-12-01T08:00:00Z',
    updated_at: '2024-12-09T10:00:00Z'
  }
];

const mockChangeOrders: ChangeOrder[] = [
  {
    id: '1',
    projectId: 'demo',
    co_number: 'CO-2024-001',
    title: 'Additional Site Drainage',
    description: 'Install additional drainage system due to unexpected groundwater',
    impact_amount: 25000,
    status: 'approved',
    reason: 'Unforeseen site conditions',
    requested_by: 'Site Manager',
    approved_by: 'Project Director',
    created_at: '2024-03-15T10:00:00Z',
    approved_at: '2024-03-18T14:30:00Z',
    attachments: ['drainage_plan.pdf', 'cost_breakdown.xlsx']
  },
  {
    id: '2',
    projectId: 'demo',
    co_number: 'CO-2024-002',
    title: 'Upgraded Electrical System',
    description: 'Client requested upgrade to electrical panel and wiring',
    impact_amount: 15000,
    status: 'pending',
    reason: 'Client request',
    requested_by: 'Electrical Contractor',
    created_at: '2024-03-20T09:00:00Z',
    attachments: ['electrical_upgrade_spec.pdf']
  },
  // Change orders for project 1757454115704
  {
    id: '3',
    projectId: '1757454115704',
    co_number: 'CO-2024-003',
    title: 'Additional Safety Equipment',
    description: 'Enhanced safety requirements due to site conditions',
    impact_amount: 8500,
    status: 'approved',
    reason: 'Safety compliance',
    requested_by: 'Safety Manager',
    approved_by: 'Project Director',
    created_at: '2024-12-05T10:00:00Z',
    approved_at: '2024-12-06T14:30:00Z',
    attachments: ['safety_requirements.pdf']
  }
];

const mockExpenses: ExpenseEntry[] = [
  {
    id: '1',
    projectId: 'demo',
    cost_code_id: '1',
    description: 'Excavator rental - 3 days',
    amount: 2400,
    category: 'equipment',
    date: '2024-03-16',
    vendor: 'Heavy Equipment Rentals Inc.',
    invoice_number: 'INV-2024-0315',
    receipt_url: 'receipt_excavator.pdf',
    approved: true,
    approved_by: 'Project Manager',
    approved_at: '2024-03-17T09:00:00Z',
    created_by: 'Site Supervisor',
    created_at: '2024-03-16T17:00:00Z',
    updated_at: '2024-03-17T09:00:00Z'
  },
  {
    id: '2',
    projectId: 'demo',
    cost_code_id: '2',
    description: 'Concrete delivery - 50 yards',
    amount: 8500,
    category: 'materials',
    date: '2024-03-22',
    vendor: 'Premier Concrete Co.',
    invoice_number: 'PC-2024-0892',
    approved: false,
    created_by: 'Site Supervisor',
    created_at: '2024-03-22T08:30:00Z',
    updated_at: '2024-03-22T08:30:00Z'
  },
  // Expenses for project 1757454115704
  {
    id: '3',
    projectId: '1757454115704',
    cost_code_id: '3',
    description: 'Project design software license',
    amount: 1200,
    category: 'overhead',
    date: '2024-12-01',
    vendor: 'Design Software Corp',
    invoice_number: 'DSC-2024-1201',
    approved: true,
    approved_by: 'Project Manager',
    approved_at: '2024-12-02T09:00:00Z',
    created_by: 'Project Manager',
    created_at: '2024-12-01T14:00:00Z',
    updated_at: '2024-12-02T09:00:00Z'
  },
  {
    id: '4',
    projectId: '1757454115704',
    cost_code_id: '4',
    description: 'Site survey equipment rental',
    amount: 850,
    category: 'equipment',
    date: '2024-12-03',
    vendor: 'Survey Equipment Rental',
    invoice_number: 'SER-2024-1203',
    approved: true,
    approved_by: 'Site Manager',
    approved_at: '2024-12-04T10:00:00Z',
    created_by: 'Site Supervisor',
    created_at: '2024-12-03T16:00:00Z',
    updated_at: '2024-12-04T10:00:00Z'
  }
];

const FinancialsContext = createContext<FinancialsContextType | undefined>(undefined);

interface FinancialsProviderProps {
  children: ReactNode;
}

export const FinancialsProvider: React.FC<FinancialsProviderProps> = ({ children }) => {
  const [costCodes, setCostCodes] = useState<CostCode[]>(mockCostCodes);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(mockChangeOrders);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(mockExpenses);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  // Cost Code operations
  const getCostCodesByProject = (projectId: string): CostCode[] => {
    return costCodes.filter(code => code.projectId === projectId);
  };

  const getCostCode = (costCodeId: string): CostCode | undefined => {
    return costCodes.find(code => code.id === costCodeId);
  };

  const addCostCode = (costCodeData: Omit<CostCode, 'id' | 'created_at' | 'updated_at'>): CostCode => {
    const variance = costCodeData.actual_amount - costCodeData.budgeted_amount;
    const variance_percentage = costCodeData.budgeted_amount > 0 ? (variance / costCodeData.budgeted_amount) * 100 : 0;
    
    const newCostCode: CostCode = {
      ...costCodeData,
      id: Date.now().toString(),
      variance,
      variance_percentage,
      is_over_budget: variance > 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCostCodes(prev => [...prev, newCostCode]);
    return newCostCode;
  };

  const updateCostCode = (costCodeId: string, updates: Partial<CostCode>): CostCode | null => {
    const index = costCodes.findIndex(code => code.id === costCodeId);
    if (index === -1) return null;

    const updatedCostCode = { ...costCodes[index], ...updates, updated_at: new Date().toISOString() };
    
    // Recalculate variance if amounts changed
    if (updates.actual_amount !== undefined || updates.budgeted_amount !== undefined) {
      const variance = updatedCostCode.actual_amount - updatedCostCode.budgeted_amount;
      updatedCostCode.variance = variance;
      updatedCostCode.variance_percentage = updatedCostCode.budgeted_amount > 0 ? (variance / updatedCostCode.budgeted_amount) * 100 : 0;
      updatedCostCode.is_over_budget = variance > 0;
    }

    setCostCodes(prev => [...prev.slice(0, index), updatedCostCode, ...prev.slice(index + 1)]);
    return updatedCostCode;
  };

  const deleteCostCode = (costCodeId: string): boolean => {
    const index = costCodes.findIndex(code => code.id === costCodeId);
    if (index === -1) return false;

    setCostCodes(prev => prev.filter(code => code.id !== costCodeId));
    return true;
  };

  // Change Order operations
  const getChangeOrdersByProject = (projectId: string): ChangeOrder[] => {
    return changeOrders.filter(order => order.projectId === projectId);
  };

  const getChangeOrder = (changeOrderId: string): ChangeOrder | undefined => {
    return changeOrders.find(order => order.id === changeOrderId);
  };

  const addChangeOrder = (changeOrderData: Omit<ChangeOrder, 'id' | 'created_at'>): ChangeOrder => {
    const newChangeOrder: ChangeOrder = {
      ...changeOrderData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    setChangeOrders(prev => [...prev, newChangeOrder]);
    return newChangeOrder;
  };

  const updateChangeOrder = (changeOrderId: string, updates: Partial<ChangeOrder>): ChangeOrder | null => {
    const index = changeOrders.findIndex(order => order.id === changeOrderId);
    if (index === -1) return null;

    const updatedChangeOrder = { ...changeOrders[index], ...updates };
    setChangeOrders(prev => [...prev.slice(0, index), updatedChangeOrder, ...prev.slice(index + 1)]);
    return updatedChangeOrder;
  };

  const deleteChangeOrder = (changeOrderId: string): boolean => {
    const index = changeOrders.findIndex(order => order.id === changeOrderId);
    if (index === -1) return false;

    setChangeOrders(prev => prev.filter(order => order.id !== changeOrderId));
    return true;
  };

  const approveChangeOrder = (changeOrderId: string, approvedBy: string): ChangeOrder | null => {
    return updateChangeOrder(changeOrderId, {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    });
  };

  const implementChangeOrder = (changeOrderId: string): ChangeOrder | null => {
    return updateChangeOrder(changeOrderId, {
      status: 'implemented',
      implemented_at: new Date().toISOString()
    });
  };

  // Expense operations
  const getExpensesByProject = (projectId: string): ExpenseEntry[] => {
    return expenses.filter(expense => expense.projectId === projectId);
  };

  const getExpensesByCostCode = (costCodeId: string): ExpenseEntry[] => {
    return expenses.filter(expense => expense.cost_code_id === costCodeId);
  };

  const getExpense = (expenseId: string): ExpenseEntry | undefined => {
    return expenses.find(expense => expense.id === expenseId);
  };

  const addExpense = (expenseData: Omit<ExpenseEntry, 'id' | 'created_at' | 'updated_at'>): ExpenseEntry => {
    const newExpense: ExpenseEntry = {
      ...expenseData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setExpenses(prev => [...prev, newExpense]);
    return newExpense;
  };

  const updateExpense = (expenseId: string, updates: Partial<ExpenseEntry>): ExpenseEntry | null => {
    const index = expenses.findIndex(expense => expense.id === expenseId);
    if (index === -1) return null;

    const updatedExpense = {
      ...expenses[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    setExpenses(prev => [...prev.slice(0, index), updatedExpense, ...prev.slice(index + 1)]);
    return updatedExpense;
  };

  const deleteExpense = (expenseId: string): boolean => {
    const index = expenses.findIndex(expense => expense.id === expenseId);
    if (index === -1) return false;

    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    return true;
  };

  const approveExpense = (expenseId: string, approvedBy: string): ExpenseEntry | null => {
    return updateExpense(expenseId, {
      approved: true,
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    });
  };

  // Budget operations
  const getBudgetItemsByProject = (projectId: string): BudgetItem[] => {
    return budgetItems.filter(item => item.projectId === projectId);
  };

  const addBudgetItem = (budgetData: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>): BudgetItem => {
    const newBudgetItem: BudgetItem = {
      ...budgetData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBudgetItems(prev => [...prev, newBudgetItem]);
    return newBudgetItem;
  };

  const updateBudgetItem = (budgetItemId: string, updates: Partial<BudgetItem>): BudgetItem | null => {
    const index = budgetItems.findIndex(item => item.id === budgetItemId);
    if (index === -1) return null;

    const updatedBudgetItem = {
      ...budgetItems[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    setBudgetItems(prev => [...prev.slice(0, index), updatedBudgetItem, ...prev.slice(index + 1)]);
    return updatedBudgetItem;
  };

  const deleteBudgetItem = (budgetItemId: string): boolean => {
    const index = budgetItems.findIndex(item => item.id === budgetItemId);
    if (index === -1) return false;

    setBudgetItems(prev => prev.filter(item => item.id !== budgetItemId));
    return true;
  };

  // Financial summaries
  const getProjectFinancials = (projectId: string): ProjectFinancials => {
    const projectCostCodes = getCostCodesByProject(projectId);
    const projectChangeOrders = getChangeOrdersByProject(projectId);

    const totals = projectCostCodes.reduce(
      (acc, code) => {
        acc.total_budget += code.budgeted_amount;
        acc.total_actual += code.actual_amount;
        acc.total_committed += code.committed_amount;
        acc.total_forecast += code.forecast_amount;

        switch (code.category) {
          case 'labor':
            acc.labor_budget += code.budgeted_amount;
            acc.labor_actual += code.actual_amount;
            break;
          case 'materials':
            acc.material_budget += code.budgeted_amount;
            acc.material_actual += code.actual_amount;
            break;
          case 'equipment':
            acc.equipment_budget += code.budgeted_amount;
            acc.equipment_actual += code.actual_amount;
            break;
          case 'subcontractor':
            acc.subcontractor_budget += code.budgeted_amount;
            acc.subcontractor_actual += code.actual_amount;
            break;
          case 'overhead':
            acc.overhead_budget += code.budgeted_amount;
            acc.overhead_actual += code.actual_amount;
            break;
        }

        return acc;
      },
      {
        total_budget: 0,
        total_actual: 0,
        total_committed: 0,
        total_forecast: 0,
        labor_budget: 0,
        labor_actual: 0,
        material_budget: 0,
        material_actual: 0,
        equipment_budget: 0,
        equipment_actual: 0,
        subcontractor_budget: 0,
        subcontractor_actual: 0,
        overhead_budget: 0,
        overhead_actual: 0,
      }
    );

    const changeOrderAmounts = projectChangeOrders.reduce(
      (acc, order) => {
        if (order.status === 'approved' || order.status === 'implemented') {
          acc.approved += order.impact_amount;
        } else if (order.status === 'pending') {
          acc.pending += order.impact_amount;
        }
        return acc;
      },
      { approved: 0, pending: 0 }
    );

    const adjustedBudget = totals.total_budget + changeOrderAmounts.approved;
    const profit_margin = adjustedBudget > 0 ? ((adjustedBudget - totals.total_forecast) / adjustedBudget) * 100 : 0;
    const current_profit = adjustedBudget - totals.total_actual;
    const completion_percentage = totals.total_budget > 0 ? (totals.total_actual / totals.total_budget) * 100 : 0;

    return {
      projectId,
      ...totals,
      change_orders_approved: changeOrderAmounts.approved,
      change_orders_pending: changeOrderAmounts.pending,
      profit_margin,
      current_profit,
      completion_percentage,
      cost_codes: projectCostCodes,
      recent_change_orders: projectChangeOrders.slice(0, 10) // Most recent 10
    };
  };

  const getCostCodeVariance = (costCodeId: string): { variance: number; percentage: number } => {
    const costCode = getCostCode(costCodeId);
    if (!costCode) return { variance: 0, percentage: 0 };

    return {
      variance: costCode.variance,
      percentage: costCode.variance_percentage
    };
  };

  const getProjectProfitMargin = (projectId: string): number => {
    const financials = getProjectFinancials(projectId);
    return financials.profit_margin;
  };

  const contextValue: FinancialsContextType = {
    costCodes,
    changeOrders,
    expenses,
    budgetItems,
    getCostCodesByProject,
    getCostCode,
    addCostCode,
    updateCostCode,
    deleteCostCode,
    getChangeOrdersByProject,
    getChangeOrder,
    addChangeOrder,
    updateChangeOrder,
    deleteChangeOrder,
    approveChangeOrder,
    implementChangeOrder,
    getExpensesByProject,
    getExpensesByCostCode,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    getBudgetItemsByProject,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    getProjectFinancials,
    getCostCodeVariance,
    getProjectProfitMargin
  };

  return (
    <FinancialsContext.Provider value={contextValue}>
      {children}
    </FinancialsContext.Provider>
  );
};

export const useFinancials = (): FinancialsContextType => {
  const context = useContext(FinancialsContext);
  if (!context) {
    throw new Error('useFinancials must be used within a FinancialsProvider');
  }
  return context;
};