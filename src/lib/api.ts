import { supabase } from './supabase';
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
export async function fetchProjects(
  status: 'all' | 'published' = 'published',
  category?: string
): Promise<Project[]> {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .order('featured_order', { ascending: true });

    if (status === 'published') {
      query = query.eq('status', 'PUBLISHED');
    }

    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }

    return data as Project[];
  } catch (err) {
    console.error('Error fetching projects:', err);
    throw err;
  }
}

export async function fetchProjectBySlug(
  slug: string,
  isPreview = false
): Promise<Project> {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .limit(1);

    if (!isPreview) {
      query = query.eq('status', 'PUBLISHED');
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching project by slug:', error);
      throw new Error('Failed to load project details.');
    }

    if (!data) {
      throw new Error('This project seems to have disappeared.');
    }

    return data as Project;
  } catch (err) {
    console.error('Error fetching project by slug:', err);
    throw err;
  }
}

export async function createProject(
  data: Partial<Project>
): Promise<Project> {
  const projectId = `proj-${Date.now()}`;

  const { data: createdProject, error } = await supabase
    .from('projects')
    .insert({
      ...data,
      id: projectId,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw new Error(error.message || 'Failed to create project');
  }

  return createdProject as Project;
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<Project> {
  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw new Error(error.message || 'Failed to update project');
  }

  return updatedProject as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(error.message || 'Failed to delete project');
  }
}

export async function duplicateProject(id: string): Promise<Project> {
  const { data: originalProject, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !originalProject) {
    console.error('Error fetching project to duplicate:', fetchError);
    throw new Error(fetchError?.message || 'Failed to find project');
  }

  const newId = `proj-${Date.now()}`;
  const newSlug = `${originalProject.slug}-copy-${Date.now()}`;

  const duplicatedProject = {
    ...originalProject,
    id: newId,
    slug: newSlug,
    title: `${originalProject.title} (Copy)`,
    status: 'DRAFT',
    published_at: null,
  };

  // Remove database-generated fields
  delete duplicatedProject.created_at;
  delete duplicatedProject.updated_at;

  const { data, error } = await supabase
    .from('projects')
    .insert(duplicatedProject)
    .select('*')
    .single();

  if (error) {
    console.error('Error duplicating project:', error);
    throw new Error(error.message || 'Failed to duplicate project');
  }

  return data as Project;
}

export async function reorderFeaturedProjects(
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('projects')
      .update({ featured_order: i + 1 })
      .eq('id', orderedIds[i]);

    if (error) {
      console.error('Error reordering featured projects:', error);
      throw new Error(error.message || 'Failed to reorder featured projects');
    }
  }
}

// Experience API
export async function fetchExperience(): Promise<ExperienceItem[]> {
  try {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching experience:', error);
      throw new Error('Failed to fetch experience items');
    }

    return data as ExperienceItem[];
  } catch (err) {
    console.error('Error fetching experience:', err);
    throw err;
  }
}

export async function updateExperience(
  items: ExperienceItem[]
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const { error } = await supabase
      .from('experience')
      .update({
        category: item.category,
        category_label: item.categoryLabel,
        title: item.title,
        role: item.role,
        period: item.period,
        organization: item.organization,
        location: item.location,
        description: item.description,
        highlights: item.highlights,
        metrics: item.metrics,
        tags: item.tags,
        link: item.link,
        sort_order: i,
      })
      .eq('id', item.id);

    if (error) {
      console.error('Error updating experience:', error);
      throw new Error(error.message || 'Failed to update experience items');
    }
  }
}
// Settings API
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error) {
      console.error('Error fetching site settings:', error);
      throw new Error('Failed to fetch site settings');
    }

    return data as SiteSettings;
  } catch (err) {
    console.error('Error fetching site settings:', err);
    throw err;
  }
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>
): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .update(settings)
    .eq('id', 'default');

  if (error) {
    console.error('Error updating site settings:', error);
    throw new Error(error.message || 'Failed to update site settings');
  }
}
// Media API
export async function fetchMedia(): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching media:', error);
    throw new Error(error.message || 'Failed to fetch media assets');
  }

  return data as MediaItem[];
}

export async function uploadMedia(
  data: Partial<MediaItem>
): Promise<MediaItem> {
  const { data: createdMedia, error } = await supabase
    .from('media_assets')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    console.error('Error uploading media:', error);
    throw new Error(error.message || 'Failed to upload media asset');
  }

  return createdMedia as MediaItem;
}
export async function updateMedia(
  id: string,
  data: Partial<MediaItem>
): Promise<MediaItem> {
  const { data: updatedMedia, error } = await supabase
    .from('media_assets')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating media:', error);
    throw new Error(error.message || 'Failed to update media asset metadata');
  }

  return updatedMedia as MediaItem;
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting media:', error);
    throw new Error(error.message || 'Failed to delete media asset');
  }
}
// Auth API
export async function checkAuth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return false;
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.session.user.id)
      .maybeSingle();

    return !adminError && !!admin;
  } catch {
    return false;
  }
}

export async function login(
  username: string,
  password: string
): Promise<{ token: string; user: any }> {
  const email = username.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message || 'Invalid credentials');
  }

  return {
    token: data.session.access_token,
    user: data.user,
  };
}

export async function logout(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  } finally {
    removeAuthToken();
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user.email) {
    throw new Error('No active session');
  }

  const email = sessionData.session.user.email;

  // Re-authenticate with current password
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (loginError) {
    throw new Error('Current password is incorrect');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message || 'Failed to update password');
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
