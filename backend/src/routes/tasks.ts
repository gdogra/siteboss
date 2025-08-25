import { Router } from 'express';
import { TaskController } from '../controllers/tasks';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createTaskSchema, updateTaskSchema } from '../middleware/validation';

const router = Router();

router.get('/my-tasks', authenticate, TaskController.getMyTasks);
router.get('/overdue', authenticate, TaskController.getOverdueTasks);
router.get('/project/:projectId', authenticate, TaskController.getTasks);
router.get('/project/:projectId/stats', authenticate, TaskController.getTaskStats);
router.get('/:id', authenticate, TaskController.getTask);
router.get('/:parentId/subtasks', authenticate, TaskController.getSubtasks);

router.post('/', 
  authenticate, 
  authorize('company_admin', 'project_manager', 'foreman'), 
  validate(createTaskSchema), 
  TaskController.createTask
);

router.put('/:id', 
  authenticate, 
  validate(updateTaskSchema), 
  TaskController.updateTask
);

router.delete('/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager', 'foreman'), 
  TaskController.deleteTask
);

export default router;