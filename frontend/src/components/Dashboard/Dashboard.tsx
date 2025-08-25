import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi, taskApi, budgetApi } from '../../services/api';
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

  const { data: projectStats } = useQuery({
    queryKey: ['projectStats'],
    queryFn: () => projectApi.getProjectStats(),
  });

  const { data: myTasks } = useQuery({
    queryKey: ['myTasks'],
    queryFn: () => taskApi.getMyTasks(),
  });

  const { data: overdueTasks } = useQuery({
    queryKey: ['overdueTasks'],
    queryFn: () => taskApi.getOverdueTasks(),
  });

  const { data: pendingExpenses } = useQuery({
    queryKey: ['pendingExpenses'],
    queryFn: () => budgetApi.getPendingExpenses(),
    enabled: user?.role === 'company_admin' || user?.role === 'project_manager',
  });

  const stats = [
    {
      name: 'Active Projects',
      value: projectStats?.data?.active_projects || 0,
      icon: FolderOpenIcon,
      color: 'blue' as const,
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      name: 'My Tasks',
      value: myTasks?.data?.length || 0,
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
      value: overdueTasks?.data?.length || 0,
      icon: ExclamationTriangleIcon,
      color: 'red' as const,
      change: '-2.02%',
      changeType: 'decrease' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.name}
            name={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
            <a
              href="/tasks"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </a>
          </div>
          <TaskList tasks={myTasks?.data?.slice(0, 5) || []} />
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
            <a
              href="/projects"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </a>
          </div>
          <ProjectList />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <RecentActivity />
      </div>

      {/* Pending Approvals (for managers) */}
      {(user?.role === 'company_admin' || user?.role === 'project_manager') && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Pending Expense Approvals
            </h2>
            <a
              href="/budget/expenses"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </a>
          </div>
          <div className="text-sm text-gray-600">
            {pendingExpenses?.data?.length || 0} expenses waiting for approval
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;