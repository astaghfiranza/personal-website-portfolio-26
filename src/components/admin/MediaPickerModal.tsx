import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Search,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { fetchMedia, uploadMedia } from '../../lib/api';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: { url: string; alt_text?: string; caption?: string }) => void;
  title?: string;
}

interface StagedUpload {
  url: string;
  file?: File;
  title: string;
  alt_text: string;
  caption: string;
  type: 'image' | 'video';
  size_kb: number;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Tab: 'browse' | 'upload'
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');

  // Staged single upload (gives the user time to edit title, alt text, and caption before saving/using)
  const [stagedUpload, setStagedUpload] = useState<StagedUpload | null>(null);
  const [externalUrlInput, setExternalUrlInput] = useState('');

  // Editable fields for browse tab selection override
  const [browseAltOverride, setBrowseAltOverride] = useState('');
  const [browseCaptionOverride, setBrowseCaptionOverride] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setSelectedItem(null);
      setStagedUpload(null);
      setExternalUrlInput('');
      setError(null);
    }
  }, [isOpen]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMedia();
      setMediaList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: User selects a file -> Read & Stage it (DO NOT save yet!)
  const handleFileStaging = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Max size is 10MB.');
      return;
    }

    setError(null);
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');
    const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStagedUpload({
        url: dataUrl,
        file,
        title: defaultName,
        alt_text: defaultName,
        caption: '',
        type: isVideo ? 'video' : 'image',
        size_kb: Math.round(file.size / 1024),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Step 1 (Alternative): User inputs external URL -> Stage it (DO NOT save yet!)
  const handleUrlStaging = () => {
    if (!externalUrlInput.trim()) {
      setError('Please enter a valid image or video URL.');
      return;
    }

    const trimmed = externalUrlInput.trim();
    const isVideo = trimmed.endsWith('.mp4') || trimmed.endsWith('.webm');
    const defaultName = trimmed.split('/').pop()?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Visual Asset';

    setError(null);
    setStagedUpload({
      url: trimmed,
      title: defaultName,
      alt_text: defaultName,
      caption: '',
      type: isVideo ? 'video' : 'image',
      size_kb: 150,
    });
  };

  // Step 2 & 3: User clicks "Save & Use Selected Asset" (Primary Button)
  const handleSaveAndUseStaged = async () => {
    if (!stagedUpload || !stagedUpload.url) {
      setError('No visual asset is ready to save.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const titleToSave = stagedUpload.title?.trim() || stagedUpload.alt_text.trim() || 'Visual Asset';
      const altToSave = stagedUpload.alt_text.trim() || titleToSave || 'Portfolio visual asset';

      const newItem = await uploadMedia({
        url: stagedUpload.url,
        type: stagedUpload.type,
        title: titleToSave,
        name: titleToSave,
        alt_text: altToSave,
        caption: stagedUpload.caption.trim(),
        width: 1400,
        height: 900,
        size_kb: stagedUpload.size_kb,
      });

      onSelect({
        url: newItem.url,
        alt_text: newItem.alt_text,
        caption: newItem.caption,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save and apply asset');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectExistingItem = (item: MediaItem) => {
    setSelectedItem(item);
    setBrowseAltOverride(item.alt_text || item.title || item.name || '');
    setBrowseCaptionOverride(item.caption || '');
  };

  const handleConfirmExistingSelect = () => {
    if (!selectedItem) return;
    onSelect({
      url: selectedItem.url,
      alt_text: browseAltOverride || selectedItem.alt_text,
      caption: browseCaptionOverride || selectedItem.caption,
    });
    onClose();
  };

  if (!isOpen) return null;

  const filteredList = mediaList.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171514]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E3DD] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E3DD] flex items-center justify-between bg-[#FBF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FDF2F1] text-[#9B0F06] rounded-lg border border-[#9B0F06]/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#171514]">
                {title}
              </h3>
              <p className="font-display text-xs text-[#6F6965]">
                Pick from existing assets or upload and review details before inserting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#E8E3DD] flex items-center justify-between bg-white">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-3 text-xs font-display uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'browse'
                  ? 'border-[#9B0F06] text-[#9B0F06]'
                  : 'border-transparent text-[#6F6965] hover:text-[#171514]'
              }`}
            >
              Browse Library ({mediaList.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-xs font-display uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#9B0F06] text-[#9B0F06]'
                  : 'border-transparent text-[#6F6965] hover:text-[#171514]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Asset</span>
            </button>
          </div>

          {activeTab === 'browse' && (
            <div className="relative mb-2 w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6F6965]" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] placeholder:text-[#6F6965]/70 focus:outline-none focus:border-[#9B0F06]"
              />
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-display rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[380px] bg-[#FAF8F5]">
          {activeTab === 'browse' ? (
            loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#9B0F06] animate-spin" />
                <p className="font-display text-xs text-[#6F6965]">Loading media assets...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-white border border-[#E8E3DD] rounded-xl">
                <ImageIcon className="w-10 h-10 text-[#6F6965]/40 mb-3" />
                <p className="font-display font-semibold text-sm text-[#171514]">
                  {searchQuery ? 'No matching assets found' : 'Media Library is empty'}
                </p>
                <p className="font-display text-xs text-[#6F6965] mt-1 max-w-sm">
                  Upload an image or paste a CDN link to populate your portfolio asset library.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 px-4 py-2 bg-[#9B0F06] hover:bg-[#7E0C05] text-white text-xs font-display uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Upload First Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredList.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectExistingItem(item)}
                        onDoubleClick={() => {
                          handleSelectExistingItem(item);
                          onSelect({
                            url: item.url,
                            alt_text: item.alt_text,
                            caption: item.caption,
                          });
                          onClose();
                        }}
                        className={`group cursor-pointer bg-white rounded-xl border overflow-hidden transition-all relative ${
                          isSelected
                            ? 'border-[#9B0F06] ring-2 ring-[#9B0F06]/30 shadow-md'
                            : 'border-[#E8E3DD] hover:border-[#9B0F06]/60 hover:shadow-xs'
                        }`}
                      >
                        <div className="aspect-4/3 bg-[#F7F4F0] relative overflow-hidden">
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.alt_text}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 bg-[#9B0F06] text-white rounded-full shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[#171514]/80 text-white text-[9px] font-display uppercase rounded">
                            {item.type}
                          </span>
                        </div>
                        <div className="p-2.5 space-y-1">
                          <p className="font-display font-semibold text-xs text-[#171514] truncate">
                            {item.title || item.name || item.alt_text || 'Media Item'}
                          </p>
                          {item.alt_text && (item.title || item.name) && item.alt_text !== (item.title || item.name) && (
                            <p className="font-display text-[10px] text-[#6F6965] truncate">
                              Alt: {item.alt_text}
                            </p>
                          )}
                          <p className="font-display text-[10px] text-[#6F6965] truncate">
                            {item.width && item.height ? `${item.width}x${item.height} · ` : ''}
                            {item.size_kb ? `${item.size_kb} KB` : 'CDN Asset'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Item Review & Customization */}
                {selectedItem && (
                  <div className="p-4 bg-white border border-[#E8E3DD] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-bold uppercase text-[#171514] flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-[#9B0F06]" />
                        <span>Customize Alt Text & Caption for this placement</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#6F6965]">
                        {selectedItem.size_kb ? `${selectedItem.size_kb} KB` : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-display font-semibold text-[#171514] mb-1">
                          Alt Text (Accessibility)
                        </label>
                        <input
                          type="text"
                          value={browseAltOverride}
                          onChange={(e) => setBrowseAltOverride(e.target.value)}
                          placeholder="Alt description for screen readers"
                          className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-display font-semibold text-[#171514] mb-1">
                          Caption (Optional)
                        </label>
                        <input
                          type="text"
                          value={browseCaptionOverride}
                          onChange={(e) => setBrowseCaptionOverride(e.target.value)}
                          placeholder="Editorial figure caption"
                          className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Upload Tab: Controlled Flow (Upload -> Review & Edit -> Save/Use) */
            <div className="max-w-2xl mx-auto space-y-6">
              {!stagedUpload ? (
                /* Step 1: Pick File or Enter URL */
                <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-5 shadow-xs">
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-sm text-[#171514]">
                      Step 1: Choose an Image or Video
                    </h4>
                    <p className="font-display text-xs text-[#6F6965]">
                      Select a file from your device or paste an external URL. You'll be able to review and customize title, caption and alt text before saving.
                    </p>
                  </div>

                  {/* Local File Selector */}
                  <div>
                    <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1.5">
                      Upload from Computer
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm"
                      onChange={handleFileStaging}
                      className="w-full text-xs font-display text-[#6F6965] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-display file:font-semibold file:bg-[#171514] file:text-white hover:file:bg-[#9B0F06] cursor-pointer bg-[#FAF8F5] p-3 border border-dashed border-[#E8E3DD] rounded-xl hover:border-[#9B0F06]/50 transition-colors"
                    />
                  </div>

                  {/* Direct URL Input */}
                  <div className="pt-2 border-t border-[#E8E3DD]">
                    <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1.5">
                      Or Paste Image / Video URL
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
                            handleUrlStaging();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                      />
                      <button
                        type="button"
                        onClick={handleUrlStaging}
                        disabled={!externalUrlInput.trim()}
                        className="px-4 py-2 bg-[#171514] hover:bg-[#9B0F06] disabled:opacity-40 text-white font-display text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Preview Image
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Live Preview with Editable Metadata & Primary Save Button */
                <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E3DD]">
                    <div>
                      <h4 className="font-display font-bold text-sm text-[#171514]">
                        Step 2: Review & Edit Asset Details
                      </h4>
                      <p className="font-display text-xs text-[#6F6965]">
                        Add title, alt text and caption before finalizing. Click below to save and insert.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStagedUpload(null)}
                      className="inline-flex items-center gap-1 text-xs font-display text-[#6F6965] hover:text-[#9B0F06] cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Choose Different File</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                    {/* Visual Preview */}
                    <div className="sm:col-span-5 space-y-2">
                      <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#E8E3DD] bg-[#FAF8F5] relative">
                        {stagedUpload.type === 'video' ? (
                          <video src={stagedUpload.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={stagedUpload.url}
                            alt={stagedUpload.alt_text || 'Preview'}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#171514]/85 text-white text-[9px] font-display uppercase rounded">
                          {stagedUpload.type} · {stagedUpload.size_kb} KB
                        </span>
                      </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="sm:col-span-7 space-y-3.5">
                      {/* Asset Name / Title */}
                      <div>
                        <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                          Asset Title / Name <span className="text-[#9B0F06]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Telemetry Interface Wireframe"
                          value={stagedUpload.title}
                          onChange={(e) =>
                            setStagedUpload({ ...stagedUpload, title: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                        />
                        <p className="text-[10px] text-[#6F6965] mt-0.5">
                          Visual asset identifier and display name.
                        </p>
                      </div>

                      {/* Alt Text */}
                      <div>
                        <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                          Alt Text (Accessibility) <span className="text-[#9B0F06]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. System dashboard wireframe diagram"
                          value={stagedUpload.alt_text}
                          onChange={(e) =>
                            setStagedUpload({ ...stagedUpload, alt_text: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                        />
                        <p className="text-[10px] text-[#6F6965] mt-0.5">
                          Describes visual content for screen readers & search engines.
                        </p>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-xs font-display uppercase font-semibold text-[#171514] mb-1">
                          Caption (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Figure 1.2 — Prototype Iteration"
                          value={stagedUpload.caption}
                          onChange={(e) =>
                            setStagedUpload({ ...stagedUpload, caption: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:border-[#9B0F06]"
                        />
                        <p className="text-[10px] text-[#6F6965] mt-0.5">
                          Displayed directly beneath the image inside case study stories.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Save & Use Button inside Step 2 */}
                  <div className="pt-4 border-t border-[#E8E3DD] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setStagedUpload(null)}
                      className="px-4 py-2 bg-white border border-[#E8E3DD] hover:bg-[#F7F4F0] text-[#171514] font-display text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving || !stagedUpload.title?.trim()}
                      onClick={handleSaveAndUseStaged}
                      className="px-6 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-50 text-white font-display text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Asset...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Use Selected Asset</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions for Browse Tab */}
        {activeTab === 'browse' && (
          <div className="px-6 py-4 border-t border-[#E8E3DD] bg-white flex items-center justify-between">
            <div className="font-display text-xs text-[#6F6965]">
              {selectedItem ? (
                <span className="text-[#171514] font-semibold">
                  Selected: {selectedItem.alt_text || selectedItem.url.substring(0, 30)}...
                </span>
              ) : (
                <span>Click on any image above to select</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-[#E8E3DD] hover:bg-[#F7F4F0] text-[#171514] font-display text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExistingSelect}
                disabled={!selectedItem}
                className="px-5 py-2 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-40 text-white font-display text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Use Selected Asset</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
