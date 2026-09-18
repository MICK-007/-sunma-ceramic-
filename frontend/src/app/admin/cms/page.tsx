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
  RotateCcw,
} from 'lucide-react';

const DEFAULT_CARD_COLORS = {
  cardTitleColor: '#FFFFFF',
  cardTitleHoverColor: '#AF8C64',
  cardTextColor: '#CCCCCC',
  cardLinkColor: '#AF8C64',
};

export default function AdminCmsStudioPage() {
  const { t, language } = useLanguage();
  const isThai = language === 'TH';
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
    titleTh: string;
    description: string;
    descriptionTh: string;
    badgeTag: string;
    badgeTagTh: string;
    linkUrl: string;
    iconName: string;
    customImageUrl: string;
    mediaId: string;
    sortOrder: number;
    isEnabled: boolean;
  }>({
    title: '',
    titleTh: '',
    description: '',
    descriptionTh: '',
    badgeTag: '',
    badgeTagTh: '',
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
        setSuccessMessage(isThai ? 'รูปภาพอัปโหลดและถูกเลือกเรียบร้อยแล้ว' : 'Image uploaded and selected successfully.');
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
        const normalizedSections = (res.data.sections || []).map((sec: any) => {
          let parsedSettings = sec.settings;
          if (typeof parsedSettings === 'string') {
            try {
              parsedSettings = JSON.parse(parsedSettings);
            } catch (e) {
              parsedSettings = {};
            }
          }
          return { ...sec, settings: parsedSettings || {} };
        });
        setPageData(res.data.page);
        setSections(normalizedSections);
        if (normalizedSections.length > 0 && !editingSection) {
          setEditingSection(normalizedSections[0]);
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

  const selectSection = (sec: any) => {
    let parsedSettings = sec.settings;
    if (typeof parsedSettings === 'string') {
      try {
        parsedSettings = JSON.parse(parsedSettings);
      } catch (e) {
        parsedSettings = {};
      }
    }
    setEditingSection({ ...sec, settings: parsedSettings || {} });
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
        let savedSettings = res.data?.settings || sectionSettings;
        if (typeof savedSettings === 'string') {
          try {
            savedSettings = JSON.parse(savedSettings);
          } catch (e) {
            savedSettings = sectionSettings;
          }
        }
        const updatedSec = { ...editingSection, ...res.data, settings: savedSettings };
        setSections(prev =>
          prev.map(s => (s.id === editingSection.id ? updatedSec : s))
        );
        setEditingSection(updatedSec);
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
      titleTh: '',
      description: '',
      descriptionTh: '',
      badgeTag: '',
      badgeTagTh: '',
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
      let meta = item.metadata;
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta);
        } catch (e) {
          meta = {};
        }
      }
      meta = meta || {};

      setEditingItem(item);
      setItemForm({
        id: item.id,
        title: item.title || '',
        titleTh: meta.titleTh || '',
        description: item.description || '',
        descriptionTh: meta.descriptionTh || '',
        badgeTag: item.badge_tag || '',
        badgeTagTh: meta.badgeTagTh || '',
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
        titleTh: '',
        description: '',
        descriptionTh: '',
        badgeTag: '',
        badgeTagTh: '',
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

      const itemMetadata = {
        ...(editingItem?.metadata && typeof editingItem.metadata === 'object' ? editingItem.metadata : {}),
        titleTh: itemForm.titleTh.trim(),
        descriptionTh: itemForm.descriptionTh.trim(),
        badgeTagTh: itemForm.badgeTagTh.trim(),
      };

      if (editingItem) {
        // Update Existing Item
        const res = await api.updateAdminCmsItem(editingItem.id, {
          title: itemForm.title,
          description: itemForm.description,
          badgeTag: itemForm.badgeTag.trim() || null,
          linkUrl: itemForm.linkUrl,
          iconName: itemForm.iconName as any,
          customImageUrl: finalImageUrl,
          mediaId: finalMediaId,
          sortOrder: itemForm.sortOrder,
          isEnabled: itemForm.isEnabled,
          metadata: itemMetadata,
        });

        if (res.success) {
          const updatedItem = {
            ...res.data,
            badge_tag: itemForm.badgeTag.trim() || null,
            metadata: itemMetadata,
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
          badgeTag: itemForm.badgeTag.trim() || null,
          linkUrl: itemForm.linkUrl,
          iconName: itemForm.iconName as any,
          customImageUrl: finalImageUrl,
          mediaId: finalMediaId,
          sortOrder: itemForm.sortOrder,
          isEnabled: itemForm.isEnabled,
          metadata: itemMetadata,
        });

        if (res.success) {
          const newItem = {
            ...res.data,
            badge_tag: itemForm.badgeTag.trim() || null,
            metadata: itemMetadata,
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
      <div className="bg-bg-card border border-border-gold/40 p-6 rounded-[2px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            {t.cms.studioTitle}
          </div>
          <p className="text-xs text-txt-muted">
            {t.cms.studioSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeSlug}
            onChange={e => setActiveSlug(e.target.value)}
            className="bg-white border border-border-subtle text-txt-main text-xs font-bold px-3 py-2 rounded-[2px] focus:outline-none focus:border-gold"
          >
            <option value="home">{t.cms.homePageOption}</option>
            <option value="footer">{t.cms.footerOption}</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(true)} className="gap-1 text-xs rounded-[2px]">
            <Eye className="w-4 h-4" /> {t.cms.previewButton}
          </Button>

          <Button variant="gold" size="sm" onClick={() => setIsPublishConfirmOpen(true)} className="gap-1 text-xs rounded-[2px]">
            <Send className="w-4 h-4" /> {t.cms.publishButton}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3 bg-red-950/20 border border-red-500/40 rounded-[2px] text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-[2px] text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Studio Grid: Section Manager (Left) + Section Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Section Manager List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-[2px] p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-heading text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> {t.cms.sectionManagerTitle}
              </h3>
              <span className="text-[10px] text-txt-muted font-mono">{sections.length} {t.cms.sectionCount}</span>
            </div>

            <div className="space-y-2">
              {sections.map((sec, idx) => {
                const isSelected = editingSection?.id === sec.id;
                return (
                  <div
                    key={sec.id}
                    className={`p-3 rounded-[2px] border flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-gold/10 border-gold shadow-sm'
                        : 'bg-bg-secondary/40 border-border-subtle hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer" onClick={() => selectSection(sec)}>
                      <span className="text-[10px] font-mono text-txt-muted w-4">{idx + 1}</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-txt-main block truncate">
                          {sec.title || sec.section_key}
                        </span>
                        <span className="text-[9px] text-txt-muted uppercase tracking-wider">
                          {t.cms.sectionType} {sec.section_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleSectionEnabled(sec)}
                        className={`p-1 rounded-[2px] ${sec.is_enabled ? 'text-emerald-600 hover:bg-emerald-950/10' : 'text-txt-muted hover:bg-neutral-200'}`}
                      >
                        {sec.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0 || reordering}
                        className="p-1 text-txt-muted hover:text-txt-main disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === sections.length - 1 || reordering}
                        className="p-1 text-txt-muted hover:text-txt-main disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <Button
                        size="sm"
                        variant={isSelected ? 'gold' : 'outline'}
                        onClick={() => selectSection(sec)}
                        className="h-6 px-2 text-[10px] rounded-[2px]"
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
            <div className="bg-bg-card border border-border-subtle rounded-[2px] p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                    {editingSection.section_type}
                  </span>
                  <h2 className="font-heading text-lg font-bold text-txt-main">
                    {editingSection.title || editingSection.section_key}
                  </h2>
                </div>

                <Button variant="gold" size="sm" onClick={handleSaveSectionConfig} disabled={saving} className="rounded-[2px]">
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? t.cms.savingButton : t.cms.saveDraftButton}
                </Button>
              </div>

              {/* Title & Subtitle Form (Bilingual EN & TH) */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">
                      {t.cms.sectionTitleLabel} (EN) 🇬🇧
                    </label>
                    <input
                      type="text"
                      value={editingSection.title || ''}
                      onChange={e => setEditingSection((prev: any) => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                      placeholder="e.g. A Better Living Space"
                    />
                  </div>

                  <div>
                    <label className="block text-gold font-medium uppercase tracking-wider mb-1">
                      {isThai ? 'หัวข้อภาษาไทย (Title TH) 🇹🇭' : 'Title in Thai (TH) 🇹🇭'}
                    </label>
                    <input
                      type="text"
                      value={editingSection.settings?.titleTh || ''}
                      onChange={e => setEditingSection((prev: any) => ({
                        ...prev,
                        settings: { ...prev.settings, titleTh: e.target.value }
                      }))}
                      className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                      placeholder={isThai ? 'เช่น ยกระดับ พื้นที่การใช้ชีวิต' : 'e.g. Thai Title translation'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">
                      {t.cms.sectionSubtitleLabel} (EN) 🇬🇧
                    </label>
                    <input
                      type="text"
                      value={editingSection.subtitle || ''}
                      onChange={e => setEditingSection((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                      placeholder={isThai ? 'เช่น ARCHITECTURAL SERIES' : 'e.g. ARCHITECTURAL SERIES'}
                    />
                  </div>

                  <div>
                    <label className="block text-gold font-medium uppercase tracking-wider mb-1">
                      {isThai ? 'คำบรรยายภาษาไทย (Subtitle TH) 🇹🇭' : 'Subtitle in Thai (TH) 🇹🇭'}
                    </label>
                    <input
                      type="text"
                      value={editingSection.settings?.subtitleTh || ''}
                      onChange={e => setEditingSection((prev: any) => ({
                        ...prev,
                        settings: { ...prev.settings, subtitleTh: e.target.value }
                      }))}
                      className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                      placeholder={isThai ? 'เช่น ความงดงามเหนือกาลเวลา คุณภาพทนทาน...' : 'e.g. Thai Subtitle translation'}
                    />
                  </div>
                </div>
              </div>

              {/* Section-Specific Settings */}
              {editingSection.section_type === 'HERO' && (
                <div className="space-y-4 pt-4 border-t border-border-subtle text-xs">
                  <h4 className="font-bold text-gold uppercase tracking-wider">{t.cms.heroConfigTitle}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">
                        Eyebrow / Kicker (EN) 🇬🇧
                      </label>
                      <input
                        type="text"
                        value={editingSection.settings?.eyebrow || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, eyebrow: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="e.g. PREMIUM TILES FOR"
                      />
                    </div>
                    <div>
                      <label className="block text-gold font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'Eyebrow ภาษาไทย (TH) 🇹🇭' : 'Eyebrow in Thai (TH) 🇹🇭'}
                      </label>
                      <input
                        type="text"
                        value={editingSection.settings?.eyebrowTh || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, eyebrowTh: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder={isThai ? 'เช่น กระเบื้องพอร์ซเลนระดับพรีเมียม' : 'e.g. Premium porcelain tiles'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">{t.cms.bgImageLabel}</label>
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
                        className="flex-1 bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="/images/hero-villa.webp"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-[2px]"
                        onClick={() => {
                          setMediaTargetField('section_hero');
                          setIsMediaOpen(true);
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-1" /> {t.cms.chooseMediaButton}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">{t.cms.btn1Label} (EN) 🇬🇧</label>
                      <input
                        type="text"
                        value={editingSection.settings?.btn1Label || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, btn1Label: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="Explore Collection"
                      />
                    </div>
                    <div>
                      <label className="block text-gold font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'ปุ่มภาษาไทย (TH) 🇹🇭' : 'Button 1 Label in Thai (TH) 🇹🇭'}
                      </label>
                      <input
                        type="text"
                        value={editingSection.settings?.btn1LabelTh || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, btn1LabelTh: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder={isThai ? 'สำรวจคอลเลกชัน' : 'e.g. Explore Collection'}
                      />
                    </div>
                    <div>
                      <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">{t.cms.btn1Url}</label>
                      <input
                        type="text"
                        value={editingSection.settings?.btn1Url || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, btn1Url: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="/shop"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* B2B_CTA Section-Specific Settings */}
              {editingSection.section_type === 'B2B_CTA' && (
                <div className="space-y-4 pt-4 border-t border-border-subtle text-xs">
                  <h4 className="font-bold text-gold uppercase tracking-wider">
                    {isThai ? 'ตั้งค่าเนื้อหาและปุ่มบริการโครงการ B2B (B2B CTA Settings)' : 'B2B Project CTA Content & Action Button Settings'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'รายละเอียด / เนื้อหาโครงการ (Description EN) 🇬🇧' : 'Project Details / Description (EN) 🇬🇧'}
                      </label>
                      <textarea
                        rows={3}
                        value={editingSection.settings?.description || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, description: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="Special wholesale rates, custom slab cutting, sample kits..."
                      />
                    </div>
                    <div>
                      <label className="block text-gold font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'รายละเอียด / เนื้อหาโครงการภาษาไทย (Description TH) 🇹🇭' : 'Project Details / Description in Thai (TH) 🇹🇭'}
                      </label>
                      <textarea
                        rows={3}
                        value={editingSection.settings?.descriptionTh || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, descriptionTh: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder={isThai ? 'ราคาส่งพิเศษสำหรับโครงการ บริการตัดแผ่นสแลปตามแบบ ชุดตัวอย่างกระเบื้อง...' : 'e.g. Special wholesale rates, custom slab cutting...'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'ข้อความบนปุ่ม (Button Label EN) 🇬🇧' : 'Button Label (EN) 🇬🇧'}
                      </label>
                      <input
                        type="text"
                        value={editingSection.settings?.buttonLabel || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, buttonLabel: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="Request Project Quote"
                      />
                    </div>
                    <div>
                      <label className="block text-gold font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'ข้อความบนปุ่มภาษาไทย (Button Label TH) 🇹🇭' : 'Button Label in Thai (TH) 🇹🇭'}
                      </label>
                      <input
                        type="text"
                        value={editingSection.settings?.buttonLabelTh || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, buttonLabelTh: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder={isThai ? 'ขอใบเสนอราคาโครงการ' : 'e.g. Request Project Quote'}
                      />
                    </div>
                    <div>
                      <label className="block text-txt-muted font-medium uppercase tracking-wider mb-1">
                        {isThai ? 'ลิงก์ปลายทาง (Button URL)' : 'Destination Link (Button URL)'}
                      </label>
                      <input
                        type="text"
                        value={editingSection.settings?.buttonUrl || ''}
                        onChange={e =>
                          setEditingSection((prev: any) => ({
                            ...prev,
                            settings: { ...prev.settings, buttonUrl: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COLLECTION_GRID Section-Specific Color Customization */}
              {editingSection.section_type === 'COLLECTION_GRID' && (
                <div className="space-y-4 pt-4 border-t border-border-subtle text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> {isThai ? 'ปรับแต่งสีหัวข้อและการ์ด (Card Typography & Colors)' : 'Card Typography & Colors'}
                      </h4>
                      <p className="text-[11px] text-txt-muted mt-0.5">
                        {isThai
                          ? 'กำหนดสีข้อความหัวข้อ สีตอนเอาเมาส์วาง (Hover) และสีคำบรรยายของการ์ดคอลเลกชัน'
                          : 'Customize title color, hover state, description text, and link accents for collection cards.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingSection((prev: any) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            cardTitleColor: DEFAULT_CARD_COLORS.cardTitleColor,
                            cardTitleHoverColor: DEFAULT_CARD_COLORS.cardTitleHoverColor,
                            cardTextColor: DEFAULT_CARD_COLORS.cardTextColor,
                            cardLinkColor: DEFAULT_CARD_COLORS.cardLinkColor,
                          },
                        }))
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-txt-muted hover:text-gold border border-border-subtle hover:border-gold rounded-[2px] bg-white transition-colors shadow-sm"
                      title={isThai ? 'รีเซ็ตกลับเป็นสีเดิม' : 'Reset to original default colors'}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isThai ? 'คืนค่าสีเดิม' : 'Reset Defaults'}</span>
                    </button>
                  </div>

                  <div className="bg-bg-secondary/40 border border-border-subtle rounded-[2px] divide-y divide-border-subtle overflow-hidden">
                    {/* 1. Card Title Color */}
                    <label className="flex items-center justify-between p-3.5 hover:bg-gold/5 cursor-pointer transition-colors group">
                      <div>
                        <span className="block text-txt-main font-semibold uppercase tracking-wider text-[11px] group-hover:text-gold transition-colors">
                          {isThai ? 'สีหัวข้อการ์ดปกติ' : 'Card Title Color (Default)'}
                        </span>
                        <span className="text-[10px] text-txt-muted">
                          {isThai ? 'สีข้อความหัวข้อหลักของการ์ดในมุมมองปกติ' : 'Main title text color under normal view'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-semibold text-txt-muted group-hover:text-gold transition-colors uppercase">
                          {editingSection.settings?.cardTitleColor || DEFAULT_CARD_COLORS.cardTitleColor}
                        </span>
                        <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-border-subtle group-hover:ring-gold transition-all overflow-hidden flex items-center justify-center shrink-0">
                          <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: editingSection.settings?.cardTitleColor || DEFAULT_CARD_COLORS.cardTitleColor }}
                          />
                          <input
                            type="color"
                            value={editingSection.settings?.cardTitleColor || DEFAULT_CARD_COLORS.cardTitleColor}
                            onChange={e =>
                              setEditingSection((prev: any) => ({
                                ...prev,
                                settings: { ...prev.settings, cardTitleColor: e.target.value },
                              }))
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                    </label>

                    {/* 2. Card Title Hover Color */}
                    <label className="flex items-center justify-between p-3.5 hover:bg-gold/5 cursor-pointer transition-colors group">
                      <div>
                        <span className="block text-gold font-semibold uppercase tracking-wider text-[11px]">
                          {isThai ? 'สีหัวข้อตอนเอาเมาส์ชี้' : 'Card Title Hover Color'}
                        </span>
                        <span className="text-[10px] text-txt-muted">
                          {isThai ? 'สีข้อความหัวข้อจะเปลี่ยนเป็นสีนี้เมื่อผู้ใช้นำเมาส์ไปชี้' : 'Title text switches to this accent when hovered'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-semibold text-txt-muted group-hover:text-gold transition-colors uppercase">
                          {editingSection.settings?.cardTitleHoverColor || DEFAULT_CARD_COLORS.cardTitleHoverColor}
                        </span>
                        <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-border-subtle group-hover:ring-gold transition-all overflow-hidden flex items-center justify-center shrink-0">
                          <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: editingSection.settings?.cardTitleHoverColor || DEFAULT_CARD_COLORS.cardTitleHoverColor }}
                          />
                          <input
                            type="color"
                            value={editingSection.settings?.cardTitleHoverColor || DEFAULT_CARD_COLORS.cardTitleHoverColor}
                            onChange={e =>
                              setEditingSection((prev: any) => ({
                                ...prev,
                                settings: { ...prev.settings, cardTitleHoverColor: e.target.value },
                              }))
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                    </label>

                    {/* 3. Description Text Color */}
                    <label className="flex items-center justify-between p-3.5 hover:bg-gold/5 cursor-pointer transition-colors group">
                      <div>
                        <span className="block text-txt-muted font-semibold uppercase tracking-wider text-[11px] group-hover:text-txt-main transition-colors">
                          {isThai ? 'สีตัวอักษรคำบรรยาย' : 'Description Text Color'}
                        </span>
                        <span className="text-[10px] text-txt-muted">
                          {isThai ? 'สีข้อความคำบรรยายรายละเอียดสินค้าหรือการ์ด' : 'Secondary description text color on the card'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-semibold text-txt-muted group-hover:text-gold transition-colors uppercase">
                          {editingSection.settings?.cardTextColor?.startsWith('#')
                            ? editingSection.settings.cardTextColor
                            : (editingSection.settings?.cardTextColor || DEFAULT_CARD_COLORS.cardTextColor)}
                        </span>
                        <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-border-subtle group-hover:ring-gold transition-all overflow-hidden flex items-center justify-center shrink-0">
                          <div
                            className="w-full h-full rounded-full"
                            style={{
                              backgroundColor: editingSection.settings?.cardTextColor?.startsWith('#')
                                ? editingSection.settings.cardTextColor
                                : DEFAULT_CARD_COLORS.cardTextColor
                            }}
                          />
                          <input
                            type="color"
                            value={
                              editingSection.settings?.cardTextColor?.startsWith('#')
                                ? editingSection.settings.cardTextColor
                                : DEFAULT_CARD_COLORS.cardTextColor
                            }
                            onChange={e =>
                              setEditingSection((prev: any) => ({
                                ...prev,
                                settings: { ...prev.settings, cardTextColor: e.target.value },
                              }))
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                    </label>

                    {/* 4. Link & Accent Color */}
                    <label className="flex items-center justify-between p-3.5 hover:bg-gold/5 cursor-pointer transition-colors group">
                      <div>
                        <span className="block text-gold font-semibold uppercase tracking-wider text-[11px]">
                          {isThai ? 'สีลิงก์สำรวจและปุ่ม' : 'Explore Link & Accent Color'}
                        </span>
                        <span className="text-[10px] text-txt-muted">
                          {isThai ? 'สีข้อความลิงก์สำรวจ (Explore Series) และลูกศร' : 'Color for the Explore Series action link and arrow'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-semibold text-txt-muted group-hover:text-gold transition-colors uppercase">
                          {editingSection.settings?.cardLinkColor || DEFAULT_CARD_COLORS.cardLinkColor}
                        </span>
                        <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-border-subtle group-hover:ring-gold transition-all overflow-hidden flex items-center justify-center shrink-0">
                          <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: editingSection.settings?.cardLinkColor || DEFAULT_CARD_COLORS.cardLinkColor }}
                          />
                          <input
                            type="color"
                            value={editingSection.settings?.cardLinkColor || DEFAULT_CARD_COLORS.cardLinkColor}
                            onChange={e =>
                              setEditingSection((prev: any) => ({
                                ...prev,
                                settings: { ...prev.settings, cardLinkColor: e.target.value },
                              }))
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Live Preview Box */}
                  <div className="p-3 bg-neutral-900 rounded-[2px] flex flex-wrap items-center justify-between gap-3 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400">
                      {isThai ? 'ตัวอย่างการแสดงผลบนการ์ดจริง (Live Preview):' : 'Card Live Preview:'}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span
                        style={{ color: editingSection.settings?.cardTitleColor || DEFAULT_CARD_COLORS.cardTitleColor }}
                        className="font-heading font-medium text-sm"
                      >
                        Calacatta Imperiale
                      </span>
                      <span className="text-neutral-500 text-[10px]">
                        {isThai ? '→ ชี้เมาส์:' : '→ Hover:'}
                      </span>
                      <span
                        style={{ color: editingSection.settings?.cardTitleHoverColor || DEFAULT_CARD_COLORS.cardTitleHoverColor }}
                        className="font-heading font-medium text-sm"
                      >
                        Calacatta Imperiale
                      </span>
                      <span
                        style={{ color: editingSection.settings?.cardTextColor || DEFAULT_CARD_COLORS.cardTextColor }}
                        className="text-[11px] italic"
                      >
                        {isThai ? 'คำบรรยายเนื้อหา' : 'Collection Description'}
                      </span>
                      <span
                        style={{ color: editingSection.settings?.cardLinkColor || DEFAULT_CARD_COLORS.cardLinkColor }}
                        className="text-[10px] font-bold uppercase tracking-wider"
                      >
                        Explore Series →
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section Items Manager */}
              {['COLLECTION_GRID', 'BRAND_GRID', 'WHY_CHOOSE'].includes(editingSection.section_type) && (
                <div className="space-y-4 pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gold uppercase tracking-wider text-xs">{t.cms.sectionItemsTitle}</h4>
                    <Button size="sm" variant="gold" onClick={() => handleOpenItemForm()} className="rounded-[2px]">
                      <Plus className="w-3.5 h-3.5 mr-1" /> {t.cms.addItemButton}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {editingSection.items?.map((item: any) => {
                      let meta = item.metadata;
                      if (typeof meta === 'string') {
                        try {
                          meta = JSON.parse(meta);
                        } catch (e) {
                          meta = {};
                        }
                      }
                      meta = meta || {};

                      return (
                        <div key={item.id} className="p-3 bg-bg-secondary/40 border border-border-subtle rounded-[2px] flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-txt-main">{item.title}</span>
                              {meta.titleTh && (
                                <span className="text-[11px] text-gold font-medium">({meta.titleTh})</span>
                              )}
                              {item.badge_tag && (
                                <span className="px-1.5 py-0.5 rounded-[2px] bg-gold/15 text-gold text-[9px] font-mono font-semibold">
                                  {item.badge_tag}{meta.badgeTagTh ? ` / ${meta.badgeTagTh}` : ''}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-txt-muted line-clamp-1">
                              {meta.descriptionTh ? `[TH] ${meta.descriptionTh}` : (item.description || item.link_url)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenItemForm(item)} className="p-1 text-txt-muted hover:text-gold transition-colors" title="Edit item">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-1 text-txt-muted hover:text-red-500 transition-colors" title="Delete item">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-txt-muted bg-bg-card border border-border-subtle rounded-[2px] shadow-sm">
              {t.cms.selectSectionPrompt}
            </div>
          )}
        </div>
      </div>

      {/* Item Create / Edit Dialog Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveItem} className="bg-bg-card border border-border-gold/40 rounded-[2px] w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-txt-main border-b border-border-subtle pb-3">
              {editingItem ? t.cms.editItemTitle : t.cms.newItemTitle}
            </h3>

            <div className="space-y-4 text-xs">
              {/* Bilingual Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt-muted font-medium uppercase mb-1">
                    {editingSection?.section_type === 'BRAND_GRID'
                      ? (isThai ? 'ชื่อแบรนด์ (Brand Name EN) 🇬🇧' : 'Brand Name (EN) 🇬🇧')
                      : `${t.cms.itemTitleLabel} (EN) 🇬🇧`}
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.title}
                    onChange={e => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                    placeholder={
                      editingSection?.section_type === 'BRAND_GRID'
                        ? 'e.g. SUNMA CERAMIC'
                        : t.cms.itemTitlePlaceholder
                    }
                  />
                </div>

                <div>
                  <label className="block text-gold font-medium uppercase mb-1">
                    {editingSection?.section_type === 'BRAND_GRID'
                      ? (isThai ? 'ชื่อแบรนด์ภาษาไทย (Brand Name TH) 🇹🇭' : 'Brand Name in Thai (TH) 🇹🇭')
                      : (isThai ? 'หัวข้อภาษาไทย (Title TH) 🇹🇭' : 'Title in Thai (TH) 🇹🇭')}
                  </label>
                  <input
                    type="text"
                    value={itemForm.titleTh}
                    onChange={e => setItemForm(prev => ({ ...prev, titleTh: e.target.value }))}
                    className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                    placeholder={
                      editingSection?.section_type === 'BRAND_GRID'
                        ? (isThai ? 'เช่น ซันม่า เซรามิก' : 'e.g. Thai Brand Name')
                        : (isThai ? 'ใส่หัวข้อภาษาไทย...' : 'Enter Thai title...')
                    }
                  />
                </div>
              </div>

              {/* Bilingual Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt-muted font-medium uppercase mb-1">
                    {t.cms.itemDescLabel} (EN) 🇬🇧
                  </label>
                  <textarea
                    rows={2}
                    value={itemForm.description}
                    onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                    placeholder={t.cms.itemDescPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-gold font-medium uppercase mb-1">
                    {isThai ? 'คำบรรยายภาษาไทย (Description TH) 🇹🇭' : 'Description in Thai (TH) 🇹🇭'}
                  </label>
                  <textarea
                    rows={2}
                    value={itemForm.descriptionTh}
                    onChange={e => setItemForm(prev => ({ ...prev, descriptionTh: e.target.value }))}
                    className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                    placeholder={isThai ? 'ใส่คำบรรยายภาษาไทย...' : 'Enter Thai description...'}
                  />
                </div>
              </div>

              {/* BRAND_GRID: Country / Origin Fields */}
              {editingSection?.section_type === 'BRAND_GRID' && (
                <div className="bg-gold/5 border border-gold/25 p-3 rounded-[2px] space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-txt-muted font-medium uppercase mb-1">
                        {isThai ? 'ประเทศแหล่งกำเนิด (Origin Country EN) 🇬🇧' : 'Origin Country (EN) 🇬🇧'}
                      </label>
                      <input
                        type="text"
                        value={itemForm.badgeTag}
                        onChange={e => setItemForm(prev => ({ ...prev, badgeTag: e.target.value }))}
                        className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-1.5 text-txt-main focus:outline-none focus:border-gold"
                        placeholder={isThai ? 'เช่น ITALY, SPAIN, JAPAN, THAILAND' : 'e.g. ITALY, SPAIN, JAPAN, THAILAND'}
                      />
                      <span className="text-[10px] text-txt-muted mt-0.5 block">
                        {isThai ? 'แสดงผลเป็น: ' : 'Displays as: '}Origin: {itemForm.badgeTag || 'ITALY'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-gold font-medium uppercase mb-1">
                        {isThai ? 'ประเทศแหล่งกำเนิดภาษาไทย (Origin Country TH) 🇹🇭' : 'Origin Country in Thai (TH) 🇹🇭'}
                      </label>
                      <input
                        type="text"
                        value={itemForm.badgeTagTh}
                        onChange={e => setItemForm(prev => ({ ...prev, badgeTagTh: e.target.value }))}
                        className="w-full bg-white border border-gold/40 rounded-[2px] px-3 py-1.5 text-txt-main focus:outline-none focus:border-gold"
                        placeholder={isThai ? 'เช่น อิตาลี, สเปน, ญี่ปุ่น, ประเทศไทย' : 'e.g. Italy, Spain, Japan, Thailand'}
                      />
                      <span className="text-[10px] text-gold/80 mt-0.5 block">
                        {isThai ? 'แสดงผลเป็น: ' : 'Displays as: '}{isThai ? 'แหล่งกำเนิด: ' : 'Origin: '}{itemForm.badgeTagTh || (isThai ? 'อิตาลี' : 'Italy')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* WHY_CHOOSE: Icon Selector */}
              {editingSection?.section_type === 'WHY_CHOOSE' && (
                <div>
                  <label className="block text-txt-muted font-medium uppercase mb-1">{t.cms.itemIconLabel}</label>
                  <select
                    value={itemForm.iconName}
                    onChange={e => setItemForm(prev => ({ ...prev, iconName: e.target.value }))}
                    className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-2 text-txt-main focus:outline-none focus:border-gold"
                  >
                    {ALLOWED_ICONS.map(ic => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Link URL for Brand Grid & Collection Grid */}
              {['BRAND_GRID', 'COLLECTION_GRID'].includes(editingSection?.section_type) && (
                <div>
                  <label className="block text-txt-muted font-medium uppercase mb-1">
                    {t.cms.itemLinkUrlLabel || (isThai ? 'ลิงก์เป้าหมายเมื่อคลิก (Link URL)' : 'Destination Link URL')}
                  </label>
                  <input
                    type="text"
                    value={itemForm.linkUrl}
                    onChange={e => setItemForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-1.5 text-txt-main focus:outline-none focus:border-gold"
                    placeholder="/shop?search=marble"
                  />
                </div>
              )}

              {/* Image Uploader for Collection Grid and others */}
              {editingSection?.section_type === 'COLLECTION_GRID' && (
                <div>
                  <label className="block text-txt-muted font-medium uppercase mb-1">{t.cms.itemImageLabel}</label>
                  
                  <div className="bg-bg-secondary/40 border border-border-subtle rounded-[2px] p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      {/* Image Preview Thumbnail */}
                      <div className="relative w-20 h-20 rounded-[2px] overflow-hidden border border-border-subtle bg-bg-secondary shrink-0 flex items-center justify-center">
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
                            <span>{isThai ? 'อัปโหลด...' : 'Uploading...'}</span>
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
                            className="text-xs rounded-[2px]"
                          >
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            {uploadingItemImage ? (isThai ? 'กำลังอัปโหลด...' : 'Uploading...') : (isThai ? 'อัปโหลดจากเครื่อง' : 'Upload from Device')}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMediaTargetField('item');
                              setIsMediaOpen(true);
                            }}
                            className="text-xs rounded-[2px]"
                          >
                            <ImageIcon className="w-3.5 h-3.5 mr-1" />
                            {t.cms.chooseMediaButton || (isThai ? 'เลือกจากคลังสื่อ' : 'Choose Media')}
                          </Button>

                          {itemForm.customImageUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setItemForm(prev => ({ ...prev, customImageUrl: '', mediaId: '' }))}
                              className="text-xs rounded-[2px] text-red-500 hover:text-red-600 hover:bg-red-950/10"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              {isThai ? 'ล้างรูปภาพ' : 'Remove Image'}
                            </Button>
                          )}
                        </div>

                        {/* URL input */}
                        <input
                          type="text"
                          value={itemForm.customImageUrl}
                          onChange={e => setItemForm(prev => ({ ...prev, customImageUrl: e.target.value, mediaId: '' }))}
                          className="w-full bg-white border border-border-subtle rounded-[2px] px-3 py-1.5 text-xs text-txt-main focus:outline-none focus:border-gold truncate"
                          placeholder={t.cms.itemImagePlaceholder || (isThai ? 'หรือใส่ URL รูปภาพ...' : 'Or enter image URL...')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
              <Button type="button" variant="ghost" size="sm" onClick={handleCloseItemForm} className="rounded-[2px]">
                {t.cms.cancelButton}
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={saving} className="rounded-[2px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-gold/40 rounded-[2px] w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-gold font-bold text-base border-b border-border-subtle pb-3">
              <Send className="w-5 h-5" /> {t.cms.publishModalTitle}
            </div>
            <p className="text-txt-muted leading-relaxed">
              {t.cms.publishModalText}
            </p>
            <div className="bg-bg-secondary/50 border border-border-subtle p-3 rounded-[2px] text-[11px] space-y-1">
              <div>{t.cms.pageLabel} <strong className="text-txt-main">{activeSlug}</strong></div>
              <div>{t.cms.sectionsLabel} <strong className="text-txt-main">{sections.length} {t.cms.sectionCount}</strong></div>
              <div>{t.cms.securityStatusLabel} <strong className="text-emerald-600">Atomic Immutability Guaranteed</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPublishConfirmOpen(false)} className="rounded-[2px]">
                {t.cms.cancelButton}
              </Button>
              <Button variant="gold" size="sm" onClick={handlePublish} disabled={publishing} className="rounded-[2px]">
                {publishing ? t.cms.publishingButton : t.cms.confirmPublishButton}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Selected Section Draft Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8 backdrop-blur-sm animate-fadeIn">
          <div className="bg-bg-card border border-border-gold/40 rounded-[2px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-secondary/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-gold font-bold text-sm">
                  <Eye className="w-4 h-4" /> Section Draft Preview
                </div>
                {editingSection && (
                  <span className="px-2 py-0.5 rounded-[2px] bg-gold/10 border border-gold/30 text-[10px] font-mono text-gold font-bold uppercase">
                    {editingSection.title || editingSection.section_key} ({editingSection.section_type})
                  </span>
                )}
              </div>

              {/* Top Right Close Button */}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-[2px] text-txt-muted hover:text-txt-main hover:bg-neutral-200 transition-colors"
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
                <div className="p-8 text-center text-xs text-txt-muted">No section selected for preview.</div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-border-subtle bg-bg-secondary/40 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-txt-muted">
                Viewing draft preview for current section.
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsPreviewModalOpen(false)} className="rounded-[2px]">
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  className="rounded-[2px]"
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
