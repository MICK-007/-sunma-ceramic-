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

// Helper: Read CSRF cookie for Double Submit CSRF header attachment
function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )sunma_csrf=([^;]+)'));
  return match ? match[2] : '';
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
};

// Single-Flight Refresh Lock to prevent concurrent refresh storms across tabs/requests
let singleFlightRefreshPromise: Promise<any> | null = null;

async function safeFetch(url: string, options: RequestInit = {}, isRetry: boolean = false): Promise<any> {
  const mergedOptions: RequestInit = {
    ...options,
    credentials: 'include', // Mandate HttpOnly cookies cross-origin
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, mergedOptions);

    // 401 Unauthorized handling with Single-Flight Token Refresh Interceptor
    if (res.status === 401 && !isRetry && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !url.includes('/auth/register')) {
      if (!singleFlightRefreshPromise) {
        singleFlightRefreshPromise = api.refresh().finally(() => {
          singleFlightRefreshPromise = null;
        });
      }

      const refreshRes = await singleFlightRefreshPromise;
      if (refreshRes && refreshRes.success) {
        // Retry original request ONCE with new HttpOnly cookies
        return safeFetch(url, options, true);
      }
    }

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
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, fullName?: string, phone?: string, username?: string) {
    return safeFetch(`${getApiBaseUrl()}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone, username }),
    });
  },

  async refresh() {
    return safeFetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: 'POST',
    });
  },

  async me() {
    return safeFetch(`${getApiBaseUrl()}/auth/me`, {
      method: 'GET',
    });
  },

  async logout() {
    return safeFetch(`${getApiBaseUrl()}/auth/logout`, {
      method: 'POST',
    });
  },

  // Products
  async getProducts(params?: Record<string, string | number | boolean>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    return safeFetch(`${getApiBaseUrl()}/products${qStr ? `?${qStr}` : ''}`);
  },

  async getProductBySlug(slug: string) {
    return safeFetch(`${getApiBaseUrl()}/products/slug/${slug}`);
  },

  async getProductById(id: string) {
    return safeFetch(`${getApiBaseUrl()}/products/${id}`);
  },

  async createProduct(data: any) {
    return safeFetch(`${getApiBaseUrl()}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return safeFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories & Brands
  async getCategories() {
    return safeFetch(`${getApiBaseUrl()}/categories`);
  },

  async createCategory(data: any) {
    return safeFetch(`${getApiBaseUrl()}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string) {
    return safeFetch(`${getApiBaseUrl()}/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async getBrands() {
    return safeFetch(`${getApiBaseUrl()}/brands`);
  },

  // Cart
  async getCart() {
    return safeFetch(`${getApiBaseUrl()}/cart`);
  },

  async addToCart(productId: string, quantity: number = 1, options?: { areaSqMeters?: number; boxesRequired?: number; wasteMarginPercent?: number }) {
    return safeFetch(`${getApiBaseUrl()}/cart/items`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, ...options }),
    });
  },

  async updateCartItem(itemId: string, quantity: number, options?: { areaSqMeters?: number; boxesRequired?: number; wasteMarginPercent?: number }) {
    return safeFetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, ...options }),
    });
  },

  async removeFromCart(itemId: string) {
    return safeFetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return safeFetch(`${getApiBaseUrl()}/cart`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders() {
    return safeFetch(`${getApiBaseUrl()}/orders`);
  },

  async getUserOrders() {
    return safeFetch(`${getApiBaseUrl()}/orders`);
  },

  async getOrderById(id: string) {
    return safeFetch(`${getApiBaseUrl()}/orders/${id}`);
  },

  async createOrder(data: any) {
    return safeFetch(`${getApiBaseUrl()}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(id: string, status: string) {
    return safeFetch(`${getApiBaseUrl()}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Wishlist
  async getWishlist() {
    return safeFetch(`${getApiBaseUrl()}/wishlist`);
  },

  async addToWishlist(productId: string) {
    return safeFetch(`${getApiBaseUrl()}/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async removeFromWishlist(productId: string) {
    return safeFetch(`${getApiBaseUrl()}/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  // Promotions
  async getPromotions() {
    return safeFetch(`${getApiBaseUrl()}/promotions`);
  },

  async validatePromoCode(code: string, cartTotal: number) {
    return safeFetch(`${getApiBaseUrl()}/promotions/validate`, {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal }),
    });
  },

  async createPromotion(data: any) {
    return safeFetch(`${getApiBaseUrl()}/promotions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePromotion(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePromotion(id: string) {
    return safeFetch(`${getApiBaseUrl()}/promotions/${id}`, {
      method: 'DELETE',
    });
  },

  // Room Studio
  async getRooms() {
    return safeFetch(`${getApiBaseUrl()}/rooms`);
  },

  async getRoomBySlug(slug: string) {
    return safeFetch(`${getApiBaseUrl()}/rooms/${slug}`);
  },

  // Admin Dashboard
  async getAdminStats() {
    return safeFetch(`${getApiBaseUrl()}/admin/stats`);
  },

  async getAdminCustomers() {
    return safeFetch(`${getApiBaseUrl()}/admin/customers`);
  },

  async getAdminOrders() {
    return safeFetch(`${getApiBaseUrl()}/orders`);
  },

  async createAdminCategory(data: any) {
    return safeFetch(`${getApiBaseUrl()}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAdminCategory(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminCategory(id: string) {
    return safeFetch(`${getApiBaseUrl()}/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async createAdminProduct(data: any) {
    return safeFetch(`${getApiBaseUrl()}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAdminProduct(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminProduct(id: string) {
    return safeFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminPromotions() {
    return safeFetch(`${getApiBaseUrl()}/promotions`);
  },

  async createAdminPromotion(data: any) {
    return safeFetch(`${getApiBaseUrl()}/promotions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAdminPromotion(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAdminPromotion(id: string) {
    return safeFetch(`${getApiBaseUrl()}/promotions/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminInventory() {
    return safeFetch(`${getApiBaseUrl()}/products`);
  },

  async updateAdminInventory(id: string, data: any) {
    return safeFetch(`${getApiBaseUrl()}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateAdminOrderStatus(id: string, status: string) {
    return safeFetch(`${getApiBaseUrl()}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminDashboard() {
    return safeFetch(`${getApiBaseUrl()}/admin/stats`);
  },

  async getAdminProducts() {
    return safeFetch(`${getApiBaseUrl()}/products`);
  },

  async removeCartItem(itemId: string) {
    return safeFetch(`${getApiBaseUrl()}/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },
};
