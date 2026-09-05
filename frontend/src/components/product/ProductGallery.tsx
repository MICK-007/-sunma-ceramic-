'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';

interface GalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<GalleryProps> = ({ images, productName }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rawActive = images[selectedIdx] || images[0] || 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1000&q=80';
  const activeImage = resolveMediaUrl(rawActive);

  return (
    <div className="space-y-4">
      {/* Main Image View */}
      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-bg-secondary border border-border-subtle group">
        <Image
          src={activeImage}
          alt={productName}
          fill
          unoptimized
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 aspect-square rounded overflow-hidden border transition-all shrink-0 ${
                selectedIdx === idx ? 'border-gold ring-1 ring-gold' : 'border-border-subtle opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={resolveMediaUrl(img)}
                alt={`${productName} thumbnail ${idx}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
