'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [productCode, setProductCode] = useState('');
  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [size, setSize] = useState('60x60');
  const [pricePerPiece, setPricePerPiece] = useState('');
  const [stockPieces, setStockPieces] = useState('');
  const [material, setMaterial] = useState('Porcelain');
  const [surface, setSurface] = useState('Matt');
  const [featured, setFeatured] = useState(false);

  const [thumbnail, setThumbnail] = useState('/images/tiles/calacatta-marble.jpeg');

  const loadData = async () => {
    setIsLoading(true);
    const [pRes, cRes, bRes] = await Promise.all([
      api.getAdminProducts(),
      api.getCategories(),
      api.getBrands(),
    ]);
    if (pRes.success) setProducts(pRes.data || []);
    if (cRes.success) setCategories(cRes.data || []);
    if (bRes.success) setBrands(bRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setProductCode(`SNM-PROD-${Date.now().toString().slice(-4)}`);
    setName('');
    setNameTh('');
    setCategoryId(categories[0]?.id || '');
    setBrandId(brands[0]?.id || '');
    setSize('60x60');
    setPricePerPiece('450');
    setStockPieces('200');
    setMaterial('Porcelain');
    setSurface('Matt');
    setFeatured(false);
    setThumbnail('/images/tiles/calacatta-marble.jpeg');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingId(prod.id);
    setProductCode(prod.productCode);
    setName(prod.name);
    setNameTh(prod.nameTh || '');
    setCategoryId(prod.categoryId);
    setBrandId(prod.brandId || '');
    setSize(prod.size);
    setPricePerPiece(String(prod.pricePerPiece));
    setStockPieces(String(prod.stockPieces));
    setMaterial(prod.material || 'Porcelain');
    setSurface(prod.surface || 'Matt');
    setFeatured(!!prod.featured);
    setThumbnail(prod.thumbnail || '/images/tiles/calacatta-marble.jpeg');
    setModalOpen(true);
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
      nameTh,
      categoryId,
      brandId,
      size,
      pricePerPiece: Number(pricePerPiece),
      stockPieces: Number(stockPieces),
      material,
      surface,
      featured,
      thumbnail: thumbnail || '/images/tiles/calacatta-marble.jpeg',
      images: [thumbnail || '/images/tiles/calacatta-marble.jpeg'],
    };

    if (editingId) {
      await api.updateAdminProduct(editingId, payload);
    } else {
      await api.createAdminProduct(payload);
    }
    setModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product permanently?')) {
      await api.deleteAdminProduct(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            {t.admin.navProducts} ({products.length})
          </h2>
          <p className="text-xs text-stone">Manage tile prices, stock in pieces, and catalog publications.</p>
        </div>

        <Button variant="gold" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          {t.admin.addProduct}
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gold">{t.common.loading}</div>
      ) : (
        <div className="bg-bg-card border border-border-subtle rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary border-b border-border-subtle text-stone uppercase font-mono">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Code</th>
                <th className="p-3">Size</th>
                <th className="p-3">Stock (Pcs)</th>
                <th className="p-3">Price/Pc</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-bg-secondary/50 transition-colors">
                  <td className="p-3 flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-bg-secondary shrink-0 border border-border-subtle">
                      <Image src={p.thumbnail} alt={p.name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-stone">{p.brandName || 'SUNMA'}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-gold">{p.productCode}</td>
                  <td className="p-3">{p.size}</td>
                  <td className="p-3 font-bold text-emerald-400">{p.stockPieces} pcs</td>
                  <td className="p-3 font-bold text-white">฿{p.pricePerPiece}</td>
                  <td className="p-3">
                    {p.featured && <Badge variant="gold">FEATURED</Badge>}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-stone hover:text-gold transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
        title={editingId ? 'Edit Product' : 'Create New Ceramic Product'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone font-semibold mb-1">Product Code *</label>
              <input
                type="text"
                required
                value={productCode}
                onChange={e => setProductCode(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-stone font-semibold mb-1">Size (cm) *</label>
              <input
                type="text"
                required
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Product Name (EN) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Product Name (TH)</label>
            <input
              type="text"
              value={nameTh}
              onChange={e => setNameTh(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone font-semibold mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-stone font-semibold mb-1">Brand</label>
              <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone font-semibold mb-1">Product Image (Upload from Computer or enter URL)</label>
            <div className="flex items-center space-x-3 bg-bg-secondary p-2.5 rounded border border-border-subtle">
              <div className="relative w-14 h-14 rounded border border-border-gold overflow-hidden shrink-0 bg-black">
                {thumbnail && <Image src={thumbnail} alt="Preview" fill className="object-cover" />}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-[11px] text-stone-light file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-bg-primary hover:file:bg-gold-hover cursor-pointer"
                />
                <input
                  type="text"
                  value={thumbnail}
                  onChange={e => setThumbnail(e.target.value)}
                  placeholder="/images/tiles/calacatta-marble.jpeg or Data URL"
                  className="w-full bg-bg-card border border-border-subtle rounded p-1.5 text-white font-mono text-[10px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-stone font-semibold mb-1">Price per Piece (THB) *</label>
              <input
                type="number"
                required
                value={pricePerPiece}
                onChange={e => setPricePerPiece(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-stone font-semibold mb-1">Stock (Pieces) *</label>
              <input
                type="number"
                required
                value={stockPieces}
                onChange={e => setStockPieces(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="feat"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="accent-gold"
            />
            <label htmlFor="feat" className="text-white font-semibold cursor-pointer">
              Set as Featured Product on Homepage
            </label>
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
