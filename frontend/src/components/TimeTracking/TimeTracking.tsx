import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';

interface TimeEntry {
  id: string;
  project_id: string;
  task_id?: string;
  user_id: string;
  start_time: Date;
  end_time?: Date;
  duration: number;
  description?: string;
  project_name?: string;
  task_name?: string;
}

interface ActiveTimer {
  project_id: string;
  task_id?: string;
  start_time: Date;
  description: string;
  project_name?: string;
  task_name?: string;
}

const TimeTracking: React.FC = () => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || currentTime;
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    const project = projects.find(p => p.id === selectedProject);
    const task = tasks.find(t => t.id === selectedTask);

    setActiveTimer({
      project_id: selectedProject,
      task_id: selectedTask || undefined,
      start_time: new Date(),
      description,
      project_name: project?.name,
      task_name: task?.title
    });
  };

  const handleStopTimer = () => {
    if (!activeTimer) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeTimer.start_time.getTime()) / 1000);

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project_id: activeTimer.project_id,
      task_id: activeTimer.task_id,
      user_id: 'current-user',
      start_time: activeTimer.start_time,
      end_time: endTime,
      duration,
      description: activeTimer.description,
      project_name: activeTimer.project_name,
      task_name: activeTimer.task_name
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setActiveTimer(null);
    setSelectedProject('');
    setSelectedTask('');
    setDescription('');
  };

  const getTotalDuration = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0);
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your time across projects and tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-lg font-mono">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Active Timer */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Time Tracker
          </h3>

          {activeTimer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <h4 className="font-medium text-green-800">
                    {activeTimer.project_name}
                  </h4>
                  {activeTimer.task_name && (
                    <p className="text-sm text-green-600">{activeTimer.task_name}</p>
                  )}
                  {activeTimer.description && (
                    <p className="text-sm text-gray-600 mt-1">{activeTimer.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono text-green-800">
                    {formatDuration(activeTimer.start_time)}
                  </div>
                  <div className="text-sm text-green-600">
                    Started at {activeTimer.start_time.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleStopTimer}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <StopIcon className="-ml-1 mr-2 h-5 w-5" />
                  Stop Timer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a project</option>
                    {projects?.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    )) || []}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Task (Optional)
                  </label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    disabled={!selectedProject}
                  >
                    <option value="">Select a task</option>
                    {tasks?.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    )) || []}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                onClick={handleStartTimer}
                disabled={!selectedProject}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="-ml-1 mr-2 h-5 w-5" />
                Start Timer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Time Entries
            </h3>
            <div className="text-sm text-gray-500">
              Total: {formatTotalTime(getTotalDuration())}
            </div>
          </div>

          {timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start tracking time to see your entries here.
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <li key={entry.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <FolderOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {entry.project_name}
                            </p>
                            {entry.task_name && (
                              <p className="text-sm text-gray-500">{entry.task_name}</p>
                            )}
                            {entry.description && (
                              <p className="text-sm text-gray-500">{entry.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {entry.start_time.toLocaleDateString()} • {entry.start_time.toLocaleTimeString()} - {entry.end_time?.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-mono text-gray-900">
                        {formatTotalTime(entry.duration)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;