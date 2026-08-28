'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { RotateCcw, Filter } from 'lucide-react';

interface FilterProps {
  categories: Array<{ id: string; slug: string; name: string; nameTh?: string }>;
  brands: Array<{ id: string; slug: string; name: string }>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedSurface: string;
  setSelectedSurface: (surf: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (mat: string) => void;
  onReset: () => void;
}

export const ProductFilter: React.FC<FilterProps> = ({
  categories,
  brands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedSize,
  setSelectedSize,
  selectedSurface,
  setSelectedSurface,
  selectedMaterial,
  setSelectedMaterial,
  onReset,
}) => {
  const { language, t } = useLanguage();
  const isThai = language === 'TH';

  const sizes = ['60x60', '60x120', '30x60', '20x120'];
  const surfaces = ['Matt', 'Satin', 'Polished', 'Carved', 'Glossy'];
  const materials = ['Porcelain', 'Ceramic'];

  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <h3 className="font-heading text-xs font-bold tracking-[0.2em] text-gold uppercase flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          {t.shop.filterBy}
        </h3>
        <button
          onClick={onReset}
          className="text-[11px] text-stone hover:text-gold transition-colors flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          {t.shop.resetFilters}
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-main block mb-2">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
              selectedCategory === '' ? 'bg-gold/15 text-gold font-bold' : 'text-txt-muted hover:text-txt-main'
            }`}
          >
            {t.shop.allCategories}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                selectedCategory === cat.slug ? 'bg-gold/15 text-gold font-bold' : 'text-txt-muted hover:text-txt-main'
              }`}
            >
              {isThai && cat.nameTh ? cat.nameTh : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-main block mb-2">
          Brand & Atelier
        </label>
        <select
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
          className="w-full bg-bg-secondary border border-border-subtle text-xs text-txt-main rounded p-2 focus:outline-none focus:border-gold"
        >
          <option value="">{t.shop.allBrands}</option>
          {brands.map(b => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Size Filter */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-main block mb-2">
          Tile Size (cm)
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {sizes.map(sz => (
            <button
              key={sz}
              onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
              className={`text-xs p-1.5 rounded border text-center font-mono transition-colors ${
                selectedSize === sz
                  ? 'border-gold bg-gold/20 text-gold font-bold'
                  : 'border-border-subtle text-txt-muted hover:border-stone'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Surface Filter */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-main block mb-2">
          Surface Finish
        </label>
        <div className="flex flex-wrap gap-1.5">
          {surfaces.map(surf => (
            <button
              key={surf}
              onClick={() => setSelectedSurface(selectedSurface === surf ? '' : surf)}
              className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                selectedSurface === surf
                  ? 'border-gold bg-gold/20 text-gold font-bold'
                  : 'border-border-subtle text-txt-muted hover:border-stone'
              }`}
            >
              {surf}
            </button>
          ))}
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-main block mb-2">
          Material
        </label>
        <select
          value={selectedMaterial}
          onChange={e => setSelectedMaterial(e.target.value)}
          className="w-full bg-bg-secondary border border-border-subtle text-xs text-txt-main rounded p-2 focus:outline-none focus:border-gold"
        >
          <option value="">{t.shop.allMaterials}</option>
          {materials.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
