import React, { useState } from 'react';
import { ArrowUpRight, Filter, Sparkles } from 'lucide-react';
import { Project, ProjectCategory } from '../../types';

interface AllProjectsProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  onViewAllWork: () => void;
  isRevealedFromHero?: boolean;
}

const HOMEPAGE_MAX_PROJECTS = 6;

export const AllProjects: React.FC<AllProjectsProps> = ({
  projects,
  onSelectProject,
  onViewAllWork,
  isRevealedFromHero = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const baseCategories: Array<{ key: string; label: string }> = [
    { key: 'ALL', label: 'All Projects' },
    { key: 'PRODUCT', label: 'Product Design' },
    { key: 'UX', label: 'UX & Systems' },
    { key: 'BUILD', label: 'Build & Ventures' },
    { key: 'EXPERIMENT', label: 'Experiments' },
  ];

  const published = projects.filter((p) => p.status === 'PUBLISHED');

  // Dynamically include any custom categories present in published projects
  const customCategories = Array.from(
    new Set(published.map((p) => p.category).filter(Boolean))
  ).filter((cat) => !baseCategories.some((b) => b.key === cat));

  const categories = [
    ...baseCategories,
    ...customCategories.map((c) => ({ key: c, label: c })),
  ];

  const filtered = activeCategory === 'ALL'
    ? published
    : published.filter((p) => p.category === activeCategory);

  const displayedProjects = filtered.slice(0, HOMEPAGE_MAX_PROJECTS);

  return (
    <section
      id="all-projects"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8E3DD] relative"
    >
      {/* Hero Secret Reveal Banner if triggered */}
      {isRevealedFromHero && (
        <div className="mb-12 p-4 bg-[#FDF2F1] border border-[#9B0F06]/30 rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9B0F06] animate-ping"></span>
            <div>
              <span className="font-display text-xs font-bold text-[#9B0F06] uppercase tracking-wider block">
                Archive Discovered
              </span>
              <span className="text-xs font-display text-[#6F6965]">
                "A few things I've built." You've unlocked the full project archive.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block font-display text-[11px] uppercase tracking-widest text-[#9B0F06] font-semibold bg-white px-2.5 py-1 rounded border border-[#9B0F06]/20">
            {published.length} Works Unlocked
          </span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E8E3DD] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#9B0F06]"></span>
            <span className="font-display text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
              03 / The Rest of the Work
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171514] font-display">
            THE REST OF THE WORK<span className="text-[#9B0F06]">.</span>
          </h2>
        </div>
        <p className="font-display text-sm text-[#6F6965] max-w-md">
          Everything I've built, explored, or worked on. From end-to-end design systems to open-source interface experiments.
        </p>
      </div>

      {/* Filter Tabs - Horizontally scrollable on mobile */}
      <div className="mb-12 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            const count = cat.key === 'ALL'
              ? published.length
              : published.filter((p) => p.category === cat.key).length;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-md font-display text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#9B0F06] text-white font-semibold shadow-sm'
                    : 'bg-[#F7F4F0] text-[#6F6965] hover:text-[#171514] hover:bg-[#EFEBE4] border border-[#E8E3DD]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-display font-bold ${
                    isActive ? 'bg-black/20 text-white' : 'bg-[#E8E3DD] text-[#6F6965]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedProjects.map((project) => (
          <article
            key={project.id}
            onClick={() => onSelectProject(project.slug)}
            className="group cursor-pointer flex flex-col bg-[#FBF9F6] border border-[#E8E3DD] rounded-xl overflow-hidden hover:border-[#9B0F06] transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(23,21,20,0.08)]"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F4F0] border-b border-[#E8E3DD]">
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              {/* Top-Left Category Badge (Configurable) */}
              <div className="absolute top-3 left-3">
                <span
                  title={project.category}
                  className="inline-block max-w-[150px] truncate px-2.5 py-1 bg-[#171514]/85 backdrop-blur-md text-white text-[10px] font-display uppercase tracking-widest font-semibold rounded shadow-xs"
                >
                  {project.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 bg-[#FBF9F6]/90 backdrop-blur-sm text-[#171514] text-[10px] font-display uppercase font-semibold rounded border border-[#E8E3DD]">
                  {project.year}
                </span>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-display text-[#6F6965] mb-1 font-medium">
                  {project.role}
                </div>
                <h3 className="text-xl font-bold text-[#171514] font-display group-hover:text-[#9B0F06] transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-[#6F6965] line-clamp-2 mt-2 font-light">
                  {project.short_description}
                </p>
              </div>

              {/* Tags (Max 2 tags, truncated text) and Action */}
              <div className="pt-3 border-t border-[#E8E3DD] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-hidden text-[11px] font-display text-[#6F6965] font-medium min-w-0 max-w-[70%]">
                  {project.tags && project.tags.slice(0, 2).map((t, idx) => (
                    <span
                      key={idx}
                      title={t}
                      className="truncate max-w-[110px] bg-[#F7F4F0] px-2 py-0.5 rounded border border-[#E8E3DD] text-[#6F6965]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-display font-semibold text-[#9B0F06] group-hover:translate-x-0.5 transition-transform uppercase tracking-wider shrink-0">
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Button to navigate to Dedicated All Work Page */}
      <div className="mt-14 text-center">
        <button
          id="view-all-work-btn"
          onClick={onViewAllWork}
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#171514] hover:bg-[#9B0F06] text-white font-display text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-md hover:scale-[1.01] cursor-pointer"
        >
          <span>View All Work</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-[#F7F4F0] rounded-xl border border-[#E8E3DD] p-8">
          <p className="font-mono text-sm text-[#6F6965]">
            No projects found under category "{activeCategory}".
          </p>
        </div>
      )}
    </section>
  );
};
