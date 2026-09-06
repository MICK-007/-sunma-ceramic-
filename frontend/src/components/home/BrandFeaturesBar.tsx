'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Sparkles, Leaf } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const BrandFeaturesBar: React.FC = () => {
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const features = [
    {
      icon: ShieldCheck,
      titleEn: 'Premium Quality',
      titleTh: 'คุณภาพระดับพรีเมียม',
      subEn: 'European Standard',
      subTh: 'มาตรฐานยุโรปสากล',
    },
    {
      icon: CheckCircle2,
      titleEn: 'Durable & Long Lasting',
      titleTh: 'ทนทาน ใช้งานยาวนาน',
      subEn: 'For Every Space',
      subTh: 'เพื่อทุกพื้นที่การใช้งาน',
    },
    {
      icon: Sparkles,
      titleEn: 'Easy to Clean',
      titleTh: 'ทำความสะอาดง่าย',
      subEn: 'Low Maintenance',
      subTh: 'ไม่กักเก็บคราบสกปรก',
    },
    {
      icon: Leaf,
      titleEn: 'Eco Friendly',
      titleTh: 'เป็นมิตรต่อสิ่งแวดล้อม',
      subEn: 'Sustainable Future',
      subTh: 'กระบวนการผลิตเพื่อความยั่งยืน',
    },
  ];

  return (
    <section className="w-full bg-[#5D554D] text-white py-16 sm:py-20 px-6 sm:px-10 lg:px-12 border-y border-[#4E4740]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">
            {isThai ? 'ทำไมต้องเลือก SUNMA Ceramic' : 'Why Choose SUNMA Ceramic'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 font-light tracking-wide">
            {isThai
              ? 'มากกว่าแค่กระเบื้อง — แต่คือการยกระดับคุณภาพชีวิตที่ดียิ่งกว่า'
              : "More Than Just Tiles — It's a Better Living"}
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 text-center">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center space-y-3 group">
                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white group-hover:border-amber-300 group-hover:text-amber-200 transition-colors">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-medium text-white">
                    {isThai ? item.titleTh : item.titleEn}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-300/80 font-light">
                    {isThai ? item.subTh : item.subEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
