import React, { useState } from 'react';
import {
  Plus,
  Search,
  Star,
  FileEdit,
  Copy,
  Trash2,
  Eye,
  FileJson,
  FileText,
  Upload,
  Download,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Project } from '../../types';
import { exportProjectAsJson, exportAllProjectsAsJson } from '../../lib/caseStudyData';
import { exportProjectToPdf } from '../../lib/caseStudyPdf';
import { CaseStudyImportModal } from './CaseStudyImportModal';

interface AdminProjectListProps {
  projects: Project[];
  onCreateNew: () => void;
  onEditProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onPreviewProject: (slug: string) => void;
  onReorderFeatured: (orderedIds: string[]) => void;
  onRefreshData?: () => void;
}

export const AdminProjectList: React.FC<AdminProjectListProps> = ({
  projects,
  onCreateNew,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onPreviewProject,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal and state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || project.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleExportJson = (project: Project) => {
    exportProjectAsJson(project);
    showToast(`Exported "${project.title}" as JSON`);
  };

  const handleExportAllJson = () => {
    if (projects.length === 0) return;
    exportAllProjectsAsJson(projects);
    showToast(`Exported all ${projects.length} case studies as JSON bundle`);
  };

  const handleExportPdf = async (project: Project) => {
    setExportingPdfId(project.id);
    try {
      await exportProjectToPdf(project);
      showToast(`Generated PDF for "${project.title}"`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('Failed to generate PDF', 'info');
    } finally {
      setExportingPdfId(null);
    }
  };

  const handleImportSuccess = (count: number, titles: string[]) => {
    showToast(`Successfully imported ${count} case stud${count > 1 ? 'ies' : 'y'}: ${titles.join(', ')}`);
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#171514] text-white text-xs font-display font-medium rounded-xl shadow-xl border border-white/10 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171514]">
            Project Management
          </h1>
          <p className="text-xs font-display text-[#6F6965] mt-1">
            Create, edit, import, and export case studies in JSON and PDF format
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportAllJson}
            disabled={projects.length === 0}
            title="Export all case studies as a JSON bundle"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5 text-[#6F6965]" />
            <span>Export All (JSON)</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            title="Import case study from compatible JSON"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#9B0F06]" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#9B0F06] hover:bg-[#7E0C05] text-white rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-[#E8E3DD]">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#6F6965] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title, slug, or tags..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:ring-2 focus:ring-[#9B0F06]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:ring-2 focus:ring-[#9B0F06] w-full md:w-auto"
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded-lg text-xs font-display text-[#171514] focus:outline-none focus:ring-2 focus:ring-[#9B0F06] w-full md:w-auto"
        >
          <option value="ALL">All Categories</option>
          <option value="PRODUCT">Product Design</option>
          <option value="UX">UX & Systems</option>
          <option value="BUILD">Build & Ventures</option>
          <option value="EXPERIMENT">Experiments</option>
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-[#E8E3DD] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-display">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E3DD] text-[#6F6965] uppercase tracking-wider font-semibold">
                <th className="p-4">Thumbnail & Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Year</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DD]">
              {filtered.map((project) => (
                <tr key={project.id} className="hover:bg-[#F7F4F0]/60 transition-colors">
                  {/* Title */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-12 h-12 object-cover rounded-lg border border-[#E8E3DD] flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-[#171514] text-sm font-display">
                          {project.title}
                        </div>
                        <div className="text-[11px] text-[#6F6965] font-mono">
                          /work/{project.slug}
                        </div>
                        <div className="text-[10px] text-[#6F6965] flex gap-1 mt-0.5">
                          {project.tags.slice(0, 3).map((t, i) => (
                            <span key={i}>#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4">
                    <span className="px-2 py-1 bg-[#F7F4F0] border border-[#E8E3DD] rounded text-[#171514] font-medium text-[11px]">
                      {project.category}
                    </span>
                  </td>

                  {/* Year */}
                  <td className="p-4 text-[#6F6965] font-mono">
                    {project.year}
                  </td>

                  {/* Featured */}
                  <td className="p-4">
                    {project.featured ? (
                      <span className="inline-flex items-center gap-1 text-[#9B0F06] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#9B0F06]" />
                        <span>Slot #{project.featured_order || 1}</span>
                      </span>
                    ) : (
                      <span className="text-[#6F6965]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        project.status === 'PUBLISHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : project.status === 'DRAFT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview */}
                      <button
                        onClick={() => onPreviewProject(project.slug)}
                        title="Preview Case Study"
                        className="p-1.5 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditProject(project.id)}
                        title="Edit Project"
                        className="p-1.5 text-[#6F6965] hover:text-[#9B0F06] hover:bg-[#F7F4F0] rounded transition-colors cursor-pointer"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      {/* Export JSON */}
                      <button
                        onClick={() => handleExportJson(project)}
                        title="Export Raw Data (JSON)"
                        className="p-1.5 text-[#6F6965] hover:text-[#9B0F06] hover:bg-[#F7F4F0] rounded transition-colors cursor-pointer"
                      >
                        <FileJson className="w-4 h-4" />
                      </button>

                      {/* Export PDF */}
                      <button
                        onClick={() => handleExportPdf(project)}
                        disabled={exportingPdfId === project.id}
                        title="Export Case Study (PDF)"
                        className="p-1.5 text-[#6F6965] hover:text-[#9B0F06] hover:bg-[#F7F4F0] rounded transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {exportingPdfId === project.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-[#9B0F06]" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        title="Duplicate"
                        className="p-1.5 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        title="Delete"
                        className="p-1.5 text-[#6F6965] hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6F6965] font-display">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Study JSON Import Modal */}
      <CaseStudyImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        existingProjects={projects}
      />
    </div>
  );
};

