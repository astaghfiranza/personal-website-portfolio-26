import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

/**
 * Parses inline markdown formatted text:
 * - [Link Label](https://url.com) -> clickable <a> with icon
 * - **bold text** -> <strong>
 * - *italic text* -> <em>
 * - `code text` -> <code>
 */
export const renderRichMarkdownText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Regex to tokenize markdown elements:
  // 1. Links: \[([^\]]+)\]\(([^)]+)\)
  // 2. Bold: \*\*([^*]+)\*\*
  // 3. Italic: \*([^*]+)\*
  // 4. Code: `([^`]+)`
  // 5. Bare URLs: (https?:\/\/[^\s]+)
  const masterRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+)/g;

  const parts = text.split(masterRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Markdown Link: [Label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isExternal = url.startsWith('http') || url.startsWith('//');
      return (
        <a
          key={index}
          href={url}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#9B0F06] font-semibold underline decoration-[#9B0F06]/30 hover:decoration-[#9B0F06] hover:text-[#7E0C05] inline-flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>{label}</span>
          {isExternal && <ArrowUpRight className="w-3 h-3 inline-block shrink-0 opacity-80" />}
        </a>
      );
    }

    // 2. Bold: **text**
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={index} className="font-bold text-[#171514]">
          {boldMatch[1]}
        </strong>
      );
    }

    // 3. Italic: *text*
    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) {
      return (
        <em key={index} className="italic font-serif">
          {italicMatch[1]}
        </em>
      );
    }

    // 4. Code: `code`
    const codeMatch = part.match(/^`([^`]+)`$/);
    if (codeMatch) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E8E3DD] rounded text-[11px] font-mono text-[#9B0F06]"
        >
          {codeMatch[1]}
        </code>
      );
    }

    // 5. Bare URL: https://...
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9B0F06] font-semibold underline decoration-[#9B0F06]/30 hover:decoration-[#9B0F06] inline-flex items-center gap-0.5"
        >
          <span className="truncate max-w-[260px] inline-block align-bottom">{part}</span>
          <ArrowUpRight className="w-3 h-3 inline-block shrink-0" />
        </a>
      );
    }

    // Plain text with newline support
    return (
      <React.Fragment key={index}>
        {part.split('\n').map((line, lineIdx, arr) => (
          <React.Fragment key={lineIdx}>
            {line}
            {lineIdx < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  });
};
