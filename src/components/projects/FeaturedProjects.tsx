import React from 'react';
import { ArrowUpRight, Sparkles, Layers, Award } from 'lucide-react';
import { Project } from '../../types';

interface FeaturedProjectsProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  projects,
  onSelectProject,
}) => {
  // Ensure maximum 3 featured projects
  const featured = projects.filter((p) => p.featured && p.status === 'PUBLISHED').slice(0, 3);

  return (
    <section id="selected-work" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8E3DD]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#E8E3DD] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#9B0F06]"></span>
            <span className="font-display text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
              01 / Selected Work
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171514] font-display">
            SELECTED WORK<span className="text-[#9B0F06]">.</span>
          </h2>
        </div>
        <p className="font-display text-sm text-[#6F6965] max-w-md">
          A few problems I've enjoyed solving. Deep dives into enterprise workflows, civic telemetry, and physical ventures.
        </p>
      </div>

      {/* Featured Projects Editorial List */}
      <div className="space-y-24">
        {featured.map((project, idx) => {
          const numberLabel = `0${idx + 1}`;
          return (
            <article
              key={project.id}
              id={`featured-project-${project.slug}`}
              onClick={() => onSelectProject(project.slug)}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-300"
            >
              {/* Image / Visual Crop (7 cols on large) */}
              <div className="lg:col-span-7 overflow-hidden rounded-xl bg-[#F7F4F0] border border-[#E8E3DD] shadow-[0_4px_30px_-15px_rgba(23,21,20,0.06)] relative aspect-[16/10]">
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full h-full object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171514]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Floating Category/Type Tag (Configurable Top-Left Badge) */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    title={project.category}
                    className="inline-block max-w-[220px] truncate px-3 py-1 bg-[#171514]/85 backdrop-blur-md text-white text-[11px] font-display tracking-widest uppercase font-semibold rounded shadow-xs"
                  >
                    {project.category}
                  </span>
                </div>

                {/* Hover CTA Indicator */}
                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#9B0F06] text-white text-xs font-display font-semibold tracking-wider uppercase rounded-md shadow-md">
                    <span>Open Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Text / Editorial Narrative (5 cols on large) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  {/* Number & Metadata Header */}
                  <div className="flex items-center justify-between font-display text-xs text-[#6F6965] mb-3 pb-2 border-b border-[#E8E3DD]">
                    <span className="text-[#9B0F06] font-bold text-sm tracking-wider">
                      {numberLabel}
                    </span>
                    <div className="flex items-center gap-3 font-medium">
                      <span>{project.role}</span>
                      <span>·</span>
                      <span>{project.year}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171514] font-display group-hover:text-[#9B0F06] transition-colors leading-tight mb-4">
                    {project.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-[#6F6965] text-base leading-relaxed mb-6 font-light">
                    {project.short_description}
                  </p>

                  {/* Impact Metrics Chips */}
                  {project.impact_metrics && project.impact_metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#F7F4F0] rounded-lg border border-[#E8E3DD]/60">
                      {project.impact_metrics.slice(0, 2).map((metric, mIdx) => (
                        <div key={mIdx}>
                          <div className="font-display text-lg font-bold text-[#171514]">
                            {metric.value}
                          </div>
                          <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] font-medium">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags (Max 2 tags, truncated text if long) */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {project.tags.slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          title={tag}
                          className="inline-block max-w-[150px] truncate px-2.5 py-1 bg-[#F7F4F0] text-[#6F6965] border border-[#E8E3DD] text-[11px] font-display font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Action Link */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-[#171514] group-hover:text-[#9B0F06] transition-colors">
                    <span>Read Full Case Study</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
