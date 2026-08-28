'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAdminDashboard()
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center text-gold font-bold">{t.common.loading}</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-bg-card border border-border-subtle p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">{t.admin.totalSales}</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="font-heading text-2xl font-bold text-white">
            ฿{stats.totalSales?.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last month
          </span>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">{t.admin.totalOrders}</span>
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="font-heading text-2xl font-bold text-white">
            {stats.totalOrders}
          </div>
          <span className="text-[10px] text-stone">Completed & In Progress</span>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">{t.admin.totalCustomers}</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="font-heading text-2xl font-bold text-white">
            {stats.totalCustomers}
          </div>
          <span className="text-[10px] text-stone">Registered Architects & Owners</span>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone">{t.admin.totalProducts}</span>
            <Package className="w-5 h-5" />
          </div>
          <div className="font-heading text-2xl font-bold text-white">
            {stats.totalProducts}
          </div>
          <span className="text-[10px] text-stone">Active Tile SKUs</span>
        </div>

        <div className="bg-bg-card border border-amber-500/30 p-5 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{t.admin.lowStockAlert}</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="font-heading text-2xl font-bold text-amber-400">
            {stats.lowStockCount}
          </div>
          <Link href="/admin/inventory" className="text-[10px] font-bold text-gold hover:underline">
            Manage Inventory →
          </Link>
        </div>
      </div>

      {/* Revenue Performance Bar Chart */}
      <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
        <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
          Monthly Revenue Trajectory (THB)
        </h3>

        <div className="h-48 flex items-end justify-between gap-2 pt-6">
          {stats.revenueChart?.map((item: any, idx: number) => {
            const max = 500000;
            const heightPct = Math.min(100, Math.max(15, (item.revenue / max) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[9px] font-mono text-stone opacity-0 group-hover:opacity-100 transition-opacity">
                  ฿{(item.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-gold/30 to-gold rounded-t transition-all group-hover:brightness-125"
                />
                <span className="text-[10px] font-bold text-stone uppercase">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider">
            {t.admin.recentOrders}
          </h3>
          <Link href="/admin/orders" className="text-xs font-bold text-gold hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="space-y-3">
          {stats.recentOrders?.map((ord: any) => (
            <div key={ord.id} className="flex items-center justify-between p-3 bg-bg-secondary rounded border border-border-subtle text-xs">
              <div>
                <span className="font-bold text-white font-mono">{ord.orderNumber}</span>
                <span className="text-stone text-[11px] block">{ord.recipientName} • {ord.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={ord.status === 'Confirmed' ? 'success' : 'gold'}>{ord.status}</Badge>
                <span className="font-bold text-gold">฿{ord.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
