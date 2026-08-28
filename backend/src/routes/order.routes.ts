import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/order.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, createOrder);
router.get('/', authenticateUser, getUserOrders);
router.get('/:id', authenticateUser, getOrderById);

export default router;
