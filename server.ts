import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { initialProjects, initialExperience, initialSiteSettings, initialMedia } from './src/data/seedData';
import { Project, ExperienceItem, SiteSettings, MediaItem, User } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  adminUser: {
    id: string;
    username: string;
    passwordHash: string;
    salt: string;
    role: 'admin';
    created_at: string;
    updated_at: string;
  };
  projects: Project[];
  experience: ExperienceItem[];
  settings: SiteSettings;
  media: MediaItem[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function initializeDb(): DatabaseSchema {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultPasswordHash = hashPassword('AththarPortfolio2026!', defaultSalt);

  const initialDb: DatabaseSchema = {
    adminUser: {
      id: 'admin-1',
      username: 'admin',
      passwordHash: defaultPasswordHash,
      salt: defaultSalt,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    projects: initialProjects,
    experience: initialExperience,
    settings: initialSiteSettings,
    media: initialMedia,
    sessions: {}
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      adminUser: parsed.adminUser || initialDb.adminUser,
      projects: parsed.projects || initialDb.projects,
      experience: parsed.experience || initialDb.experience,
      settings: parsed.settings || initialDb.settings,
      media: parsed.media || initialDb.media,
      sessions: parsed.sessions || {}
    };
  } catch (err) {
    console.error('Error reading db.json, restoring initial database state:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
}

let db: DatabaseSchema = initializeDb();

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

// Authentication Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      saveDb();
    }
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  (req as any).user = { id: db.adminUser.id, username: db.adminUser.username, role: 'admin' };
  next();
}

async function startServer() {
  const app = express();
  
  // Increase payload limit for media uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==========================================
  // AUTH API ROUTES
  // ==========================================

  // Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (username !== db.adminUser.username) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const testHash = hashPassword(password, db.adminUser.salt);
    if (testHash !== db.adminUser.passwordHash) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Generate session token valid for 7 days
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    db.sessions[token] = {
      userId: db.adminUser.id,
      expiresAt
    };
    saveDb();

    res.json({
      token,
      user: {
        id: db.adminUser.id,
        username: db.adminUser.username,
        role: db.adminUser.role,
        created_at: db.adminUser.created_at
      }
    });
  });

  // Get current user session
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false });
    }

    const token = authHeader.split(' ')[1];
    const session = db.sessions[token];

    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: db.adminUser.id,
        username: db.adminUser.username,
        role: db.adminUser.role,
        created_at: db.adminUser.created_at
      }
    });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      delete db.sessions[token];
      saveDb();
    }
    res.json({ success: true });
  });

  // Change Password
  app.post('/api/auth/change-password', authMiddleware, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const currentHash = hashPassword(currentPassword, db.adminUser.salt);
    if (currentHash !== db.adminUser.passwordHash) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    db.adminUser.salt = newSalt;
    db.adminUser.passwordHash = hashPassword(newPassword, newSalt);
    db.adminUser.updated_at = new Date().toISOString();
    saveDb();

    res.json({ success: true, message: 'Password successfully updated.' });
  });

  // ==========================================
  // SETTINGS & PROFILE API ROUTES
  // ==========================================

  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });

  app.put('/api/settings', authMiddleware, (req: Request, res: Response) => {
    db.settings = {
      ...db.settings,
      ...req.body
    };
    saveDb();
    res.json({ success: true, settings: db.settings });
  });

  // ==========================================
  // EXPERIENCE API ROUTES
  // ==========================================

  app.get('/api/experience', (req: Request, res: Response) => {
    res.json(db.experience);
  });

  app.put('/api/experience', authMiddleware, (req: Request, res: Response) => {
    if (Array.isArray(req.body)) {
      db.experience = req.body;
      saveDb();
      return res.json({ success: true, experience: db.experience });
    }
    res.status(400).json({ error: 'Expected an array of experience items.' });
  });

  // ==========================================
  // PROJECTS API ROUTES
  // ==========================================

  // Get Projects (Public gets PUBLISHED only, Admin can request ?status=all)
  app.get('/api/projects', (req: Request, res: Response) => {
    const statusQuery = req.query.status as string;
    const categoryQuery = req.query.category as string;
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = db.sessions[token];
      if (session && session.expiresAt >= Date.now()) {
        isAdmin = true;
      }
    }

    let results = [...db.projects];

    if (!isAdmin || statusQuery !== 'all') {
      results = results.filter(p => p.status === 'PUBLISHED');
    }

    if (categoryQuery && categoryQuery !== 'ALL') {
      results = results.filter(p => p.category === categoryQuery);
    }

    // Sort: featured items first by featured_order, then by year/date descending
    results.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.featured && b.featured) {
        return (a.featured_order || 99) - (b.featured_order || 99);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    res.json(results);
  });

  // Get Single Project by Slug
  app.get('/api/projects/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const isPreview = req.query.preview === 'true';
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const session = db.sessions[token];
      if (session && session.expiresAt >= Date.now()) {
        isAdmin = true;
      }
    }

    const project = db.projects.find(p => p.slug === slug || p.id === slug);

    if (!project) {
      return res.status(404).json({ error: 'This project seems to have disappeared.' });
    }

    if (project.status !== 'PUBLISHED' && !isAdmin && !isPreview) {
      return res.status(404).json({ error: 'This project seems to have disappeared.' });
    }

    res.json(project);
  });

  // Create Project (Admin)
  app.post('/api/projects', authMiddleware, (req: Request, res: Response) => {
    const data = req.body;
    if (!data.title || !data.category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }

    // Generate clean slug
    let baseSlug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (!baseSlug) baseSlug = 'untitled-project';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (db.projects.some(p => p.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      slug: uniqueSlug,
      short_description: data.short_description || '',
      category: data.category || 'PRODUCT',
      project_type: data.project_type || data.category || 'Product Design',
      role: data.role || 'Product Designer',
      organization: data.organization || data.client || 'Confidential',
      client: data.organization || data.client || 'Confidential',
      year: data.year || new Date().getFullYear().toString(),
      duration: data.duration || '3 months',
      thumbnail_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1400&q=80',
      featured: Boolean(data.featured),
      featured_order: data.featured_order || db.projects.filter(p => p.featured).length + 1,
      status: data.status || 'DRAFT',
      created_at: now,
      updated_at: now,
      published_at: data.status === 'PUBLISHED' ? now : undefined,
      seo_title: data.seo_title || `${data.title} — Aththar Product Design`,
      seo_description: data.seo_description || data.short_description,
      og_image: data.og_image || data.thumbnail_url,
      tags: Array.isArray(data.tags) ? data.tags : [],
      deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
      impact_metrics: Array.isArray(data.impact_metrics) ? data.impact_metrics : [],
      content_json: Array.isArray(data.content_json) ? data.content_json : []
    };

    db.projects.unshift(newProject);
    saveDb();

    res.status(201).json(newProject);
  });

  // Update Project (Admin)
  app.put('/api/projects/:id', authMiddleware, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.projects.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const existing = db.projects[index];
    const data = req.body;
    const now = new Date().toISOString();

    let publishedAt = existing.published_at;
    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = now;
    }

    const updated: Project = {
      ...existing,
      ...data,
      id: existing.id,
      updated_at: now,
      published_at: publishedAt
    };

    db.projects[index] = updated;
    saveDb();

    res.json(updated);
  });

  // Delete Project (Admin)
  app.delete('/api/projects/:id', authMiddleware, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.projects.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const deleted = db.projects.splice(index, 1)[0];
    saveDb();

    res.json({ success: true, deletedId: deleted.id });
  });

  // Duplicate Project (Admin)
  app.post('/api/projects/:id/duplicate', authMiddleware, (req: Request, res: Response) => {
    const { id } = req.params;
    const original = db.projects.find(p => p.id === id);

    if (!original) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const now = new Date().toISOString();
    let duplicateSlug = `${original.slug}-copy`;
    let counter = 1;
    while (db.projects.some(p => p.slug === duplicateSlug)) {
      duplicateSlug = `${original.slug}-copy-${counter}`;
      counter++;
    }

    const duplicated: Project = {
      ...original,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${original.title} (Copy)`,
      slug: duplicateSlug,
      status: 'DRAFT',
      featured: false,
      created_at: now,
      updated_at: now,
      published_at: undefined
    };

    db.projects.unshift(duplicated);
    saveDb();

    res.status(201).json(duplicated);
  });

  // Reorder Featured Projects (Admin)
  app.post('/api/projects/reorder-featured', authMiddleware, (req: Request, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array of project IDs.' });
    }

    orderedIds.forEach((id, index) => {
      const proj = db.projects.find(p => p.id === id);
      if (proj) {
        proj.featured_order = index + 1;
        proj.featured = true;
      }
    });

    saveDb();
    res.json({ success: true, projects: db.projects });
  });

  // ==========================================
  // MEDIA MANAGEMENT API ROUTES
  // ==========================================

  app.get('/api/media', authMiddleware, (req: Request, res: Response) => {
    res.json(db.media);
  });

  app.post('/api/media', authMiddleware, (req: Request, res: Response) => {
    const data = req.body;
    if (!data.url) {
      return res.status(400).json({ error: 'Media URL or Data is required.' });
    }

    const newMedia: MediaItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      projectId: data.projectId,
      type: data.type || (data.url.endsWith('.mp4') || data.url.endsWith('.webm') ? 'video' : 'image'),
      url: data.url,
      title: data.title || data.name || data.alt_text || 'Visual Asset',
      name: data.name || data.title || data.alt_text || 'Visual Asset',
      alt_text: data.alt_text || data.title || data.name || 'Portfolio visual asset',
      caption: data.caption || '',
      width: data.width || 1200,
      height: data.height || 800,
      created_at: new Date().toISOString(),
      size_kb: data.size_kb || 250
    };

    db.media.unshift(newMedia);
    saveDb();

    res.status(201).json(newMedia);
  });

  app.put('/api/media/:id', authMiddleware, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.media.findIndex(m => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Media asset not found.' });
    }

    const previousMedia = { ...db.media[index] };
    const data = req.body;

    const newTitle = data.title !== undefined ? data.title : (data.name !== undefined ? data.name : previousMedia.title || previousMedia.name || previousMedia.alt_text);
    const newName = data.name !== undefined ? data.name : (data.title !== undefined ? data.title : previousMedia.name || previousMedia.title || previousMedia.alt_text);

    const updatedMedia: MediaItem = {
      ...previousMedia,
      title: newTitle,
      name: newName,
      alt_text: data.alt_text !== undefined ? data.alt_text : previousMedia.alt_text,
      caption: data.caption !== undefined ? data.caption : previousMedia.caption,
      url: data.url !== undefined && data.url.trim() ? data.url.trim() : previousMedia.url,
      type: data.type || previousMedia.type,
      width: data.width || previousMedia.width,
      height: data.height || previousMedia.height,
      size_kb: data.size_kb || previousMedia.size_kb
    };

    db.media[index] = updatedMedia;

    // Adapt safely across case studies & settings if URL or metadata changed
    const oldUrl = previousMedia.url;
    const newUrl = updatedMedia.url;
    const oldAlt = previousMedia.alt_text;
    const newAlt = updatedMedia.alt_text;
    const newCaption = updatedMedia.caption;

    if (Array.isArray(db.projects)) {
      db.projects.forEach(project => {
        let projectModified = false;

        if (project.thumbnail_url === oldUrl && newUrl !== oldUrl) {
          project.thumbnail_url = newUrl;
          projectModified = true;
        }

        if (project.og_image === oldUrl && newUrl !== oldUrl) {
          project.og_image = newUrl;
          projectModified = true;
        }

        if (Array.isArray(project.content_json)) {
          project.content_json.forEach(block => {
            if (block.type === 'image' && (block.url === oldUrl || block.url === newUrl)) {
              if (newUrl !== oldUrl) block.url = newUrl;
              if (newAlt && (!block.alt || block.alt === oldAlt)) block.alt = newAlt;
              if (newCaption !== undefined) block.caption = newCaption;
              projectModified = true;
            } else if (block.type === 'video' && (block.url === oldUrl || block.url === newUrl)) {
              if (newUrl !== oldUrl) block.url = newUrl;
              projectModified = true;
            } else if (block.type === 'gallery' && Array.isArray(block.images)) {
              block.images.forEach(img => {
                if (img.url === oldUrl || img.url === newUrl) {
                  if (newUrl !== oldUrl) img.url = newUrl;
                  if (newAlt && (!img.alt || img.alt === oldAlt)) img.alt = newAlt;
                  if (newCaption !== undefined) img.caption = newCaption;
                  projectModified = true;
                }
              });
            }
          });
        }

        if (projectModified) {
          project.updated_at = new Date().toISOString();
        }
      });
    }

    if (db.settings) {
      if (db.settings.hero_image === oldUrl && newUrl !== oldUrl) {
        db.settings.hero_image = newUrl;
      }
      if (db.settings.hero_image_alt === oldAlt && newAlt) {
        db.settings.hero_image_alt = newAlt;
      }
    }

    saveDb();
    res.json(updatedMedia);
  });

  app.delete('/api/media/:id', authMiddleware, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.media.findIndex(m => m.id === id);
    if (index !== -1) {
      db.media.splice(index, 1);
      saveDb();
    }
    res.json({ success: true });
  });

  // Reset database to initial seed (Admin)
  app.post('/api/reset-data', authMiddleware, (req: Request, res: Response) => {
    db.projects = initialProjects;
    db.experience = initialExperience;
    db.settings = initialSiteSettings;
    db.media = initialMedia;
    saveDb();
    res.json({ success: true, message: 'Database reset to initial sample showcase data.' });
  });

  // Export Full Database (db.json) (Admin)
  app.get('/api/database/export', (req: Request, res: Response) => {
    // Check auth from Bearer header or ?token= query param
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : (req.query.token as string);

    if (!token || !db.sessions[token] || db.sessions[token].expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Unauthorized. Valid admin token required.' });
    }

    const exportPayload = {
      schemaVersion: '1.0',
      exportDate: new Date().toISOString(),
      source: 'Aththar Portfolio CMS Database (db.json)',
      database: {
        projects: db.projects || [],
        experience: db.experience || [],
        settings: db.settings || initialSiteSettings,
        media: db.media || []
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="db.json"');
    res.json(exportPayload);
  });

  // Restore Full Database from JSON (Admin)
  app.post('/api/database/restore', authMiddleware, (req: Request, res: Response) => {
    const rawPayload = req.body;
    if (!rawPayload || typeof rawPayload !== 'object') {
      return res.status(400).json({ error: 'Invalid database payload' });
    }

    // Support both wrapped export format and direct db schema
    const targetDb = rawPayload.database || rawPayload;

    if (Array.isArray(targetDb.projects)) {
      db.projects = targetDb.projects;
    }
    if (Array.isArray(targetDb.experience)) {
      db.experience = targetDb.experience;
    }
    if (targetDb.settings && typeof targetDb.settings === 'object') {
      db.settings = { ...initialSiteSettings, ...targetDb.settings };
    }
    if (Array.isArray(targetDb.media)) {
      db.media = targetDb.media;
    }

    saveDb();

    res.json({
      success: true,
      message: 'Database successfully restored.',
      counts: {
        projects: db.projects.length,
        experience: db.experience.length,
        media: db.media.length
      }
    });
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
  });

  // ==========================================
  // VITE & STATIC SPA SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
