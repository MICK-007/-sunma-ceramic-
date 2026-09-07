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

import { sanitizeUrl } from '@/lib/cms-utils';
import { useLanguage } from '@/context/LanguageContext';

const WHY_CHOOSE_TH_MAP: Record<string, { title: string; description: string }> = {
  '100% Certified Quality': {
    title: 'คุณภาพมาตรฐานสากล 100%',
    description: 'ผ่านมาตรฐานยุโรป ISO 13006 และ EN 14411 รองรับการใช้งานเชิงพาณิชย์และที่พักอาศัยอย่างทนทานยาวนาน',
  },
  'Direct Global Importer': {
    title: 'ผู้นำเข้าตรงจากโรงงานระดับโลก',
    description: 'ร่วมมือโดยตรงกับโรงงานชั้นนำระดับสากล ปราศจากคนกลางเพื่อราคาที่ดีที่สุดสำหรับผู้พัฒนาโครงการ',
  },
  'Complete Surface Solutions': {
    title: 'โซลูชันพื้นผิวครบวงจร',
    description: 'ครอบคลุมตั้งแต่แผ่นพอร์ซเลนบาง 6 มม. สำหรับผนัง ไปจนถึงกระเบื้องปูภายนอกหนาพิเศษ 20 มม.',
  },
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
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const isDefaultSubtitle = !content.subtitle || content.subtitle === 'OUR STANDARDS';
  const subtitle = isThai && isDefaultSubtitle
    ? 'มาตรฐานระดับสากล'
    : (content.subtitle || 'OUR STANDARDS');

  const isDefaultTitle = !content.title || content.title === 'Why Choose SUNMA CERAMIC';
  const title = isThai && isDefaultTitle
    ? 'ทำไมต้องเลือก SUNMA CERAMIC'
    : (content.title || 'Why Choose SUNMA CERAMIC');

  const items = (content.items || [])
    .filter(i => i.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (items.length === 0) return null;

  return (
    <section className="bg-bg-secondary border-y border-border-subtle py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2.5">
          <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block">
            {subtitle}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-normal text-txt-main">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(item => {
            const IconComponent = (item.icon_name && ICON_MAP[item.icon_name]) ? ICON_MAP[item.icon_name] : ShieldCheck;

            return (
              <div key={item.id} className="bg-bg-card border border-border-subtle rounded-[2px] p-8 space-y-4 hover:border-gold transition-colors">
                <div className="w-12 h-12 rounded-[2px] bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-normal text-txt-main">
                  {isThai ? (WHY_CHOOSE_TH_MAP[item.title]?.title || item.title) : item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-txt-muted font-light leading-relaxed">
                    {isThai ? (WHY_CHOOSE_TH_MAP[item.title]?.description || item.description) : item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
