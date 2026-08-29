'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface WishlistContextType {
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  // Load Wishlist on mount or when user session changes
  useEffect(() => {
    if (user) {
      api
        .getWishlist()
        .then(res => {
          if (res.success && Array.isArray(res.productIds)) {
            setWishlistProductIds(res.productIds);
          }
        })
        .catch(err => console.error('Error fetching user wishlist:', err));
    } else {
      // Read guest wishlist from localStorage
      try {
        const saved = localStorage.getItem('sunma_guest_wishlist');
        if (saved) {
          setWishlistProductIds(JSON.parse(saved));
        } else {
          setWishlistProductIds([]);
        }
      } catch (e) {
        setWishlistProductIds([]);
      }
    }
  }, [user]);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    const isFav = wishlistProductIds.includes(productId);

    if (isFav) {
      // 1. Optimistic removal from state
      const nextIds = wishlistProductIds.filter(id => id !== productId);
      setWishlistProductIds(nextIds);

      if (!user) {
        try {
          localStorage.setItem('sunma_guest_wishlist', JSON.stringify(nextIds));
        } catch (e) {}
        return false;
      }

      try {
        const res = await api.removeFromWishlist(productId);
        if (res.success && Array.isArray(res.productIds)) {
          setWishlistProductIds(res.productIds);
        }
      } catch (e) {
        console.error('Error removing from wishlist backend:', e);
      }
      return false;
    } else {
      // 2. Optimistic addition to state
      const nextIds = [...wishlistProductIds, productId];
      setWishlistProductIds(nextIds);

      if (!user) {
        try {
          localStorage.setItem('sunma_guest_wishlist', JSON.stringify(nextIds));
        } catch (e) {}
        return true;
      }

      try {
        const res = await api.addToWishlist(productId);
        if (res.success && Array.isArray(res.productIds)) {
          setWishlistProductIds(res.productIds);
        }
      } catch (e) {
        console.error('Error adding to wishlist backend:', e);
      }
      return true;
    }
  };

  const isInWishlist = (productId: string) => wishlistProductIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistProductIds, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
