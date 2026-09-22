import { Router } from 'express';
import {
  getDashboardStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleAdminProductSoldOut,
  deleteAdminProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminInventory,
  getAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  createAdminBrand,
  getShopFilters,
  updateShopFilters,
  getCompanySettings,
  updateCompanySettings,
} from '../controllers/admin.controller';

import { authenticateUser, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';
import { updateOrderStatusSchema } from '../schemas/order.schema';
import { createPromotionSchema, updatePromotionSchema } from '../schemas/promotion.schema';

const router = Router();

// Apply auth and admin middleware to all admin endpoints
router.use(authenticateUser, requireAdmin);

router.get('/dashboard', getDashboardStats);

router.get('/products', getAdminProducts);
router.post('/products', validateBody(createProductSchema), createAdminProduct);
router.patch('/products/:id', validateBody(updateProductSchema), updateAdminProduct);
router.put('/products/:id', validateBody(updateProductSchema), updateAdminProduct);
router.patch('/products/:id/toggle-sold-out', toggleAdminProductSoldOut);
router.post('/products/:id/toggle-sold-out', toggleAdminProductSoldOut);
router.delete('/products/:id', deleteAdminProduct);

router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

router.get('/customers', getAdminCustomers);
router.get('/inventory', getAdminInventory);

router.get('/promotions', getAdminPromotions);
router.post('/promotions', validateBody(createPromotionSchema), createAdminPromotion);
router.patch('/promotions/:id', validateBody(updatePromotionSchema), updateAdminPromotion);

router.post('/categories', createAdminCategory);
router.put('/categories/:id', updateAdminCategory);
router.patch('/categories/:id', updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);
router.post('/brands', createAdminBrand);

// Filters and Company Settings
router.get('/filters', getShopFilters);
router.put('/filters', updateShopFilters);
router.get('/company-settings', getCompanySettings);
router.put('/company-settings', updateCompanySettings);

export default router;

