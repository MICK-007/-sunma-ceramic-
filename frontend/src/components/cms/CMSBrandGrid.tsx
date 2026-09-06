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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block">
          {subtitle}
        </span>
        <h2 className="font-heading text-3xl font-normal text-txt-main">
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
              className="luxury-card rounded-[2px] p-6 text-center space-y-3 flex flex-col justify-between group border border-border-subtle hover:border-gold transition-all"
            >
              <div className="font-heading text-lg font-normal text-txt-main group-hover:text-gold transition-colors tracking-widest uppercase">
                {b.title}
              </div>
              {b.description && (
                <p className="text-xs text-txt-muted font-light line-clamp-2 leading-relaxed">{b.description}</p>
              )}
              {b.badge_tag && (
                <span className="text-[10px] font-medium text-gold uppercase tracking-widest block pt-3 border-t border-border-subtle">
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
