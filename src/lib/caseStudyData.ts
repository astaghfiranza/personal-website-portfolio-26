import { Project, ContentBlock, BlockType } from '../types';

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  projects: Partial<Project>[];
  summary: {
    totalProjects: number;
    totalBlocks: number;
    titles: string[];
  };
}

const VALID_BLOCK_TYPES: BlockType[] = [
  'heading',
  'paragraph',
  'link',
  'quote',
  'image',
  'gallery',
  'video',
  'callout',
  'columns',
  'table',
  'divider',
  'code',
  'keyMetric',
  'userFlow',
];

/**
 * Downloads a JavaScript object as a formatted JSON file in the browser safely
 */
export function downloadJsonFile(filename: string, data: unknown): boolean {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Retain object URL for 60 seconds so browser download manager finishes without aborting
    setTimeout(() => {
      try {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
      } catch (e) {
        // Safe ignore
      }
    }, 60000);
    
    return true;
  } catch (err) {
    console.error('Failed to trigger JSON download:', err);
    // Fallback data URI attempt
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
      const fallbackLink = document.createElement('a');
      fallbackLink.href = dataUri;
      fallbackLink.download = filename;
      fallbackLink.style.display = 'none';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => {
        if (fallbackLink.parentNode) fallbackLink.parentNode.removeChild(fallbackLink);
      }, 5000);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback data URI download failed:', fallbackErr);
      return false;
    }
  }
}

/**
 * Exports a single case study to JSON
 */
export function exportProjectAsJson(project: Project): void {
  const cleanSlug = (project.slug || project.title || 'case-study')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const exportPayload = {
    schemaVersion: '1.0',
    exportDate: new Date().toISOString(),
    source: 'Aththar Portfolio Admin',
    project: {
      title: project.title,
      slug: project.slug,
      short_description: project.short_description || '',
      category: project.category || 'PRODUCT',
      project_type: project.project_type || project.category || 'Product Design',
      role: project.role || 'Lead Product Designer',
      organization: project.organization || project.client || 'Confidential Client',
      client: project.client || project.organization || 'Confidential Client',
      year: project.year || new Date().getFullYear().toString(),
      duration: project.duration || '3 months',
      thumbnail_url: project.thumbnail_url || '',
      featured: Boolean(project.featured),
      featured_order: project.featured_order || 1,
      status: project.status || 'DRAFT',
      tags: project.tags || [],
      deliverables: project.deliverables || [],
      impact_metrics: project.impact_metrics || [],
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
      og_image: project.og_image || '',
      content_json: project.content_json || [],
    },
  };

  downloadJsonFile(`${cleanSlug}-case-study.json`, exportPayload);
}

/**
 * Exports all case studies into a single bundle JSON
 */
export function exportAllProjectsAsJson(projects: Project[]): void {
  const exportPayload = {
    schemaVersion: '1.0',
    exportDate: new Date().toISOString(),
    totalCount: projects.length,
    source: 'Aththar Portfolio Admin',
    projects: projects.map((project) => ({
      title: project.title,
      slug: project.slug,
      short_description: project.short_description || '',
      category: project.category || 'PRODUCT',
      project_type: project.project_type || project.category || 'Product Design',
      role: project.role || 'Lead Product Designer',
      organization: project.organization || project.client || 'Confidential Client',
      client: project.client || project.organization || 'Confidential Client',
      year: project.year || new Date().getFullYear().toString(),
      duration: project.duration || '3 months',
      thumbnail_url: project.thumbnail_url || '',
      featured: Boolean(project.featured),
      featured_order: project.featured_order || 1,
      status: project.status || 'DRAFT',
      tags: project.tags || [],
      deliverables: project.deliverables || [],
      impact_metrics: project.impact_metrics || [],
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
      og_image: project.og_image || '',
      content_json: project.content_json || [],
    })),
  };

  downloadJsonFile(`aththar-all-case-studies-${new Date().toISOString().slice(0, 10)}.json`, exportPayload);
}

/**
 * Sanitizes and normalizes an individual content block
 */
