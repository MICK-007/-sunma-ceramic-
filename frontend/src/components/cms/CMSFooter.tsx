'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook } from 'lucide-react';
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
      copyright?: string;
      copyrightTh?: string;
      instagramUrl?: string;
      facebookUrl?: string;
      lineUrl?: string;
    };
  };
}

// Authentic Line Icon
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
  const brandName = settings.logoText || content?.title || 'SUNMA';
  const brandSubtitle = settings.logoSubtitle || content?.subtitle || 'CERAMIC ATELIER';

  const defaultCopyrightEn = '© 2026 SUNMA CERAMIC CO., LTD. All rights reserved.';
  const defaultCopyrightTh = '© 2026 บริษัท ซันม่า เซรามิก จำกัด สงวนลิขสิทธิ์ทั้งหมด';
  const copyright = isThai
    ? settings.copyrightTh || settings.copyright || defaultCopyrightTh
    : settings.copyright || defaultCopyrightEn;

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
    <footer className="bg-[#FAF9F6] border-t border-[#EAE6DF] py-10 sm:py-14 text-txt-muted text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          
          {/* Left Column: Legal, Terms, and Admin Portal */}
          <div className="flex items-center gap-6 sm:gap-8 text-neutral-500 text-xs tracking-wide order-2 md:order-1">
            <Link
              href="/about#privacy"
              className="hover:text-neutral-900 transition-colors font-light"
            >
              {isThai ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
            </Link>
            <Link
              href="/contact#terms"
              className="hover:text-neutral-900 transition-colors font-light"
            >
              {isThai ? 'ข้อกำหนดและเงื่อนไข' : 'Terms of Business'}
            </Link>
            <Link
              href="/admin"
              className="hover:text-amber-800 transition-colors font-light"
            >
              {isThai ? 'ระบบจัดการหลังบ้าน' : 'Admin Portal'}
            </Link>
          </div>

          {/* Center Column: Main Brand Logo + Copyright (Clicks to Scroll-to-Top) */}
          <div className="flex flex-col items-center text-center order-1 md:order-2 space-y-2.5">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="group inline-flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              title={isThai ? 'กลับขึ้นด้านบนสุด' : 'Back to top'}
            >
              {logoType === 'image' && logoImageUrl ? (
                <div className="relative h-8 sm:h-9 w-36 sm:w-44 flex items-center justify-center">
                  <Image
                    src={logoImageUrl}
                    alt={brandName}
                    fill
                    sizes="(max-width: 640px) 150px, 180px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="font-heading text-xl sm:text-2xl font-normal tracking-[0.3em] text-neutral-900 transition-colors group-hover:text-black">
                    {brandName}
                  </span>
                  <span className="text-[8.5px] sm:text-[9px] tracking-[0.45em] font-medium text-neutral-500 uppercase -mt-0.5 transition-colors group-hover:text-neutral-700">
                    {brandSubtitle}
                  </span>
                </div>
              )}
            </Link>

            <p className="text-[10.5px] sm:text-[11px] text-neutral-400 font-light tracking-wider">
              {copyright}
            </p>
          </div>

          {/* Right Column: 3 Social Media Icons (Configurable via CMS) */}
          <div className="flex items-center gap-5 sm:gap-6 text-neutral-500 order-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors p-1.5 rounded-full hover:bg-neutral-200/50"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors p-1.5 rounded-full hover:bg-neutral-200/50"
              aria-label="Facebook"
              title="Facebook"
            >
              <Facebook className="w-4 h-4 stroke-[1.5]" />
            </a>
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors p-1.5 rounded-full hover:bg-neutral-200/50"
              aria-label="LINE Official"
              title="LINE Official"
            >
              <LineIcon className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};
