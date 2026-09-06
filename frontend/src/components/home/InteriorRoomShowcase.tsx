'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, Sparkles, Layers } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const InteriorRoomShowcase: React.FC = () => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const [livingPopupOpen, setLivingPopupOpen] = useState(true);
  const [kitchenPopupOpen, setKitchenPopupOpen] = useState(true);

  return (
    <div className="w-full bg-[#FAF9F6] text-txt-main">
      {/* ========================================================= */}
      {/* 1. LIVING ROOM SHOWCASE */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden bg-neutral-900">
        {/* Background Interior Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/rooms/living room.png"
            alt="Modern Elegance Living Room with Marble Porcelain Tiles"
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
                {isThai ? 'ห้องรับแขก' : 'LIVING ROOM'}
              </span>

              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.12] text-white">
                {isThai ? 'ความสง่างามร่วมสมัยในทุกรายละเอียด' : 'Modern Elegance in Every Detail'}
              </h2>

              <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed">
                {isThai
                  ? 'กระเบื้องพอร์ซเลนเกรดพรีเมียมที่นำความงามของธรรมชาติและความประณีตมาสู่พื้นที่อยู่อาศัยของคุณ'
                  : 'Premium porcelain tiles that bring natural beauty and timeless style to your living space.'}
              </p>

              <div className="pt-2">
                <Link
                  href="/shop?room=living-room"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white hover:text-amber-200 transition-colors"
                >
                  <span>{isThai ? 'ค้นพบเพิ่มเติม' : 'Discover More'}</span>
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
                      {isThai ? 'คอลเลกชันแนะนำ' : 'Featured Collection'}
                    </span>
                    <button
                      onClick={() => setLivingPopupOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700 transition p-0.5"
                      title="Close popup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-3">
                    {/* Swatch Image */}
                    <Link
                      href="/products/calacatta-oro-polished-slab"
                      className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-neutral-100 rounded-[2px] overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src="/images/tiles/calacatta-marble.jpeg"
                        alt={isThai ? 'กระเบื้องหินอ่อน Calacatta Oro' : 'Calacatta Oro Polished Slab'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </Link>

                    {/* Spec Details */}
                    <div className="space-y-1 text-left">
                      <Link href="/products/calacatta-oro-polished-slab" className="block group/title">
                        <h4 className="font-heading text-base sm:text-lg font-normal text-neutral-900 group-hover/title:text-gold transition-colors leading-snug">
                          {isThai ? 'Calacatta Oro Polished' : 'Calacatta Oro Polished Slab'}
                        </h4>
                      </Link>
                      <div className="text-[11px] text-neutral-500 font-medium">
                        {isThai ? 'กระเบื้องพอร์ซเลน (ผิวเงา)' : 'Porcelain Tile (Polished)'}
                      </div>
                      <div className="text-xs font-mono text-neutral-700 font-semibold pt-0.5">
                        60 × 120 cm
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/products/calacatta-oro-polished-slab"
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
                  + Show Tile Spec
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
            src="/images/rooms/kitchen room.png"
            alt="Luxury Kitchen Waterfall Island with Porcelain Slabs"
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
                {isThai ? 'ห้องครัว' : 'KITCHEN'}
              </span>

              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.12] text-white">
                {isThai ? 'เมื่อฟังก์ชันผสานความงดงามสมบูรณ์แบบ' : 'Where Function Meets Beauty'}
              </h2>

              <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed">
                {isThai
                  ? 'กระเบื้องพอร์ซเลนและสแลปหินอ่อนสำหรับห้องครัว ทนความร้อน รอยขีดข่วน และคราบมัน สร้างแรงบันดาลใจให้ทุกช่วงเวลา'
                  : 'Beautiful tiles for your kitchen, creating a space that inspires everyday moments.'}
              </p>

              <div className="pt-2">
                <Link
                  href="/shop?room=kitchen"
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white hover:text-amber-200 transition-colors"
                >
                  <span>{isThai ? 'สำรวจคอลเลกชัน' : 'Explore Collection'}</span>
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
                      {isThai ? 'สเปกกระเบื้องไอแลนด์' : 'Island Slab Spec'}
                    </span>
                    <button
                      onClick={() => setKitchenPopupOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700 transition p-0.5"
                      title="Close popup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-3">
                    {/* Swatch Image */}
                    <Link
                      href="/products/walnut-heritage-chevron-slab"
                      className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 bg-neutral-100 rounded-[2px] overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src="/images/tiles/sandstone-beige.jpeg"
                        alt={isThai ? 'กระเบื้องหินทรายสีเบจ Sandstone Beige' : 'Sandstone Beige Porcelain Slab'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </Link>

                    <div className="space-y-1 text-left">
                      <Link href="/products/walnut-heritage-chevron-slab" className="block group/title">
                        <h4 className="font-heading text-base sm:text-lg font-normal text-neutral-900 group-hover/title:text-gold transition-colors leading-snug">
                          {isThai ? 'Sandstone Beige Slab' : 'Sandstone Beige Porcelain Slab'}
                        </h4>
                      </Link>
                      <div className="text-[11px] text-neutral-500 font-medium">
                        {isThai ? 'กระเบื้องพอร์ซเลนแผ่นใหญ่ (ผิวแมตต์)' : 'Porcelain Slab (Matt)'}
                      </div>
                      <div className="text-xs font-mono text-neutral-700 font-semibold pt-0.5">
                        60 × 120 cm
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/products/walnut-heritage-chevron-slab"
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
                  + Show Kitchen Spec
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
