'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { ArchitecturalHero } from '@/components/home/ArchitecturalHero';
import { InteriorRoomShowcase } from '@/components/home/InteriorRoomShowcase';
import { TileCategoriesGrid } from '@/components/home/TileCategoriesGrid';
import { BrandFeaturesBar } from '@/components/home/BrandFeaturesBar';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';

export default function HomePage() {
  const [cmsSections, setCmsSections] = useState<any[] | null>(null);

  useEffect(() => {
    // Read cache on client mount (SSR-safe)
    try {
      const cached = localStorage.getItem('sunma_cms_home_sections');
      if (cached) setCmsSections(JSON.parse(cached));
    } catch (e) {}

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

  // Find room showcase section from CMS if published
  const roomShowcaseSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'ROOM_SHOWCASE' || s.section_key === 'room_showcase')
  );

  // Find why_choose section from CMS if published
  const whyChooseSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'WHY_CHOOSE' || s.section_key === 'why_choose')
  );

  // Find collections section from CMS if published
  const collectionsSection = (cmsSections || []).find(
    s => s && s.is_enabled !== false && (s.section_type === 'COLLECTION_GRID' || s.section_key === 'collections')
  );

  // Filter out any published sections that are already explicitly rendered in the bespoke layout
  const additionalCmsSections = (cmsSections || []).filter(
    s => s && s.is_enabled !== false && 
      s.section_type !== 'HERO' && s.section_key !== 'hero' &&
      s.section_type !== 'ROOM_SHOWCASE' && s.section_key !== 'room_showcase' &&
      s.section_type !== 'COLLECTION_GRID' && s.section_key !== 'collections' &&
      s.section_type !== 'WHY_CHOOSE' && s.section_key !== 'why_choose'
  );

  return (
    <div className="w-full bg-[#FAF9F6] overflow-x-hidden">
      {/* 1. HERO SECTION — Modern Architectural Villa (Connected to CMS) */}
      <ArchitecturalHero content={heroSection} />

      {/* 2. INTERIOR ROOM SHOWCASE — Living Room & Kitchen with Collection Popups (Connected to CMS) */}
      <InteriorRoomShowcase content={roomShowcaseSection} />

      {/* 3. CATEGORIES SECTION — Curated Tile Collections (Connected to CMS) */}
      <TileCategoriesGrid content={collectionsSection} />

      {/* 4. FEATURES SECTION — Why Choose SUNMA Ceramic (Connected to CMS) */}
      <BrandFeaturesBar content={whyChooseSection} />

      {/* 5. DYNAMIC CMS SECTIONS (B2B Project Partner, Brand Partners, etc.) */}
      {additionalCmsSections.length > 0 && (
        <div className="w-full space-y-16 sm:space-y-24 pb-16">
          <CmsSectionRenderer sections={additionalCmsSections} />
        </div>
      )}
    </div>
  );
}
