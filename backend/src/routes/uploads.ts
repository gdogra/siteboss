import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadReceiptSingleMemory } from '../middleware/upload';
import { UploadsController } from '../controllers/uploads';

const router = Router();

// CRA frontend expects /api/upload/receipt to return { file_path }
router.post('/receipt', authenticate, uploadReceiptSingleMemory, UploadsController.uploadReceipt);

export default router;
