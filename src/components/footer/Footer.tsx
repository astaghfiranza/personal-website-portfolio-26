import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowUpRight, Github, Linkedin, Mail, MessageSquare } from 'lucide-react';
import { SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  onScrollToTop: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onScrollToTop, onOpenAdmin }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format time in Jakarta / WIB (UTC+7)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`;

  return (
    <footer className="bg-[#F7F4F0] border-t border-[#E8E3DD] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Tier: Name & Social Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#E8E3DD]">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-1.5 font-display text-2xl font-bold tracking-tight text-[#171514]">
              <span>astaghfiranza</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06]"></span>
            </div>
            <p className="text-sm text-[#6F6965] max-w-sm font-light leading-relaxed">
              Product Designer building digital products, enterprise interfaces, and ventures worth exploring.
            </p>
            <div className="pt-2 flex items-center gap-2 font-display text-xs text-[#6F6965]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Jakarta, ID</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-display text-xs uppercase tracking-widest text-[#171514] font-semibold mb-3">
              Direct Channels
            </div>
            <ul className="space-y-2 font-display text-xs text-[#6F6965]">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#9B0F06] transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              {settings.linkedin_url && (
                <li>
                  <a
                    href={settings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#9B0F06] transition-colors inline-flex items-center gap-1.5 font-medium"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              )}
              {settings.github_url && (
                <li>
                  <a
                    href={settings.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#9B0F06] transition-colors inline-flex items-center gap-1.5 font-medium"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-[#9B0F06] transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{settings.email}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Philosophy & Back to Top */}
          <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end">
            {/* <div className="text-left md:text-right font-display text-xs text-[#6F6965] space-y-1">
              <div className="text-[#171514] font-semibold">Concept: Warm Precision</div>
              <div>"Quiet on the surface. Curious underneath."</div>
            </div> */}

            <button
              onClick={onScrollToTop}
              className="mt-6 md:mt-0 inline-flex items-center gap-2 px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] hover:border-[#9B0F06] rounded font-display text-xs uppercase font-semibold text-[#171514] hover:text-[#9B0F06] transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Tier: Copyright & Admin link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-display text-xs text-[#6F6965]">
          <div>
            © {new Date().getFullYear()} Aththar. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Built with React, Vite & Express</span>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-[#9B0F06] underline transition-colors"
            >
              CMS Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
