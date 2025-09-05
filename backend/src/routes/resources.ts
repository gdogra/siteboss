import { Router } from 'express';
import { ResourceController } from '../controllers/resources';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get all resources for the company
router.get('/', authenticate, ResourceController.getResources);

// Get resource statistics
router.get('/stats', authenticate, ResourceController.getResourceStats);

// Get resource assignments
router.get('/assignments', authenticate, ResourceController.getResourceAssignments);

// Create new resource assignment
router.post('/assignments', authenticate, ResourceController.createResourceAssignment);

// Create new resource
router.post('/', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ResourceController.createResource
);

// Update resource
router.put('/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ResourceController.updateResource
);

// Delete resource
router.delete('/:id', 
  authenticate, 
  authorize('company_admin', 'project_manager'), 
  ResourceController.deleteResource
);

export default router;