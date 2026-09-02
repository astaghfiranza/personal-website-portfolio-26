import React, { useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Plus,
  AlertCircle,
  Layers,
  FileCheck,
  Loader2,
  X,
  Edit3,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { fetchMedia, uploadMedia, updateMedia, deleteMedia } from '../../lib/api';

interface BulkUploadFile {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  altText: string;
  caption: string;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export const AdminMediaLibrary: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  
  // Single upload staged state (gives user time to edit title, caption, alt text before saving)
  const [stagedFile, setStagedFile] = useState<{
    url: string;
    file?: File;
    title: string;
    altText: string;
    caption: string;
    type: 'image' | 'video';
    size_kb: number;
  } | null>(null);

  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Bulk upload state
  const [bulkQueue, setBulkQueue] = useState<BulkUploadFile[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0);

  // Editing existing media metadata state
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await fetchMedia();
      setMediaList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // Single Upload: Select file and stage it for editing
  const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Upload failed. Maximum file size is 10MB.');
      return;
    }

    setError(null);
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
    const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStagedFile({
        url: dataUrl,
        file,
        title: defaultName,
        altText: defaultName,
        caption: '',
        type: isVideo ? 'video' : 'image',
        size_kb: Math.round(file.size / 1024),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Single Upload: Stage from external URL
  const handleStageExternalUrl = () => {
    if (!externalUrlInput.trim()) {
      setError('Please provide an image or video URL.');
      return;
    }

    const trimmed = externalUrlInput.trim();
    const isVideo = trimmed.endsWith('.mp4') || trimmed.endsWith('.webm');
    const defaultName = trimmed.split('/').pop()?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Visual Asset';

    setError(null);
    setStagedFile({
      url: trimmed,
      title: defaultName,
      altText: defaultName,
      caption: '',
      type: isVideo ? 'video' : 'image',
      size_kb: 150,
    });
  };

  // Single Upload: Final Save action
  const handleSaveStagedMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stagedFile || !stagedFile.url) {
      setError('Please select a file or provide an asset URL.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const titleToSave = stagedFile.title.trim() || stagedFile.altText.trim() || 'Visual Asset';
      const altToSave = stagedFile.altText.trim() || titleToSave || 'Portfolio visual asset';

      const newItem = await uploadMedia({
        url: stagedFile.url,
        type: stagedFile.type,
        title: titleToSave,
        name: titleToSave,
        alt_text: altToSave,
        caption: stagedFile.caption.trim(),
        width: 1400,
        height: 900,
        size_kb: stagedFile.size_kb,
      });

      setStagedFile(null);
      setExternalUrlInput('');
      setSuccessMessage(`Asset "${newItem.title || newItem.name || newItem.alt_text}" saved successfully to the library.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadMedia();
    } catch (err: any) {
      setError(err.message || 'Failed to add media item');
    } finally {
      setUploading(false);
    }
  };

  // Edit Metadata Modal Handlers
  const handleOpenEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title || item.name || item.alt_text || '');
    setEditAltText(item.alt_text || item.title || item.name || '');
    setEditCaption(item.caption || '');
    setEditUrl(item.url || '');
    setError(null);
  };

  const handleSaveMetadataEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingEdit(true);
    setError(null);

    try {
      const titleToSave = editTitle.trim() || editAltText.trim() || 'Visual Asset';
      const altToSave = editAltText.trim() || titleToSave || 'Portfolio visual asset';

      const updated = await updateMedia(editingItem.id, {
        title: titleToSave,
        name: titleToSave,
        alt_text: altToSave,
        caption: editCaption.trim(),
        url: editUrl.trim() || editingItem.url,
      });

      setMediaList((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );

      setEditingItem(null);
      setSuccessMessage(`Asset metadata updated for "${updated.title || updated.name || updated.alt_text}". Changes have safely adapted across all referenced case studies.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update asset metadata');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Bulk File Selection Handler
  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    const newItems: BulkUploadFile[] = files.map((file: File) => {
      const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return {
        id: `bulk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: defaultName,
        altText: defaultName,
        caption: '',
        status: 'idle',
      };
    });

    setBulkQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const removeBulkQueueItem = (id: string) => {
    setBulkQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateBulkItemTitle = (id: string, newTitle: string) => {
    setBulkQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, title: newTitle } : i))
    );
  };

  const updateBulkItemAlt = (id: string, newAlt: string) => {
    setBulkQueue((prev) =>
      prev.map((i) => (i.id === id ? { ...i, altText: newAlt } : i))
    );
  };

  const handleStartBulkUpload = async () => {
    if (!bulkQueue.length || isBulkUploading) return;

    setIsBulkUploading(true);
    setError(null);
    let successCounter = 0;

    for (let i = 0; i < bulkQueue.length; i++) {
      const item = bulkQueue[i];
      if (item.status === 'completed') continue;

      setBulkQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading' } : q))
      );

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        const isVideo = item.file.type.startsWith('video/') || item.file.name.endsWith('.mp4');
        const titleToSave = item.title?.trim() || item.altText?.trim() || 'Media Asset';
        const altToSave = item.altText?.trim() || titleToSave || 'Media Asset';

        await uploadMedia({
          url: dataUrl,
          type: isVideo ? 'video' : 'image',
          title: titleToSave,
          name: titleToSave,
          alt_text: altToSave,
          caption: item.caption || '',
          width: 1400,
          height: 900,
          size_kb: Math.round(dataUrl.length / 1024),
        });

        successCounter++;
        setBulkQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'completed' } : q))
        );
      } catch (err: any) {
        setBulkQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', errorMessage: err.message || 'Upload failed' }
              : q
          )
        );
      }
    }

    setBulkSuccessCount(successCounter);
    setIsBulkUploading(false);
    await loadMedia();
  };

  const clearCompletedBulkQueue = () => {
    setBulkQueue((prev) => {
      prev.filter((i) => i.status === 'completed').forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return prev.filter((i) => i.status !== 'completed');
    });
    setBulkSuccessCount(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset? Any case studies using this asset will safely continue functioning.')) return;
    try {
      await deleteMedia(id);
      setMediaList(mediaList.filter((m) => m.id !== id));
      setSuccessMessage('Asset deleted from library.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset');
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171514]">
            Media Management
          </h1>
          <p className="text-xs font-display text-[#6F6965] mt-1">
            Upload single or bulk visual assets, edit metadata, and manage portfolio visuals
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white text-[#9B0F06] shadow-xs border border-[#E8E3DD]'
                : 'text-[#6F6965] hover:text-[#171514]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Single Asset</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-white text-[#9B0F06] shadow-xs border border-[#E8E3DD]'
                : 'text-[#6F6965] hover:text-[#171514]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Upload</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-display rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-display rounded-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SINGLE UPLOAD PANEL (Gives time to edit caption/alt text before saving) */}
      {activeTab === 'single' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-5 shadow-xs">
          <h2 className="font-display font-bold text-sm text-[#171514] pb-2 border-b border-[#E8E3DD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#9B0F06]" />
              <span>Upload Single Visual Asset</span>
            </div>
            {stagedFile && (
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ready for review & metadata editing
              </span>
            )}
          </h2>

          {!stagedFile ? (
            /* Step 1: Select File or External URL */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload Selector */}
                <div>
                  <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1.5">
                    1. Select Local File (JPG, PNG, WebP, SVG, MP4)
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleSingleFileSelect}
                    className="w-full text-xs font-display text-[#6F6965] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-display file:font-semibold file:bg-[#171514] file:text-white hover:file:bg-[#9B0F06] cursor-pointer bg-[#FAF8F5] p-3 border border-dashed border-[#E8E3DD] rounded-xl hover:border-[#9B0F06]/50 transition-colors"
                  />
                </div>

                {/* Direct URL Input */}
                <div>
                  <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1.5">
                    2. Or Paste External Asset URL / CDN Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={externalUrlInput}
                      onChange={(e) => setExternalUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleStageExternalUrl();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514]"
                    />
                    <button
                      type="button"
                      onClick={handleStageExternalUrl}
                      disabled={!externalUrlInput.trim()}
                      className="px-4 py-2 bg-[#171514] hover:bg-[#9B0F06] disabled:opacity-40 text-white rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Stage Image
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl flex items-start gap-2.5 text-xs font-display text-[#6F6965]">
                <Info className="w-4 h-4 text-[#9B0F06] shrink-0 mt-0.5" />
                <p>
                  Uploading will not immediately save to the library. You will be able to inspect the full visual preview and write descriptive alt text and captions first.
                </p>
              </div>
            </div>
          ) : (
            /* Step 2: Live Preview & Metadata Editor with Primary Save Button */
            <form onSubmit={handleSaveStagedMedia} className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E3DD]">
                <span className="text-xs font-display font-bold uppercase text-[#171514]">
                  Edit Asset Name, Alt Text & Caption Before Saving
                </span>
                <button
                  type="button"
                  onClick={() => setStagedFile(null)}
                  className="inline-flex items-center gap-1 text-xs font-display text-[#6F6965] hover:text-[#9B0F06] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Choose Different File</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Visual Preview Box */}
                <div className="md:col-span-4 space-y-2">
                  <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#E8E3DD] bg-[#FAF8F5] relative shadow-2xs">
                    {stagedFile.type === 'video' ? (
                      <video src={stagedFile.url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={stagedFile.url}
                        alt={stagedFile.altText || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#171514]/80 text-white text-[9px] font-mono uppercase rounded">
                      {stagedFile.type} · {stagedFile.size_kb} KB
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="md:col-span-8 space-y-4">
                  {/* 1. Asset Name / Title */}
                  <div>
                    <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                      Asset Name / Title <span className="text-[#9B0F06]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Telemetry Interface Wireframe"
                      value={stagedFile.title}
                      onChange={(e) =>
                        setStagedFile({ ...stagedFile, title: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                    />
                    <p className="text-[10px] font-display text-[#6F6965] mt-0.5">
                      Visual asset identifier and display name in the library.
                    </p>
                  </div>

                  {/* 2. Alt Text (Accessibility) */}
                  <div>
                    <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                      Alt Text (Accessibility & Screen Readers) <span className="text-[#9B0F06]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. High-contrast system dashboard wireframe diagram"
                      value={stagedFile.altText}
                      onChange={(e) =>
                        setStagedFile({ ...stagedFile, altText: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                    />
                    <p className="text-[10px] font-display text-[#6F6965] mt-0.5">
                      Descriptive text used for screen readers and SEO accessibility.
                    </p>
                  </div>

                  {/* 3. Caption */}
                  <div>
                    <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                      Caption (Editorial Figure Description)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Figure 1.2 — Prototype Iteration and Architecture Diagram"
                      value={stagedFile.caption}
                      onChange={(e) =>
                        setStagedFile({ ...stagedFile, caption: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                    />
                    <p className="text-[10px] font-display text-[#6F6965] mt-0.5">
                      Optional text rendered beneath the image in case study content blocks.
                    </p>
                  </div>

                  {/* Primary Save Button */}
                  <div className="pt-3 border-t border-[#E8E3DD] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setStagedFile(null)}
                      className="px-4 py-2.5 bg-white border border-[#E8E3DD] hover:bg-[#FAF8F5] text-[#171514] rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !stagedFile.title.trim()}
                      className="px-6 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-40 text-white rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving to Library...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Asset to Library</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* BULK UPLOAD PANEL */}
      {activeTab === 'bulk' && (
        <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E3DD]">
            <div>
              <h2 className="font-display font-bold text-sm text-[#171514] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9B0F06]" />
                <span>Bulk Upload Multiple Visual Assets</span>
              </h2>
              <p className="text-xs font-display text-[#6F6965] mt-0.5">
                Select multiple photos or diagrams at once to upload them in a single batch to your media library
              </p>
            </div>

            {bulkQueue.some((i) => i.status === 'completed') && (
              <button
                type="button"
                onClick={clearCompletedBulkQueue}
                className="text-xs font-display font-semibold text-[#6F6965] hover:text-[#9B0F06] self-start sm:self-auto cursor-pointer"
              >
                Clear Completed
              </button>
            )}
          </div>

          {/* Multi-file Input Drop Area */}
          <div>
            <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-2">
              Select Multiple Files (Hold Cmd/Ctrl or Shift to select multiple)
            </label>
            <div className="relative border-2 border-dashed border-[#E8E3DD] hover:border-[#9B0F06] bg-[#FAF8F5] rounded-xl p-6 text-center transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm"
                onChange={handleBulkFileSelect}
                disabled={isBulkUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="p-3 bg-white rounded-full border border-[#E8E3DD] text-[#9B0F06] shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display font-bold text-xs text-[#171514]">
                    Click or drag & drop multiple files here
                  </p>
                  <p className="text-[11px] font-display text-[#6F6965]">
                    Supports PNG, JPG, WebP, SVG, and MP4 videos (up to 10MB each)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Queue List */}
          {bulkQueue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-[#171514]">
                  Queue ({bulkQueue.length} files)
                </span>
                <span className="text-xs font-mono text-[#6F6965]">
                  {bulkQueue.filter((i) => i.status === 'completed').length} / {bulkQueue.length} Uploaded
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 border border-[#E8E3DD] rounded-xl p-2 bg-[#FAF8F5]">
                {bulkQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white border border-[#E8E3DD] rounded-lg flex items-center gap-3 shadow-2xs"
                  >
                    <div className="w-12 h-10 rounded overflow-hidden bg-[#F7F4F0] shrink-0 border border-[#E8E3DD]">
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-semibold text-xs text-[#171514] truncate">
                          {item.file.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#6F6965] shrink-0">
                          {Math.round(item.file.size / 1024)} KB
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateBulkItemTitle(item.id, e.target.value)}
                          placeholder="Asset title / name..."
                          disabled={item.status === 'uploading' || item.status === 'completed'}
                          className="w-full px-2 py-1 text-[11px] font-display border border-[#E8E3DD] rounded bg-[#FAF8F5] focus:outline-none focus:border-[#9B0F06]"
                        />
                        <input
                          type="text"
                          value={item.altText}
                          onChange={(e) => updateBulkItemAlt(item.id, e.target.value)}
                          placeholder="Alt text (accessibility)..."
                          disabled={item.status === 'uploading' || item.status === 'completed'}
                          className="w-full px-2 py-1 text-[11px] font-display border border-[#E8E3DD] rounded bg-[#FAF8F5] focus:outline-none focus:border-[#9B0F06]"
                        />
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2">
                      {item.status === 'uploading' && (
                        <div className="flex items-center gap-1 text-[11px] font-display text-[#9B0F06]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="hidden sm:inline">Uploading...</span>
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <div className="flex items-center gap-1 text-[11px] font-display text-emerald-600 font-semibold">
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">Uploaded</span>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <span className="text-[11px] font-display text-red-600 font-semibold">
                          Error
                        </span>
                      )}
                      {item.status === 'idle' && (
                        <button
                          type="button"
                          onClick={() => removeBulkQueueItem(item.id)}
                          className="p-1 text-[#6F6965] hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload All Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setBulkQueue([])}
                  disabled={isBulkUploading}
                  className="px-3 py-2 text-xs font-display text-[#6F6965] hover:text-[#171514] cursor-pointer"
                >
                  Clear Queue
                </button>

                <button
                  type="button"
                  onClick={handleStartBulkUpload}
                  disabled={isBulkUploading || bulkQueue.every((i) => i.status === 'completed')}
                  className="px-6 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-40 text-white font-display text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {isBulkUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Batch...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload All ({bulkQueue.filter((i) => i.status !== 'completed').length} Files)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media Grid with Metadata Edit Capability */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-[#171514] uppercase tracking-wider">
            All Library Assets ({mediaList.length})
          </h3>
          <span className="text-xs font-display text-[#6F6965]">
            Click "Edit Metadata" on any asset to customize captions or alt text
          </span>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 bg-white border border-[#E8E3DD] rounded-xl">
            <Loader2 className="w-6 h-6 text-[#9B0F06] animate-spin" />
            <p className="font-display text-xs text-[#6F6965]">Loading media assets...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E8E3DD] rounded-xl space-y-2">
            <ImageIcon className="w-10 h-10 text-[#6F6965]/40 mx-auto" />
            <p className="font-display font-semibold text-sm text-[#171514]">
              No media assets in the library yet.
            </p>
            <p className="text-xs font-display text-[#6F6965]">
              Upload your first single or bulk asset above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8E3DD] rounded-xl overflow-hidden shadow-xs group flex flex-col justify-between hover:border-[#9B0F06]/50 transition-all"
              >
                {/* Preview Image */}
                <div className="relative aspect-16/10 bg-[#F7F4F0] overflow-hidden border-b border-[#E8E3DD]">
                  {item.type === 'video' ? (
                    <video src={item.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt_text}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#171514]/80 text-white text-[10px] font-mono uppercase rounded">
                    {item.type}
                  </span>
                </div>

                {/* Info and Actions */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-[#171514] font-display truncate">
                      {item.title || item.name || item.alt_text || 'Media Asset'}
                    </p>
                    {item.alt_text && (item.title || item.name) && item.alt_text !== (item.title || item.name) && (
                      <p className="text-[10px] text-[#6F6965] font-display line-clamp-1 mt-0.5">
                        <span className="font-semibold text-[#171514]">Alt:</span> {item.alt_text}
                      </p>
                    )}
                    {item.caption ? (
                      <p className="text-[11px] text-[#6F6965] font-light line-clamp-2 mt-0.5">
                        "{item.caption}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#6F6965]/60 italic mt-0.5">
                        No caption provided
                      </p>
                    )}
                    <div className="text-[10px] font-mono text-[#6F6965] mt-2 flex gap-2">
                      <span>{item.width && item.height ? `${item.width}x${item.height}` : '1400x900'}</span>
                      <span>·</span>
                      <span>{item.size_kb ? `${item.size_kb} KB` : 'Asset'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8E3DD] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Edit Metadata Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F7F4F0] border border-[#E8E3DD] hover:border-[#171514] text-[#171514] rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer"
                        title="Edit title, alt text, caption, and details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#9B0F06]" />
                        <span>Edit Metadata</span>
                      </button>

                      {/* Copy URL */}
                      <button
                        type="button"
                        onClick={() => handleCopy(item.url, item.id)}
                        className="p-1.5 text-[#6F6965] hover:text-[#171514] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                        title="Copy Asset URL"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT METADATA MODAL (Requirement 2) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171514]/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E3DD] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8E3DD] flex items-center justify-between bg-[#FBF9F6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FDF2F1] text-[#9B0F06] rounded-lg border border-[#9B0F06]/20">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[#171514]">
                    Edit Asset Metadata
                  </h3>
                  <p className="font-display text-xs text-[#6F6965]">
                    Update title, accessibility alt text, and captions for this visual asset
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveMetadataEdit} className="p-6 space-y-4">
              {/* Asset Preview Thumbnail */}
              <div className="flex items-center gap-4 p-3 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-white border border-[#E8E3DD] shrink-0">
                  {editingItem.type === 'video' ? (
                    <video src={editingItem.url} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={editingItem.url}
                      alt={editingItem.alt_text}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-xs text-[#171514] truncate">
                    Asset ID: <span className="font-mono text-[#6F6965]">{editingItem.id}</span>
                  </p>
                  <p className="text-[11px] font-mono text-[#6F6965] mt-0.5">
                    {editingItem.type.toUpperCase()} · {editingItem.size_kb ? `${editingItem.size_kb} KB` : 'Asset'}
                  </p>
                </div>
              </div>

              {/* Title / Name Input */}
              <div>
                <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                  Asset Title / Name <span className="text-[#9B0F06]">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Telemetry Interface Wireframe"
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                />
                <p className="text-[10px] text-[#6F6965] mt-0.5">
                  Display title identifying this asset across the workspace.
                </p>
              </div>

              {/* Alt Text Input */}
              <div>
                <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                  Alt Text (Accessibility) <span className="text-[#9B0F06]">*</span>
                </label>
                <input
                  type="text"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="e.g. High-contrast system dashboard wireframe diagram"
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                />
                <p className="text-[10px] text-[#6F6965] mt-0.5">
                  Describes the image for screen readers and search engines.
                </p>
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                  Caption (Editorial Figure Description)
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="e.g. Figure 1.2 — Prototype Iteration"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                />
                <p className="text-[10px] text-[#6F6965] mt-0.5">
                  Rendered below the image when placed in case study blocks.
                </p>
              </div>

              {/* Direct URL Input */}
              <div>
                <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                  Asset URL / Source
                </label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                />
              </div>

              {/* Safe Sync Assurance Note */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs font-display flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Safe Synchronization:</strong> Updating this asset metadata automatically updates and adapts in any case studies or pages referencing this visual without breaking project layouts.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#E8E3DD] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-white border border-[#E8E3DD] hover:bg-[#FAF8F5] text-[#171514] font-display text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editAltText.trim()}
                  className="px-6 py-2 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-40 text-white font-display text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Metadata Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
