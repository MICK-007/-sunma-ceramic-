const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:5000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(email: string, password: string, fullName?: string, phone?: string) {
    const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, fullName, phone }),
    });
    return res.json();
  },

  async me() {
    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
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
    const res = await fetch(`${getApiBaseUrl()}/products?${query.toString()}`);
    return res.json();
  },

  async getProductBySlug(slug: string) {
    const res = await fetch(`${getApiBaseUrl()}/products/${slug}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${getApiBaseUrl()}/categories`);
    return res.json();
  },

  async getBrands() {
    const res = await fetch(`${getApiBaseUrl()}/brands`);
    return res.json();
  },

  // Cart
  async getCart() {
    const res = await fetch(`${getApiBaseUrl()}/cart`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addToCart(productId: string, quantity: number = 1, variantId?: string) {
    const res = await fetch(`${getApiBaseUrl()}/cart/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity, variantId }),
    });
    return res.json();
  },

  async updateCartItem(itemId: string, quantity: number) {
    const res = await fetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  async removeCartItem(itemId: string) {
    const res = await fetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${getApiBaseUrl()}/wishlist`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async addToWishlist(productId: string) {
    const res = await fetch(`${getApiBaseUrl()}/wishlist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  async removeFromWishlist(productId: string) {
    const res = await fetch(`${getApiBaseUrl()}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Orders
  async createOrder(orderData: any) {
    const res = await fetch(`${getApiBaseUrl()}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  async getUserOrders() {
    const res = await fetch(`${getApiBaseUrl()}/orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Room Studio
  async getRooms() {
    const res = await fetch(`${getApiBaseUrl()}/rooms`);
    return res.json();
  },

  async getRoomBySlug(slug: string) {
    const res = await fetch(`${getApiBaseUrl()}/rooms/${slug}`);
    return res.json();
  },

  // Admin
  async getAdminDashboard() {
    const res = await fetch(`${getApiBaseUrl()}/admin/dashboard`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminProducts() {
    const res = await fetch(`${getApiBaseUrl()}/admin/products`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createAdminProduct(productData: any) {
    const res = await fetch(`${getApiBaseUrl()}/admin/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async updateAdminProduct(id: string, productData: any) {
    const res = await fetch(`${getApiBaseUrl()}/admin/products/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return res.json();
  },

  async deleteAdminProduct(id: string) {
    const res = await fetch(`${getApiBaseUrl()}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminOrders() {
    const res = await fetch(`${getApiBaseUrl()}/admin/orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateAdminOrderStatus(id: string, status: string) {
    const res = await fetch(`${getApiBaseUrl()}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminCustomers() {
    const res = await fetch(`${getApiBaseUrl()}/admin/customers`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminInventory() {
    const res = await fetch(`${getApiBaseUrl()}/admin/inventory`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminPromotions() {
    const res = await fetch(`${getApiBaseUrl()}/admin/promotions`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async createAdminPromotion(promoData: any) {
    const res = await fetch(`${getApiBaseUrl()}/admin/promotions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promoData),
    });
    return res.json();
  },
};
