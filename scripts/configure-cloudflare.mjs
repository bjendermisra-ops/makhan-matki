import { writeFileSync } from 'node:fs';
const databaseId = process.env.D1_DATABASE_ID;
if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(databaseId || '')) throw new Error('Set D1_DATABASE_ID to your Cloudflare D1 database UUID.');
const name = process.env.WORKER_NAME || 'makhan-matki';
if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(name)) throw new Error('Invalid WORKER_NAME.');
writeFileSync('wrangler.external.json', JSON.stringify({
 name, main: 'deploy/worker.mjs', compatibility_date: '2026-05-15',
 assets: { directory: './public', binding: 'ASSETS', run_worker_first: true },
 d1_databases: [{binding:'DB', database_name:'makhan-matki-db', database_id:databaseId, migrations_dir:'drizzle'}],
 triggers: { crons: ['17 * * * *'] }
}, null, 2));
console.log('Prepared wrangler.external.json. No API token is written to disk.');
