'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import { CMSContactInfo } from '@/components/cms/CMSContactInfo';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';

export default function ContactPage() {
  const { language } = useLanguage();
  const isThai = language === 'TH';
  const [cmsSections, setCmsSections] = useState<any[]>([]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('sunma_cms_contact_sections');
      if (cached) setCmsSections(JSON.parse(cached));
    } catch (e) {}

    api.getPublicCmsPage('contact')
      .then(res => {
        if (res && res.success && res.data && res.data.sections) {
          setCmsSections(res.data.sections);
          try {
            localStorage.setItem('sunma_cms_contact_sections', JSON.stringify(res.data.sections));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const contactSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'CONTACT_INFO' || s.section_key === 'contact_info')
  );

  const otherSections = (cmsSections || []).filter(
    s => s && s.is_enabled !== false &&
      s.section_type !== 'CONTACT_INFO' && s.section_key !== 'contact_info'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Breadcrumb items={[{ label: isThai ? 'ติดต่อเราและขอใบเสนอราคา' : 'Contact & Quotations' }]} />

      <CMSContactInfo content={contactSection} />

      {otherSections.length > 0 && <CmsSectionRenderer sections={otherSections} />}
    </div>
  );
}

