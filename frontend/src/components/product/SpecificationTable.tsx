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
  const { t, language } = useLanguage();
  const isThai = language === 'TH';

  const formatEnvironment = (env: string) => {
    if (!isThai) return env;
    if (env === 'Indoor') return 'ภายในอาคาร (Indoor)';
    if (env === 'Outdoor') return 'ภายนอกอาคาร (Outdoor)';
    if (env.includes('Indoor') && env.includes('Outdoor')) return 'ภายในและภายนอกอาคาร';
    return env;
  };

  const rows = [
    { label: t.product.code, value: product.productCode },
    { label: t.product.brand, value: product.brandName || 'SUNMA Atelier' },
    { label: t.product.category, value: product.categoryName || 'General Porcelain' },
    { label: t.product.size, value: `${product.size} cm (${product.width || ''}x${product.height || ''} cm)` },
    { label: isThai ? 'ความหนา' : 'Thickness', value: `${product.thickness || 10} mm` },
    { label: t.product.material, value: isThai ? (product.material === 'Porcelain' ? 'พอร์ซเลน' : product.material === 'Ceramic' ? 'เซรามิก' : product.material) : product.material },
    { label: t.product.surface, value: product.surface },
    { label: t.product.pattern, value: product.pattern },
    { label: isThai ? 'พื้นที่การใช้งาน' : 'Suitable Environment', value: formatEnvironment(product.indoorOutdoor) },
    { label: t.product.country, value: product.countryOfOrigin },
    { label: t.product.piecesPerBox, value: `${product.piecesPerBox} ${isThai ? 'แผ่น' : 'pieces'}` },
    { label: t.product.coveragePerBox, value: `${product.coveragePerBox} ${isThai ? 'ตร.ม.' : 'sq.m'}` },
    { label: t.product.weightPerBox, value: `${product.weightPerBox} ${isThai ? 'กก.' : 'kg'}` },
  ];

  return (
    <div className="bg-bg-card border border-border-subtle rounded-[2px] overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 bg-bg-secondary border-b border-border-subtle font-heading text-xs font-semibold tracking-widest uppercase text-txt-main">
        {t.product.specsTitle}
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-2 px-5 py-3 text-xs">
            <span className="text-txt-muted font-normal uppercase tracking-wider text-[11px]">{row.label}</span>
            <span className="text-txt-main font-medium text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
