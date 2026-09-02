import { Project, ExperienceItem, SiteSettings, MediaItem, ProjectCategory, ProjectStatus } from '../types';

const TOKEN_KEY = 'aththar_portfolio_admin_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Projects API
export async function fetchProjects(status: 'all' | 'published' = 'published', category?: string): Promise<Project[]> {
  try {
    const params = new URLSearchParams();
    if (status === 'all') params.append('status', 'all');
    if (category && category !== 'ALL') params.append('category', category);

    const url = `/api/projects?${params.toString()}`;
    const res = await fetch(url, { headers: getHeaders(status === 'all') });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch (err) {
    console.error('Error fetching projects:', err);
    throw err;
  }
}

export async function fetchProjectBySlug(slug: string, isPreview = false): Promise<Project> {
  try {
    const url = `/api/projects/${encodeURIComponent(slug)}${isPreview ? '?preview=true' : ''}`;
    const res = await fetch(url, { headers: getHeaders(isPreview) });
    if (!res.ok) {
      if (res.status === 404) throw new Error('This project seems to have disappeared.');
      throw new Error('Failed to load project details.');
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching project by slug:', err);
    throw err;
  }
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create project');
  }
  return await res.json();
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update project');
  }
  return await res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function duplicateProject(id: string): Promise<Project> {
  const res = await fetch(`/api/projects/${id}/duplicate`, {
    method: 'POST',
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to duplicate project');
  return await res.json();
}

export async function reorderFeaturedProjects(orderedIds: string[]): Promise<void> {
  const res = await fetch('/api/projects/reorder-featured', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw new Error('Failed to reorder featured projects');
}

// Experience API
export async function fetchExperience(): Promise<ExperienceItem[]> {
  try {
    const res = await fetch('/api/experience');
    if (!res.ok) throw new Error('Failed to fetch experience items');
    return await res.json();
  } catch (err) {
    console.error('Error fetching experience:', err);
    throw err;
  }
}

export async function updateExperience(items: ExperienceItem[]): Promise<void> {
  const res = await fetch('/api/experience', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error('Failed to update experience items');
}

// Settings API
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return await res.json();
  } catch (err) {
    console.error('Error fetching settings:', err);
    throw err;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update site settings');
}

// Media API
export async function fetchMedia(): Promise<MediaItem[]> {
  const res = await fetch('/api/media', { headers: getHeaders(true) });
  if (!res.ok) throw new Error('Failed to fetch media assets');
  return await res.json();
}

export async function uploadMedia(data: Partial<MediaItem>): Promise<MediaItem> {
  const res = await fetch('/api/media', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to upload media asset');
  return await res.json();
}

export async function updateMedia(id: string, data: Partial<MediaItem>): Promise<MediaItem> {
  const res = await fetch(`/api/media/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update media asset metadata');
  return await res.json();
}

export async function deleteMedia(id: string): Promise<void> {
  const res = await fetch(`/api/media/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to delete media asset');
}

// Auth API
export async function checkAuth(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/me', { headers: getHeaders(true) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function login(username: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Invalid credentials');
  }
  const data = await res.json();
  setAuthToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders(true),
    });
  } finally {
    removeAuthToken();
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update password');
  }
}

export async function resetDatabaseToDefault(): Promise<void> {
  const res = await fetch('/api/reset-data', {
    method: 'POST',
    headers: getHeaders(true),
  });
  if (!res.ok) throw new Error('Failed to reset database');
}

export async function exportFullDatabaseJson(): Promise<any> {
  const token = getAuthToken();
  const res = await fetch(`/api/database/export?token=${token || ''}`, {
    headers: getHeaders(true),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to export database');
  }
  return await res.json();
}

export async function restoreFullDatabaseJson(data: any): Promise<any> {
  const res = await fetch('/api/database/restore', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to restore database');
  }
  return await res.json();
}
