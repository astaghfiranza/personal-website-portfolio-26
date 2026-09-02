import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, MessageSquare, Calendar, User, Clock, Tag, Share2, Check, Link as LinkIcon, ExternalLink, Globe, Mail, Edit3 } from 'lucide-react';
import { Project, ContentBlock, SiteSettings } from '../../types';
import { fetchProjectBySlug, fetchProjects } from '../../lib/api';
import { renderRichMarkdownText } from '../../lib/richText';
import { buildMailtoUrl } from '../../lib/emailUtils';

interface CaseStudyViewProps {
  slug: string;
  isPreview?: boolean;
  previewFrom?: 'editor' | 'overview' | 'list' | string;
  settings: SiteSettings;
  onBack: () => void;
  onBackToEdit?: (projectId?: string) => void;
  onBackToList?: () => void;
  onBackToOverview?: () => void;
  onSelectProject: (slug: string) => void;
}

export const CaseStudyView: React.FC<CaseStudyViewProps> = ({
  slug,
  isPreview = false,
  previewFrom = 'editor',
  settings,
  onBack,
  onBackToEdit,
  onBackToList,
  onBackToOverview,
  onSelectProject,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchProjectBySlug(slug, isPreview),
      fetchProjects('published'),
    ])
      .then(([proj, projs]) => {
        if (isMounted) {
          setProject(proj);
          setAllProjects(projs);
          setLoading(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'This project seems to have disappeared.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, isPreview]);

  const handleShare = () => {
    if (isPreview) return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const caseStudyEmailUrl = buildMailtoUrl(
    settings.email,
    settings.case_study_email_subject || 'Discussion: {{project_title}}',
    settings.case_study_email_body || 'Hi Aththar,\n\nI just reviewed your case study on {{project_title}} and would love to chat about your design process.\n\nBest regards,',
    {
      project_title: project?.title || slug,
      client: project?.client || project?.organization || 'Project',
      year: project?.year || ''
    }
  );

  // Contextual back action resolver for single secondary button in top bar
  const handleContextualBack = () => {
    if (!isPreview) {
      onBack();
      return;
    }

    if (previewFrom === 'overview' && onBackToOverview) {
      onBackToOverview();
    } else if (previewFrom === 'list' && onBackToList) {
      onBackToList();
    } else if (onBackToEdit && project?.id) {
      onBackToEdit(project.id);
    } else {
      onBack();
    }
  };

  const getBackLabel = () => {
    if (!isPreview) return 'Back to Portfolio';
    if (previewFrom === 'overview') return 'Back to Dashboard';
    if (previewFrom === 'list') return 'Back to Project List';
    return 'Back to Edit Case Study';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] pt-32 pb-24 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#9B0F06] border-t-transparent animate-spin mb-4" />
        <p className="font-mono text-sm text-[#6F6965]">Loading case study telemetry...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] pt-36 pb-24 px-4 max-w-3xl mx-auto text-center">
        <div className="p-12 bg-[#F7F4F0] rounded-2xl border border-[#E8E3DD] space-y-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
            404 / Missing Route
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[#171514]">
            This project seems to have disappeared.
          </h1>
          <p className="text-base text-[#6F6965] max-w-md mx-auto font-light">
            The case study you are looking for may have been archived or moved by the author.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#171514] hover:bg-[#9B0F06] text-white text-xs font-mono uppercase tracking-wider rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Work</span>
          </button>
        </div>
      </div>
    );
  }

  // Find previous and next project for navigation
  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  return (
    <article className="min-h-screen bg-[#FBF9F6] text-[#171514]">
      {/* Top Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#E8E3DD] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Single Non-Redundant Secondary Back Button */}
            {isPreview ? (
              <button
                onClick={handleContextualBack}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] hover:text-[#9B0F06] text-xs font-display uppercase tracking-wider font-semibold rounded-md transition-colors shadow-2xs cursor-pointer"
              >
                {previewFrom === 'editor' ? (
                  <Edit3 className="w-3.5 h-3.5 text-[#9B0F06]" />
                ) : (
                  <ArrowLeft className="w-3.5 h-3.5 text-[#6F6965]" />
                )}
                <span>{getBackLabel()}</span>
              </button>
            ) : (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs font-display uppercase tracking-wider font-semibold text-[#171514] hover:text-[#9B0F06] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Portfolio</span>
              </button>
            )}
          </div>

          <div className="hidden md:block font-display text-xs text-[#6F6965] font-medium truncate max-w-xs">
            {project.title}
          </div>

          <div className="flex items-center gap-3">
            {/* Share Button (Disabled in Preview) */}
            <button
              onClick={isPreview ? undefined : handleShare}
              disabled={isPreview}
              title={isPreview ? "Sharing is disabled in preview mode" : "Copy Link to Case Study"}
              className={`p-2 rounded-md transition-colors text-xs font-display flex items-center gap-1.5 font-medium ${isPreview
                  ? 'text-[#6F6965]/40 cursor-not-allowed bg-transparent'
                  : 'text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] cursor-pointer'
                }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {/* Nav Email CTA (Disabled in Preview) */}
            {isPreview ? (
              <span
                title="CTA interaction is disabled in preview mode"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-display font-semibold uppercase tracking-wider text-[#6F6965]/60 bg-[#E8E3DD]/70 rounded cursor-not-allowed select-none"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Discuss in email</span>
              </span>
            ) : (
              <a
                id="case-study-email-cta-nav"
                href={caseStudyEmailUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-display font-semibold uppercase tracking-wider text-white bg-[#9B0F06] hover:bg-[#7E0C05] rounded transition-colors shadow-sm cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Discuss in email</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Preview Notice Banner (Informational Only - No redundant back button) */}
      {isPreview && (
        <div className="bg-[#171514] text-white py-2 px-4 text-center font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-semibold border-b border-[#2C2623]">
          <span className="w-2 h-2 rounded-full bg-[#9B0F06] animate-ping" />
          <span>Admin Preview Mode Active — Draft View</span>
        </div>
      )}

      {/* Case Study Header Hero */}
      <header className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-b border-[#E8E3DD]">
        {/* Category & Year */}
        <div className="flex items-center gap-3 mb-6 font-display text-xs text-[#6F6965]">
          <span className="px-2.5 py-1 bg-[#F7F4F0] border border-[#E8E3DD] text-[#9B0F06] font-bold rounded uppercase">
            {project.category}
          </span>
          <span>·</span>
          <span className="font-semibold">{project.year}</span>
          <span>·</span>
          {/*<span className="text-[#171514] font-medium">{project.duration}</span> */}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171514] font-display mb-8 leading-[1.08] text-balance">
          {project.title}
        </h1>

        {/* Short Description Lead */}
        <p className="text-xl sm:text-2xl text-[#6F6965] font-light leading-relaxed mb-12 max-w-4xl">
          {project.short_description}
        </p>

        {/* Metadata Grid (Project Essentials) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-[#F7F4F0] rounded-xl border border-[#E8E3DD]">
          <div>
            <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] mb-1 font-semibold">
              Role
            </div>
            <div className="font-semibold text-sm text-[#171514] font-display">
              {project.role}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] mb-1 font-semibold">
              Organization
            </div>
            <div className="font-semibold text-sm text-[#171514] font-display">
              {project.organization || project.client || 'Confidential'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] mb-1 font-semibold">
              Project Type
            </div>
            <div className="font-semibold text-sm text-[#171514] font-display">
              {project.project_type || project.category}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] mb-1 font-semibold">
              Timeline
            </div>
            <div className="font-semibold text-sm text-[#171514] font-display">
              {project.year} {project.duration ? `(${project.duration})` : ''}
            </div>
          </div>
        </div>

        {/* 1. Deliverables Block (Separate Box) */}
        {project.deliverables && project.deliverables.length > 0 && (
          <div className="mt-4 p-5 bg-[#FBF9F6] border border-[#E8E3DD] rounded-xl">
            <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] font-bold mb-3">
              Deliverables
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-display">
              {project.deliverables.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-white border border-[#E8E3DD] rounded-md text-[#171514] font-medium shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. Impact Metrics Block */}
        {project.impact_metrics && project.impact_metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {project.impact_metrics.map((m, idx) => (
              <div key={idx} className="p-4 bg-[#FBF9F6] border border-[#E8E3DD] rounded-xl">
                <div className="font-display text-2xl sm:text-3xl font-bold text-[#9B0F06]">
                  {m.value}
                </div>
                <div className="text-[11px] font-display uppercase tracking-wider text-[#6F6965] mt-1 font-medium">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Tags Block (Separate, Borderless) */}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-display">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#6F6965] mr-1">
              Tags:
            </span>
            {project.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#F0ECE6] text-[#171514] rounded-md text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Main Cover Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="rounded-2xl overflow-hidden border border-[#E8E3DD] bg-[#F7F4F0] shadow-md aspect-[16/9]">
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Case Study Body / TipTap Structured Blocks */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {project.content_json && project.content_json.length > 0 ? (
          project.content_json.map((block) => (
            <RenderContentBlock key={block.id} block={block} />
          ))
        ) : (
          <div className="py-12 text-center text-[#6F6965] font-mono text-sm">
            Detailed case study content is being compiled for publication.
          </div>
        )}
      </main>

      {/* Case Study Bottom Discussion Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-6">
        <div className="bg-[#171514] text-white rounded-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-lg">
            <span className="font-display text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
              Deep Dive & Inquiries
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Interested in this project's process?
            </h3>
            <p className="text-sm text-[#F7F4F0]/80 font-light">
              Have questions about <span className="text-white font-medium">{project.title}</span> or want to discuss a similar design challenge? Let's connect directly via email.
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            {isPreview ? (
              <span
                title="CTA interaction is disabled in preview mode"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[#E8E3DD]/30 text-[#F7F4F0]/60 font-display text-xs font-semibold uppercase tracking-wider rounded-lg cursor-not-allowed select-none border border-white/10"
              >
                <Mail className="w-4 h-4" />
                <span>Discuss in email</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            ) : (
              <a
                id="case-study-email-cta-bottom"
                href={caseStudyEmailUrl}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[#9B0F06] hover:bg-[#7E0C05] text-white font-display text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Discuss in email</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Previous / Next Project Navigation Footer */}
      <section className="border-t border-[#E8E3DD] mt-24 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {prevProject ? (
            <div
              onClick={isPreview ? undefined : () => onSelectProject(prevProject.slug)}
              title={isPreview ? "Switching case studies is disabled in preview mode" : undefined}
              className={`p-6 bg-[#F7F4F0] border border-[#E8E3DD] rounded-xl transition-all ${isPreview
                  ? 'opacity-60 cursor-not-allowed select-none'
                  : 'group cursor-pointer hover:bg-[#FAF8F5] hover:border-[#9B0F06]'
                }`}
            >
              <div className="font-display text-xs uppercase tracking-wider font-semibold text-[#6F6965] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ArrowLeft className={`w-3.5 h-3.5 ${!isPreview ? 'group-hover:-translate-x-1 transition-transform' : ''}`} />
                  <span>Previous Case Study</span>
                </span>
                {isPreview && (
                  <span className="text-[10px] text-[#6F6965] bg-[#E8E3DD]/70 px-1.5 py-0.5 rounded font-mono uppercase">
                    Disabled in preview
                  </span>
                )}
              </div>
              <h4 className={`text-xl font-bold font-display text-[#171514] ${!isPreview ? 'group-hover:text-[#9B0F06]' : ''}`}>
                {prevProject.title}
              </h4>
              <p className="text-xs font-display text-[#6F6965] mt-1 line-clamp-1">
                {prevProject.category} · {prevProject.year}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-[#F7F4F0]/40 rounded-xl border border-dashed border-[#E8E3DD] flex items-center justify-center font-display text-xs text-[#6F6965]">
              Beginning of selected projects
            </div>
          )}

          {nextProject ? (
            <div
              onClick={isPreview ? undefined : () => onSelectProject(nextProject.slug)}
              title={isPreview ? "Switching case studies is disabled in preview mode" : undefined}
              className={`p-6 bg-[#F7F4F0] border border-[#E8E3DD] rounded-xl text-left md:text-right transition-all ${isPreview
                  ? 'opacity-60 cursor-not-allowed select-none'
                  : 'group cursor-pointer hover:bg-[#FAF8F5] hover:border-[#9B0F06]'
                }`}
            >
              <div className="font-display text-xs uppercase tracking-wider font-semibold text-[#6F6965] mb-2 flex items-center justify-between md:justify-end gap-2">
                {isPreview && (
                  <span className="text-[10px] text-[#6F6965] bg-[#E8E3DD]/70 px-1.5 py-0.5 rounded font-mono uppercase">
                    Disabled in preview
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>Next Case Study</span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${!isPreview ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' : ''}`} />
                </span>
              </div>
              <h4 className={`text-xl font-bold font-display text-[#171514] ${!isPreview ? 'group-hover:text-[#9B0F06]' : ''}`}>
                {nextProject.title}
              </h4>
              <p className="text-xs font-display text-[#6F6965] mt-1 line-clamp-1">
                {nextProject.category} · {nextProject.year}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-[#F7F4F0]/40 rounded-xl border border-dashed border-[#E8E3DD] flex items-center justify-center font-display text-xs text-[#6F6965]">
              End of selected projects
            </div>
          )}
        </div>
      </section>
    </article>
  );
};

// Subcomponent to render individual rich blocks with editorial styling
const RenderContentBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      if (block.level === 1) {
        return (
          <h2 className="text-2xl sm:text-3xl font-bold text-[#171514] font-display pt-6 pb-2 border-b border-[#E8E3DD]">
            {block.text}
          </h2>
        );
      }
      if (block.level === 2) {
        return (
          <h3 className="text-xl sm:text-2xl font-bold text-[#171514] font-display pt-4">
            {block.text}
          </h3>
        );
      }
      return (
        <h4 className="text-lg font-bold text-[#171514] font-display pt-2">
          {block.text}
        </h4>
      );

    case 'paragraph':
      return (
        <p className="text-base sm:text-lg text-[#24201E] font-light leading-relaxed">
          {renderRichMarkdownText(block.text || '')}
        </p>
      );

    case 'link': {
      const href = block.linkUrl || '#';
      const target = block.linkNewTab !== false ? '_blank' : undefined;
      const rel = target ? 'noopener noreferrer' : undefined;
      const style = block.linkStyle || 'card';

      if (style === 'card') {
        return (
          <a
            href={href}
            target={target}
            rel={rel}
            className="my-8 block group p-6 sm:p-7 bg-[#F7F4F0] hover:bg-[#FAF8F5] border border-[#E8E3DD] hover:border-[#9B0F06] rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-[#9B0F06]/10 text-[#9B0F06] inline-flex items-center justify-center">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-display font-bold text-base sm:text-lg text-[#171514] group-hover:text-[#9B0F06] transition-colors truncate">
                    {block.linkText || 'Open Resource'}
                  </span>
                </div>
                {block.linkDescription && (
                  <p className="text-xs sm:text-sm text-[#6F6965] font-light leading-relaxed">
                    {block.linkDescription}
                  </p>
                )}
                {block.linkUrl && (
                  <div className="text-[11px] font-mono text-[#9B0F06] opacity-80 truncate pt-1 flex items-center gap-1">
                    <span>{block.linkUrl.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>

              <div className="w-9 h-9 rounded-full bg-white border border-[#E8E3DD] group-hover:border-[#9B0F06] group-hover:bg-[#9B0F06] group-hover:text-white text-[#171514] flex items-center justify-center transition-all shrink-0">
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </a>
        );
      }

      if (style === 'primary') {
        return (
          <div className="my-6">
            <a
              href={href}
              target={target}
              rel={rel}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#9B0F06] hover:bg-[#7E0C05] text-white rounded-lg text-xs sm:text-sm font-display font-semibold uppercase tracking-wider transition-colors shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>{block.linkText || 'Open Link'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            {block.linkDescription && (
              <p className="text-xs text-[#6F6965] mt-2 font-light">{block.linkDescription}</p>
            )}
          </div>
        );
      }

      if (style === 'secondary') {
        return (
          <div className="my-6">
            <a
              href={href}
              target={target}
              rel={rel}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FAF8F5] hover:bg-[#F7F4F0] border border-[#E8E3DD] hover:border-[#171514] text-[#171514] rounded-lg text-xs sm:text-sm font-display font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#9B0F06]" />
              <span>{block.linkText || 'Open Link'}</span>
            </a>
            {block.linkDescription && (
              <p className="text-xs text-[#6F6965] mt-2 font-light">{block.linkDescription}</p>
            )}
          </div>
        );
      }

      // Ghost style
      return (
        <div className="my-4">
          <a
            href={href}
            target={target}
            rel={rel}
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-display font-semibold text-[#9B0F06] underline decoration-[#9B0F06]/40 hover:decoration-[#9B0F06] hover:text-[#7E0C05] transition-colors cursor-pointer"
          >
            <span>{block.linkText || 'Open Link'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
          {block.linkDescription && (
            <p className="text-xs text-[#6F6965] mt-1 font-light">{block.linkDescription}</p>
          )}
        </div>
      );
    }

    case 'quote':
      return (
        <blockquote className="my-8 p-6 sm:p-8 bg-[#F7F4F0] border-l-4 border-[#9B0F06] rounded-r-xl">
          <p className="text-lg sm:text-xl font-serif italic text-[#171514] leading-relaxed mb-4">
            "{renderRichMarkdownText(block.text || '')}"
          </p>
          {(block.author || block.role) && (
            <footer className="font-display text-xs text-[#6F6965] font-medium">
              <span className="font-bold text-[#171514]">{block.author}</span>
              {block.role && <span> — {block.role}</span>}
            </footer>
          )}
        </blockquote>
      );

    case 'callout':
      const calloutBg =
        block.calloutType === 'decision'
          ? 'bg-[#171514] text-white border-[#171514]'
          : block.calloutType === 'outcome'
            ? 'bg-[#FDF2F1] text-[#171514] border-[#9B0F06]/30'
            : 'bg-[#F7F4F0] text-[#171514] border-[#E8E3DD]';

      const tagColor =
        block.calloutType === 'decision'
          ? 'text-[#9B0F06] bg-white/10'
          : 'text-[#9B0F06] bg-[#9B0F06]/10';

      return (
        <div className={`p-6 sm:p-8 rounded-xl border ${calloutBg} space-y-3`}>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 font-display text-[10px] uppercase font-bold tracking-widest rounded ${tagColor}`}>
              {block.calloutType || 'Note'}
            </span>
            {block.title && (
              <h4 className="font-display font-bold text-base sm:text-lg">
                {block.title}
              </h4>
            )}
          </div>
          <div className="text-sm sm:text-base leading-relaxed opacity-90 font-light">
            {renderRichMarkdownText(block.text || '')}
          </div>
        </div>
      );

    case 'columns':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-6 bg-[#F7F4F0] rounded-xl border border-[#E8E3DD]">
            <h5 className="font-display text-xs uppercase tracking-wider text-[#9B0F06] font-bold mb-2">
              {block.leftTitle || 'Left Point'}
            </h5>
            <div className="text-sm text-[#24201E] leading-relaxed font-light">
              {renderRichMarkdownText(block.leftText || '')}
            </div>
          </div>
          <div className="p-6 bg-[#F7F4F0] rounded-xl border border-[#E8E3DD]">
            <h5 className="font-display text-xs uppercase tracking-wider text-[#171514] font-bold mb-2">
              {block.rightTitle || 'Right Point'}
            </h5>
            <div className="text-sm text-[#24201E] leading-relaxed font-light">
              {renderRichMarkdownText(block.rightText || '')}
            </div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="my-8 overflow-hidden rounded-xl border border-[#E8E3DD] bg-[#FBF9F6]">
          {block.caption && (
            <div className="px-6 py-3 bg-[#F7F4F0] border-b border-[#E8E3DD] font-display text-xs font-semibold text-[#171514]">
              {block.caption}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-display">
              {block.headers && block.headers.length > 0 && (
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E3DD]">
                    {block.headers.map((h, i) => (
                      <th key={i} className="p-3.5 font-bold text-[#171514] uppercase tracking-wider text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-[#E8E3DD]">
                {block.rows?.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#F7F4F0]/60">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3.5 text-[#24201E] font-normal">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'userFlow':
      return (
        <div className="my-8 space-y-4">
          <div className="font-display text-xs uppercase tracking-wider text-[#9B0F06] font-bold">
            Interactive Product Journey Steps
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {block.flowSteps?.map((step, idx) => (
              <div key={idx} className="p-5 bg-[#F7F4F0] border border-[#E8E3DD] rounded-xl space-y-2">
                <span className="font-display text-sm font-bold text-[#9B0F06]">
                  {step.step}
                </span>
                <h5 className="font-display font-bold text-sm text-[#171514]">
                  {step.title}
                </h5>
                <p className="text-xs text-[#6F6965] font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'image':
      return (
        <figure className="my-8 space-y-2">
          <div className="rounded-xl overflow-hidden border border-[#E8E3DD] bg-[#F7F4F0]">
            <img
              src={block.url}
              alt={block.alt || 'Case study visual asset'}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="text-center font-display text-xs text-[#6F6965] pt-1 font-medium">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'divider':
      return <hr className="my-12 border-t border-[#E8E3DD]" />;

    case 'code':
      return (
        <div className="my-6 rounded-xl overflow-hidden bg-[#171514] text-white p-4 font-mono text-xs">
          <div className="text-[#6F6965] mb-2 text-[10px] uppercase">{block.language || 'Code Snippet'}</div>
          <pre className="overflow-x-auto">
            <code>{block.code}</code>
          </pre>
        </div>
      );

    default:
      return null;
  }
};
