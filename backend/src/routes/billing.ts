import { Router } from 'express';
import { BillingController } from '../controllers/billing';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/settings', authenticate, BillingController.getSettings);
router.put('/settings', authenticate, authorize('company_admin', 'super_admin'), BillingController.updateSettings);

export default router;

