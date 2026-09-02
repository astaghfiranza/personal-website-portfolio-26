import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const BUCKET = 'project-images';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local'
    );
}

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

function isBase64DataUrl(value: unknown): value is string {
    return typeof value === 'string' &&
        /^data:[^;]+;base64,/.test(value);
}

function parseDataUrl(dataUrl: string) {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

    if (!match) {
        throw new Error('Invalid Base64 data URL');
    }

    return {
        mimeType: match[1],
        buffer: Buffer.from(match[2], 'base64'),
    };
}

function extensionFromMimeType(mimeType: string) {
    const extensions: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
    };

    return extensions[mimeType] ?? 'bin';
}

function sha256(buffer: Buffer) {
    return crypto
        .createHash('sha256')
        .update(buffer)
        .digest('hex');
}

function storageUrl(storagePath: string) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

const raw = fs.readFileSync(DB_FILE, 'utf8');
const db = JSON.parse(raw);

const uploadedByHash = new Map<string, string>();

let base64References = 0;
let uploadedFiles = 0;
let deduplicatedReferences = 0;
let externalUrls = 0;

async function migrateImage(
    value: unknown,
    folder: string
): Promise<unknown> {
    if (!isBase64DataUrl(value)) {
        if (
            typeof value === 'string' &&
            value.startsWith('http')
        ) {
            externalUrls++;
        }

        return value;
    }

    base64References++;

    const { mimeType, buffer } = parseDataUrl(value);
    const hash = sha256(buffer);

    const existing = uploadedByHash.get(hash);

    if (existing) {
        deduplicatedReferences++;
        return existing;
    }

    const extension = extensionFromMimeType(mimeType);

    const storagePath =
        `${folder}/${hash}.${extension}`;

    console.log(`Uploading ${storagePath}`);

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: false,
        });

    if (
        error &&
        !error.message.toLowerCase().includes('already exists')
    ) {
        throw error;
    }

    const url = storageUrl(storagePath);

    uploadedByHash.set(hash, url);
    uploadedFiles++;

    return url;
}

async function transformContent(
    value: any,
    projectSlug: string
): Promise<any> {
    if (isBase64DataUrl(value)) {
        return migrateImage(
            value,
            `projects/${projectSlug}/content`
        );
    }

    if (Array.isArray(value)) {
        return Promise.all(
            value.map((item) =>
                transformContent(item, projectSlug)
            )
        );
    }

    if (value && typeof value === 'object') {
        const result: Record<string, any> = {};

        for (const [key, child] of Object.entries(value)) {
            if (
                key === 'url' ||
                key === 'thumbnail_url'
            ) {
                result[key] = await migrateImage(
                    child,
                    `projects/${projectSlug}/content`
                );
            } else {
                result[key] = await transformContent(
                    child,
                    projectSlug
                );
            }
        }

        return result;
    }

    return value;
}

console.log('');
console.log('================================');
console.log(' SUPABASE DATA MIGRATION');
console.log('================================');
console.log('');

//
// SETTINGS
//

console.log('Migrating settings...');

const heroImage = await migrateImage(
    db.settings.hero_image,
    'site/hero'
);

const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert({
        id: 'default',
        name: db.settings.name,
        title: db.settings.title,
        headline: db.settings.headline,
        supporting_copy: db.settings.supporting_copy,
        metadata_label: db.settings.metadata_label,
        whatsapp_number: db.settings.whatsapp_number,
        email: db.settings.email,
        email_subject: db.settings.email_subject,
        email_body: db.settings.email_body,
        case_study_email_subject:
            db.settings.case_study_email_subject,
        case_study_email_body:
            db.settings.case_study_email_body,
        linkedin_url: db.settings.linkedin_url,
        github_url: db.settings.github_url,
        location: db.settings.location,
        availability_status:
            db.settings.availability_status,
        bio_intro: db.settings.bio_intro,
        hero_image: heroImage,
        hero_image_alt: db.settings.hero_image_alt,
        hero_image_tag: db.settings.hero_image_tag,
        hero_image_badge: db.settings.hero_image_badge,
        hero_image_object_fit:
            db.settings.hero_image_object_fit,
        hero_image_object_position:
            db.settings.hero_image_object_position,
        hero_image_crop_x:
            db.settings.hero_image_crop_x,
        hero_image_crop_y:
            db.settings.hero_image_crop_y,
    });

