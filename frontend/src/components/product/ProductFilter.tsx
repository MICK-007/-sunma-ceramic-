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
    <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-7 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3.5">
        <h3 className="font-heading text-xs font-semibold tracking-[0.2em] text-txt-main uppercase flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gold" />
          {t.shop.filterBy}
        </h3>
        <button
          onClick={onReset}
          className="text-[11px] text-txt-muted hover:text-gold transition-colors flex items-center gap-1 font-medium tracking-wider uppercase"
        >
          <RotateCcw className="w-3 h-3" />
          {t.shop.resetFilters}
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <label className="text-[10.5px] font-semibold uppercase tracking-widest text-txt-muted block mb-2.5">
          {isThai ? 'หมวดหมู่คอลเลกชัน' : 'Collection Division'}
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left text-xs px-3 py-1.5 rounded-[2px] transition-colors ${
              selectedCategory === '' ? 'bg-txt-main text-white font-medium' : 'text-txt-muted hover:text-txt-main hover:bg-bg-secondary'
            }`}
          >
            {t.shop.allCategories}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left text-xs px-3 py-1.5 rounded-[2px] transition-colors ${
                selectedCategory === cat.slug ? 'bg-txt-main text-white font-medium' : 'text-txt-muted hover:text-txt-main hover:bg-bg-secondary'
              }`}
            >
              {isThai && cat.nameTh ? cat.nameTh : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <label className="text-[10.5px] font-semibold uppercase tracking-widest text-txt-muted block mb-2.5">
          {isThai ? 'แบรนด์และสตูดิโอผู้ผลิต' : 'Brand & Atelier'}
        </label>
        <select
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
          className="w-full bg-bg-secondary border border-border-subtle text-xs text-txt-main rounded-[2px] p-2.5 focus:outline-none focus:border-gold"
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
        <label className="text-[10.5px] font-semibold uppercase tracking-widest text-txt-muted block mb-2.5">
          {isThai ? 'ขนาดสัดส่วน (ซม.)' : 'Format Dimensions (cm)'}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {sizes.map(sz => (
            <button
              key={sz}
              onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
              className={`text-xs p-2 rounded-[2px] border text-center font-mono transition-colors ${
                selectedSize === sz
                  ? 'border-gold bg-gold/15 text-gold font-semibold'
                  : 'border-border-subtle text-txt-muted hover:border-txt-main/40'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Surface Filter */}
      <div>
        <label className="text-[10.5px] font-semibold uppercase tracking-widest text-txt-muted block mb-2.5">
          {isThai ? 'ลักษณะพื้นผิว' : 'Surface Finish'}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {surfaces.map(surf => {
            const surfaceLabelTh: Record<string, string> = {
              Matt: 'ด้าน (Matt)',
              Satin: 'ซาติน (Satin)',
              Polished: 'ขัดเงา (Polished)',
              Carved: 'แกะลาย (Carved)',
              Glossy: 'เงา (Glossy)',
            };
            return (
              <button
                key={surf}
                onClick={() => setSelectedSurface(selectedSurface === surf ? '' : surf)}
                className={`text-[11px] px-3 py-1 rounded-[2px] border transition-colors ${
                  selectedSurface === surf
                    ? 'border-gold bg-gold/15 text-gold font-semibold'
                    : 'border-border-subtle text-txt-muted hover:border-txt-main/40'
                }`}
              >
                {isThai ? (surfaceLabelTh[surf] || surf) : surf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <label className="text-[10.5px] font-semibold uppercase tracking-widest text-txt-muted block mb-2.5">
          {isThai ? 'ประเภทวัสดุ' : 'Engineered Material'}
        </label>
        <select
          value={selectedMaterial}
          onChange={e => setSelectedMaterial(e.target.value)}
          className="w-full bg-bg-secondary border border-border-subtle text-xs text-txt-main rounded-[2px] p-2.5 focus:outline-none focus:border-gold"
        >
          <option value="">{t.shop.allMaterials}</option>
          {materials.map(m => (
            <option key={m} value={m}>
              {isThai ? (m === 'Porcelain' ? 'พอร์ซเลน (Porcelain)' : m === 'Ceramic' ? 'เซรามิก (Ceramic)' : m) : m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
