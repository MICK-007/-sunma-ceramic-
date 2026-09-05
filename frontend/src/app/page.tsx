'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';
import { Sparkles, ArrowRight, ShieldCheck, Gem, Layers, Globe2, Building2 } from 'lucide-react';

export default function HomePage() {
  const { t, language } = useLanguage();
  const isThai = language === 'TH';

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [cmsSections, setCmsSections] = useState<any[] | null>(null);

  useEffect(() => {
    api.getPublicCmsPage('home').then(res => {
      if (res && res.success && res.data && res.data.sections) {
        setCmsSections(res.data.sections);
      }
    }).catch(() => {});

    api.getCategories().then(res => {
      if (res.success) setCategories(res.data || []);
    });
    api.getProducts({ featured: true, limit: 6 }).then(res => {
      if (res.success) setFeaturedProducts(res.data || []);
    });
    api.getBrands().then(res => {
      if (res.success) setBrands(res.data || []);
    });
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center -mt-24 pt-24 overflow-hidden bg-black">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90"
            alt="SUNMA Ceramic Showroom"
            fill
            priority
            className="object-cover opacity-40 scale-105 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 backdrop-blur-md text-gold text-xs font-bold tracking-[0.3em] uppercase animate-fadeIn">
            <Gem className="w-3.5 h-3.5" />
            {t.hero.tagline}
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            {t.hero.headline}
          </h1>

          <p className="text-sm sm:text-base text-stone-light max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <Button variant="gold" size="lg" className="w-full sm:w-auto">
                {t.hero.explore} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/room-studio">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-black/40 backdrop-blur-md">
                <Sparkles className="w-4 h-4 mr-2 text-gold" />
                {t.hero.tryRoomStudio}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CMS DYNAMIC SECTIONS / FEATURED COLLECTIONS */}
      {cmsSections && cmsSections.length > 0 ? (
        <CmsSectionRenderer sections={cmsSections} />
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
              ARCHITECTURAL SERIES
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-txt-main">
              Curated Tile Collections
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: 'Calacatta Imperiale',
                desc: 'Gold veined alabaster marble porcelain.',
                img: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80',
                link: '/shop?collection=calacatta-imperiale',
              },
              {
                title: 'Basaltic Minimal',
                desc: 'Volcanic slate & micro-textured basalt slabs.',
                img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
                link: '/shop?collection=basaltic-minimal',
              },
              {
                title: 'Nordic Oak Timber',
                desc: 'Embossed wood grain ceramic planks.',
                img: 'https://images.unsplash.com/photo-1513161455074-7554c9146233?auto=format&fit=crop&w=800&q=80',
                link: '/shop?collection=nordic-oak',
              },
              {
                title: 'Terrazzo Artisanal',
                desc: 'Quartz aggregate composite surfaces.',
                img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
                link: '/shop?category=floor-tiles',
              },
            ].map((col, idx) => (
              <Link
                key={idx}
                href={col.link}
                className="luxury-card group rounded-lg overflow-hidden relative aspect-[3/4] flex flex-col justify-end p-6"
              >
                <Image
                  src={col.img}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-stone-light line-clamp-2">{col.desc}</p>
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider inline-flex items-center gap-1 pt-2">
                    Explore Series <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
              CATALOG DIVISION
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-txt-main">
              {t.categories.title}
            </h2>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-gold hover:underline">
            {t.categories.viewAll} →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="luxury-card group rounded-lg overflow-hidden p-4 flex flex-col justify-between h-48 relative"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                  DIVISION 0{cat.sortOrder}
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-txt-main group-hover:text-gold transition-colors">
                    {isThai && cat.nameTh ? cat.nameTh : cat.name}
                  </h3>
                  <p className="text-[10px] text-stone-light line-clamp-1 mt-1">
                    {isThai && cat.descriptionTh ? cat.descriptionTh : cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. ROOM STUDIO V1 PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-bg-card via-bg-secondary to-bg-card border border-border-gold rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/15 text-gold border border-gold/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              SPECIAL FEATURE
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white leading-tight">
              {t.home.roomStudioBannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-light leading-relaxed">
              {t.home.roomStudioBannerSubtitle}
            </p>
            <Link href="/room-studio" className="inline-block pt-2">
              <Button variant="gold" size="lg">
                {t.home.roomStudioButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Interactive Visual Graphic */}
          <div className="relative w-full lg:w-1/2 aspect-[16/10] rounded-xl overflow-hidden border border-border-subtle shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
              alt="Room Studio Simulation Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-gold/50 text-xs font-bold text-gold tracking-widest uppercase">
                ⚡ Live Repeated Tile Visualizer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
              SELECTED CATALOG
            </span>
            <h2 className="font-heading text-2xl font-bold text-txt-main">
              {t.home.featuredTitle}
            </h2>
          </div>
          <Link href="/shop?featured=true" className="text-xs font-bold text-gold uppercase hover:underline">
            View All Featured →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. BRANDS & REPRESENTATIVE ATELIERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
            MANUFACTURERS & IMPORTS
          </span>
          <h2 className="font-heading text-2xl font-bold text-txt-main">
            {t.home.brandsTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {brands.map(b => (
            <Link
              key={b.id}
              href={`/shop?brand=${b.slug}`}
              className="luxury-card rounded-lg p-6 text-center space-y-3 flex flex-col justify-between group"
            >
              <div className="font-heading text-xl font-bold text-white group-hover:text-gold transition-colors tracking-widest">
                {b.name}
              </div>
              <p className="text-xs text-stone line-clamp-2">{b.description}</p>
              <span className="text-[10px] font-bold text-gold uppercase tracking-wider block pt-2 border-t border-border-subtle">
                Origin: {b.country}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. WHY SUNMA CERAMIC */}
      <section className="bg-bg-secondary border-y border-border-subtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold block">
              OUR STANDARDS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-txt-main">
              {t.home.whyTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">{t.home.why1Title}</h3>
              <p className="text-xs text-stone-light leading-relaxed">{t.home.why1Desc}</p>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">{t.home.why2Title}</h3>
              <p className="text-xs text-stone-light leading-relaxed">{t.home.why2Desc}</p>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 rounded bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">{t.home.why3Title}</h3>
              <p className="text-xs text-stone-light leading-relaxed">{t.home.why3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. B2B & PROJECT OWNER PROMO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-4 h-4" />
              ARCHITECT & CONTRACTOR SERVICES
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">
              {t.home.promoTitle}
            </h2>
            <p className="text-xs text-stone-light leading-relaxed">
              {t.home.promoSubtitle}
            </p>
          </div>

          <Link href="/contact">
            <Button variant="gold" size="lg">
              {t.home.promoButton} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
