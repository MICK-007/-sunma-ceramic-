import { Response } from 'express';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';

export const getWishlist = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required to view wishlist.' });
  }

  // Enforce ownership strictly via req.user.id
  const userId = req.user.id;
  const productIds = store.wishlists.get(userId) || [];
  const items = store.products.filter(p => productIds.includes(p.id));

  return res.json({ success: true, data: items, productIds });
};

export const addToWishlist = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Explicit Field Destructuring (Ignore req.body.userId)
  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  let productIds = store.wishlists.get(userId) || [];
  if (!productIds.includes(productId)) {
    productIds.push(productId);
    store.wishlists.set(userId, productIds);
  }

  return res.json({ success: true, message: 'Added to wishlist.', productIds });
};

export const removeFromWishlist = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const { productId } = req.params;
  const userId = req.user.id;

  let productIds = store.wishlists.get(userId) || [];
  productIds = productIds.filter(id => id !== productId);
  store.wishlists.set(userId, productIds);

  return res.json({ success: true, message: 'Removed from wishlist.', productIds });
};
