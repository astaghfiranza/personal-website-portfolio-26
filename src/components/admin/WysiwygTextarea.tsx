import React, { useState, useRef } from 'react';
import { Link as LinkIcon, Bold, Italic, Code, Eye, EyeOff, ExternalLink, X, Check, Sparkles, List } from 'lucide-react';
import { renderRichMarkdownText } from '../../lib/richText';

interface WysiwygTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  className?: string;
}

export const WysiwygTextarea: React.FC<WysiwygTextareaProps> = ({
  value,
  onChange,
  placeholder = 'Write content here... Use markdown or link tools above.',
  rows = 4,
  label,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Helper to insert markdown tags at selection
  const insertFormatting = (prefix: string, suffix: string = prefix, defaultPlaceholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    const replacement = selectedText
      ? `${prefix}${selectedText}${suffix}`
      : `${prefix}${defaultPlaceholder}${suffix}`;

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(newVal);

    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus();
      const cursorTarget = start + prefix.length + (selectedText ? selectedText.length : defaultPlaceholder.length);
      textarea.setSelectionRange(cursorTarget, cursorTarget);
    }, 10);
  };

  // Open Link Inserter Modal / Dialog
  const handleOpenLinkModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      if (selected) {
        setLinkText(selected);
      } else {
        setLinkText('');
      }
    }
    setLinkUrl('');
    setShowLinkModal(true);
  };

  // Apply Insert Link
  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;

    const finalUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('/')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    const finalLabel = linkText.trim() || finalUrl.replace(/^https?:\/\//, '');
    const markdownLink = `[${finalLabel}](${finalUrl})`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentVal = textarea.value;

      const newVal = currentVal.substring(0, start) + markdownLink + currentVal.substring(end);
      onChange(newVal);

      setTimeout(() => {
        textarea.focus();
        const nextPos = start + markdownLink.length;
        textarea.setSelectionRange(nextPos, nextPos);
      }, 10);
    } else {
      onChange(value ? `${value} ${markdownLink}` : markdownLink);
    }

    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Top Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-2 py-1.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded-t-md text-xs font-display">
        {label ? (
          <span className="font-semibold text-[#171514] text-[11px] uppercase tracking-wider">{label}</span>
        ) : (
          <span className="text-[#6F6965] text-[10px] uppercase font-bold tracking-wider">Rich Text & Links</span>
        )}

        {/* Formatting Actions */}
        <div className="flex items-center gap-1">
          {/* Insert Link Button */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            title="Insert Hyperlink [Text](URL)"
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] hover:border-[#9B0F06] text-[#9B0F06] rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Link</span>
          </button>

          {/* Bold */}
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'bold text')}
            title="Bold (**text**)"
            className="p-1 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded hover:text-[#9B0F06] transition-colors cursor-pointer shadow-2xs"
          >
            <Bold className="w-3 h-3" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'italic text')}
            title="Italic (*text*)"
            className="p-1 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded hover:text-[#9B0F06] transition-colors cursor-pointer shadow-2xs"
          >
            <Italic className="w-3 h-3" />
          </button>

          {/* Inline Code */}
          <button
            type="button"
            onClick={() => insertFormatting('`', '`', 'code')}
            title="Inline Code (`code`)"
            className="p-1 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] text-[#171514] rounded hover:text-[#9B0F06] transition-colors cursor-pointer shadow-2xs"
          >
            <Code className="w-3 h-3" />
          </button>

          {/* Toggle Live Render Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'Switch to Raw Markdown Edit' : 'Live Formatted Preview'}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
              showPreview
                ? 'bg-[#9B0F06] text-white border-[#9B0F06]'
                : 'bg-white hover:bg-[#F7F4F0] text-[#6F6965] hover:text-[#171514] border-[#E8E3DD]'
            }`}
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showPreview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Editor or Live Formatted Preview */}
      {showPreview ? (
        <div
          className="w-full p-3 bg-white border border-t-0 border-[#E8E3DD] rounded-b-md text-xs leading-relaxed text-[#24201E] min-h-[80px]"
          style={{ minHeight: `${rows * 24}px` }}
        >
          {value ? (
            <div className="space-y-1">{renderRichMarkdownText(value)}</div>
          ) : (
            <span className="text-[#6F6965] italic text-[11px]">Nothing to preview yet.</span>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-t-0 border-[#E8E3DD] rounded-b-md text-xs font-sans text-[#171514] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#9B0F06]"
        />
      )}

      {/* Link Inserter Popover / Modal */}
      {showLinkModal && (
        <div className="p-3 bg-[#FAF8F5] border border-[#9B0F06]/30 rounded-lg shadow-sm space-y-2.5 my-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-1 border-b border-[#E8E3DD]">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold text-[#171514]">
              <LinkIcon className="w-3.5 h-3.5 text-[#9B0F06]" />
              <span>Insert Hyperlink</span>
            </div>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="p-1 text-[#6F6965] hover:text-[#171514] rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                Link Display Text
              </label>
              <input
                type="text"
                placeholder="e.g. View Live Prototype"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display text-[#171514] focus:ring-1 focus:ring-[#9B0F06]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display uppercase font-semibold text-[#6F6965] mb-1">
                Destination URL
              </label>
              <input
                type="text"
                placeholder="https://figma.com/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyLink();
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E8E3DD] rounded text-xs font-display text-[#171514] focus:ring-1 focus:ring-[#9B0F06]"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] font-display text-[#6F6965] font-medium mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setLinkText('Live Prototype');
                setLinkUrl('https://');
              }}
              className="px-2 py-0.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded text-[10px] font-display font-medium text-[#171514]"
            >
              Prototype
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkText('GitHub Repository');
                setLinkUrl('https://github.com/');
              }}
              className="px-2 py-0.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded text-[10px] font-display font-medium text-[#171514]"
            >
              GitHub
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkText('Design System Specs');
                setLinkUrl('https://');
              }}
              className="px-2 py-0.5 bg-white hover:bg-[#F7F4F0] border border-[#E8E3DD] rounded text-[10px] font-display font-medium text-[#171514]"
            >
              Design Specs
            </button>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E3DD]">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="px-3 py-1 bg-white border border-[#E8E3DD] hover:bg-[#F7F4F0] rounded text-xs font-display font-medium text-[#6F6965]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyLink}
              disabled={!linkUrl.trim()}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#9B0F06] hover:bg-[#7E0C05] disabled:opacity-40 text-white rounded text-xs font-display font-semibold transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Insert Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
