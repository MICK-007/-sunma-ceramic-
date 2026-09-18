'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowRight, Droplets } from 'lucide-react';
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
  const heroRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const isThai = language === 'TH';

  // Toggle state for water ripple effect with localStorage persistence (SSR-safe to avoid hydration mismatch)
  const [isRippleEnabled, setIsRippleEnabled] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sunma_ripple_fx');
      if (stored !== null) {
        setIsRippleEnabled(stored === 'true');
      }
    } catch (e) {}
  }, []);

  const toggleRipple = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRippleEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sunma_ripple_fx', String(next));
      } catch (e) {}
      return next;
    });
  };

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

  // Cleanup WebGL on component unmount
  useEffect(() => {
    return () => {
      const w = window as any;
      if (w?.$ && heroRef.current) {
        try {
          w.$(heroRef.current).ripples('destroy');
        } catch (e) {}
      }
    };
  }, []);

  // Water Ripple WebGL Effect (Ultra-Gentle Mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as any;

    // If disabled by user toggle: pause and hide WebGL canvas to save 100% GPU
    if (!isRippleEnabled) {
      if (w.$ && heroRef.current) {
        try {
          w.$(heroRef.current).ripples('pause');
          w.$(heroRef.current).ripples('hide');
        } catch (e) {}
      }
      return;
    }

    // Accessibility check: user prefers reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Battery / Mobile optimization: disable WebGL ripples on small mobile screens (< 768px)
    if (window.innerWidth < 768) {
      return;
    }

    const tryInit = () => {
      if (!w.$ || !w.$.fn?.ripples || !heroRef.current) return false;

      const $hero = w.$(heroRef.current);

      try {
        // If already initialized, just unhide and resume animation loop
        if ($hero.data('ripples')) {
          $hero.ripples('show');
          $hero.ripples('play');
          return true;
        }

        $hero.ripples({
          imageUrl: bgImage,
          resolution: 512,
          dropRadius: 10,
          perturbance: 0.004,
          interactive: true,
        });
        return true;
      } catch (err) {
        console.warn('WebGL Water Ripple initialization failed or unsupported:', err);
        return false;
      }
    };

    if (!tryInit()) {
      const interval = setInterval(() => {
        if (tryInit()) {
          clearInterval(interval);
        }
      }, 150);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 8000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [bgImage, isRippleEnabled]);

  // Click drop handler for an extra gentle ripple
  const handleHeroClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRippleEnabled || !heroRef.current) return;
    const w = window as any;
    if (!w.$ || !w.$.fn?.ripples) return;

    try {
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      w.$(heroRef.current).ripples('drop', x, y, 12, 0.006);
    } catch (err) {}
  };

  return (
    <>
      {/* External Scripts for Ultra-Gentle WebGL Water Ripple */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/jquery.ripples@0.6.3/dist/jquery.ripples.min.js"
        strategy="afterInteractive"
      />

      <section className="relative w-full h-screen min-h-[700px] flex items-center justify-start overflow-hidden bg-neutral-950 select-none">
        {/* 1. Permanent Base High-Res Villa Image (Never disappears, guaranteed visible always) */}
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
        </div>

        {/* 2. Interactive Water Ripple Canvas Layer (Overlays on top when enabled) */}
        <div
          ref={heroRef}
          onClick={handleHeroClick}
          className={`absolute inset-0 z-0 bg-cover bg-[72%_center] sm:bg-center isolate cursor-default transition-opacity duration-500 ${
            isRippleEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundImage: `url("${bgImage}")`,
            imageRendering: '-webkit-optimize-contrast',
          }}
        />

        {/* 3. Subtle atmospheric vignettes to ensure crisp contrast on text */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" />
        </div>

        {/* Top Right — Minimalist White Water Effect Toggle Button */}
        <div className="absolute top-24 sm:top-28 right-6 sm:right-10 lg:right-12 z-20">
          <button
            type="button"
            onClick={toggleRipple}
            suppressHydrationWarning
            aria-label={isRippleEnabled ? 'Turn off water ripple effect' : 'Turn on water ripple effect'}
            title={
              isRippleEnabled
                ? isThai
                  ? 'คลิกเพื่อปิดเอฟเฟกต์ผิวน้ำ'
                  : 'Click to disable water ripples'
                : isThai
                ? 'คลิกเพื่อเปิดเอฟเฟกต์ผิวน้ำ'
                : 'Click to enable water ripples'
            }
            className={`pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border select-none group ${
              isRippleEnabled
                ? 'bg-white/15 hover:bg-white/25 border-white/40 text-white'
                : 'bg-black/30 hover:bg-black/45 border-white/15 text-white/50'
            }`}
          >
            <span className="relative flex items-center justify-center" suppressHydrationWarning>
              <Droplets
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  isRippleEnabled ? 'text-white scale-100' : 'text-white/40 scale-90'
                }`}
              />
              {!isRippleEnabled && (
                <span className="absolute w-4 h-[1.5px] bg-white/70 rotate-45 pointer-events-none" />
              )}
            </span>
            <span
              suppressHydrationWarning
              className={`text-[10px] font-medium tracking-[0.2em] uppercase transition-colors hidden sm:inline ${
                isRippleEnabled ? 'text-white' : 'text-white/45'
              }`}
            >
              {isRippleEnabled ? (isThai ? 'ผิวน้ำ' : 'Water FX') : isThai ? 'ปิดคลื่น' : 'FX Off'}
            </span>
          </button>
        </div>

        {/* Hero Content Container - pointer-events-none allows cursor movement over text to reach water ripples */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full pt-16 sm:pt-20 pointer-events-none">
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

            {/* CTA Link — Explore Collection → (pointer-events-auto enables clicking button) */}
            <div className="pt-2 sm:pt-4">
              <Link
                href={btn1Url}
                className="group inline-flex items-center gap-3 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-white hover:text-amber-200 transition-all drop-shadow-sm pointer-events-auto"
              >
                <span className="w-7 h-[1.5px] bg-white group-hover:w-11 group-hover:bg-amber-200 transition-all" />
                <span>{btn1Label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Left — Scroll to explore indicator with architectural mouse icon */}
        <div className="absolute bottom-8 sm:bottom-10 left-6 sm:left-10 lg:left-12 z-10 flex items-center gap-3 text-white/85 text-[11px] sm:text-xs uppercase tracking-[0.22em] font-light drop-shadow-sm pointer-events-none select-none">
          <div className="w-[18px] h-[28px] rounded-full border-[1.5px] border-white/75 flex items-start justify-center pt-1.5">
            <span className="w-[2px] h-[5px] bg-white rounded-full animate-bounce" />
          </div>
          <span>{isThai ? 'เลื่อนเพื่อสัมผัสประสบการณ์' : 'Scroll to explore'}</span>
        </div>
      </section>
    </>
  );
};
