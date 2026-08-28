import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, getWishlist);
router.post('/', authenticateUser, addToWishlist);
router.delete('/:productId', authenticateUser, removeFromWishlist);

export default router;
