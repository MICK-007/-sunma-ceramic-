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
  metadata?: {
    titleTh?: string;
    descriptionTh?: string;
    badgeTagTh?: string;
    [key: string]: any;
  };
}

export interface CMSBrandGridProps {
  content: {
    title?: string;
    subtitle?: string;
    settings?: any;
    items?: CMSBrandItem[];
  };
}

import { useLanguage } from '@/context/LanguageContext';

export const CMSBrandGrid: React.FC<CMSBrandGridProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  let settings = content.settings || {};
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      settings = {};
    }
  }

  const defaultSubEn = 'MANUFACTURERS & IMPORTS';
  const defaultSubTh = 'ผู้ผลิตและสตูดิโอนำเข้า';
  const rawSub = content.subtitle || defaultSubEn;
  const subtitle = isThai
    ? (settings.subtitleTh || (rawSub !== defaultSubEn ? rawSub : defaultSubTh))
    : rawSub;

  const defaultTitleEn = 'Global Tile Manufacturers & Ateliers';
  const defaultTitleTh = 'แบรนด์กระเบื้องและสตูดิโอระดับโลก';
  const rawTitle = content.title || defaultTitleEn;
  const title = isThai
    ? (settings.titleTh || (rawTitle !== defaultTitleEn ? rawTitle : defaultTitleTh))
    : rawTitle;

  const items = (content.items || [])
    .filter(b => b.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (items.length === 0) return null;

  const getThaiDescription = (titleStr: string, defaultDesc?: string) => {
    if (!isThai) return defaultDesc;
    if (titleStr.includes('SUNMA')) return 'กระเบื้องและแผ่นสแลปพอร์ซเลนสั่งผลิตพิเศษ เกรดงานสถาปัตยกรรมลักชัวรี';
    if (titleStr.includes('MARMI')) return 'กระเบื้องลายหินอ่อนอิตาลีแท้ แผ่นประกบลวดลาย Bookmatched หรูหรา';
    if (titleStr.includes('KUROKIN')) return 'เซรามิกหินญี่ปุ่นเนื้อละเอียด สำหรับงานกรุผนังและสถาปัตยกรรมภายนอก';
    if (titleStr.includes('IBERICA')) return 'กระเบื้องตกแต่งทำมือสไตล์สเปน และแผ่นปูพื้นดินเผาเทอร์ราคอตตาศิลปะ';
    return defaultDesc;
  };

  const formatOriginBadge = (tag?: string, tagTh?: string) => {
    if (!tag && !tagTh) return null;
    if (!isThai) return `Origin: ${tag || tagTh}`;
    if (tagTh) return `แหล่งกำเนิด: ${tagTh}`;
    const countryMap: Record<string, string> = {
      THAILAND: 'ประเทศไทย',
      ITALY: 'อิตาลี',
      JAPAN: 'ญี่ปุ่น',
      SPAIN: 'สเปน',
      GERMANY: 'เยอรมนี',
      FRANCE: 'ฝรั่งเศส',
      CHINA: 'จีน',
      VIETNAM: 'เวียดนาม',
    };
    const countryName = tag ? (countryMap[tag.toUpperCase()] || tag) : '';
    return `แหล่งกำเนิด: ${countryName}`;
  };

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
          let meta = b.metadata;
          if (typeof meta === 'string') {
            try {
              meta = JSON.parse(meta);
            } catch (e) {
              meta = {};
            }
          }
          meta = meta || {};

          const displayTitle = isThai ? (meta.titleTh || b.title) : b.title;
          const href = sanitizeUrl(b.link_url, `/shop?search=${encodeURIComponent(b.title)}`);
          const displayDesc = isThai
            ? (meta.descriptionTh || getThaiDescription(b.title, b.description))
            : b.description;
          const originText = formatOriginBadge(b.badge_tag, meta.badgeTagTh);

          return (
            <Link
              key={b.id}
              href={href}
              className="luxury-card rounded-[2px] p-6 text-center space-y-3 flex flex-col justify-between group border border-border-subtle hover:border-gold transition-all"
            >
              <div className="font-heading text-lg font-normal text-txt-main group-hover:text-gold transition-colors tracking-widest uppercase">
                {displayTitle}
              </div>
              {displayDesc && (
                <p className="text-xs text-txt-muted font-light line-clamp-2 leading-relaxed">{displayDesc}</p>
              )}
              {originText && (
                <span className="text-[10px] font-medium text-gold uppercase tracking-widest block pt-3 border-t border-border-subtle">
                  {originText}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};
