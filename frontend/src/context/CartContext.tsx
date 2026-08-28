'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

export interface CartItem {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  totalItemsCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number, productData?: any) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getCart();
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (e) {
      console.error('Error loading cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1, productData?: any) => {
    // BUSINESS RULE REQUIREMENT 23: Unauthenticated users must be redirected to login
    if (!user) {
      router.push(`/login?redirect=/products/${productData?.slug || ''}&notice=cart`);
      return {
        success: false,
        message: 'Redirecting to login. Authentication required to add items to cart.',
      };
    }

    try {
      const res = await api.addToCart(productId, quantity);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
        return { success: true, message: 'Item added to cart.' };
      }
      return { success: false, message: res.message || 'Failed to add item.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (e) {
      console.error('Failed to update cart item:', e);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (e) {
      console.error('Failed to remove cart item:', e);
    }
  };

  const clearCart = async () => {
    setItems([]);
    setSubtotal(0);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        totalItemsCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
