import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { sanitizeUrl } from '@/lib/cms-utils';

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

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80';

export const CMSCollectionGrid: React.FC<CMSCollectionGridProps> = ({ content }) => {
  const subtitle = content.subtitle || 'ARCHITECTURAL SERIES';
  const title = content.title || 'Curated Tile Collections';
  const items = (content.items || [])
    .filter(item => item.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
          {subtitle}
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-txt-main">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(col => {
          const href = sanitizeUrl(col.link_url, '/shop');
          const imageSrc = col.custom_image_url || DEFAULT_FALLBACK_IMAGE;

          return (
            <Link
              key={col.id}
              href={href}
              className="luxury-card group rounded-lg overflow-hidden relative aspect-[3/4] flex flex-col justify-end p-6"
            >
              <Image
                src={imageSrc}
                alt={col.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="relative z-10 space-y-1">
                <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold transition-colors">
                  {col.title}
                </h3>
                {col.description && (
                  <p className="text-xs text-stone-light line-clamp-2">{col.description}</p>
                )}
                <span className="text-[11px] font-bold text-gold uppercase tracking-wider inline-flex items-center gap-1 pt-2">
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
