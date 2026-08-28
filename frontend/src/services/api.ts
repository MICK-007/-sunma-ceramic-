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
    return safeFetch(`${getApiBaseUrl()}/admin/dashboard`, {
      headers: getHeaders(),
    });
  },

  async getAdminProducts() {
    return safeFetch(`${getApiBaseUrl()}/admin/products`, {
      headers: getHeaders(),
    });
  },

  async createAdminProduct(productData: any) {
    return safeFetch(`${getApiBaseUrl()}/admin/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
  },

  async updateAdminProduct(id: string, productData: any) {
    return safeFetch(`${getApiBaseUrl()}/admin/products/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
  },

  async deleteAdminProduct(id: string) {
    return safeFetch(`${getApiBaseUrl()}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
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
