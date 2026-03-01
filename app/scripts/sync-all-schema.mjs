import { config } from 'dotenv';
import pg from 'pg';

// Load .env.local
config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function syncSchema() {
  const client = await pool.connect();

  try {
    console.log('🔄 Syncing all missing schema tables...\n');

    // Create categories table
    console.log('1. Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "description" text,
        "color" text DEFAULT '#3B82F6' NOT NULL,
        "icon" text DEFAULT 'tag',
        "gl_account_code" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "is_system" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ Categories table created\n');

    // Create request_templates table
    console.log('2. Creating request_templates table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "request_templates" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "description" text,
        "created_by_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "template_data" jsonb NOT NULL,
        "is_public" boolean DEFAULT false NOT NULL,
        "use_count" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "request_templates_tenant_idx" ON "request_templates" ("tenant_id");
      CREATE INDEX IF NOT EXISTS "request_templates_creator_idx" ON "request_templates" ("created_by_id");
      CREATE INDEX IF NOT EXISTS "request_templates_public_idx" ON "request_templates" ("is_public");
      CREATE INDEX IF NOT EXISTS "request_templates_use_count_idx" ON "request_templates" ("use_count");
    `);
    console.log('   ✓ Request templates table created\n');

    // Create verification_tokens table
    console.log('3. Creating verification_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" text NOT NULL UNIQUE,
        "email" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ Verification tokens table created\n');

    // Create oauth_states table
    console.log('4. Creating oauth_states table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "oauth_states" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "provider" text NOT NULL,
        "state" text NOT NULL UNIQUE,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('   ✓ OAuth states table created\n');

    // Add category_id to requests if it doesn't exist
    console.log('5. Adding category_id to requests table...');
    await client.query(`
      ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "category_id" uuid REFERENCES "categories"("id") ON DELETE SET NULL;
    `);

    // Make category column nullable
    await client.query(`
      ALTER TABLE "requests" ALTER COLUMN "category" DROP NOT NULL;
    `).catch(() => console.log('   (category already nullable)'));

    console.log('   ✓ Requests table updated\n');

    console.log('✅ All schema tables synced successfully!\n');
    console.log('Database is now up to date with the codebase schema.');

  } catch (error) {
    if (error.code === '42P07') {
      console.log('\n⚠️  Tables already exist - schema already synced!');
    } else {
      console.error('\n❌ Schema sync failed:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

syncSchema().catch(console.error);
