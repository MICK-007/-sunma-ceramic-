import { Request, Response } from 'express';
import { store } from '../repositories/store';
import { Product, Category, Brand, OrderStatus, Promotion } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';
import { logSecurityEvent } from '../utils/logger';

export const getDashboardStats = (req: Request, res: Response) => {
  const totalSales = store.orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = store.orders.length;
  const totalCustomers = store.users.filter(u => u.role === 'USER').length;
  const totalProducts = store.products.length;
  const lowStockCount = store.products.filter(p => p.stockPieces < 200).length;

  const recentOrders = store.orders.slice(0, 5);
  const bestSellers = store.products.filter(p => p.featured).slice(0, 4);

  return res.json({
    success: true,
    data: {
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      recentOrders,
      bestSellers,
      revenueChart: [
        { month: 'Jan', revenue: 145000 },
        { month: 'Feb', revenue: 210000 },
        { month: 'Mar', revenue: 180000 },
        { month: 'Apr', revenue: 260000 },
        { month: 'May', revenue: 320000 },
        { month: 'Jun', revenue: 290000 },
        { month: 'Jul', revenue: 410000 },
        { month: 'Aug', revenue: totalSales || 480000 },
      ],
    },
  });
};

// Admin Products CRUD
export const getAdminProducts = (req: Request, res: Response) => {
  return res.json({ success: true, data: store.products });
};

export const createAdminProduct = (req: Request, res: Response) => {
  // Explicit Field Destructuring (Mass Assignment Prevention)
  const {
    name, nameTh, productCode, slug, description, descriptionTh, shortDescription, shortDescriptionTh,
    categoryId, brandId, thumbnail, images, size, width, height, thickness, material, surface, color,
    pattern, indoorOutdoor, countryOfOrigin, piecesPerBox, coveragePerBox, weightPerBox, pricePerPiece,
    pricePerBox, stockPieces, status, featured
  } = req.body;

  if (!name || !productCode || !categoryId || !pricePerPiece) {
    return res.status(400).json({ success: false, message: 'Missing required product parameters.' });
  }

  const category = store.categories.find(c => c.id === categoryId);
  const brand = store.brands.find(b => b.id === brandId);

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    productCode,
    name,
    nameTh: nameTh || name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    descriptionTh: descriptionTh || '',
    shortDescription: shortDescription || '',
    shortDescriptionTh: shortDescriptionTh || '',
    categoryId,
    categoryName: category?.name || 'General',
    brandId,
    brandName: brand?.name || 'SUNMA Atelier',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80',
    images: images || ['https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80'],
    size: size || '60x60',
    width: width || 60,
    height: height || 60,
    thickness: thickness || 10,
    material: material || 'Porcelain',
    surface: surface || 'Matt',
    color: color || 'Stone',
    pattern: pattern || 'Marble',
    indoorOutdoor: indoorOutdoor || 'Indoor',
    countryOfOrigin: countryOfOrigin || 'Thailand',
    piecesPerBox: Number(piecesPerBox) || 4,
    coveragePerBox: Number(coveragePerBox) || 1.44,
    weightPerBox: Number(weightPerBox) || 30.0,
    pricePerPiece: Number(pricePerPiece),
    pricePerBox: Number(pricePerBox) || Number(pricePerPiece) * (Number(piecesPerBox) || 4),
    stockPieces: Number(stockPieces) || 100,
    minimumOrderQuantity: 1,
    status: status || 'PUBLISHED',
    featured: !!featured,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.products.unshift(newProduct);
  logSecurityEvent('ADMIN_PRODUCT_CREATE', (req as AuthenticatedRequest).user?.id || null, req, { productId: newProduct.id, productCode: newProduct.productCode });
  return res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
};

