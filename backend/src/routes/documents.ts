import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingleMemory } from '../middleware/upload';
import { DocumentController } from '../controllers/documents';

const router = Router();

// Multipart/form-data upload endpoint
router.post('/upload', authenticate, authorize('company_admin', 'project_manager', 'foreman', 'worker'), uploadSingleMemory, DocumentController.upload);

// List documents for a project
router.get('/project/:projectId', authenticate, DocumentController.listByProject);

// Get single document metadata
router.get('/:id', authenticate, DocumentController.getOne);

// Download (redirect to signed/public URL)
router.get('/:id/download', authenticate, DocumentController.download);

export default router;
