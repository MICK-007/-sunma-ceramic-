import { Router } from 'express';
import { getCategories, getCollections } from '../controllers/product.controller';
import { createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../controllers/admin.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/collections', getCollections);

// Admin Category Management
router.post('/', authenticateUser, requireAdmin, createAdminCategory);
router.put('/:id', authenticateUser, requireAdmin, updateAdminCategory);
router.patch('/:id', authenticateUser, requireAdmin, updateAdminCategory);
router.delete('/:id', authenticateUser, requireAdmin, deleteAdminCategory);

export default router;
