import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SECRET_KEY is missing');
}

const supabase = createClient(url, key);

const { data, error } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1);

if (error) {
    throw error;
}

console.log('Supabase connection: OK');
console.log('site_settings query: OK');
console.log('Rows found:', data?.length ?? 0);

const { data: buckets, error: bucketError } =
    await supabase.storage.listBuckets();

if (bucketError) {
    throw bucketError;
}

const bucket = buckets?.find(
    (item) => item.name === 'project-images'
);

if (!bucket) {
    throw new Error(
        'Bucket "project-images" was not found'
    );
}

console.log('Storage bucket "project-images": OK');
console.log('Public:', bucket.public);