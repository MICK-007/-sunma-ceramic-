import React from 'react';
import Link from 'next/link';
import { sanitizeUrl } from '@/lib/cms-utils';

export interface CMSBrandItem {
  id: string;
  title: string;
  description?: string;
  badge_tag?: string;
  link_url?: string;
  sort_order?: number;
  is_enabled?: boolean;
}

export interface CMSBrandGridProps {
  content: {
    title?: string;
    subtitle?: string;
    items?: CMSBrandItem[];
  };
}

export const CMSBrandGrid: React.FC<CMSBrandGridProps> = ({ content }) => {
  const subtitle = content.subtitle || 'MANUFACTURERS & IMPORTS';
  const title = content.title || 'Global Tile Manufacturers & Ateliers';
  const items = (content.items || [])
    .filter(b => b.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
          {subtitle}
        </span>
        <h2 className="font-heading text-2xl font-bold text-txt-main">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(b => {
          const href = sanitizeUrl(b.link_url, `/shop?search=${encodeURIComponent(b.title)}`);

          return (
            <Link
              key={b.id}
              href={href}
              className="luxury-card rounded-lg p-6 text-center space-y-3 flex flex-col justify-between group"
            >
              <div className="font-heading text-xl font-bold text-white group-hover:text-gold transition-colors tracking-widest">
                {b.title}
              </div>
              {b.description && (
                <p className="text-xs text-stone line-clamp-2">{b.description}</p>
              )}
              {b.badge_tag && (
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider block pt-2 border-t border-border-subtle">
                  Origin: {b.badge_tag}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};
