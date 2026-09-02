import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Lock, Mail } from 'lucide-react';
import { SiteSettings } from '../../types';
import { buildMailtoUrl } from '../../lib/emailUtils';

interface NavbarProps {
  settings: SiteSettings;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onNavigate,
  onOpenAdmin,
  currentPath,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const emailUrl = buildMailtoUrl(
    settings.email,
    settings.email_subject || 'Project Inquiry & Collaboration',
    settings.email_body || 'Hi Aththar,\n\nI came across your portfolio and would like to discuss a project / role with you.\n\nBest regards,'
  );

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#E8E3DD] py-3 shadow-[0_4px_20px_-10px_rgba(36,32,30,0.05)]'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('hero')}
            className="group flex items-center gap-1 text-left focus:outline-none"
          >
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#171514] group-hover:text-[#9B0F06] transition-colors">
              astaghfiranza
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06] animate-pulse"></span>

          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              id="nav-work-btn"
              onClick={() => handleNavClick('selected-work')}
              className="text-xs uppercase tracking-widest text-[#6F6965] hover:text-[#171514] hover:font-semibold transition-colors font-display font-medium"
            >
              Selected Work
            </button>
            <button
              id="nav-experience-btn"
              onClick={() => handleNavClick('experience')}
              className="text-xs uppercase tracking-widest text-[#6F6965] hover:text-[#171514] hover:font-semibold transition-colors font-display font-medium"
            >
              Experience
            </button>
            <button
              id="nav-all-work-btn"
              onClick={() => handleNavClick('all-projects')}
              className="text-xs uppercase tracking-widest text-[#6F6965] hover:text-[#171514] hover:font-semibold transition-colors font-display font-medium"
            >
              Archive
            </button>
            <button
              id="nav-contact-btn"
              onClick={() => handleNavClick('contact')}
              className="text-xs uppercase tracking-widest text-[#6F6965] hover:text-[#171514] hover:font-semibold transition-colors font-display font-medium"
            >

              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              id="nav-email-cta"
              href={emailUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-display font-semibold tracking-wider uppercase text-white bg-[#171514] hover:bg-[#9B0F06] rounded-md transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Me</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Admin CMS Access */}
            {/* <button
              id="nav-admin-link"
              onClick={onOpenAdmin}
              title="Admin CMS Portal"
              className="p-2 text-[#6F6965] hover:text-[#171514] hover:bg-[#F7F4F0] rounded-md transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </button> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              id="nav-mobile-admin"
              onClick={onOpenAdmin}
              className="p-2 text-[#6F6965] hover:text-[#171514]"
              title="Admin Login"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#171514] hover:text-[#9B0F06] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="nav-mobile-drawer" className="sm:hidden bg-[#FBF9F6] border-b border-[#E8E3DD] px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavClick('selected-work')}
              className="text-left px-3 py-2 text-sm font-display font-semibold uppercase tracking-wider text-[#171514] hover:bg-[#F7F4F0] rounded-md"
            >
              Selected Work
            </button>
            <button
              onClick={() => handleNavClick('experience')}
              className="text-left px-3 py-2 text-sm font-display font-semibold uppercase tracking-wider text-[#171514] hover:bg-[#F7F4F0] rounded-md"
            >
              Experience
            </button>
            <button
              onClick={() => handleNavClick('all-projects')}
              className="text-left px-3 py-2 text-sm font-display font-semibold uppercase tracking-wider text-[#171514] hover:bg-[#F7F4F0] rounded-md"
            >
              Archive
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left px-3 py-2 text-sm font-display font-semibold uppercase tracking-wider text-[#171514] hover:bg-[#F7F4F0] rounded-md"
            >
              Contact
            </button>
          </div>
          <div className="pt-3 border-t border-[#E8E3DD]">
            <a
              id="nav-mobile-email-cta"
              href={emailUrl}
              className="flex items-center justify-center gap-2 w-full py-3 text-xs font-display font-semibold tracking-wide uppercase text-white bg-[#9B0F06] hover:bg-[#7E0C05] rounded-md transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Email Me</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
