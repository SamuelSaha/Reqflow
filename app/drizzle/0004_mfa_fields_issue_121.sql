ALTER TABLE "users" ADD COLUMN "mfa_secret" text;
ALTER TABLE "users" ADD COLUMN "mfa_backup_codes" jsonb DEFAULT '[]';
