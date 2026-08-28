import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { optionalUser, authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', optionalUser, getCart);
router.post('/items', optionalUser, addToCart);
router.patch('/items/:itemId', authenticateUser, updateCartItem);
router.delete('/items/:itemId', authenticateUser, removeCartItem);
router.delete('/clear', authenticateUser, clearCart);

export default router;
