import type { Task } from '@/contexts/TasksContext';
import { 
  generateMilestoneTasks, 
  generateDependencyBasedTasks 
} from '@/utils/taskGenerator';
import { taskApi } from './api';
import { offlineService } from './offlineService';

/**
 * Service for handling automated task creation based on project milestones,
 * task completions, and other triggers
 */
export class TaskAutomationService {
  
  /**
   * Check if milestone tasks should be triggered based on project completion
   */
  async checkMilestoneCompletionTriggers(
    projectId: string, 
    completionPercentage: number,
    addTaskCallback: (task: any) => void
  ): Promise<void> {
    try {
      const milestoneTasks = generateMilestoneTasks(projectId, completionPercentage);
      
      for (const taskData of milestoneTasks) {
        const taskPayload = {
          project_id: projectId,
          title: taskData.title,
          description: taskData.description,
          start_date: taskData.start_date,
          due_date: taskData.due_date,
          estimated_hours: taskData.estimated_hours,
          priority: taskData.priority,
        };

        try {
          await taskApi.createTask(taskPayload);
        } catch (err) {
          // Queue offline if needed
          await offlineService.queueAction({ 
            type: 'CREATE', 
            entity: 'task', 
            data: taskPayload 
          });
        }
        
        // Always reflect in UI context
        addTaskCallback({ ...taskData, project_id: projectId });
      }
    } catch (error) {
      console.error('Error checking milestone triggers:', error);
    }
  }

  /**
   * Check if dependency-based tasks should be triggered when a task is completed
   */
  async checkDependencyTriggers(
    completedTask: Task,
    allProjectTasks: Task[],
    addTaskCallback: (task: any) => void
  ): Promise<void> {
    try {
      const dependencyTasks = generateDependencyBasedTasks(
        completedTask.projectId, 
        completedTask.title, 
        allProjectTasks
      );
      
      for (const taskData of dependencyTasks) {
        const taskPayload = {
          project_id: completedTask.projectId,
          title: taskData.title,
          description: taskData.description,
          start_date: taskData.start_date,
          due_date: taskData.due_date,
          estimated_hours: taskData.estimated_hours,
          priority: taskData.priority,
        };

        try {
          await taskApi.createTask(taskPayload);
        } catch (err) {
          // Queue offline if needed
          await offlineService.queueAction({ 
            type: 'CREATE', 
            entity: 'task', 
            data: taskPayload 
          });
        }
        
        // Always reflect in UI context
        addTaskCallback({ ...taskData, project_id: completedTask.projectId });
      }
    } catch (error) {
      console.error('Error checking dependency triggers:', error);
    }
  }

  /**
   * Calculate project completion percentage based on task completion
   */
  calculateProjectCompletion(projectTasks: Task[]): number {
    if (projectTasks.length === 0) return 0;
    
    const totalCompletion = projectTasks.reduce((sum, task) => 
      sum + (task.completion_percentage || 0), 0
    );
    
    return Math.round(totalCompletion / projectTasks.length);
  }

  /**
   * Get overdue tasks that might need follow-up automation
   */
  getOverdueTasks(projectTasks: Task[]): Task[] {
    const today = new Date();
    return projectTasks.filter(task => 
      task.status !== 'completed' && 
      task.due_date && 
      new Date(task.due_date) < today
    );
  }

  /**
   * Check if a task completion should trigger automated actions
   */
  async onTaskCompleted(
    completedTask: Task,
    allProjectTasks: Task[],
    addTaskCallback: (task: any) => void
  ): Promise<void> {
    // Calculate new project completion percentage
    const updatedTasks = allProjectTasks.map(task => 
      task.id === completedTask.id ? completedTask : task
    );
    const projectTasks = updatedTasks.filter(task => task.projectId === completedTask.projectId);
    const completionPercentage = this.calculateProjectCompletion(projectTasks);

    // Check milestone triggers
    await this.checkMilestoneCompletionTriggers(
      completedTask.projectId, 
      completionPercentage, 
      addTaskCallback
    );

    // Check dependency triggers
    await this.checkDependencyTriggers(
      completedTask, 
      projectTasks, 
      addTaskCallback
    );
  }

  /**
   * Generate suggested follow-up tasks based on task completion
   */
  generateFollowUpSuggestions(completedTask: Task): string[] {
    const suggestions: string[] = [];
    
    if (completedTask.requires_inspection && !completedTask.inspection_passed) {
      suggestions.push('Schedule inspection for completed work');
    }
    
    if (completedTask.phase_name === 'Foundation' && completedTask.completion_percentage === 100) {
      suggestions.push('Begin framing preparation');
      suggestions.push('Order framing materials');
    }
    
    if (completedTask.phase_name === 'Electrical' && completedTask.completion_percentage === 100) {
      suggestions.push('Schedule electrical inspection');
      suggestions.push('Coordinate with inspector');
    }
    
    if (completedTask.weather_dependent && completedTask.completion_percentage === 100) {
      suggestions.push('Update weather-dependent task schedules');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const taskAutomationService = new TaskAutomationService();