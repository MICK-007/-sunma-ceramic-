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
      <Breadcrumb items={[{ label: isThai ? 'หมวดหมู่สินค้า' : 'Categories' }]} />

      <div className="border-b border-border-subtle pb-6 text-left">
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block mb-1">
          {isThai ? 'หมวดหมู่งานสถาปัตยกรรม' : 'ARCHITECTURAL DIVISIONS'}
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-normal text-txt-main">
          {t.categories.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="luxury-card group rounded-[2px] overflow-hidden relative aspect-[4/3] flex flex-col justify-end p-6 border border-border-subtle hover:border-gold transition-all shadow-xs"
          >
            <Image
              src={resolveMediaUrl(cat.image) || '/images/tiles/calacatta-marble.jpeg'}
              alt={cat.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="relative z-10 space-y-2 text-left">
              <span className="text-[9.5px] font-mono font-medium text-gold uppercase tracking-widest">
                {isThai ? `หมวดที่ 0${cat.sortOrder}` : `DIVISION 0${cat.sortOrder}`}
              </span>
              <h2 className="font-heading text-xl font-normal text-white group-hover:text-gold transition-colors">
                {isThai && cat.nameTh ? cat.nameTh : cat.name}
              </h2>
              <p className="text-xs text-white/70 line-clamp-2 font-light">
                {isThai && cat.descriptionTh ? cat.descriptionTh : cat.description}
              </p>
              <span className="text-[10.5px] font-medium text-gold uppercase tracking-widest inline-flex items-center gap-1.5 pt-2">
                {isThai ? 'สำรวจหมวดหมู่นี้' : 'Explore Division'} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
