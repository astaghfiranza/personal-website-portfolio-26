export interface LocalImageAsset {
  path: string;
  label: string;
  description: string;
}

export const LOCAL_HERO_ASSETS: LocalImageAsset[] = [
  {
    path: '/images/hero-default.webp',
    label: 'Warm Precision Studio (Default)',
    description: 'Physical architecture and warm tone design studio showcase',
  },
  {
    path: '/images/hero-minimal.webp',
    label: 'Minimal Studio Space',
    description: 'Clean architectural light and structured minimal interior',
  },
  {
    path: '/images/hero-workspace.webp',
    label: 'Digital Architecture & Code',
    description: 'High-density computational workspace, screens, and hardware',
  },
];

export const LOCAL_PROJECT_THUMBNAILS: LocalImageAsset[] = [
  {
    path: '/images/projects/project-1.webp',
    label: 'Mambu Radar (Odor Telemetry)',
    description: 'Citizen sensory reporting and spatial telemetry',
  },
  {
    path: '/images/projects/project-2.webp',
    label: 'Hexacode Enterprise Core',
    description: 'Enterprise operations, analytics, and SaaS dashboard',
  },
  {
    path: '/images/projects/project-3.webp',
    label: 'Cilcoffee Artisanal UX',
    description: 'Sensory coffee workflow and digital ordering experience',
  },
  {
    path: '/images/projects/project-4.webp',
    label: 'Urban Transit Pulse',
    description: 'Rapid public transit and multimodal passenger telemetry',
  },
  {
    path: '/images/projects/project-5.webp',
    label: 'Spatial Micro-CAD',
    description: 'Generative CAD geometry and precision modeling',
  },
  {
    path: '/images/projects/project-6.webp',
    label: 'Public Policy Analytics',
    description: 'Legislative telemetry, metrics, and policy analysis',
  },
  {
    path: '/images/projects/project-default.webp',
    label: 'Clean Portfolio Display',
    description: 'Neutral design system and display layout',
  },
];

const LOCAL_HERO_KEY = 'ath_local_hero_asset';
const LOCAL_PROJECT_THUMB_KEY_PREFIX = 'ath_local_thumb_';

export function getSavedLocalHero(): string {
  if (typeof window === 'undefined') return LOCAL_HERO_ASSETS[0].path;
  return localStorage.getItem(LOCAL_HERO_KEY) || LOCAL_HERO_ASSETS[0].path;
}

export function saveLocalHero(path: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_HERO_KEY, path);
}

export function getSavedProjectThumbnail(slugOrId: string): string | null {
  if (typeof window === 'undefined' || !slugOrId) return null;
  return localStorage.getItem(`${LOCAL_PROJECT_THUMB_KEY_PREFIX}${slugOrId}`);
}

export function saveProjectThumbnail(slugOrId: string, path: string): void {
  if (typeof window === 'undefined' || !slugOrId) return;
  localStorage.setItem(`${LOCAL_PROJECT_THUMB_KEY_PREFIX}${slugOrId}`, path);
}
