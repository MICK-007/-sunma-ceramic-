'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/media';
import { sanitizeUrl } from '@/lib/cms-utils';

export interface ArchitecturalHeroProps {
  content?: {
    id?: string;
    title?: string;
    subtitle?: string;
    settings?: any;
  };
}

export const ArchitecturalHero: React.FC<ArchitecturalHeroProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  let settings = content?.settings || {};
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      settings = {};
    }
  }

  // Background Image
  const bgImage = resolveMediaUrl(settings.bgImage) || '/images/hero-villa.webp';

  // Eyebrow / Kicker
  const defaultEyebrowEn = 'PREMIUM TILES FOR';
  const defaultEyebrowTh = 'กระเบื้องพอร์ซเลนระดับพรีเมียม';
  const eyebrow = isThai
    ? (settings.eyebrowTh || (settings.eyebrow && settings.eyebrow !== defaultEyebrowEn ? settings.eyebrow : defaultEyebrowTh))
    : (settings.eyebrow || defaultEyebrowEn);

  // Headline
  const defaultTitleEn = 'A Better Living Space';
  const defaultTitleTh = 'ยกระดับ พื้นที่การใช้ชีวิต';
  const rawTitle = content?.title || defaultTitleEn;
  const headline = isThai
    ? (settings.titleTh || (rawTitle && rawTitle !== defaultTitleEn ? rawTitle : defaultTitleTh))
    : rawTitle;

  // Subtitle / Description
  const defaultDescEn = 'Timeless beauty, durable quality, for every space in your life.';
  const defaultDescTh = 'ความงดงามเหนือกาลเวลา คุณภาพทนทานสำหรับทุกพื้นที่ในชีวิตคุณ';
  const rawDesc = content?.subtitle || defaultDescEn;
  const description = isThai
    ? (settings.subtitleTh || (rawDesc && rawDesc !== defaultDescEn ? rawDesc : defaultDescTh))
    : rawDesc;

  // CTA Button
  const defaultBtn1En = 'Explore Collection';
  const defaultBtn1Th = 'สำรวจคอลเลกชัน';
  const btn1Label = isThai
    ? (settings.btn1LabelTh || (settings.btn1Label && settings.btn1Label !== defaultBtn1En ? settings.btn1Label : defaultBtn1Th))
    : (settings.btn1Label || defaultBtn1En);
  const btn1Url = sanitizeUrl(settings.btn1Url, '/shop');

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-start overflow-hidden bg-neutral-950">
      {/* Background Architectural Villa Image (Enhanced High-Res 2560px) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={typeof headline === 'string' ? headline : 'Architectural Villa'}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-center"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        {/* Subtle atmospheric vignette to ensure crisp contrast on the left text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full pt-16 sm:pt-20">
        <div className="max-w-xl space-y-4 sm:space-y-6">
          {/* Kicker */}
          <div>
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.3em] text-white/90 drop-shadow-sm">
              {eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] uppercase drop-shadow-md">
            {headline}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-white/90 font-light max-w-sm leading-relaxed drop-shadow-sm">
            {description}
          </p>

          {/* CTA Link — Explore Collection → */}
          <div className="pt-2 sm:pt-4">
            <Link
              href={btn1Url}
              className="group inline-flex items-center gap-3 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white hover:text-amber-200 transition-all drop-shadow-sm"
            >
              <span className="w-7 h-[1.5px] bg-white group-hover:w-11 group-hover:bg-amber-200 transition-all" />
              <span>{btn1Label}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Left — Scroll to explore indicator with architectural mouse icon */}
      <div className="absolute bottom-8 sm:bottom-10 left-6 sm:left-10 lg:left-12 z-10 flex items-center gap-3 text-white/85 text-[11px] sm:text-xs uppercase tracking-[0.22em] font-light drop-shadow-sm select-none">
        <div className="w-[18px] h-[28px] rounded-full border-[1.5px] border-white/75 flex items-start justify-center pt-1.5">
          <span className="w-[2px] h-[5px] bg-white rounded-full animate-bounce" />
        </div>
        <span>{isThai ? 'เลื่อนเพื่อสัมผัสประสบการณ์' : 'Scroll to explore'}</span>
      </div>
    </section>
  );
};
