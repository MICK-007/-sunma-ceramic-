'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';

export interface CMSFeaturedProductsProps {
  content: {
    title?: string;
    subtitle?: string;
    settings?: {
      limit?: number;
      viewAllUrl?: string;
    };
  };
}

export const CMSFeaturedProducts: React.FC<CMSFeaturedProductsProps> = ({ content }) => {
  const subtitle = content.subtitle || 'SELECTED CATALOG';
  const title = content.title || 'Curated Architectural Slabs';
  const limit = content.settings?.limit || 6;
  const viewAllUrl = content.settings?.viewAllUrl || '/shop?featured=true';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getProducts({ featured: true, limit }).then(res => {
      if (isMounted) {
        if (res?.success) {
          setProducts(res.data || []);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
            {subtitle}
          </span>
          <h2 className="font-heading text-2xl font-bold text-txt-main">
            {title}
          </h2>
        </div>
        <Link href={viewAllUrl} className="text-xs font-bold text-gold uppercase hover:underline">
          View All Featured →
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone">Loading featured products...</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone">No featured products currently available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
};
