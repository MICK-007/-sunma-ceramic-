import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-[11px] text-txt-muted py-3 tracking-wider">
      <Link href="/" className="hover:text-txt-main transition-colors uppercase font-medium">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-txt-muted/40" />
          {item.href ? (
            <Link href={item.href} className="hover:text-txt-main transition-colors uppercase font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-txt-main font-semibold uppercase">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
