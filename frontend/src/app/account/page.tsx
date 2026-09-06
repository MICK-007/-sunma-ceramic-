'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  User,
  Package,
  Heart,
  FileText,
  LogOut,
  Clock,
  MapPin,
  Shield,
  Crown,
  FolderTree,
  ShoppingCart,
  Warehouse,
  Tag,
  Users,
  LayoutDashboard,
  ArrowRight,
  Edit,
  Plus,
  ExternalLink,
} from 'lucide-react';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, logout, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const { wishlistProductIds } = useWishlist();
  const isThai = language === 'TH';

  const isUserAdmin = isAdmin || user?.role === 'ADMIN';
  const paramTab = searchParams.get('tab');
  const initialTab = paramTab || (isUserAdmin ? 'admin' : 'orders');

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/account');
      return;
    }

    setIsLoading(true);
    Promise.all([api.getUserOrders(), api.getWishlist()])
      .then(([orderRes, wishRes]) => {
        if (orderRes.success) setOrders(orderRes.data || []);
        if (wishRes.success) setWishlistProducts(wishRes.data || []);
      })
      .finally(() => setIsLoading(false));
  }, [user, router, activeTab, wishlistProductIds]);

  if (!user) return null;

  const statusBadgeVariant = (status: string) => {
    if (status === 'Confirmed') return 'success';
    if (status === 'Preparing') return 'warning';
    if (status === 'Cancelled') return 'danger';
    return 'gold';
  };

  const accountTabs = [
    ...(isUserAdmin
      ? [
          {
            id: 'admin',
            label: isThai ? 'จัดการระบบ (Admin Controls)' : 'Admin Controls',
            icon: Crown,
          },
        ]
      : []),
    { id: 'orders', label: t.account.ordersTab, icon: Package },
    { id: 'wishlist', label: t.account.wishlistTab, icon: Heart },
    { id: 'profile', label: t.account.profileTab, icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: t.nav.account }]} />

      <div className="border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold block">
              {isUserAdmin ? 'EXECUTIVE ADMIN ACCOUNT' : 'MY ARCHITECTURAL ACCOUNT'}
            </span>
            {isUserAdmin && (
              <span className="px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/40 rounded-[2px] inline-flex items-center gap-1">
                <Crown className="w-3 h-3" />
                ADMIN
              </span>
            )}
          </div>
          <h1 className="font-heading text-3xl font-bold text-txt-main">
            {user.fullName || user.email}
          </h1>
          <span className="text-xs text-txt-muted font-mono">{user.email}</span>
        </div>

        <div className="flex items-center gap-3">
          {isUserAdmin && (
            <Link href="/admin">
              <Button
                variant="gold"
                size="sm"
                className="rounded-[2px] font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                {isThai ? 'เข้าสู่ระบบแอดมิน' : 'Admin Portal'}
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            className="rounded-[2px]"
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            {t.nav.logout}
          </Button>
        </div>
      </div>

      {/* Admin Quick Notification Banner */}
      {isUserAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-gold/10 to-transparent border border-gold/40 rounded-[2px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-gold text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              👑
            </div>
            <div>
              <span className="text-xs font-bold text-txt-main block">
                {isThai ? 'สิทธิ์ผู้ดูแลระบบ (Executive Administrator)' : 'Executive Administrator Privileges Active'}
              </span>
              <span className="text-[11.5px] text-txt-muted">
                {isThai
                  ? 'คุณสามารถแก้ไขข้อมูลสินค้า ปรับราคา/สต็อก ปรับแต่งเนื้อหา CMS และตรวจสอบคำสั่งซื้อทั้งหมดได้ที่นี่'
                  : 'You have full privileges to edit products, update prices/inventory, adjust CMS content, and manage orders.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="rounded-[2px] text-xs">
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                {isThai ? 'แก้ไขสินค้า' : 'Edit Products'}
              </Button>
            </Link>
            <Link href="/admin/cms">
              <Button variant="outline" size="sm" className="rounded-[2px] text-xs">
                <FolderTree className="w-3.5 h-3.5 mr-1.5" />
                CMS Studio
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Tabs Control */}
      <div className="flex border-b border-border-subtle overflow-x-auto space-x-6 text-xs font-semibold uppercase tracking-wider">
        {accountTabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-gold text-gold font-bold'
                  : 'border-transparent text-txt-muted hover:text-txt-main'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Admin Tab (Executive Hub) */}
      {activeTab === 'admin' && isUserAdmin && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-card border border-border-subtle p-6 rounded-[2px] shadow-sm">
            <div>
              <h2 className="font-heading text-xl font-bold text-txt-main">
                {isThai ? 'ศูนย์ควบคุมระบบผู้ดูแล (Executive Management Hub)' : 'Executive Management Hub'}
              </h2>
              <p className="text-xs text-txt-muted mt-1">
                {isThai
                  ? 'เข้าถึงเครื่องมือแก้ไขสินค้า จัดการเนื้อหาหน้าเว็บ อัปเดตคำสั่งซื้อ และจัดการคลังสินค้าได้ทั้งหมดที่นี่'
                  : 'Access product catalog editing, CMS website studio, order fulfillment, and inventory controls.'}
              </p>
            </div>

            <Link href="/admin">
              <Button variant="gold" size="sm" className="rounded-[2px] font-bold">
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                {isThai ? 'เปิดคอนโซลแอดมินเต็มรูปแบบ' : 'Open Full Admin Console'}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Products Editor */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 hover:border-gold transition-all shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-[2px] bg-gold/10 text-gold flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-txt-main">
                  {isThai ? 'จัดการและแก้ไขสินค้า' : 'Product Catalog Editor'}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed">
                  {isThai
                    ? 'แก้ไขราคาต่อแผ่น/กล่อง, เพิ่มสินค้าใหม่, แก้ไขขนาด, และอัปโหลดรูปภาพกระเบื้อง'
                    : 'Edit prices per piece/box, add new tiles, modify dimensions, and upload swatch images.'}
                </p>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href="/admin/products"
                  className="text-xs font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{isThai ? 'แก้ไขสินค้าทันที' : 'Manage Products'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. CMS Studio */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 hover:border-gold transition-all shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-[2px] bg-gold/10 text-gold flex items-center justify-center font-bold">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-txt-main">
                  {isThai ? 'CMS Studio - จัดการหน้าเว็บ' : 'CMS Website Studio'}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed">
                  {isThai
                    ? 'ปรับแต่งข้อความแบนเนอร์ Hero Showcase, คอลเลกชันแนะนำ, และเนื้อหาหน้าแรก'
                    : 'Customize hero banners, room showcases, featured architectural series, and branding.'}
                </p>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href="/admin/cms"
                  className="text-xs font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{isThai ? 'เข้า CMS Studio' : 'Open CMS Studio'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 3. Orders Management */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 hover:border-gold transition-all shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-[2px] bg-gold/10 text-gold flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-txt-main">
                  {isThai ? 'จัดการคำสั่งซื้อ' : 'Orders & Fulfillment'}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed">
                  {isThai
                    ? 'ตรวจสอบคำสั่งซื้อจากลูกค้า, อัปเดตสถานะจัดส่ง (Preparing, Confirmed), และดูใบกำกับภาษี'
                    : 'Review customer orders, update delivery status, and inspect tax invoice requests.'}
                </p>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href="/admin/orders"
                  className="text-xs font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{isThai ? 'ดูคำสั่งซื้อทั้งหมด' : 'View Orders'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4. Inventory */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 hover:border-gold transition-all shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-[2px] bg-gold/10 text-gold flex items-center justify-center font-bold">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-txt-main">
                  {isThai ? 'จัดการคลังสินค้า' : 'Inventory Stock Control'}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed">
                  {isThai
                    ? 'ตรวจนับจำนวนแผ่นกระเบื้องคงเหลือ และอัปเดตสต็อกพร้อมส่งสำหรับโครงการ'
                    : 'Monitor available tile stock pieces and update project supply availability.'}
                </p>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href="/admin/inventory"
                  className="text-xs font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{isThai ? 'จัดการคลังสินค้า' : 'Manage Inventory'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 5. Categories */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 hover:border-gold transition-all shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-[2px] bg-gold/10 text-gold flex items-center justify-center font-bold">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-txt-main">
                  {isThai ? 'หมวดหมู่สินค้า' : 'Tile Categories'}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed">
                  {isThai
                    ? 'จัดการหมวดหมู่กระเบื้องปูพื้น ปูผนัง ห้องน้ำ และลานภายนอก'
                    : 'Organize architectural categories including floor, wall, bathroom, and outdoor pavers.'}
                </p>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href="/admin/categories"
                  className="text-xs font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{isThai ? 'จัดการหมวดหมู่' : 'Manage Categories'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 6. Dashboard & Analytics */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 hover:border-gold transition-all shadow-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-[2px] bg-gold/10 text-gold flex items-center justify-center font-bold">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-txt-main">
                  {isThai ? 'แดชบอร์ดภาพรวมระบบ' : 'Executive Dashboard'}
                </h3>
                <p className="text-xs text-txt-muted leading-relaxed">
                  {isThai
                    ? 'สรุปยอดขาย สถิติคำสั่งซื้อ และข้อมูลวิเคราะห์ประสิทธิภาพร้านค้า'
                    : 'Total sales revenue, order throughput, and atelier performance overview.'}
                </p>
              </div>
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                <Link
                  href="/admin"
                  className="text-xs font-bold text-gold uppercase tracking-wider hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{isThai ? 'เปิดแดชบอร์ด' : 'Open Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-bg-card border border-border-subtle p-12 text-center rounded-[2px] text-txt-muted font-medium text-xs shadow-sm">
              {t.account.noOrders}
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-2 text-xs">
                  <div>
                    <span className="text-txt-muted font-mono block">REF: {order.orderNumber}</span>
                    <span className="text-txt-muted flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gold" />
                      {new Date(order.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={statusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="font-heading text-base font-bold text-gold">
                      ฿{order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs py-1">
                      <span className="text-txt-main font-semibold">
                        {item.productName} ({item.quantity} pcs)
                      </span>
                      <span className="text-gold font-mono">฿{item.totalPrice?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Tax Invoice Info */}
                {order.taxInvoiceRequested && (
                  <div className="bg-bg-secondary/40 p-3 rounded-[2px] border border-border-subtle text-[11px] text-txt-muted flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold shrink-0" />
                    <span>
                      Tax Invoice Requested for: <strong>{order.taxInvoiceDetails?.companyName}</strong> (Tax ID: {order.taxInvoiceDetails?.taxId})
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="bg-bg-card border border-border-subtle p-12 text-center rounded-[2px] text-txt-muted font-medium text-xs shadow-sm">
              No saved wishlist products.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 max-w-xl space-y-4 text-xs shadow-sm">
          <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
            Architect Profile Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-txt-muted font-medium block">Full Name:</span>
              <span className="text-txt-main font-bold">{user.fullName}</span>
            </div>
            <div>
              <span className="text-txt-muted font-medium block">Email:</span>
              <span className="text-txt-main font-bold">{user.email}</span>
            </div>
            <div>
              <span className="text-txt-muted font-medium block">Phone:</span>
              <span className="text-txt-main font-bold">{user.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-txt-muted font-medium block">Account Role:</span>
              <Badge variant={user.role === 'ADMIN' ? 'gold' : 'stone'}>{user.role}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gold font-bold">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
