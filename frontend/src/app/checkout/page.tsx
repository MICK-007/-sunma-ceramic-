'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, CreditCard, Building, QrCode, FileText, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [recipientName, setRecipientName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine, setAddressLine] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('Bangkok');
  const [postalCode, setPostalCode] = useState('10110');

  // Tax Invoice State
  const [taxInvoiceRequested, setTaxInvoiceRequested] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [branch, setBranch] = useState('Head Office');
  const [taxAddress, setTaxAddress] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'PromptPay QR' | 'Credit Card'>('Bank Transfer');

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const shippingFee = subtotal > 15000 ? 0 : 500;
  const totalAmount = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !phone || !addressLine) {
      setErrorMsg('Please complete all shipping address fields.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipientName,
          phone,
          addressLine,
          subdistrict,
          district,
          province,
          postalCode,
        },
        paymentMethod,
        taxInvoiceRequested,
        taxInvoiceDetails: taxInvoiceRequested
          ? { companyName, taxId, branch, address: taxAddress || addressLine }
          : undefined,
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.data) {
        setCompletedOrder(res.data);
        clearCart();
      } else {
        setErrorMsg(res.message || 'Failed to process order.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-gold/20 border border-gold rounded-full flex items-center justify-center text-gold mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-white">
          {t.checkout.orderSuccessTitle}
        </h1>

        <p className="text-sm text-stone-light max-w-lg mx-auto">
          {t.checkout.orderSuccessDesc.replace('{{orderNumber}}', completedOrder.orderNumber)}
        </p>

        <div className="bg-bg-card border border-border-subtle p-6 rounded-lg text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-stone font-semibold">Order Reference:</span>
            <span className="font-bold text-gold font-mono">{completedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-stone font-semibold">Total Amount:</span>
            <span className="font-bold text-white">฿{completedOrder.totalAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-stone font-semibold">Selected Payment Method:</span>
            <span className="font-bold text-gold">{completedOrder.paymentMethod}</span>
          </div>

          {completedOrder.paymentMethod === 'Bank Transfer' && (
            <div className="bg-bg-secondary p-4 rounded border border-border-subtle text-stone-light space-y-1 mt-4">
              <span className="text-gold font-bold uppercase block mb-1">SUNMA Bank Account for Transfer:</span>
              <div>Bank: Kasikornbank (KBank)</div>
              <div>Account Name: SUNMA CERAMIC CO., LTD.</div>
              <div>Account No: 088-2-99999-1 (Siam Square Branch)</div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Button variant="gold" size="lg" onClick={() => router.push('/account')}>
            View Order Status in Account
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: t.nav.cart, href: '/cart' }, { label: t.checkout.title }]} />

      <h1 className="font-heading text-3xl font-bold text-white border-b border-border-subtle pb-4">
        {t.checkout.title}
      </h1>

      {errorMsg && (
        <div className="p-4 bg-red-950/60 border border-red-500/40 text-red-300 rounded text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Fields */}
        <div className="lg:col-span-7 space-y-8">
          {/* Shipping Address */}
          <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
              {t.checkout.shippingAddress}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone font-semibold mb-1">{t.checkout.fullName} *</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone font-semibold mb-1">{t.checkout.phone} *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone font-semibold mb-1">{t.checkout.address} *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="Street address, building, floor..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone font-semibold mb-1">{t.checkout.subdistrict}</label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={e => setSubdistrict(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone font-semibold mb-1">{t.checkout.district}</label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone font-semibold mb-1">{t.checkout.province}</label>
                <input
                  type="text"
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-stone font-semibold mb-1">{t.checkout.postalCode}</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Tax Invoice Toggle */}
          <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                {t.checkout.taxInvoiceToggle}
              </span>
              <input
                type="checkbox"
                checked={taxInvoiceRequested}
                onChange={e => setTaxInvoiceRequested(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </div>

            {taxInvoiceRequested && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-border-subtle animate-fadeIn">
                <div>
                  <label className="block text-stone font-semibold mb-1">{t.checkout.companyName} *</label>
                  <input
                    type="text"
                    required={taxInvoiceRequested}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-stone font-semibold mb-1">{t.checkout.taxId} *</label>
                  <input
                    type="text"
                    required={taxInvoiceRequested}
                    value={taxId}
                    onChange={e => setTaxId(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-stone font-semibold mb-1">{t.checkout.branch}</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-stone font-semibold mb-1">{t.checkout.taxAddress}</label>
                  <input
                    type="text"
                    value={taxAddress}
                    onChange={e => setTaxAddress(e.target.value)}
                    placeholder="Same as shipping if blank"
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-2.5 text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Selection */}
          <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-4">
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
              {t.checkout.paymentMethod}
            </h3>

            <div className="space-y-3">
              {[
                { id: 'Bank Transfer', label: t.checkout.bankTransfer, icon: Building },
                { id: 'PromptPay QR', label: t.checkout.promptPay, icon: QrCode },
                { id: 'Credit Card', label: t.checkout.creditCard, icon: CreditCard },
              ].map(pm => {
                const IconComponent = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/15 text-gold font-bold'
                        : 'border-border-subtle text-txt-muted hover:border-stone bg-bg-secondary'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(pm.id as any)}
                        className="accent-gold"
                      />
                      <IconComponent className="w-4 h-4 text-gold" />
                      <span>{pm.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-4">
            <h3 className="font-heading text-sm font-bold text-gold uppercase tracking-wider border-b border-border-subtle pb-3">
              Order Summary ({items.length} Products)
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-xs border-b border-border-subtle pb-2">
                  <div className="max-w-[70%]">
                    <span className="font-bold text-white block line-clamp-1">{item.product?.name}</span>
                    <span className="text-[10px] text-stone">
                      {item.quantity} pcs x ฿{item.unitPrice}
                    </span>
                  </div>
                  <span className="font-bold text-gold">
                    ฿{(item.quantity * item.unitPrice).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-border-subtle">
              <div className="flex justify-between text-stone">
                <span>Subtotal</span>
                <span className="font-bold text-white">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Shipping</span>
                <span className="font-bold text-emerald-400">
                  {shippingFee === 0 ? 'FREE' : `฿${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border-subtle">
                <span className="text-white">Total Amount</span>
                <span className="text-gold font-heading text-lg">฿{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Order...' : t.checkout.placeOrder}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
