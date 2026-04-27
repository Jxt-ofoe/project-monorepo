import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const sqlPath = path.join(__dirname, 'migrations', '0000_spooky_chat.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

  console.log(`Applying ${statements.length} migration statements...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
      console.log(`  [${i + 1}/${statements.length}] ✓`);
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log(`  [${i + 1}/${statements.length}] ⚠ already exists`);
      } else {
        console.error(`  [${i + 1}/${statements.length}] ✗ ${e.message}`);
      }
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});

