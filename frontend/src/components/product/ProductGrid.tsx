import React from 'react';
import { ProductCard, ProductProps } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

interface ProductGridProps {
  products: ProductProps[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  const { language, t } = useLanguage();
  const isThai = language === 'TH';

  if (products.length === 0 && !isLoading) {
    return (
      <EmptyState
        title={isThai ? 'ไม่พบสินค้ากระเบื้องที่ตรงกับเงื่อนไข' : 'No Ceramic Products Found'}
        description={isThai ? 'ลองปรับเปลี่ยนตัวกรอง ค้นหาด้วยคำอื่น หรือเลือกขนาดกระเบื้องใหม่' : 'Try adjusting your filter selection, size parameters, or search terms.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
