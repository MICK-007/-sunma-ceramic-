'use client';

import React from 'react';
import Image from 'next/image';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ShieldCheck, Building2, Globe2, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumb items={[{ label: 'About SUNMA CERAMIC' }]} />

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
          THE ARCHITECTURAL ATELIER
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-white">
          SUNMA CERAMIC
        </h1>
        <p className="text-sm text-stone-light leading-relaxed">
          SUNMA CERAMIC is a premium ceramic distributor, direct European importer, and private-label manufacturer serving homeowners, architects, interior designers, and project owners.
        </p>
      </div>

      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-border-gold shadow-2xl">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt="SUNMA Showroom Interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-3">
          <Building2 className="w-8 h-8 text-gold" />
          <h3 className="font-heading text-lg font-bold text-white">Private-Label Sourcing</h3>
          <p className="text-xs text-stone-light leading-relaxed">
            Custom made-to-order manufacturing for luxury private estates, hotel resorts, and commercial developments.
          </p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-3">
          <Globe2 className="w-8 h-8 text-gold" />
          <h3 className="font-heading text-lg font-bold text-white">European Direct Import</h3>
          <p className="text-xs text-stone-light leading-relaxed">
            Direct partnerships with historic ceramic mills in Sassuolo, Italy and Castellón, Spain.
          </p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-6 rounded-lg space-y-3">
          <Sparkles className="w-8 h-8 text-gold" />
          <h3 className="font-heading text-lg font-bold text-white">Room Studio Simulation</h3>
          <p className="text-xs text-stone-light leading-relaxed">
            Proprietary interactive visual scale preview technology matching exact physical tile aspect ratios.
          </p>
        </div>
      </div>
    </div>
  );
}
