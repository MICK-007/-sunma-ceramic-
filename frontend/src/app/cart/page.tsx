'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CartItem } from '@/components/cart/CartItem';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { items, subtotal, totalItemsCount } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const shippingFee = subtotal > 15000 ? 0 : 500;
  const taxAmount = Math.round(subtotal * 0.07);
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: t.nav.cart }]} />

      <div className="border-b border-border-subtle pb-4">
        <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-gold" />
          {t.cart.title} ({totalItemsCount} pieces)
        </h1>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={t.cart.emptyTitle}
          description={t.cart.emptyDesc}
          actionText="Explore Tile Catalog"
          onAction={() => (window.location.href = '/shop')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Right Summary Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone">{t.cart.subtotal}</span>
                  <span className="font-bold text-white">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">{t.cart.shipping}</span>
                  <span className="font-bold text-emerald-400">
                    {shippingFee === 0 ? t.cart.freeShipping : `฿${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Est. VAT (7%)</span>
                  <span className="font-bold text-stone-light">฿{taxAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-border-subtle pt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">{t.cart.total}</span>
                  <span className="font-bold text-gold font-heading text-lg">
                    ฿{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {user ? (
                <Link href="/checkout" className="block pt-2">
                  <Button variant="gold" size="lg" className="w-full">
                    {t.cart.checkout} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login?redirect=/checkout" className="block pt-2">
                  <Button variant="gold" size="lg" className="w-full">
                    {t.cart.loginToCheckout} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}

              <div className="pt-2 text-[10px] text-stone flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                Guaranteed SUNMA Factory Inspection & Direct Logistics
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
