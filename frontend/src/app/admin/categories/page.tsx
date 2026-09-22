'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, FolderTree, Upload, Image as ImageIcon, X, Loader2, AlertCircle, Filter, Save, CheckCircle2 } from 'lucide-react';

import { resolveMediaUrl } from '@/lib/media';
import { MediaLibraryModal, CmsMediaItem } from '@/components/cms/MediaLibraryModal';

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionTh, setDescriptionTh] = useState('');
  const [image, setImage] = useState('');

  // Upload & Save state
  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter Options State
  const [activeTab, setActiveTab] = useState<'categories' | 'filters'>('categories');
  const [sizes, setSizes] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newSurface, setNewSurface] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [savingFilters, setSavingFilters] = useState(false);
  const [filterSuccess, setFilterSuccess] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    const res = await api.getCategories();
    if (res.success && Array.isArray(res.data)) {
      setCategories(res.data);
    }
    const filterRes = await api.getShopFilters();
    if (filterRes.success && filterRes.data) {
      setSizes(filterRes.data.sizes || ['60x60', '60x120', '30x60', '20x120', '80x80']);
      setSurfaces(filterRes.data.surfaces || ['Matt', 'Satin', 'Polished', 'Carved', 'Glossy']);
      setMaterials(filterRes.data.materials || ['Porcelain', 'Ceramic', 'Granito']);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSize.trim()) return;
    const val = newSize.trim();
    if (!sizes.includes(val)) setSizes([...sizes, val]);
    setNewSize('');
  };

  const handleRemoveSize = (item: string) => {
    setSizes(sizes.filter(s => s !== item));
  };

  const handleAddSurface = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurface.trim()) return;
    const val = newSurface.trim();
    if (!surfaces.includes(val)) setSurfaces([...surfaces, val]);
    setNewSurface('');
  };

  const handleRemoveSurface = (item: string) => {
    setSurfaces(surfaces.filter(s => s !== item));
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    const val = newMaterial.trim();
    if (!materials.includes(val)) setMaterials([...materials, val]);
    setNewMaterial('');
  };

  const handleRemoveMaterial = (item: string) => {
    setMaterials(materials.filter(m => m !== item));
  };

  const handleSaveAllFilters = async () => {
    setSavingFilters(true);
    setFilterSuccess('');
    setErrorMessage('');
    try {
      const res = await api.updateShopFilters({ sizes, surfaces, materials });
      if (res.success) {
        setFilterSuccess('บันทึกตัวกรองสินค้าลงฐานข้อมูลเรียบร้อยแล้ว!');
        setTimeout(() => setFilterSuccess(''), 4000);
      } else {
        setErrorMessage(res.message || 'เกิดข้อผิดพลาดในการบันทึกตัวกรอง');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error saving filters');
    } finally {
      setSavingFilters(false);
    }
  };


  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setNameTh('');
    setSlug('');
    setDescription('');
    setDescriptionTh('');
    setImage('/images/tiles/calacatta-marble.jpeg');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setNameTh(cat.nameTh || '');
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setDescriptionTh(cat.descriptionTh || '');
    setImage(cat.image || '/images/tiles/calacatta-marble.jpeg');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', name || file.name.split('.')[0]);

      const res = await api.uploadAdminMediaBinary(formData);
      if (res.success && res.data) {
        setImage(res.data.url);
      } else {
        setErrorMessage(res.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMessage('');

    const payload = {
      name,
      nameTh: nameTh || name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      descriptionTh,
      image,
    };

    try {
      let res;
      if (editingId) {
        res = await api.updateAdminCategory(editingId, payload);
      } else {
        res = await api.createAdminCategory(payload);
      }

      if (res && res.success === false) {
        setErrorMessage(res.message || 'Failed to save category');
        setSaveLoading(false);
        return;
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await api.deleteAdminCategory(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-border-subtle gap-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-gold text-gold'
              : 'border-transparent text-txt-muted hover:text-txt-main'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          หมวดหมู่สินค้า (Categories - {categories.length})
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'filters'
              ? 'border-gold text-gold'
              : 'border-transparent text-txt-muted hover:text-txt-main'
          }`}
        >
          <Filter className="w-4 h-4" />
          ตัวกรองสินค้าหน้าร้าน (Shop Filters: Sizes, Surfaces, Materials)
        </button>
      </div>

      {filterSuccess && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-[2px] text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{filterSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-[2px] text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {activeTab === 'categories' ? (
        <>
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-txt-main flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-gold" />
                Category Management ({categories.length})
              </h2>
              <p className="text-xs text-txt-muted">Create, update, and manage tile architectural category classifications.</p>
            </div>

            <Button variant="gold" size="sm" onClick={handleOpenCreate} className="rounded-[2px]">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Category
            </Button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gold">{t.common.loading}</div>
          ) : (
            <div className="bg-bg-card border border-border-subtle rounded-[2px] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg-secondary/60 border-b border-border-subtle text-txt-muted uppercase font-mono">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="p-3 flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-[2px] overflow-hidden bg-bg-secondary shrink-0 border border-border-subtle">
                          <img
                            src={resolveMediaUrl(cat.image) || '/images/tiles/calacatta-marble.jpeg'}
                            alt={cat.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/images/tiles/calacatta-marble.jpeg';
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-txt-main block">{cat.name}</span>
                          <span className="text-[10px] text-gold">{cat.nameTh}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-txt-muted">{cat.slug}</td>
                      <td className="p-3 text-txt-muted max-w-xs truncate">{cat.description}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-txt-muted hover:text-gold transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-txt-muted hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        /* Filters Tab: Sizes, Surfaces, Materials */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-txt-main flex items-center gap-2">
                <Filter className="w-5 h-5 text-gold" />
                การจัดการตัวกรองสินค้าหน้าร้าน (Shop Filter Options)
              </h2>
              <p className="text-xs text-txt-muted">
                กำหนดตัวเลือกขนาด พื้นผิว และวัสดุกระเบื้อง เพื่อนำไปแสดงในแถบตัวกรองหน้า /shop และในแบบฟอร์มเพิ่มสินค้า
              </p>
            </div>

            <Button
              variant="gold"
              size="sm"
              disabled={savingFilters}
              onClick={handleSaveAllFilters}
              className="rounded-[2px] shadow-sm shrink-0"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {savingFilters ? 'กำลังบันทึกลงฐานข้อมูล...' : 'บันทึกตัวกรองลงฐานข้อมูล (Save)'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Tile Sizes */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-5 space-y-4 shadow-sm">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-heading text-sm font-bold text-txt-main uppercase tracking-wider flex items-center justify-between">
                  <span>📐 ขนาดกระเบื้อง (Sizes)</span>
                  <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-[2px]">{sizes.length} รายการ</span>
                </h3>
                <p className="text-[11px] text-txt-muted mt-1">เช่น 60x60, 60x120, 80x80</p>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 min-h-[90px] p-3 bg-bg-secondary/40 border border-border-subtle rounded-[2px]">
                {sizes.length === 0 ? (
                  <span className="text-xs text-txt-muted italic">ยังไม่มีตัวเลือกขนาด</span>
                ) : (
                  sizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white border border-border-subtle text-xs font-mono font-medium text-txt-main shadow-xs"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="text-txt-muted hover:text-red-500 transition-colors"
                        title={`ลบ ${s}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add New Size Form */}
              <form onSubmit={handleAddSize} className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="เช่น 75x150 หรือ 120x240"
                  className="flex-1 bg-white border border-border-subtle rounded-[2px] px-3 py-1.5 text-xs text-txt-main focus:outline-none focus:border-gold font-mono"
                />
                <Button type="submit" variant="outline" size="sm" className="rounded-[2px] text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่ม
                </Button>
              </form>
            </div>

            {/* Card 2: Surface Finishes */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-5 space-y-4 shadow-sm">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-heading text-sm font-bold text-txt-main uppercase tracking-wider flex items-center justify-between">
                  <span>✨ พื้นผิวกระเบื้อง (Surfaces)</span>
                  <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-[2px]">{surfaces.length} รายการ</span>
                </h3>
                <p className="text-[11px] text-txt-muted mt-1">เช่น Matt, Polished, Satin, Carved</p>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 min-h-[90px] p-3 bg-bg-secondary/40 border border-border-subtle rounded-[2px]">
                {surfaces.length === 0 ? (
                  <span className="text-xs text-txt-muted italic">ยังไม่มีตัวเลือกพื้นผิว</span>
                ) : (
                  surfaces.map((surf) => (
                    <span
                      key={surf}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white border border-border-subtle text-xs font-medium text-txt-main shadow-xs"
                    >
                      {surf}
                      <button
                        type="button"
                        onClick={() => handleRemoveSurface(surf)}
                        className="text-txt-muted hover:text-red-500 transition-colors"
                        title={`ลบ ${surf}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add New Surface Form */}
              <form onSubmit={handleAddSurface} className="flex gap-2">
                <input
                  type="text"
                  value={newSurface}
                  onChange={(e) => setNewSurface(e.target.value)}
                  placeholder="เช่น Honed หรือ Lappato"
                  className="flex-1 bg-white border border-border-subtle rounded-[2px] px-3 py-1.5 text-xs text-txt-main focus:outline-none focus:border-gold"
                />
                <Button type="submit" variant="outline" size="sm" className="rounded-[2px] text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่ม
                </Button>
              </form>
            </div>

            {/* Card 3: Tile Materials */}
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-5 space-y-4 shadow-sm">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-heading text-sm font-bold text-txt-main uppercase tracking-wider flex items-center justify-between">
                  <span>🧱 วัสดุกระเบื้อง (Materials)</span>
                  <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-[2px]">{materials.length} รายการ</span>
                </h3>
                <p className="text-[11px] text-txt-muted mt-1">เช่น Porcelain, Ceramic, Granito</p>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 min-h-[90px] p-3 bg-bg-secondary/40 border border-border-subtle rounded-[2px]">
                {materials.length === 0 ? (
                  <span className="text-xs text-txt-muted italic">ยังไม่มีตัวเลือกวัสดุ</span>
                ) : (
                  materials.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white border border-border-subtle text-xs font-medium text-txt-main shadow-xs"
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(m)}
                        className="text-txt-muted hover:text-red-500 transition-colors"
                        title={`ลบ ${m}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add New Material Form */}
              <form onSubmit={handleAddMaterial} className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="เช่น Sintered Stone"
                  className="flex-1 bg-white border border-border-subtle rounded-[2px] px-3 py-1.5 text-xs text-txt-main focus:outline-none focus:border-gold"
                />
                <Button type="submit" variant="outline" size="sm" className="rounded-[2px] text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> เพิ่ม
                </Button>
              </form>
            </div>
          </div>

          {/* Tips Callout */}
          <div className="bg-bg-secondary/40 border border-border-subtle rounded-[2px] p-4 text-xs text-txt-muted flex items-start gap-3">
            <span className="text-gold text-base shrink-0">💡</span>
            <div>
              <strong className="text-txt-main font-semibold">ข้อแนะนำ:</strong> เมื่อเพิ่มหรือลบตัวเลือกขนาด พื้นผิว หรือวัสดุแล้ว ให้กดปุ่ม <strong>"บันทึกตัวกรองลงฐานข้อมูล (Save)"</strong> ระบบจะอัปเดตฐานข้อมูล Supabase ทันที และหน้าร้านค้า (/shop) รวมถึงฟอร์มจัดการสินค้าจะแสดงตัวเลือกใหม่โดยอัตโนมัติ
            </div>
          </div>
        </div>
      )}


      {/* Category Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-[2px] flex items-center gap-2 text-red-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-txt-muted font-medium mb-1">Category Name (EN) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!editingId) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }
              }}
              placeholder="Floor Tiles"
              className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-txt-muted font-medium mb-1">Category Name (TH)</label>
            <input
              type="text"
              value={nameTh}
              onChange={e => setNameTh(e.target.value)}
              placeholder="กระเบื้องปูพื้น"
              className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-txt-muted font-medium mb-1">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="floor-tiles"
              className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main font-mono text-[11px] focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-txt-muted font-medium mb-1">Description (EN)</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="High-density porcelain and granite floor slabs..."
              className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main resize-none focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-txt-muted font-medium mb-1">Category Image (รูปภาพหมวดหมู่)</label>
            
            <div className="bg-bg-secondary/40 border border-border-subtle rounded-[2px] p-3 space-y-3">
              <div className="flex items-start gap-3">
                {/* Image Preview Thumbnail */}
                <div className="relative w-20 h-20 rounded-[2px] overflow-hidden border border-border-subtle bg-bg-secondary shrink-0 flex items-center justify-center">
                  {image ? (
                    <img
                      src={resolveMediaUrl(image)}
                      alt="Category Preview"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/tiles/calacatta-marble.jpeg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderTree className="w-8 h-8 text-stone/40" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-gold text-[10px] gap-1">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>อัปโหลด...</span>
                    </div>
                  )}
                </div>

                {/* Upload Action Buttons */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs rounded-[2px] bg-gold/10 text-gold hover:bg-gold/20 border-gold/30"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปจากเครื่อง'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaModalOpen(true)}
                      className="text-xs rounded-[2px]"
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-txt-muted" />
                      เลือกจากคลังสื่อ
                    </Button>

                    {image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImage('')}
                        className="text-xs rounded-[2px] text-red-500 hover:text-red-600 hover:bg-red-950/10"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        ลบรูป
                      </Button>
                    )}
                  </div>

                  <p className="text-[11px] text-txt-muted">
                    รองรับไฟล์ JPG, PNG, WEBP จากเครื่องคอมพิวเตอร์ของคุณ หรือเลือกจากคลังสื่อของระบบ
                  </p>
                </div>
              </div>

              {/* URL Input Fallback */}
              <div>
                <label className="block text-[11px] text-txt-muted mb-1 font-medium">หรือระบุ URL รูปภาพโดยตรง:</label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="/images/tiles/calacatta-marble.jpeg หรือ https://..."
                  className="w-full bg-white border border-border-subtle rounded-[2px] p-2 text-txt-main font-mono text-[11px] focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="rounded-[2px]">
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="gold" disabled={uploading || saveLoading} className="rounded-[2px]">
              {saveLoading ? 'กำลังบันทึก...' : t.common.save}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Media Library Picker Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(media: CmsMediaItem) => {
          setImage(media.url);
          setMediaModalOpen(false);
        }}
        selectedMediaId=""
      />
    </div>
  );
}