export const updateAdminProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const existing = store.products[index];
  const {
    name, nameTh, productCode, slug, description, descriptionTh, shortDescription, shortDescriptionTh,
    categoryId, brandId, thumbnail, images, size, width, height, thickness, material, surface, color,
    pattern, indoorOutdoor, countryOfOrigin, piecesPerBox, coveragePerBox, weightPerBox, pricePerPiece,
    pricePerBox, stockPieces, status, featured
  } = req.body;

  const category = categoryId ? store.categories.find(c => c.id === categoryId) : null;
  const brand = brandId ? store.brands.find(b => b.id === brandId) : null;

  const updatedProduct: Product = {
    ...existing,
    name: name !== undefined ? name : existing.name,
    nameTh: nameTh !== undefined ? nameTh : existing.nameTh,
    productCode: productCode !== undefined ? productCode : existing.productCode,
    slug: slug !== undefined ? slug : existing.slug,
    description: description !== undefined ? description : existing.description,
    descriptionTh: descriptionTh !== undefined ? descriptionTh : existing.descriptionTh,
    shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
    shortDescriptionTh: shortDescriptionTh !== undefined ? shortDescriptionTh : existing.shortDescriptionTh,
    categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
    categoryName: category ? category.name : existing.categoryName,
    brandId: brandId !== undefined ? brandId : existing.brandId,
    brandName: brand ? brand.name : existing.brandName,
    thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
    images: images !== undefined ? images : existing.images,
    size: size !== undefined ? size : existing.size,
    width: width !== undefined ? Number(width) : existing.width,
    height: height !== undefined ? Number(height) : existing.height,
    thickness: thickness !== undefined ? Number(thickness) : existing.thickness,
    material: material !== undefined ? material : existing.material,
    surface: surface !== undefined ? surface : existing.surface,
    color: color !== undefined ? color : existing.color,
    pattern: pattern !== undefined ? pattern : existing.pattern,
    indoorOutdoor: indoorOutdoor !== undefined ? indoorOutdoor : existing.indoorOutdoor,
    countryOfOrigin: countryOfOrigin !== undefined ? countryOfOrigin : existing.countryOfOrigin,
    piecesPerBox: piecesPerBox !== undefined ? Number(piecesPerBox) : existing.piecesPerBox,
    coveragePerBox: coveragePerBox !== undefined ? Number(coveragePerBox) : existing.coveragePerBox,
    weightPerBox: weightPerBox !== undefined ? Number(weightPerBox) : existing.weightPerBox,
    pricePerPiece: pricePerPiece !== undefined ? Number(pricePerPiece) : existing.pricePerPiece,
    pricePerBox: pricePerBox !== undefined ? Number(pricePerBox) : existing.pricePerBox,
    stockPieces: stockPieces !== undefined ? Number(stockPieces) : existing.stockPieces,
    status: status !== undefined ? status : existing.status,
    featured: featured !== undefined ? !!featured : existing.featured,
    updatedAt: new Date().toISOString(),
  };

  store.products[index] = updatedProduct;
  logSecurityEvent('ADMIN_PRODUCT_UPDATE', (req as AuthenticatedRequest).user?.id || null, req, { productId: id });
  return res.json({ success: true, message: 'Product updated successfully.', data: updatedProduct });
};

export const deleteAdminProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  store.products = store.products.filter(p => p.id !== id);
  logSecurityEvent('ADMIN_PRODUCT_DELETE', (req as AuthenticatedRequest).user?.id || null, req, { productId: id });
  return res.json({ success: true, message: 'Product deleted.' });
};

// Admin Orders
export const getAdminOrders = (req: Request, res: Response) => {
  return res.json({ success: true, data: store.orders });
};

export const updateOrderStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  const order = store.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  logSecurityEvent('ADMIN_ORDER_STATUS_UPDATE', (req as AuthenticatedRequest).user?.id || null, req, { orderId: id, newStatus: status });

  return res.json({ success: true, message: `Order status updated to ${status}.`, data: order });
};

// Admin Customers
export const getAdminCustomers = (req: Request, res: Response) => {
  const customers = store.users.map(u => {
    const userOrders = store.orders.filter(o => o.userId === u.id || o.userEmail === u.email);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      ordersCount: userOrders.length,
      totalSpent,
      createdAt: u.createdAt,
    };
  });
  return res.json({ success: true, data: customers });
};

// Admin Inventory
export const getAdminInventory = (req: Request, res: Response) => {
  const inventory = store.products.map(p => ({
    id: p.id,
    productCode: p.productCode,
    name: p.name,
    stockPieces: p.stockPieces,
    piecesPerBox: p.piecesPerBox,
    calculatedBoxes: (p.stockPieces / p.piecesPerBox).toFixed(1),
    isLowStock: p.stockPieces < 200,
    pricePerPiece: p.pricePerPiece,
    pricePerBox: p.pricePerBox,
  }));
  return res.json({ success: true, data: inventory });
};

