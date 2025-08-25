import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate, loginSchema, registerSchema } from '../middleware/validation';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/register', validate(registerSchema), AuthController.register);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router;