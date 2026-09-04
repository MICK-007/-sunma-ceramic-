import React from 'react';
import {
  ShieldCheck,
  Globe2,
  Layers,
  Gem,
  Building2,
  Sparkles,
  Award,
  CheckCircle,
  Truck,
  Compass,
  Maximize2,
  Palette,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Globe2,
  Layers,
  Gem,
  Building2,
  Sparkles,
  Award,
  CheckCircle,
  Truck,
  Compass,
  Maximize2,
  Palette,
};

export interface CMSWhyChooseItem {
  id: string;
  title: string;
  description?: string;
  icon_name?: string;
  sort_order?: number;
  is_enabled?: boolean;
}

export interface CMSWhyChooseProps {
  content: {
    title?: string;
    subtitle?: string;
    items?: CMSWhyChooseItem[];
  };
}

export const CMSWhyChoose: React.FC<CMSWhyChooseProps> = ({ content }) => {
  const subtitle = content.subtitle || 'OUR STANDARDS';
  const title = content.title || 'Why Choose SUNMA CERAMIC';
  const items = (content.items || [])
    .filter(i => i.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (items.length === 0) return null;

  return (
    <section className="bg-bg-secondary border-y border-border-subtle py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
            {subtitle}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-txt-main">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(item => {
            const IconComponent = (item.icon_name && ICON_MAP[item.icon_name]) ? ICON_MAP[item.icon_name] : ShieldCheck;

            return (
              <div key={item.id} className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-stone-light leading-relaxed">{item.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
