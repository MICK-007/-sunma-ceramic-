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
  descEn: string;
  descTh: string;
  image: string;
  href: string;
}

const CATEGORIES: TileCategoryCard[] = [
  {
    id: 'floor',
    slug: 'floor-tiles',
    nameEn: 'Floor Tiles',
    nameTh: 'กระเบื้องปูพื้น',
    descEn: 'High-durability porcelain floor tiles for refined architectural spaces',
    descTh: 'กระเบื้องปูพื้นพอร์ซเลนความทนทานสูง ดีไซน์สง่างามเหนือกาลเวลา',
    image: '/images/rooms/living room.png',
    href: '/shop?category=floor-tiles',
  },
  {
    id: 'wall',
    slug: 'wall-tiles',
    nameEn: 'Wall Tiles',
    nameTh: 'กระเบื้องบุผนัง',
    descEn: 'Sculptural wall surfaces and large-format marble-effect slabs',
    descTh: 'กระเบื้องบุผนังลวดลายประณีต เพิ่มมิติความหรูหราให้ทุกห้อง',
    image: '/images/rooms/bed room.png',
    href: '/shop?category=wall-tiles',
  },
  {
    id: 'bathroom',
    slug: 'bathroom-tiles',
    nameEn: 'Bathroom Tiles',
    nameTh: 'กระเบื้องห้องน้ำ',
    descEn: 'Moisture-resistant sanctuary porcelain with anti-slip finishes',
    descTh: 'กระเบื้องห้องน้ำกันลื่น ทนความชื้น มอบบรรยากาศสปาส่วนตัว',
    image: '/images/rooms/bath room.png',
    href: '/shop?category=bathroom-tiles',
  },
  {
    id: 'outdoor',
    slug: 'outdoor-tiles',
    nameEn: 'Outdoor Tiles',
    nameTh: 'กระเบื้องภายนอกและสวน',
    descEn: 'Weatherproof exterior slabs for terraces, poolside, and gardens',
    descTh: 'กระเบื้องภายนอกและสระว่ายน้ำ ทนแดด ทนฝน แข็งแกร่งเป็นพิเศษ',
    image: '/images/rooms/poolside.png',
    href: '/shop?category=outdoor-tiles',
  },
  {
    id: 'wood-look',
    slug: 'wood-look-tiles',
    nameEn: 'Wood Look Tiles',
    nameTh: 'กระเบื้องลายไม้',
    descEn: 'Embossed architectural wood grain planks with zero maintenance',
    descTh: 'กระเบื้องพอร์ซเลนลายไม้ธรรมชาติ สัมผัสเสมือนไม้จริง ไม่กลัวน้ำ',
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
              descEn: fallback.descEn,
              descTh: fallback.descTh,
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
        {/* Header matching Image 2 */}
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-amber-800/90 block">
            ARCHITECTURAL SERIES
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-neutral-900 tracking-tight">
            {isThai ? 'คอลเลกชันกระเบื้องที่คัดสรร' : 'Curated Tile Collections'}
          </h2>
        </div>

        {/* 5-Column Tall Portrait Cards matching Image 2 (aspect-[3/4]) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6">
          {categoriesList.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="luxury-card group rounded-[2px] overflow-hidden relative aspect-[3/4] min-h-[380px] flex flex-col justify-end p-5 sm:p-6 border border-neutral-200/70 hover:border-neutral-900 hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Full-Height Image */}
              <Image
                src={cat.image}
                alt={isThai ? cat.nameTh : cat.nameEn}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
              />

              {/* Dark Atmospheric Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {/* Bottom Content Container */}
              <div className="relative z-10 space-y-1.5 text-left">
                <h3 className="font-heading text-xl font-normal text-white group-hover:text-amber-200 transition-colors">
                  {isThai ? cat.nameTh : cat.nameEn}
                </h3>

                <p className="text-[11.5px] text-white/75 line-clamp-2 font-light leading-relaxed">
                  {isThai ? cat.descTh : cat.descEn}
                </p>

                <span className="text-[10px] font-semibold text-amber-200 uppercase tracking-[0.2em] inline-flex items-center gap-1.5 pt-2 group-hover:translate-x-1 transition-transform">
                  <span>{isThai ? 'สำรวจคอลเลกชัน' : 'Explore Series'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
