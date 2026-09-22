'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Sparkles, Edit } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { resolveMediaUrl } from '@/lib/media';

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
  coveragePerBox?: number;
  stockPieces?: number;
  isSoldOut?: boolean;
  status?: string;
  featured?: boolean;
}

export const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const { language, t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAdmin } = useAuth();

  const isFav = isInWishlist(product.id) || isInWishlist(product.slug);
  const isThai = language === 'TH';
  const isSoldOut = !!product.isSoldOut || product.status === 'SOLD_OUT';

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className={`luxury-card group rounded-[2px] overflow-hidden flex flex-col justify-between h-full relative bg-bg-card border border-border-subtle hover:border-gold transition-all duration-300 ${
      isSoldOut ? 'grayscale contrast-95 opacity-80 border-neutral-300' : ''
    }`}>
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
        <Image
          src={resolveMediaUrl(product.thumbnail) || '/images/tiles/calacatta-marble.jpeg'}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out ${
            isSoldOut ? '' : 'group-hover:scale-105'
          }`}
        />

        {/* Sold Out Overlay Badge */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1.5px] flex items-center justify-center z-25">
            <span className="px-3 py-1.5 bg-neutral-900/90 text-white font-bold text-[11px] tracking-widest uppercase rounded-[2px] border border-white/20 shadow-md">
              {isThai ? 'สินค้าหมด / SOLD OUT' : 'SOLD OUT'}
            </span>
          </div>
        )}

        {/* Admin Quick Edit Shortcut (Only visible to admin) */}
        {isAdmin && (
          <Link
            href="/admin/products"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-black/70 hover:bg-gold text-white border border-white/20 transition-all z-30 cursor-pointer shadow-md"
            title="Edit in Admin Products"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full border transition-all z-30 cursor-pointer ${
            isFav
              ? 'bg-gold text-white border-gold shadow-md scale-105'
              : 'bg-white/80 backdrop-blur-md text-txt-main border-border-subtle hover:text-gold hover:border-gold shadow-xs'
          }`}
          title={isThai ? 'บันทึกในรายการโปรด' : 'Save to Wishlist'}
          aria-label={isThai ? 'บันทึกในรายการโปรด' : 'Save to Wishlist'}
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
            {isThai ? 'ข้อมูลสเปก' : 'Specs'}
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
            {isThai
              ? `${product.material === 'Porcelain' ? 'พอร์ซเลน' : product.material === 'Ceramic' ? 'เซรามิก' : product.material} • ผิว${product.surface}`
              : `${product.material} • ${product.surface} Surface`}
          </p>
        </div>

        {/* Pricing & Availability */}
        <div className="pt-3 border-t border-border-subtle flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-txt-main font-mono">
                ฿{product.pricePerPiece.toLocaleString()}
              </span>
              <span className="text-[10.5px] text-txt-muted whitespace-nowrap font-medium">
                / {isThai ? 'ตร.ม.' : 'SQM.'}
              </span>
            </div>
            <div className="text-[10.5px] text-txt-muted/80 whitespace-nowrap">
              ฿{product.pricePerBox.toLocaleString()} / {isThai ? 'กล่อง' : 'box'} {product.coveragePerBox ? `(${product.coveragePerBox} ${isThai ? 'ตร.ม.' : 'sq.m'})` : ''}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            {isSoldOut ? (
              <span className="text-[10px] font-semibold text-rose-600 block">
                {isThai ? 'สินค้าหมด' : 'Sold Out'}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-600 block">
                {isThai ? 'พร้อมจำหน่าย' : 'Available'}
              </span>
            )}
            <Link
              href={`/products/${product.slug}`}
              className="text-[10px] uppercase font-semibold text-gold hover:underline tracking-wider inline-block mt-0.5"
            >
              {isThai ? 'ดูรายละเอียด →' : 'Details →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
