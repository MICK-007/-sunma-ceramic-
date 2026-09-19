'use client';

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
import { useLanguage } from '@/context/LanguageContext';

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

export interface CMSAboutPillarsItem {
  id: string;
  title: string;
  description?: string;
  icon_name?: string;
  sort_order?: number;
  is_enabled?: boolean;
  metadata?: {
    titleTh?: string;
    descriptionTh?: string;
    [key: string]: any;
  };
}

export interface CMSAboutPillarsProps {
  content?: {
    title?: string;
    subtitle?: string;
    settings?: any;
    items?: CMSAboutPillarsItem[];
  };
}

const DEFAULT_PILLARS = [
  {
    icon: Building2,
    titleEn: 'Private-Label Sourcing',
    titleTh: 'บริการจัดหาและสั่งผลิตพิเศษ',
    descEn: 'Custom made-to-order manufacturing for luxury private estates, hotel resorts, and commercial developments.',
    descTh: 'สั่งผลิตกระเบื้องและแผ่นหินสเปกเฉพาะสำหรับคฤหาสน์ โรงแรม รีสอร์ต และโครงการอสังหาริมทรัพย์ระดับพรีเมียม',
  },
  {
    icon: Globe2,
    titleEn: 'European Direct Import',
    titleTh: 'นำเข้าตรงจากโรงงานชั้นนำในยุโรป',
    descEn: 'Direct partnerships with historic ceramic mills in Sassuolo, Italy and Castellón, Spain.',
    descTh: 'พันธมิตรโดยตรงกับโรงงานผู้ผลิตกระเบื้องระดับตำนานในแคว้นซาสซูโอโล ประเทศอิตาลี และกัสเตยอน ประเทศสเปน',
  },
  {
    icon: Sparkles,
    titleEn: 'Room Studio Simulation',
    titleTh: 'โปรแกรมจำลองเสมือนจริง Room Studio',
    descEn: 'Proprietary interactive visual scale preview technology matching exact physical tile aspect ratios.',
    descTh: 'เทคโนโลยีจำลองภาพและสัดส่วนกระเบื้องแบบอินเทอร์แอคทีฟตามขนาดจริง ช่วยให้การออกแบบและตัดสินใจแม่นยำสูงสุด',
  },
];

export const CMSAboutPillars: React.FC<CMSAboutPillarsProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const rawItems = content?.items || [];
  const activeItems = rawItems
    .filter(i => i.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (activeItems.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activeItems.map((item, idx) => {
          let meta = item.metadata;
          if (typeof meta === 'string') {
            try {
              meta = JSON.parse(meta);
            } catch (e) {
              meta = {};
            }
          }
          meta = meta || {};

          const IconComponent = (item.icon_name && ICON_MAP[item.icon_name]) ? ICON_MAP[item.icon_name] : Sparkles;
          const title = isThai
            ? meta.titleTh || item.title
            : item.title;
          const description = isThai
            ? meta.descriptionTh || item.description
            : item.description;

          return (
            <div
              key={item.id || idx}
              className="bg-bg-card border border-border-subtle p-8 rounded-[2px] space-y-3.5 hover:border-gold transition-colors shadow-xs text-left"
            >
              <IconComponent className="w-7 h-7 text-gold" />
              <h3 className="font-heading text-lg font-normal text-txt-main">
                {title}
              </h3>
              <p className="text-xs text-txt-muted leading-relaxed font-light whitespace-pre-line">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback to defaults if no items in CMS
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {DEFAULT_PILLARS.map((p, idx) => {
        const IconComponent = p.icon;
        return (
          <div
            key={idx}
            className="bg-bg-card border border-border-subtle p-8 rounded-[2px] space-y-3.5 hover:border-gold transition-colors shadow-xs text-left"
          >
            <IconComponent className="w-7 h-7 text-gold" />
            <h3 className="font-heading text-lg font-normal text-txt-main">
              {isThai ? p.titleTh : p.titleEn}
            </h3>
            <p className="text-xs text-txt-muted leading-relaxed font-light whitespace-pre-line">
              {isThai ? p.descTh : p.descEn}
            </p>
          </div>
        );
      })}
    </div>
  );
};
