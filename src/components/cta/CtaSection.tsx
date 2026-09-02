import React from 'react';
import { ArrowUpRight, MessageSquare, Mail } from 'lucide-react';
import { SiteSettings } from '../../types';
import { buildMailtoUrl } from '../../lib/emailUtils';

interface CtaSectionProps {
  settings: SiteSettings;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ settings }) => {
  const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hi Aththar, I saw your portfolio and would like to discuss a project / role.'
  )}`;

  const emailUrl = buildMailtoUrl(
    settings.email,
    settings.email_subject || 'Project Inquiry & Collaboration',
    settings.email_body || 'Hi Aththar,\n\nI came across your portfolio and would like to discuss a project / role with you.\n\nBest regards,'
  );

  return (
    <section id="contact" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8E3DD]">
      <div className="bg-[#171514] text-white rounded-2xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
        {/* Subtle Background Geometric Accent */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#9B0F06]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Tag */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#9B0F06]"></span>
            <span className="font-display text-xs uppercase tracking-widest text-[#9B0F06] font-semibold">
              04 / Contact & Inquiries
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-display text-white leading-[1.08] mb-6">
            GOT A PROBLEM <br />
            WORTH SOLVING<span className="text-[#9B0F06]">?</span>
          </h2>

          <p className="text-lg sm:text-xl text-[#F7F4F0]/80 font-light mb-10 max-w-xl leading-relaxed">
            Let's talk. Whether you have an enterprise platform needing clarity, a venture in need of product strategy, or an interesting design challenge.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Primary Email CTA Button */}
            <a
              id="cta-email-primary-btn"
              href={emailUrl}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#9B0F06] hover:bg-[#7E0C05] text-white font-display text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Email Me</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* Secondary WhatsApp Button */}
            <a
              id="cta-whatsapp-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-display text-xs sm:text-sm font-medium uppercase tracking-wider rounded-lg transition-all duration-200 border border-white/10 backdrop-blur-md"
            >
              <MessageSquare className="w-4 h-4 text-[#F7F4F0]/80" />
              <span>Let's Talk on WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Availability Status Badge (Optional / Commented Out) */}
          {/* <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-3 text-xs font-display text-[#F7F4F0]/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{settings.availability_status}</span>
          </div> */}
        </div>
      </div>
    </section>
  );
};

