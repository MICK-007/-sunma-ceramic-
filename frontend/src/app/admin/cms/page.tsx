'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { MediaLibraryModal, CmsMediaItem } from '@/components/cms/MediaLibraryModal';
import { CmsSectionRenderer } from '@/components/cms/CmsSectionRenderer';
import { ALLOWED_ICONS } from '@/lib/cms-utils';
import { useLanguage } from '@/context/LanguageContext';
import { resolveMediaUrl } from '@/lib/media';

const ALLOWED_MIME_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
import {
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
  Send,
  X,
  Upload,
  Loader2,
} from 'lucide-react';

export default function AdminCmsStudioPage() {
  const { t } = useLanguage();
  const [activeSlug, setActiveSlug] = useState<string>('home');
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [reordering, setReordering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Modals State
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Selected Editor State
  const [editingSection, setEditingSection] = useState<any | null>(null);

  // Item Form Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemForm, setItemForm] = useState<{
    id?: string;
    title: string;
    description: string;
    badgeTag: string;
    linkUrl: string;
    iconName: string;
    customImageUrl: string;
    mediaId: string;
    sortOrder: number;
    isEnabled: boolean;
  }>({
    title: '',
    description: '',
    badgeTag: '',
    linkUrl: '',
    iconName: 'ShieldCheck',
    customImageUrl: '',
    mediaId: '',
    sortOrder: 0,
    isEnabled: true,
  });

  // Media Library Modal
  const [isMediaOpen, setIsMediaOpen] = useState<boolean>(false);
  const [mediaTargetField, setMediaTargetField] = useState<'section_hero' | 'item'>('item');

  // Direct Item Image Upload from Device
  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItemImage, setUploadingItemImage] = useState<boolean>(false);

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 5MB.');
      return;
    }

    setUploadingItemImage(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', itemForm.title || file.name.split('.')[0]);

      const res = await api.uploadAdminMediaBinary(formData);
      if (res.success && res.data) {
        setItemForm(prev => ({
          ...prev,
          mediaId: res.data.id,
          customImageUrl: resolveMediaUrl(res.data.url),
        }));
        setSuccessMessage('รูปภาพอัปโหลดและถูกเลือกเรียบร้อยแล้ว');
      } else {
        setErrorMessage(res.message || 'Failed to upload image.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading image.');
    } finally {
      setUploadingItemImage(false);
      if (itemFileInputRef.current) {
        itemFileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    fetchDraftPage(activeSlug);
  }, [activeSlug]);

  const fetchDraftPage = async (slug: string) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.getAdminCmsDraftPage(slug);
      if (res && res.success && res.data) {
        setPageData(res.data.page);
        setSections(res.data.sections || []);
        if (res.data.sections?.length > 0 && !editingSection) {
          setEditingSection(res.data.sections[0]);
        }
      } else {
        setErrorMessage(res?.message || `Failed to load CMS draft for '${slug}'`);
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to CMS API endpoint.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Reorder Sections
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    // Update sort_order locally
    const sectionOrders = updated.map((sec, idx) => ({
      id: sec.id,
      sortOrder: idx + 1,
    }));

    setSections(updated);
    setReordering(true);

    try {
      const res = await api.reorderAdminCmsSections(activeSlug, sectionOrders);
      if (res.success) {
        setSuccessMessage('Section order saved.');
      } else {
        setErrorMessage(res.message || 'Failed to save section order.');
      }
    } catch (err: any) {
      setErrorMessage('Reorder request failed.');
    } finally {
      setReordering(false);
    }
  };

  // 2. Toggle Section Enabled State
  const handleToggleSectionEnabled = async (sec: any) => {
    const newEnabledState = !sec.is_enabled;
    try {
      const res = await api.updateAdminCmsSection(sec.id, { isEnabled: newEnabledState });
      if (res.success) {
        setSections(prev =>
          prev.map(s => (s.id === sec.id ? { ...s, is_enabled: newEnabledState } : s))
        );
        if (editingSection?.id === sec.id) {
          setEditingSection((prev: any) => ({ ...prev, is_enabled: newEnabledState }));
        }
        setSuccessMessage(`Section '${sec.section_key}' ${newEnabledState ? 'enabled' : 'disabled'}.`);
      } else {
        setErrorMessage(res.message || 'Failed to toggle section state.');
      }
    } catch (err: any) {
      setErrorMessage('Failed to update section state.');
    }
  };

  // 3. Save Section Settings / Title / Subtitle
  const handleSaveSectionConfig = async () => {
    if (!editingSection) return;
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let sectionSettings = editingSection.settings;
      if (typeof sectionSettings === 'string') {
        try {
          sectionSettings = JSON.parse(sectionSettings);
        } catch (e) {
          sectionSettings = {};
        }
      }
      if (!sectionSettings || typeof sectionSettings !== 'object') {
        sectionSettings = {};
      }

      const res = await api.updateAdminCmsSection(editingSection.id, {
        title: editingSection.title,
        subtitle: editingSection.subtitle,
        settings: sectionSettings,
      });

      if (res.success) {
        setSections(prev =>
          prev.map(s => (s.id === editingSection.id ? { ...s, ...res.data } : s))
        );
        setSuccessMessage('Section config saved to DRAFT successfully.');
      } else {
        setErrorMessage(res.message || 'Failed to save section draft.');
      }
    } catch (err: any) {
      setErrorMessage('Error saving section config.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseItemForm = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setItemForm({
      title: '',
      description: '',
      badgeTag: '',
      linkUrl: '',
      iconName: 'ShieldCheck',
      customImageUrl: '',
      mediaId: '',
      sortOrder: 0,
      isEnabled: true,
    });
  };

  // 4. Create / Edit Section Item
  const handleOpenItemForm = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        id: item.id,
        title: item.title || '',
        description: item.description || '',
        badgeTag: item.badge_tag || '',
        linkUrl: item.link_url || '',
        iconName: item.icon_name || 'ShieldCheck',
        customImageUrl: item.custom_image_url || '',
        mediaId: item.media_id || '',
        sortOrder: item.sort_order ?? 0,
        isEnabled: item.is_enabled !== false,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        title: '',
        description: '',
        badgeTag: '',
        linkUrl: '',
        iconName: 'ShieldCheck',
        customImageUrl: '',
        mediaId: '',
        sortOrder: (editingSection?.items?.length || 0) + 1,
        isEnabled: true,
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    setErrorMessage('');

    try {
      let finalImageUrl: string | null = itemForm.customImageUrl;
      let finalMediaId: string | null = itemForm.mediaId || null;

      // Automatically convert Data URIs pasted into image input into binary Blob for secure binary upload
      if (!finalMediaId && finalImageUrl && finalImageUrl.startsWith('data:image')) {
        const mimeMatch = finalImageUrl.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const ext = ALLOWED_MIME_MAP[mimeType] || 'jpg';
        const fileName = `pasted-image-${Date.now()}.${ext}`;

        // Convert base64 data URI to Binary Blob
        const base64Str = finalImageUrl.replace(/^data:image\/\w+;base64,/, '');
        const byteCharacters = atob(base64Str);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const formData = new FormData();
        formData.append('file', blob, fileName);
        formData.append('altText', itemForm.title || fileName);

        const uploadRes = await api.uploadAdminMediaBinary(formData);

        if (uploadRes.success && uploadRes.data) {
          finalMediaId = uploadRes.data.id;
          finalImageUrl = null;
        } else {
          setErrorMessage(uploadRes.message || 'Failed to upload binary image.');
          setSaving(false);
          return;
        }
      } else if (finalMediaId) {
        // When mediaId is linked from Media Library, clear customImageUrl for clean DB storage & Zod validation
        finalImageUrl = null;
      }

      if (editingItem) {
        // Update Existing Item
        const res = await api.updateAdminCmsItem(editingItem.id, {
          title: itemForm.title,
          description: itemForm.description,
          badgeTag: itemForm.badgeTag,
          linkUrl: itemForm.linkUrl,
          iconName: itemForm.iconName as any,
          customImageUrl: finalImageUrl,
          mediaId: finalMediaId,
          sortOrder: itemForm.sortOrder,
          isEnabled: itemForm.isEnabled,
        });

        if (res.success) {
          const updatedItem = {
            ...res.data,
            custom_image_url: finalImageUrl || (itemForm.mediaId ? itemForm.customImageUrl : res.data.custom_image_url),
          };

          setEditingSection((prev: any) => ({
            ...prev,
            items: prev.items.map((i: any) => (i.id === editingItem.id ? updatedItem : i)),
          }));
          setSections(prev =>
            prev.map(s =>
              s.id === editingSection.id
                ? { ...s, items: s.items.map((i: any) => (i.id === editingItem.id ? updatedItem : i)) }
                : s
            )
          );
          setIsItemModalOpen(false);
          setEditingItem(null);
          setSuccessMessage('Item updated in DRAFT.');
        } else {
          setErrorMessage(res.message || 'Failed to update item.');
        }
      } else {
        // Create New Item
        const res = await api.createAdminCmsItem(editingSection.id, {
          title: itemForm.title,
          description: itemForm.description,
          badgeTag: itemForm.badgeTag,
          linkUrl: itemForm.linkUrl,
          iconName: itemForm.iconName as any,
          customImageUrl: finalImageUrl,
          mediaId: finalMediaId,
          sortOrder: itemForm.sortOrder,
          isEnabled: itemForm.isEnabled,
        });

        if (res.success) {
          const newItem = {
            ...res.data,
            custom_image_url: finalImageUrl || (itemForm.mediaId ? itemForm.customImageUrl : res.data.custom_image_url),
          };

          setEditingSection((prev: any) => ({
            ...prev,
            items: [...(prev.items || []), newItem],
          }));
          setSections(prev =>
            prev.map(s =>
              s.id === editingSection.id ? { ...s, items: [...(s.items || []), newItem] } : s
            )
          );
          setIsItemModalOpen(false);
          setEditingItem(null);
          setSuccessMessage('Item created in DRAFT.');
        } else {
          setErrorMessage(res.message || 'Failed to create item.');
        }
      }
    } catch (err: any) {
      setErrorMessage('Error saving item.');
    } finally {
      setSaving(false);
    }
  };

  // 5. Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item from the section draft?')) return;
    try {
      const res = await api.deleteAdminCmsItem(itemId);
      if (res.success) {
        setEditingSection((prev: any) => ({
          ...prev,
          items: prev.items.filter((i: any) => i.id !== itemId),
        }));
        setSuccessMessage('Item deleted.');
      } else {
        setErrorMessage(res.message || 'Failed to delete item.');
      }
    } catch (err: any) {
      setErrorMessage('Failed to delete item.');
    }
  };

  // 6. Media Library Selection Handler
  const handleMediaSelect = (media: CmsMediaItem) => {
    if (mediaTargetField === 'section_hero' && editingSection) {
      setEditingSection((prev: any) => ({
        ...prev,
        settings: {
          ...prev.settings,
          bgImage: resolveMediaUrl(media.url),
        },
      }));
    } else {
      setItemForm(prev => ({
        ...prev,
        mediaId: media.id,
        customImageUrl: resolveMediaUrl(media.url), // Display resolved media URL in input
      }));
    }
  };

  // 7. Atomic Publish Handler
  const handlePublish = async () => {
    setPublishing(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.publishAdminCmsPage(activeSlug);
      if (res.success) {
        setSuccessMessage(res.message || `Page '${activeSlug}' published live!`);
        setIsPublishConfirmOpen(false);
        fetchDraftPage(activeSlug);
      } else {
        setErrorMessage(res.message || 'Failed to publish page changes.');
      }
    } catch (err: any) {
      setErrorMessage('Error publishing page.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gold font-bold">{t.common.loading}</div>;
  }

  return (
    <div className="space-y-6">
      {/* CMS Studio Header Bar */}
      <div className="bg-bg-card border border-border-gold p-6 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            {t.cms.studioTitle}
          </div>
          <p className="text-xs text-stone-light">
            {t.cms.studioSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeSlug}
            onChange={e => setActiveSlug(e.target.value)}
            className="bg-black border border-border-subtle text-white text-xs font-bold px-3 py-2 rounded focus:outline-none focus:border-gold"
          >
            <option value="home">{t.cms.homePageOption}</option>
            <option value="footer">{t.cms.footerOption}</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(true)} className="gap-1 text-xs">
            <Eye className="w-4 h-4" /> {t.cms.previewButton}
          </Button>

          <Button variant="gold" size="sm" onClick={() => setIsPublishConfirmOpen(true)} className="gap-1 text-xs">
            <Send className="w-4 h-4" /> {t.cms.publishButton}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Studio Grid: Section Manager (Left) + Section Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Section Manager List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-heading text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> {t.cms.sectionManagerTitle}
              </h3>
              <span className="text-[10px] text-stone font-mono">{sections.length} {t.cms.sectionCount}</span>
            </div>

            <div className="space-y-2">
              {sections.map((sec, idx) => {
                const isSelected = editingSection?.id === sec.id;
                return (
                  <div
                    key={sec.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-bg-secondary border-gold shadow'
                        : 'bg-black/40 border-border-subtle hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer" onClick={() => setEditingSection(sec)}>
                      <span className="text-[10px] font-mono text-stone w-4">{idx + 1}</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">
                          {sec.title || sec.section_key}
                        </span>
                        <span className="text-[9px] text-stone uppercase tracking-wider">
                          {t.cms.sectionType} {sec.section_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleSectionEnabled(sec)}
                        className={`p-1 rounded ${sec.is_enabled ? 'text-emerald-400 hover:bg-emerald-950/50' : 'text-stone hover:bg-neutral-800'}`}
                      >
                        {sec.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0 || reordering}
                        className="p-1 text-stone hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === sections.length - 1 || reordering}
                        className="p-1 text-stone hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <Button
                        size="sm"
                        variant={isSelected ? 'gold' : 'outline'}
                        onClick={() => setEditingSection(sec)}
                        className="h-6 px-2 text-[10px]"
                      >
                        {t.cms.editButton}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Section Editor Pane */}
        <div className="lg:col-span-7 space-y-4">
          {editingSection ? (
            <div className="bg-bg-card border border-border-subtle rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                    {editingSection.section_type}
                  </span>
                  <h2 className="font-heading text-lg font-bold text-white">
                    {editingSection.title || editingSection.section_key}
                  </h2>
                </div>

                <Button variant="gold" size="sm" onClick={handleSaveSectionConfig} disabled={saving}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? t.cms.savingButton : t.cms.saveDraftButton}
                </Button>
              </div>

              {/* Title & Subtitle Form */}
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block text-stone font-bold uppercase tracking-wider mb-1">{t.cms.sectionTitleLabel}</label>
                  <input
                    type="text"
                    value={editingSection.title || ''}
                    onChange={e => setEditingSection((prev: any) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-stone font-bold uppercase tracking-wider mb-1">{t.cms.sectionSubtitleLabel}</label>
                  <input
                    type="text"
                    value={editingSection.subtitle || ''}
                    onChange={e => setEditingSection((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Section-Specific Settings */}
              {editingSection.section_type === 'HERO' && (
                <div className="space-y-4 pt-4 border-t border-border-subtle text-xs">
                  <h4 className="font-bold text-gold uppercase tracking-wider">{t.cms.heroConfigTitle}</h4>

                  <div>
                    <label className="block text-stone font-bold uppercase tracking-wider mb-1">{t.cms.bgImageLabel}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingSection.settings?.bgImage || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, bgImage: e.target.value },
                          }))
                        }
                        className="flex-1 bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                        placeholder={t.cms.bgImagePlaceholder}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMediaTargetField('section_hero');
                          setIsMediaOpen(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-1" /> {t.cms.chooseMediaButton}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone font-bold uppercase tracking-wider mb-1">{t.cms.btn1Label}</label>
                      <input
                        type="text"
                        value={editingSection.settings?.btn1Label || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, btn1Label: e.target.value },
                          }))
                        }
                        className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone font-bold uppercase tracking-wider mb-1">{t.cms.btn1Url}</label>
                      <input
                        type="text"
                        value={editingSection.settings?.btn1Url || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, btn1Url: e.target.value },
                          }))
                        }
                        className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section Items Manager */}
              {['COLLECTION_GRID', 'BRAND_GRID', 'WHY_CHOOSE'].includes(editingSection.section_type) && (
                <div className="space-y-4 pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gold uppercase tracking-wider text-xs">{t.cms.sectionItemsTitle}</h4>
                    <Button size="sm" variant="gold" onClick={() => handleOpenItemForm()}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> {t.cms.addItemButton}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {editingSection.items?.map((item: any) => (
                      <div key={item.id} className="p-3 bg-black/60 border border-border-subtle rounded flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{item.title}</span>
                          <span className="text-[10px] text-stone">{item.description || item.link_url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenItemForm(item)} className="p-1 text-stone hover:text-gold">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-stone hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-stone bg-bg-card border border-border-subtle rounded-lg">
              {t.cms.selectSectionPrompt}
            </div>
          )}
        </div>
      </div>

      {/* Item Create / Edit Dialog Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form onSubmit={handleSaveItem} className="bg-bg-card border border-border-gold rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-white border-b border-border-subtle pb-3">
              {editingItem ? t.cms.editItemTitle : t.cms.newItemTitle}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone font-bold uppercase mb-1">{t.cms.itemTitleLabel}</label>
                <input
                  type="text"
                  required
                  value={itemForm.title}
                  onChange={e => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  placeholder={t.cms.itemTitlePlaceholder}
                />
              </div>

              <div>
                <label className="block text-stone font-bold uppercase mb-1">{t.cms.itemDescLabel}</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  placeholder={t.cms.itemDescPlaceholder}
                />
              </div>

              {editingSection?.section_type === 'WHY_CHOOSE' && (
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">{t.cms.itemIconLabel}</label>
                  <select
                    value={itemForm.iconName}
                    onChange={e => setItemForm(prev => ({ ...prev, iconName: e.target.value }))}
                    className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  >
                    {ALLOWED_ICONS.map(ic => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-stone font-bold uppercase mb-1">{t.cms.itemImageLabel}</label>
                
                <div className="bg-neutral-900/80 border border-border-subtle rounded-lg p-3 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Image Preview Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border-subtle bg-black shrink-0 flex items-center justify-center">
                      {itemForm.customImageUrl ? (
                        <img
                          src={resolveMediaUrl(itemForm.customImageUrl)}
                          alt="Item Preview"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/tiles/calacatta-marble.jpeg';
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-stone/40" />
                      )}
                      {uploadingItemImage && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-gold text-[10px] gap-1">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>อัปโหลด...</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons & URL input */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          ref={itemFileInputRef}
                          onChange={handleItemImageUpload}
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingItemImage}
                          onClick={() => itemFileInputRef.current?.click()}
                          className="text-xs"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          {uploadingItemImage ? 'กำลังอัปโหลด...' : 'อัปโหลดจากเครื่อง'}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMediaTargetField('item');
                            setIsMediaOpen(true);
                          }}
                          className="text-xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1" />
                          {t.cms.chooseMediaButton || 'เลือกจากคลังสื่อ'}
                        </Button>

                        {itemForm.customImageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setItemForm(prev => ({ ...prev, customImageUrl: '', mediaId: '' }))}
                            className="text-xs text-stone hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            ล้างรูปภาพ
                          </Button>
                        )}
                      </div>

                      {/* URL input */}
                      <input
                        type="text"
                        value={itemForm.customImageUrl}
                        onChange={e => setItemForm(prev => ({ ...prev, customImageUrl: e.target.value, mediaId: '' }))}
                        className="w-full bg-black border border-border-subtle rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold truncate"
                        placeholder={t.cms.itemImagePlaceholder || 'หรือใส่ URL รูปภาพ...'}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
              <Button type="button" variant="ghost" size="sm" onClick={handleCloseItemForm}>
                {t.cms.cancelButton}
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={saving}>
                {saving ? t.cms.savingButton : t.cms.saveItemDraftButton}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Media Library Integration */}
      <MediaLibraryModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />

      {/* Publish Confirmation Modal */}
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-bg-card border border-gold rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-gold font-bold text-base border-b border-border-subtle pb-3">
              <Send className="w-5 h-5" /> {t.cms.publishModalTitle}
            </div>
            <p className="text-stone-light leading-relaxed">
              {t.cms.publishModalText}
            </p>
            <div className="bg-black/60 border border-border-subtle p-3 rounded text-[11px] space-y-1">
              <div>{t.cms.pageLabel} <strong className="text-white">{activeSlug}</strong></div>
              <div>{t.cms.sectionsLabel} <strong className="text-white">{sections.length} {t.cms.sectionCount}</strong></div>
              <div>{t.cms.securityStatusLabel} <strong className="text-emerald-400">Atomic Immutability Guaranteed</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPublishConfirmOpen(false)}>
                {t.cms.cancelButton}
              </Button>
              <Button variant="gold" size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? t.cms.publishingButton : t.cms.confirmPublishButton}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Selected Section Draft Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-8 backdrop-blur-sm animate-fadeIn">
          <div className="bg-bg-card border border-border-gold rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-black/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-gold font-bold text-sm">
                  <Eye className="w-4 h-4" /> Section Draft Preview
                </div>
                {editingSection && (
                  <span className="px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-[10px] font-mono text-gold font-bold uppercase">
                    {editingSection.title || editingSection.section_key} ({editingSection.section_type})
                  </span>
                )}
              </div>

              {/* Top Right Close Button */}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-stone hover:text-white hover:bg-neutral-800 transition-colors"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Body - Only selected section */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-bg-primary">
              {editingSection ? (
                <CmsSectionRenderer sections={[editingSection]} />
              ) : (
                <div className="p-8 text-center text-xs text-stone">No section selected for preview.</div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-border-subtle bg-black/60 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-stone">
                Viewing draft preview for current section.
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    setIsPublishConfirmOpen(true);
                  }}
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Publish Live
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