function sanitizeContentBlock(rawBlock: any, index: number): ContentBlock | null {
  if (!rawBlock || typeof rawBlock !== 'object') return null;

  const type: BlockType = VALID_BLOCK_TYPES.includes(rawBlock.type) ? rawBlock.type : 'paragraph';
  const id = rawBlock.id || `blk-import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`;

  const block: ContentBlock = {
    id,
    type,
  };

  if (rawBlock.level && [1, 2, 3].includes(Number(rawBlock.level))) {
    block.level = Number(rawBlock.level) as 1 | 2 | 3;
  }
  if (typeof rawBlock.text === 'string') block.text = rawBlock.text;
  if (typeof rawBlock.title === 'string') block.title = rawBlock.title;
  if (typeof rawBlock.author === 'string') block.author = rawBlock.author;
  if (typeof rawBlock.role === 'string') block.role = rawBlock.role;
  if (typeof rawBlock.url === 'string') block.url = rawBlock.url;
  if (typeof rawBlock.alt === 'string') block.alt = rawBlock.alt;
  if (typeof rawBlock.caption === 'string') block.caption = rawBlock.caption;
  if (typeof rawBlock.calloutType === 'string') block.calloutType = rawBlock.calloutType;
  if (typeof rawBlock.leftTitle === 'string') block.leftTitle = rawBlock.leftTitle;
  if (typeof rawBlock.leftText === 'string') block.leftText = rawBlock.leftText;
  if (typeof rawBlock.rightTitle === 'string') block.rightTitle = rawBlock.rightTitle;
  if (typeof rawBlock.rightText === 'string') block.rightText = rawBlock.rightText;
  if (Array.isArray(rawBlock.headers)) block.headers = rawBlock.headers.map(String);
  if (Array.isArray(rawBlock.rows)) {
    block.rows = rawBlock.rows.map((row: any) => (Array.isArray(row) ? row.map(String) : [String(row)]));
  }
  if (typeof rawBlock.code === 'string') block.code = rawBlock.code;
  if (typeof rawBlock.language === 'string') block.language = rawBlock.language;
  if (typeof rawBlock.metricValue === 'string') block.metricValue = rawBlock.metricValue;
  if (typeof rawBlock.metricLabel === 'string') block.metricLabel = rawBlock.metricLabel;
  if (typeof rawBlock.metricContext === 'string') block.metricContext = rawBlock.metricContext;
  if (Array.isArray(rawBlock.flowSteps)) {
    block.flowSteps = rawBlock.flowSteps.map((st: any, i: number) => ({
      step: st?.step ? String(st.step) : (i + 1).toString().padStart(2, '0'),
      title: st?.title ? String(st.title) : `Step ${i + 1}`,
      description: st?.description ? String(st.description) : '',
    }));
  }
  if (typeof rawBlock.linkText === 'string') block.linkText = rawBlock.linkText;
  if (typeof rawBlock.linkUrl === 'string') block.linkUrl = rawBlock.linkUrl;
  if (typeof rawBlock.linkStyle === 'string') block.linkStyle = rawBlock.linkStyle;
  if (typeof rawBlock.linkDescription === 'string') block.linkDescription = rawBlock.linkDescription;
  if (typeof rawBlock.linkNewTab === 'boolean') block.linkNewTab = rawBlock.linkNewTab;

  return block;
}

/**
 * Validates and parses raw JSON into normalized Case Study objects
 */
