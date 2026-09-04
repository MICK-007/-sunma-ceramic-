import React from 'react';
import { CMSHero } from './CMSHero';
import { CMSCollectionGrid } from './CMSCollectionGrid';
import { CMSFeaturedProducts } from './CMSFeaturedProducts';
import { CMSBrandGrid } from './CMSBrandGrid';
import { CMSWhyChoose } from './CMSWhyChoose';
import { CMSB2BCTA } from './CMSB2BCTA';
import { CMSFooter } from './CMSFooter';

export interface CmsSectionData {
  id: string;
  section_key: string;
  section_type: string;
  title?: string;
  subtitle?: string;
  sort_order?: number;
  is_enabled?: boolean;
  settings?: any;
  items?: any[];
}

export interface CmsSectionRendererProps {
  sections: CmsSectionData[];
}

const SECTION_COMPONENTS: Record<string, React.ComponentType<{ content: any }>> = {
  HERO: CMSHero,
  COLLECTION_GRID: CMSCollectionGrid,
  FEATURED_PRODUCTS: CMSFeaturedProducts,
  BRAND_GRID: CMSBrandGrid,
  WHY_CHOOSE: CMSWhyChoose,
  B2B_CTA: CMSB2BCTA,
  FOOTER: CMSFooter,
};

export const CmsSectionRenderer: React.FC<CmsSectionRendererProps> = ({ sections }) => {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  // Filter out disabled sections and sort by sort_order
  const activeSections = sections
    .filter(sec => sec && sec.is_enabled !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <>
      {activeSections.map(sec => {
        const Component = SECTION_COMPONENTS[sec.section_type];

        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[CMS Warning] Unknown or unsupported section type: '${sec.section_type}'`);
          }
          return null;
        }

        return (
          <React.Fragment key={sec.id || sec.section_key}>
            <Component content={sec} />
          </React.Fragment>
        );
      })}
    </>
  );
};
