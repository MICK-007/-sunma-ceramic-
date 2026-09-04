import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Gem, ArrowRight, Sparkles } from 'lucide-react';
import { sanitizeUrl } from '@/lib/cms-utils';

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
  const settings = content.settings || {};
  const eyebrow = settings.eyebrow || 'LUXURY CERAMIC TILES';
  const headline = content.title || 'ARCHITECTURAL SURFACE ATELIER';
  const description = content.subtitle || 'Discover Thailand\'s finest curated porcelain slabs, relief wall tiles, and engineered architectural surface solutions.';
  const bgImage = settings.bgImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90';
  const btn1Label = settings.btn1Label || 'Explore Catalog';
  const btn1Url = sanitizeUrl(settings.btn1Url, '/shop');
  const btn2Label = settings.btn2Label || 'Try Room Studio';
  const btn2Url = sanitizeUrl(settings.btn2Url, '/room-studio');

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center -mt-24 pt-24 overflow-hidden bg-black">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={headline}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40 scale-105 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 backdrop-blur-md text-gold text-xs font-bold tracking-[0.3em] uppercase animate-fadeIn">
          <Gem className="w-3.5 h-3.5 text-gold" />
          {eyebrow}
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
          {headline}
        </h1>

        <p className="text-sm sm:text-base text-stone-light max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={btn1Url}>
            <Button variant="gold" size="lg" className="w-full sm:w-auto">
              {btn1Label} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href={btn2Url}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-black/40 backdrop-blur-md">
              <Sparkles className="w-4 h-4 mr-2 text-gold" />
              {btn2Label}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
