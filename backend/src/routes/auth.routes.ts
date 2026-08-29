import { Router } from 'express';
import { login, register, refresh, me, logout } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { authLimiter, refreshLimiter } from '../index';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/refresh', refreshLimiter, refresh);
router.get('/me', authenticateUser, me);
router.post('/logout', logout);

export default router;
