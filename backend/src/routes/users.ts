import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { UsersController } from '../controllers/users';

const router = Router();

router.get('/', authenticate, UsersController.list);

export default router;

