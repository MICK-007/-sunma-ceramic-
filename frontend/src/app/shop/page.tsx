'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilter } from '@/components/product/ProductFilter';
import { SearchBar } from '@/components/product/SearchBar';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';

function ShopContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const isThai = language === 'TH';

  const initialCat = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialCollection = searchParams.get('collection') || '';
  const initialFeatured = searchParams.get('featured') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialRoom = searchParams.get('room') || '';

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ sizes?: string[]; surfaces?: string[]; materials?: string[] }>({});
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedRoom, setSelectedRoom] = useState<string>(initialRoom);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedSurface, setSelectedSurface] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [sort, setSort] = useState<string>(initialSort);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const r = searchParams.get('room') || '';
    setSelectedRoom(r);
  }, [searchParams]);

  useEffect(() => {
    api.getCategories().then(res => res.success && setCategories(res.data || []));
    api.getBrands().then(res => res.success && setBrands(res.data || []));
    api.getShopFilters().then(res => {
      if (res.success && res.data) {
        setFilterOptions({
          sizes: res.data.sizes,
          surfaces: res.data.surfaces,
          materials: res.data.materials,
        });
      }
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api
      .getProducts({
        search,
        category: selectedCategory,
        brand: selectedBrand,
        collection: initialCollection,
        room: selectedRoom,
        size: selectedSize,
        surface: selectedSurface,
        material: selectedMaterial,
        featured: initialFeatured === 'true',
        sort,
        limit: 50,
      })
      .then(res => {
        if (res.success) {
          setProducts(res.data || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, [
    search,
    selectedCategory,
    selectedBrand,
    initialCollection,
    selectedRoom,
    selectedSize,
    selectedSurface,
    selectedMaterial,
    initialFeatured,
    sort,
  ]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedRoom('');
    setSelectedSize('');
    setSelectedSurface('');
    setSelectedMaterial('');
    setSort('featured');
  };

  // Group products by category when no specific category is filtered
  const hasActiveFilters =
    search || selectedCategory || selectedBrand || selectedRoom || selectedSize || selectedSurface || selectedMaterial;

  const getProductsForCategory = (catSlug: string) => {
    return products.filter(p => p.categoryId === catSlug || p.categoryName?.toLowerCase().includes(catSlug.replace('-tiles', '')));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: t.nav.shop }]} />

      {/* Header */}
      <div className="border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-semibold tracking-[0.25em] text-gold block">
            {isThai ? 'แคตตาล็อกกระเบื้องและแผ่นหินสถาปัตยกรรมทั้งหมด' : 'FULL CERAMIC & ARCHITECTURAL SLAB CATALOG'}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-txt-main">
            {t.shop.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-txt-muted font-medium">
            {isThai ? `พบสินค้า ${products.length} รายการ` : `${products.length} Products Found`}
          </div>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden border border-border-subtle p-2 rounded-[2px] text-txt-main text-xs font-semibold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {isThai ? 'ตัวกรอง' : 'Filters'}
          </button>
        </div>
      </div>

      {/* Search Bar & Sort Controller */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-bg-card p-4 rounded-[2px] border border-border-subtle shadow-xs">
        <div className="w-full sm:w-2/3">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-txt-muted font-medium shrink-0">{t.shop.sortBy}:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-bg-secondary border border-border-subtle text-xs text-txt-main rounded-[2px] p-2.5 focus:outline-none focus:border-gold w-full sm:w-auto"
          >
            <option value="featured">{t.shop.sortFeatured}</option>
            <option value="newest">{t.shop.sortNewest}</option>
            <option value="price_asc">{t.shop.sortPriceLow}</option>
            <option value="price_desc">{t.shop.sortPriceHigh}</option>
            <option value="popular">{t.shop.sortPopular}</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <ProductFilter
            categories={categories}
            brands={brands}
            availableSizes={filterOptions.sizes}
            availableSurfaces={filterOptions.surfaces}
            availableMaterials={filterOptions.materials}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedSurface={selectedSurface}
            setSelectedSurface={setSelectedSurface}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            onReset={handleResetFilters}
          />

        </div>

        {/* Right Products Container */}
        <div className="md:col-span-3 space-y-8">
          {/* Active Room Filter Notification Badge */}
          {selectedRoom && (
            <div className="flex items-center justify-between py-2.5 px-4 bg-gold/10 border border-gold/40 rounded-[2px] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gold font-bold uppercase tracking-wider text-[11px]">
                  {isThai ? 'ตัวกรองพื้นที่ห้อง:' : 'Room Filter:'}
                </span>
                <span className="font-semibold text-txt-main">
                  {selectedRoom === 'living-room'
                    ? (isThai ? '🛋️ ห้องรับแขก (Living Room)' : '🛋️ Living Room')
                    : selectedRoom === 'kitchen'
                    ? (isThai ? '🍳 ห้องครัว (Kitchen)' : '🍳 Kitchen')
                    : selectedRoom === 'bathroom'
                    ? (isThai ? '🚿 ห้องน้ำ (Bathroom)' : '🚿 Bathroom')
                    : selectedRoom === 'bedroom'
                    ? (isThai ? '🛏️ ห้องนอน (Bedroom)' : '🛏️ Bedroom')
                    : selectedRoom === 'outdoor'
                    ? (isThai ? '🌿 กลางแจ้ง / ระเบียง (Outdoor)' : '🌿 Outdoor')
                    : (isThai ? '🏢 พื้นที่เชิงพาณิชย์ (Commercial)' : '🏢 Commercial')}
                </span>
              </div>
              <button
                onClick={() => setSelectedRoom('')}
                className="text-txt-muted hover:text-red-500 font-medium text-[11px] flex items-center gap-1 transition-colors"
                title={isThai ? 'ล้างตัวกรองห้อง' : 'Clear room filter'}
              >
                <span>✕</span>
                <span>{isThai ? 'ล้างตัวกรอง' : 'Clear'}</span>
              </button>
            </div>
          )}
          {isLoading ? (
            <LoadingSkeleton count={6} />
          ) : products.length === 0 ? (
            <EmptyState
              title={t.shop.noProducts}
              description={
                isThai
                  ? 'ลองปรับคำค้นหา ล้างตัวกรองขนาด หรือเลือกหมวดหมู่อื่นเพื่อค้นหากระเบื้องที่ต้องการ'
                  : 'Try adjusting search terms, clearing size parameters, or choosing another category.'
              }
              actionText={t.shop.resetFilters}
              onAction={handleResetFilters}
            />
          ) : hasActiveFilters ? (
            /* Flat Grid View when filtering */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            /* REQUIREMENT 13: Grouped Vertically by Category */
            <div className="space-y-16">
              {categories.map(cat => {
                const catProducts = getProductsForCategory(cat.slug);
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat.id} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                      <div>
                        <span className="text-[10px] text-gold font-semibold uppercase tracking-[0.25em] block">
                          {isThai ? 'หมวดหมู่คอลเลกชัน' : 'COLLECTION DIVISION'}
                        </span>
                        <h2 className="font-heading text-2xl font-normal text-txt-main tracking-wide">
                          {isThai && cat.nameTh ? cat.nameTh : cat.name}
                        </h2>
                      </div>

                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="text-xs font-semibold text-gold uppercase hover:underline inline-flex items-center gap-1 tracking-wider"
                      >
                        {isThai
                          ? `ดูทั้งหมดในหมวด ${cat.nameTh || cat.name}`
                          : `View all ${cat.name}`}{' '}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catProducts.slice(0, 4).map(p => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-gold font-bold">Loading Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
