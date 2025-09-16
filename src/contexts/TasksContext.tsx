import React, { createContext, useContext, useState, ReactNode } from 'react';
import { taskAutomationService } from '@/services/taskAutomation';

export interface TaskDependency {
  id: string;
  title: string;
  status: string;
  completion_percentage: number;
}

export interface TaskRisk {
  level: 'low' | 'medium' | 'high' | 'critical';
  type: 'weather' | 'safety' | 'technical' | 'resource' | 'schedule' | 'quality' | 'regulatory' | 'financial';
  description: string;
  mitigation: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface TaskLOE {
  optimistic_hours: number;
  most_likely_hours: number;
  pessimistic_hours: number;
  confidence_level: number; // 0-100
  complexity_factor: 'simple' | 'moderate' | 'complex' | 'highly_complex';
  skill_level_required: 'entry' | 'intermediate' | 'senior' | 'expert';
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completion_percentage: number;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  start_date?: string;
  estimated_hours: number;
  actual_hours: number;
  location?: string;
  cost_code?: string;
  weather_dependent: boolean;
  requires_inspection: boolean;
  inspection_passed?: boolean;
  safety_requirements?: string[];
  equipment_needed?: string[];
  materials_needed?: string[];
  dependencies: TaskDependency[];
  before_photos?: string[];
  progress_photos?: string[];
  after_photos?: string[];
  time_entries_count: number;
  billable_hours: number;
  quality_score?: number;
  rework_required: boolean;
  phase_name?: string;
  subtasks?: string[];
  loe: TaskLOE;
  risks: TaskRisk[];
  created_at: string;
  updated_at: string;
}

interface TasksContextType {
  tasks: Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTask: (taskId: string) => Task | undefined;
  addTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => Task | null;
  deleteTask: (taskId: string) => boolean;
  duplicateTask: (taskId: string) => Task | null;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Task[];
  searchTasks: (projectId: string, query: string) => Task[];
  getTasksByStatus: (projectId: string, status: Task['status']) => Task[];
  getTasksByPriority: (projectId: string, priority: Task['priority']) => Task[];
  getOverdueTasks: (projectId: string) => Task[];
}

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    projectId: 'demo',
    title: 'Site Preparation and Excavation',
    description: 'Clear site and excavate foundation area according to architectural plans',
    status: 'completed',
    priority: 'high',
    completion_percentage: 100,
    assigned_to: 'EMP001',
    assigned_to_name: 'Mike Rodriguez',
    due_date: '2024-12-20',
    start_date: '2024-12-15',
    estimated_hours: 32,
    actual_hours: 35,
    location: 'Foundation Area',
    cost_code: 'SITE-001',
    weather_dependent: true,
    requires_inspection: true,
    inspection_passed: true,
    safety_requirements: ['Hard Hat', 'Safety Vest', 'Steel Toed Boots'],
    equipment_needed: ['Excavator', 'Dump Truck', 'Compactor'],
    materials_needed: ['Gravel', 'Sand'],
    dependencies: [],
    before_photos: ['site_before_1.jpg', 'site_before_2.jpg'],
    progress_photos: ['excavation_progress_1.jpg'],
    after_photos: ['site_complete_1.jpg'],
    time_entries_count: 8,
    billable_hours: 35,
    quality_score: 95,
    rework_required: false,
    phase_name: 'Site Preparation',
    subtasks: ['Site Survey', 'Tree Removal', 'Soil Testing', 'Excavation', 'Grading', 'Compaction'],
    loe: {
      optimistic_hours: 28,
      most_likely_hours: 32,
      pessimistic_hours: 40,
      confidence_level: 85,
      complexity_factor: 'moderate',
      skill_level_required: 'intermediate'
    },
    risks: [
      {
        level: 'medium',
        type: 'weather',
        description: 'Rain could delay excavation work',
        mitigation: 'Monitor weather forecast, have drainage plan ready',
        probability: 40,
        impact: 'medium'
      },
      {
        level: 'low',
        type: 'technical',
        description: 'Unexpected underground utilities',
        mitigation: 'Call 811 before digging, have utility maps available',
        probability: 20,
        impact: 'high'
      }
    ],
    created_at: '2024-03-10T08:00:00Z',
    updated_at: '2024-03-20T17:30:00Z'
  },
  {
    id: '2',
    projectId: 'demo',
    title: 'Foundation Concrete Pour',
    description: 'Pour concrete foundation and footings',
    status: 'in_progress',
    priority: 'high',
    completion_percentage: 75,
    assigned_to: 'EMP002',
    assigned_to_name: 'Sarah Johnson',
    due_date: '2024-12-25',
    start_date: '2024-12-21',
    estimated_hours: 16,
    actual_hours: 12,
    location: 'Foundation Area',
    cost_code: 'CONC-001',
    weather_dependent: true,
    requires_inspection: true,
    inspection_passed: false,
    safety_requirements: ['Hard Hat', 'Safety Vest', 'Steel Toed Boots', 'Safety Glasses'],
    equipment_needed: ['Concrete Mixer', 'Wheelbarrow', 'Float'],
    materials_needed: ['Concrete', 'Rebar', 'Wire Mesh'],
    dependencies: [
      { id: '1', title: 'Site Preparation and Excavation', status: 'completed', completion_percentage: 100 }
    ],
    before_photos: ['foundation_before_1.jpg'],
    progress_photos: ['concrete_pour_1.jpg', 'concrete_pour_2.jpg'],
    time_entries_count: 4,
    billable_hours: 12,
    quality_score: 88,
    rework_required: false,
    phase_name: 'Foundation',
    subtasks: ['Rebar Installation', 'Form Setup', 'Concrete Mixing', 'Pouring', 'Leveling', 'Curing'],
    loe: {
      optimistic_hours: 14,
      most_likely_hours: 16,
      pessimistic_hours: 20,
      confidence_level: 80,
      complexity_factor: 'moderate',
      skill_level_required: 'senior'
    },
    risks: [
      {
        level: 'high',
        type: 'weather',
        description: 'Temperature below 40°F or rain during pour',
        mitigation: 'Use heated concrete, cover work area, monitor weather',
        probability: 30,
        impact: 'high'
      },
      {
        level: 'medium',
        type: 'quality',
        description: 'Improper concrete mix or curing',
        mitigation: 'Quality control testing, proper curing procedures',
        probability: 15,
        impact: 'critical'
      }
    ],
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2024-03-23T16:45:00Z'
  },
  {
    id: '3',
    projectId: 'demo',
    title: 'Structural Steel Installation',
    description: 'Install structural steel frame according to engineering specifications',
    status: 'not_started',
    priority: 'medium',
    completion_percentage: 0,
    assigned_to: 'EMP003',
    assigned_to_name: 'David Chen',
    due_date: '2025-01-10',
    start_date: '2024-12-26',
    estimated_hours: 48,
    actual_hours: 0,
    location: 'Main Structure',
    cost_code: 'STEEL-001',
    weather_dependent: false,
    requires_inspection: true,
    safety_requirements: ['Hard Hat', 'Safety Harness', 'Steel Toed Boots'],
    equipment_needed: ['Crane', 'Welding Equipment', 'Lifting Chains'],
    materials_needed: ['Steel Beams', 'Bolts', 'Welding Rods'],
    dependencies: [
      { id: '2', title: 'Foundation Concrete Pour', status: 'in_progress', completion_percentage: 75 }
    ],
    time_entries_count: 0,
    billable_hours: 0,
    rework_required: false,
    phase_name: 'Structural Frame',
    subtasks: ['Steel Delivery', 'Beam Positioning', 'Welding Connections', 'Bolt Installation', 'Alignment Check', 'Quality Inspection'],
    loe: {
      optimistic_hours: 42,
      most_likely_hours: 48,
      pessimistic_hours: 60,
      confidence_level: 75,
      complexity_factor: 'complex',
      skill_level_required: 'expert'
    },
    risks: [
      {
        level: 'high',
        type: 'safety',
        description: 'Working at height with heavy materials',
        mitigation: 'Certified crane operator, proper rigging, fall protection',
        probability: 25,
        impact: 'critical'
      },
      {
        level: 'medium',
        type: 'technical',
        description: 'Structural alignment issues',
        mitigation: 'Precise measurements, engineering oversight',
        probability: 20,
        impact: 'high'
      },
      {
        level: 'low',
        type: 'weather',
        description: 'High winds affecting crane operations',
        mitigation: 'Monitor wind conditions, halt work if unsafe',
        probability: 35,
        impact: 'medium'
      }
    ],
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z'
  },
  {
    id: '4',
    projectId: '1757454115704',
    title: 'Site Survey and Planning',
    description: 'Conduct detailed site survey and finalize construction plans',
    status: 'completed',
    priority: 'high',
    completion_percentage: 100,
    assigned_to: 'EMP004',
    assigned_to_name: 'John Smith',
    due_date: '2025-01-15',
    start_date: '2025-01-01',
    estimated_hours: 24,
    actual_hours: 22,
    location: 'Project Site',
    cost_code: 'PLAN-001',
    weather_dependent: false,
    requires_inspection: false,
    safety_requirements: ['Hard Hat', 'Safety Vest'],
    equipment_needed: ['Surveying Equipment', 'Laptop'],
    materials_needed: ['Survey Stakes', 'Marking Paint'],
    dependencies: [],
    time_entries_count: 6,
    billable_hours: 22,
    quality_score: 92,
    rework_required: false,
    phase_name: 'Planning',
    subtasks: ['Boundary Survey', 'Topographical Mapping', 'Utility Location', 'Soil Analysis', 'Plan Review', 'Permit Applications'],
    loe: {
      optimistic_hours: 20,
      most_likely_hours: 24,
      pessimistic_hours: 30,
      confidence_level: 90,
      complexity_factor: 'simple',
      skill_level_required: 'senior'
    },
    risks: [
      {
        level: 'low',
        type: 'regulatory',
        description: 'Delays in permit approval',
        mitigation: 'Submit applications early, follow up with authorities',
        probability: 25,
        impact: 'medium'
      },
      {
        level: 'low',
        type: 'technical',
        description: 'Unexpected site conditions',
        mitigation: 'Thorough initial assessment, contingency planning',
        probability: 15,
        impact: 'medium'
      }
    ],
    created_at: '2024-11-10T08:00:00Z',
    updated_at: '2024-12-01T17:30:00Z'
  },
  {
    id: '5',
    projectId: '1757454115704',
    title: 'Foundation Work',
    description: 'Excavation and foundation construction',
    status: 'in_progress',
    priority: 'high',
    completion_percentage: 60,
    assigned_to: 'EMP005',
    assigned_to_name: 'Maria Garcia',
    due_date: '2025-02-01',
    start_date: '2025-01-16',
    estimated_hours: 40,
    actual_hours: 24,
    location: 'Foundation Area',
    cost_code: 'FOUND-001',
    weather_dependent: true,
    requires_inspection: true,
    inspection_passed: false,
    safety_requirements: ['Hard Hat', 'Safety Vest', 'Steel Toed Boots'],
    equipment_needed: ['Excavator', 'Concrete Mixer'],
    materials_needed: ['Concrete', 'Rebar'],
    dependencies: [
      { id: '4', title: 'Site Survey and Planning', status: 'completed', completion_percentage: 100 }
    ],
    progress_photos: ['foundation_progress_1.jpg'],
    time_entries_count: 8,
    billable_hours: 24,
    quality_score: 85,
    rework_required: false,
    phase_name: 'Foundation',
    subtasks: ['Site Excavation', 'Footing Forms', 'Rebar Placement', 'Foundation Pour', 'Wall Forms', 'Foundation Walls'],
    loe: {
      optimistic_hours: 36,
      most_likely_hours: 40,
      pessimistic_hours: 50,
      confidence_level: 85,
      complexity_factor: 'moderate',
      skill_level_required: 'intermediate'
    },
    risks: [
      {
        level: 'medium',
        type: 'weather',
        description: 'Winter conditions affecting concrete work',
        mitigation: 'Use cold weather concrete mix, heated enclosure',
        probability: 60,
        impact: 'medium'
      },
      {
        level: 'medium',
        type: 'technical',
        description: 'Groundwater or unstable soil conditions',
        mitigation: 'Dewatering system, soil stabilization if needed',
        probability: 30,
        impact: 'high'
      },
      {
        level: 'low',
        type: 'schedule',
        description: 'Material delivery delays during holiday season',
        mitigation: 'Order materials early, backup suppliers',
        probability: 25,
        impact: 'medium'
      }
    ],
    created_at: '2024-11-25T09:00:00Z',
    updated_at: '2024-12-10T16:30:00Z'
  }
];

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const getTasksByProject = (projectId: string): Task[] => {
    return tasks.filter(task => task.projectId === projectId);
  };

  const getTask = (taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task => {
    // Generate unique ID with timestamp and random number to avoid collisions
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...taskData,
      id: uniqueId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>): Task | null => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return null;

    const originalTask = tasks[taskIndex];
    const updatedTask = {
      ...originalTask,
      ...updates,
      updated_at: new Date().toISOString()
    };

    setTasks(prev => [
      ...prev.slice(0, taskIndex),
      updatedTask,
      ...prev.slice(taskIndex + 1)
    ]);

    // Check for automation triggers if task was completed
    if (updates.completion_percentage === 100 && originalTask.completion_percentage !== 100) {
      // Task was just completed - trigger automation
      taskAutomationService.onTaskCompleted(updatedTask, tasks, addTask)
        .catch(error => console.error('Automation trigger failed:', error));
    }

    return updatedTask;
  };

  const deleteTask = (taskId: string): boolean => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return false;

    setTasks(prev => prev.filter(task => task.id !== taskId));
    return true;
  };

  const duplicateTask = (taskId: string): Task | null => {
    const originalTask = getTask(taskId);
    if (!originalTask) return null;

    const duplicatedTask = addTask({
      ...originalTask,
      title: `${originalTask.title} (Copy)`,
      status: 'not_started',
      completion_percentage: 0,
      actual_hours: 0,
      time_entries_count: 0,
      billable_hours: 0,
      inspection_passed: undefined,
      before_photos: [],
      progress_photos: [],
      after_photos: [],
      rework_required: false
    });

    return duplicatedTask;
  };

  const bulkUpdateTasks = (taskIds: string[], updates: Partial<Task>): Task[] => {
    const updatedTasks: Task[] = [];
    
    setTasks(prev => prev.map(task => {
      if (taskIds.includes(task.id)) {
        const updated = {
          ...task,
          ...updates,
          updated_at: new Date().toISOString()
        };
        updatedTasks.push(updated);
        return updated;
      }
      return task;
    }));

    return updatedTasks;
  };

  const searchTasks = (projectId: string, query: string): Task[] => {
    const projectTasks = getTasksByProject(projectId);
    const lowercaseQuery = query.toLowerCase();
    
    return projectTasks.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.description?.toLowerCase().includes(lowercaseQuery) ||
      task.assigned_to_name?.toLowerCase().includes(lowercaseQuery) ||
      task.location?.toLowerCase().includes(lowercaseQuery) ||
      task.cost_code?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getTasksByStatus = (projectId: string, status: Task['status']): Task[] => {
    return getTasksByProject(projectId).filter(task => task.status === status);
  };

  const getTasksByPriority = (projectId: string, priority: Task['priority']): Task[] => {
    return getTasksByProject(projectId).filter(task => task.priority === priority);
  };

  const getOverdueTasks = (projectId: string): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return getTasksByProject(projectId).filter(task => 
      task.due_date && task.due_date < today && task.status !== 'completed'
    );
  };

  const contextValue: TasksContextType = {
    tasks,
    getTasksByProject,
    getTask,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    bulkUpdateTasks,
    searchTasks,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};