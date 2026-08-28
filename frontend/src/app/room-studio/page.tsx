'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { RoomStudioCanvas } from '@/components/room-studio/RoomStudioCanvas';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useLanguage } from '@/context/LanguageContext';
import { fallbackRooms, fallbackProducts } from '@/data/fallbackData';

function RoomStudioContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialTileSlug = searchParams.get('tile') || undefined;

  const [rooms, setRooms] = useState<any[]>(fallbackRooms);
  const [products, setProducts] = useState<any[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getRooms(), api.getProducts({ limit: 30 })])
      .then(([roomRes, prodRes]) => {
        if (roomRes.success && Array.isArray(roomRes.data) && roomRes.data.length > 0) {
          setRooms(roomRes.data);
        } else {
          setRooms(fallbackRooms);
        }

        if (prodRes.success && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          setProducts(prodRes.data);
        } else {
          setProducts(fallbackProducts);
        }
      })
      .catch(err => {
        console.warn('API error, falling back to local dataset:', err);
        setRooms(fallbackRooms);
        setProducts(fallbackProducts);
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
