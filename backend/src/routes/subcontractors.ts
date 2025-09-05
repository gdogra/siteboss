import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createSubcontractorAssignmentSchema, createSubcontractorSchema } from '../middleware/validation';
import { SubcontractorController } from '../controllers/subcontractors';

const router = Router();

// List subcontractors for company
router.get('/', authenticate, SubcontractorController.list);

// Create subcontractor
router.post(
  '/',
  authenticate,
  authorize('company_admin', 'project_manager'),
  validate(createSubcontractorSchema),
  SubcontractorController.create
);

// List assignments for a subcontractor by business_name
router.get('/assignments', authenticate, SubcontractorController.listAssignments);

// Create a subcontractor assignment (find-or-create by business_name)
router.post(
  '/assignments',
  authenticate,
  authorize('company_admin', 'project_manager'),
  validate(createSubcontractorAssignmentSchema),
  SubcontractorController.createAssignment
);

export default router;
