import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { api } from '@/services/api';
import { X, Upload, Search, Image as ImageIcon, Check, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export interface CmsMediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  alt_text: string;
  usage_count?: number;
  created_at: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: CmsMediaItem) => void;
  selectedMediaId?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedMediaId,
}) => {
  const { t } = useLanguage();
  const [mediaList, setMediaList] = useState<CmsMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingMedia, setEditingMedia] = useState<CmsMediaItem | null>(null);
  const [altText, setAltText] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async (query = '') => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.getAdminMedia(query);
      if (res.success) {
        setMediaList(res.data || []);
      } else {
        setErrorMessage(res.message || 'Failed to load media items');
      }
    } catch (err: any) {
      setErrorMessage('Error connecting to backend server');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia(searchQuery);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploading(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        const res = await api.uploadAdminMedia({
          fileName: file.name,
          mimeType: file.type,
          base64Data,
          altText: file.name.split('.')[0],
        });

        if (res.success && res.data) {
          setMediaList(prev => [res.data, ...prev]);
          onSelect(res.data); // Auto-select uploaded media
          setSuccessMessage(t.media.altSavedSuccess);
        } else {
          setErrorMessage(res.message || 'Failed to upload media');
        }
      } catch (err: any) {
        setErrorMessage('Upload error occurred.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.deleteAdminMedia(mediaId);
      if (res.success) {
        setMediaList(prev => prev.filter(m => m.id !== mediaId));
      } else {
        setErrorMessage(res.message || 'Could not delete media item');
      }
    } catch (err: any) {
      setErrorMessage('Failed to delete media item.');
    }
  };

  const handleSaveAltText = async () => {
    if (!editingMedia) return;
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.updateAdminMedia(editingMedia.id, altText);
      if (res.success && res.data) {
        setMediaList(prev =>
          prev.map(m => (m.id === editingMedia.id ? { ...m, alt_text: altText } : m))
        );
        setEditingMedia(null);
        setSuccessMessage(t.media.altSavedSuccess);
        fetchMedia(searchQuery);
      } else {
        setErrorMessage(res.message || 'Failed to update alt text');
      }
    } catch (err: any) {
      setErrorMessage('Failed to update alt text.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-bg-card border border-border-gold rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary">
          <div className="flex items-center gap-2 text-gold font-bold text-lg">
            <ImageIcon className="w-5 h-5" />
            {t.media.title}
          </div>
          <button onClick={onClose} className="text-stone hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border-subtle bg-bg-primary/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input
              type="text"
              placeholder={t.media.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-stone focus:outline-none focus:border-gold"
            />
          </form>

          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs rounded-lg transition-colors shadow-md">
              <Upload className="w-4 h-4" />
              {uploading ? t.media.uploadingText : t.media.uploadButton}
            </span>
          </label>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Grid Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-xs text-stone">{t.media.loading}</div>
          ) : mediaList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-stone">
              {t.media.noItems}
            </div>
          ) : (
            mediaList.map(item => {
              const isSelected = selectedMediaId === item.id;
              return (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-lg border overflow-hidden bg-black flex flex-col justify-end transition-all ${
                    isSelected ? 'border-gold ring-2 ring-gold/40' : 'border-border-subtle hover:border-gold/60'
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                  {/* Actions Overlay */}
                  <div className="relative z-10 p-2 flex items-center justify-between gap-1">
                    <span className="text-[10px] text-white truncate max-w-[100px]" title={item.alt_text || item.original_name}>
                      {item.alt_text || item.original_name}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMedia(item);
                          setAltText(item.alt_text || item.original_name || '');
                        }}
                        className="p-1 rounded bg-black/60 text-stone hover:text-gold transition-colors"
                        title={t.media.editAltTitle}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded bg-black/60 text-stone hover:text-red-400 transition-colors"
                        title="Delete Media"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <Button
                        size="sm"
                        variant={isSelected ? 'gold' : 'outline'}
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="h-6 px-2 text-[10px]"
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : t.media.selectButton}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alt Text Edit Modal Sub-dialog */}
        {editingMedia && (
          <div className="p-4 border-t border-border-subtle bg-bg-secondary flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gold uppercase tracking-wider block mb-1">
                {t.media.editAltTitle} ({editingMedia.original_name})
              </label>
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                className="w-full bg-black border border-border-subtle rounded px-3 py-1 text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button size="sm" variant="ghost" onClick={() => setEditingMedia(null)}>
                {t.cms.cancelButton}
              </Button>
              <Button size="sm" variant="gold" onClick={handleSaveAltText}>
                {t.media.saveAltButton}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
