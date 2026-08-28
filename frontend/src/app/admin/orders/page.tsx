'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { FileText, Eye } from 'lucide-react';

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadOrders = async () => {
    setIsLoading(true);
    const res = await api.getAdminOrders();
    if (res.success) setOrders(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await api.updateAdminOrderStatus(orderId, newStatus);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h2 className="font-heading text-xl font-bold text-white">
          {t.admin.navOrders} ({orders.length})
        </h2>
        <p className="text-xs text-stone">Update customer order statuses (Pending → Confirmed → Preparing → Cancelled).</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary border-b border-border-subtle text-stone uppercase font-mono">
              <tr>
                <th className="p-3">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Tax Invoice</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {orders.map(ord => (
                <tr key={ord.id} className="hover:bg-bg-secondary/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-gold">{ord.orderNumber}</td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{ord.recipientName}</span>
                    <span className="text-[10px] text-stone">{ord.recipientPhone}</span>
                  </td>
                  <td className="p-3 font-semibold text-stone-light">{ord.paymentMethod}</td>
                  <td className="p-3">
                    {ord.taxInvoiceRequested ? (
                      <span className="text-gold font-bold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> VAT 7%
                      </span>
                    ) : (
                      <span className="text-stone">No</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-white">฿{ord.totalAmount?.toLocaleString()}</td>
                  <td className="p-3">
                    <Badge variant={ord.status === 'Confirmed' ? 'success' : ord.status === 'Preparing' ? 'warning' : 'gold'}>
                      {ord.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <select
                      value={ord.status}
                      onChange={e => handleStatusChange(ord.id, e.target.value)}
                      className="bg-bg-secondary border border-border-subtle text-xs text-white rounded p-1 focus:outline-none focus:border-gold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