if (settingsError) throw settingsError;

console.log('✓ Settings migrated');
console.log('');

//
// PROJECTS
//

console.log('Migrating projects...');

for (const project of db.projects ?? []) {
    console.log(`→ ${project.title}`);

    const content = await transformContent(
        project.content_json ?? [],
        project.slug ?? project.id
    );

    const thumbnail = await migrateImage(
        project.thumbnail_url,
        `projects/${project.slug}/thumbnail`
    );

    const ogImage = await migrateImage(
        project.og_image,
        `projects/${project.slug}/og`
    );

    const { error } = await supabase
        .from('projects')
        .upsert({
            id: project.id,
            title: project.title,
            slug: project.slug,
            short_description:
                project.short_description,
            category: project.category,
            project_type: project.project_type,
            role: project.role,
            organization: project.organization,
            client: project.client,
            year: project.year,
            duration: project.duration,
            thumbnail_url: thumbnail,
            featured: project.featured ?? false,
            featured_order:
                project.featured_order ?? 1,
            status: project.status ?? 'DRAFT',
            seo_title: project.seo_title,
            seo_description:
                project.seo_description,
            og_image: ogImage,
            tags: project.tags ?? [],
            deliverables:
                project.deliverables ?? [],
            impact_metrics:
                project.impact_metrics ?? [],
            content_json: content,
            published_at:
                project.published_at ?? null,
        });

    if (error) {
        throw new Error(
            `Project "${project.title}" failed: ${error.message}`
        );
    }
}

console.log('✓ Projects migrated');
console.log('');

//
// EXPERIENCE
//

console.log('Migrating experience...');

for (
    let i = 0;
    i < (db.experience ?? []).length;
    i++
) {
    const item = db.experience[i];

    const { error } = await supabase
        .from('experience')
        .upsert({
            id: item.id,
            category: item.category,
            category_label: item.categoryLabel,
            title: item.title,
            role: item.role,
            period: item.period,
            organization: item.organization,
            location: item.location,
            description: item.description,
            highlights: item.highlights ?? [],
            metrics: item.metrics ?? [],
            tags: item.tags ?? [],
            link: item.link,
            sort_order: i,
        });

    if (error) {
        throw new Error(
            `Experience "${item.title}" failed: ${error.message}`
        );
    }
}

console.log('✓ Experience migrated');
console.log('');

//
// MEDIA
//

console.log('Migrating media...');

for (const media of db.media ?? []) {
    const url = await migrateImage(
        media.url,
        'media'
    );

    const thumbnailUrl = await migrateImage(
        media.thumbnail_url,
        'media/thumbnails'
    );

    const { error } = await supabase
        .from('media_assets')
        .upsert({
            id: media.id,
            project_id: media.projectId ?? null,
            type: media.type ?? 'image',
            url,
            storage_path: null,
            thumbnail_url: thumbnailUrl,
            title: media.title,
            name: media.name,
            alt_text: media.alt_text,
            caption: media.caption,
            width: media.width,
            height: media.height,
            size_kb: media.size_kb,
        });

    if (error) {
        throw new Error(
            `Media "${media.id}" failed: ${error.message}`
        );
    }
}

console.log('✓ Media migrated');
console.log('');

//
// REPORT
//

console.log('================================');
console.log(' MIGRATION COMPLETE');
console.log('================================');
console.log('');
console.log(
    `Base64 references: ${base64References}`
);
console.log(
    `Files uploaded: ${uploadedFiles}`
);
console.log(
    `Deduplicated: ${deduplicatedReferences}`
);
console.log(
    `External URLs: ${externalUrls}`
);
console.log('');
console.log('db.json was NOT modified.');
console.log('');