'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Tag } from 'lucide-react';

export default function AdminPromotionsPage() {
  const { t } = useLanguage();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [name, setName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('15');
  const [minQuantity, setMinQuantity] = useState('2');
  const [showForm, setShowForm] = useState(false);

  const loadPromos = async () => {
    setIsLoading(true);
    const res = await api.getAdminPromotions();
    if (res.success) setPromotions(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createAdminPromotion({
      name,
      discountPercentage: Number(discountPercentage),
      minQuantity: Number(minQuantity),
      isActive: true,
    });
    setName('');
    setShowForm(false);
    loadPromos();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-txt-main flex items-center gap-2">
            <Tag className="w-5 h-5 text-gold" />
            {t.admin.navPromotions} ({promotions.length})
          </h2>
          <p className="text-xs text-txt-muted">Manage Etsy-style architectural percentage discount promotions.</p>
        </div>

        <Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-[2px]">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Promotion
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-bg-card border border-border-gold/40 p-5 rounded-[2px] space-y-4 text-xs shadow-sm animate-fadeIn">
          <h3 className="font-heading font-bold text-gold uppercase">New Percentage Discount Promotion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-txt-muted mb-1 font-medium">Promotion Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Architectural Launch 15% OFF"
                className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-medium">Discount % *</label>
              <input
                type="number"
                required
                value={discountPercentage}
                onChange={e => setDiscountPercentage(e.target.value)}
                className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-txt-muted mb-1 font-medium">Min Quantity (Pcs)</label>
              <input
                type="number"
                value={minQuantity}
                onChange={e => setMinQuantity(e.target.value)}
                className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-[2px]">
              Cancel
            </Button>
            <Button type="submit" variant="gold" className="rounded-[2px]">
              Save Promotion
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-[2px] overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary/60 border-b border-border-subtle text-txt-muted uppercase font-mono">
              <tr>
                <th className="p-3">Promotion Title</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Min Order Pcs</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {promotions.map(promo => (
                <tr key={promo.id} className="hover:bg-bg-secondary/40 transition-colors">
                  <td className="p-3 font-bold text-txt-main">{promo.name}</td>
                  <td className="p-3 font-bold text-gold">{promo.discountPercentage}% OFF</td>
                  <td className="p-3 text-txt-muted">{promo.minQuantity} pcs</td>
                  <td className="p-3">
                    <Badge variant={promo.isActive ? 'gold' : 'stone'}>
                      {promo.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
