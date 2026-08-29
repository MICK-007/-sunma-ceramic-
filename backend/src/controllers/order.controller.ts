import { Response } from 'express';
import { store } from '../repositories/store';
import { AuthenticatedRequest } from '../middleware/auth';
import { Order, OrderItem } from '../types';

export const createOrder = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required to complete order.' });
  }

  // 1. User Identity derived EXCLUSIVELY from server-verified req.user.id
  const userId = req.user.id;

  // 2. Explicit Field Destructuring (Mass Assignment Prevention)
  const {
    items,
    shippingAddress,
    paymentMethod,
    taxInvoiceRequested,
    taxInvoiceDetails,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order items cannot be empty.' });
  }

  if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.addressLine) {
    return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Please select a payment method.' });
  }

  // Validate stock and build order items
  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = store.products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product ID ${item.productId} not found.` });
    }

    if (product.stockPieces < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product "${product.name}". Available: ${product.stockPieces} pieces.`,
      });
    }

    const itemTotal = product.pricePerPiece * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      id: `ord-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      productCode: product.productCode,
      variantInfo: product.size,
      quantity: item.quantity,
      pricePerUnit: product.pricePerPiece,
      totalPrice: itemTotal,
      thumbnail: product.thumbnail,
    });

    product.stockPieces -= item.quantity;
  }

  const shippingFee = subtotal > 15000 ? 0 : 500;
  const taxAmount = Math.round(subtotal * 0.07);
  const totalAmount = subtotal + shippingFee;

  const orderNumber = `SNM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId, // Strictly user.id
    userEmail: req.user.email,
    status: 'Pending',
    totalAmount,
    shippingFee,
    taxAmount,
    paymentMethod,
    shippingAddress,
    recipientName: shippingAddress.recipientName,
    recipientPhone: shippingAddress.phone || '',
    taxInvoiceRequested: !!taxInvoiceRequested,
    taxInvoiceDetails: taxInvoiceRequested ? taxInvoiceDetails : undefined,
    items: orderItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.orders.unshift(newOrder);

  // Clear cart for user
  const userCart = store.carts.get(userId);
  if (userCart) {
    userCart.items = [];
    userCart.subtotal = 0;
    userCart.total = 0;
    userCart.updatedAt = new Date().toISOString();
  }

  return res.status(201).json({
    success: true,
    message: 'Order created successfully.',
    data: newOrder,
  });
};

export const getUserOrders = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const userId = req.user.id;
  // Filter strictly by req.user.id
  const userOrders = store.orders.filter(o => o.userId === userId || (req.user?.email && o.userEmail === req.user.email));

  return res.json({ success: true, data: userOrders });
};

export const getOrderById = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const { id } = req.params;
  const order = store.orders.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // IDOR Protection: Ensure user owns order or is ADMIN
  const isOwner = order.userId === req.user.id || (req.user.email && order.userEmail === req.user.email);
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to access this order.',
    });
  }

  return res.json({ success: true, data: order });
};
