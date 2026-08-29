import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/order.controller';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createOrderSchema } from '../schemas/order.schema';
import { orderLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/', authenticateUser, orderLimiter, validateBody(createOrderSchema), createOrder);
router.get('/', authenticateUser, getUserOrders);
router.get('/:id', authenticateUser, getOrderById);

export default router;
