'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import { CMSAboutHero } from '@/components/cms/CMSAboutHero';
import { CMSAboutPillars } from '@/components/cms/CMSAboutPillars';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';

export default function AboutPage() {
  const { language } = useLanguage();
  const isThai = language === 'TH';
  const [cmsSections, setCmsSections] = useState<any[]>([]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('sunma_cms_about_sections');
      if (cached) setCmsSections(JSON.parse(cached));
    } catch (e) {}

    api.getPublicCmsPage('about')
      .then(res => {
        if (res && res.success && res.data && res.data.sections) {
          setCmsSections(res.data.sections);
          try {
            localStorage.setItem('sunma_cms_about_sections', JSON.stringify(res.data.sections));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const heroSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'ABOUT_HERO' || s.section_key === 'about_hero')
  );

  const pillarsSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'ABOUT_PILLARS' || s.section_key === 'about_pillars')
  );

  const otherSections = (cmsSections || []).filter(
    s => s && s.is_enabled !== false &&
      s.section_type !== 'ABOUT_HERO' && s.section_key !== 'about_hero' &&
      s.section_type !== 'ABOUT_PILLARS' && s.section_key !== 'about_pillars'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumb items={[{ label: isThai ? 'เกี่ยวกับ SUNMA CERAMIC' : 'About SUNMA CERAMIC' }]} />

      <CMSAboutHero content={heroSection} />

      <CMSAboutPillars content={pillarsSection} />

      {otherSections.length > 0 && <CmsSectionRenderer sections={otherSections} />}
    </div>
  );
}

