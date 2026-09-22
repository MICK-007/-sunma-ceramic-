'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  EyeOff,
  TrendingUp,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();
  const isThai = language === 'TH';
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Company Address & Settings state
  const [companyForm, setCompanyForm] = useState({
    companyName: 'TS MATERIAL Co., Ltd.',
    companyNameTh: 'บริษัท ทีเอส แมททีเรียล จำกัด',
    taxId: '0105568089913',
    address: '8/32 Moo 3, Pracha Samran Road, Soi Sap Prasit, Khlong Sip Song, Nong Chok, Bangkok 10530',
    addressTh: '8/32 ม.3 ถนนประชาสำราญ ซอยทรัพย์ประสิทธิ์ แขวงคลองสิบสอง เขตหนองจอก กทม. 10530',
    phone: '065-009-3661',
    email: 'tsmaterial15@gmail.com',
    businessHours: 'Mon - Sat: 08:30 - 17:30',
    businessHoursTh: 'จันทร์ - เสาร์: 08:30 - 17:30 น.',
  });
  const [savingCompany, setSavingCompany] = useState<boolean>(false);
  const [companySuccess, setCompanySuccess] = useState<string>('');
  const [companyError, setCompanyError] = useState<string>('');

  useEffect(() => {
    Promise.all([
      api.getAdminDashboard().then(res => res.success && setStats(res.data)),
      api.getCompanySettings().then(res => {
        if (res.success && res.data) {
          setCompanyForm(prev => ({ ...prev, ...res.data }));
        }
      }),
    ]).finally(() => setIsLoading(false));
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    setCompanySuccess('');
    setCompanyError('');
    try {
      const res = await api.updateCompanySettings(companyForm);
      if (res.success) {
        setCompanySuccess('บันทึกข้อมูลและที่อยู่บริษัทลงฐานข้อมูล Supabase สำเร็จ!');
        setTimeout(() => setCompanySuccess(''), 4000);
      } else {
        setCompanyError(res.message || 'ไม่สามารถบันทึกข้อมูลบริษัทได้');
      }
    } catch (err: any) {
      setCompanyError(err.message || 'Error saving company settings');
    } finally {
      setSavingCompany(false);
    }
  };


  if (isLoading) {
    return <div className="p-12 text-center text-gold font-bold">{t.common.loading}</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-bg-card border border-border-subtle p-5 rounded-[2px] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">{t.admin.totalSales}</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="font-heading text-2xl font-bold text-txt-main">
            ฿{stats.totalSales?.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last month
          </span>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-[2px] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">{t.admin.totalOrders}</span>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="font-heading text-2xl font-bold text-txt-main">
            {stats.totalOrders}
          </div>
          <span className="text-[10px] text-txt-muted">Completed & In Progress</span>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-[2px] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">{t.admin.totalCustomers}</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="font-heading text-2xl font-bold text-txt-main">
            {stats.totalCustomers}
          </div>
          <span className="text-[10px] text-txt-muted">Registered Architects & Owners</span>
        </div>

        <div className="bg-bg-card border border-border-subtle p-5 rounded-[2px] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gold">
            <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">{t.admin.totalProducts}</span>
            <Package className="w-4 h-4" />
          </div>
          <div className="font-heading text-2xl font-bold text-txt-main">
            {stats.totalProducts}
          </div>
          <span className="text-[10px] text-txt-muted">Active Tile SKUs</span>
        </div>

        <div className="bg-bg-card border border-neutral-700/50 p-5 rounded-[2px] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-txt-muted">
              {isThai ? 'สินค้าหมด / ปิดขาย' : 'Sold Out / Closed'}
            </span>
            <EyeOff className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-txt-main">
            {stats.soldOutCount ?? stats.lowStockCount ?? 0}
          </div>
          <Link href="/admin/products" className="text-[10px] font-bold text-gold hover:underline">
            {isThai ? 'จัดการสินค้า →' : 'Manage Products →'}
          </Link>
        </div>
      </div>

      {/* Revenue Performance Bar Chart */}
      <div className="bg-bg-card border border-border-subtle p-6 rounded-[2px] space-y-4 shadow-sm">
        <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
          Monthly Revenue Trajectory (THB)
        </h3>

        <div className="h-48 flex items-end justify-between gap-2 pt-6">
          {stats.revenueChart?.map((item: any, idx: number) => {
            const max = 500000;
            const heightPct = Math.min(100, Math.max(15, (item.revenue / max) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[9px] font-mono text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  ฿{(item.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  style={{ height: `${heightPct}%` }}
                  className="w-full bg-gradient-to-t from-gold/30 to-gold rounded-t-[2px] transition-all group-hover:brightness-110"
                />
                <span className="text-[10px] font-bold text-txt-muted uppercase">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Address & Showroom Direct Editor (Persists to Supabase cms_sections) */}
      <div className="bg-bg-card border border-border-gold/40 rounded-[2px] p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-3">
          <div>
            <h3 className="font-heading text-base font-bold text-txt-main flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gold" />
              {isThai ? 'ข้อมูลที่อยู่บริษัทและโชว์รูม (Company & Showroom Address)' : 'Company & Showroom Information'}
            </h3>
            <p className="text-xs text-txt-muted">
              {isThai
                ? 'แก้ไขที่อยู่ เลขประจำตัวผู้เสียภาษี เบอร์โทร และอีเมล โดยระบบจะบันทึกลง Supabase (cms_sections) และอัปเดตทั้งหน้าร้าน ฟุตเตอร์ และหน้าติดต่อทันที'
                : 'Manage headquarters address, Tax ID, phone, and contact details stored in Supabase cms_sections.'}
            </p>
          </div>

          <span className="text-[11px] font-mono bg-gold/10 text-gold px-2.5 py-1 rounded-[2px] self-start sm:self-auto">
            Supabase Live Sync
          </span>
        </div>

        {companySuccess && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-[2px] text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{companySuccess}</span>
          </div>
        )}

        {companyError && (
          <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-[2px] text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{companyError}</span>
          </div>
        )}

        <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1">
                ชื่อบริษัท (ภาษาไทย) 🇹🇭
              </label>
              <input
                type="text"
                value={companyForm.companyNameTh}
                onChange={e => setCompanyForm({ ...companyForm, companyNameTh: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold font-medium"
                placeholder="บริษัท ทีเอส แมททีเรียล จำกัด"
              />
            </div>
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1">
                Company Name (English) 🇬🇧
              </label>
              <input
                type="text"
                value={companyForm.companyName}
                onChange={e => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold font-medium"
                placeholder="TS MATERIAL Co., Ltd."
              />
            </div>
            <div>
              <label className="block text-gold font-bold uppercase tracking-wider mb-1">
                เลขประจำตัวผู้เสียภาษีอากร (Tax ID)
              </label>
              <input
                type="text"
                value={companyForm.taxId}
                onChange={e => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold font-mono font-bold"
                placeholder="0105568089913"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold" /> ที่อยู่ภาษาไทย (Address TH)
              </label>
              <textarea
                rows={2}
                value={companyForm.addressTh}
                onChange={e => setCompanyForm({ ...companyForm, addressTh: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                placeholder="8/32 ม.3 ถนนประชาสำราญ ซอยทรัพย์ประสิทธิ์ แขวงคลองสิบสอง เขตหนองจอก กทม. 10530"
              />
            </div>
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold" /> Address (English)
              </label>
              <textarea
                rows={2}
                value={companyForm.address}
                onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                placeholder="8/32 Moo 3, Pracha Samran Road, Soi Sap Prasit, Khlong Sip Song, Nong Chok, Bangkok 10530"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold" /> เบอร์โทรศัพท์ (Phone)
              </label>
              <input
                type="text"
                value={companyForm.phone}
                onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold font-mono"
                placeholder="065-009-3661"
              />
            </div>
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold" /> อีเมลติดต่อ (Email)
              </label>
              <input
                type="email"
                value={companyForm.email}
                onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold font-mono"
                placeholder="tsmaterial15@gmail.com"
              />
            </div>
            <div>
              <label className="block text-txt-muted font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold" /> เวลาทำการ (Hours)
              </label>
              <input
                type="text"
                value={companyForm.businessHoursTh}
                onChange={e => setCompanyForm({ ...companyForm, businessHoursTh: e.target.value })}
                className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                placeholder="จันทร์ - เสาร์: 08:30 - 17:30 น."
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={savingCompany}
              className="rounded-[2px] shadow-sm font-bold uppercase tracking-wider px-5"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {savingCompany ? 'กำลังบันทึกลง Supabase...' : 'บันทึกข้อมูลบริษัทลงฐานข้อมูล Supabase'}
            </Button>
          </div>
        </form>
      </div>

      {/* Recent Orders List */}
      <div className="bg-bg-card border border-border-subtle p-6 rounded-[2px] space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider">
            {t.admin.recentOrders}
          </h3>
          <Link href="/admin/orders" className="text-xs font-bold text-gold hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="space-y-2.5">
          {stats.recentOrders?.map((ord: any) => (
            <div key={ord.id} className="flex items-center justify-between p-3 bg-bg-secondary/40 rounded-[2px] border border-border-subtle text-xs">
              <div>
                <span className="font-bold text-txt-main font-mono">{ord.orderNumber}</span>
                <span className="text-txt-muted text-[11px] block">{ord.recipientName} • {ord.paymentMethod}</span>
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

