import { Router } from 'express';
import { login, register, refresh, me, logout } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

// Rate limiting temporarily disabled on auth routes per user directive
router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);
router.post('/refresh', refresh);
router.get('/me', authenticateUser, me);
router.post('/logout', logout);

export default router;
