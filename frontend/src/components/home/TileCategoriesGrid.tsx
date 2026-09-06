'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

import { api } from '@/services/api';

export interface TileCategoryCard {
  id: string;
  slug: string;
  nameEn: string;
  nameTh: string;
  image: string;
  href: string;
}

const CATEGORIES: TileCategoryCard[] = [
  {
    id: 'floor',
    slug: 'floor-tiles',
    nameEn: 'Floor Tiles',
    nameTh: 'กระเบื้องปูพื้น',
    image: '/images/rooms/living room.png',
    href: '/shop?category=floor-tiles',
  },
  {
    id: 'wall',
    slug: 'wall-tiles',
    nameEn: 'Wall Tiles',
    nameTh: 'กระเบื้องบุผนัง',
    image: '/images/rooms/bed room.png',
    href: '/shop?category=wall-tiles',
  },
  {
    id: 'bathroom',
    slug: 'bathroom-tiles',
    nameEn: 'Bathroom Tiles',
    nameTh: 'กระเบื้องห้องน้ำ',
    image: '/images/rooms/bath room.png',
    href: '/shop?category=bathroom-tiles',
  },
  {
    id: 'outdoor',
    slug: 'outdoor-tiles',
    nameEn: 'Outdoor Tiles',
    nameTh: 'กระเบื้องภายนอก',
    image: '/images/rooms/poolside.png',
    href: '/shop?category=outdoor-tiles',
  },
  {
    id: 'wood-look',
    slug: 'wood-look-tiles',
    nameEn: 'Wood Look Tiles',
    nameTh: 'กระเบื้องลายไม้',
    image: '/images/tiles/sandstone-beige.jpeg',
    href: '/shop?category=wood-look-tiles',
  },
];

export const TileCategoriesGrid: React.FC = () => {
  const { language } = useLanguage();
  const isThai = language === 'TH';
  const [categoriesList, setCategoriesList] = React.useState<TileCategoryCard[]>(CATEGORIES);

  React.useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.slice(0, 5).map((bCat: any) => {
            const fallback = CATEGORIES.find((c) => c.slug === bCat.slug) || CATEGORIES[0];
            return {
              id: String(bCat.id || fallback.id),
              slug: bCat.slug || fallback.slug,
              nameEn: bCat.nameEn || fallback.nameEn,
              nameTh: bCat.nameTh || fallback.nameTh,
              image: bCat.imageUrl || fallback.image,
              href: `/shop?category=${bCat.slug || fallback.slug}`,
            };
          });
          setCategoriesList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-[#FAF9F6] py-16 sm:py-24 px-6 sm:px-10 lg:px-12 border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] sm:text-xs uppercase font-semibold tracking-[0.3em] text-amber-800/90 block">
            {isThai ? 'คอลเลกชันกระเบื้องของเรา' : 'OUR COLLECTIONS'}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-900 tracking-tight">
            {isThai ? 'สำรวจหมวดหมู่กระเบื้องยอดนิยม' : 'Explore Our Tile Categories'}
          </h2>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group block bg-white border border-neutral-200/70 rounded-[2px] overflow-hidden hover:border-neutral-400 hover:shadow-lg transition-all duration-300"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={cat.image}
                  alt={cat.nameEn}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Title & Arrow */}
              <div className="p-3.5 sm:p-4 flex items-center justify-between bg-white">
                <span className="text-xs sm:text-sm font-medium text-neutral-900 group-hover:text-amber-850 transition-colors">
                  {isThai ? cat.nameTh : cat.nameEn}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
