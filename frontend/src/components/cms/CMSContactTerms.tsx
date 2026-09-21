'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Award, Truck } from 'lucide-react';

export interface CMSContactTermsProps {
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
      term1Title?: string;
      term1TitleTh?: string;
      term1Desc?: string;
      term1DescTh?: string;
      term2Title?: string;
      term2TitleTh?: string;
      term2Desc?: string;
      term2DescTh?: string;
      term3Title?: string;
      term3TitleTh?: string;
      term3Desc?: string;
      term3DescTh?: string;
    };
  };
}

export const CMSContactTerms: React.FC<CMSContactTermsProps> = ({ content }) => {
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

  const defaultBadgeEn = 'SPECIFICATION STANDARDS';
  const defaultBadgeTh = 'ข้อกำหนดและมาตรฐานสเปก';

  const defaultTitleEn = 'Terms of Business & Order Specifications';
  const defaultTitleTh = 'ข้อกำหนดและเงื่อนไขการสั่งซื้อและสเปกโครงการ';

  const defaultIntroEn =
    'To ensure seamless coordination between architectural design intent and physical European tile installation, all SUNMA CERAMIC orders operate under the following verified commercial terms.';
  const defaultIntroTh =
    'เพื่อให้การประสานงานระหว่างงานสเปกสถาปัตยกรรมและการติดตั้งกระเบื้องแผ่นจริงเป็นไปอย่างสมบูรณ์แบบ คำสั่งซื้อทั้งหมดของ SUNMA CERAMIC ดำเนินการภายใต้ข้อกำหนดทางการค้าดังต่อไปนี้';

  const badge = isThai
    ? settings.badgeTh || settings.badge || defaultBadgeTh
    : settings.badge || defaultBadgeEn;

  const title = isThai
    ? settings.titleTh || content?.title || settings.title || defaultTitleTh
    : content?.title || settings.title || defaultTitleEn;

  const intro = isThai
    ? settings.introTh || settings.intro || defaultIntroTh
    : settings.intro || defaultIntroEn;

  const terms = [
    {
      icon: Clock,
      title: isThai
        ? settings.term1TitleTh || settings.term1Title || 'การสั่งผลิตพิเศษและระยะเวลานำเข้าจากยุโรป'
        : settings.term1Title || 'Bespoke Manufacturing & European Lead Time',
      desc: isThai
        ? settings.term1DescTh || settings.term1Desc || 'กระเบื้องแผ่นพอร์ซเลนสั่งผลิตพิเศษและแผ่นสแลปนำเข้าตรงจากโรงงานในแคว้นซาสซูโอโล (อิตาลี) และกัสเตยอน (สเปน) มีระยะเวลาการผลิตและขนส่งทางเรือประมาณ 6–10 สัปดาห์ หลังการยืนยันมัดจำคำสั่งซื้อ'
        : settings.term1Desc || 'Custom porcelain slabs and made-to-order architectural tile batches imported directly from historic mills in Sassuolo, Italy and Castellón, Spain require typical production and sea-freight transit of 6–10 weeks upon deposit confirmation.',
    },
    {
      icon: Award,
      title: isThai
        ? settings.term2TitleTh || settings.term2Title || 'การรับประกันคุณภาพและมาตรฐานยุโรป EN 14411'
        : settings.term2Title || 'Quality Warranties & EN 14411 Standards',
      desc: isThai
        ? settings.term2DescTh || settings.term2Desc || 'กระเบื้องและแผ่นพอร์ซเลนทั้งหมดผ่านมาตรฐานยุโรป ISO 13006 และ EN 14411 กลุ่ม B1a (การดูดซึมน้ำต่ำกว่า 0.5%) ทนความร้อน ทนรอยขีดข่วน ทนคราบฝังลึก และทนสารเคมีอย่างสมบูรณ์'
        : settings.term2Desc || 'All porcelain surfaces comply with European ISO 13006 and EN 14411 Class B1a requirements (water absorption < 0.5%), guaranteeing complete resistance against thermal shock, deep abrasion, surface staining, and chemical agents.',
    },
    {
      icon: Truck,
      title: isThai
        ? settings.term3TitleTh || settings.term3Title || 'ชุดตัวอย่างกระเบื้องและการจัดส่งพาเลทถึงหน้างาน'
        : settings.term3Title || 'Sample Kits & Job-Site Pallet Logistics',
      desc: isThai
        ? settings.term3DescTh || settings.term3Desc || 'ชุดตัวอย่างกระเบื้องจัดส่งถึงสำนักงานสถาปนิกทั่วประเทศภายใน 2 วันทำการ สำหรับคำสั่งซื้อโครงการจัดส่งด้วยรถบรรทุกพร้อมระบบพาเลทไม้อบน้ำยาและเครนยกมาตรฐานเพื่อความปลอดภัยของแผ่นกระเบื้องสูงสุด'
        : settings.term3Desc || 'Architectural sample kits are delivered nationwide within 2 business days. Full project orders are dispatched on heavy-duty fumigated wooden crates with dedicated hydraulic crane offloading to ensure pristine tile condition.',
    },
  ];

  return (
    <section id="terms" className="pt-16 pb-6 scroll-mt-24 border-t border-border-subtle">
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
          {terms.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF9F6] border border-border-subtle/80 p-6 rounded-[2px] space-y-3 hover:border-gold/40 transition-colors shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-txt-main">
                  {t.title}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed font-light">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
