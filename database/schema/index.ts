import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);
export const productStatusEnum = pgEnum('product_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const orderStatusEnum = pgEnum('order_status', ['Pending', 'Confirmed', 'Preparing', 'Cancelled']);
export const areaTypeEnum = pgEnum('area_type', ['Floor', 'Wall', 'Backsplash']);

// Profiles Table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  supabaseAuthId: varchar('supabase_auth_id', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).unique(),
  passwordHash: text('password_hash'),
  fullName: varchar('full_name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  role: userRoleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Addresses Table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  addressLine: text('address_line').notNull(),
  subdistrict: varchar('subdistrict', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  nameTh: varchar('name_th', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  descriptionTh: text('description_th'),
  image: text('image'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Brands Table
export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  country: varchar('country', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Collections Table
export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  productCode: varchar('product_code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameTh: varchar('name_th', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  descriptionTh: text('description_th'),
  shortDescription: text('short_description'),
  shortDescriptionTh: text('short_description_th'),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  collectionId: uuid('collection_id').references(() => collections.id, { onDelete: 'set null' }),
  thumbnail: text('thumbnail'),
  size: varchar('size', { length: 50 }).notNull(), // e.g. "60x60", "60x120", "30x60"
  width: numeric('width', { precision: 8, scale: 2 }), // in cm
  height: numeric('height', { precision: 8, scale: 2 }), // in cm
  thickness: numeric('thickness', { precision: 6, scale: 2 }), // in mm
  material: varchar('material', { length: 100 }), // Porcelain, Ceramic, Granite, etc.
  surface: varchar('surface', { length: 100 }), // Matt, Glossy, Polished, Carved, Satin
  color: varchar('color', { length: 100 }),
  pattern: varchar('pattern', { length: 100 }), // Marble, Concrete, Wood, Terrazzo, Stone
  indoorOutdoor: varchar('indoor_outdoor', { length: 50 }).default('Indoor/Outdoor'),
  countryOfOrigin: varchar('country_of_origin', { length: 100 }),
  piecesPerBox: integer('pieces_per_box').default(4).notNull(),
  coveragePerBox: numeric('coverage_per_box', { precision: 8, scale: 2 }), // in sq.m
  weightPerBox: numeric('weight_per_box', { precision: 8, scale: 2 }), // in kg
  pricePerPiece: numeric('price_per_piece', { precision: 10, scale: 2 }).notNull(),
  pricePerBox: numeric('price_per_box', { precision: 10, scale: 2 }).notNull(),
  stockPieces: integer('stock_pieces').default(0).notNull(),
  minimumOrderQuantity: integer('minimum_order_quantity').default(1).notNull(),
  status: productStatusEnum('status').default('PUBLISHED').notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product Images Table
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

// Product Variants Table
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  size: varchar('size', { length: 50 }).notNull(),
  pricePerPiece: numeric('price_per_piece', { precision: 10, scale: 2 }).notNull(),
  pricePerBox: numeric('price_per_box', { precision: 10, scale: 2 }).notNull(),
  stockPieces: integer('stock_pieces').default(0).notNull(),
  piecesPerBox: integer('pieces_per_box').default(4).notNull(),
  coveragePerBox: numeric('coverage_per_box', { precision: 8, scale: 2 }),
  weightPerBox: numeric('weight_per_box', { precision: 8, scale: 2 }),
});

// Carts Table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 255 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cart Items Table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1), // in pieces
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
});

// Wishlists Table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Wishlist Items Table
export const wishlistItems = pgTable('wishlist_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  wishlistId: uuid('wishlist_id').references(() => wishlists.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').default('Pending').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  shippingFee: numeric('shipping_fee', { precision: 10, scale: 2 }).default('0.00').notNull(),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // 'Bank Transfer', 'PromptPay QR', 'Credit Card'
  shippingAddress: jsonb('shipping_address').notNull(),
  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  recipientPhone: varchar('recipient_phone', { length: 50 }).notNull(),
  taxInvoiceRequested: boolean('tax_invoice_requested').default(false).notNull(),
  taxInvoiceDetails: jsonb('tax_invoice_details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order Items Table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productCode: varchar('product_code', { length: 100 }).notNull(),
  variantInfo: varchar('variant_info', { length: 255 }),
  quantity: integer('quantity').notNull(),
  pricePerUnit: numeric('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
});

// Promotions Table
export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  discountPercentage: numeric('discount_percentage', { precision: 5, scale: 2 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  minQuantity: integer('min_quantity').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Promotion Products Junction
export const promotionProducts = pgTable('promotion_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  promotionId: uuid('promotion_id').references(() => promotions.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
});

// Promotion Categories Junction
export const promotionCategories = pgTable('promotion_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  promotionId: uuid('promotion_id').references(() => promotions.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }).notNull(),
});

// Tax Invoice Requests Table
export const taxInvoiceRequests = pgTable('tax_invoice_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  taxId: varchar('tax_id', { length: 50 }).notNull(),
  branch: varchar('branch', { length: 100 }).default('Head Office'),
  address: text('address').notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Rooms Table for Room Studio
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  nameTh: varchar('name_th', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  imageUrl: text('image_url').notNull(),
  description: text('description'),
});

// Room Areas Table
export const roomAreas = pgTable('room_areas', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  areaType: areaTypeEnum('area_type').notNull(),
  maskSvgPolygon: text('mask_svg_polygon').notNull(), // SVG polygon coordinates string e.g. "0,700 1200,700 1200,900 0,900"
  defaultTileAspectRatio: varchar('default_tile_aspect_ratio', { length: 50 }).default('1:1'),
});

// Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  jti: uuid('jti').notNull().unique(),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
});

// Security Audit Events Table
export const securityEvents = pgTable('security_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
