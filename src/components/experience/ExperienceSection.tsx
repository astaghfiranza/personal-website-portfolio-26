import React, { useState } from 'react';
import { Briefcase, Hammer, GraduationCap, ArrowUpRight, ChevronDown, Award } from 'lucide-react';
import { ExperienceItem } from '../../types';

interface ExperienceSectionProps {
  experience: ExperienceItem[];
}

const ExperienceCardItem: React.FC<{ item: ExperienceItem }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const highlights = item.highlights || [];

  return (
    <div className="p-6 sm:p-7 bg-[#FBF9F6] border border-[#E8E3DD] rounded-xl transition-all duration-200 hover:border-[#9B0F06]/40 shadow-xs">
      {/* Header: Company/Title, Role, Organization, Location, Period */}
      <div
        className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 ${
          isExpanded ? 'pb-5 mb-5 border-b border-[#E8E3DD]' : ''
        }`}
      >
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#171514] font-display">
            {item.title}
          </h3>
          <div className="text-sm font-display text-[#6F6965] mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[#9B0F06] font-semibold">{item.role}</span>
            {item.organization && item.organization !== item.title && (
              <>
                <span className="text-[#D3CCC4]">·</span>
                <span className="font-medium text-[#171514]">{item.organization}</span>
              </>
            )}
            {item.location && (
              <>
                <span className="text-[#D3CCC4]">·</span>
                <span>{item.location}</span>
              </>
            )}
          </div>
        </div>
        <div className="font-display text-xs uppercase tracking-wider font-semibold text-[#6F6965] bg-[#F7F4F0] px-3 py-1.5 rounded border border-[#E8E3DD] shrink-0 self-start sm:self-auto">
          {item.period}
        </div>
      </div>

      {/* Expanded Details (Hidden when Collapsed) */}
      {isExpanded && (
        <div className="space-y-6 pt-1">
          {/* Description */}
          {item.description && (
            <p className="text-[#171514] text-base leading-relaxed font-normal">
              {item.description}
            </p>
          )}

          {/* Metric Highlights if available */}
          {item.metrics && item.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F7F4F0] rounded-lg border border-[#E8E3DD]">
              {item.metrics.map((m, mIdx) => (
                <div key={mIdx}>
                  <div className="font-display text-xl font-bold text-[#171514]">
                    {m.value}
                  </div>
                  <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] font-medium">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bullet Highlights */}
          {highlights.length > 0 && (
            <div className="space-y-2.5">
              {highlights.map((h, hIdx) => (
                <div key={hIdx} className="flex items-start gap-3 text-sm text-[#6F6965]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06] mt-2 flex-shrink-0"></span>
                  <span className="leading-relaxed font-sans">{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags & External Link */}
          {(item.tags?.length || item.link) && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E8E3DD]/70">
              <div className="flex flex-wrap gap-2">
                {item.tags?.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 bg-[#F7F4F0] text-[#6F6965] border border-[#E8E3DD] text-xs font-display font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-[#9B0F06] hover:underline uppercase tracking-wider"
                >
                  <span>Explore Initiative</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expand / Collapse Tertiary Button (No BG) */}
      <div className={`flex items-center ${isExpanded ? 'pt-4 mt-6 border-t border-[#E8E3DD]' : 'pt-3 mt-3'}`}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-display font-semibold uppercase tracking-wider text-[#9B0F06] hover:text-[#7E0C05] bg-transparent p-0 border-0 transition-colors cursor-pointer group"
        >
          <span>{isExpanded ? 'View Less' : 'View More'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5 ${
              isExpanded ? 'rotate-180 !group-hover:-translate-y-0.5' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  const [activeCategory, setActiveCategory] = useState<string>('01 WORK');

  const categories = [
    { key: '01 WORK', label: 'Work Experience', icon: Briefcase, count: experience.filter(e => e.category === '01 WORK').length },
    { key: '02 BUILD', label: 'Entrepreneurial / Build', icon: Hammer, count: experience.filter(e => e.category === '02 BUILD').length },
    { key: '03 LEARN', label: 'Certifications', icon: Award, count: experience.filter(e => e.category === '03 LEARN').length },
    { key: '04 STUDY', label: 'Education', icon: GraduationCap, count: experience.filter(e => e.category === '04 STUDY').length },
  ];

  const filteredItems = experience.filter((item) => item.category === activeCategory);

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8E3DD]">
      {/* Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#E8E3DD] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-[#9B0F06]"></span>
            <span className="font-display text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
              02 / Track Record
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171514] font-display">
            WHAT I'VE DONE<span className="text-[#9B0F06]">.</span>
          </h2>
        </div>
        <p className="font-display text-sm text-[#6F6965] max-w-md">
          The things I've done beyond the screen. Enterprise SaaS, physical business building, computer science foundation, and lifelong learning.
        </p>
      </div>

      {/* Category Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex flex-col p-4 text-left rounded-lg border transition-all duration-200 ${
                isActive
                  ? 'bg-[#171514] text-white border-[#171514] shadow-sm'
                  : 'bg-[#F7F4F0] text-[#171514] border-[#E8E3DD] hover:border-[#9B0F06]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-display text-xs font-bold ${isActive ? 'text-[#9B0F06]' : 'text-[#6F6965]'}`}>
                  {cat.key.split(' ')[0]}
                </span>
                <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded ${isActive ? 'bg-white/10 text-white' : 'bg-[#E8E3DD] text-[#6F6965]'}`}>
                  {cat.count}
                </span>
              </div>
              <div className="font-display font-semibold text-sm sm:text-base">
                {cat.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Experience Items List */}
      <div className="space-y-8">
        {filteredItems.map((item) => (
          <ExperienceCardItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
