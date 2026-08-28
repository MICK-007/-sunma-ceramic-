const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host.startsWith('192.168.') || host.startsWith('127.0.')) {
      return `http://${host}:5000/api`;
    }
  }
  return 'https://sunma-ceramic.onrender.com/api';
};

const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('sunma_auth_token') : null;
  const activeToken = token || storedToken;

  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  return headers;
};

async function safeFetch(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, message: errorData.message || `HTTP error ${res.status}`, data: null };
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[API Connection Note] Failed to reach ${url}:`, err?.message || err);
    return { success: false, message: 'Backend service offline or unreachable', data: [] };
  }
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    return safeFetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, fullName?: string, phone?: string) {
    return safeFetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, fullName, phone }),
    });
  },

  async me() {
    return safeFetch(`${getApiBaseUrl()}/auth/me`, {
      headers: getHeaders(),
    });
  },

  // Products
  async getProducts(params?: Record<string, string | number | boolean>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    return safeFetch(`${getApiBaseUrl()}/products?${query.toString()}`);
  },

  async getProductBySlug(slug: string) {
    return safeFetch(`${getApiBaseUrl()}/products/${slug}`);
  },

  async getCategories() {
    return safeFetch(`${getApiBaseUrl()}/categories`);
  },

  async getBrands() {
    return safeFetch(`${getApiBaseUrl()}/brands`);
  },

  // Cart
  async getCart() {
    return safeFetch(`${getApiBaseUrl()}/cart`, {
      headers: getHeaders(),
    });
  },

  async addToCart(productId: string, quantity: number = 1, variantId?: string) {
    return safeFetch(`${getApiBaseUrl()}/cart/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity, variantId }),
    });
  },

  async updateCartItem(itemId: string, quantity: number) {
    return safeFetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
  },

  async removeCartItem(itemId: string) {
    return safeFetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Wishlist
  async getWishlist() {
    return safeFetch(`${getApiBaseUrl()}/wishlist`, {
      headers: getHeaders(),
    });
  },

  async addToWishlist(productId: string) {
    return safeFetch(`${getApiBaseUrl()}/wishlist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId }),
    });
  },

  async removeFromWishlist(productId: string) {
    return safeFetch(`${getApiBaseUrl()}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Orders
  async createOrder(orderData: any) {
    return safeFetch(`${getApiBaseUrl()}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
  },

  async getUserOrders() {
    return safeFetch(`${getApiBaseUrl()}/orders`, {
      headers: getHeaders(),
    });
  },

  // Room Studio
  async getRooms() {
    return safeFetch(`${getApiBaseUrl()}/rooms`);
  },

  async getRoomBySlug(slug: string) {
    return safeFetch(`${getApiBaseUrl()}/rooms/${slug}`);
  },

  // Admin
  async getAdminDashboard() {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/dashboard`, {
      headers: getHeaders(),
    });
    if (res.success && res.data) return res;

    // Fallback Mock Stats for Offline Admin Preview
    return {
      success: true,
      data: {
        totalSales: 1285000,
        totalOrders: 48,
        totalCustomers: 32,
        totalProducts: 10,
        lowStockCount: 2,
        revenueChart: [
          { month: 'Mar', revenue: 140000 },
          { month: 'Apr', revenue: 210000 },
          { month: 'May', revenue: 185000 },
          { month: 'Jun', revenue: 290000 },
          { month: 'Jul', revenue: 320000 },
          { month: 'Aug', revenue: 410000 },
        ],
        recentOrders: [
          { id: 'ord-1', orderNumber: 'SNM-ORD-8821', recipientName: 'Studio Lux Bangkok', paymentMethod: 'Bank Transfer', status: 'Confirmed', totalAmount: 48500 },
          { id: 'ord-2', orderNumber: 'SNM-ORD-8822', recipientName: 'K. Somchai Villa Project', paymentMethod: 'PromptPay', status: 'Pending', totalAmount: 92000 },
        ],
      },
    };
  },

  async getAdminProducts() {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/products`, {
      headers: getHeaders(),
    });
    if (res.success && Array.isArray(res.data) && res.data.length > 0) return res;

    // LocalStorage / Fallback sync for offline products CRUD
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sunma_admin_products') : null;
    if (stored) {
      try {
        return { success: true, data: JSON.parse(stored) };
      } catch (e) {}
    }
    const defaults = [
      { id: 'prod-1', productCode: 'SNM-FL-001', name: 'Calacatta Oro Polished Slab', nameTh: 'กระเบื้องลายหินอ่อน Calacatta Oro ผิวเงา', categoryId: 'cat-1', brandId: 'b-1', brandName: 'Marmi d\'Italia', size: '60x120', pricePerPiece: 850, stockPieces: 320, featured: true, thumbnail: '/images/tiles/calacatta-marble.jpeg' },
      { id: 'prod-2', productCode: 'SNM-FL-002', name: 'Nero Marquina Charcoal Stone', nameTh: 'กระเบื้องหินสีดำ Nero Marquina Charcoal', categoryId: 'cat-1', brandId: 'b-2', brandName: 'SUNMA Atelier', size: '60x60', pricePerPiece: 420, stockPieces: 450, featured: true, thumbnail: '/images/tiles/charcoal-stone-1.jpeg' },
      { id: 'prod-3', productCode: 'SNM-WL-003', name: 'Ivory Travertine Porcelain', nameTh: 'กระเบื้องหินทราเวอร์ทีนสีไอวอรี่ Ivory Travertine', categoryId: 'cat-2', brandId: 'b-3', brandName: 'Iberica Ceramica', size: '30x60', pricePerPiece: 290, stockPieces: 210, featured: true, thumbnail: '/images/tiles/ivory-travertine.jpeg' },
      { id: 'prod-4', productCode: 'SNM-WD-004', name: 'Greige Limestone Porcelain', nameTh: 'กระเบื้องหินไลม์สโตนสีเกรจ Greige Limestone', categoryId: 'cat-5', brandId: 'b-2', brandName: 'SUNMA Atelier', size: '60x60', pricePerPiece: 360, stockPieces: 600, featured: true, thumbnail: '/images/tiles/greige-limestone-1.jpeg' },
      { id: 'prod-5', productCode: 'SNM-OD-005', name: 'Kurokin Dark Charcoal Paver', nameTh: 'กระเบื้องลาน Kurokin Dark Charcoal 20มม.', categoryId: 'cat-4', brandId: 'b-4', brandName: 'Kurokin Surface', size: '60x60', pricePerPiece: 680, stockPieces: 180, featured: true, thumbnail: '/images/tiles/charcoal-stone-2.jpeg' },
      { id: 'prod-6', productCode: 'SNM-BT-006', name: 'Greige Limestone Soft Satin', nameTh: 'กระเบื้องหิน Greige Limestone ผิวซอฟต์ซาติน', categoryId: 'cat-3', brandId: 'b-2', brandName: 'SUNMA Atelier', size: '60x60', pricePerPiece: 390, stockPieces: 400, featured: false, thumbnail: '/images/tiles/greige-limestone-2.jpeg' },
      { id: 'prod-7', productCode: 'SNM-FL-007', name: 'Italian Artisanal Terrazzo', nameTh: 'กระเบื้องเทอร์ราซโซอิตาลี Italian Artisanal', categoryId: 'cat-1', brandId: 'b-2', brandName: 'SUNMA Atelier', size: '60x60', pricePerPiece: 450, stockPieces: 290, featured: false, thumbnail: '/images/tiles/italian-terrazzo.jpeg' },
      { id: 'prod-8', productCode: 'SNM-WD-008', name: 'Sandstone Beige Porcelain Slab', nameTh: 'กระเบื้องหินทรายสีเบจ Sandstone Beige', categoryId: 'cat-5', brandId: 'b-1', brandName: 'Marmi d\'Italia', size: '60x120', pricePerPiece: 920, stockPieces: 150, featured: true, thumbnail: '/images/tiles/sandstone-beige.jpeg' },
      { id: 'prod-9', productCode: 'SNM-WL-009', name: 'Emerald Green Jade Stone', nameTh: 'กระเบื้องหินสีเขียวมรกต Emerald Green Jade', categoryId: 'cat-2', brandId: 'b-3', brandName: 'Iberica Ceramica', size: '30x60', pricePerPiece: 310, stockPieces: 310, featured: false, thumbnail: '/images/tiles/green-stone.jpeg' },
      { id: 'prod-10', productCode: 'SNM-BT-010', name: 'Silver Mist Marble Porcelain', nameTh: 'กระเบื้องหินอ่อนสีเทาเงิน Silver Mist Marble', categoryId: 'cat-3', brandId: 'b-1', brandName: 'Marmi d\'Italia', size: '60x120', pricePerPiece: 890, stockPieces: 260, featured: true, thumbnail: '/images/tiles/silver-mist-marble.jpeg' },
    ];
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunma_admin_products', JSON.stringify(defaults));
    }
    return { success: true, data: defaults };
  },

  async createAdminProduct(productData: any) {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (res.success) return res;

    // Offline LocalStorage create fallback
    const listRes = await this.getAdminProducts();
    const currentList = listRes.data || [];
    const newProd = {
      id: `prod-${Date.now()}`,
      productCode: productData.productCode || `SNM-PROD-${Date.now().toString().slice(-4)}`,
      name: productData.name,
      nameTh: productData.nameTh || productData.name,
      categoryId: productData.categoryId || 'cat-1',
      brandId: productData.brandId || 'b-1',
      brandName: 'SUNMA Atelier',
      size: productData.size || '60x60',
      pricePerPiece: Number(productData.pricePerPiece) || 450,
      stockPieces: Number(productData.stockPieces) || 200,
      featured: !!productData.featured,
      thumbnail: productData.thumbnail || '/images/tiles/calacatta-marble.jpeg',
    };
    const updated = [newProd, ...currentList];
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunma_admin_products', JSON.stringify(updated));
    }
    return { success: true, message: 'Product created successfully.', data: newProd };
  },

  async updateAdminProduct(id: string, productData: any) {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/products/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (res.success) return res;

    // Offline LocalStorage update fallback
    const listRes = await this.getAdminProducts();
    const currentList: any[] = listRes.data || [];
    const idx = currentList.findIndex(p => p.id === id);
    if (idx !== -1) {
      currentList[idx] = { ...currentList[idx], ...productData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sunma_admin_products', JSON.stringify(currentList));
      }
    }
    return { success: true, message: 'Product updated.' };
  },

  async deleteAdminProduct(id: string) {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.success) return res;

    // Offline LocalStorage delete fallback
    const listRes = await this.getAdminProducts();
    const currentList: any[] = listRes.data || [];
    const filtered = currentList.filter(p => p.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunma_admin_products', JSON.stringify(filtered));
    }
    return { success: true, message: 'Product deleted.' };
  },

  async createAdminCategory(categoryData: any) {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    if (res.success) return res;

    // Offline LocalStorage create category fallback
    const catsRes = await this.getCategories();
    const currentCats: any[] = catsRes.data || [];
    const newCat = {
      id: `cat-${Date.now()}`,
      name: categoryData.name,
      nameTh: categoryData.nameTh || categoryData.name,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryData.description || '',
      descriptionTh: categoryData.descriptionTh || '',
      image: categoryData.image || '/images/tiles/calacatta-marble.jpeg',
    };
    const updated = [...currentCats, newCat];
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunma_admin_categories', JSON.stringify(updated));
    }
    return { success: true, message: 'Category created.', data: newCat };
  },

  async updateAdminCategory(id: string, categoryData: any) {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/categories/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    if (res.success) return res;

    const catsRes = await this.getCategories();
    const currentCats: any[] = catsRes.data || [];
    const idx = currentCats.findIndex(c => c.id === id);
    if (idx !== -1) {
      currentCats[idx] = { ...currentCats[idx], ...categoryData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sunma_admin_categories', JSON.stringify(currentCats));
      }
    }
    return { success: true, message: 'Category updated.' };
  },

  async deleteAdminCategory(id: string) {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.success) return res;

    const catsRes = await this.getCategories();
    const currentCats: any[] = catsRes.data || [];
    const filtered = currentCats.filter(c => c.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sunma_admin_categories', JSON.stringify(filtered));
    }
    return { success: true, message: 'Category deleted.' };
  },

  async getAdminOrders() {
    return safeFetch(`${getApiBaseUrl()}/admin/orders`, {
      headers: getHeaders(),
    });
  },

  async updateAdminOrderStatus(id: string, status: string) {
    return safeFetch(`${getApiBaseUrl()}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  async getAdminCustomers() {
    return safeFetch(`${getApiBaseUrl()}/admin/customers`, {
      headers: getHeaders(),
    });
  },

  async getAdminInventory() {
    return safeFetch(`${getApiBaseUrl()}/admin/inventory`, {
      headers: getHeaders(),
    });
  },

  async getAdminPromotions() {
    return safeFetch(`${getApiBaseUrl()}/admin/promotions`, {
      headers: getHeaders(),
    });
  },

  async createAdminPromotion(promoData: any) {
    return safeFetch(`${getApiBaseUrl()}/admin/promotions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promoData),
    });
  },
};
