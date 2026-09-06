'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';

export default function AdminCustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAdminCustomers()
      .then(res => res.success && setCustomers(res.data || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h2 className="font-heading text-xl font-bold text-txt-main">
          {t.admin.navCustomers} ({customers.length})
        </h2>
        <p className="text-xs text-txt-muted">Architect directory and customer lifetime spend.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-[2px] overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary/60 border-b border-border-subtle text-txt-muted uppercase font-mono">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Orders Count</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {customers.map(cust => (
                <tr key={cust.id} className="hover:bg-bg-secondary/40 transition-colors">
                  <td className="p-3 font-bold text-txt-main">{cust.fullName}</td>
                  <td className="p-3 font-mono text-txt-muted">{cust.email}</td>
                  <td className="p-3 text-txt-muted">{cust.phone || 'N/A'}</td>
                  <td className="p-3 font-bold text-gold">{cust.ordersCount || 0}</td>
                  <td className="p-3 font-bold text-emerald-600">฿{(cust.totalSpent || 0).toLocaleString()}</td>
                  <td className="p-3">
                    <Badge variant={cust.role === 'ADMIN' ? 'gold' : 'stone'}>{cust.role}</Badge>
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
