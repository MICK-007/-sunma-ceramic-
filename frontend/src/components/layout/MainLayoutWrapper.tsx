'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main className={`flex-grow ${isHome ? 'pt-0' : 'pt-24'}`}>
      {children}
    </main>
  );
}
