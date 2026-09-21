'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, FileCheck, LockKeyhole } from 'lucide-react';

export interface CMSAboutPrivacyProps {
  content?: {
    title?: string;
    subtitle?: string;
    settings?: {
      badge?: string;
      badgeTh?: string;
      title?: string;
      titleTh?: string;
      intro?: string;
      introTh?: string;
      policy1Title?: string;
      policy1TitleTh?: string;
      policy1Desc?: string;
      policy1DescTh?: string;
      policy2Title?: string;
      policy2TitleTh?: string;
      policy2Desc?: string;
      policy2DescTh?: string;
      policy3Title?: string;
      policy3TitleTh?: string;
      policy3Desc?: string;
      policy3DescTh?: string;
    };
  };
}

export const CMSAboutPrivacy: React.FC<CMSAboutPrivacyProps> = ({ content }) => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  let settings = content?.settings || {};
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch (e) {
      settings = {};
    }
  }

  const defaultBadgeEn = 'LEGAL & COMPLIANCE';
  const defaultBadgeTh = 'นโยบายและการคุ้มครองข้อมูล';

  const defaultTitleEn = 'Privacy Policy & Architectural Data Protection';
  const defaultTitleTh = 'นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลโครงการ';

  const defaultIntroEn =
    'At SUNMA CERAMIC, we uphold the highest international confidentiality standards for all private residential commissions, architectural specifications, and bespoke sourcing inquiries.';
  const defaultIntroTh =
    'ที่ SUNMA CERAMIC เรายึดมั่นในมาตรฐานการรักษาความลับระดับสากลสูงสุดสำหรับข้อมูลสเปกโครงการสถาปัตยกรรม บ้านพักอาศัยส่วนบุคคล และข้อมูลการสั่งผลิตกระเบื้องพิเศษทุกรายการ';

  const badge = isThai
    ? settings.badgeTh || settings.badge || defaultBadgeTh
    : settings.badge || defaultBadgeEn;

  const title = isThai
    ? settings.titleTh || content?.title || settings.title || defaultTitleTh
    : content?.title || settings.title || defaultTitleEn;

  const intro = isThai
    ? settings.introTh || settings.intro || defaultIntroTh
    : settings.intro || defaultIntroEn;

  const policies = [
    {
      icon: ShieldCheck,
      title: isThai
        ? settings.policy1TitleTh || settings.policy1Title || 'การรักษาความลับข้อมูลโครงการและแบบสถาปัตยกรรม'
        : settings.policy1Title || 'Client & Project Confidentiality',
      desc: isThai
        ? settings.policy1DescTh || settings.policy1Desc || 'แบบสถาปัตยกรรม สเกลพื้นที่ และงบประมาณโครงการที่ส่งให้ฝ่ายสเปกโครงการ จะถูกเก็บรักษาเป็นความลับสูงสุด ไม่มีการเปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับอนุญาต'
        : settings.policy1Desc || 'All architectural blueprints, dimensional scale drawings, and private residence project budgets shared with our specification desk remain strictly confidential.',
    },
    {
      icon: FileCheck,
      title: isThai
        ? settings.policy2TitleTh || settings.policy2Title || 'ความโปร่งใสและการจัดเก็บข้อมูลคำสั่งผลิต'
        : settings.policy2Title || 'Material Sourcing & Order Integrity',
      desc: isThai
        ? settings.policy2DescTh || settings.policy2Desc || 'ข้อมูลการติดต่อและข้อมูลบริษัทจะถูกใช้เพื่อการออกใบเสนอราคา การจัดส่งชุดตัวอย่างกระเบื้อง และการประสานงานขนส่งไปยังไซต์งานเท่านั้น'
        : settings.policy2Desc || 'Personal details and company information collected through our inquiry forms are used solely for processing quotation requests, sample kit dispatch, and logistics coordination.',
    },
    {
      icon: LockKeyhole,
      title: isThai
        ? settings.policy3TitleTh || settings.policy3Title || 'ความปลอดภัยดิจิทัลและมาตรฐานความปลอดภัย'
        : settings.policy3Title || 'Digital Security & Cookie Governance',
      desc: isThai
        ? settings.policy3DescTh || settings.policy3Desc || 'ระบบเว็บไซต์ทำงานบนมาตรฐานความปลอดภัย SSL เข้ารหัสข้อมูลระดับสูง ปกป้องข้อมูลบัญชีผู้ใช้และบันทึกใบเสนอราคาอย่างปลอดภัย'
        : settings.policy3Desc || 'Our web platform operates on enterprise-grade encrypted SSL protocols with strict session token security, protecting your client account and quotation records.',
    },
  ];

  return (
    <section id="privacy" className="pt-16 pb-6 scroll-mt-24 border-t border-border-subtle">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[11px] uppercase font-semibold tracking-[0.25em] text-gold block">
            {badge}
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl text-txt-main tracking-tight font-normal">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-txt-muted max-w-2xl mx-auto leading-relaxed font-light">
            {intro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policies.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF9F6] border border-border-subtle/80 p-6 rounded-[2px] space-y-3 hover:border-gold/40 transition-colors shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-txt-main">
                  {p.title}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
