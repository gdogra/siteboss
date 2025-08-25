import { Router } from 'express';
import { ProjectController } from '../controllers/projects';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createProjectSchema, updateProjectSchema } from '../middleware/validation';

const router = Router();

router.get('/', authenticate, ProjectController.getProjects);
router.get('/stats', authenticate, ProjectController.getProjectStats);
router.get('/my-projects', authenticate, ProjectController.getMyProjects);
router.get('/:id', authenticate, ProjectController.getProject);

router.post('/', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  validate(createProjectSchema), 
  ProjectController.createProject
);

router.put('/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  validate(updateProjectSchema), 
  ProjectController.updateProject
);

router.delete('/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ProjectController.deleteProject
);

export default router;