import { Response } from 'express';
import { getDbClient } from '../db';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';

export const getWishlist = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required to view wishlist.' });
  }

  const userId = req.user.id;
  const sql = getDbClient();

  let productIds: string[] = [];

  if (sql) {
    try {
      // Fetch wishlist items for this user from Supabase PostgreSQL
      const rows = await sql`
        SELECT wi.product_id as "productId"
        FROM wishlists w
        JOIN wishlist_items wi ON wi.wishlist_id = w.id
        WHERE w.user_id = ${userId};
      `;
      await sql.end();

      productIds = rows.map((r: any) => r.productId);
    } catch (err) {
      if (sql) await sql.end().catch(() => {});
      console.error('Error fetching wishlist from DB:', err);
      productIds = store.wishlists.get(userId) || [];
    }
  } else {
    productIds = store.wishlists.get(userId) || [];
  }

  // Map productIds to actual product objects from store
  const items = store.products.filter(p => productIds.includes(p.id) || productIds.includes(p.slug));
  return res.json({ success: true, data: items, productIds });
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required.' });
  }

  const sql = getDbClient();
  let productIds: string[] = [];

  if (sql) {
    try {
      // 1. Ensure wishlist record exists for user
      let wishlistRows = await sql`
        SELECT id FROM wishlists WHERE user_id = ${userId} LIMIT 1;
      `;

      let wishlistId: string;
      if (!wishlistRows || wishlistRows.length === 0) {
        const newWishlist = await sql`
          INSERT INTO wishlists (user_id) VALUES (${userId}) RETURNING id;
        `;
        wishlistId = newWishlist[0].id;
      } else {
        wishlistId = wishlistRows[0].id;
      }

      // 2. Insert item into wishlist_items safely using ON CONFLICT DO NOTHING
      await sql`
        INSERT INTO wishlist_items (wishlist_id, product_id)
        VALUES (${wishlistId}, ${productId})
        ON CONFLICT (wishlist_id, product_id) DO NOTHING;
      `;

      // 3. Return updated productIds for this user
      const updatedRows = await sql`
        SELECT product_id as "productId" FROM wishlist_items WHERE wishlist_id = ${wishlistId};
      `;
      await sql.end();

      productIds = updatedRows.map((r: any) => r.productId);
    } catch (err) {
      if (sql) await sql.end().catch(() => {});
      console.error('Error adding to wishlist in DB:', err);
      productIds = store.wishlists.get(userId) || [];
      if (!productIds.includes(productId)) {
        productIds.push(productId);
        store.wishlists.set(userId, productIds);
      }
    }
  } else {
    productIds = store.wishlists.get(userId) || [];
    if (!productIds.includes(productId)) {
      productIds.push(productId);
      store.wishlists.set(userId, productIds);
    }
  }

  const items = store.products.filter(p => productIds.includes(p.id) || productIds.includes(p.slug));
  return res.json({ success: true, message: 'Added to wishlist.', data: items, productIds });
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const { productId } = req.params;
  const userId = req.user.id;

  const sql = getDbClient();
  let productIds: string[] = [];

  if (sql) {
    try {
      await sql`
        DELETE FROM wishlist_items
        WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = ${userId})
          AND product_id = ${productId};
      `;

      const updatedRows = await sql`
        SELECT product_id as "productId" 
        FROM wishlist_items 
        WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = ${userId});
      `;
      await sql.end();

      productIds = updatedRows.map((r: any) => r.productId);
    } catch (err) {
      if (sql) await sql.end().catch(() => {});
      console.error('Error removing from wishlist in DB:', err);
      productIds = store.wishlists.get(userId) || [];
      productIds = productIds.filter(id => id !== productId);
      store.wishlists.set(userId, productIds);
    }
  } else {
    productIds = store.wishlists.get(userId) || [];
    productIds = productIds.filter(id => id !== productId);
    store.wishlists.set(userId, productIds);
  }

  const items = store.products.filter(p => productIds.includes(p.id) || productIds.includes(p.slug));
  return res.json({ success: true, message: 'Removed from wishlist.', data: items, productIds });
};
