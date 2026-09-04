'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { MediaLibraryModal, CmsMediaItem } from '@/components/cms/MediaLibraryModal';
import { ALLOWED_ICONS } from '@/lib/cms-utils';
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
  History,
  RotateCcw,
} from 'lucide-react';

export default function AdminCmsStudioPage() {
  const [activeSlug, setActiveSlug] = useState<string>('home');
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [reordering, setReordering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Versioning & Publishing Modals State
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState<boolean>(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState<boolean>(false);
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [selectedRollbackVer, setSelectedRollbackVer] = useState<any | null>(null);

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
      const res = await api.updateAdminCmsSection(editingSection.id, {
        title: editingSection.title,
        subtitle: editingSection.subtitle,
        settings: editingSection.settings,
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
      if (editingItem) {
        // Update Existing Item
        const res = await api.updateAdminCmsItem(editingItem.id, {
          title: itemForm.title,
          description: itemForm.description,
          badgeTag: itemForm.badgeTag,
          linkUrl: itemForm.linkUrl,
          iconName: itemForm.iconName as any,
          customImageUrl: itemForm.customImageUrl,
          mediaId: itemForm.mediaId || null,
          sortOrder: itemForm.sortOrder,
          isEnabled: itemForm.isEnabled,
        });

        if (res.success) {
          setEditingSection((prev: any) => ({
            ...prev,
            items: prev.items.map((i: any) => (i.id === editingItem.id ? res.data : i)),
          }));
          setIsItemModalOpen(false);
          setEditingItem(null);
          setSuccessMessage('บันทึกฉบับร่างรายการสำเร็จ (Item updated in DRAFT).');
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
          customImageUrl: itemForm.customImageUrl,
          mediaId: itemForm.mediaId || null,
          sortOrder: itemForm.sortOrder,
          isEnabled: itemForm.isEnabled,
        });

        if (res.success) {
          setEditingSection((prev: any) => ({
            ...prev,
            items: [...(prev.items || []), res.data],
          }));
          setIsItemModalOpen(false);
          setEditingItem(null);
          setSuccessMessage('เพิ่มรายการฉบับร่างสำเร็จ (Item created in DRAFT).');
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
          bgImage: media.url,
        },
      }));
    } else {
      setItemForm(prev => ({
        ...prev,
        mediaId: media.id,
        customImageUrl: media.url,
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
      } else {
        setErrorMessage(res.message || 'Failed to publish page changes.');
      }
    } catch (err: any) {
      setErrorMessage('Error publishing page.');
    } finally {
      setPublishing(false);
    }
  };

  // 8. Fetch Version History Handler
  const fetchVersions = async (slug: string) => {
    setErrorMessage('');
    try {
      const res = await api.getAdminCmsPageVersions(slug);
      if (res.success) {
        setVersionsList(res.data || []);
        setIsVersionsModalOpen(true);
      } else {
        setErrorMessage(res.message || 'Failed to fetch version history.');
      }
    } catch (err: any) {
      setErrorMessage('Error retrieving version history.');
    }
  };

  // 9. Rollback Version Handler (Creates NEW Version vNext)
  const handleRollback = async () => {
    if (!selectedRollbackVer) return;
    setPublishing(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await api.rollbackAdminCmsPage(activeSlug, selectedRollbackVer.version_number);
      if (res.success) {
        setSuccessMessage(res.message || `Successfully rolled back to v${selectedRollbackVer.version_number}.`);
        setSelectedRollbackVer(null);
        setIsVersionsModalOpen(false);
        fetchDraftPage(activeSlug); // Refresh draft to match restored snapshot
      } else {
        setErrorMessage(res.message || 'Rollback failed.');
      }
    } catch (err: any) {
      setErrorMessage('Error executing rollback.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gold font-bold">Loading CMS Studio...</div>;
  }

  return (
    <div className="space-y-6">
      {/* CMS Studio Header Bar */}
      <div className="bg-bg-card border border-border-gold p-6 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gold font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            SUNMA CERAMIC CMS Studio
          </div>
          <p className="text-xs text-stone-light">
            Manage website sections, text, cards, and assets safely. All changes save to <strong>DRAFT</strong> automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={activeSlug}
            onChange={e => setActiveSlug(e.target.value)}
            className="bg-black border border-border-subtle text-white text-xs font-bold px-3 py-2 rounded focus:outline-none focus:border-gold"
          >
            <option value="home">Home Page (slug: home)</option>
            <option value="footer">Global Footer (slug: footer)</option>
          </select>

          <Link href={`/admin/cms/preview/${activeSlug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <Eye className="w-4 h-4" /> Live Draft Preview
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={() => fetchVersions(activeSlug)} className="gap-1 text-xs">
            <History className="w-4 h-4" /> Version History
          </Button>

          <Button variant="gold" size="sm" onClick={() => setIsPublishConfirmOpen(true)} className="gap-1 text-xs">
            <Send className="w-4 h-4" /> Publish Changes
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
                <Layers className="w-4 h-4" /> Page Section Manager
              </h3>
              <span className="text-[10px] text-stone font-mono">{sections.length} Sections</span>
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
                          Type: {sec.section_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleSectionEnabled(sec)}
                        className={`p-1 rounded ${sec.is_enabled ? 'text-emerald-400 hover:bg-emerald-950/50' : 'text-stone hover:bg-neutral-800'}`}
                        title={sec.is_enabled ? 'Disable Section' : 'Enable Section'}
                      >
                        {sec.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleMoveSection(idx, 'up')}
                        disabled={idx === 0 || reordering}
                        className="p-1 text-stone hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveSection(idx, 'down')}
                        disabled={idx === sections.length - 1 || reordering}
                        className="p-1 text-stone hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <Button
                        size="sm"
                        variant={isSelected ? 'gold' : 'outline'}
                        onClick={() => setEditingSection(sec)}
                        className="h-6 px-2 text-[10px]"
                      >
                        Edit
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
                    Editing Section ({editingSection.section_type})
                  </span>
                  <h2 className="font-heading text-lg font-bold text-white">
                    {editingSection.title || editingSection.section_key}
                  </h2>
                </div>

                <Button variant="gold" size="sm" onClick={handleSaveSectionConfig} disabled={saving}>
                  <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Section Draft'}
                </Button>
              </div>

              {/* Title & Subtitle Form */}
              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block text-stone font-bold uppercase tracking-wider mb-1">Section Title</label>
                  <input
                    type="text"
                    value={editingSection.title || ''}
                    onChange={e => setEditingSection((prev: any) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-stone font-bold uppercase tracking-wider mb-1">Section Subtitle / Eyebrow</label>
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
                  <h4 className="font-bold text-gold uppercase tracking-wider">Hero Banner Configuration</h4>

                  <div>
                    <label className="block text-stone font-bold uppercase tracking-wider mb-1">Background Image URL</label>
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
                        <ImageIcon className="w-4 h-4 mr-1" /> Choose
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone font-bold uppercase tracking-wider mb-1">Button 1 Label</label>
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
                      <label className="block text-stone font-bold uppercase tracking-wider mb-1">Button 1 URL</label>
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
                    <h4 className="font-bold text-gold uppercase tracking-wider text-xs">Section Items</h4>
                    <Button size="sm" variant="gold" onClick={() => handleOpenItemForm()}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
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
              Select a section from the left panel to edit content.
            </div>
          )}
        </div>
      </div>

      {/* Item Create / Edit Dialog Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form onSubmit={handleSaveItem} className="bg-bg-card border border-border-gold rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-white border-b border-border-subtle pb-3">
              {editingItem ? 'แก้ไขรายการ (Edit Item)' : 'เพิ่มรายการใหม่ (Add Item)'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone font-bold uppercase mb-1">ชื่อหัวข้อ (Title) *</label>
                <input
                  type="text"
                  required
                  value={itemForm.title}
                  onChange={e => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  placeholder="กรอกชื่อรายการ..."
                />
              </div>

              <div>
                <label className="block text-stone font-bold uppercase mb-1">คำอธิบาย (Description)</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={e => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>

              {editingSection?.section_type === 'WHY_CHOOSE' && (
                <div>
                  <label className="block text-stone font-bold uppercase mb-1">เลือก ไอคอน (Icon)</label>
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
                <label className="block text-stone font-bold uppercase mb-1">รูปภาพ (Image URL / Media ID)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemForm.customImageUrl}
                    onChange={e => setItemForm(prev => ({ ...prev, customImageUrl: e.target.value }))}
                    className="flex-1 bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold truncate"
                    placeholder="เลือกจากคลังสื่อ หรือวาง URL รูปภาพ (สูงสุด 1,000 ตัวอักษร)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMediaTargetField('item');
                      setIsMediaOpen(true);
                    }}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" /> เลือกรูปสื่อ
                  </Button>
                </div>
                <p className="text-[10px] text-stone mt-1">* หากรูปมาจาก Media Library ระบบจะอ้างอิง media_id และแสดงรูปให้อัตโนมัติ</p>
              </div>

              <div>
                <label className="block text-stone font-bold uppercase mb-1">ลิงก์ปลายทาง (Destination Link URL)</label>
                <input
                  type="text"
                  value={itemForm.linkUrl}
                  onChange={e => setItemForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full bg-black border border-border-subtle rounded px-3 py-2 text-white focus:outline-none focus:border-gold"
                  placeholder="/shop?category=floor-tiles"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
              <Button type="button" variant="ghost" size="sm" onClick={handleCloseItemForm}>
                ยกเลิก (Cancel)
              </Button>
              <Button type="submit" variant="gold" size="sm" disabled={saving}>
                {saving ? 'กำลังบันทึก...' : 'บันทึกฉบับร่าง (Save Draft)'}
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
              <Send className="w-5 h-5" /> Publish Live Website Changes
            </div>
            <p className="text-stone-light leading-relaxed">
              Are you sure you want to <strong>PUBLISH</strong> the current draft changes for page <code className="text-gold">{activeSlug}</code> to the public live website?
            </p>
            <div className="bg-black/60 border border-border-subtle p-3 rounded text-[11px] space-y-1">
              <div>Page: <strong className="text-white">{activeSlug}</strong></div>
              <div>Sections: <strong className="text-white">{sections.length} Active Sections</strong></div>
              <div>Status: <strong className="text-emerald-400">Atomic Immutability Guaranteed</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPublishConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing...' : 'Confirm & Publish Live'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {isVersionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-bg-card border border-border-gold rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl text-xs flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2 text-gold font-bold text-base">
                <History className="w-5 h-5" /> Immutable Version History ({activeSlug})
              </div>
              <button onClick={() => setIsVersionsModalOpen(false)} className="text-stone hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {versionsList.length === 0 ? (
                <div className="py-8 text-center text-stone">No published versions recorded yet.</div>
              ) : (
                versionsList.map(ver => {
                  const isCurrentPublished = ver.status === 'PUBLISHED';
                  return (
                    <div key={ver.id} className="p-3 bg-black/60 border border-border-subtle rounded flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-white text-sm">v{ver.version_number}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isCurrentPublished ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-900 text-stone'}`}>
                            {ver.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone">
                          Published {new Date(ver.created_at).toLocaleString()} by {ver.author_name || ver.author_email || 'Admin'}
                        </div>
                      </div>

                      <div>
                        {!isCurrentPublished && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRollbackVer(ver)}
                            className="h-7 text-[11px] gap-1"
                          >
                            <RotateCcw className="w-3 h-3 text-gold" /> Rollback to v{ver.version_number}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {selectedRollbackVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-bg-card border border-amber-500 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base border-b border-border-subtle pb-3">
              <RotateCcw className="w-5 h-5 animate-spin" /> Confirm Version Rollback
            </div>
            <p className="text-stone-light leading-relaxed">
              Are you sure you want to rollback to <strong>Version v{selectedRollbackVer.version_number}</strong>?
            </p>
            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded text-[11px] space-y-1 text-amber-200">
              <div>• Historical Version v{selectedRollbackVer.version_number} will remain <strong>IMMUTABLE & UNCHANGED</strong>.</div>
              <div>• A <strong>NEW Published Version (vNext)</strong> will be created containing the restored snapshot.</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRollbackVer(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleRollback} disabled={publishing}>
                {publishing ? 'Rolling back...' : 'Confirm Rollback'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
