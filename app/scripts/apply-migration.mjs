import { config } from 'dotenv';
import pg from 'pg';
import fs from 'fs';

// Load .env.local
config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Applying request-to-subscription migration...\n');

    // Read migration file
    const migrationSQL = fs.readFileSync('./drizzle/0002_request_subscription_conversion.sql', 'utf-8');

    // Split by statement breakpoint and filter
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => {
        // Remove comment-only lines but keep SQL
        const lines = s.split('\n')
          .filter(line => line.trim() && !line.trim().startsWith('--'))
          .join('\n');
        return lines.trim();
      })
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 70).replace(/\s+/g, ' ');
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        await client.query(statement);
        console.log(`    ✓ Success\n`);
      } catch (err) {
        if (err.code === '42701' || err.code === '42P07') {
          console.log(`    ⚠️  Already exists - skipping\n`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('\nAdded columns:');
    console.log('  - requests.converted_to_subscription_id');
    console.log('  - subscriptions.source_request_id');
    console.log('\nAdded foreign keys and indexes');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error code:', error.code);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
