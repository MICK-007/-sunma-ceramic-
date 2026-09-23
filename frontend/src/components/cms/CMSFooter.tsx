'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/media';

export interface CMSFooterProps {
  content?: {
    title?: string;
    subtitle?: string;
    settings?: {
      logoType?: 'text' | 'image';
      logoImageUrl?: string;
      logoText?: string;
      logoSubtitle?: string;
      address?: string;
      addressTh?: string;
      copyright?: string;
      copyrightTh?: string;
      instagramUrl?: string;
      facebookUrl?: string;
      lineUrl?: string;
    };
  };
}

// Authentic LINE bubble icon
const LineIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.365 9.864c0-4.04-4.205-7.325-9.365-7.325-5.16 0-9.365 3.285-9.365 7.325 0 3.623 3.245 6.666 7.64 7.214.298.065.703.198.805.453.092.23.06.59.029.824l-.127.766c-.038.232-.178.91.796.496.974-.413 5.253-3.094 7.17-5.298 1.572-1.74 2.417-3.084 2.417-4.45" />
  </svg>
);

export const CMSFooter: React.FC<CMSFooterProps> = ({ content }) => {
  const pathname = usePathname();
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

  const logoType = settings.logoType || 'text';
  const logoImageUrl = settings.logoImageUrl ? resolveMediaUrl(settings.logoImageUrl) : '';
  const brandName = settings.logoText && settings.logoText !== 'SUNMA' ? settings.logoText : 'TILE STUDIO';
  const brandSubtitle = settings.logoSubtitle || 'CERAMIC ATELIER';

  const defaultAddressEn = '8/32 Moo 3, Pracha Samran Road, Soi Sap Prasit, Khlong Sip Song, Nong Chok, Bangkok 10530';
  const defaultAddressTh = '8/32 ม.3 ถนนประชาสำราญ ซอยทรัพย์ประสิทธิ์ แขวงคลองสิบสอง เขตหนองจอก กทม. 10530';
  const rawAddressEn = settings.address && !settings.address.includes('Sukhumvit') ? settings.address : defaultAddressEn;
  const rawAddressTh = settings.addressTh && !settings.addressTh.includes('สุขุมวิท') ? settings.addressTh : defaultAddressTh;
  const address = isThai ? rawAddressTh : rawAddressEn;

  const defaultCopyrightEn = '© 2026 TS MATERIAL CO., LTD. All rights reserved.';
  const defaultCopyrightTh = '© 2026 บริษัท ทีเอส แมททีเรียล จำกัด สงวนลิขสิทธิ์ทั้งหมด';
  const rawCopyrightEn = settings.copyright && !settings.copyright.includes('SUNMA') ? settings.copyright : defaultCopyrightEn;
  const rawCopyrightTh = settings.copyrightTh && !settings.copyrightTh.includes('ซันม่า') ? settings.copyrightTh : defaultCopyrightTh;
  const copyright = isThai ? rawCopyrightTh : rawCopyrightEn;


  const instagramUrl = settings.instagramUrl || 'https://instagram.com';
  const facebookUrl = settings.facebookUrl || 'https://facebook.com';
  const lineUrl = settings.lineUrl || 'https://line.me';

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-[#EAE6DF] py-8 sm:py-10 text-txt-muted text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-6">
        
        {/* ROW 1 (Upper Tier): Brand Logo on Left | Links, Divider & Social Icons on Right */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          {/* Top-Left: Main Brand Logo (Clicks to Smooth Scroll-to-Top) */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="group inline-flex flex-col cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
            title={isThai ? 'กลับขึ้นด้านบนสุด' : 'Back to top'}
          >
            {logoType === 'image' && logoImageUrl ? (
              <div className="relative h-8 sm:h-9 w-36 sm:w-44 flex items-center">
                <Image
                  src={logoImageUrl}
                  alt={brandName}
                  fill
                  sizes="(max-width: 640px) 150px, 180px"
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-normal tracking-[0.28em] text-neutral-900 transition-colors group-hover:text-black">
                  {brandName}
                </span>
                <span className="text-[8.5px] sm:text-[9px] tracking-[0.45em] font-medium text-neutral-500 uppercase -mt-0.5 transition-colors group-hover:text-neutral-700">
                  {brandSubtitle}
                </span>
              </div>
            )}
          </Link>

          {/* Top-Right: Legal Links + Divider Line + 3 Social Icons */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-neutral-500 font-light">
            <Link
              href="/about#privacy"
              className="hover:text-neutral-900 transition-colors"
            >
              {isThai ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
            </Link>
            <Link
              href="/contact#terms"
              className="hover:text-neutral-900 transition-colors"
            >
              {isThai ? 'ข้อกำหนดและเงื่อนไข' : 'Terms of Business'}
            </Link>
            <Link
              href="/admin"
              className="hover:text-amber-800 transition-colors"
            >
              {isThai ? 'ระบบจัดการหลังบ้าน' : 'Admin Portal'}
            </Link>

            {/* Subtle Vertical Divider */}
            <span className="h-3.5 w-px bg-neutral-300 hidden sm:inline-block" aria-hidden="true" />

            {/* Social Media Icons */}
            <div className="flex items-center gap-3.5 text-neutral-600">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors p-1"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-4 h-4 stroke-[1.5]" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors p-1"
                aria-label="Facebook"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 stroke-[1.5]" />
              </a>
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors p-1"
                aria-label="LINE Official"
                title="LINE Official"
              >
                <LineIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Subtle Horizontal Divider Line */}
        <div className="w-full border-t border-[#EAE6DF]" />

        {/* ROW 2 (Lower Tier): Copyright on Left | Showroom Address on Right (User's Red Circle) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-neutral-400 font-light tracking-wide">
          <p className="leading-relaxed">
            {copyright}
          </p>

          {/* Right: Showroom Address matching user request */}
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] sm:text-right leading-relaxed">
            <MapPin className="w-3 h-3 text-gold/80 shrink-0 hidden sm:inline-block" />
            <span>{address}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
