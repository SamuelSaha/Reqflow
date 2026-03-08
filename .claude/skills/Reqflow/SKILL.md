# Reqflow Development Patterns

> Auto-generated skill from repository analysis

## Overview

Reqflow is a JavaScript-based application built with modern web technologies including Next.js, TypeScript, and Drizzle ORM. The codebase follows a structured approach with emphasis on type safety, database migrations, authentication, and user experience. The application features a dashboard interface with marketing pages and robust API endpoints, all built with strong TypeScript patterns and comprehensive error handling.

## Coding Conventions

### File Naming
- Use **camelCase** for file names
- Component files use `.tsx` extension
- Utility files use `.ts` extension
- Test files follow `*.test.ts` pattern

### Import/Export Style
- Mixed import styles (both named and default imports)
- Prefer default exports for components
- Use barrel exports in index files

### Code Organization
```typescript
// Typical file structure
app/
├── src/
│   ├── lib/          // Utilities and core logic
│   ├── components/   // Reusable UI components
│   ├── app/         // Next.js app router pages
│   └── middleware.ts // Route middleware
├── drizzle/         // Database migrations
└── docs/           // Feature documentation
```

## Workflows

### Database Schema Changes
**Trigger:** When someone needs to add new data structures to the database
**Command:** `/new-table`

1. Create Drizzle migration SQL file in `app/drizzle/`
2. Update schema TypeScript files in `app/src/lib/db/schema/`
3. Update schema index exports in `app/src/lib/db/schema/index.ts`
4. Update meta journal if needed in `app/drizzle/meta/_journal.json`

```sql
-- Example migration file: 0001_add_users_table.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fix Production Issues
**Trigger:** When production deployment fails or critical bugs are discovered
**Command:** `/fix-prod-issue`

1. Identify root cause through logs and error reports
2. Fix code/configuration in affected files
3. Apply type safety improvements to prevent similar issues
4. Verify with tests before deployment

Common files involved:
- `app/src/lib/auth/*.ts` - Authentication issues
- `app/src/middleware.ts` - Routing problems
- `app/src/app/*/page.tsx` - Page-level bugs
- `package.json` - Dependency conflicts

### Marketing Page Refinement
**Trigger:** When marketing content or UX needs improvement
**Command:** `/update-marketing`

1. Update marketing components in `app/src/components/marketing/`
2. Refine copy and messaging for clarity
3. Maintain brand consistency across pages
4. Optimize for conversion with better CTAs

### Dashboard Empty States
**Trigger:** When dashboard pages need better UX for empty or loading states
**Command:** `/improve-empty-states`

1. Replace skeleton loaders with contextual empty states
2. Add `loading.tsx` and `error.tsx` boundaries
3. Create contextual CTAs that guide user actions
4. Add proper error handling with recovery options

```tsx
// Example empty state component
export default function EmptyProjectsState() {
  return (
    <div className="text-center py-12">
      <h3>No projects yet</h3>
      <p>Get started by creating your first project</p>
      <Button href="/dashboard/projects/new">
        Create Project
      </Button>
    </div>
  );
}
```

### API Route Enhancement
**Trigger:** When new API functionality is needed or existing endpoints need fixes
**Command:** `/new-api-endpoint`

1. Create or update API route in `app/src/app/api/`
2. Add proper error handling with try-catch blocks
3. Implement validation for request parameters
4. Add rate limiting if needed for sensitive endpoints

```typescript
// Example API route structure
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validation logic
    // Business logic
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### TypeScript Quality Fixes
**Trigger:** When code has TypeScript any types or type safety issues
**Command:** `/fix-types`

1. Identify `any` types or type errors in the codebase
2. Create proper interfaces and type definitions
3. Replace with typed alternatives
4. Verify type-check passes with `tsc --noEmit`

### Authentication Security Improvements
**Trigger:** When auth flows need improvement or security vulnerabilities are found
**Command:** `/enhance-auth`

1. Update auth logic in `app/src/lib/auth/`
2. Add security measures (rate limiting, validation)
3. Update middleware for proper route protection
4. Fix session handling and token management

### Feature Documentation
**Trigger:** When implementing complex features that need documentation
**Command:** `/document-feature`

1. Create comprehensive markdown docs in `app/docs/`
2. Include implementation guides with code examples
3. Add troubleshooting sections for common issues
4. Document best practices and patterns

## Testing Patterns

Tests are written using **Vitest** framework with the following conventions:
- Test files use `*.test.ts` pattern
- Focus on unit tests for utilities and integration tests for API routes
- Mock external dependencies appropriately
- Use descriptive test names that explain the scenario

```typescript
// Example test structure
import { describe, it, expect } from 'vitest';
import { validateUser } from '../lib/validation';

describe('validateUser', () => {
  it('should return true for valid user data', () => {
    const validUser = { email: 'test@example.com', name: 'Test User' };
    expect(validateUser(validUser)).toBe(true);
  });
});
```

## Commands

| Command | Purpose |
|---------|---------|
| `/new-table` | Create new database table with migration and schema updates |
| `/fix-prod-issue` | Resolve critical production bugs and deployment issues |
| `/update-marketing` | Refine marketing pages and improve conversion messaging |
| `/improve-empty-states` | Add better UX for dashboard empty and loading states |
| `/new-api-endpoint` | Create or enhance API routes with proper error handling |
| `/fix-types` | Improve TypeScript type safety by removing any types |
| `/enhance-auth` | Strengthen authentication and security features |
| `/document-feature` | Create comprehensive documentation for new features |