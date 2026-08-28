'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType, useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export const CartItem: React.FC<{ item: CartItemType }> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { t } = useLanguage();

  const product = item.product || {};
  const piecesPerBox = product.piecesPerBox || 4;
  const calculatedBoxes = (item.quantity / piecesPerBox).toFixed(1);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-bg-card border border-border-subtle rounded-lg gap-4">
      {/* Product Image & Details */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-20 h-20 bg-bg-secondary rounded overflow-hidden shrink-0 border border-border-subtle">
          <Image
            src={product.thumbnail || 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80'}
            alt={product.name || 'Tile'}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <span className="text-[10px] font-mono text-stone tracking-wider block">
            {product.productCode || 'SNM-CODE'}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="font-heading text-sm font-bold text-txt-main hover:text-gold transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <div className="text-[11px] text-txt-muted mt-0.5">
            Size: {product.size} • {product.surface} Surface
          </div>
          <div className="text-[10px] text-stone mt-1">
            ฿{item.unitPrice.toLocaleString()} / piece • approx. {calculatedBoxes} boxes ({piecesPerBox} pcs/box)
          </div>
        </div>
      </div>

      {/* Quantity Step Selector */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 border-border-subtle pt-3 sm:pt-0">
        <div className="flex items-center space-x-2 border border-border-subtle bg-bg-secondary rounded p-1">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-1 text-stone hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center text-xs font-bold text-txt-main">
            {item.quantity} pcs
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-1 text-stone hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line Price & Remove */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-bold text-gold">
              ฿{(item.quantity * item.unitPrice).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-stone hover:text-red-400 p-1.5 transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
