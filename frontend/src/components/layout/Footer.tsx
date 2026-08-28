'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-bg-secondary border-t border-border-subtle pt-16 pb-12 text-txt-muted text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border-subtle">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold tracking-[0.25em] text-txt-main">
                  SUNMA
                </span>
                <span className="text-[10px] tracking-[0.4em] font-semibold text-stone uppercase -mt-1">
                  CERAMIC
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-light leading-relaxed">
              Distributor, direct importer, and private-label manufacturer of architectural porcelain slabs and luxury ceramic surface solutions.
            </p>
            <div className="pt-2 text-xs text-gold font-semibold tracking-wider uppercase">
              BANGKOK SHOWROOM & ATELIER
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-txt-main">
              Architectural Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop?category=floor-tiles" className="hover:text-gold transition-colors">
                  Floor Tiles & Slabs
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wall-tiles" className="hover:text-gold transition-colors">
                  Fluted & Relief Wall Tiles
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bathroom-tiles" className="hover:text-gold transition-colors">
                  Sanctuary Bathroom Tiles
                </Link>
              </li>
              <li>
                <Link href="/shop?category=outdoor-tiles" className="hover:text-gold transition-colors">
                  20mm Outdoor Pavers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wood-look-tiles" className="hover:text-gold transition-colors">
                  Embossed Wood-look Planks
                </Link>
              </li>
            </ul>
          </div>

          {/* Interactive Tools & Services */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-txt-main">
              Architect & B2B Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/room-studio" className="hover:text-gold transition-colors inline-flex items-center gap-1 text-gold font-semibold">
                  SUNMA Room Studio V1 <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About SUNMA CERAMIC
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Project Quotation Request
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-gold transition-colors">
                  Direct European Imports
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-gold transition-colors">
                  Tax Invoice & Account Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-txt-main">
              Showroom Contact
            </h4>
            <div className="space-y-2.5 text-xs text-stone-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>88/12 Sukhumvit 55 Road, Klongtan Nua, Vadhana, Bangkok 10110</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+66 (0) 2-800-9999 / +66 (0) 81-234-5678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>project@sunmaceramic.com</span>
              </div>
              <div className="pt-2 text-[11px] text-stone">
                Mon - Sat: 09:00 - 18:00 (Except Public Holidays)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone gap-4">
          <p>© {new Date().getFullYear()} SUNMA CERAMIC CO., LTD. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/about" className="hover:text-txt-main transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-txt-main transition-colors">Terms of Business</Link>
            <Link href="/admin" className="hover:text-gold transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
