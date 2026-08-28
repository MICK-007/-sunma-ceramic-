import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-stone-light py-3">
      <Link href="/" className="hover:text-gold transition-colors font-medium uppercase tracking-wider">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-stone/50" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gold transition-colors uppercase tracking-wider">
              {item.label}
            </Link>
          ) : (
            <span className="text-gold font-semibold uppercase tracking-wider">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
