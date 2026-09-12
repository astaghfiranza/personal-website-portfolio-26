import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { projects as existingProjects } from '../src/data/data.ts';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.'
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.resolve(process.cwd(), 'src/data/data.ts');
const BACKUP_FILE = path.resolve(process.cwd(), 'src/data/data.backup.ts');

function serialize(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

function mapExperience(item: any) {
    return {
        id: item.id,
        category: item.category,
        categoryLabel: item.category_label,
        title: item.title,
        role: item.role,
        period: item.period,
        organization: item.organization,
        location: item.location,
        description: item.description,
        highlights: item.highlights ?? [],
        metrics: item.metrics ?? [],
        tags: item.tags ?? [],
        link: item.link ?? '',
    };
}

function mapProject(item: any, existingProject?: any) {
    // Preserve local thumbnail from data.ts.
    // Supabase thumbnail_url will NOT overwrite it.
    const localThumbnail =
        existingProject?.local_thumbnail_url ||
        existingProject?.thumbnail ||
        existingProject?.thumbnail_url ||
        '';

    return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        short_description: item.short_description ?? '',
        category: item.category,
        project_type: item.project_type,
        role: item.role,
        organization: item.organization,
        client: item.client ?? '',
        year: item.year ?? '',
        duration: item.duration ?? '',

        // Local/static image only
        thumbnail_url: localThumbnail,
        local_thumbnail_url: localThumbnail,
        thumbnail: localThumbnail,

        featured: item.featured ?? false,
        featured_order: item.featured_order ?? 0,
        status: item.status,

        tags: item.tags ?? [],
        deliverables: item.deliverables ?? [],
        tools: item.tools ?? [],
        impact_metrics: item.impact_metrics ?? [],

        // IMPORTANT:
        // content_json intentionally excluded.
        // Case Study content is fetched directly from Supabase.
    };
}

async function createBackup(content: string) {
    try {
        await fs.access(BACKUP_FILE);

        console.log('Backup already exists. Keeping existing backup.');
    } catch {
        await fs.writeFile(BACKUP_FILE, content, 'utf-8');
        console.log(`Backup created: ${BACKUP_FILE}`);
    }
}

async function writeDataFile(
    projects: any[],
    experience: any[]
) {
    const content = await fs.readFile(DATA_FILE, 'utf-8');

    await createBackup(content);

    const experienceBlock = `export const experience: ExperienceItem[] = ${serialize(
        experience
    )};`;

    const projectsBlock = `export const projects: Project[] = ${serialize(
        projects
    )};`;

    const experienceStart = content.indexOf(
        'export const experience: ExperienceItem[] ='
    );

    const projectsStart = content.indexOf(
        'export const projects: Project[] ='
    );

    const mediaStart = content.indexOf(
        'export const media: MediaItem[] ='
    );

    if (
        experienceStart === -1 ||
        projectsStart === -1 ||
        mediaStart === -1
    ) {
        throw new Error(
            'Could not find experience/projects/media blocks in data.ts'
        );
    }

    const beforeExperience = content.slice(0, experienceStart);
    const afterProjects = content.slice(mediaStart);

    const newContent =
        beforeExperience +
        experienceBlock +
        '\n\n' +
        projectsBlock +
        '\n\n' +
        afterProjects;

    await fs.writeFile(DATA_FILE, newContent, 'utf-8');

    console.log(`Updated: ${DATA_FILE}`);
}

async function main() {
    console.log('Starting data sync...\n');

    // --------------------------------------------------
    // PROJECTS
    // --------------------------------------------------

    const {
        data: projects,
        error: projectsError,
    } = await supabase
        .from('projects')
        .select(`
      id,
      title,
      slug,
      short_description,
      category,
      project_type,
      role,
      organization,
      client,
      year,
      duration,
      thumbnail_url,
      featured,
      featured_order,
      status,
      tags,
      tools,
      deliverables,
      impact_metrics
    `)
        .order('featured_order', { ascending: true });

    if (projectsError) {
        throw projectsError;
    }

    // --------------------------------------------------
    // EXPERIENCE
    // --------------------------------------------------

    const {
        data: experience,
        error: experienceError,
    } = await supabase
        .from('experience')
        .select(`
      id,
      category,
      category_label,
      title,
      role,
      period,
      organization,
      location,
      description,
      highlights,
      metrics,
      tags,
      link,
      sort_order
    `)
        .order('sort_order', { ascending: true });

    if (experienceError) {
        throw experienceError;
    }

    if (!projects || !experience) {
        throw new Error('Supabase returned empty data.');
    }

    // --------------------------------------------------
    // MAP DATA
    // --------------------------------------------------

    const mappedProjects = projects.map((project) => {
        const existingProject = existingProjects.find(
            (existing) => existing.id === project.id
        );

        return mapProject(project, existingProject);
    });

    const mappedExperience = experience.map(mapExperience);

    console.log(`Projects fetched: ${mappedProjects.length}`);
    console.log(`Experience fetched: ${mappedExperience.length}`);

    // --------------------------------------------------
    // WRITE
    // --------------------------------------------------

    await writeDataFile(
        mappedProjects,
        mappedExperience
    );

    console.log('\nSync complete.');
}

main().catch((error) => {
    console.error('\nSync failed:');
    console.error(error);

    process.exit(1);
});