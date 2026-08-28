'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductCard } from '@/components/product/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { User, Package, Heart, FileText, LogOut, Clock, MapPin } from 'lucide-react';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { wishlistProductIds } = useWishlist();

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
  }, [user, router]);

  if (!user) return null;

  const statusBadgeVariant = (status: string) => {
    if (status === 'Confirmed') return 'success';
    if (status === 'Preparing') return 'warning';
    if (status === 'Cancelled') return 'danger';
    return 'gold';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: t.nav.account }]} />

      <div className="border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-gold block">
            MY ARCHITECTURAL ACCOUNT
          </span>
          <h1 className="font-heading text-3xl font-bold text-white">
            {user.fullName || user.email}
          </h1>
          <span className="text-xs text-stone font-mono">{user.email}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          {t.nav.logout}
        </Button>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-border-subtle overflow-x-auto space-x-6 text-xs font-semibold uppercase tracking-wider">
        {[
          { id: 'orders', label: t.account.ordersTab, icon: Package },
          { id: 'wishlist', label: t.account.wishlistTab, icon: Heart },
          { id: 'profile', label: t.account.profileTab, icon: User },
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-gold text-gold font-bold'
                  : 'border-transparent text-txt-muted hover:text-white'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-bg-card border border-border-subtle p-12 text-center rounded-lg text-stone font-semibold text-xs">
              {t.account.noOrders}
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-2 text-xs">
                  <div>
                    <span className="text-stone font-mono block">REF: {order.orderNumber}</span>
                    <span className="text-stone-light flex items-center gap-1 mt-0.5">
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
                      <span className="text-white font-semibold">
                        {item.productName} ({item.quantity} pcs)
                      </span>
                      <span className="text-gold font-mono">฿{item.totalPrice?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Tax Invoice Info */}
                {order.taxInvoiceRequested && (
                  <div className="bg-bg-secondary p-3 rounded border border-border-subtle text-[11px] text-stone-light flex items-center gap-2">
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
            <div className="bg-bg-card border border-border-subtle p-12 text-center rounded-lg text-stone font-semibold text-xs">
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
        <div className="bg-bg-card border border-border-subtle rounded-lg p-6 max-w-xl space-y-4 text-xs">
          <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
            Architect Profile Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-stone font-semibold block">Full Name:</span>
              <span className="text-white font-bold">{user.fullName}</span>
            </div>
            <div>
              <span className="text-stone font-semibold block">Email:</span>
              <span className="text-white font-bold">{user.email}</span>
            </div>
            <div>
              <span className="text-stone font-semibold block">Phone:</span>
              <span className="text-white font-bold">{user.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-stone font-semibold block">Account Role:</span>
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
