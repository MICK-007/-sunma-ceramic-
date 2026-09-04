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

export const CMSB2BCTA: React.FC<CMSB2BCTAProps> = ({ content }) => {
  const subtitle = content.subtitle || 'ARCHITECT & CONTRACTOR SERVICES';
  const title = content.title || 'Architect & Commercial Project Supply';
  const description = content.settings?.description || 'Special wholesale rates, custom slab cutting, sample kits, and project specifier support for architects, interior designers, and real estate developers.';
  const buttonLabel = content.settings?.buttonLabel || 'Request Project Quote';
  const buttonUrl = sanitizeUrl(content.settings?.buttonUrl, '/contact');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-bg-card border border-border-subtle rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
            <Building2 className="w-4 h-4 text-gold" />
            {subtitle}
          </div>
          <h2 className="font-heading text-2xl font-bold text-white">
            {title}
          </h2>
          <p className="text-xs text-stone-light leading-relaxed">
            {description}
          </p>
        </div>

        <Link href={buttonUrl}>
          <Button variant="gold" size="lg">
            {buttonLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};
