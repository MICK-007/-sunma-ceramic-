import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { sanitizeUrl } from '@/lib/cms-utils';
import { resolveMediaUrl } from '@/lib/media';

export interface CMSCollectionItem {
  id: string;
  title: string;
  description?: string;
  custom_image_url?: string;
  link_url?: string;
  sort_order?: number;
  is_enabled?: boolean;
}

export interface CMSCollectionGridProps {
  content: {
    title?: string;
    subtitle?: string;
    items?: CMSCollectionItem[];
  };
}

const DEFAULT_FALLBACK_IMAGE = '/images/tiles/calacatta-marble.jpeg';

const CollectionImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== DEFAULT_FALLBACK_IMAGE) {
          setCurrentSrc(DEFAULT_FALLBACK_IMAGE);
        }
      }}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 pointer-events-none"
    />
  );
};

export const CMSCollectionGrid: React.FC<CMSCollectionGridProps> = ({ content }) => {
  const subtitle = content.subtitle || 'ARCHITECTURAL SERIES';
  const title = content.title || 'Curated Tile Collections';
  const items = (content.items || [])
    .filter(item => item.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block">
          {subtitle}
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-normal text-txt-main">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
        {items.map(col => {
          const href = sanitizeUrl(col.link_url, '/shop');
          const imageSrc = resolveMediaUrl(col.custom_image_url) || DEFAULT_FALLBACK_IMAGE;

          return (
            <Link
              key={col.id}
              href={href}
              className="luxury-card group rounded-[2px] overflow-hidden relative aspect-[3/4] flex flex-col justify-end p-6 border border-border-subtle hover:border-gold transition-all"
            >
              <CollectionImage src={imageSrc} alt={col.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative z-10 space-y-1.5 text-left">
                <h3 className="font-heading text-xl font-normal text-white group-hover:text-gold transition-colors">
                  {col.title}
                </h3>
                {col.description && (
                  <p className="text-[11.5px] text-white/70 line-clamp-2 font-light leading-relaxed">
                    {col.description}
                  </p>
                )}
                <span className="text-[10px] font-semibold text-gold uppercase tracking-[0.2em] inline-flex items-center gap-1 pt-2">
                  Explore Series <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
