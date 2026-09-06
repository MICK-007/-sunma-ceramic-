'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Warehouse } from 'lucide-react';

export default function AdminInventoryPage() {
  const { t } = useLanguage();
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAdminInventory()
      .then(res => res.success && setInventory(res.data || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-border-subtle pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-txt-main flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-gold" />
            {t.admin.navInventory} ({inventory.length} SKUs)
          </h2>
          <p className="text-xs text-txt-muted">
            Inventory is stored primarily in <strong>PIECES</strong> with calculated box conversions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-[2px] overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary/60 border-b border-border-subtle text-txt-muted uppercase font-mono">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU / Code</th>
                <th className="p-3">Stock (Pieces)</th>
                <th className="p-3">Pcs / Box</th>
                <th className="p-3">Calculated Boxes</th>
                <th className="p-3">Price / Piece</th>
                <th className="p-3">Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-bg-secondary/40 transition-colors">
                  <td className="p-3 font-bold text-txt-main">{item.name}</td>
                  <td className="p-3 font-mono text-gold">{item.productCode}</td>
                  <td className="p-3 font-bold text-emerald-600">{item.stockPieces} pcs</td>
                  <td className="p-3 text-txt-muted">{item.piecesPerBox}</td>
                  <td className="p-3 text-txt-muted">{item.calculatedBoxes} boxes</td>
                  <td className="p-3 font-bold text-txt-main">฿{item.pricePerPiece}</td>
                  <td className="p-3">
                    {item.isLowStock ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    ) : (
                      <Badge variant="stone">Normal</Badge>
                    )}
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
