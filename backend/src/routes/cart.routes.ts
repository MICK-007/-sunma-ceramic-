import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { authenticateUser } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schema';

const router = Router();

router.get('/', authenticateUser, getCart);
router.post('/items', authenticateUser, validateBody(addToCartSchema), addToCart);
router.patch('/items/:itemId', authenticateUser, validateBody(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', authenticateUser, removeCartItem);
router.delete('/clear', authenticateUser, clearCart);

export default router;
