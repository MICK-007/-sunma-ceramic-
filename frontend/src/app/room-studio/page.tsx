'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { RoomStudioCanvas } from '@/components/room-studio/RoomStudioCanvas';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useLanguage } from '@/context/LanguageContext';

function RoomStudioContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialTileSlug = searchParams.get('tile') || undefined;

  const [rooms, setRooms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getRooms(), api.getProducts({ limit: 30 })])
      .then(([roomRes, prodRes]) => {
        if (roomRes.success) setRooms(roomRes.data || []);
        if (prodRes.success) setProducts(prodRes.data || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gold font-bold">
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: t.nav.roomStudio }]} />
      <RoomStudioCanvas rooms={rooms} products={products} initialTileSlug={initialTileSlug} />
    </div>
  );
}

export default function RoomStudioPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gold font-bold">Loading Room Studio...</div>}>
      <RoomStudioContent />
    </Suspense>
  );
}
