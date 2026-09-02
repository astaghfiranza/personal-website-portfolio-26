import React from 'react';
import { FolderGit2, CheckCircle2, FileEdit, Star, Image as ImageIcon, Plus, ArrowUpRight, Copy, Trash2, Eye, Briefcase } from 'lucide-react';
import { Project, SiteSettings, MediaItem, ExperienceItem } from '../../types';

interface AdminDashboardProps {
  projects: Project[];
  media: MediaItem[];
  settings: SiteSettings;
  experience?: ExperienceItem[];
  onCreateNew: () => void;
  onEditProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onPreviewProject: (slug: string) => void;
  onGoToProjects: () => void;
  onGoToExperience?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  media,
  settings,
  experience = [],
  onCreateNew,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onPreviewProject,
  onGoToProjects,
  onGoToExperience,
}) => {
  const publishedCount = projects.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = projects.filter((p) => p.status === 'DRAFT').length;
  const featuredCount = projects.filter((p) => p.featured && p.status === 'PUBLISHED').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E3DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171514]">
            Portfolio Dashboard
          </h1>
          <p className="text-xs font-mono text-[#6F6965] mt-1">
            System overview and quick project actions for {settings.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onGoToExperience && (
            <button
              onClick={onGoToExperience}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#E8E3DD] hover:bg-[#F7F4F0] text-[#171514] rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-[#9B0F06]" />
              <span>Track Record</span>
            </button>
          )}

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-5 bg-white border border-[#E8E3DD] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#6F6965] mb-2 font-mono text-xs uppercase">
            <span>Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-[#171514]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#171514]">{projects.length}</div>
          <div className="text-[11px] font-mono text-[#6F6965] mt-1">
            {publishedCount} live / {draftCount} drafts
          </div>
        </div>

        {/* Featured Projects */}
        <div className="p-5 bg-white border border-[#E8E3DD] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#6F6965] mb-2 font-mono text-xs uppercase">
            <span>Featured Slots</span>
            <Star className="w-4 h-4 text-[#9B0F06]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#9B0F06]">{featuredCount} / 3</div>
          <div className="text-[11px] font-mono text-[#6F6965] mt-1">
            Displayed in Hero / Selected section
          </div>
        </div>

        {/* Track Record Items */}
        <div
          onClick={onGoToExperience}
          className="p-5 bg-white border border-[#E8E3DD] rounded-xl shadow-xs cursor-pointer hover:border-[#9B0F06]/40 transition-colors"
        >
          <div className="flex items-center justify-between text-[#6F6965] mb-2 font-mono text-xs uppercase">
            <span>Track Record</span>
            <Briefcase className="w-4 h-4 text-[#9B0F06]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#171514]">{experience.length}</div>
          <div className="text-[11px] font-mono text-[#6F6965] mt-1">
            Experience, ventures & degrees
          </div>
        </div>

        {/* Media Assets */}
        <div className="p-5 bg-white border border-[#E8E3DD] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#6F6965] mb-2 font-mono text-xs uppercase">
            <span>Media Library</span>
            <ImageIcon className="w-4 h-4 text-[#171514]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#171514]">{media.length}</div>
          <div className="text-[11px] font-mono text-[#6F6965] mt-1">
            Images & visual crops stored
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white border border-[#E8E3DD] rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E8E3DD] flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[#171514]">
            Recent Projects
          </h2>
          <button
            onClick={onGoToProjects}
            className="text-xs font-mono uppercase tracking-wider text-[#9B0F06] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E3DD] text-[#6F6965] uppercase">
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3DD]">
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id} className="hover:bg-[#F7F4F0]/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-10 h-10 object-cover rounded border border-[#E8E3DD]"
                      />
                      <div>
                        <div className="font-bold text-[#171514] text-sm font-display">
                          {project.title}
                        </div>
                        <div className="text-[11px] text-[#6F6965]">
                          /work/{project.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-[#F7F4F0] border border-[#E8E3DD] rounded text-[#171514]">
                      {project.category}
                    </span>
                  </td>

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

                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPreviewProject(project.slug)}
                        title="Preview Case Study"
                        className="p-1.5 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditProject(project.id)}
                        title="Edit Project"
                        className="p-1.5 text-[#6F6965] hover:text-[#9B0F06] hover:bg-[#F7F4F0] rounded"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        title="Duplicate"
                        className="p-1.5 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        title="Delete"
                        className="p-1.5 text-[#6F6965] hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
