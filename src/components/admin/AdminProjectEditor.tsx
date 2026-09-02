import React, { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Type,
  AlignLeft,
  Quote,
  AlertCircle,
  Columns,
  Table as TableIcon,
  GitFork,
  Image as ImageIcon,
  Minus,
  Code,
  Check,
  Upload,
  FolderOpen,
  PlusCircle,
  X,
  FileCode,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Globe,
  FileJson,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Project, ContentBlock, ProjectCategory, ProjectStatus, BlockType } from '../../types';
import { createProject, updateProject, uploadMedia } from '../../lib/api';
import { MediaPickerModal } from './MediaPickerModal';
import { WysiwygTextarea } from './WysiwygTextarea';
import { CategorySelectDropdown } from './CategorySelectDropdown';
import { exportProjectAsJson } from '../../lib/caseStudyData';
import { exportProjectToPdf } from '../../lib/caseStudyPdf';
import { CaseStudyImportModal } from './CaseStudyImportModal';

interface AdminProjectEditorProps {
  project?: Project | null;
  onSaveSuccess: (savedProject: Project) => void;
  onCancel: () => void;
  onPreview: (slug: string) => void;
}

export const AdminProjectEditor: React.FC<AdminProjectEditorProps> = ({
  project,
  onSaveSuccess,
  onCancel,
  onPreview,
}) => {
  const isEditing = Boolean(project?.id);

  // Form State
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [shortDescription, setShortDescription] = useState(project?.short_description || '');
  const [category, setCategory] = useState<string>(project?.category || 'PRODUCT');
  const [role, setRole] = useState(project?.role || 'Lead Product Designer');
  const [organization, setOrganization] = useState(project?.organization || project?.client || 'Confidential Client');
  const [projectType, setProjectType] = useState(project?.project_type || project?.category || 'Product Design');
  const [year, setYear] = useState(project?.year || new Date().getFullYear().toString());
  const [duration, setDuration] = useState(project?.duration || '3 months');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    project?.thumbnail_url ||
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80'
  );
  const [featured, setFeatured] = useState(project?.featured || false);
  const [featuredOrder, setFeaturedOrder] = useState(project?.featured_order || 1);
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'DRAFT');
  const [tagsInput, setTagsInput] = useState(project?.tags?.join(', ') || '');
  const [deliverablesInput, setDeliverablesInput] = useState(project?.deliverables?.join(', ') || '');
  const [impactMetrics, setImpactMetrics] = useState<Array<{ label: string; value: string }>>(
    project?.impact_metrics || [{ label: 'Triage Time', value: '-85%' }]
  );

  // SEO State
  const [seoTitle, setSeoTitle] = useState(project?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(project?.seo_description || '');
  const [ogImage, setOgImage] = useState(project?.og_image || '');

  // Structured Blocks
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    project?.content_json || [
      { id: 'b-1', type: 'heading', level: 1, text: 'Project Overview & Challenge' },
      {
        id: 'b-2',
        type: 'paragraph',
        text: 'Describe the primary enterprise or product problem here...',
      },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export / Import & Feedback State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Media Picker Modal State
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    { type: 'thumbnail' } | { type: 'block'; blockIndex: number } | { type: 'ogImage' }
  >({ type: 'thumbnail' });

  // Helper to package current editor state as a complete Project object
  const getCurrentProjectObject = (): Project => {
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const deliverablesArray = deliverablesInput
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const computedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      id: project?.id || `proj-${Date.now()}`,
      title: title || 'Untitled Case Study',
      slug: computedSlug,
      short_description: shortDescription,
      category: category.trim() || 'PRODUCT',
      project_type: projectType.trim() || category.trim() || 'Product Design',
      role,
      organization: organization.trim() || 'Confidential Client',
      client: organization.trim() || 'Confidential Client',
      year,
      duration,
      thumbnail_url: thumbnailUrl,
      featured,
      featured_order: Number(featuredOrder) || 1,
      status: status || 'DRAFT',
      tags: tagsArray,
      deliverables: deliverablesArray,
      impact_metrics: impactMetrics.filter((m) => m.label && m.value),
      seo_title: seoTitle || `${title} — Aththar Product Design`,
      seo_description: seoDescription || shortDescription,
      og_image: ogImage || thumbnailUrl,
      content_json: blocks,
      created_at: project?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleExportJson = () => {
    const currentProj = getCurrentProjectObject();
    exportProjectAsJson(currentProj);
    showToast(`Exported "${currentProj.title}" as JSON`);
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const currentProj = getCurrentProjectObject();
      await exportProjectToPdf(currentProj);
      showToast(`Generated PDF for "${currentProj.title}"`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('Failed to generate PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleLoadImportedProject = (importedData: Partial<Project>) => {
    if (importedData.title) setTitle(importedData.title);
    if (importedData.slug) setSlug(importedData.slug);
    if (importedData.short_description) setShortDescription(importedData.short_description);
    if (importedData.category) setCategory(importedData.category);
    if (importedData.project_type) setProjectType(importedData.project_type);
    if (importedData.role) setRole(importedData.role);
    if (importedData.organization || importedData.client) {
      setOrganization(importedData.organization || importedData.client || '');
    }
    if (importedData.year) setYear(importedData.year);
    if (importedData.duration) setDuration(importedData.duration);
    if (importedData.thumbnail_url) setThumbnailUrl(importedData.thumbnail_url);
    if (typeof importedData.featured === 'boolean') setFeatured(importedData.featured);
    if (importedData.featured_order) setFeaturedOrder(importedData.featured_order);
    if (importedData.status) setStatus(importedData.status as ProjectStatus);
    if (importedData.tags) setTagsInput(importedData.tags.join(', '));
    if (importedData.deliverables) setDeliverablesInput(importedData.deliverables.join(', '));
    if (importedData.impact_metrics) setImpactMetrics(importedData.impact_metrics);
    if (importedData.seo_title) setSeoTitle(importedData.seo_title);
    if (importedData.seo_description) setSeoDescription(importedData.seo_description);
    if (importedData.og_image) setOgImage(importedData.og_image);
    if (importedData.content_json && Array.isArray(importedData.content_json)) {
      setBlocks(importedData.content_json);
    }

    showToast(`Imported "${importedData.title}" into editor`);
  };

  // Auto-generate slug from title if empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Block Helpers
  const addBlock = (type: BlockType) => {
    const newId = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let newBlock: ContentBlock = { id: newId, type };

    switch (type) {
      case 'heading':
        newBlock = { ...newBlock, level: 2, text: 'New Section Heading' };
        break;
      case 'paragraph':
        newBlock = { ...newBlock, text: 'Add descriptive narrative here...' };
        break;
      case 'quote':
        newBlock = {
          ...newBlock,
          text: 'The first solution was intuitive, but flawed in practice.',
          author: 'Aththar',
          role: 'Product Designer',
        };
        break;
      case 'callout':
        newBlock = {
          ...newBlock,
          calloutType: 'insight',
          title: 'Core Insight',
          text: 'Key decision or user research takeaway.',
        };
        break;
      case 'columns':
        newBlock = {
          ...newBlock,
          leftTitle: 'Traditional Flow',
          leftText: 'Manual review bottleneck and high cognitive load.',
          rightTitle: 'Optimized Flow',
          rightText: 'AI-assisted inline reasoning with immediate telemetry.',
        };
        break;
      case 'table':
        newBlock = {
          ...newBlock,
          caption: 'Performance & Architecture Matrix',
          headers: ['Metric / Area', 'Legacy Architecture', 'Warm Precision Solution'],
          rows: [
            ['Triage Speed', '48 Hours (Manual)', '2.4 Hours (Automated)'],
            ['Task Completion Rate', '64%', '94.8%'],
            ['User Satisfaction (CSAT)', '3.2 / 5.0', '4.9 / 5.0'],
          ],
        };
        break;
      case 'userFlow':
        newBlock = {
          ...newBlock,
          flowSteps: [
            { step: '01', title: 'Problem Discovery', description: 'Auditing existing bottlenecks & cognitive friction.' },
            { step: '02', title: 'Tactile Prototyping', description: 'Iterative field testing with end operators.' },
            { step: '03', title: 'System Deployment', description: 'Production rollout with telemetry & sensory feedback.' },
          ],
        };
        break;
      case 'image':
        newBlock = {
          ...newBlock,
          url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
          alt: 'System interface screenshot',
          caption: 'Figure 1.0 — Telemetry & Interaction Overview',
        };
        break;
      case 'divider':
        break;
      case 'code':
        newBlock = {
          ...newBlock,
          language: 'typescript',
          code: '// Example interaction physics\nconst springConfig = { stiffness: 300, damping: 20 };',
        };
        break;
      case 'link':
        newBlock = {
          ...newBlock,
          linkText: 'Explore Interactive Figma Prototype',
          linkUrl: 'https://figma.com/@aththar',
          linkStyle: 'card',
          linkDescription: 'Interactive design tokens, component architecture, and high-fidelity prototype flows.',
          linkNewTab: true,
        };
        break;
    }

    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedFields: Partial<ContentBlock>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], ...updatedFields };
    setBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBlocks(updated);
  };

  const duplicateBlock = (index: number) => {
    const targetBlock = blocks[index];
    if (!targetBlock) return;
    const cloned: ContentBlock = JSON.parse(JSON.stringify(targetBlock));
    cloned.id = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const updated = [...blocks];
    updated.splice(index + 1, 0, cloned);
    setBlocks(updated);
  };

  // --- Table Specific Helpers ---
  const handleAddTableColumn = (blockIndex: number) => {
    const block = blocks[blockIndex];
    const currentHeaders = block.headers || ['Column 1', 'Column 2'];
    const currentRows = block.rows || [['Value 1', 'Value 2']];

    const newHeaders = [...currentHeaders, `Column ${currentHeaders.length + 1}`];
    const newRows = currentRows.map((r) => [...r, 'New Cell']);

    updateBlock(blockIndex, { headers: newHeaders, rows: newRows });
  };

  const handleRemoveTableColumn = (blockIndex: number, colIndex: number) => {
    const block = blocks[blockIndex];
    if (!block.headers || block.headers.length <= 1) return;

    const newHeaders = block.headers.filter((_, i) => i !== colIndex);
    const newRows = (block.rows || []).map((r) => r.filter((_, i) => i !== colIndex));

    updateBlock(blockIndex, { headers: newHeaders, rows: newRows });
  };

  const handleUpdateTableHeader = (blockIndex: number, colIndex: number, val: string) => {
    const block = blocks[blockIndex];
    const headers = [...(block.headers || [])];
    headers[colIndex] = val;
    updateBlock(blockIndex, { headers });
  };

  const handleAddTableRow = (blockIndex: number) => {
    const block = blocks[blockIndex];
    const colCount = block.headers?.length || 2;
    const newRow = Array(colCount).fill('New Value');
    const currentRows = block.rows || [];
    updateBlock(blockIndex, { rows: [...currentRows, newRow] });
  };

  const handleRemoveTableRow = (blockIndex: number, rowIndex: number) => {
    const block = blocks[blockIndex];
    if (!block.rows || block.rows.length <= 1) return;
    const newRows = block.rows.filter((_, i) => i !== rowIndex);
    updateBlock(blockIndex, { rows: newRows });
  };

  const handleUpdateTableCell = (blockIndex: number, rowIndex: number, colIndex: number, val: string) => {
    const block = blocks[blockIndex];
    const rows = (block.rows || []).map((r) => [...r]);
    if (!rows[rowIndex]) rows[rowIndex] = [];
    rows[rowIndex][colIndex] = val;
    updateBlock(blockIndex, { rows });
  };

  // --- User Flow Specific Helpers ---
  const handleAddFlowStep = (blockIndex: number) => {
    const block = blocks[blockIndex];
    const steps = block.flowSteps || [];
    const nextNum = (steps.length + 1).toString().padStart(2, '0');
    const newStep = {
      step: nextNum,
      title: `Step ${nextNum} Title`,
      description: 'Step explanation and outcome details...',
    };
    updateBlock(blockIndex, { flowSteps: [...steps, newStep] });
  };

  const handleRemoveFlowStep = (blockIndex: number, stepIndex: number) => {
    const block = blocks[blockIndex];
    if (!block.flowSteps) return;
    const newSteps = block.flowSteps.filter((_, i) => i !== stepIndex);
    updateBlock(blockIndex, { flowSteps: newSteps });
  };

  const handleUpdateFlowStep = (
    blockIndex: number,
    stepIndex: number,
    field: 'step' | 'title' | 'description',
    val: string
  ) => {
    const block = blocks[blockIndex];
    const steps = [...(block.flowSteps || [])];
    if (!steps[stepIndex]) return;
    steps[stepIndex] = { ...steps[stepIndex], [field]: val };
    updateBlock(blockIndex, { flowSteps: steps });
  };

  // --- Image Direct Upload Helper ---
  const handleDirectImageBlockUpload = async (blockIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const savedMedia = await uploadMedia({
          url: dataUrl,
          type: 'image',
          alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: 'Uploaded Visual Asset',
          width: 1400,
          height: 900,
          size_kb: Math.round(dataUrl.length / 1024),
        });

        updateBlock(blockIndex, {
          url: savedMedia.url,
          alt: savedMedia.alt_text,
          caption: savedMedia.caption || '',
        });
      } catch (err: any) {
        alert(err.message || 'Failed to upload asset');
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Media Picker Modal Handler
  const openMediaPicker = (target: { type: 'thumbnail' } | { type: 'block'; blockIndex: number } | { type: 'ogImage' }) => {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  };

  const handleMediaPickerSelect = (item: { url: string; alt_text?: string; caption?: string }) => {
    if (mediaPickerTarget.type === 'thumbnail') {
      setThumbnailUrl(item.url);
    } else if (mediaPickerTarget.type === 'ogImage') {
      setOgImage(item.url);
    } else if (mediaPickerTarget.type === 'block') {
      updateBlock(mediaPickerTarget.blockIndex, {
        url: item.url,
        alt: item.alt_text || 'Case study visual',
        caption: item.caption || '',
      });
    }
  };

  // Metric Helpers
  const addMetric = () => {
    setImpactMetrics([...impactMetrics, { label: 'New Metric', value: '100%' }]);
  };

  const updateMetric = (idx: number, field: 'label' | 'value', val: string) => {
    const updated = [...impactMetrics];
    updated[idx][field] = val;
    setImpactMetrics(updated);
  };

  const removeMetric = (idx: number) => {
    setImpactMetrics(impactMetrics.filter((_, i) => i !== idx));
  };

  // Save Submission
  const handleSave = async (publishImmediate = false) => {
    if (!title) {
      setError('Project title is required');
      return;
    }

    setSaving(true);
    setError(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const deliverablesArray = deliverablesInput
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const targetStatus: ProjectStatus = publishImmediate ? 'PUBLISHED' : status;

    const payload: Partial<Project> = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: shortDescription,
      category: category.trim() || 'PRODUCT',
      project_type: projectType.trim() || category.trim() || 'Product Design',
      role,
      organization: organization.trim() || 'Confidential Client',
      client: organization.trim() || 'Confidential Client',
      year,
      duration,
      thumbnail_url: thumbnailUrl,
      featured,
      featured_order: Number(featuredOrder) || 1,
      status: targetStatus,
      tags: tagsArray,
      deliverables: deliverablesArray,
      impact_metrics: impactMetrics.filter((m) => m.label && m.value),
      seo_title: seoTitle || `${title} — Aththar Product Design`,
      seo_description: seoDescription || shortDescription,
      og_image: ogImage || thumbnailUrl,
      content_json: blocks,
    };

    try {
      let result: Project;
      if (isEditing && project?.id) {
        result = await updateProject(project.id, payload);
      } else {
        result = await createProject(payload);
      }
      onSaveSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  // Preview with Auto-Save as Draft (Requirement 2)
  const handlePreviewWithAutoSave = async () => {
    if (!title) {
      setError('Please provide a project title before previewing');
      return;
    }

    setSaving(true);
    setError(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const deliverablesArray = deliverablesInput
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const computedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const payload: Partial<Project> = {
      title,
      slug: computedSlug,
      short_description: shortDescription,
      category: category.trim() || 'PRODUCT',
      project_type: projectType.trim() || category.trim() || 'Product Design',
      role,
      organization: organization.trim() || 'Confidential Client',
      client: organization.trim() || 'Confidential Client',
      year,
      duration,
      thumbnail_url: thumbnailUrl,
      featured,
      featured_order: Number(featuredOrder) || 1,
      status: status || 'DRAFT',
      tags: tagsArray,
      deliverables: deliverablesArray,
      impact_metrics: impactMetrics.filter((m) => m.label && m.value),
      seo_title: seoTitle || `${title} — Aththar Product Design`,
      seo_description: seoDescription || shortDescription,
      og_image: ogImage || thumbnailUrl,
      content_json: blocks,
    };

    try {
      let result: Project;
      if (isEditing && project?.id) {
        result = await updateProject(project.id, payload);
      } else {
        result = await createProject(payload);
      }
      onPreview(result.slug);
    } catch (err: any) {
      setError(err.message || 'Failed to auto-save draft for preview');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3DD]">
        <div className="flex items-center gap-3">
          {/* <button
            onClick={onCancel}
            className="p-2 text-[#6F6965] hover:text-[#171514] hover:bg-white rounded-lg transition-colors border border-[#E8E3DD]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button> */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-[#171514]">
              {isEditing ? `Edit: ${project?.title}` : 'Create New Case Study'}
            </h1>
            <p className="text-xs font-display text-[#6F6965]">
              Configure project metadata and structured editorial case study blocks
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Data Portability: Export JSON */}
          {/* <button
            type="button"
            onClick={handleExportJson}
            title="Export raw project data as JSON"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E3DD] hover:border-[#9B0F06] hover:bg-[#F7F4F0] text-[#171514] text-xs font-display uppercase tracking-wider rounded-lg transition-colors font-medium shadow-2xs cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-[#6F6965]" />
            <span>Export JSON</span>
          </button> */}

          {/* Data Portability: Export PDF */}
          {/* <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            title="Generate and download formatted PDF case study"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E3DD] hover:border-[#9B0F06] hover:bg-[#F7F4F0] text-[#171514] text-xs font-display uppercase tracking-wider rounded-lg transition-colors font-medium shadow-2xs cursor-pointer disabled:opacity-40"
          >
            {exportingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#9B0F06]" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#6F6965]" />
                <span>Export PDF</span>
              </>
            )}
          </button> */}

          {/* Data Portability: Import JSON */}
          {/* <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            title="Import or replace with structured JSON case study"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E3DD] hover:border-[#9B0F06] hover:bg-[#F7F4F0] text-[#171514] text-xs font-display uppercase tracking-wider rounded-lg transition-colors font-medium shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#9B0F06]" />
            <span>Import JSON</span>
          </button>

          <div className="h-5 w-[1px] bg-[#E8E3DD] mx-0.5 hidden sm:block" /> */}

          {/* Preview Button */}
          <button
            type="button"
            onClick={handlePreviewWithAutoSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8E3DD] hover:bg-[#F7F4F0] text-[#171514] text-xs font-display uppercase tracking-wider rounded-lg transition-colors font-medium shadow-xs cursor-pointer"
            title="Auto-saves as draft and opens preview mode"
          >
            <Eye className="w-3.5 h-3.5 text-[#9B0F06]" />
            <span>{saving ? 'Auto-saving...' : 'Preview'}</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E8E3DD] hover:border-[#9B0F06] text-[#171514] text-xs font-display uppercase tracking-wider rounded-lg transition-colors font-medium shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#9B0F06]" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#9B0F06] hover:bg-[#7E0C05] text-white text-xs font-display font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-display rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Left Meta (5 cols), Right Content Blocks (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metadata Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-4 shadow-xs">
            <h2 className="font-display font-bold text-sm text-[#171514] pb-2 border-b border-[#E8E3DD]">
              Project Essentials
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Mambu Radar"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] focus:ring-2 focus:ring-[#9B0F06]"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                URL Slug (/work/[slug])
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. mambu-radar"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] focus:ring-2 focus:ring-[#9B0F06]"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                Short Description
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="High-level problem and outcome summary..."
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] focus:ring-2 focus:ring-[#9B0F06]"
              />
            </div>

            {/* Category (Card Top-Left Badge) & Status */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category (Editable Dropdown) */}
                <div>
                  <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                    Category
                  </label>
                  <CategorySelectDropdown
                    value={category}
                    onChange={(newCat) => setCategory(newCat)}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role & Organization (Case Study Essentials) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Product Designer"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
                />
              </div>
              <div>
                <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Environmental Tech Initiative"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
                />
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                Project Type (Case Study Essentials)
              </label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="e.g. Civic & Sensory Telemetry, Enterprise SaaS & AI Core"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
              />
            </div>

            {/* Year & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
                />
              </div>
              <div>
                <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
                />
              </div>
            </div>

            {/* Thumbnail URL with Media Picker Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-display uppercase text-[#171514] font-semibold">
                  Thumbnail Image
                </label>
                <button
                  type="button"
                  onClick={() => openMediaPicker({ type: 'thumbnail' })}
                  className="inline-flex items-center gap-1 text-[11px] font-display font-semibold text-[#9B0F06] hover:underline"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>Choose from Media Assets</span>
                </button>
              </div>

              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
              />

              {thumbnailUrl && (
                <div className="rounded overflow-hidden border border-[#E8E3DD] aspect-video relative group">
                  <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => openMediaPicker({ type: 'thumbnail' })}
                    className="absolute inset-0 bg-[#171514]/60 text-white text-xs font-display uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Change Cover Asset</span>
                  </button>
                </div>
              )}
            </div>

            {/* Featured Toggle */}
            <div className="p-3 bg-[#F7F4F0] rounded-lg border border-[#E8E3DD] flex items-center justify-between">
              <div>
                <div className="font-display text-xs font-bold text-[#171514]">
                  Feature on Homepage
                </div>
                <div className="text-[11px] font-display text-[#6F6965]">
                  Shown in 01 / Selected Work showcase
                </div>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#9B0F06]"
              />
            </div>

            {featured && (
              <div>
                <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                  Featured Order (1, 2, or 3)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={featuredOrder}
                  onChange={(e) => setFeaturedOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
                />
              </div>
            )}

            {/* Deliverables (Case Study Essentials) */}
            <div>
              <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                Deliverables (comma-separated)
              </label>
              <input
                type="text"
                value={deliverablesInput}
                onChange={(e) => setDeliverablesInput(e.target.value)}
                placeholder="Olfactory Taxonomy, 2-Tap Mobile Web, Tokenized UI Kit, Live Telemetry Canvas"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
              />
              <span className="text-[11px] font-display text-[#6F6965] mt-1 block">
                Rendered in the full Case Study essentials overview bar.
              </span>
            </div>

            {/* Tags (Project Cards Display) */}
            <div>
              <label className="block text-xs font-display uppercase text-[#171514] font-semibold mb-1">
                Card Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Enterprise SaaS, AI Workflows, Design System"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514]"
              />
              <span className="text-[11px] font-display text-[#6F6965] mt-1 block">
                Shown on project cards. In accordance with card guidelines, maximum 2 tags are displayed on cards with automatic truncation.
              </span>
            </div>
          </div>

          {/* Impact Metrics Manager */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E3DD]">
              <h2 className="font-display font-bold text-sm text-[#171514]">
                Key Impact Metrics
              </h2>
              <button
                type="button"
                onClick={addMetric}
                className="text-[11px] font-display font-semibold text-[#9B0F06] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Metric</span>
              </button>
            </div>

            <div className="space-y-2">
              {impactMetrics.map((metric, mIdx) => (
                <div key={mIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Value (e.g. 42%)"
                    value={metric.value}
                    onChange={(e) => updateMetric(mIdx, 'value', e.target.value)}
                    className="w-1/3 px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#9B0F06]"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Faster Triage)"
                    value={metric.label}
                    onChange={(e) => updateMetric(mIdx, 'label', e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetric(mIdx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Block Builder */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E8E3DD] space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E3DD] gap-2">
              <div>
                <h2 className="font-display font-bold text-base text-[#171514]">
                  Case Study Content Blocks
                </h2>
                <p className="text-xs font-display text-[#6F6965]">
                  Construct editorial paragraphs, quotes, tables, user flows, images, and callouts
                </p>
              </div>

              {/* Block Count */}
              <span className="font-display font-bold text-xs text-[#9B0F06] bg-[#FDF2F1] px-2.5 py-1 rounded border border-[#9B0F06]/20">
                {blocks.length} Blocks
              </span>
            </div>

            {/* Block Toolbar */}
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E3DD] flex flex-wrap items-center gap-1.5">
              <span className="font-display text-[11px] uppercase tracking-wider text-[#6F6965] font-semibold mr-1">
                Insert:
              </span>
              <button
                type="button"
                onClick={() => addBlock('heading')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Heading</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('paragraph')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <AlignLeft className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Paragraph</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('image')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('table')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <TableIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('userFlow')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <GitFork className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>User Flow</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('callout')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Callout</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('quote')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <Quote className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Quote</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('columns')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <Columns className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>2-Columns</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('code')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Code</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('link')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors shadow-2xs"
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Link / CTA</span>
              </button>
              <button
                type="button"
                onClick={() => addBlock('divider')}
                className="px-2.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded-md text-xs font-display text-[#171514] font-medium flex items-center gap-1 transition-colors"
              >
                <Minus className="w-3.5 h-3.5 text-[#9B0F06]" />
                <span>Divider</span>
              </button>
            </div>

            {/* Blocks List */}
            <div className="space-y-5">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="p-5 bg-[#FAF8F5] rounded-xl border border-[#E8E3DD] space-y-3 relative group"
                >
                  {/* Block Header */}
                  <div className="flex items-center justify-between text-xs font-display text-[#6F6965] pb-2 border-b border-[#E8E3DD]">
                    <span className="font-bold text-[#171514] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-[#9B0F06]">#{index + 1}</span>
                      <span>·</span>
                      <span>{block.type}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 hover:text-[#171514] disabled:opacity-30 transition-colors"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 'down')}
                        disabled={index === blocks.length - 1}
                        title="Move Down"
                        className="p-1 hover:text-[#171514] disabled:opacity-30 transition-colors"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBlock(index)}
                        title="Duplicate Block"
                        className="p-1 text-[#6F6965] hover:text-[#9B0F06] transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        title="Delete Block"
                        className="p-1 text-red-500 hover:text-red-700 ml-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Heading Block */}
                  {block.type === 'heading' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={block.level || 2}
                          onChange={(e) =>
                            updateBlock(index, { level: Number(e.target.value) as 1 | 2 | 3 })
                          }
                          className="px-2 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display"
                        >
                          <option value="1">H1 (Major Section)</option>
                          <option value="2">H2 (Subsection)</option>
                          <option value="3">H3 (Minor Subsection)</option>
                        </select>
                        <input
                          type="text"
                          value={block.text || ''}
                          onChange={(e) => updateBlock(index, { text: e.target.value })}
                          placeholder="Section heading title..."
                          className="flex-1 px-3 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#171514]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Paragraph Block */}
                  {block.type === 'paragraph' && (
                    <WysiwygTextarea
                      value={block.text || ''}
                      onChange={(val) => updateBlock(index, { text: val })}
                      placeholder="Write your case study narrative here... Use the Link and formatting tools above for rich inline formatting."
                      rows={4}
                    />
                  )}

                  {/* Quote Block */}
                  {block.type === 'quote' && (
                    <div className="space-y-2">
                      <WysiwygTextarea
                        value={block.text || ''}
                        onChange={(val) => updateBlock(index, { text: val })}
                        placeholder="Quote text..."
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Author Name"
                          value={block.author || ''}
                          onChange={(e) => updateBlock(index, { author: e.target.value })}
                          className="px-2 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display"
                        />
                        <input
                          type="text"
                          placeholder="Author Role / Title"
                          value={block.role || ''}
                          onChange={(e) => updateBlock(index, { role: e.target.value })}
                          className="px-2 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display"
                        />
                      </div>
                    </div>
                  )}

                  {/* Callout Block */}
                  {block.type === 'callout' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={block.calloutType || 'insight'}
                          onChange={(e) =>
                            updateBlock(index, { calloutType: e.target.value as any })
                          }
                          className="px-2 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display uppercase font-semibold"
                        >
                          <option value="insight">Insight</option>
                          <option value="decision">Design Decision</option>
                          <option value="highlight">Highlight</option>
                          <option value="outcome">Outcome</option>
                          <option value="warning">Warning / Constraint</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Callout Title"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(index, { title: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#171514]"
                        />
                      </div>
                      <WysiwygTextarea
                        value={block.text || ''}
                        onChange={(val) => updateBlock(index, { text: val })}
                        placeholder="Callout narrative..."
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Columns Block */}
                  {block.type === 'columns' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5 p-3 bg-white border border-[#E8E3DD] rounded-lg">
                        <label className="block text-[10px] font-display uppercase font-bold text-[#9B0F06]">
                          Left Column
                        </label>
                        <input
                          type="text"
                          placeholder="Left Column Title"
                          value={block.leftTitle || ''}
                          onChange={(e) => updateBlock(index, { leftTitle: e.target.value })}
                          className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display font-bold"
                        />
                        <WysiwygTextarea
                          value={block.leftText || ''}
                          onChange={(val) => updateBlock(index, { leftText: val })}
                          placeholder="Left column description..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1.5 p-3 bg-white border border-[#E8E3DD] rounded-lg">
                        <label className="block text-[10px] font-display uppercase font-bold text-[#171514]">
                          Right Column
                        </label>
                        <input
                          type="text"
                          placeholder="Right Column Title"
                          value={block.rightTitle || ''}
                          onChange={(e) => updateBlock(index, { rightTitle: e.target.value })}
                          className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display font-bold"
                        />
                        <WysiwygTextarea
                          value={block.rightText || ''}
                          onChange={(val) => updateBlock(index, { rightText: val })}
                          placeholder="Right column description..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Enhanced Image Block with Direct Upload & Asset Picker */}
                  {block.type === 'image' && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E8E3DD]">
                      {/* Image Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8E3DD]">
                        <div className="font-display font-semibold text-xs text-[#171514] flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
                          <span>Image Block Asset</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* File input */}
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded text-xs font-display font-semibold text-[#171514] transition-colors">
                            <Upload className="w-3 h-3 text-[#9B0F06]" />
                            <span>Upload Local File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDirectImageBlockUpload(index, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Media Assets Selector Button */}
                          <button
                            type="button"
                            onClick={() => openMediaPicker({ type: 'block', blockIndex: index })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#9B0F06]/10 hover:bg-[#9B0F06]/20 border border-[#9B0F06]/30 text-[#9B0F06] rounded text-xs font-display font-semibold transition-colors"
                          >
                            <FolderOpen className="w-3 h-3" />
                            <span>Choose from Media Assets</span>
                          </button>
                        </div>
                      </div>

                      {/* URL input fallback */}
                      <div>
                        <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                          Asset URL / CDN Link
                        </label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={block.url || ''}
                          onChange={(e) => updateBlock(index, { url: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display text-[#171514]"
                        />
                      </div>

                      {/* Image Preview */}
                      {block.url && (
                        <div className="relative rounded-lg overflow-hidden border border-[#E8E3DD] bg-[#FAF8F5] max-h-48 flex items-center justify-center">
                          <img
                            src={block.url}
                            alt={block.alt || 'Preview'}
                            className="max-h-48 w-full object-contain"
                          />
                        </div>
                      )}

                      {/* Alt & Caption */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                            Alt Text (Accessibility)
                          </label>
                          <input
                            type="text"
                            placeholder="Descriptive alt text..."
                            value={block.alt || ''}
                            onChange={(e) => updateBlock(index, { alt: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                            Caption (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Figure caption..."
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(index, { caption: e.target.value })}
                            className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fully Configurable Table Block */}
                  {block.type === 'table' && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E8E3DD]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E3DD]">
                        <div className="font-display font-semibold text-xs text-[#171514] flex items-center gap-1.5">
                          <TableIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
                          <span>Table Block Configuration</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddTableColumn(index)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded text-[11px] font-display font-semibold transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#9B0F06]" />
                            <span>Add Column</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddTableRow(index)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded text-[11px] font-display font-semibold transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#9B0F06]" />
                            <span>Add Row</span>
                          </button>
                        </div>
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                          Table Caption / Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sensory Benchmark Matrix"
                          value={block.caption || ''}
                          onChange={(e) => updateBlock(index, { caption: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#171514]"
                        />
                      </div>

                      {/* Table Structure Editor */}
                      <div className="overflow-x-auto border border-[#E8E3DD] rounded-lg">
                        <table className="w-full text-left border-collapse text-xs">
                          {/* Column Headers */}
                          <thead>
                            <tr className="bg-[#FAF8F5] border-b border-[#E8E3DD]">
                              <th className="p-2 w-10 text-[10px] font-display uppercase text-[#6F6965] text-center">
                                #
                              </th>
                              {(block.headers || ['Column 1', 'Column 2']).map((header, colIdx) => (
                                <th key={colIdx} className="p-2">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={header}
                                      onChange={(e) => handleUpdateTableHeader(index, colIdx, e.target.value)}
                                      placeholder={`Column ${colIdx + 1}`}
                                      className="w-full px-2 py-1 bg-white border border-[#E8E3DD] rounded font-display font-bold text-xs text-[#171514]"
                                    />
                                    {(block.headers?.length || 0) > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTableColumn(index, colIdx)}
                                        title="Delete column"
                                        className="p-1 text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="p-2 w-10"></th>
                            </tr>
                          </thead>

                          {/* Table Body Rows */}
                          <tbody className="divide-y divide-[#E8E3DD] bg-white">
                            {(block.rows || [['Value 1', 'Value 2']]).map((row, rowIdx) => (
                              <tr key={rowIdx}>
                                <td className="p-2 text-center text-[10px] font-display text-[#6F6965]">
                                  {rowIdx + 1}
                                </td>
                                {row.map((cell, colIdx) => (
                                  <td key={colIdx} className="p-2">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) =>
                                        handleUpdateTableCell(index, rowIdx, colIdx, e.target.value)
                                      }
                                      placeholder="Cell content..."
                                      className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#E8E3DD] rounded font-display text-xs"
                                    />
                                  </td>
                                ))}
                                <td className="p-2 text-center">
                                  {(block.rows?.length || 0) > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTableRow(index, rowIdx)}
                                      title="Delete row"
                                      className="p-1 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Fully Configurable User Flow Block */}
                  {block.type === 'userFlow' && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E8E3DD]">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E3DD]">
                        <div className="font-display font-semibold text-xs text-[#171514] flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-[#9B0F06]" />
                          <span>User Flow Journey Steps</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddFlowStep(index)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded text-xs font-display font-semibold transition-colors"
                        >
                          <Plus className="w-3 h-3 text-[#9B0F06]" />
                          <span>Add Step</span>
                        </button>
                      </div>

                      {/* Steps List */}
                      <div className="space-y-3">
                        {(block.flowSteps || []).map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E3DD] space-y-2 relative"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  placeholder="01"
                                  value={step.step}
                                  onChange={(e) =>
                                    handleUpdateFlowStep(index, sIdx, 'step', e.target.value)
                                  }
                                  className="w-14 px-2 py-1 bg-white border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#9B0F06] text-center"
                                />
                                <input
                                  type="text"
                                  placeholder="Step Title (e.g. Discovery)"
                                  value={step.title}
                                  onChange={(e) =>
                                    handleUpdateFlowStep(index, sIdx, 'title', e.target.value)
                                  }
                                  className="flex-1 px-2.5 py-1 bg-white border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#171514]"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveFlowStep(index, sIdx)}
                                title="Delete Step"
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <textarea
                              rows={2}
                              placeholder="Step description & user action..."
                              value={step.description}
                              onChange={(e) =>
                                handleUpdateFlowStep(index, sIdx, 'description', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display"
                            />
                          </div>
                        ))}

                        {(!block.flowSteps || block.flowSteps.length === 0) && (
                          <p className="text-xs font-display text-[#6F6965] text-center py-4">
                            No flow steps yet. Click "Add Step" above.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Code Snippet Block */}
                  {block.type === 'code' && (
                    <div className="space-y-2 bg-white p-4 rounded-xl border border-[#E8E3DD]">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-semibold text-xs text-[#171514]">
                          Code Block Configuration
                        </span>
                        <select
                          value={block.language || 'typescript'}
                          onChange={(e) => updateBlock(index, { language: e.target.value })}
                          className="px-2 py-1 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display"
                        >
                          <option value="typescript">TypeScript</option>
                          <option value="javascript">JavaScript</option>
                          <option value="css">CSS</option>
                          <option value="html">HTML</option>
                          <option value="json">JSON</option>
                          <option value="bash">Bash / Shell</option>
                        </select>
                      </div>
                      <textarea
                        rows={4}
                        value={block.code || ''}
                        onChange={(e) => updateBlock(index, { code: e.target.value })}
                        placeholder="// Enter code snippet here..."
                        className="w-full px-3 py-2 bg-[#171514] text-white rounded text-xs font-mono"
                      />
                    </div>
                  )}

                  {/* Link / CTA Block */}
                  {block.type === 'link' && (
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E8E3DD]">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E3DD]">
                        <div className="font-display font-semibold text-xs text-[#171514] flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
                          <span>Link & Action Card Configuration</span>
                        </div>
                        <span className="text-[10px] font-display uppercase tracking-wider text-[#6F6965] font-bold">
                          Interactive Block
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Link Text */}
                        <div>
                          <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                            Link / Button Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. View Live Figma Prototype"
                            value={block.linkText || ''}
                            onChange={(e) => updateBlock(index, { linkText: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display font-bold text-[#171514]"
                          />
                        </div>

                        {/* Link URL */}
                        <div>
                          <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                            Destination URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={block.linkUrl || ''}
                            onChange={(e) => updateBlock(index, { linkUrl: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display text-[#171514]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Presentation Style */}
                        <div>
                          <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                            Visual Style
                          </label>
                          <select
                            value={block.linkStyle || 'card'}
                            onChange={(e) =>
                              updateBlock(index, {
                                linkStyle: e.target.value as 'card' | 'primary' | 'secondary' | 'ghost',
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display text-[#171514]"
                          >
                            <option value="card">Rich Resource Card (Domain, Icon & Arrow)</option>
                            <option value="primary">Primary Brand Button (High-Contrast Red)</option>
                            <option value="secondary">Secondary Outline Button (Warm Cream)</option>
                            <option value="ghost">Ghost Inline Link (Underline & Arrow)</option>
                          </select>
                        </div>

                        {/* Target New Tab */}
                        <div className="flex items-center gap-2 pt-4 sm:pt-5">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-display text-[#171514]">
                            <input
                              type="checkbox"
                              checked={block.linkNewTab !== false}
                              onChange={(e) => updateBlock(index, { linkNewTab: e.target.checked })}
                              className="rounded border-[#E8E3DD] text-[#9B0F06] focus:ring-[#9B0F06]"
                            />
                            <span>Open in new tab (`target="_blank"`)</span>
                          </label>
                        </div>
                      </div>

                      {/* Link Description / Subtitle */}
                      <div>
                        <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                          Subtitle / Description (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Includes full design system token architecture and responsive specs."
                          value={block.linkDescription || ''}
                          onChange={(e) => updateBlock(index, { linkDescription: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display text-[#171514]"
                        />
                      </div>

                      {/* Live In-Editor Preview */}
                      <div className="pt-2 border-t border-[#E8E3DD] space-y-1.5">
                        <span className="text-[10px] font-display uppercase font-bold text-[#6F6965]">
                          Public Render Preview:
                        </span>
                        <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E3DD]">
                          {(!block.linkStyle || block.linkStyle === 'card') && (
                            <div className="p-4 bg-white border border-[#E8E3DD] rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="p-1 rounded bg-[#9B0F06]/10 text-[#9B0F06]">
                                    <LinkIcon className="w-3 h-3" />
                                  </span>
                                  <span className="font-display font-bold text-xs text-[#171514] truncate">
                                    {block.linkText || 'Open Resource'}
                                  </span>
                                </div>
                                {block.linkDescription && (
                                  <p className="text-[11px] text-[#6F6965] font-light truncate">
                                    {block.linkDescription}
                                  </p>
                                )}
                                {block.linkUrl && (
                                  <span className="text-[10px] font-mono text-[#9B0F06]">
                                    {block.linkUrl}
                                  </span>
                                )}
                              </div>
                              <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E8E3DD] flex items-center justify-center text-[#171514]">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          )}

                          {block.linkStyle === 'primary' && (
                            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B0F06] text-white rounded-lg text-xs font-display font-semibold uppercase tracking-wider">
                              <span>{block.linkText || 'Open Link'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          )}

                          {block.linkStyle === 'secondary' && (
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8E3DD] text-[#171514] rounded-lg text-xs font-display font-semibold uppercase tracking-wider">
                              <ExternalLink className="w-3.5 h-3.5 text-[#9B0F06]" />
                              <span>{block.linkText || 'Open Link'}</span>
                            </div>
                          )}

                          {block.linkStyle === 'ghost' && (
                            <div className="inline-flex items-center gap-1 text-xs font-display font-semibold text-[#9B0F06] underline decoration-[#9B0F06]/40">
                              <span>{block.linkText || 'Open Link'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divider Block */}
                  {block.type === 'divider' && (
                    <div className="p-3 bg-white border border-[#E8E3DD] rounded text-center">
                      <hr className="border-t border-[#E8E3DD] my-2" />
                      <span className="text-[10px] font-display uppercase tracking-widest text-[#6F6965]">
                        Horizontal Section Divider Line
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaPickerSelect}
        title={
          mediaPickerTarget.type === 'thumbnail'
            ? 'Select Case Study Thumbnail'
            : mediaPickerTarget.type === 'ogImage'
              ? 'Select Social Share Image (OG)'
              : 'Select Content Block Image'
        }
      />

      {/* Case Study JSON Import Modal (Single item loaded into editor) */}
      <CaseStudyImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => { }}
        onLoadIntoEditor={handleLoadImportedProject}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#171514] text-white text-xs font-display font-medium rounded-xl shadow-xl border border-white/10 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
