'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { ArchitecturalHero } from '@/components/home/ArchitecturalHero';
import { InteriorRoomShowcase } from '@/components/home/InteriorRoomShowcase';
import { TileCategoriesGrid } from '@/components/home/TileCategoriesGrid';
import { BrandFeaturesBar } from '@/components/home/BrandFeaturesBar';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';

export default function HomePage() {
  const [cmsSections, setCmsSections] = useState<any[] | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sunma_cms_home_sections');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    // Dynamic CMS Data Binding
    api.getPublicCmsPage('home')
      .then(res => {
        if (res && res.success && res.data && res.data.sections) {
          setCmsSections(res.data.sections);
          try {
            localStorage.setItem('sunma_cms_home_sections', JSON.stringify(res.data.sections));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Find hero section from CMS if published
  const heroSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'HERO' || s.section_key === 'hero')
  );

  // Find why_choose section from CMS if published
  const whyChooseSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'WHY_CHOOSE' || s.section_key === 'why_choose')
  );

  // Filter out any published sections that might augment the page (e.g. B2B services, Brand partners)
  const additionalCmsSections = (cmsSections || []).filter(
    s => s && s.is_enabled !== false && s.section_type !== 'HERO' && s.section_type !== 'WHY_CHOOSE' && s.section_key !== 'hero' && s.section_key !== 'why_choose'
  );

  return (
    <div className="w-full bg-[#FAF9F6] overflow-x-hidden">
      {/* 1. HERO SECTION — Modern Architectural Villa (Connected to CMS) */}
      <ArchitecturalHero content={heroSection} />

      {/* 2. INTERIOR ROOM SHOWCASE — Living Room & Kitchen with Collection Popups */}
      <InteriorRoomShowcase />

      {/* 3. CATEGORIES SECTION — 5-Column Minimalist Tile Grid */}
      <TileCategoriesGrid />

      {/* 4. FEATURES SECTION — Why Choose SUNMA Ceramic (Connected to CMS) */}
      <BrandFeaturesBar content={whyChooseSection} />

      {/* 5. DYNAMIC CMS SECTIONS (B2B Project Partner, Brand Partners, etc.) */}
      {additionalCmsSections.length > 0 && (
        <div className="w-full space-y-12 pb-12">
          <CmsSectionRenderer sections={additionalCmsSections} />
        </div>
      )}
    </div>
  );
}
