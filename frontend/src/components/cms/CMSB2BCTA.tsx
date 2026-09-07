import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Building2, ArrowRight } from 'lucide-react';
import { sanitizeUrl } from '@/lib/cms-utils';

export interface CMSB2BCTAProps {
  content: {
    title?: string;
    subtitle?: string;
    settings?: {
      description?: string;
      buttonLabel?: string;
      buttonUrl?: string;
    };
  };
}

import { useLanguage } from '@/context/LanguageContext';

export const CMSB2BCTA: React.FC<CMSB2BCTAProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const subtitle = isThai
    ? 'บริการสำหรับสถาปนิกและผู้รับเหมา'
    : (content.subtitle || 'ARCHITECT & CONTRACTOR SERVICES');
  const title = isThai
    ? 'จัดหากระเบื้องสำหรับโครงการสถาปัตยกรรมและพาณิชย์'
    : (content.title || 'Architect & Commercial Project Supply');
  const description = isThai
    ? 'ราคาส่งพิเศษสำหรับโครงการ บริการตัดแผ่นสแลปตามแบบ ชุดตัวอย่างกระเบื้อง และทีมสนับสนุนงานสเปกสำหรับสถาปนิก อินทีเรียร์ และผู้พัฒนาอสังหาริมทรัพย์'
    : (content.settings?.description || 'Special wholesale rates, custom slab cutting, sample kits, and project specifier support for architects, interior designers, and real estate developers.');
  const buttonLabel = isThai
    ? 'ขอใบเสนอราคาโครงการ'
    : (content.settings?.buttonLabel || 'Request Project Quote');
  const buttonUrl = sanitizeUrl(content.settings?.buttonUrl, '/contact');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-contrast-surface border border-white/15 rounded-[2px] p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
        <div className="space-y-4 max-w-xl text-left">
          <div className="inline-flex items-center gap-2 text-gold text-[10.5px] font-semibold uppercase tracking-[0.25em]">
            <Building2 className="w-4 h-4 text-gold" />
            {subtitle}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-normal text-white leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed">
            {description}
          </p>
        </div>

        <Link href={buttonUrl}>
          <Button variant="gold" size="lg" className="shadow-lg whitespace-nowrap">
            {buttonLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};
