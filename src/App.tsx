import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { Hero } from './components/hero/Hero';
import { FeaturedProjects } from './components/projects/FeaturedProjects';
import { ExperienceSection } from './components/experience/ExperienceSection';
import { AllProjects } from './components/projects/AllProjects';
import { AllWorkPage } from './components/projects/AllWorkPage';
import { CtaSection } from './components/cta/CtaSection';
import { Footer } from './components/footer/Footer';
import { CaseStudyView } from './components/case-study/CaseStudyView';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProjectList } from './components/admin/AdminProjectList';
import { AdminProjectEditor } from './components/admin/AdminProjectEditor';
import { AdminExperienceManager } from './components/admin/AdminExperienceManager';
import { AdminMediaLibrary } from './components/admin/AdminMediaLibrary';
import { AdminSettings } from './components/admin/AdminSettings';
import { Project, ExperienceItem, SiteSettings, MediaItem } from './types';
import {
  fetchProjects,
  fetchExperience,
  fetchSiteSettings,
  fetchMedia,
  checkAuth,
  deleteProject,
  duplicateProject,
  reorderFeaturedProjects,
} from './lib/api';

const defaultSiteSettings: SiteSettings = {
  name: 'Aththar',
  title: 'Product Designer',
  headline: '',
  supporting_copy: '',
  metadata_label: '',
  whatsapp_number: '',
  email: '',
  email_subject: '',
  email_body: '',
  case_study_email_subject: '',
  case_study_email_body: '',
  linkedin_url: '',
  github_url: '',
  location: '',
  availability_status: '',
  bio_intro: '',
  hero_image: '',
  hero_image_alt: '',
  hero_image_tag: '',
  hero_image_badge: '',
};

