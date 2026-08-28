import React from 'react';
import { ProductCard, ProductProps } from './ProductCard';
import { EmptyState } from '../ui/EmptyState';

interface ProductGridProps {
  products: ProductProps[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (products.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No Ceramic Products Found"
        description="Try adjusting your filter selection, size parameters, or search terms."
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
