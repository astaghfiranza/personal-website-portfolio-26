import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, SiteSettings } from '../../types';
import { Footer } from '../footer/Footer';

interface AllWorkPageProps {
  projects: Project[];
  settings: SiteSettings;
  onSelectProject: (slug: string) => void;
  onBackToHome: () => void;
  onOpenAdmin: () => void;
}

const ITEMS_PER_PAGE = 9;

export const AllWorkPage: React.FC<AllWorkPageProps> = ({
  projects,
  settings,
  onSelectProject,
  onBackToHome,
  onOpenAdmin,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const published = useMemo(
    () => projects.filter((p) => p.status === 'PUBLISHED'),
    [projects]
  );

  const baseCategories: Array<{ key: string; label: string }> = [
    { key: 'ALL', label: 'All Work' },
    { key: 'PRODUCT', label: 'Product Design' },
    { key: 'UX', label: 'UX & Systems' },
    { key: 'BUILD', label: 'Build & Ventures' },
    { key: 'EXPERIMENT', label: 'Experiments' },
  ];

  // Dynamically include any custom categories
  const customCategories = useMemo(() => {
    return Array.from(
      new Set(published.map((p) => p.category).filter(Boolean))
    ).filter((cat) => !baseCategories.some((b) => b.key === cat));
  }, [published]);

  const categories = useMemo(
    () => [
      ...baseCategories,
      ...customCategories.map((c) => ({ key: c, label: c })),
    ],
    [customCategories]
  );

  const filtered = useMemo(() => {
    if (activeCategory === 'ALL') return published;
    return published.filter((p) => p.category === activeCategory);
  }, [published, activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  // Reset to page 1 if category changes and current page exceeds total pages
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedProjects = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (catKey: string) => {
    setActiveCategory(catKey);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#171514] font-sans antialiased selection:bg-[#9B0F06] selection:text-white flex flex-col justify-between">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#E8E3DD] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-[#6F6965] hover:text-[#9B0F06] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-mono uppercase tracking-widest text-[#6F6965]">
              {filtered.length} {filtered.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Page Title */}
        <div className="mb-12 pb-8 border-b border-[#E8E3DD]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#9B0F06]"></span>
            <span className="font-display text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
              Full Archive & Portfolio
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#171514] font-display">
            ALL WORK<span className="text-[#9B0F06]">.</span>
          </h1>
          <p className="font-display text-sm sm:text-base text-[#6F6965] max-w-2xl mt-3 font-light">
            Comprehensive catalog of case studies, design systems, digital products, enterprise interfaces, and experimental builds.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count =
                cat.key === 'ALL'
                  ? published.length
                  : published.filter((p) => p.category === cat.key).length;

              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategorySelect(cat.key)}
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

        {/* Projects Grid (Up to 9 per page) */}
        {paginatedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProjects.map((project) => (
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
                  {/* Top-Left Category Badge */}
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

                  {/* Tags & Action */}
                  <div className="pt-3 border-t border-[#E8E3DD] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 overflow-hidden text-[11px] font-display text-[#6F6965] font-medium min-w-0 max-w-[70%]">
                      {project.tags &&
                        project.tags.slice(0, 2).map((t, idx) => (
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
        ) : (
          <div className="text-center py-16 bg-[#F7F4F0] rounded-xl border border-[#E8E3DD] p-8">
            <p className="font-mono text-sm text-[#6F6965]">
              No projects found under category "{activeCategory}".
            </p>
          </div>
        )}

        {/* Pagination Controls (If total pages > 1) */}
        {totalPages > 1 && (
          <div className="mt-16 pt-8 border-t border-[#E8E3DD] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-display text-[#6F6965]">
              Showing <span className="font-semibold text-[#171514]">{(safePage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
              <span className="font-semibold text-[#171514]">
                {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
              </span>{' '}
              of <span className="font-semibold text-[#171514]">{filtered.length}</span> projects
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous Page Button */}
              <button
                disabled={safePage === 1}
                onClick={() => handlePageChange(safePage - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-display font-semibold uppercase tracking-wider rounded border border-[#E8E3DD] bg-[#F7F4F0] text-[#171514] hover:bg-[#EFEBE4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-display font-semibold rounded border transition-colors cursor-pointer ${
                    safePage === pageNum
                      ? 'bg-[#9B0F06] text-white border-[#9B0F06]'
                      : 'bg-[#F7F4F0] text-[#171514] border-[#E8E3DD] hover:bg-[#EFEBE4]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Page Button */}
              <button
                disabled={safePage === totalPages}
                onClick={() => handlePageChange(safePage + 1)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-display font-semibold uppercase tracking-wider rounded border border-[#E8E3DD] bg-[#F7F4F0] text-[#171514] hover:bg-[#EFEBE4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenAdmin={onOpenAdmin}
      />
    </div>
  );
};
