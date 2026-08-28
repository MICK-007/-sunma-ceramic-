'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '../ui/Badge';

export interface ProductProps {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  productCode: string;
  thumbnail: string;
  categoryName?: string;
  brandName?: string;
  size: string;
  surface: string;
  material: string;
  pricePerPiece: number;
  pricePerBox: number;
  piecesPerBox: number;
  coveragePerBox: number;
  stockPieces: number;
  featured?: boolean;
}

export const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const { language, t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFav = isInWishlist(product.id);
  const isThai = language === 'TH';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="luxury-card group rounded-lg overflow-hidden flex flex-col justify-between h-full relative">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && <Badge variant="gold">FEATURED</Badge>}
          <Badge variant="stone">{product.size}</Badge>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full border transition-all z-10 ${
            isFav
              ? 'bg-gold text-bg-primary border-gold'
              : 'bg-black/60 backdrop-blur-md text-white border-white/20 hover:text-gold hover:border-gold'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Room Studio Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <Link
            href={`/products/${product.slug}`}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            View Detail
          </Link>
          <Link
            href={`/room-studio?tile=${product.slug}`}
            className="px-3.5 py-2 bg-gold hover:bg-gold-hover text-bg-primary font-bold rounded text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Room Studio
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] text-stone font-semibold tracking-wider uppercase mb-1">
            <span>{product.brandName || 'SUNMA'}</span>
            <span>{product.productCode}</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading text-sm font-bold text-txt-main group-hover:text-gold transition-colors line-clamp-1">
              {isThai && product.nameTh ? product.nameTh : product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-txt-muted mt-1 line-clamp-1">
            {product.material} • {product.surface} Surface
          </p>
        </div>

        {/* Pricing & Stock */}
        <div className="mt-4 pt-3 border-t border-border-subtle flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-gold">
                ฿{product.pricePerPiece.toLocaleString()}
              </span>
              <span className="text-[10px] text-txt-muted">/ {t.product.pieces.slice(0, 3)}</span>
            </div>
            <div className="text-[10px] text-stone">
              ฿{product.pricePerBox.toLocaleString()} / {t.product.boxes.slice(0, 3)} ({product.piecesPerBox} pcs)
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-400 font-semibold block">
              {product.stockPieces > 0 ? `${product.stockPieces} pcs in stock` : 'Out of Stock'}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="text-[10px] uppercase font-bold text-gold hover:underline"
            >
              Select →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
