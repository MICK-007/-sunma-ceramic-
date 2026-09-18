'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/media';

export interface RoomSettings {
  eyebrow?: string;
  eyebrowTh?: string;
  title?: string;
  titleTh?: string;
  description?: string;
  descriptionTh?: string;
  buttonLabel?: string;
  buttonLabelTh?: string;
  buttonUrl?: string;
  bgImage?: string;
  specBadge?: string;
  specBadgeTh?: string;
  specTitle?: string;
  specTitleTh?: string;
  specType?: string;
  specTypeTh?: string;
  specSize?: string;
  specImage?: string;
  specUrl?: string;
}

const DEFAULT_LIVING: RoomSettings = {
  eyebrow: 'LIVING ROOM',
  eyebrowTh: 'ห้องรับแขก',
  title: 'Modern Elegance in Every Detail',
  titleTh: 'ความสง่างามร่วมสมัยในทุกรายละเอียด',
  description: 'Premium porcelain tiles that bring natural beauty and timeless style to your living space.',
  descriptionTh: 'กระเบื้องพอร์ซเลนเกรดพรีเมียมที่นำความงามของธรรมชาติและความประณีตมาสู่พื้นที่อยู่อาศัยของคุณ',
  buttonLabel: 'Discover More',
  buttonLabelTh: 'ค้นพบเพิ่มเติม',
  buttonUrl: '/shop?room=living-room',
  bgImage: '/images/rooms/living room.png',
  specBadge: 'Featured Collection',
  specBadgeTh: 'คอลเลกชันแนะนำ',
  specTitle: 'Calacatta Oro Polished Slab',
  specTitleTh: 'Calacatta Oro Polished',
  specType: 'Porcelain Tile (Polished)',
  specTypeTh: 'กระเบื้องพอร์ซเลน (ผิวเงา)',
  specSize: '60 × 120 cm',
  specImage: '/images/tiles/calacatta-marble.jpeg',
  specUrl: '/products/calacatta-oro-polished-slab',
};

const DEFAULT_KITCHEN: RoomSettings = {
  eyebrow: 'KITCHEN',
  eyebrowTh: 'ห้องครัว',
  title: 'Where Function Meets Beauty',
  titleTh: 'เมื่อฟังก์ชันผสานความงดงามสมบูรณ์แบบ',
  description: 'Beautiful tiles for your kitchen, creating a space that inspires everyday moments.',
  descriptionTh: 'กระเบื้องพอร์ซเลนและสแลปหินอ่อนสำหรับห้องครัว ทนความร้อน รอยขีดข่วน และคราบมัน สร้างแรงบันดาลใจให้ทุกช่วงเวลา',
  buttonLabel: 'Explore Collection',
  buttonLabelTh: 'สำรวจคอลเลกชัน',
  buttonUrl: '/shop?room=kitchen',
  bgImage: '/images/rooms/kitchen room.png',
  specBadge: 'Island Slab Spec',
  specBadgeTh: 'สเปกกระเบื้องไอแลนด์',
  specTitle: 'Sandstone Beige Porcelain Slab',
  specTitleTh: 'Sandstone Beige Slab',
  specType: 'Porcelain Slab (Matt)',
  specTypeTh: 'กระเบื้องพอร์ซเลนแผ่นใหญ่ (ผิวแมตต์)',
  specSize: '60 × 120 cm',
  specImage: '/images/tiles/sandstone-beige.jpeg',
  specUrl: '/products/walnut-heritage-chevron-slab',
};

export interface InteriorRoomShowcaseProps {
  content?: any;
}

