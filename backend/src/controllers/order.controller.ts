import { Response } from 'express';
import crypto from 'crypto';
import { getDbClient } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import { store } from '../repositories/store';

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  // 1. Authenticated User Scope Enforcement
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to place an order.',
    });
  }
  const userId = req.user.id;

  // 2. Standard Required HTTP Header X-Idempotency-Key Validation
  const rawIdempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey;
  if (!rawIdempotencyKey || typeof rawIdempotencyKey !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing required HTTP header X-Idempotency-Key.',
    });
  }

  const idempotencyKey = rawIdempotencyKey.trim();
  if (idempotencyKey.length < 16 || idempotencyKey.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'X-Idempotency-Key length must be between 16 and 255 characters.',
    });
  }

  // 3. Explicit Field Destructuring (Mass Assignment Prevention)
  const { items, shippingAddress, paymentMethod, promoCode, taxInvoiceRequested, taxInvoiceDetails } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order items cannot be empty.' });
  }

  if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.addressLine) {
    return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Please select a payment method.' });
  }

  // 4. Quantity Range Validation & Item Deduplication Pre-processing
  const itemMap = new Map<string, number>();
  for (const item of items) {
    if (!item.productId || typeof item.productId !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 1000) {
      return res.status(400).json({
        success: false,
        message: `Quantity for product ${item.productId} must be an integer between 1 and 1000.`,
      });
    }
    const currentQty = itemMap.get(item.productId) || 0;
    itemMap.set(item.productId, currentQty + qty);
  }

  const deduplicatedItems = Array.from(itemMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  // 5. Canonical Payload Hash Construction (SHA-256)
  const canonicalPayload = {
    items: deduplicatedItems
      .map(i => ({ productId: i.productId, quantity: i.quantity }))
      .sort((a, b) => a.productId.localeCompare(b.productId)),
    shippingAddress: {
      recipientName: shippingAddress.recipientName.trim(),
      phone: (shippingAddress.phone || '').trim(),
      addressLine: shippingAddress.addressLine.trim(),
      subdistrict: (shippingAddress.subdistrict || '').trim(),
      district: (shippingAddress.district || '').trim(),
      province: (shippingAddress.province || '').trim(),
      postalCode: (shippingAddress.postalCode || '').trim(),
    },
    paymentMethod: String(paymentMethod).trim(),
    promoCode: promoCode ? String(promoCode).trim().toUpperCase() : '',
  };

  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(canonicalPayload)).digest('hex');

  // 6. Connect to Supabase PostgreSQL Database (No RAM Fallback for Production Orders)
  const sql = getDbClient();
  if (!sql) {
    // In Production mode, prohibit falling back to store.ts RAM for order processing
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable. Orders cannot be processed in memory in production.',
      });
    }
  }

  // If live PostgreSQL connection is active
  if (sql) {
    try {
      // Step A: Check if (user_id, idempotency_key) already exists in orders table
      const existingOrders = await sql`
        SELECT id, order_number as "orderNumber", user_id as "userId", total_amount as "totalAmount", 
               status, payload_hash as "payloadHash", created_at as "createdAt"
        FROM orders
        WHERE user_id = ${userId} AND idempotency_key = ${idempotencyKey}
        LIMIT 1;
      `;

      if (existingOrders && existingOrders.length > 0) {
        const existing = existingOrders[0];
        if (existing.payloadHash !== payloadHash) {
          await sql.end();
          return res.status(409).json({
            success: false,
            message: 'Idempotency key reused with mismatched request payload is forbidden.',
          });
        }

        // Return original order result
        const orderItemsRows = await sql`
          SELECT id, product_id as "productId", product_name as "productName", 
                 product_code as "productCode", quantity, price_per_unit as "pricePerUnit", total_price as "totalPrice"
          FROM order_items
          WHERE order_id = ${existing.id};
        `;
        await sql.end();

        return res.status(200).json({
          success: true,
          message: 'Order retrieved successfully via Idempotency Key.',
          data: {
            ...existing,
            items: orderItemsRows,
          },
        });
      }

      // Step B: Sort Product IDs Alphabetically to Mitigate Database Deadlocks
      const sortedDeduplicatedItems = [...deduplicatedItems].sort((a, b) => a.productId.localeCompare(b.productId));

      // Step C: Execute Single Database Transaction
      const orderResult = await sql.begin(async transaction => {
        let subtotal = 0;
        const processedItems: Array<{
          productId: string;
          productName: string;
          productCode: string;
          quantity: number;
          pricePerUnit: number;
          totalPrice: number;
          thumbnail?: string;
        }> = [];

        // 1. Atomic Stock Deduction for each sorted product
        for (const item of sortedDeduplicatedItems) {
          // Atomic conditional update preventing negative stock
          const updatedStock = await transaction`
            UPDATE products
            SET stock_pieces = stock_pieces - ${item.quantity},
                updated_at = NOW()
            WHERE id = ${item.productId}
              AND stock_pieces >= ${item.quantity}
            RETURNING id, name, product_code as "productCode", price_per_piece as "pricePerPiece", thumbnail, stock_pieces;
          `;

          if (!updatedStock || updatedStock.length === 0) {
            throw new Error(`INSUFFICIENT_STOCK:${item.productId}`);
          }

          const dbProd = updatedStock[0];
          const pricePerPiece = Number(dbProd.pricePerPiece);
          const itemTotal = pricePerPiece * item.quantity;
          subtotal += itemTotal;

          processedItems.push({
            productId: dbProd.id,
            productName: dbProd.name,
            productCode: dbProd.productCode,
            quantity: item.quantity,
            pricePerUnit: pricePerPiece,
            totalPrice: itemTotal,
            thumbnail: dbProd.thumbnail,
          });
        }

        // 2. Complete Atomic Coupon Validation & Usage Incrementation
        let discountAmount = 0;
        let appliedPromoCode = null;

        if (promoCode && String(promoCode).trim() !== '') {
          const cleanPromoCode = String(promoCode).trim().toUpperCase();
          
          const updatedPromo = await transaction`
            UPDATE promotions
            SET usage_count = usage_count + 1,
                updated_at = NOW()
            WHERE UPPER(code) = ${cleanPromoCode}
              AND is_active = true
              AND (start_date IS NULL OR NOW() >= start_date)
              AND (end_date IS NULL OR NOW() <= end_date)
              AND (min_purchase_amount IS NULL OR ${subtotal} >= min_purchase_amount)
              AND (usage_limit IS NULL OR usage_count < usage_limit)
            RETURNING id, code, discount_percentage as "discountPercentage", discount_amount as "discountAmount", max_discount_amount as "maxDiscountAmount";
          `;

          if (!updatedPromo || updatedPromo.length === 0) {
            throw new Error('COUPON_INVALID_OR_EXHAUSTED');
          }

          const promo = updatedPromo[0];
          appliedPromoCode = promo.code;

          if (Number(promo.discountPercentage) > 0) {
            const calculatedDisc = subtotal * (Number(promo.discountPercentage) / 100);
            const maxDisc = Number(promo.maxDiscountAmount) || Infinity;
            discountAmount = Math.min(calculatedDisc, maxDisc);
          } else if (Number(promo.discountAmount) > 0) {
            discountAmount = Number(promo.discountAmount);
          }
        }

        // 3. Exact Financial Calculation Rules
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const taxAmount = Math.round(taxableAmount * 0.07); // 7% VAT
        const shippingFee = subtotal > 15000 ? 0 : 500;
        const totalAmount = taxableAmount + taxAmount + shippingFee;

        const orderNumber = `SNM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

        // 4. Insert Order Record
        const insertedOrders = await transaction`
          INSERT INTO orders (
            order_number, user_id, status, total_amount, shipping_fee, tax_amount,
            payment_method, shipping_address, recipient_name, recipient_phone,
            tax_invoice_requested, tax_invoice_details, idempotency_key, payload_hash
          ) VALUES (
            ${orderNumber}, ${userId}, 'Pending', ${totalAmount}, ${shippingFee}, ${taxAmount},
            ${paymentMethod}, ${sql.json(shippingAddress)}, ${shippingAddress.recipientName}, ${shippingAddress.phone || ''},
            ${!!taxInvoiceRequested}, ${taxInvoiceDetails ? sql.json(taxInvoiceDetails) : null}, ${idempotencyKey}, ${payloadHash}
          )
          RETURNING id, order_number as "orderNumber", status, total_amount as "totalAmount", shipping_fee as "shippingFee", tax_amount as "taxAmount", created_at as "createdAt";
        `;

        const newOrder = insertedOrders[0];

        // 5. Insert Order Items
        for (const pItem of processedItems) {
          await transaction`
            INSERT INTO order_items (
              order_id, product_id, product_name, product_code, quantity, price_per_unit, total_price
            ) VALUES (
              ${newOrder.id}, ${pItem.productId}, ${pItem.productName}, ${pItem.productCode}, ${pItem.quantity}, ${pItem.pricePerUnit}, ${pItem.totalPrice}
            );
          `;
        }

        return {
          order: newOrder,
          items: processedItems,
          financials: { subtotal, discountAmount, taxableAmount, taxAmount, shippingFee, totalAmount, promoCode: appliedPromoCode },
        };
      });

      await sql.end();

      return res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        data: {
          id: orderResult.order.id,
          orderNumber: orderResult.order.orderNumber,
          userId,
          status: orderResult.order.status,
          totalAmount: orderResult.financials.totalAmount,
          subtotal: orderResult.financials.subtotal,
          discountAmount: orderResult.financials.discountAmount,
          taxAmount: orderResult.financials.taxAmount,
          shippingFee: orderResult.financials.shippingFee,
          paymentMethod,
          shippingAddress,
          items: orderResult.items,
          createdAt: orderResult.order.createdAt,
        },
      });
    } catch (err: any) {
      if (sql) await sql.end().catch(() => {});

      if (err.message?.startsWith('INSUFFICIENT_STOCK:')) {
        const prodId = err.message.split(':')[1];
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ID ${prodId}. Order placement cancelled.`,
        });
      }

      if (err.message === 'COUPON_INVALID_OR_EXHAUSTED') {
        return res.status(400).json({
          success: false,
          message: 'Promo code is invalid, expired, exhausted, or minimum order threshold was not met.',
        });
      }

      // Check PostgreSQL Error 23505 Constraint Violation Specifically
      if (err.code === '23505') {
        if (err.constraint === 'orders_user_id_idempotency_key_key') {
          // Re-query existing order for idempotency
          const sqlRetry = getDbClient();
          if (sqlRetry) {
            try {
              const existingOrders = await sqlRetry`
                SELECT id, order_number as "orderNumber", user_id as "userId", total_amount as "totalAmount", 
                       status, payload_hash as "payloadHash", created_at as "createdAt"
                FROM orders
                WHERE user_id = ${userId} AND idempotency_key = ${idempotencyKey}
                LIMIT 1;
              `;
              await sqlRetry.end();

              if (existingOrders && existingOrders.length > 0) {
                const existing = existingOrders[0];
                if (existing.payloadHash !== payloadHash) {
                  return res.status(409).json({
                    success: false,
                    message: 'Idempotency key reused with mismatched request payload is forbidden.',
                  });
                }
                return res.status(200).json({
                  success: true,
                  message: 'Order retrieved successfully via Idempotency Key.',
                  data: existing,
                });
              }
            } catch {
              if (sqlRetry) await sqlRetry.end().catch(() => {});
            }
          }
        }
      }

      console.error('Error during database order processing transaction:', err);
      return res.status(500).json({
        success: false,
        message: 'Order transaction failed due to a database error.',
      });
    }
  }

  // Memory Fallback strictly for local development mock environment
  const subtotal = deduplicatedItems.reduce((sum, item) => {
    const prod = store.products.find(p => p.id === item.productId);
    return sum + (prod ? prod.pricePerPiece * item.quantity : 0);
  }, 0);

  const shippingFee = subtotal > 15000 ? 0 : 500;
  const taxAmount = Math.round(subtotal * 0.07);
  const totalAmount = subtotal + taxAmount + shippingFee;

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: `SNM-DEV-${Date.now()}`,
    userId,
    status: 'Pending' as const,
    totalAmount,
    shippingFee,
    taxAmount,
    paymentMethod,
    shippingAddress,
    recipientName: shippingAddress.recipientName,
    recipientPhone: shippingAddress.phone || '',
    taxInvoiceRequested: !!taxInvoiceRequested,
    items: deduplicatedItems.map(i => ({
      id: `item-${Date.now()}`,
      productId: i.productId,
      productName: 'Sample Product',
      productCode: 'PROD-CODE',
      quantity: i.quantity,
      pricePerUnit: 100,
      totalPrice: 100 * i.quantity,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return res.status(201).json({
    success: true,
    message: 'Order created successfully (Dev Mode).',
    data: newOrder,
  });
};

export const getUserOrders = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const userId = req.user.id;
  const userOrders = store.orders.filter(o => o.userId === userId);

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

  const isOwner = order.userId === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not have permission to access this order.',
    });
  }

  return res.json({ success: true, data: order });
};
