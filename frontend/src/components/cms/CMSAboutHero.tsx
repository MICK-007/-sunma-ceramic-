'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/media';

export interface CMSAboutHeroProps {
  content?: {
    title?: string;
    subtitle?: string;
    settings?: {
      eyebrow?: string;
      eyebrowTh?: string;
      title?: string;
      titleTh?: string;
      description?: string;
      descriptionTh?: string;
      bgImage?: string;
    };
  };
}

export const CMSAboutHero: React.FC<CMSAboutHeroProps> = ({ content }) => {
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

  const defaultEyebrowEn = 'THE ARCHITECTURAL ATELIER';
  const defaultEyebrowTh = 'สตูดิโอสถาปัตยกรรมและแผ่นหินพอร์ซเลน';
  const defaultTitle = 'SUNMA CERAMIC';
  const defaultDescEn =
    'SUNMA CERAMIC is a premium architectural ceramic atelier, direct European importer, and bespoke surface manufacturer serving private residential estates, architects, interior designers, and commercial developments.';
  const defaultDescTh =
    'SUNMA CERAMIC คือสตูดิโอนำเข้าและจัดจำหน่ายกระเบื้องแผ่นพอร์ซเลนระดับพรีเมียมจากยุโรปโดยตรง พร้อมบริการรับผลิตพิเศษ Made-to-Order สำหรับโครงการบ้านพักอาศัยระดับลักชัวรี สถาปนิก มัณฑนากร และโครงการอสังหาริมทรัพย์ชั้นนำ';
  const defaultImage =
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80';

  const eyebrow = isThai
    ? settings.eyebrowTh || settings.eyebrow || defaultEyebrowTh
    : settings.eyebrow || defaultEyebrowEn;

  const title = isThai
    ? settings.titleTh || content?.title || settings.title || defaultTitle
    : content?.title || settings.title || defaultTitle;

  const description = isThai
    ? settings.descriptionTh || settings.description || defaultDescTh
    : settings.description || defaultDescEn;

  const rawImage = settings.bgImage || defaultImage;
  const imageSrc = resolveMediaUrl(rawImage);

  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block">
          {eyebrow}
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-normal text-txt-main tracking-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-txt-muted leading-relaxed font-light whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="relative w-full group">
        {/* Soft Warm White / Pearl Ivory Ambient Aura Glow backdrop */}
        <div 
          className="absolute -inset-2 sm:-inset-4 rounded-xl opacity-75 sm:opacity-85 blur-2xl transition-all duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 253, 245, 0.9) 0%, rgba(248, 245, 235, 0.6) 45%, rgba(255, 255, 255, 0) 75%)',
          }}
          aria-hidden="true"
        />

        <div className="relative aspect-[21/9] w-full rounded-[2px] overflow-hidden border border-border-subtle shadow-xl bg-surface">
          <Image
            src={imageSrc}
            alt={title || 'SUNMA Showroom Interior'}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>
    </div>
  );
};
