import React, { useState } from 'react';
import {
  Briefcase,
  Hammer,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExperienceItem } from '../../types';
import { updateExperience } from '../../lib/api';

interface AdminExperienceManagerProps {
  experience: ExperienceItem[];
  onExperienceUpdated: (newExperience: ExperienceItem[]) => void;
}

const CATEGORY_OPTIONS: Array<{
  key: ExperienceItem['category'];
  label: string;
  badge: string;
  icon: any;
  color: string;
}> = [
  {
    key: '01 WORK',
    label: 'Work Experience',
    badge: '01 WORK',
    icon: Briefcase,
    color: '#9B0F06',
  },
  {
    key: '02 BUILD',
    label: 'Entrepreneurial Experience',
    badge: '02 BUILD',
    icon: Hammer,
    color: '#D97706',
  },
  {
    key: '03 LEARN',
    label: 'Certifications',
    badge: '03 LEARN',
    icon: Award,
    color: '#2563EB',
  },
  {
    key: '04 STUDY',
    label: 'Education',
    badge: '04 STUDY',
    icon: GraduationCap,
    color: '#059669',
  },
];

export const AdminExperienceManager: React.FC<AdminExperienceManagerProps> = ({
  experience,
  onExperienceUpdated,
}) => {
  const [items, setItems] = useState<ExperienceItem[]>(experience);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form State
  const [formCategory, setFormCategory] = useState<ExperienceItem['category']>('01 WORK');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formRole, setFormRole] = useState<string>('');
  const [formPeriod, setFormPeriod] = useState<string>('');
  const [formOrganization, setFormOrganization] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formLink, setFormLink] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formHighlights, setFormHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState<string>('');
  const [formMetrics, setFormMetrics] = useState<Array<{ label: string; value: string }>>([]);
  const [newMetricLabel, setNewMetricLabel] = useState<string>('');
  const [newMetricValue, setNewMetricValue] = useState<string>('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Save full items array to API
  const persistChanges = async (newItems: ExperienceItem[]) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateExperience(newItems);
      setItems(newItems);
      onExperienceUpdated(newItems);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save experience changes: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Open Form for New Item
  const handleOpenCreate = (defaultCat?: ExperienceItem['category']) => {
    const category = defaultCat || (activeCategory !== 'ALL' ? (activeCategory as ExperienceItem['category']) : '01 WORK');
    const matched = CATEGORY_OPTIONS.find((c) => c.key === category);

    setEditingItem(null);
    setFormCategory(category);
    setFormTitle('');
    setFormRole('');
    setFormPeriod('');
    setFormOrganization('');
    setFormLocation('');
    setFormLink('');
    setFormDescription('');
    setFormHighlights([]);
    setFormMetrics([]);
    setFormTags([]);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (item: ExperienceItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormTitle(item.title);
    setFormRole(item.role);
    setFormPeriod(item.period);
    setFormOrganization(item.organization || '');
    setFormLocation(item.location || '');
    setFormLink(item.link || '');
    setFormDescription(item.description || '');
    setFormHighlights(item.highlights ? [...item.highlights] : []);
    setFormMetrics(item.metrics ? [...item.metrics] : []);
    setFormTags(item.tags ? [...item.tags] : []);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Duplicate an item
  const handleDuplicate = async (item: ExperienceItem) => {
    const duplicated: ExperienceItem = {
      ...item,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${item.title} (Copy)`,
    };
    const index = items.findIndex((i) => i.id === item.id);
    const newItems = [...items];
    newItems.splice(index + 1, 0, duplicated);
    await persistChanges(newItems);
  };

  // Delete an item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this Track Record item?')) return;
    const newItems = items.filter((i) => i.id !== id);
    await persistChanges(newItems);
  };

  // Move item up / down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    await persistChanges(newItems);
  };

  // Handle Form Submission
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Title or Entity Name is required.');
      return;
    }
    if (!formRole.trim()) {
      setFormError('Role or Program Title is required.');
      return;
    }
    if (!formPeriod.trim()) {
      setFormError('Period or Date is required (e.g. 2024 — Present).');
      return;
    }

    const matchedCat = CATEGORY_OPTIONS.find((c) => c.key === formCategory);
    const categoryLabel = matchedCat ? matchedCat.label : 'Work Experience';

    const itemData: ExperienceItem = {
      id: editingItem ? editingItem.id : `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category: formCategory,
      categoryLabel: categoryLabel,
      title: formTitle.trim(),
      role: formRole.trim(),
      period: formPeriod.trim(),
      organization: formOrganization.trim() || formTitle.trim(),
      location: formLocation.trim() || undefined,
      link: formLink.trim() || undefined,
      description: formDescription.trim(),
      highlights: formHighlights.filter((h) => h.trim() !== ''),
      metrics: formMetrics.length > 0 ? formMetrics : undefined,
      tags: formTags.length > 0 ? formTags : undefined,
    };

    let newItems: ExperienceItem[];
    if (editingItem) {
      newItems = items.map((i) => (i.id === editingItem.id ? itemData : i));
    } else {
      newItems = [itemData, ...items];
    }

    await persistChanges(newItems);
    setIsFormOpen(false);
  };

  // Highlight List Helpers
  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormHighlights([...formHighlights, newHighlight.trim()]);
    setNewHighlight('');
  };

  const removeHighlight = (index: number) => {
    setFormHighlights(formHighlights.filter((_, i) => i !== index));
  };

  // Metric Helpers
  const addMetric = () => {
    if (!newMetricLabel.trim() || !newMetricValue.trim()) return;
    setFormMetrics([...formMetrics, { label: newMetricLabel.trim(), value: newMetricValue.trim() }]);
    setNewMetricLabel('');
    setNewMetricValue('');
  };

  const removeMetric = (index: number) => {
    setFormMetrics(formMetrics.filter((_, i) => i !== index));
  };

  // Tag Helpers
  const addTag = () => {
    if (!newTag.trim()) return;
    if (!formTags.includes(newTag.trim())) {
      setFormTags([...formTags, newTag.trim()]);
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171514] flex items-center gap-2.5">
            <span>Track Record Configuration</span>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved Live</span>
              </span>
            )}
          </h1>
          <p className="text-xs font-mono text-[#6F6965] mt-1">
            Manage your professional timeline: Work Experience, Entrepreneurial Ventures, Certifications & Education.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreate()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record Item</span>
        </button>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORY_OPTIONS.map((cat) => {
          const Icon = cat.icon;
          const count = items.filter((i) => i.category === cat.key).length;
          const isSelected = activeCategory === cat.key;
          return (
            <div
              key={cat.key}
              onClick={() => setActiveCategory(activeCategory === cat.key ? 'ALL' : cat.key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#9B0F06] shadow-sm ring-1 ring-[#9B0F06]'
                  : 'bg-white border-[#E8E3DD] hover:border-[#9B0F06]/40 hover:bg-[#FBF9F6]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#F7F4F0] text-[#171514]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#171514]">{cat.badge}</span>
                </div>
                <span className="text-lg font-bold font-mono text-[#9B0F06]">{count}</span>
              </div>
              <div className="text-xs font-display font-semibold text-[#171514] truncate">
                {cat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#E8E3DD] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F6965]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, role, company..."
            className="w-full pl-9 pr-4 py-2 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6965] hover:text-[#171514]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-[#171514] text-white font-semibold'
                : 'bg-[#F7F4F0] text-[#6F6965] hover:text-[#171514] border border-[#E8E3DD]'
            }`}
          >
            All ({items.length})
          </button>
          {CATEGORY_OPTIONS.map((cat) => {
            const count = items.filter((i) => i.category === cat.key).length;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#9B0F06] text-white font-semibold'
                    : 'bg-[#F7F4F0] text-[#6F6965] hover:text-[#171514] border border-[#E8E3DD]'
                }`}
              >
                <span>{cat.badge}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-[#E8E3DD] rounded-xl p-12 text-center">
            <Layers className="w-8 h-8 text-[#6F6965] mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-[#171514]">
              No track record items found
            </h3>
            <p className="text-xs font-mono text-[#6F6965] mt-1 mb-4">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first experience or credential entry.'}
            </p>
            <button
              onClick={() => handleOpenCreate()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#9B0F06] text-white rounded-lg text-xs font-mono font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record Item</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const categoryMeta = CATEGORY_OPTIONS.find((c) => c.key === item.category);
            const Icon = categoryMeta?.icon || Briefcase;
            const globalIndex = items.findIndex((i) => i.id === item.id);

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E8E3DD] rounded-xl p-5 sm:p-6 transition-all hover:border-[#9B0F06]/40 shadow-xs group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[#E8E3DD]">
                  {/* Left: Category Badge & Core Titles */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F7F4F0] border border-[#E8E3DD] rounded text-[11px] font-mono font-bold text-[#9B0F06]">
                        <Icon className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>
                      <span className="text-xs font-mono text-[#6F6965] font-medium">
                        {item.period}
                      </span>
                      {item.location && (
                        <>
                          <span className="text-[#E8E3DD]">·</span>
                          <span className="text-xs font-mono text-[#6F6965]">{item.location}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold font-display text-[#171514]">
                      {item.title}
                    </h3>

                    <div className="text-xs font-display text-[#6F6965] flex items-center gap-2">
                      <span className="font-semibold text-[#171514]">{item.role}</span>
                      {item.organization && item.organization !== item.title && (
                        <>
                          <span>·</span>
                          <span>{item.organization}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-start lg:self-center bg-[#F7F4F0] p-1 rounded-lg border border-[#E8E3DD]">
                    {/* Reorder Buttons */}
                    <button
                      onClick={() => handleMove(globalIndex, 'up')}
                      disabled={globalIndex === 0}
                      title="Move Up"
                      className="p-1.5 text-[#6F6965] hover:text-[#171514] disabled:opacity-30 disabled:hover:text-[#6F6965] rounded hover:bg-white transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(globalIndex, 'down')}
                      disabled={globalIndex === items.length - 1}
                      title="Move Down"
                      className="p-1.5 text-[#6F6965] hover:text-[#171514] disabled:opacity-30 disabled:hover:text-[#6F6965] rounded hover:bg-white transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-[#E8E3DD] mx-0.5"></div>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Item"
                      className="p-1.5 text-[#6F6965] hover:text-[#9B0F06] rounded hover:bg-white transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(item)}
                      title="Duplicate"
                      className="p-1.5 text-[#6F6965] hover:text-[#171514] rounded hover:bg-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Item"
                      className="p-1.5 text-[#6F6965] hover:text-red-600 rounded hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#171514] leading-relaxed mt-4 font-normal">
                  {item.description}
                </p>

                {/* Metrics */}
                {item.metrics && item.metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg">
                    {item.metrics.map((m, mIdx) => (
                      <div key={mIdx}>
                        <div className="font-display font-bold text-base text-[#171514]">{m.value}</div>
                        <div className="text-[10px] font-display uppercase tracking-wider text-[#6F6965]">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bullet Highlights Summary */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="text-[11px] font-mono text-[#6F6965] uppercase font-bold flex items-center gap-1">
                      <span>{item.highlights.length} Highlights / Outcomes</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-[#6F6965] space-y-1">
                      {item.highlights.slice(0, 2).map((h, hIdx) => (
                        <li key={hIdx} className="truncate">{h}</li>
                      ))}
                      {item.highlights.length > 2 && (
                        <li className="text-[#9B0F06] font-mono text-[11px] list-none">
                          +{item.highlights.length - 2} more bullet points in public card
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Footer Tags & External Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E8E3DD]/60">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags?.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 bg-[#F7F4F0] text-[#6F6965] border border-[#E8E3DD] text-[10px] font-mono rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#9B0F06] hover:underline flex items-center gap-1"
                    >
                      <span>{item.link}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal / Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E8E3DD] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E3DD] flex items-center justify-between bg-[#FAF8F5] rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold font-display text-[#171514]">
                  {editingItem ? 'Edit Track Record Item' : 'New Track Record Item'}
                </h2>
                <p className="text-xs font-mono text-[#6F6965] mt-0.5">
                  Configure work experience, entrepreneurial milestones, certifications or degrees
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-[#6F6965] hover:text-[#171514] hover:bg-[#E8E3DD]/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-lg">
                  {formError}
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-2 font-semibold">
                  Section Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formCategory === cat.key;
                    return (
                      <button
                        type="button"
                        key={cat.key}
                        onClick={() => setFormCategory(cat.key)}
                        className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                          isSelected
                            ? 'bg-[#9B0F06] text-white border-[#9B0F06] shadow-xs'
                            : 'bg-[#FBF9F6] text-[#171514] border-[#E8E3DD] hover:border-[#9B0F06]/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.badge}</span>
                        </div>
                        <span className={`text-[11px] font-display font-medium truncate ${isSelected ? 'text-white/90' : 'text-[#6F6965]'}`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                    Title / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. PT Hexacode Teknologi Indonesia / Google UX"
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                    Role / Subtitle *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Product Designer / Founder"
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                    Organization / Issuer
                  </label>
                  <input
                    type="text"
                    value={formOrganization}
                    onChange={(e) => setFormOrganization(e.target.value)}
                    placeholder="e.g. PT Hexacode / Google / AWS"
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                    Period / Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    placeholder="e.g. 2024 — Present / 2023 — 2024 / 2024"
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Jakarta, ID / Remote / Indonesia"
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                </div>

                {/* External Link */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                    External Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] mb-1.5 font-semibold">
                  Overview Summary / Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe your core responsibilities, mission, key accomplishments, or curriculum focus..."
                  className="w-full p-2.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-sans text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                />
              </div>

              {/* Bullet Highlights / Outcomes */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#171514] font-bold">
                    Bullet Highlights & Outcomes ({formHighlights.length})
                  </label>
                  <span className="text-[11px] font-mono text-[#6F6965]">
                    Limited to 5 on public card with "View More" expander
                  </span>
                </div>

                <div className="space-y-2">
                  {formHighlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06] flex-shrink-0"></span>
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => {
                          const updated = [...formHighlights];
                          updated[hIdx] = e.target.value;
                          setFormHighlights(updated);
                        }}
                        className="flex-1 p-2 bg-white border border-[#E8E3DD] rounded-md text-xs font-sans text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(hIdx)}
                        className="p-1.5 text-[#6F6965] hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Highlight Row */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight();
                      }
                    }}
                    placeholder="Type new outcome bullet point and click Add..."
                    className="flex-1 p-2 bg-white border border-[#E8E3DD] rounded-md text-xs font-sans text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="px-3 py-2 bg-[#171514] hover:bg-[#9B0F06] text-white rounded-md text-xs font-mono font-semibold uppercase transition-colors"
                  >
                    Add Point
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#171514] font-bold">
                  Key Stat Metrics (Optional)
                </label>

                {formMetrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {formMetrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-2 p-2 bg-white border border-[#E8E3DD] rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={m.value}
                            placeholder="Value (e.g. 20+)"
                            onChange={(e) => {
                              const updated = [...formMetrics];
                              updated[mIdx].value = e.target.value;
                              setFormMetrics(updated);
                            }}
                            className="p-1.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded text-xs font-mono font-bold"
                          />
                          <input
                            type="text"
                            value={m.label}
                            placeholder="Label (e.g. Enterprise Features)"
                            onChange={(e) => {
                              const updated = [...formMetrics];
                              updated[mIdx].label = e.target.value;
                              setFormMetrics(updated);
                            }}
                            className="p-1.5 bg-[#FBF9F6] border border-[#E8E3DD] rounded text-xs font-display"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMetric(mIdx)}
                          className="p-1 text-[#6F6965] hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Metric Inputs */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    placeholder="Value (e.g. +42%, 200+)"
                    className="w-full sm:w-1/3 p-2 bg-white border border-[#E8E3DD] rounded-md text-xs font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={newMetricLabel}
                    onChange={(e) => setNewMetricLabel(e.target.value)}
                    placeholder="Label (e.g. Triage Efficiency)"
                    className="w-full sm:w-1/2 p-2 bg-white border border-[#E8E3DD] rounded-md text-xs font-display"
                  />
                  <button
                    type="button"
                    onClick={addMetric}
                    className="w-full sm:w-auto px-3 py-2 bg-[#171514] hover:bg-[#9B0F06] text-white rounded-md text-xs font-mono font-semibold uppercase transition-colors whitespace-nowrap"
                  >
                    Add Stat
                  </button>
                </div>
              </div>

              {/* Tags / Domains */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#6F6965] font-semibold">
                  Tags & Competency Badges
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formTags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F7F4F0] border border-[#E8E3DD] rounded text-xs font-mono text-[#171514]"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-[#6F6965] hover:text-red-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="e.g. Enterprise SaaS, Design Systems, UX Research..."
                    className="flex-1 p-2 bg-[#FBF9F6] border border-[#E8E3DD] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-[#F7F4F0] hover:bg-[#E8E3DD] text-[#171514] border border-[#E8E3DD] rounded-lg text-xs font-mono font-semibold"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E8E3DD] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 border border-[#E8E3DD] hover:bg-[#F7F4F0] text-[#6F6965] rounded-lg text-xs font-mono font-semibold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-50 text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingItem ? 'Update Item' : 'Save Track Record'}</span>
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
