'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, CheckCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { t, language } = useLanguage();
  const isThai = language === 'TH';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State (All Specs from media_1790068429905.png)
  const [productCode, setProductCode] = useState('');
  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [size, setSize] = useState('60x60');
  const [thickness, setThickness] = useState('10');
  const [material, setMaterial] = useState('Porcelain');
  const [surface, setSurface] = useState('Matt');
  const [pattern, setPattern] = useState('Marble');
  const [indoorOutdoor, setIndoorOutdoor] = useState('Indoor');
  const [countryOfOrigin, setCountryOfOrigin] = useState('Thailand');
  const [piecesPerBox, setPiecesPerBox] = useState('4');
  const [coveragePerBox, setCoveragePerBox] = useState('1.44');
  const [weightPerBox, setWeightPerBox] = useState('30');
  const [pricePerPiece, setPricePerPiece] = useState('450'); // Price per SQM
  const [pricePerBox, setPricePerBox] = useState('1800');
  const [description, setDescription] = useState('');
  const [descriptionTh, setDescriptionTh] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [thumbnail, setThumbnail] = useState('/images/tiles/calacatta-marble.jpeg');

  const [filterOptions, setFilterOptions] = useState<{ sizes: string[]; surfaces: string[]; materials: string[] }>({
    sizes: ['60x60', '60x120', '30x60', '20x120', '80x80'],
    surfaces: ['Matt', 'Satin', 'Polished', 'Carved', 'Glossy'],
    materials: ['Porcelain', 'Ceramic', 'Granite', 'Sintered Stone'],
  });

  const loadData = async () => {
    setIsLoading(true);
    const [pRes, cRes, bRes, fRes] = await Promise.all([
      api.getAdminProducts(),
      api.getCategories(),
      api.getBrands(),
      api.getShopFilters(),
    ]);
    if (pRes.success) setProducts(pRes.data || []);
    if (cRes.success) setCategories(cRes.data || []);
    if (bRes.success) setBrands(bRes.data || []);
    if (fRes.success && fRes.data) {
      setFilterOptions({
        sizes: fRes.data.sizes || ['60x60', '60x120', '30x60', '20x120', '80x80'],
        surfaces: fRes.data.surfaces || ['Matt', 'Satin', 'Polished', 'Carved', 'Glossy'],
        materials: fRes.data.materials || ['Porcelain', 'Ceramic', 'Granite', 'Sintered Stone'],
      });
    }
    setIsLoading(false);
  };


  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setProductCode(`SNM-PROD-${Date.now().toString().slice(-4)}`);
    setName('');
    setNameTh('');
    setCategoryId(categories[0]?.id || '');
    setBrandId(brands[0]?.id || '');
    setSize('60x60');
    setThickness('10');
    setMaterial('Porcelain');
    setSurface('Matt');
    setPattern('Marble');
    setIndoorOutdoor('Indoor');
    setCountryOfOrigin('Thailand');
    setPiecesPerBox('4');
    setCoveragePerBox('1.44');
    setWeightPerBox('30');
    setPricePerPiece('450');
    setPricePerBox('1800');
    setDescription('');
    setDescriptionTh('');
    setFeatured(false);
    setIsSoldOut(false);
    setThumbnail('/images/tiles/calacatta-marble.jpeg');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingId(prod.id);
    setProductCode(prod.productCode || '');
    setName(prod.name || '');
    setNameTh(prod.nameTh || '');
    setCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setBrandId(prod.brandId || (brands[0]?.id || ''));
    setSize(prod.size || '60x60');
    setThickness(String(prod.thickness || 10));
    setMaterial(prod.material || 'Porcelain');
    setSurface(prod.surface || 'Matt');
    setPattern(prod.pattern || 'Marble');
    setIndoorOutdoor(prod.indoorOutdoor || 'Indoor');
    setCountryOfOrigin(prod.countryOfOrigin || 'Thailand');
    setPiecesPerBox(String(prod.piecesPerBox || 4));
    setCoveragePerBox(String(prod.coveragePerBox || 1.44));
    setWeightPerBox(String(prod.weightPerBox || 30));
    setPricePerPiece(String(prod.pricePerPiece || 450));
    setPricePerBox(String(prod.pricePerBox || 1800));
    setDescription(prod.description || '');
    setDescriptionTh(prod.descriptionTh || '');
    setFeatured(!!prod.featured);
    setIsSoldOut(!!prod.isSoldOut || prod.status === 'SOLD_OUT');
    setThumbnail(prod.thumbnail || '/images/tiles/calacatta-marble.jpeg');
    setModalOpen(true);
  };

  // Quick 1-click Toggle Sold Out
  const handleToggleSoldOut = async (id: string) => {
    const res = await api.toggleAdminProductSoldOut(id);
    if (res && res.success) {
      setProducts(prev =>
        prev.map(p => {
          if (p.id === id) {
            const nextSoldOut = !p.isSoldOut;
            return {
              ...p,
              isSoldOut: nextSoldOut,
              status: nextSoldOut ? 'SOLD_OUT' : 'PUBLISHED',
            };
          }
          return p;
        })
      );
      showNotification(res.message || 'Updated product availability.');
    } else {
      alert(res?.message || 'Failed to update status');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setThumbnail(compressedDataUrl);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      productCode,
      name,
      nameTh: nameTh || name,
      categoryId,
      brandId,
      size,
      thickness: Number(thickness) || 10,
      material,
      surface,
      pattern,
      indoorOutdoor,
      countryOfOrigin,
      piecesPerBox: Number(piecesPerBox) || 4,
      coveragePerBox: Number(coveragePerBox) || 1.44,
      weightPerBox: Number(weightPerBox) || 30,
      pricePerPiece: Number(pricePerPiece), // Price per SQM
      pricePerBox: Number(pricePerBox) || Number(pricePerPiece) * (Number(coveragePerBox) || 1.44),
      description,
      descriptionTh,
      featured,
      isSoldOut,
      status: isSoldOut ? 'SOLD_OUT' : 'PUBLISHED',
      thumbnail: thumbnail || '/images/tiles/calacatta-marble.jpeg',
      images: [thumbnail || '/images/tiles/calacatta-marble.jpeg'],
    };

    let res;
    if (editingId) {
      res = await api.updateAdminProduct(editingId, payload);
    } else {
      res = await api.createAdminProduct(payload);
    }

    if (res && res.success) {
      setModalOpen(false);
      showNotification(isThai ? 'บันทึกข้อมูลสินค้าเรียบร้อยแล้ว' : 'Product saved successfully.');
      await loadData();
    } else {
      alert(res?.message || 'Error saving product. Please verify required fields.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(isThai ? 'ต้องการลบสินค้านี้อย่างถาวรหรือไม่?' : 'Delete this product permanently?')) {
      await api.deleteAdminProduct(id);
      showNotification(isThai ? 'ลบสินค้าเรียบร้อยแล้ว' : 'Product deleted.');
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-txt-main">
            {isThai ? 'จัดการรายการสินค้าและสเปกกระเบื้อง' : 'Product & Specification Manager'} ({products.length})
          </h2>
          <p className="text-xs text-txt-muted">
            {isThai
              ? 'แก้ไขสเปกกระเบื้องครบทุกช่อง, ราคาต่อตารางเมตร (SQM), และปุ่มเปิด-ปิดสินค้า (Sold Out)'
              : 'Edit complete tile specifications, pricing per SQM, and instant Sold Out product toggle.'}
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={handleOpenCreate} className="rounded-[2px] shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          {t.admin.addProduct}
        </Button>
      </div>

      {/* Notification banner */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-[2px] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          {feedbackMsg}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-gold font-bold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-[2px] overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary/70 border-b border-border-subtle text-txt-muted uppercase font-mono tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Product / Brand</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Size / Material</th>
                <th className="p-3.5">Price / SQM (ตร.ม.)</th>
                <th className="p-3.5">Price / Box</th>
                <th className="p-3.5">Status (เปิด/ปิดสินค้า)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map(p => {
                const prodSoldOut = !!p.isSoldOut || p.status === 'SOLD_OUT';
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      prodSoldOut ? 'bg-neutral-50/80 hover:bg-neutral-100/80 text-neutral-500' : 'hover:bg-bg-secondary/40'
                    }`}
                  >
                    <td className="p-3 flex items-center space-x-3">
                      <div className={`relative w-12 h-12 rounded-[2px] overflow-hidden bg-bg-secondary shrink-0 border border-border-subtle ${
                        prodSoldOut ? 'grayscale opacity-75' : ''
                      }`}>
                        <Image src={p.thumbnail || '/images/tiles/calacatta-marble.jpeg'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className={`font-bold block line-clamp-1 ${prodSoldOut ? 'text-neutral-600' : 'text-txt-main'}`}>
                          {isThai && p.nameTh ? p.nameTh : p.name}
                        </span>
                        <span className="text-[10.5px] text-txt-muted block">
                          {p.brandName || 'TILE STUDIO'} • {p.categoryName || 'Tiles'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 font-mono font-semibold text-gold">{p.productCode}</td>

                    <td className="p-3">
                      <span className="font-medium text-txt-main block">{p.size} cm</span>
                      <span className="text-[10.5px] text-txt-muted">{p.material || 'Porcelain'} • {p.surface || 'Matt'}</span>
                    </td>

                    <td className="p-3 font-bold font-mono text-txt-main">
                      ฿{Number(p.pricePerPiece || 0).toLocaleString()} <span className="text-[10px] font-normal text-txt-muted">/ SQM.</span>
                    </td>

                    <td className="p-3 font-mono text-txt-muted">
                      ฿{Number(p.pricePerBox || 0).toLocaleString()} <span className="text-[10px]">/ กล่อง</span>
                    </td>

                    {/* Quick 1-Click Toggle Sold Out Status */}
                    <td className="p-3">
                      {prodSoldOut ? (
                        <button
                          onClick={() => handleToggleSoldOut(p.id)}
                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-[2px] font-bold text-[10.5px] tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-2xs"
                          title={isThai ? 'คลิกเพื่อเปิดขายสินค้า' : 'Click to enable product'}
                        >
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          {isThai ? 'ปิดการขาย (Sold Out)' : 'Sold Out'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleSoldOut(p.id)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-[2px] font-bold text-[10.5px] tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-2xs"
                          title={isThai ? 'คลิกเพื่อปิดสินค้า (Sold Out)' : 'Click to mark as Sold Out'}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          {isThai ? 'เปิดขายอยู่ (Active)' : 'Active'}
                        </button>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-block p-1.5 text-txt-muted hover:text-gold transition-colors"
                        title={isThai ? 'ดูหน้ารายละเอียด' : 'View Product Page'}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-txt-muted hover:text-gold transition-colors"
                        title={isThai ? 'แก้ไขสเปกสินค้า' : 'Edit Specs'}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-txt-muted hover:text-red-500 transition-colors"
                        title={isThai ? 'ลบสินค้า' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Comprehensive Product Specification Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (isThai ? 'แก้ไขรายละเอียดและสเปกกระเบื้อง' : 'Edit Product Specifications') : (isThai ? 'เพิ่มสินค้ากระเบื้องใหม่' : 'Create New Tile Product')}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          
          {/* Section 1: Basic Identifiers */}
          <div className="bg-bg-secondary/30 p-3 rounded-[2px] border border-border-subtle space-y-3">
            <h4 className="font-heading font-semibold text-txt-main text-[11.5px] uppercase tracking-wider text-gold">
              {isThai ? '1. ข้อมูลพื้นฐาน (Basic Information)' : '1. Basic Information'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">CODE (รหัสสินค้า) *</label>
                <input
                  type="text"
                  required
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                  placeholder="SNM-PROD-8947"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main font-mono focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">สถานะเปิด/ปิดขาย (Status) *</label>
                <select
                  value={isSoldOut ? 'SOLD_OUT' : 'PUBLISHED'}
                  onChange={e => setIsSoldOut(e.target.value === 'SOLD_OUT')}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold font-semibold"
                >
                  <option value="PUBLISHED">🟢 เปิดขายตามปกติ (Active / In Stock)</option>
                  <option value="SOLD_OUT">🔴 ปิดการขาย / สินค้าหมด (Sold Out / Grayscale)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">NAME (ชื่อสินค้า EN) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Calacatta Oro Polished Slab"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">ชื่อสินค้าภาษาไทย (NAME TH)</label>
                <input
                  type="text"
                  value={nameTh}
                  onChange={e => setNameTh(e.target.value)}
                  placeholder="กระเบื้องลายหินอ่อน Calacatta Oro ผิวเงา"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">CATEGORY (หมวดหมู่) *</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {isThai && c.nameTh ? c.nameTh : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">BRAND (แบรนด์ผู้ผลิต)</label>
                <select
                  value={brandId}
                  onChange={e => setBrandId(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Tile Specifications matching Image media_1790068429905.png */}
          <div className="bg-bg-secondary/30 p-3 rounded-[2px] border border-border-subtle space-y-3">
            <h4 className="font-heading font-semibold text-txt-main text-[11.5px] uppercase tracking-wider text-gold">
              {isThai ? '2. สเปกทางเทคนิคของกระเบื้อง (Tile Specifications)' : '2. Technical Specifications'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">TILE SIZE (ขนาด เช่น 60x60) *</label>
                <input
                  type="text"
                  required
                  list="dynamic-sizes"
                  value={size}
                  onChange={e => setSize(e.target.value)}
                  placeholder="60x60"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold font-mono"
                />
                <datalist id="dynamic-sizes">
                  {filterOptions.sizes.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">THICKNESS (ความหนา mm) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={thickness}
                  onChange={e => setThickness(e.target.value)}
                  placeholder="10"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">MATERIAL (เนื้อวัสดุ) *</label>
                <select
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                >
                  {filterOptions.materials.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">SURFACE FINISH (ผิวสัมผัส) *</label>
                <select
                  value={surface}
                  onChange={e => setSurface(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                >
                  {filterOptions.surfaces.map(surf => (
                    <option key={surf} value={surf}>
                      {surf}
                    </option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-txt-muted font-medium mb-1">PATTERN DESIGN (ลวดลาย) *</label>
                <input
                  type="text"
                  required
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  placeholder="Marble, Concrete, Wood, Stone"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">SUITABLE ENVIRONMENT (พื้นที่ใช้งาน) *</label>
                <select
                  value={indoorOutdoor}
                  onChange={e => setIndoorOutdoor(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                >
                  <option value="Indoor">ภายในอาคาร (Indoor)</option>
                  <option value="Outdoor">ภายนอกอาคาร (Outdoor)</option>
                  <option value="Indoor/Outdoor">ทั้งภายในและภายนอก (Indoor/Outdoor)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">COUNTRY (ประเทศ) *</label>
                <input
                  type="text"
                  required
                  value={countryOfOrigin}
                  onChange={e => setCountryOfOrigin(e.target.value)}
                  placeholder="Thailand, Italy, Spain"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">PIECES / BOX (แผ่น/กล่อง) *</label>
                <input
                  type="number"
                  required
                  value={piecesPerBox}
                  onChange={e => setPiecesPerBox(e.target.value)}
                  placeholder="4"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">COVERAGE (ตร.ม./กล่อง) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={coveragePerBox}
                  onChange={e => setCoveragePerBox(e.target.value)}
                  placeholder="1.44"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">WEIGHT (กก./กล่อง) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightPerBox}
                  onChange={e => setWeightPerBox(e.target.value)}
                  placeholder="30"
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing (Price per SQM & Box) */}
          <div className="bg-bg-secondary/30 p-3 rounded-[2px] border border-border-subtle space-y-3">
            <h4 className="font-heading font-semibold text-txt-main text-[11.5px] uppercase tracking-wider text-gold">
              {isThai ? '3. ราคาจำหน่ายต่อตารางเมตร (Pricing per SQM)' : '3. Pricing'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">PRICE / SQM (ราคาต่อ ตร.ม. THB) *</label>
                <input
                  type="number"
                  required
                  value={pricePerPiece}
                  onChange={e => {
                    setPricePerPiece(e.target.value);
                    const cov = Number(coveragePerBox) || 1.44;
                    setPricePerBox(String(Math.round(Number(e.target.value) * cov)));
                  }}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main font-semibold text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-txt-muted font-medium mb-1">PRICE / BOX (ราคารวมต่อกล่อง THB) *</label>
                <input
                  type="number"
                  required
                  value={pricePerBox}
                  onChange={e => setPricePerBox(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main font-mono focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Image & Description */}
          <div className="bg-bg-secondary/30 p-3 rounded-[2px] border border-border-subtle space-y-3">
            <h4 className="font-heading font-semibold text-txt-main text-[11.5px] uppercase tracking-wider text-gold">
              {isThai ? '4. รูปภาพและคำอธิบายสินค้า' : '4. Media & Description'}
            </h4>

            <div>
              <label className="block text-txt-muted font-medium mb-1">
                {isThai ? 'รูปภาพสินค้า (อัปโหลดจากเครื่อง หรือใส่ URL)' : 'Product Image (Upload or URL)'}
              </label>
              <div className="flex items-center space-x-3 bg-white p-2.5 rounded-[2px] border border-border-subtle">
                <div className="relative w-14 h-14 rounded-[2px] border border-gold overflow-hidden shrink-0 bg-black">
                  {thumbnail && <Image src={thumbnail} alt="Preview" fill className="object-cover" />}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-[11px] text-txt-muted file:mr-2 file:py-1 file:px-2.5 file:rounded-[2px] file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-white hover:file:bg-gold-hover cursor-pointer"
                  />
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={e => setThumbnail(e.target.value)}
                    placeholder="/images/tiles/calacatta-marble.jpeg or Data URL"
                    className="w-full bg-bg-secondary border border-border-subtle rounded-[2px] p-1.5 text-txt-main font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-txt-muted font-medium mb-1">คำอธิบายสินค้า (Description EN)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-txt-muted font-medium mb-1">คำอธิบายสินค้าภาษาไทย (Description TH)</label>
                <textarea
                  rows={2}
                  value={descriptionTh}
                  onChange={e => setDescriptionTh(e.target.value)}
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="feat"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="accent-gold w-4 h-4 cursor-pointer"
              />
              <label htmlFor="feat" className="text-txt-main font-medium cursor-pointer">
                {isThai ? 'แสดงเป็นสินค้าแนะนำในหน้าแรก (Featured on Homepage)' : 'Set as Featured Product on Homepage'}
              </label>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="rounded-[2px]">
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="gold" className="rounded-[2px] shadow-sm">
              {t.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
