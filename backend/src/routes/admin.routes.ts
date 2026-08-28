import { Router } from 'express';
import {
  getDashboardStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminInventory,
  getAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  createAdminCategory,
  createAdminBrand,
} from '../controllers/admin.controller';
import { authenticateUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

// Apply auth and admin middleware to all admin endpoints
router.use(authenticateUser, requireAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.patch('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/customers', getAdminCustomers);
router.get('/inventory', getAdminInventory);

router.get('/promotions', getAdminPromotions);
router.post('/promotions', createAdminPromotion);
router.patch('/promotions/:id', updateAdminPromotion);

router.post('/categories', createAdminCategory);
router.post('/brands', createAdminBrand);

export default router;
