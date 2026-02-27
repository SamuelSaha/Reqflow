# Database Migration Required

## Request Templates Feature

A new table `request_templates` has been added to the schema.

### To apply the migration:

```bash
# Generate the migration
npm run db:generate

# Apply the migration
npm run db:push

# Or use migrate command if you prefer
npm run db:migrate
```

### What was added:

- **Table:** `request_templates`
- **Columns:**
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, foreign key to organizations)
  - `name` (text, not null)
  - `description` (text, nullable)
  - `created_by_id` (uuid, foreign key to users)
  - `template_data` (jsonb, not null) - stores form field values
  - `is_public` (boolean, default false)
  - `use_count` (integer, default 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Indexes:**
  - `request_templates_tenant_idx` on `tenant_id`
  - `request_templates_creator_idx` on `created_by_id`
  - `request_templates_public_idx` on `is_public`
  - `request_templates_use_count_idx` on `use_count`

### Testing the feature:

1. Create a new request and fill out the form
2. Click "Save as Template"
3. Fill out template name and optionally make it public
4. Save the template
5. Start a new request and click "Use Template"
6. Select your saved template
7. Form should pre-fill with template data
8. Submit the request
9. The template's use count should increment

### API Endpoints Added:

- `templates.list` - Get user's + public org templates
- `templates.get` - Get single template by ID
- `templates.create` - Save new template
- `templates.update` - Update existing template
- `templates.delete` - Delete template
- `templates.incrementUseCount` - Track template usage
