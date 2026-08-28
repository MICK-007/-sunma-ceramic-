'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ShoppingBag, Heart, Search, User as UserIcon, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistProductIds } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/shop', label: t.nav.shop },
    { href: '/categories', label: t.nav.shop + ' ' + t.categories.title.split(' ')[0] },
    { href: '/room-studio', label: t.nav.roomStudio, badge: 'HOT' },
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: t.nav.contact },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? 'bg-bg-primary/95 backdrop-blur-md border-b border-border-subtle py-4'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-heading text-xl sm:text-2xl font-bold tracking-[0.25em] text-txt-main group-hover:text-gold transition-colors">
              SUNMA
            </span>
            <span className="text-[9px] tracking-[0.4em] font-semibold text-stone uppercase -mt-1">
              CERAMIC
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors relative py-1 ${
                  isActive ? 'text-gold' : 'text-txt-muted hover:text-txt-main'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-gold/20 text-gold border border-gold/40 text-[9px] rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Utilities: Search, Wishlist, Cart, Account, Language */}
        <div className="hidden sm:flex items-center space-x-5">
          <LanguageSwitcher />

          <Link href="/shop" className="text-txt-muted hover:text-gold transition-colors p-1.5">
            <Search className="w-4 h-4" />
          </Link>

          <Link href="/account?tab=wishlist" className="text-txt-muted hover:text-gold transition-colors relative p-1.5">
            <Heart className="w-4 h-4" />
            {wishlistProductIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-bg-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistProductIds.length}
              </span>
            )}
          </Link>

          <Link href="/cart" className="text-txt-muted hover:text-gold transition-colors relative p-1.5">
            <ShoppingBag className="w-4 h-4" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-bg-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-bold text-gold border border-gold/40 px-2.5 py-1 rounded bg-gold/10 hover:bg-gold/20 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t.nav.admin}
            </Link>
          )}

          {user ? (
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-txt-main hover:text-gold border border-border-subtle px-3 py-1.5 rounded transition-all"
            >
              <UserIcon className="w-3.5 h-3.5 text-gold" />
              <span className="max-w-[100px] truncate">{user.fullName || user.email}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs uppercase tracking-wider font-semibold text-bg-primary bg-gold hover:bg-gold-hover px-3.5 py-1.5 rounded transition-all"
            >
              {t.nav.login}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center space-x-3">
          <LanguageSwitcher />

          <Link href="/cart" className="text-txt-muted hover:text-gold relative p-1.5">
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-bg-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-txt-main p-1.5 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-bg-secondary border-b border-border-subtle px-4 pt-4 pb-6 space-y-3 mt-3 animate-fadeIn">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-txt-muted hover:text-gold py-1.5"
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-gold py-1.5"
            >
              👑 {t.nav.admin}
            </Link>
          )}

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-gold font-semibold"
                >
                  {t.nav.account} ({user.fullName})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-stone hover:text-white"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-gold text-bg-primary text-xs font-bold uppercase rounded"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 border border-border-subtle text-txt-main text-xs font-bold uppercase rounded"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
