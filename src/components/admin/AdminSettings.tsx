import React, { useState, useEffect } from 'react';
import {
  Save,
  Lock,
  AlertCircle,
  Check,
  KeyRound,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  FolderOpen,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import {
  fetchSiteSettings,
  updateSiteSettings,
  changePassword,
  uploadMedia,
} from '../../lib/api';
import { MediaPickerModal } from './MediaPickerModal';

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80';

interface AdminSettingsProps {
  onSettingsUpdated: (newSettings: SiteSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);


  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load site settings');
        setLoading(false);
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateSiteSettings(settings);
      onSettingsUpdated(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Direct File Upload for Hero Image
  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setUploadingHero(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        const savedMedia = await uploadMedia({
          url: dataUrl,
          type: 'image',
          alt_text: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: 'Landing Hero Profile Visual',
          width: 1400,
          height: 900,
          size_kb: Math.round(dataUrl.length / 1024),
        });

        if (settings) {
          setSettings({
            ...settings,
            hero_image: savedMedia.url,
            hero_image_alt: savedMedia.alt_text || settings.hero_image_alt || settings.name,
          });
        }
      } catch (err: any) {
        alert(err.message || 'Failed to upload asset');
      } finally {
        setUploadingHero(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Media Picker Selection Handler
  const handleMediaPickerSelect = (item: { url: string; alt_text?: string }) => {
    if (!settings) return;
    setSettings({
      ...settings,
      hero_image: item.url,
      hero_image_alt: item.alt_text || settings.hero_image_alt || settings.name,
    });
    setMediaPickerOpen(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setUpdatingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setUpdatingPassword(false);
    }
  };


  if (loading || !settings) {
    return <div className="p-8 text-center font-mono text-sm text-[#6F6965]">Loading settings telemetry...</div>;
  }

  const currentHeroImage = settings.hero_image || DEFAULT_HERO_IMAGE;

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E3DD]">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#171514]">
          System & Profile Settings
        </h1>
        <p className="text-xs font-mono text-[#6F6965] mt-1">
          Configure hero visual showcase, contact directives, and administrative telemetry
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Settings saved successfully. Public portfolio updated in real-time.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8E3DD] space-y-8 shadow-xs">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO SHOWCASE PHOTO & VISUAL BRANDING */}
        {/* ========================================================================= */}
        <div className="space-y-5 pb-6 border-b border-[#E8E3DD]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-base text-[#171514] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#9B0F06]" />
                <span>Hero Showcase Photo & Visual</span>
              </h2>
              <p className="text-xs font-display text-[#6F6965]">
                Configure the primary photo/image displayed prominently on the landing page hero card.
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-[#9B0F06] font-bold self-start sm:self-auto">
              Live Showcase Asset
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live Visual Preview Card */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-display uppercase tracking-wider text-[#6F6965] font-bold">
                  Hero Card Live Preview
                </span>
                <span className="text-[10px] font-mono text-[#9B0F06]">
                  Zoom: {settings.hero_image_crop_zoom || 100}% · Pos: {settings.hero_image_crop_x ?? 50}%/{settings.hero_image_crop_y ?? 50}%
                </span>
              </div>

              {/* Photo Frame matching public Hero without shadows */}
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border border-[#E8E3DD] bg-[#FAF8F5]">
                <img
                  src={currentHeroImage}
                  alt={settings.hero_image_alt || 'Hero Showcase'}
                  style={{
                    objectFit: (settings.hero_image_object_fit || 'cover') as any,
                    objectPosition: `${settings.hero_image_crop_x ?? 50}% ${settings.hero_image_crop_y ?? 50}%`,
                    transform: `scale(${(settings.hero_image_crop_zoom || 100) / 100})`,
                    transformOrigin: `${settings.hero_image_crop_x ?? 50}% ${settings.hero_image_crop_y ?? 50}%`,
                  }}
                  className="w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_HERO_IMAGE;
                  }}
                />

                {/* Top Tag Pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 bg-[#171514]/85 backdrop-blur-md border border-white/10 rounded-full text-white text-[10px] font-display uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B0F06]"></span>
                  <span className="truncate max-w-[140px]">
                    {settings.hero_image_tag || 'Warm Precision Studio'}
                  </span>
                </div>

                {/* Top Right Badge */}
                <div className="absolute top-3 right-3 text-[9px] font-mono text-white/80 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded">
                  {settings.hero_image_badge || 'JKT · 2026'}
                </div>
              </div>
            </div>

            {/* Selection & Upload Controls */}
            <div className="lg:col-span-7 space-y-4">
              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#171514] hover:bg-[#9B0F06] text-white rounded-lg text-xs font-display font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choose from Media Asset Library</span>
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3DD] hover:border-[#171514] text-[#171514] rounded-lg text-xs font-display font-semibold transition-colors cursor-pointer shadow-2xs">
                  <Upload className="w-4 h-4 text-[#9B0F06]" />
                  <span>{uploadingHero ? 'Uploading...' : 'Upload New Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileUpload}
                    disabled={uploadingHero}
                    className="hidden"
                  />
                </label>

                {settings.hero_image && settings.hero_image !== DEFAULT_HERO_IMAGE && (
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        hero_image: DEFAULT_HERO_IMAGE,
                        hero_image_tag: 'Warm Precision Studio',
                        hero_image_badge: 'JKT · 2026',
                        hero_image_crop_zoom: 100,
                        hero_image_crop_x: 50,
                        hero_image_crop_y: 50,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-display text-[#6F6965] hover:text-[#9B0F06] transition-colors"
                    title="Reset to initial default studio photograph"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                )}
              </div>

              {/* Crop, Zoom & Alignment Controls (Requirement 7) */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E3DD]">
                  <span className="text-xs font-display font-bold uppercase text-[#171514] flex items-center gap-1.5">
                    <span>Crop & Focal Framing</span>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        hero_image_crop_zoom: 100,
                        hero_image_crop_x: 50,
                        hero_image_crop_y: 50,
                        hero_image_object_fit: 'cover',
                      })
                    }
                    className="text-[11px] font-display text-[#6F6965] hover:text-[#9B0F06]"
                  >
                    Reset Framing
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Zoom Slider */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-display font-semibold text-[#171514] mb-1">
                      <span>Zoom / Scale</span>
                      <span className="font-mono text-[10px] text-[#6F6965]">
                        {settings.hero_image_crop_zoom || 100}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="200"
                      step="5"
                      value={settings.hero_image_crop_zoom || 100}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero_image_crop_zoom: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#9B0F06] cursor-pointer"
                    />
                  </div>

                  {/* Horizontal Focal X */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-display font-semibold text-[#171514] mb-1">
                      <span>Focal X (Left-Right)</span>
                      <span className="font-mono text-[10px] text-[#6F6965]">
                        {settings.hero_image_crop_x ?? 50}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="2"
                      value={settings.hero_image_crop_x ?? 50}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero_image_crop_x: Number(e.target.value),
                          hero_image_object_position: `${e.target.value}% ${settings.hero_image_crop_y ?? 50}%`,
                        })
                      }
                      className="w-full accent-[#9B0F06] cursor-pointer"
                    />
                  </div>

                  {/* Vertical Focal Y */}
                  <div>
                    <label className="flex items-center justify-between text-[11px] font-display font-semibold text-[#171514] mb-1">
                      <span>Focal Y (Top-Bottom)</span>
                      <span className="font-mono text-[10px] text-[#6F6965]">
                        {settings.hero_image_crop_y ?? 50}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="2"
                      value={settings.hero_image_crop_y ?? 50}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hero_image_crop_y: Number(e.target.value),
                          hero_image_object_position: `${settings.hero_image_crop_x ?? 50}% ${e.target.value}%`,
                        })
                      }
                      className="w-full accent-[#9B0F06] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Object Fit selector */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="text-[11px] font-display font-semibold text-[#171514]">
                    Fit Mode:
                  </label>
                  {(['cover', 'contain', 'fill'] as const).map((fitMode) => (
                    <label key={fitMode} className="flex items-center gap-1 text-xs font-display text-[#6F6965] cursor-pointer">
                      <input
                        type="radio"
                        name="hero_fit_mode"
                        checked={(settings.hero_image_object_fit || 'cover') === fitMode}
                        onChange={() => setSettings({ ...settings, hero_image_object_fit: fitMode })}
                        className="accent-[#9B0F06]"
                      />
                      <span className="capitalize">{fitMode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Direct Image URL Input */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                  Or Paste Direct Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={settings.hero_image || ''}
                    onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                    placeholder={DEFAULT_HERO_IMAGE}
                    className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono text-[#171514] focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
                  />
                  {settings.hero_image && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, hero_image: '' })}
                      className="px-2.5 py-2 text-xs font-mono text-[#6F6965] hover:text-[#9B0F06] border border-[#E8E3DD] rounded bg-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tag & Badge Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-display uppercase text-[#171514] font-semibold mb-1">
                    Floating Tag (Top Left Pill)
                  </label>
                  <input
                    type="text"
                    value={settings.hero_image_tag ?? 'Warm Precision Studio'}
                    onChange={(e) => setSettings({ ...settings, hero_image_tag: e.target.value })}
                    placeholder="Warm Precision Studio"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-display uppercase text-[#171514] font-semibold mb-1">
                    Coordinate / Year Badge (Top Right)
                  </label>
                  <input
                    type="text"
                    value={settings.hero_image_badge ?? 'JKT · 2026'}
                    onChange={(e) => setSettings({ ...settings, hero_image_badge: e.target.value })}
                    placeholder="JKT · 2026"
                    className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
                  />
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-[11px] font-display uppercase text-[#171514] font-semibold mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={settings.hero_image_alt ?? 'Product Design Studio & Interface Architecture'}
                  onChange={(e) => setSettings({ ...settings, hero_image_alt: e.target.value })}
                  placeholder="Product Design Studio & Interface Architecture"
                  className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-display text-[#6F6965]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: PUBLIC PROFILE & CONTACT DIRECTIVES */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-base text-[#171514] pb-2 border-b border-[#E8E3DD]">
            Public Profile & Contact Directives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>
          </div>

          {/* Primary CTA Directives: Email Configuration */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E8E3DD] rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E3DD]">
              <Mail className="w-4 h-4 text-[#9B0F06]" />
              <span className="font-display text-xs uppercase tracking-wider font-bold text-[#171514]">
                Email CTA Configuration (Primary Contact Channel)
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="your.email@domain.com"
                className="w-full px-3 py-2 bg-white border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>

            {/* Main Page CTA Subject & Body */}
            <div className="pt-2 space-y-3">
              <span className="font-display text-[11px] uppercase tracking-wider font-semibold text-[#6F6965] block">
                Landing Page CTA ('Email Me') Directives
              </span>

              <div>
                <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                  Default Email Subject
                </label>
                <input
                  type="text"
                  value={settings.email_subject ?? 'Project Inquiry & Collaboration'}
                  onChange={(e) => setSettings({ ...settings, email_subject: e.target.value })}
                  placeholder="Project Inquiry & Collaboration"
                  className="w-full px-3 py-2 bg-white border border-[#E8E3DD] rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                  Default Email Pre-filled Body
                </label>
                <textarea
                  rows={3}
                  value={settings.email_body ?? 'Hi Aththar,\n\nI came across your portfolio and would like to discuss a project / role with you.\n\nBest regards,'}
                  onChange={(e) => setSettings({ ...settings, email_body: e.target.value })}
                  placeholder="Hi Aththar, I came across your portfolio..."
                  className="w-full px-3 py-2 bg-white border border-[#E8E3DD] rounded text-xs font-mono"
                />
              </div>
            </div>

            {/* Case Study CTA Subject & Body */}
            <div className="pt-2 border-t border-[#E8E3DD] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] uppercase tracking-wider font-semibold text-[#6F6965] block">
                  Case Study CTA ('Discuss in email') Directives
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                  Case Study Email Subject Template
                </label>
                <input
                  type="text"
                  value={settings.case_study_email_subject ?? 'Discussion: {{project_title}}'}
                  onChange={(e) => setSettings({ ...settings, case_study_email_subject: e.target.value })}
                  placeholder="Discussion: {{project_title}}"
                  className="w-full px-3 py-2 bg-white border border-[#E8E3DD] rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                  Case Study Email Pre-filled Body Template
                </label>
                <textarea
                  rows={3}
                  value={settings.case_study_email_body ?? 'Hi Aththar,\n\nI just reviewed your case study on {{project_title}} and would love to chat about your design process.\n\nBest regards,'}
                  onChange={(e) => setSettings({ ...settings, case_study_email_body: e.target.value })}
                  placeholder="Hi Aththar, I just reviewed your case study on {{project_title}}..."
                  className="w-full px-3 py-2 bg-white border border-[#E8E3DD] rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Secondary Channels: WhatsApp & Social */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                WhatsApp (Alternative Channel)
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="6281234567890"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
              <span className="text-[10px] font-mono text-[#6F6965] mt-1 block">
                No + sign (e.g. 6281234567890)
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={settings.github_url}
                onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>
          </div>

          {/* Hero Copy */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
              Hero Supporting Copy
            </label>
            <textarea
              rows={2}
              value={settings.supporting_copy}
              onChange={(e) => setSettings({ ...settings, supporting_copy: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
            />
          </div>

          {/* Availability & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                Location
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#171514] font-semibold mb-1">
                Availability Status
              </label>
              <input
                type="text"
                value={settings.availability_status}
                onChange={(e) => setSettings({ ...settings, availability_status: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E3DD]">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#9B0F06] hover:bg-[#7E0C05] text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Password Security Box */}
      <form onSubmit={handlePasswordChange} className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8E3DD] space-y-4 shadow-xs">
        <h2 className="font-display font-bold text-base text-[#171514] pb-2 border-b border-[#E8E3DD] flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#9B0F06]" />
          <span>Update Admin Password</span>
        </h2>

        {passwordMsg && (
          <div
            className={`p-3 rounded text-xs font-mono ${passwordMsg.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono text-[#171514] font-semibold mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#171514] font-semibold mb-1">
              New Password (8+ chars)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#171514] font-semibold mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-xs font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updatingPassword}
          className="px-4 py-2 bg-[#171514] hover:bg-[#9B0F06] text-white rounded text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          {updatingPassword ? 'Updating...' : 'Change Password'}
        </button>
      </form>



      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaPickerSelect}
        title="Select Hero Showcase Photo"
      />
    </div>
  );
};

