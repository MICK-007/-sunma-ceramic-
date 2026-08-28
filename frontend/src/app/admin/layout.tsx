'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Warehouse, Tag, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="p-20 text-center text-gold font-bold">{t.common.loading}</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-bg-card border border-red-500/40 rounded-lg text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="font-heading text-xl font-bold text-white">Access Denied</h2>
        <p className="text-xs text-stone-light">
          Administrator privileges are required to view the executive portal. Normal user accounts cannot access admin tools.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-gold text-bg-primary text-xs font-bold uppercase rounded"
        >
          Log in with Admin Account
        </button>
      </div>
    );
  }

  const adminNav = [
    { href: '/admin', label: t.admin.navDashboard, icon: LayoutDashboard },
    { href: '/admin/products', label: t.admin.navProducts, icon: Package },
    { href: '/admin/orders', label: t.admin.navOrders, icon: ShoppingCart },
    { href: '/admin/customers', label: t.admin.navCustomers, icon: Users },
    { href: '/admin/inventory', label: t.admin.navInventory, icon: Warehouse },
    { href: '/admin/promotions', label: t.admin.navPromotions, icon: Tag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-bg-card border border-border-gold p-4 rounded-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-gold/20 text-gold font-bold">
            👑
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-white tracking-wider uppercase">
              {t.admin.title}
            </h1>
            <span className="text-[10px] text-stone">Logged in as {user.email} (ADMIN)</span>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-stone hover:text-gold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Admin to Showroom
        </Link>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex overflow-x-auto gap-2 bg-bg-secondary p-2 rounded-lg border border-border-subtle">
        {adminNav.map(item => {
          const IconComp = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                isActive
                  ? 'bg-gold text-bg-primary shadow'
                  : 'text-stone-light hover:text-white hover:bg-bg-card'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Admin Content View */}
      <div>{children}</div>
    </div>
  );
}
