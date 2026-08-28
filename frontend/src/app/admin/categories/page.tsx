'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionTh, setDescriptionTh] = useState('');
  const [image, setImage] = useState('');

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
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      nameTh: nameTh || name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      descriptionTh,
      image,
    };

    if (editingId) {
      await api.updateAdminCategory(editingId, payload);
    } else {
      await api.createAdminCategory(payload);
    }

    setModalOpen(false);
    loadData();
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
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-bg-secondary shrink-0 border border-border-subtle">
                      <Image
                        src={cat.image || '/images/tiles/calacatta-marble.jpeg'}
                        alt={cat.name}
                        fill
                        className="object-cover"
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

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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
            <label className="block text-stone font-semibold mb-1">Image Path / URL</label>
            <input
              type="text"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="/images/tiles/calacatta-marble.jpeg"
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white font-mono text-[11px]"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="gold">
              {t.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
