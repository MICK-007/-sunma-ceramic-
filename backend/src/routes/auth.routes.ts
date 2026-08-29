import { Router } from 'express';
import { login, register, refresh, me, logout } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.get('/me', authenticateUser, me);
router.post('/logout', logout);

export default router;
