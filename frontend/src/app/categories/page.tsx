'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/services/api';
import { resolveMediaUrl } from '@/lib/media';
import { useLanguage } from '@/context/LanguageContext';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const { t, language } = useLanguage();
  const isThai = language === 'TH';
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then(res => res.success && setCategories(res.data || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'Categories' }]} />

      <div className="border-b border-border-subtle pb-4">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
          ARCHITECTURAL DIVISIONS
        </span>
        <h1 className="font-heading text-3xl font-bold text-white">
          {t.categories.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="luxury-card group rounded-xl overflow-hidden relative aspect-[4/3] flex flex-col justify-end p-6"
          >
            <Image
              src={resolveMediaUrl(cat.image) || '/images/tiles/calacatta-marble.jpeg'}
              alt={cat.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                DIVISION 0{cat.sortOrder}
              </span>
              <h2 className="font-heading text-xl font-bold text-white group-hover:text-gold transition-colors">
                {isThai && cat.nameTh ? cat.nameTh : cat.name}
              </h2>
              <p className="text-xs text-stone-light line-clamp-2">
                {isThai && cat.descriptionTh ? cat.descriptionTh : cat.description}
              </p>
              <span className="text-xs font-bold text-gold uppercase tracking-wider inline-flex items-center gap-1.5 pt-2">
                Explore Category <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
