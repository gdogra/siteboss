import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';
import TaskList from './TaskList';
import ProjectList from './ProjectList';
import RecentActivity from './RecentActivity';
import { 
  FolderOpenIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mockData, setMockData] = useState<{
    projectStats: { active_projects: number };
    myTasks: any[];
    overdueTasks: any[];
    pendingExpenses: { id: number; description: string }[];
  }>({
    projectStats: { active_projects: 0 },
    myTasks: [],
    overdueTasks: [],
    pendingExpenses: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading realistic mock data
    const timer = setTimeout(() => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Install Kitchen Cabinets',
          status: 'in_progress',
          priority: 'high',
          project_id: 'proj-1',
          project_name: 'Johnson Kitchen Renovation',
          due_date: '2024-01-20',
          completion_percentage: 65,
        },
        {
          id: 'task-2',
          title: 'Electrical Rough-In Inspection',
          status: 'pending',
          priority: 'critical',
          project_id: 'proj-2',
          project_name: 'Rodriguez Office Building',
          due_date: '2024-01-18',
          completion_percentage: 90,
        },
        {
          id: 'task-3',
          title: 'Concrete Foundation Pour',
          status: 'completed',
          priority: 'medium',
          project_id: 'proj-3',
          project_name: 'Chen Residential Home',
          due_date: '2024-01-15',
          completion_percentage: 100,
        },
        {
          id: 'task-4',
          title: 'HVAC System Installation',
          status: 'in_progress',
          priority: 'high',
          project_id: 'proj-1',
          project_name: 'Johnson Kitchen Renovation',
          due_date: '2024-01-25',
          completion_percentage: 30,
        },
        {
          id: 'task-5',
          title: 'Plumbing Rough-In',
          status: 'pending',
          priority: 'medium',
          project_id: 'proj-4',
          project_name: 'ABC Suppliers Warehouse',
          due_date: '2024-01-22',
          completion_percentage: 0,
        }
      ];

      const overdueTasks = mockTasks.filter(task => 
        new Date(task.due_date) < new Date() && task.status !== 'completed'
      );

      setMockData({
        projectStats: { active_projects: 7 },
        myTasks: mockTasks,
        overdueTasks: overdueTasks,
        pendingExpenses: [
          { id: 1, description: 'Construction Materials - $2,500' },
          { id: 2, description: 'Equipment Rental - $800' },
          { id: 3, description: 'Contractor Payment - $5,200' }
        ]
      });
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      name: 'Active Projects',
      value: mockData.projectStats.active_projects,
      icon: FolderOpenIcon,
      color: 'blue' as const,
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      name: 'My Tasks',
      value: mockData.myTasks.length,
      icon: CheckCircleIcon,
      color: 'green' as const,
      change: '+4.75%',
      changeType: 'increase' as const,
    },
    {
      name: 'Budget Utilization',
      value: '73%',
      icon: CurrencyDollarIcon,
      color: 'yellow' as const,
      change: '+1.39%',
      changeType: 'increase' as const,
    },
    {
      name: 'Overdue Tasks',
      value: mockData.overdueTasks.length,
      icon: ExclamationTriangleIcon,
      color: 'red' as const,
      change: '-2.02%',
      changeType: 'decrease' as const,
    },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-0 sm:space-y-6">
      {/* Welcome Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {loading ? (
          // Loading skeleton for stats
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-300 p-3 rounded-md w-12 h-12"></div>
                  </div>
                  <div className="ml-5 flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat) => (
            <StatsCard
              key={stat.name}
              name={stat.name}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
              changeType={stat.changeType}
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="flex flex-col items-center p-3 sm:p-4 text-center border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <FolderOpenIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-primary-600 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary-600">
              New Project
            </span>
          </button>
          
          <button
            onClick={() => navigate('/tasks')}
            className="flex flex-col items-center p-3 sm:p-4 text-center border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-primary-600 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary-600">
              Add Task
            </span>
          </button>
          
          <button
            onClick={() => navigate('/budget')}
            className="flex flex-col items-center p-3 sm:p-4 text-center border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-primary-600 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary-600">
              Log Expense
            </span>
          </button>
          
          <button
            onClick={() => navigate('/contacts')}
            className="flex flex-col items-center p-3 sm:p-4 text-center border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-primary-600 mb-1 sm:mb-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-primary-600">
              Add Contact
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">My Tasks</h2>
            <Link
              to="/tasks"
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <TaskList tasks={mockData.myTasks} />
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <ProjectList />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <RecentActivity />
      </div>

      {/* Pending Approvals (for managers) */}
      {(user?.role === 'company_admin' || user?.role === 'project_manager') && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              Pending Expense Approvals
            </h2>
            <Link
              to="/budget"
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : mockData.pendingExpenses.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CurrencyDollarIcon className="mx-auto h-8 w-8 mb-2" />
              <p>No pending expense approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockData.pendingExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {expense.description}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`Approved: ${expense.description}`)}
                      className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => alert(`Rejected: ${expense.description}`)}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