export const InteriorRoomShowcase: React.FC<InteriorRoomShowcaseProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const [livingPopupOpen, setLivingPopupOpen] = useState(true);
  const [kitchenPopupOpen, setKitchenPopupOpen] = useState(true);

  if (content && content.is_enabled === false) {
    return null;
  }

  let settings = content?.settings || {};
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      settings = {};
    }
  }

  const living: RoomSettings = {
    ...DEFAULT_LIVING,
    ...(settings.living && typeof settings.living === 'object' ? settings.living : {}),
  };

  const kitchen: RoomSettings = {
    ...DEFAULT_KITCHEN,
    ...(settings.kitchen && typeof settings.kitchen === 'object' ? settings.kitchen : {}),
  };

  const livingBg = resolveMediaUrl(living.bgImage) || '/images/rooms/living room.png';
  const livingSpecImg = resolveMediaUrl(living.specImage) || '/images/tiles/calacatta-marble.jpeg';
  const kitchenBg = resolveMediaUrl(kitchen.bgImage) || '/images/rooms/kitchen room.png';
  const kitchenSpecImg = resolveMediaUrl(kitchen.specImage) || '/images/tiles/sandstone-beige.jpeg';

  return (
    <div className="w-full bg-[#FAF9F6] text-txt-main">
      {/* ========================================================= */}
      {/* 1. LIVING ROOM SHOWCASE */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden bg-neutral-900">
        {/* Background Interior Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={livingBg}
            alt={isThai ? (living.titleTh || living.title || 'Living Room') : (living.title || 'Living Room')}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle Contrast Gradient for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full py-20 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Room Narrative */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 max-w-xl text-white">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/90 block">
                {isThai ? (living.eyebrowTh || living.eyebrow) : (living.eyebrow || living.eyebrowTh)}
              </span>

              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.12] text-white">
                {isThai ? (living.titleTh || living.title) : (living.title || living.titleTh)}
              </h2>

              <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed">
                {isThai ? (living.descriptionTh || living.description) : (living.description || living.descriptionTh)}
              </p>

              <div className="pt-2">
                <Link
                  href={living.buttonUrl || '/shop?room=living-room'}
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white hover:text-amber-200 transition-colors"
                >
                  <span>{isThai ? (living.buttonLabelTh || living.buttonLabel || 'ค้นพบเพิ่มเติม') : (living.buttonLabel || 'Discover More')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Floating Collection Popup Card */}
            <div className="lg:col-span-6 flex justify-start lg:justify-end">
              {livingPopupOpen ? (
                <div className="bg-white/95 backdrop-blur-md text-neutral-900 border border-neutral-200/80 rounded-[2px] p-4 sm:p-5 shadow-2xl max-w-sm w-full animate-fadeIn transition-all">
                  <div className="flex items-start justify-between pb-2 border-b border-neutral-100">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">
                      {isThai ? (living.specBadgeTh || living.specBadge) : (living.specBadge || living.specBadgeTh)}
                    </span>
                    <button
                      onClick={() => setLivingPopupOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700 transition p-0.5"
                      title={isThai ? 'ปิด' : 'Close popup'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-3">
                    {/* Swatch Image */}
                    <Link
                      href={living.specUrl || '/products/calacatta-oro-polished-slab'}
                      className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-neutral-100 rounded-[2px] overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={livingSpecImg}
                        alt={isThai ? (living.specTitleTh || living.specTitle || '') : (living.specTitle || '')}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </Link>

                    {/* Spec Details */}
                    <div className="space-y-1 text-left">
                      <Link href={living.specUrl || '/products/calacatta-oro-polished-slab'} className="block group/title">
                        <h4 className="font-heading text-base sm:text-lg font-normal text-neutral-900 group-hover/title:text-gold transition-colors leading-snug">
                          {isThai ? (living.specTitleTh || living.specTitle) : (living.specTitle || living.specTitleTh)}
                        </h4>
                      </Link>
                      <div className="text-[11px] text-neutral-500 font-medium">
                        {isThai ? (living.specTypeTh || living.specType) : (living.specType || living.specTypeTh)}
                      </div>
                      {living.specSize && (
                        <div className="text-xs font-mono text-neutral-700 font-semibold pt-0.5">
                          {living.specSize}
                        </div>
                      )}

                      <div className="pt-2">
                        <Link
                          href={living.specUrl || '/products/calacatta-oro-polished-slab'}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-900 hover:text-gold transition group"
                        >
                          <span>{isThai ? 'ดูรายละเอียดสินค้า' : 'View Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-gold" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setLivingPopupOpen(true)}
                  className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-[2px] shadow-lg text-xs font-semibold uppercase tracking-wider text-neutral-900 border border-neutral-200 hover:bg-white transition"
                >
                  {isThai ? '+ แสดงสเปกกระเบื้อง' : '+ Show Tile Spec'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. KITCHEN SHOWCASE */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[80vh] sm:min-h-[85vh] flex items-center overflow-hidden bg-neutral-900">
        {/* Background Kitchen Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={kitchenBg}
            alt={isThai ? (kitchen.titleTh || kitchen.title || 'Kitchen') : (kitchen.title || 'Kitchen')}
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full py-20 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Kitchen Narrative */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 max-w-xl text-white">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/90 block">
                {isThai ? (kitchen.eyebrowTh || kitchen.eyebrow) : (kitchen.eyebrow || kitchen.eyebrowTh)}
              </span>

              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.12] text-white">
                {isThai ? (kitchen.titleTh || kitchen.title) : (kitchen.title || kitchen.titleTh)}
              </h2>

              <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed">
                {isThai ? (kitchen.descriptionTh || kitchen.description) : (kitchen.description || kitchen.descriptionTh)}
              </p>

              <div className="pt-2">
                <Link
                  href={kitchen.buttonUrl || '/shop?room=kitchen'}
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white hover:text-amber-200 transition-colors"
                >
                  <span>{isThai ? (kitchen.buttonLabelTh || kitchen.buttonLabel || 'สำรวจคอลเลกชัน') : (kitchen.buttonLabel || 'Explore Collection')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Kitchen Island Spec Card */}
            <div className="lg:col-span-6 flex justify-start lg:justify-end">
              {kitchenPopupOpen ? (
                <div className="bg-white/95 backdrop-blur-md text-neutral-900 border border-neutral-200/80 rounded-[2px] p-4 sm:p-5 shadow-2xl max-w-sm w-full animate-fadeIn transition-all">
                  <div className="flex items-start justify-between pb-2 border-b border-neutral-100">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-gold font-semibold">
                      {isThai ? (kitchen.specBadgeTh || kitchen.specBadge) : (kitchen.specBadge || kitchen.specBadgeTh)}
                    </span>
                    <button
                      onClick={() => setKitchenPopupOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700 transition p-0.5"
                      title={isThai ? 'ปิด' : 'Close popup'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-3">
                    {/* Swatch Image */}
                    <Link
                      href={kitchen.specUrl || '/products/walnut-heritage-chevron-slab'}
                      className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-neutral-100 rounded-[2px] overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={kitchenSpecImg}
                        alt={isThai ? (kitchen.specTitleTh || kitchen.specTitle || '') : (kitchen.specTitle || '')}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </Link>

                    <div className="space-y-1 text-left">
                      <Link href={kitchen.specUrl || '/products/walnut-heritage-chevron-slab'} className="block group/title">
                        <h4 className="font-heading text-base sm:text-lg font-normal text-neutral-900 group-hover/title:text-gold transition-colors leading-snug">
                          {isThai ? (kitchen.specTitleTh || kitchen.specTitle) : (kitchen.specTitle || kitchen.specTitleTh)}
                        </h4>
                      </Link>
                      <div className="text-[11px] text-neutral-500 font-medium">
                        {isThai ? (kitchen.specTypeTh || kitchen.specType) : (kitchen.specType || kitchen.specTypeTh)}
                      </div>
                      {kitchen.specSize && (
                        <div className="text-xs font-mono text-neutral-700 font-semibold pt-0.5">
                          {kitchen.specSize}
                        </div>
                      )}

                      <div className="pt-2">
                        <Link
                          href={kitchen.specUrl || '/products/walnut-heritage-chevron-slab'}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-900 hover:text-gold transition group"
                        >
                          <span>{isThai ? 'ดูรายละเอียดสินค้า' : 'View Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-gold" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setKitchenPopupOpen(true)}
                  className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-[2px] shadow-lg text-xs font-semibold uppercase tracking-wider text-neutral-900 border border-neutral-200 hover:bg-white transition"
                >
                  {isThai ? '+ แสดงสเปกกระเบื้องไอแลนด์' : '+ Show Kitchen Spec'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
