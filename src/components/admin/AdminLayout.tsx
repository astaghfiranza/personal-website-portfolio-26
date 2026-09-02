import React from 'react';
import { LayoutDashboard, FolderGit2, Image as ImageIcon, Settings, LogOut, ExternalLink, PlusCircle, ArrowLeft, Briefcase } from 'lucide-react';
import { logout } from '../../lib/api';

export type AdminTab = 'dashboard' | 'projects' | 'new-project' | 'experience' | 'media' | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewLiveSite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  onViewLiveSite,
  children,
}) => {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const navItems: Array<{ id: AdminTab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'All Projects', icon: FolderGit2 },
    { id: 'new-project', label: 'Create Project', icon: PlusCircle },
    { id: 'experience', label: 'Track Record', icon: Briefcase },
    { id: 'media', label: 'Media Assets', icon: ImageIcon },
    { id: 'settings', label: 'System & Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#171514] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#171514] text-white flex-shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
            <div>
              <div className="font-display font-bold text-lg text-white flex items-center gap-1.5">
                <span>ATHTHAR</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06]"></span>
              </div>
              <div className="text-[10px] font-mono text-[#6F6965] uppercase tracking-wider">
                CMS / Admin Suite
              </div>
            </div>
            <button
              onClick={onViewLiveSite}
              title="View Public Website"
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                    isActive
                      ? 'bg-[#9B0F06] text-white font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <button
            onClick={onViewLiveSite}
            className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded font-mono text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Portfolio</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded font-mono text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
