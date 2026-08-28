'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

interface WishlistContextType {
  wishlistProductIds: string[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      api.getWishlist().then(res => {
        if (res.success && res.productIds) {
          setWishlistProductIds(res.productIds);
        }
      }).catch(err => console.error(err));
    } else {
      setWishlistProductIds([]);
    }
  }, [user]);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      router.push('/login?redirect=/shop&notice=wishlist');
      return false;
    }

    const isFav = wishlistProductIds.includes(productId);
    try {
      if (isFav) {
        const res = await api.removeFromWishlist(productId);
        if (res.success && res.productIds) {
          setWishlistProductIds(res.productIds);
        }
        return false;
      } else {
        const res = await api.addToWishlist(productId);
        if (res.success && res.productIds) {
          setWishlistProductIds(res.productIds);
        }
        return true;
      }
    } catch (e) {
      console.error(e);
      return isFav;
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
