import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { sanitizeUrl } from '@/lib/cms-utils';

export interface CMSFooterProps {
  content?: {
    title?: string;
    subtitle?: string;
    settings?: {
      brandDesc?: string;
      address?: string;
      phone?: string;
      email?: string;
      businessHours?: string;
      copyright?: string;
    };
  };
}

export const CMSFooter: React.FC<CMSFooterProps> = ({ content }) => {
  const settings = content?.settings || {};
  const brandName = content?.title || 'SUNMA';
  const tagline = content?.subtitle || 'BANGKOK SHOWROOM & ATELIER';
  const brandDesc = settings.brandDesc || 'Distributor, direct importer, and private-label manufacturer of architectural porcelain slabs and luxury ceramic surface solutions.';
  const address = settings.address || '88/12 Sukhumvit 55 Road, Klongtan Nua, Vadhana, Bangkok 10110';
  const phone = settings.phone || '+66 (0) 2-800-9999 / +66 (0) 81-234-5678';
  const email = settings.email || 'project@sunmaceramic.com';
  const businessHours = settings.businessHours || 'Mon - Sat: 09:00 - 18:00 (Except Public Holidays)';
  const copyright = settings.copyright || `© ${new Date().getFullYear()} SUNMA CERAMIC CO., LTD. All rights reserved.`;

  return (
    <footer className="bg-bg-secondary border-t border-border-subtle pt-20 pb-12 text-txt-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-14 border-b border-border-subtle">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-normal tracking-[0.25em] text-txt-main">
                  {brandName}
                </span>
                <span className="text-[9px] tracking-[0.45em] font-medium text-txt-muted uppercase -mt-0.5">
                  CERAMIC ATELIER
                </span>
              </div>
            </Link>
            <p className="text-xs text-txt-muted leading-relaxed">
              {brandDesc}
            </p>
            <div className="pt-2 text-[10.5px] text-gold font-semibold tracking-widest uppercase">
              {tagline}
            </div>
          </div>

          {/* Architectural Collections */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-txt-main">
              Architectural Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-txt-muted">
              <li>
                <Link href="/shop?category=floor-tiles" className="hover:text-txt-main transition-colors">
                  Floor Tiles & Porcelain Slabs
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wall-tiles" className="hover:text-txt-main transition-colors">
                  Fluted & Relief Wall Surfaces
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bathroom-tiles" className="hover:text-txt-main transition-colors">
                  Sanctuary Bathroom Surfaces
                </Link>
              </li>
              <li>
                <Link href="/shop?category=outdoor-tiles" className="hover:text-txt-main transition-colors">
                  20mm Architectural Outdoor Pavers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wood-look-tiles" className="hover:text-txt-main transition-colors">
                  Embossed Timber Ceramic Planks
                </Link>
              </li>
            </ul>
          </div>

          {/* Interactive Tools & Services */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-txt-main">
              Architect & Atelier Services
            </h4>
            <ul className="space-y-2.5 text-xs text-txt-muted">
              <li>
                <Link href="/room-studio" className="hover:text-txt-main transition-colors inline-flex items-center gap-1 text-gold font-medium">
                  SUNMA Room Studio <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-txt-main transition-colors">
                  Craftsmanship & Ethos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-txt-main transition-colors">
                  Project Consultation & Quote
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-txt-main transition-colors">
                  Direct European Imports
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-txt-main transition-colors">
                  Client Portal & Spec Sheets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-txt-main">
              Showroom Atelier
            </h4>
            <div className="space-y-2.5 text-xs text-txt-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{email}</span>
              </div>
              <div className="pt-2 text-[10.5px] text-txt-muted/80 tracking-wider">
                {businessHours}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-txt-muted gap-4">
          <p>{copyright}</p>
          <div className="flex space-x-6">
            <Link href="/about" className="hover:text-txt-main transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-txt-main transition-colors">Terms of Business</Link>
            <Link href="/admin" className="hover:text-gold transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
