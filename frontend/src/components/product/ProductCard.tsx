'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/media';
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

  const isFav = isInWishlist(product.id) || isInWishlist(product.slug);
  const isThai = language === 'TH';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="luxury-card group rounded-[2px] overflow-hidden flex flex-col justify-between h-full relative bg-bg-card border border-border-subtle hover:border-gold transition-all duration-300">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
        <Image
          src={resolveMediaUrl(product.thumbnail) || '/images/tiles/calacatta-marble.jpeg'}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && <Badge variant="gold">ARCHITECTURAL</Badge>}
          <Badge variant="stone">{product.size}</Badge>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full border transition-all z-30 cursor-pointer ${
            isFav
              ? 'bg-gold text-white border-gold shadow-md scale-105'
              : 'bg-white/80 backdrop-blur-md text-txt-main border-border-subtle hover:text-gold hover:border-gold shadow-xs'
          }`}
          title="Save to Wishlist"
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-white' : ''}`} />
        </button>

        {/* Quick Room Studio Hover Overlay */}
        <div className="absolute inset-0 bg-contrast-bg/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 p-4 z-10">
          <Link
            href={`/products/${product.slug}`}
            className="px-3.5 py-2 bg-white/90 hover:bg-white text-txt-main rounded-[2px] text-[10.5px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            Specs
          </Link>
          <Link
            href={`/room-studio?tile=${product.slug}`}
            className="px-3.5 py-2 bg-gold hover:bg-gold-hover text-white font-semibold rounded-[2px] text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Room Studio
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] text-txt-muted font-medium tracking-wider uppercase mb-1">
            <span>{product.brandName || 'SUNMA'}</span>
            <span className="font-mono text-txt-muted/70">{product.productCode}</span>
          </div>

          <Link href={`/products/${product.slug}`}>
            <h3 className="font-heading text-base font-normal text-txt-main group-hover:text-gold transition-colors line-clamp-1">
              {isThai && product.nameTh ? product.nameTh : product.name}
            </h3>
          </Link>

          <p className="text-[11.5px] text-txt-muted mt-1 line-clamp-1 font-light">
            {product.material} • {product.surface} Surface
          </p>
        </div>

        {/* Pricing & Stock */}
        <div className="pt-3 border-t border-border-subtle flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-txt-main font-mono">
                ฿{product.pricePerPiece.toLocaleString()}
              </span>
              <span className="text-[10.5px] text-txt-muted whitespace-nowrap">
                / {isThai ? 'แผ่น' : 'pc'}
              </span>
            </div>
            <div className="text-[10.5px] text-txt-muted/80 whitespace-nowrap">
              ฿{product.pricePerBox.toLocaleString()} / {isThai ? 'กล่อง' : 'box'} ({product.piecesPerBox} {isThai ? 'แผ่น' : 'pcs'})
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className={`text-[10px] font-medium block ${product.stockPieces > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {product.stockPieces > 0
                ? (isThai ? `มีสินค้า ${product.stockPieces} แผ่น` : `${product.stockPieces} in stock`)
                : (isThai ? 'สั่งผลิตตามรอบ' : 'Order on request')}
            </span>
            <Link
              href={`/products/${product.slug}`}
              className="text-[10px] uppercase font-semibold text-gold hover:underline tracking-wider inline-block mt-0.5"
            >
              {isThai ? 'ดูรายละเอียด →' : 'Configure →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
