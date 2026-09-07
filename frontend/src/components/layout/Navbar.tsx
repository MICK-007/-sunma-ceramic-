'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Search, User as UserIcon, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const isThai = language === 'TH';
  const { user, isAdmin } = useAuth();
  const { totalItemsCount } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: isThai ? 'หน้าแรก' : 'Home' },
    { href: '/shop', label: isThai ? 'คอลเลกชัน' : 'Collections' },
    { href: '/about', label: isThai ? 'เกี่ยวกับเรา' : 'About' },
    { href: '/contact', label: isThai ? 'ติดต่อเรา' : 'Contact' },
  ];

  const isTransparent = isHome && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent py-6 border-b border-transparent'
          : 'bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80 py-4 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between">
        {/* Brand Wordmark matching Image 3 */}
        <Link href="/" className="group flex items-center gap-2 select-none">
          <div className="flex flex-col">
            <span
              className={`font-heading text-xl sm:text-2xl font-normal tracking-[0.3em] uppercase transition-colors ${
                isTransparent ? 'text-white drop-shadow-md' : 'text-neutral-900'
              }`}
            >
              SUNMA
            </span>
            <span
              className={`text-[8.5px] tracking-[0.45em] font-medium uppercase -mt-1 transition-colors ${
                isTransparent ? 'text-white/80 drop-shadow-sm' : 'text-neutral-500'
              }`}
            >
              CERAMIC
            </span>
          </div>
        </Link>

        {/* Desktop Navigation matching Image 3 */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-normal tracking-wide transition-all relative py-1 ${
                  isTransparent
                    ? isActive
                      ? 'text-white font-medium drop-shadow-md'
                      : 'text-white/85 hover:text-white drop-shadow-sm'
                    : isActive
                    ? 'text-neutral-900 font-medium'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Utilities: Search, User, Cart, Hamburger Menu matching Image 3 */}
        <div className="flex items-center space-x-5 sm:space-x-6">
          <Link
            href="/shop"
            className={`transition-colors p-1 ${
              isTransparent ? 'text-white/90 hover:text-white drop-shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
            }`}
            aria-label="Search catalog"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
          </Link>

          <Link
            href={user ? '/account' : '/login'}
            className={`transition-colors p-1 ${
              isTransparent ? 'text-white/90 hover:text-white drop-shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
            }`}
            aria-label="Account"
          >
            <UserIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider rounded-[2px] border transition-all ${
                isTransparent
                  ? 'bg-white/15 text-white border-white/30 hover:bg-white/25 drop-shadow-sm'
                  : 'bg-gold/10 text-gold border-gold/40 hover:bg-gold hover:text-white'
              }`}
              title="Admin Console"
            >
              <span>👑</span>
              <span>{isThai ? 'จัดการระบบ' : 'Admin'}</span>
            </Link>
          )}

          <Link
            href="/cart"
            className={`transition-colors relative p-1 ${
              isTransparent ? 'text-white/90 hover:text-white drop-shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
            }`}
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Language Switcher (TH | EN) */}
          <button
            onClick={() => setLanguage(language === 'TH' ? 'EN' : 'TH')}
            className={`flex items-center text-xs tracking-wider font-medium px-2 py-1 rounded transition-colors ${
              isTransparent
                ? 'text-white/90 hover:text-white drop-shadow-sm'
                : 'text-neutral-700 hover:text-neutral-900'
            }`}
            title={language === 'TH' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            aria-label="Toggle language"
          >
            <span className={language === 'TH' ? 'font-bold underline underline-offset-4' : 'opacity-60'}>TH</span>
            <span className="mx-1 opacity-40">|</span>
            <span className={language === 'EN' ? 'font-bold underline underline-offset-4' : 'opacity-60'}>EN</span>
          </button>

          {/* Mobile Menu Toggle (hidden on desktop per user instruction) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden transition-colors p-1 ${
              isTransparent ? 'text-white/90 hover:text-white drop-shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[1.5]" />
            ) : (
              <div className="w-5 h-4 flex flex-col justify-between py-0.5">
                <span className={`block h-[1.5px] w-full transition-colors ${isTransparent ? 'bg-white' : 'bg-neutral-800'}`} />
                <span className={`block h-[1.5px] w-full transition-colors ${isTransparent ? 'bg-white' : 'bg-neutral-800'}`} />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-6 py-6 space-y-4 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-800 hover:text-neutral-950 py-1"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Language Switcher */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500 font-medium">ภาษา / Language:</span>
            <button
              onClick={() => setLanguage(language === 'TH' ? 'EN' : 'TH')}
              className="text-xs font-semibold px-3 py-1 bg-neutral-100 rounded text-neutral-900 flex items-center gap-1.5"
            >
              <span className={language === 'TH' ? 'text-amber-800 font-bold' : 'text-neutral-400'}>TH</span>
              <span>/</span>
              <span className={language === 'EN' ? 'text-amber-800 font-bold' : 'text-neutral-400'}>EN</span>
            </button>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold uppercase tracking-wider text-amber-800 py-1"
            >
              {isThai ? 'ระบบจัดการหลังบ้าน' : 'Admin Portal'}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
