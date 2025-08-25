import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Task } from '../../types';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick?: (task: Task) => void;
  projectStartDate?: Date;
  projectEndDate?: Date;
}

interface GanttTask extends Task {
  level: number;
  children: GanttTask[];
  parent?: GanttTask;
  x: number;
  width: number;
  y: number;
}

type ViewMode = 'days' | 'weeks' | 'months';

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskUpdate,
  onTaskClick,
  projectStartDate,
  projectEndDate
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('days');
  const [zoom, setZoom] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTask, setDragTask] = useState<string | null>(null);
  const [currentDate] = useState(new Date());
  
  const chartRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Constants
  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 80;
  const SIDEBAR_WIDTH = 300;
  const DAY_WIDTH = 30 * zoom;
  const WEEK_WIDTH = 100 * zoom;
  const MONTH_WIDTH = 120 * zoom;

  // Calculate date range
  const { startDate, endDate, dateRange } = useMemo(() => {
    let start = projectStartDate || new Date();
    let end = projectEndDate || new Date();

    // Expand range based on tasks
    tasks.forEach(task => {
      if (task.start_date) {
        const taskStart = new Date(task.start_date);
        if (taskStart < start) start = taskStart;
      }
      if (task.due_date) {
        const taskEnd = new Date(task.due_date);
        if (taskEnd > end) end = taskEnd;
      }
    });

    // Add buffer
    start = addDays(start, -7);
    end = addDays(end, 30);

    const range = eachDayOfInterval({ start, end });
    
    return { startDate: start, endDate: end, dateRange: range };
  }, [tasks, projectStartDate, projectEndDate]);

  // Build hierarchical task structure
  const ganttTasks = useMemo(() => {
    const taskMap = new Map<string, GanttTask>();
    const rootTasks: GanttTask[] = [];

    // Convert to GanttTask and create map
    tasks.forEach(task => {
      const ganttTask: GanttTask = {
        ...task,
        level: 0,
        children: [],
        x: 0,
        width: 0,
        y: 0
      };
      taskMap.set(task.id, ganttTask);
    });

    // Build hierarchy
    tasks.forEach(task => {
      const ganttTask = taskMap.get(task.id)!;
      if (task.parent_task_id) {
        const parent = taskMap.get(task.parent_task_id);
        if (parent) {
          parent.children.push(ganttTask);
          ganttTask.parent = parent;
          ganttTask.level = parent.level + 1;
        }
      } else {
        rootTasks.push(ganttTask);
      }
    });

    // Flatten for rendering
    const flatTasks: GanttTask[] = [];
    let yPosition = 0;

    const addTasksRecursively = (tasks: GanttTask[]) => {
      tasks.forEach(task => {
        // Calculate position and dimensions
        const taskStart = task.start_date ? new Date(task.start_date) : startDate;
        const taskEnd = task.due_date ? new Date(task.due_date) : addDays(taskStart, 1);
        
        const daysFromStart = differenceInDays(taskStart, startDate);
        const taskDuration = differenceInDays(taskEnd, taskStart) || 1;
        
        task.x = daysFromStart * DAY_WIDTH;
        task.width = Math.max(taskDuration * DAY_WIDTH, 20);
        task.y = yPosition;
        
        flatTasks.push(task);
        yPosition += ROW_HEIGHT;
        
        if (task.children.length > 0) {
          addTasksRecursively(task.children);
        }
      });
    };

    addTasksRecursively(rootTasks);
    return flatTasks;
  }, [tasks, startDate, DAY_WIDTH]);

  // Get task color based on status and priority
  const getTaskColor = (task: GanttTask) => {
    if (task.status === 'completed') return '#28a745';
    if (task.status === 'in_progress') return '#007bff';
    if (task.status === 'on_hold') return '#ffc107';
    if (task.priority === 'critical') return '#dc3545';
    if (task.priority === 'high') return '#fd7e14';
    return '#6c757d';
  };

  // Handle task drag
  const handleTaskMouseDown = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDragTask(taskId);
    setSelectedTask(taskId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragTask) return;

    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - SIDEBAR_WIDTH + scrollLeft;
    const dayOffset = Math.round(x / DAY_WIDTH);
    const newStartDate = addDays(startDate, dayOffset);

    // Update task temporarily (visual feedback)
    // In a real implementation, you'd update the state optimistically
  };

  const handleMouseUp = () => {
    if (isDragging && dragTask) {
      // Calculate final position and update task
      setIsDragging(false);
      setDragTask(null);
    }
  };

  // Zoom functions
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev * 0.8, 0.3));

  // Scroll to today
  const scrollToToday = () => {
    const daysFromStart = differenceInDays(currentDate, startDate);
    const scrollPosition = daysFromStart * DAY_WIDTH - 200;
    setScrollLeft(Math.max(0, scrollPosition));
  };

  // Render timeline header
  const renderTimelineHeader = () => {
    const timelineWidth = differenceInDays(endDate, startDate) * DAY_WIDTH;
    
    return (
      <div className="relative bg-gray-50 border-b border-gray-200" style={{ width: timelineWidth }}>
        {/* Month row */}
        <div className="h-10 flex border-b border-gray-300">
          {viewMode !== 'days' && dateRange.reduce((months: { date: Date; width: number }[], date, index) => {
            const monthStart = date.getDate() === 1 || index === 0;
            if (monthStart) {
              const monthEnd = dateRange.findIndex((d, i) => i > index && d.getMonth() !== date.getMonth());
              const width = (monthEnd === -1 ? dateRange.length - index : monthEnd - index) * DAY_WIDTH;
              months.push({ date, width });
            }
            return months;
          }, []).map((month, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-sm font-medium text-gray-700 border-r border-gray-300"
              style={{ width: month.width, minWidth: month.width }}
            >
              {format(month.date, 'MMM yyyy')}
            </div>
          ))}
        </div>

        {/* Week/Day row */}
        <div className="h-10 flex">
          {viewMode === 'days' ? (
            dateRange.map((date, index) => {
              const isToday = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center text-xs border-r border-gray-200 ${
                    isToday ? 'bg-blue-100 text-blue-800 font-semibold' : ''
                  } ${isWeekend ? 'bg-gray-100' : ''}`}
                  style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                >
                  <div>{format(date, 'dd')}</div>
                  <div className="text-gray-500">{format(date, 'EEE')}</div>
                </div>
              );
            })
          ) : (
            // Week view
            dateRange.filter((_, index) => index % 7 === 0).map((date, index) => (
              <div
                key={index}
                className="flex items-center justify-center text-xs border-r border-gray-200"
                style={{ width: WEEK_WIDTH, minWidth: WEEK_WIDTH }}
              >
                {format(date, 'MMM dd')} - {format(addDays(date, 6), 'MMM dd')}
              </div>
            ))
          )}
        </div>

        {/* Today line */}
        {(() => {
          const todayX = differenceInDays(currentDate, startDate) * DAY_WIDTH;
          if (todayX >= 0 && todayX <= timelineWidth) {
            return (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                style={{ left: todayX }}
              >
                <div className="absolute top-0 left-0 transform -translate-x-1/2 text-xs text-blue-500 font-semibold">
                  Today
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    );
  };

  // Render task bars
  const renderTaskBars = () => {
    return ganttTasks.map(task => {
      const isSelected = selectedTask === task.id;
      const color = getTaskColor(task);
      const progress = task.completion_percentage || 0;

      return (
        <g key={task.id}>
          {/* Task bar */}
          <rect
            x={task.x}
            y={task.y + 8}
            width={task.width}
            height={24}
            fill={color}
            opacity={0.8}
            rx={4}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected ? 'stroke-2 stroke-blue-500' : ''
            }`}
            onMouseDown={(e) => handleTaskMouseDown(e as any, task.id)}
            onClick={() => onTaskClick?.(task)}
          />
          
          {/* Progress bar */}
          <rect
            x={task.x}
            y={task.y + 8}
            width={task.width * (progress / 100)}
            height={24}
            fill={color}
            rx={4}
          />

          {/* Task label */}
          <text
            x={task.x + 8}
            y={task.y + 22}
            fontSize="12"
            fill="white"
            className="pointer-events-none"
          >
            {task.title.length > 20 ? `${task.title.substring(0, 20)}...` : task.title}
          </text>

          {/* Resize handles */}
          {isSelected && (
            <>
              <rect
                x={task.x - 3}
                y={task.y + 8}
                width={6}
                height={24}
                fill="#007bff"
                className="cursor-ew-resize"
              />
              <rect
                x={task.x + task.width - 3}
                y={task.y + 8}
                width={6}
                height={24}
                fill="#007bff"
                className="cursor-ew-resize"
              />
            </>
          )}
        </g>
      );
    });
  };

  // Render dependencies
  const renderDependencies = () => {
    const dependencies: any[] = []; // TODO: Add dependencies prop when needed
    return dependencies.map(dep => {
      const predecessor = ganttTasks.find(t => t.id === dep.predecessor_task_id);
      const successor = ganttTasks.find(t => t.id === dep.successor_task_id);

      if (!predecessor || !successor) return null;

      const startX = predecessor.x + predecessor.width;
      const startY = predecessor.y + 20;
      const endX = successor.x;
      const endY = successor.y + 20;

      return (
        <g key={dep.id}>
          <path
            d={`M ${startX} ${startY} L ${endX - 10} ${startY} L ${endX - 10} ${endY} L ${endX} ${endY}`}
            stroke="#666"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
    });
  };

  // Render task list sidebar
  const renderTaskList = () => {
    return (
      <div className="bg-white border-r border-gray-200" style={{ width: SIDEBAR_WIDTH }}>
        <div className="h-20 bg-gray-50 border-b border-gray-200 flex items-center px-4">
          <h3 className="font-semibold text-gray-900">Tasks</h3>
        </div>
        <div className="overflow-y-auto" style={{ height: ganttTasks.length * ROW_HEIGHT }}>
          {ganttTasks.map(task => (
            <div
              key={task.id}
              className={`h-10 flex items-center px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedTask === task.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              style={{ 
                paddingLeft: 16 + task.level * 20,
                height: ROW_HEIGHT
              }}
              onClick={() => {
                setSelectedTask(task.id);
                onTaskClick?.(task);
              }}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {task.children.length > 0 && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                )}
                <div className={`w-3 h-3 rounded-sm ${
                  task.status === 'completed' ? 'bg-green-500' : 
                  task.status === 'in_progress' ? 'bg-blue-500' : 
                  'bg-gray-300'
                }`} />
                <span className="text-sm text-gray-900 truncate">{task.title}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {task.due_date && (
                  <span>{format(new Date(task.due_date), 'MMM dd')}</span>
                )}
                {task.completion_percentage > 0 && (
                  <span>{task.completion_percentage}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <button
              onClick={zoomIn}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={scrollToToday}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Today</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task list sidebar */}
        {renderTaskList()}

        {/* Chart area */}
        <div 
          ref={chartRef}
          className="flex-1 overflow-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative">
            {/* Timeline header */}
            <div className="sticky top-0 z-20">
              {renderTimelineHeader()}
            </div>

            {/* Chart content */}
            <div className="relative">
              <svg
                width={differenceInDays(endDate, startDate) * DAY_WIDTH}
                height={ganttTasks.length * ROW_HEIGHT}
                className="block"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#666"
                    />
                  </marker>
                </defs>

                {/* Grid lines */}
                {dateRange.map((date, index) => {
                  const x = index * DAY_WIDTH;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <line
                      key={index}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={ganttTasks.length * ROW_HEIGHT}
                      stroke={isWeekend ? '#f3f4f6' : '#e5e7eb'}
                      strokeWidth={isWeekend ? 2 : 1}
                    />
                  );
                })}

                {/* Row grid lines */}
                {ganttTasks.map((_, index) => (
                  <line
                    key={index}
                    x1={0}
                    y1={index * ROW_HEIGHT}
                    x2={differenceInDays(endDate, startDate) * DAY_WIDTH}
                    y2={index * ROW_HEIGHT}
                    stroke="#f3f4f6"
                    strokeWidth={1}
                  />
                ))}

                {/* Dependencies */}
                {renderDependencies()}

                {/* Task bars */}
                {renderTaskBars()}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;