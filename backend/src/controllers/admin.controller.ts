import { Request, Response } from 'express';
import { store } from '../repositories/store';
import { Product, Category, Brand, OrderStatus, Promotion } from '../types';

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
  const data = req.body;
  if (!data.name || !data.productCode || !data.categoryId || !data.pricePerPiece) {
    return res.status(400).json({ success: false, message: 'Missing required product parameters.' });
  }

  const category = store.categories.find(c => c.id === data.categoryId);
  const brand = store.brands.find(b => b.id === data.brandId);

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    productCode: data.productCode,
    name: data.name,
    nameTh: data.nameTh || data.name,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description || '',
    descriptionTh: data.descriptionTh || '',
    shortDescription: data.shortDescription || '',
    shortDescriptionTh: data.shortDescriptionTh || '',
    categoryId: data.categoryId,
    categoryName: category?.name || 'General',
    brandId: data.brandId,
    brandName: brand?.name || 'SUNMA Atelier',
    thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80',
    images: data.images || ['https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80'],
    size: data.size || '60x60',
    width: data.width || 60,
    height: data.height || 60,
    thickness: data.thickness || 10,
    material: data.material || 'Porcelain',
    surface: data.surface || 'Matt',
    color: data.color || 'Stone',
    pattern: data.pattern || 'Marble',
    indoorOutdoor: data.indoorOutdoor || 'Indoor',
    countryOfOrigin: data.countryOfOrigin || 'Thailand',
    piecesPerBox: Number(data.piecesPerBox) || 4,
    coveragePerBox: Number(data.coveragePerBox) || 1.44,
    weightPerBox: Number(data.weightPerBox) || 30.0,
    pricePerPiece: Number(data.pricePerPiece),
    pricePerBox: Number(data.pricePerBox) || Number(data.pricePerPiece) * (Number(data.piecesPerBox) || 4),
    stockPieces: Number(data.stockPieces) || 100,
    minimumOrderQuantity: 1,
    status: data.status || 'PUBLISHED',
    featured: !!data.featured,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.products.unshift(newProduct);
  return res.status(201).json({ success: true, message: 'Product created successfully.', data: newProduct });
};

export const updateAdminProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const existing = store.products[index];
  const updatedProduct: Product = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  store.products[index] = updatedProduct;
  return res.json({ success: true, message: 'Product updated successfully.', data: updatedProduct });
};

export const deleteAdminProduct = (req: Request, res: Response) => {
  const { id } = req.params;
  store.products = store.products.filter(p => p.id !== id);
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

  return res.json({ success: true, message: `Order status updated to ${status}.`, data: order });
};

// Admin Customers
export const getAdminCustomers = (req: Request, res: Response) => {
  const customers = store.users.map(u => {
    const userOrders = store.orders.filter(o => o.userId === u.id || o.userEmail === u.email);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      ...u,
      ordersCount: userOrders.length,
      totalSpent,
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
  const { name, discountPercentage, startDate, endDate, isActive, minQuantity, categoryIds } = req.body;

  const newPromo: Promotion = {
    id: `promo-${Date.now()}`,
    name,
    discountPercentage: Number(discountPercentage),
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

  store.promotions[index] = {
    ...store.promotions[index],
    ...req.body,
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
