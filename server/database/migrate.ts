import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').join(__dirname, '../.env') });

import fs from 'fs';
import path from 'path';
import pool from '../config/db';

async function migrate() {
  console.log('[Migrate] Connecting to database...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Migrate] Applying schema...');
    await pool.query(schema);
    console.log('[Migrate] Schema applied successfully.');
  } catch (err: any) {
    console.error('[Migrate] Error applying schema:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
