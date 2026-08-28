import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface SpecsProps {
  product: {
    productCode: string;
    size: string;
    width?: number;
    height?: number;
    thickness?: number;
    material: string;
    surface: string;
    color: string;
    pattern: string;
    indoorOutdoor: string;
    countryOfOrigin: string;
    piecesPerBox: number;
    coveragePerBox: number;
    weightPerBox: number;
    brandName?: string;
    categoryName?: string;
  };
}

export const SpecificationTable: React.FC<SpecsProps> = ({ product }) => {
  const { t } = useLanguage();

  const rows = [
    { label: t.product.code, value: product.productCode },
    { label: t.product.brand, value: product.brandName || 'SUNMA Atelier' },
    { label: t.product.category, value: product.categoryName || 'General Porcelain' },
    { label: t.product.size, value: `${product.size} cm (${product.width || ''}x${product.height || ''} cm)` },
    { label: 'Thickness', value: `${product.thickness || 10} mm` },
    { label: t.product.material, value: product.material },
    { label: t.product.surface, value: product.surface },
    { label: t.product.pattern, value: product.pattern },
    { label: 'Suitable Environment', value: product.indoorOutdoor },
    { label: t.product.country, value: product.countryOfOrigin },
    { label: t.product.piecesPerBox, value: `${product.piecesPerBox} pieces` },
    { label: t.product.coveragePerBox, value: `${product.coveragePerBox} sq.m` },
    { label: t.product.weightPerBox, value: `${product.weightPerBox} kg` },
  ];

  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg overflow-hidden">
      <div className="px-5 py-3 bg-bg-secondary border-b border-border-subtle font-heading text-xs font-bold tracking-wider uppercase text-gold">
        {t.product.specsTitle}
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-2 px-5 py-2.5 text-xs">
            <span className="text-stone font-medium uppercase tracking-wider">{row.label}</span>
            <span className="text-txt-main font-semibold text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
