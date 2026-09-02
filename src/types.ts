export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ProjectCategory = 'PRODUCT' | 'UX' | 'BUILD' | 'EXPERIMENT' | string;

export type BlockType = 
  | 'heading'
  | 'paragraph'
  | 'link'
  | 'quote'
  | 'image'
  | 'gallery'
  | 'video'
  | 'callout'
  | 'columns'
  | 'table'
  | 'divider'
  | 'code'
  | 'keyMetric'
  | 'userFlow';

export interface ContentBlock {
  id: string;
  type: BlockType;
  level?: 1 | 2 | 3;
  text?: string;
  title?: string;
  author?: string;
  role?: string;
  url?: string;
  alt?: string;
  caption?: string;
  calloutType?: 'insight' | 'decision' | 'highlight' | 'warning' | 'outcome';
  leftTitle?: string;
  leftText?: string;
  rightTitle?: string;
  rightText?: string;
  headers?: string[];
  rows?: string[][];
  code?: string;
  language?: string;
  metricValue?: string;
  metricLabel?: string;
  metricContext?: string;
  images?: Array<{ id: string; url: string; alt: string; caption?: string }>;
  flowSteps?: Array<{ step: string; title: string; description: string }>;
  // Link block fields
  linkText?: string;
  linkUrl?: string;
  linkStyle?: 'primary' | 'secondary' | 'card' | 'ghost';
  linkDescription?: string;
  linkNewTab?: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category: ProjectCategory;
  project_type?: string;
  role: string;
  organization?: string;
  client: string;
  year: string;
  duration: string;
  thumbnail_url: string;
  featured: boolean;
  featured_order: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  tags: string[];
  deliverables?: string[];
  impact_metrics?: Array<{ label: string; value: string }>;
  content_json: ContentBlock[];
}

export interface MediaItem {
  id: string;
  projectId?: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  title?: string;
  name?: string;
  alt_text: string;
  caption?: string;
  width?: number;
  height?: number;
  created_at: string;
  size_kb?: number;
}

export interface SiteSettings {
  name: string;
  title: string;
  headline: string;
  supporting_copy: string;
  metadata_label: string;
  whatsapp_number: string;
  email: string;
  email_subject?: string;
  email_body?: string;
  case_study_email_subject?: string;
  case_study_email_body?: string;
  linkedin_url: string;
  github_url: string;
  location: string;
  availability_status: string;
  bio_intro: string;
  hero_image?: string;
  hero_image_alt?: string;
  hero_image_tag?: string;
  hero_image_badge?: string;
  hero_image_object_fit?: 'cover' | 'contain' | 'fill';
  hero_image_object_position?: string;
  hero_image_aspect_ratio?: string;
  hero_image_crop_zoom?: number;
  hero_image_crop_x?: number;
  hero_image_crop_y?: number;
}

export interface User {
  id: string;
  username: string;
  role: 'admin';
  created_at: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface ExperienceItem {
  id: string;
  category: '01 WORK' | '02 BUILD' | '03 LEARN' | '04 STUDY';
  categoryLabel: string;
  title: string;
  role: string;
  period: string;
  organization: string;
  location?: string;
  description: string;
  highlights: string[];
  metrics?: Array<{ label: string; value: string }>;
  tags?: string[];
  link?: string;
}
