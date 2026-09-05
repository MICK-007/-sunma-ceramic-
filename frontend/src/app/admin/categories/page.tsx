'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, FolderTree, Upload, Image as ImageIcon, X, Loader2, AlertCircle } from 'lucide-react';
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

  const loadData = async () => {
    setIsLoading(true);
    const res = await api.getCategories();
    if (res.success && Array.isArray(res.data)) {
      setCategories(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-gold" />
            Category Management ({categories.length})
          </h2>
          <p className="text-xs text-stone">Create, update, and manage tile architectural category classifications.</p>
        </div>

        <Button variant="gold" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary border-b border-border-subtle text-stone uppercase font-mono">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-bg-secondary/50 transition-colors">
                  <td className="p-3 flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary shrink-0 border border-border-subtle">
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
                      <span className="font-bold text-white block">{cat.name}</span>
                      <span className="text-[10px] text-gold">{cat.nameTh}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-stone">{cat.slug}</td>
                  <td className="p-3 text-stone-light max-w-xs truncate">{cat.description}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-stone hover:text-gold transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-stone hover:text-red-400 transition-colors"
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

      {/* Category Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-stone font-semibold mb-1">Category Name (EN) *</label>
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
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Category Name (TH)</label>
            <input
              type="text"
              value={nameTh}
              onChange={e => setNameTh(e.target.value)}
              placeholder="กระเบื้องปูพื้น"
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="floor-tiles"
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Description (EN)</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="High-density porcelain and granite floor slabs..."
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Category Image (รูปภาพหมวดหมู่)</label>
            
            <div className="bg-bg-secondary/60 border border-border-subtle rounded-lg p-3 space-y-3">
              <div className="flex items-start gap-3">
                {/* Image Preview Thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border-subtle bg-bg-secondary shrink-0 flex items-center justify-center">
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
                      className="text-xs bg-gold/15 text-gold hover:bg-gold/25 border-gold/30"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปจากเครื่อง'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaModalOpen(true)}
                      className="text-xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-stone" />
                      เลือกจากคลังสื่อ
                    </Button>

                    {image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImage('')}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        ลบรูป
                      </Button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone">
                    รองรับไฟล์ JPG, PNG, WEBP จากเครื่องคอมพิวเตอร์ของคุณ หรือเลือกจากคลังสื่อของระบบ
                  </p>
                </div>
              </div>

              {/* URL Input Fallback */}
              <div>
                <label className="block text-[11px] text-stone mb-1 font-medium">หรือระบุ URL รูปภาพโดยตรง:</label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="/images/tiles/calacatta-marble.jpeg หรือ https://..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="gold" disabled={uploading || saveLoading}>
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
