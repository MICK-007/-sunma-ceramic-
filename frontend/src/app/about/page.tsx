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
        <span className="text-[11px] uppercase font-semibold tracking-[0.3em] text-gold block">
          THE ARCHITECTURAL ATELIER
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-normal text-txt-main tracking-tight">
          SUNMA CERAMIC
        </h1>
        <p className="text-sm sm:text-base text-txt-muted leading-relaxed font-light">
          SUNMA CERAMIC is a premium architectural ceramic atelier, direct European importer, and bespoke surface manufacturer serving private residential estates, architects, interior designers, and commercial developments.
        </p>
      </div>

      <div className="relative aspect-[21/9] w-full rounded-[2px] overflow-hidden border border-border-subtle shadow-md">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt="SUNMA Showroom Interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-bg-card border border-border-subtle p-8 rounded-[2px] space-y-3.5 hover:border-gold transition-colors shadow-xs text-left">
          <Building2 className="w-7 h-7 text-gold" />
          <h3 className="font-heading text-lg font-normal text-txt-main">Private-Label Sourcing</h3>
          <p className="text-xs text-txt-muted leading-relaxed font-light">
            Custom made-to-order manufacturing for luxury private estates, hotel resorts, and commercial developments.
          </p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-8 rounded-[2px] space-y-3.5 hover:border-gold transition-colors shadow-xs text-left">
          <Globe2 className="w-7 h-7 text-gold" />
          <h3 className="font-heading text-lg font-normal text-txt-main">European Direct Import</h3>
          <p className="text-xs text-txt-muted leading-relaxed font-light">
            Direct partnerships with historic ceramic mills in Sassuolo, Italy and Castellón, Spain.
          </p>
        </div>

        <div className="bg-bg-card border border-border-subtle p-8 rounded-[2px] space-y-3.5 hover:border-gold transition-colors shadow-xs text-left">
          <Sparkles className="w-7 h-7 text-gold" />
          <h3 className="font-heading text-lg font-normal text-txt-main">Room Studio Simulation</h3>
          <p className="text-xs text-txt-muted leading-relaxed font-light">
            Proprietary interactive visual scale preview technology matching exact physical tile aspect ratios.
          </p>
        </div>
      </div>
    </div>
  );
}
