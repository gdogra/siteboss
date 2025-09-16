import { Router } from 'express';
import { ProjectController } from '../controllers/projects';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createProjectSchema, updateProjectSchema, createJobSiteSchema, updateJobSiteSchema } from '../middleware/validation';
import { JobSitesController } from '../controllers/jobSites';

const router = Router();

router.get('/', authenticate, ProjectController.getProjects);
router.get('/stats', authenticate, ProjectController.getProjectStats);
router.get('/my-projects', authenticate, ProjectController.getMyProjects);
router.get('/:id', authenticate, ProjectController.getProject);
router.get('/:id/team', authenticate, ProjectController.getProjectTeam);
router.get('/:id/sites', authenticate, JobSitesController.listByProject);

router.post('/:id/sites', 
  authenticate,
  authorize('company_admin', 'project_manager', 'foreman'),
  validate(createJobSiteSchema),
  JobSitesController.create
);

router.put('/:id/sites/:siteId', 
  authenticate,
  authorize('company_admin', 'project_manager', 'foreman'),
  validate(updateJobSiteSchema),
  JobSitesController.update
);

router.delete('/:id/sites/:siteId', 
  authenticate,
  authorize('company_admin', 'project_manager', 'foreman'),
  JobSitesController.remove
);

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
