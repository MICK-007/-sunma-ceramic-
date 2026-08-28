import { Response } from 'express';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { Cart, CartItem } from '../types';

export const getCart = (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'guest-session';
  let cart = store.carts.get(userId);

  if (!cart) {
    cart = {
      id: `cart-${userId}`,
      userId,
      items: [],
      subtotal: 0,
      total: 0,
      updatedAt: new Date().toISOString(),
    };
    store.carts.set(userId, cart);
  }

  return res.json({ success: true, data: cart });
};

export const addToCart = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to add items to cart.',
      code: 'AUTH_REQUIRED',
    });
  }

  const { productId, quantity = 1, variantId } = req.body;
  const userId = req.user.id;

  const product = store.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  if (product.stockPieces < quantity) {
    return res.status(400).json({
      success: false,
      message: `Requested quantity exceeds available stock of ${product.stockPieces} pieces.`,
    });
  }

  let cart = store.carts.get(userId);
  if (!cart) {
    cart = {
      id: `cart-${userId}`,
      userId,
      items: [],
      subtotal: 0,
      total: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const existingItemIndex = cart.items.findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > product.stockPieces) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more pieces. Total in cart would exceed stock (${product.stockPieces} pieces).`,
      });
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    const newItem: CartItem = {
      id: `cart-item-${Date.now()}`,
      productId,
      product,
      variantId,
      quantity,
      unitPrice: product.pricePerPiece,
    };
    cart.items.push(newItem);
  }

  // Recalculate subtotal
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  cart.total = cart.subtotal;
  cart.updatedAt = new Date().toISOString();

  store.carts.set(userId, cart);

  return res.json({ success: true, message: 'Item added to cart.', data: cart });
};

export const updateCartItem = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  const cart = store.carts.get(userId);
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Cart item not found.' });
  }

  const product = store.products.find(p => p.id === cart.items[itemIndex].productId);
  if (product && quantity > product.stockPieces) {
    return res.status(400).json({
      success: false,
      message: `Requested quantity exceeds available stock (${product.stockPieces} pieces).`,
    });
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  cart.subtotal = cart.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  cart.total = cart.subtotal;
  cart.updatedAt = new Date().toISOString();

  store.carts.set(userId, cart);

  return res.json({ success: true, message: 'Cart updated.', data: cart });
};

export const removeCartItem = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const { itemId } = req.params;
  const userId = req.user.id;

  const cart = store.carts.get(userId);
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  cart.items = cart.items.filter(item => item.id !== itemId);
  cart.subtotal = cart.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  cart.total = cart.subtotal;
  cart.updatedAt = new Date().toISOString();

  store.carts.set(userId, cart);

  return res.json({ success: true, message: 'Item removed from cart.', data: cart });
};

export const clearCart = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const userId = req.user.id;
  const cart = store.carts.get(userId);
  if (cart) {
    cart.items = [];
    cart.subtotal = 0;
    cart.total = 0;
    cart.updatedAt = new Date().toISOString();
    store.carts.set(userId, cart);
  }

  return res.json({ success: true, message: 'Cart cleared.' });
};
