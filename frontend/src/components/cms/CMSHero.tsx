import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Gem, ArrowRight, Sparkles } from 'lucide-react';
import { sanitizeUrl } from '@/lib/cms-utils';
import { resolveMediaUrl } from '@/lib/media';
import { useLanguage } from '@/context/LanguageContext';

export interface CMSHeroProps {
  content: {
    id: string;
    title?: string;
    subtitle?: string;
    settings?: {
      eyebrow?: string;
      bgImage?: string;
      btn1Label?: string;
      btn1Url?: string;
      btn2Label?: string;
      btn2Url?: string;
    };
  };
}

export const CMSHero: React.FC<CMSHeroProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const settings = content.settings || {};
  const isDefaultEyebrow = !settings.eyebrow || settings.eyebrow === 'LUXURY CERAMIC TILES';
  const eyebrow = isThai && isDefaultEyebrow
    ? 'กระเบื้องสถาปัตยกรรมระดับพรีเมียม'
    : (settings.eyebrow || 'LUXURY CERAMIC TILES');

  const isDefaultHeadline = !content.title || content.title === 'ARCHITECTURAL SURFACE ATELIER';
  const headline = isThai && isDefaultHeadline
    ? 'สตูดิโอกระเบื้องสถาปัตยกรรมและพื้นผิวระดับพรีเมียม'
    : (content.title || 'ARCHITECTURAL SURFACE ATELIER');

  const isDefaultDesc = !content.subtitle || content.subtitle === "Discover Thailand's finest curated porcelain slabs, relief wall tiles, and engineered architectural surface solutions.";
  const description = isThai && isDefaultDesc
    ? 'ค้นพบคอลเลกชันแผ่นพอร์ซเลนสแลป กระเบื้องผนังลายนูน และโซลูชันพื้นผิวสถาปัตยกรรมระดับพรีเมียมในประเทศไทย'
    : (content.subtitle || "Discover Thailand's finest curated porcelain slabs, relief wall tiles, and engineered architectural surface solutions.");

  const bgImage = resolveMediaUrl(settings.bgImage) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90';
  const btn1Label = isThai ? 'สำรวจคอลเลกชัน' : (settings.btn1Label || 'Explore Catalog');
  const btn1Url = sanitizeUrl(settings.btn1Url, '/shop');
  const btn2Label = isThai ? 'ทดลองจำลองห้อง Room Studio' : (settings.btn2Label || 'Try Room Studio');
  const btn2Url = sanitizeUrl(settings.btn2Url, '/room-studio');

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center -mt-24 pt-28 overflow-hidden bg-contrast-bg text-white">
      {/* Background Image Overlay with Architectural Treatment */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={headline}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover opacity-60 scale-105 transition-transform duration-[12000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-contrast-bg via-contrast-bg/40 to-black/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[2px] border border-white/25 bg-white/10 backdrop-blur-md text-white text-[11px] font-semibold tracking-[0.3em] uppercase animate-fadeIn">
          <Gem className="w-3.5 h-3.5 text-gold" />
          {eyebrow}
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]">
          {headline}
        </h1>

        <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
          {description}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={btn1Url}>
            <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-lg">
              {btn1Label} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href={btn2Url}>
            <button className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-xs font-semibold uppercase tracking-widest text-white border border-white/30 bg-black/40 hover:bg-white/15 backdrop-blur-md rounded-[2px] transition-all">
              <Sparkles className="w-4 h-4 mr-2 text-gold" />
              {btn2Label}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