export default function App() {
  // App-level State
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isRevealedFromHero, setIsRevealedFromHero] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initial Data Fetching
  const reloadData = useCallback(async () => {
    try {
      const isAuth = await checkAuth();
      setIsAdminAuthenticated(isAuth);

      const [projectsData, expData, settingsData, mediaData] = await Promise.all([
        fetchProjects(isAuth ? 'all' : 'published').catch((err) => {
          console.error('Error fetching projects:', err);
          return [] as Project[];
        }),
        fetchExperience().catch((err) => {
          console.error('Error fetching experience:', err);
          return [] as ExperienceItem[];
        }),
        fetchSiteSettings().catch((err) => {
          console.error('Error fetching site settings:', err);
          return defaultSiteSettings;
        }),
        isAuth
          ? fetchMedia().catch((err) => {
              console.error('Error fetching media:', err);
              return [] as MediaItem[];
            })
          : Promise.resolve([] as MediaItem[]),
      ]);

      setProjects(projectsData);
      setExperience(expData);
      setSettings(settingsData);
      setMedia(mediaData);
    } catch (err) {
      console.error('Error during data initialization:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Public Navigation Helper
  const handleSectionScroll = (sectionId: string) => {
    if (currentPath !== '/') {
      navigateTo('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hero Reveal Handler
  const handleHeroReveal = () => {
    setIsRevealedFromHero(true);
    const el = document.getElementById('all-projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Admin Project Handlers
  const handleEditProject = (id: string) => {
    setEditingProjectId(id);
    setAdminTab('projects');
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      await duplicateProject(id);
      await reloadData();
    } catch (err: any) {
      alert('Failed to duplicate project: ' + err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      await reloadData();
    } catch (err: any) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleReorderFeatured = async (orderedIds: string[]) => {
    try {
      await reorderFeaturedProjects(orderedIds);
      await reloadData();
    } catch (err: any) {
      alert('Failed to reorder featured projects: ' + err.message);
    }
  };

  // Initial loading state: load until loading is cleared and finished
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-6 select-none">
        <div className="w-9 h-9 rounded-full border-2 border-[#9B0F06] border-t-transparent animate-spin mb-4" />
        <p className="font-display text-xs uppercase tracking-widest text-[#6F6965] font-semibold">
          Loading...
        </p>
      </div>
    );
  }

  // Determine current active view
  // 1. Dedicated All Work Route: /work or /all-work or /projects
  if (currentPath === '/work' || currentPath === '/all-work' || currentPath === '/projects') {
    return (
      <AllWorkPage
        projects={projects}
        settings={settings}
        onSelectProject={(slug) => navigateTo(`/work/${slug}`)}
        onBackToHome={() => navigateTo('/')}
        onOpenAdmin={() => navigateTo('/admin')}
      />
    );
  }

  // 2. Case Study Route: /work/:slug
  if (currentPath.startsWith('/work/')) {
    const slug = currentPath.replace('/work/', '').split('?')[0];
    if (slug) {
      const searchParams = new URLSearchParams(window.location.search);
      const isPreview = searchParams.get('preview') === 'true' || window.location.search.includes('preview=true');
      const previewFrom = searchParams.get('from') || (isPreview ? 'editor' : undefined);

      return (
        <CaseStudyView
          slug={slug}
          isPreview={isPreview}
          previewFrom={previewFrom}
          settings={settings}
          onBack={() => {
            if (isPreview) {
              if (previewFrom === 'overview') {
                setAdminTab('dashboard');
                navigateTo('/admin');
              } else if (previewFrom === 'list') {
                setEditingProjectId(null);
                setAdminTab('projects');
                navigateTo('/admin');
              } else {
                setAdminTab('projects');
                navigateTo('/admin');
              }
            } else {
              navigateTo('/');
            }
          }}
          onBackToEdit={(projId) => {
            if (projId) {
              setEditingProjectId(projId);
            }
            setAdminTab('projects');
            navigateTo('/admin');
          }}
          onBackToList={() => {
            setEditingProjectId(null);
            setAdminTab('projects');
            navigateTo('/admin');
          }}
          onBackToOverview={() => {
            setAdminTab('dashboard');
            navigateTo('/admin');
          }}
          onSelectProject={(newSlug) => {
            if (isPreview) {
              // In preview mode, do not switch or retain preview context
              navigateTo(`/work/${newSlug}?preview=true&from=${previewFrom || 'editor'}`);
            } else {
              navigateTo(`/work/${newSlug}`);
            }
          }}
        />
      );
    }
  }

  // 2. Admin Route: /admin
  if (currentPath.startsWith('/admin')) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            reloadData();
          }}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }

    const editingProject = editingProjectId
      ? projects.find((p) => p.id === editingProjectId)
      : null;

    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => {
          setEditingProjectId(null);
          setAdminTab(tab);
        }}
        onLogout={() => {
          setIsAdminAuthenticated(false);
          navigateTo('/');
        }}
        onViewLiveSite={() => navigateTo('/')}
      >
        {/* Dashboard Overview Tab */}
        {adminTab === 'dashboard' && (
          <AdminDashboard
            projects={projects}
            media={media}
            settings={settings}
            experience={experience}
            onCreateNew={() => {
              setEditingProjectId(null);
              setAdminTab('new-project');
            }}
            onEditProject={handleEditProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onPreviewProject={(slug) => navigateTo(`/work/${slug}?preview=true&from=overview`)}
            onGoToProjects={() => setAdminTab('projects')}
            onGoToExperience={() => setAdminTab('experience')}
          />
        )}

        {/* Projects Tab */}
        {adminTab === 'projects' && (
          editingProjectId ? (
            <AdminProjectEditor
              project={editingProject}
              onSaveSuccess={() => {
                setEditingProjectId(null);
                setAdminTab('projects');
                reloadData();
              }}
              onCancel={() => setEditingProjectId(null)}
              onPreview={(slug) => navigateTo(`/work/${slug}?preview=true&from=editor`)}
            />
          ) : (
            <AdminProjectList
              projects={projects}
              onCreateNew={() => {
                setEditingProjectId(null);
                setAdminTab('new-project');
              }}
              onEditProject={handleEditProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onPreviewProject={(slug) => navigateTo(`/work/${slug}?preview=true&from=list`)}
              onReorderFeatured={handleReorderFeatured}
              onRefreshData={reloadData}
            />
          )
        )}

        {/* New Project Tab */}
        {adminTab === 'new-project' && (
          <AdminProjectEditor
            project={null}
            onSaveSuccess={() => {
              setAdminTab('projects');
              reloadData();
            }}
            onCancel={() => setAdminTab('projects')}
            onPreview={(slug) => navigateTo(`/work/${slug}?preview=true&from=editor`)}
          />
        )}

        {/* Track Record / Experience Tab */}
        {adminTab === 'experience' && (
          <AdminExperienceManager
            experience={experience}
            onExperienceUpdated={(newExp) => {
              setExperience(newExp);
            }}
          />
        )}

        {/* Media Library Tab */}
        {adminTab === 'media' && <AdminMediaLibrary />}

        {/* Settings Tab */}
        {adminTab === 'settings' && (
          <AdminSettings
            onSettingsUpdated={(newSettings) => {
              setSettings(newSettings);
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // 3. Public Home Route (Landing)
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#171514] font-sans antialiased selection:bg-[#9B0F06] selection:text-white flex flex-col justify-between">
      {/* Navigation */}
      <Navbar
        settings={settings}
        currentPath={currentPath}
        onNavigate={handleSectionScroll}
        onOpenAdmin={() => navigateTo('/admin')}
      />

      {/* Main Public Content */}
      <main className="flex-1">
        {/* 1. Hero Section with Hold -> Release -> Reveal */}
        <Hero
          settings={settings}
          onExploreClick={() => handleSectionScroll('selected-work')}
          onRevealTriggered={handleHeroReveal}
          isRevealed={isRevealedFromHero}
        />

        {/* 2. Featured Projects (Selected Work) */}
        <FeaturedProjects
          projects={projects}
          onSelectProject={(slug) => navigateTo(`/work/${slug}`)}
        />

        {/* 3. Experience Section (Track Record) */}
        <ExperienceSection experience={experience} />

        {/* 4. All Projects (Archive & Experiments) */}
        <AllProjects
          projects={projects}
          onSelectProject={(slug) => navigateTo(`/work/${slug}`)}
          onViewAllWork={() => navigateTo('/work')}
          isRevealedFromHero={isRevealedFromHero}
        />

        {/* 5. CTA Section (WhatsApp Directive) */}
        <CtaSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenAdmin={() => navigateTo('/admin')}
      />
    </div>
  );
}
