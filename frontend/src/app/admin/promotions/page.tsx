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
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-gold" />
            {t.admin.navPromotions} ({promotions.length})
          </h2>
          <p className="text-xs text-stone">Manage Etsy-style architectural percentage discount promotions.</p>
        </div>

        <Button variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Promotion
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-bg-card border border-border-gold p-5 rounded-lg space-y-4 text-xs animate-fadeIn">
          <h3 className="font-heading font-bold text-gold uppercase">New Percentage Discount Promotion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone mb-1 font-semibold">Promotion Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Architectural Launch 15% OFF"
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-stone mb-1 font-semibold">Discount % *</label>
              <input
                type="number"
                required
                value={discountPercentage}
                onChange={e => setDiscountPercentage(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-stone mb-1 font-semibold">Min Quantity (Pcs)</label>
              <input
                type="number"
                value={minQuantity}
                onChange={e => setMinQuantity(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Save Promotion
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary border-b border-border-subtle text-stone uppercase font-mono">
              <tr>
                <th className="p-3">Promotion Title</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Min Order Pcs</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {promotions.map(promo => (
                <tr key={promo.id} className="hover:bg-bg-secondary/50">
                  <td className="p-3 font-bold text-white">{promo.name}</td>
                  <td className="p-3 font-bold text-gold">{promo.discountPercentage}% OFF</td>
                  <td className="p-3 text-stone-light">{promo.minQuantity} pcs</td>
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