export function validateAndParseCaseStudyJson(rawInput: string | unknown): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const projects: Partial<Project>[] = [];

  let parsed: any;

  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput);
    } catch (err: any) {
      return {
        valid: false,
        errors: [`Invalid JSON syntax: ${err.message}`],
        warnings: [],
        projects: [],
        summary: { totalProjects: 0, totalBlocks: 0, titles: [] },
      };
    }
  } else {
    parsed = rawInput;
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      errors: ['The JSON payload must be an object or an array of case study projects.'],
      warnings: [],
      projects: [],
      summary: { totalProjects: 0, totalBlocks: 0, titles: [] },
    };
  }

  // Determine items list
  let rawList: any[] = [];
  if (Array.isArray(parsed)) {
    rawList = parsed;
  } else if (Array.isArray(parsed.projects)) {
    rawList = parsed.projects;
  } else if (parsed.project && typeof parsed.project === 'object') {
    rawList = [parsed.project];
  } else if (parsed.title || parsed.content_json || parsed.short_description) {
    rawList = [parsed];
  } else {
    return {
      valid: false,
      errors: [
        'Could not recognize case study structure. Expected a project object with "title" or an array of projects.',
      ],
      warnings: [],
      projects: [],
      summary: { totalProjects: 0, totalBlocks: 0, titles: [] },
    };
  }

  if (rawList.length === 0) {
    return {
      valid: false,
      errors: ['JSON is empty or contains no project definitions.'],
      warnings: [],
      projects: [],
      summary: { totalProjects: 0, totalBlocks: 0, titles: [] },
    };
  }

  let totalBlocks = 0;
  const titles: string[] = [];

  rawList.forEach((item, index) => {
    const itemPrefix = rawList.length > 1 ? `Item #${index + 1}: ` : '';

    if (!item || typeof item !== 'object') {
      errors.push(`${itemPrefix}Expected a project object.`);
      return;
    }

    const title = (item.title || item.name || '').toString().trim();
    if (!title) {
      errors.push(`${itemPrefix}Missing required "title" property.`);
      return;
    }

    titles.push(title);

    // Normalize slug
    let slug = item.slug ? String(item.slug).trim() : '';
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      warnings.push(`${itemPrefix}No slug provided. Auto-generated slug "${slug}".`);
    }

    // Process Content Blocks
    let contentBlocks: ContentBlock[] = [];
    if (Array.isArray(item.content_json)) {
      contentBlocks = item.content_json
        .map((b: any, bIdx: number) => sanitizeContentBlock(b, bIdx))
        .filter((b: ContentBlock | null): b is ContentBlock => b !== null);
    } else if (Array.isArray(item.blocks)) {
      contentBlocks = item.blocks
        .map((b: any, bIdx: number) => sanitizeContentBlock(b, bIdx))
        .filter((b: ContentBlock | null): b is ContentBlock => b !== null);
    } else if (typeof item.body === 'string' || typeof item.content === 'string') {
      // Auto-convert string body/content to paragraph blocks
      const text = item.body || item.content;
      contentBlocks = [
        { id: `blk-1-${Date.now()}`, type: 'heading', level: 1, text: 'Project Overview' },
        { id: `blk-2-${Date.now()}`, type: 'paragraph', text },
      ];
      warnings.push(`${itemPrefix}Converted plain text content into structured paragraph blocks.`);
    } else {
      contentBlocks = [
        { id: `blk-1-${Date.now()}`, type: 'heading', level: 1, text: 'Project Overview' },
        { id: `blk-2-${Date.now()}`, type: 'paragraph', text: item.short_description || 'Project narrative...' },
      ];
      warnings.push(`${itemPrefix}No content blocks provided. Generated default overview block.`);
    }

    totalBlocks += contentBlocks.length;

    // Process Impact Metrics
    let impactMetrics: Array<{ label: string; value: string }> = [];
    if (Array.isArray(item.impact_metrics)) {
      impactMetrics = item.impact_metrics
        .filter((m: any) => m && typeof m === 'object' && (m.label || m.value))
        .map((m: any) => ({
          label: String(m.label || 'Metric'),
          value: String(m.value || '100%'),
        }));
    }

    // Process Tags
    let tags: string[] = [];
    if (Array.isArray(item.tags)) {
      tags = item.tags.map(String).filter(Boolean);
    } else if (typeof item.tags === 'string') {
      tags = item.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    // Process Deliverables
    let deliverables: string[] = [];
    if (Array.isArray(item.deliverables)) {
      deliverables = item.deliverables.map(String).filter(Boolean);
    } else if (typeof item.deliverables === 'string') {
      deliverables = item.deliverables.split(',').map((d: string) => d.trim()).filter(Boolean);
    }

    const project: Partial<Project> = {
      title,
      slug,
      short_description: item.short_description ? String(item.short_description) : '',
      category: item.category ? String(item.category).toUpperCase() : 'PRODUCT',
      project_type: item.project_type ? String(item.project_type) : item.category || 'Product Design',
      role: item.role ? String(item.role) : 'Lead Product Designer',
      organization: item.organization ? String(item.organization) : item.client || 'Confidential Client',
      client: item.client ? String(item.client) : item.organization || 'Confidential Client',
      year: item.year ? String(item.year) : new Date().getFullYear().toString(),
      duration: item.duration ? String(item.duration) : '3 months',
      thumbnail_url:
        item.thumbnail_url ||
        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
      featured: Boolean(item.featured),
      featured_order: Number(item.featured_order) || 1,
      status: ['PUBLISHED', 'ARCHIVED', 'DRAFT'].includes(item.status) ? item.status : 'DRAFT',
      tags,
      deliverables,
      impact_metrics: impactMetrics,
      seo_title: item.seo_title || `${title} — Aththar Product Design`,
      seo_description: item.seo_description || item.short_description || '',
      og_image: item.og_image || item.thumbnail_url || '',
      content_json: contentBlocks,
    };

    projects.push(project);
  });

  const valid = errors.length === 0 && projects.length > 0;

  return {
    valid,
    errors,
    warnings,
    projects,
    summary: {
      totalProjects: projects.length,
      totalBlocks,
      titles,
    },
  };
}