// Admin Promotions
export const getAdminPromotions = (req: Request, res: Response) => {
  return res.json({ success: true, data: store.promotions });
};

export const createAdminPromotion = (req: Request, res: Response) => {
  const { code, title, description, discountPercentage, discountAmount, minPurchaseAmount, maxDiscountAmount, startDate, endDate, isActive, minQuantity, categoryIds } = req.body;

  const newPromo: Promotion = {
    id: `promo-${Date.now()}`,
    code: code || `PROMO-${Date.now()}`,
    name: title || 'Promotion',
    title: title || 'Special Offer',
    description: description || '',
    discountPercentage: Number(discountPercentage) || 0,
    discountAmount: Number(discountAmount) || 0,
    minPurchaseAmount: Number(minPurchaseAmount) || 0,
    maxDiscountAmount: Number(maxDiscountAmount) || 0,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: isActive !== undefined ? !!isActive : true,
    minQuantity: Number(minQuantity) || 1,
    categoryIds: categoryIds || [],
  };

  store.promotions.push(newPromo);
  return res.status(201).json({ success: true, message: 'Promotion created.', data: newPromo });
};

export const updateAdminPromotion = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.promotions.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Promotion not found.' });
  }

  const existing = store.promotions[index];
  const { code, title, description, discountPercentage, discountAmount, minPurchaseAmount, maxDiscountAmount, startDate, endDate, isActive, minQuantity, categoryIds } = req.body;

  store.promotions[index] = {
    ...existing,
    code: code !== undefined ? code : existing.code,
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    discountPercentage: discountPercentage !== undefined ? Number(discountPercentage) : existing.discountPercentage,
    discountAmount: discountAmount !== undefined ? Number(discountAmount) : existing.discountAmount,
    minPurchaseAmount: minPurchaseAmount !== undefined ? Number(minPurchaseAmount) : existing.minPurchaseAmount,
    maxDiscountAmount: maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : existing.maxDiscountAmount,
    startDate: startDate !== undefined ? startDate : existing.startDate,
    endDate: endDate !== undefined ? endDate : existing.endDate,
    isActive: isActive !== undefined ? !!isActive : existing.isActive,
    minQuantity: minQuantity !== undefined ? Number(minQuantity) : existing.minQuantity,
    categoryIds: categoryIds !== undefined ? categoryIds : existing.categoryIds,
  };

  return res.json({ success: true, message: 'Promotion updated.', data: store.promotions[index] });
};

// Category & Brand Admin CRUD
export const createAdminCategory = (req: Request, res: Response) => {
  const { name, nameTh, slug, description, descriptionTh, image, sortOrder } = req.body;
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    nameTh: nameTh || name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    descriptionTh: descriptionTh || '',
    image: image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    sortOrder: sortOrder || store.categories.length + 1,
    isActive: true,
  };
  store.categories.push(newCat);
  return res.status(201).json({ success: true, data: newCat });
};

export const updateAdminCategory = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.categories.findIndex(c => c.id === id || c.slug === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const existing = store.categories[index];
  const { name, nameTh, slug, description, descriptionTh, image, sortOrder, isActive } = req.body;

  const updatedCat: Category = {
    ...existing,
    name: name !== undefined ? name : existing.name,
    nameTh: nameTh !== undefined ? nameTh : existing.nameTh,
    slug: slug !== undefined ? slug : existing.slug,
    description: description !== undefined ? description : existing.description,
    descriptionTh: descriptionTh !== undefined ? descriptionTh : existing.descriptionTh,
    image: image !== undefined ? image : existing.image,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
  };

  store.categories[index] = updatedCat;
  return res.json({ success: true, data: updatedCat });
};

export const deleteAdminCategory = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.categories.findIndex(c => c.id === id || c.slug === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  store.categories.splice(index, 1);
  return res.json({ success: true, message: 'Category deleted successfully.' });
};

export const createAdminBrand = (req: Request, res: Response) => {
  const { name, slug, description, country, logo } = req.body;
  const newBrand: Brand = {
    id: `brand-${Date.now()}`,
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    country: country || 'Thailand',
    logo: logo || name,
    isActive: true,
  };
  store.brands.push(newBrand);
  return res.status(201).json({ success: true, data: newBrand });
};
