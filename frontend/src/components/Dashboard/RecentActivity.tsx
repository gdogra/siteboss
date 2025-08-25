import React from 'react';
import { format } from 'date-fns';
import { 
  DocumentTextIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'task' | 'expense' | 'document' | 'user';
  message: string;
  user: string;
  timestamp: Date;
}

const RecentActivity: React.FC = () => {
  // Mock data - in a real app, this would come from an API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'task',
      message: 'completed task "Install electrical outlets"',
      user: 'John Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      type: 'expense',
      message: 'submitted expense for $245.50',
      user: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      type: 'document',
      message: 'uploaded building permit',
      user: 'Mike Davis',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: '4',
      type: 'user',
      message: 'was added to Oak Street Renovation project',
      user: 'Lisa Brown',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      id: '5',
      type: 'task',
      message: 'created new task "Inspect foundation"',
      user: 'David Wilson',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'expense':
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      case 'document':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <UserPlusIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.message}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={activity.timestamp.toISOString()}>
                        {format(activity.timestamp, 'h:mm a')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentActivity;