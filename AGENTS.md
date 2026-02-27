# AGENTS.md

Guide for AI agents working in the Reqflow repository.

---

## Project Overview

**Reqflow** is a SaaS procurement management platform with two main components:

| Directory | Purpose | Tech Stack |
|-----------|---------|------------|
| `/app` | Main Next.js application | Next.js 16, React 19, TypeScript, tRPC, Drizzle ORM |
| `/SWARM` | AI agent orchestration system | Python, LangGraph, LangChain |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Docker/OrbStack (for local PostgreSQL + Redis)
- Python 3.11+ (for SWARM development)

### Main App (`/app`)

```bash
cd app

# Install dependencies
npm install

# Start Docker services (PostgreSQL + Redis)
make up

# Push database schema
npm run db:push

# Start development server
npm run dev

# Open http://localhost:3000
```

### SWARM System (`/SWARM`)

```bash
cd SWARM

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows

# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest
```

---

## Essential Commands

### Main App (`/app`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:push` | Push schema directly to database |
| `npm run db:studio` | Open Drizzle Studio (GUI) |
| `make up` | Start Docker containers (Postgres + Redis) |
| `make down` | Stop Docker containers |
| `make logs` | View container logs |
| `make clean` | Stop containers and remove volumes |

### SWARM (`/SWARM`)

| Command | Purpose |
|---------|---------|
| `pytest` | Run tests |
| `ruff check .` | Lint Python code |
| `ruff format .` | Format Python code |

---

## Architecture

### Main App (`/app`)

```
app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth-related pages (login, signup)
│   │   ├── api/                # API routes (tRPC, webhooks)
│   │   ├── dashboard/          # Protected dashboard pages
│   │   ├── onboarding/         # User onboarding wizard
│   │   └── [marketing-pages]   # Public marketing pages
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (button, card, etc.)
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── layout/             # Layout components (nav, sidebar)
│   │   ├── marketing/          # Marketing page components
│   │   └── forms/              # Form components
│   │
│   └── lib/
│       ├── api/                # tRPC routers and client
│       │   ├── routers/        # Domain routers (requests, budgets, etc.)
│       │   ├── root.ts         # Root router combining all routers
│       │   └── trpc.ts         # tRPC setup with procedures
│       │
│       ├── auth/               # Authentication (session, verification)
│       ├── db/                 # Drizzle ORM
│       │   ├── schema/         # Database schemas (20+ tables)
│       │   └── index.ts        # DB client export
│       │
│       ├── queue/              # BullMQ job queues
│       ├── workflows/          # Business logic workflows
│       ├── integrations/       # External service integrations
│       ├── monitoring/         # Logging, Sentry, audit
│       ├── security/           # Rate limiting, validation
│       └── env.ts              # Environment variable validation
│
├── drizzle/                    # Migration files
├── docker-compose.yml          # PostgreSQL + Redis
└── Makefile                    # Development convenience commands
```

### SWARM (`/SWARM`)

```
SWARM/
├── agents/                     # Agent definitions (12 main agents)
├── core/                       # Core orchestration logic
├── tools/                      # Agent tools/capabilities
├── workflows/                  # Workflow definitions
├── graph_agents/               # LangGraph agent implementations
├── graph_workflows/            # LangGraph workflow definitions
├── skills/                     # Reusable skill modules
├── specs/                      # Specification templates
├── templates/                  # Output templates
├── tests/                      # Test suite
└── config/                     # Configuration files
```

---

## Technology Stack

### Frontend (`/app`)
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend (`/app`)
- **API**: tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom session-based auth with JWT
- **Queue**: BullMQ + Redis (Upstash)
- **Email**: Resend
- **Storage**: Cloudflare R2
- **Monitoring**: Sentry + Axiom

### SWARM (`/SWARM`)
- **Framework**: LangGraph + LangChain
- **Models**: OpenAI, Anthropic Claude (via LiteLLM)
- **Validation**: Pydantic

---

## Code Patterns

### tRPC Routers (`/app/src/lib/api/routers/`)

```typescript
// Pattern: Domain-based router with protectedProcedure
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const exampleRouter = router({
  // Query with input validation
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      // Always filter by tenantId for multi-tenancy
      return ctx.db.query.examples.findMany({
        where: eq(examples.tenantId, ctx.tenantId),
        limit: input.limit,
      });
    }),

  // Mutation with audit logging
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const [record] = await ctx.db.insert(examples).values({
        ...input,
        tenantId: ctx.tenantId,
      }).returning();

      await createAuditLog({ /* ... */ });
      return record;
    }),
});
```

### Procedure Types (`/app/src/lib/api/trpc.ts`)
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authentication + rate limiting
- `adminProcedure` - Requires admin role
- `financeProcedure` - Requires finance or admin role

### Database Schema (`/app/src/lib/db/schema/`)

```typescript
// Pattern: Multi-tenant table with tenantId
export const examples = pgTable("examples", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => organizations.id),
  // ... other fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for Drizzle query builder
export const examplesRelations = relations(examples, ({ one, many }) => ({
  tenant: one(organizations, {
    fields: [examples.tenantId],
    references: [organizations.id],
  }),
}));
```

### UI Components (`/app/src/components/ui/`)

shadcn/ui components with Tailwind CSS:
- Use `cn()` from `@/lib/utils` for class merging
- Components use CVA (class-variance-authority) for variants
- Import from `@/components/ui/[component]`

```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">Click me</Button>
```

### Environment Variables (`/app/src/lib/env.ts`)

All environment variables are validated with Zod using `@t3-oss/env-nextjs`:
- Server vars: No prefix, validated at build time
- Client vars: Must have `NEXT_PUBLIC_` prefix
- Optional vars: Use `.optional()` in schema

---

## Database Schema

### Core Tables (Phase 1)
| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant organizations (tenants) |
| `users` | Users with RBAC roles |
| `departments` | Department hierarchy |
| `budgets` | Budget allocations |
| `requests` | Purchase requests |
| `approvals` | Approval records |
| `approval_workflows` | Workflow definitions |
| `audit_logs` | Append-only audit trail |

### Connected Data Model (Phase 2)
| Table | Purpose |
|-------|---------|
| `vendors` | Vendor identity and compliance |
| `contracts` | Contract terms and notice deadlines |
| `subscriptions` | Tool subscriptions and ownership |
| `invoices` | Invoice matching and variance detection |
| `trials` | Trial tracking with success criteria |
| `renewal_events` | Renewal workflow and readiness scoring |

### Key Patterns
- **Multi-tenancy**: All tables have `tenant_id`, enforced at API layer
- **Audit trail**: `audit_logs` and `auth_events` are append-only (no UPDATE/DELETE)
- **Soft deletes**: Not implemented - use audit logs for history

---

## Middleware & Auth

### Route Protection (`/app/src/middleware.ts`)

| Route Pattern | Protection |
|---------------|------------|
| `/dashboard/*` | Requires authentication + completed onboarding |
| `/onboarding/*` | Requires authentication, redirects if completed |
| `/login`, `/signup` | Redirects to dashboard if authenticated |
| `/api/trpc/*` | Handled by tRPC procedures |
| Marketing pages | Public |

### Session Management
- Cookie-based sessions (`reqflow_session`)
- Session verification in middleware
- Onboarding completion tracked in session

---

## Testing

### Main App
No test framework is currently configured. When adding tests:
- Recommended: Vitest + Testing Library
- Place tests alongside source files: `Component.test.tsx`

### SWARM
```bash
cd SWARM
pytest                    # Run all tests
pytest tests/specific.py  # Run specific test file
```

---

## Important Gotchas

### Multi-Tenancy
- **ALWAYS** filter queries by `ctx.tenantId` in tRPC procedures
- Tenant isolation is enforced at the API layer, not database level
- Never trust client-provided tenant data

### Rate Limiting
- Queries: 100/minute per user
- Mutations: 20/minute per user
- Applied automatically via `protectedProcedure`

### Database Migrations
- Development: Use `npm run db:push` (direct schema push)
- Production: Use `npm run db:generate` + `npm run db:migrate`

### Environment Variables
- Copy `.env.example` to `.env.local` for local development
- Never commit `.env.local` or `.env`
- Required vars will fail build if missing (unless `SKIP_ENV_VALIDATION=1`)

### Docker Services
- PostgreSQL: `localhost:5432` (user: postgres, db: reqflow)
- Redis: `localhost:6379` (no auth)
- Use `make up` to start, `make down` to stop

### shadcn/ui
- Config: `components.json` (new-york style, slate base)
- Add components: `npx shadcn@latest add [component]`
- Components auto-import from `@/components/ui/`

---

## Design System

### Colors (App)
- **Primary**: `blue-600` (#2563EB) - CTAs, links
- **Text**: `slate-900` (primary), `slate-600` (secondary)
- **Backgrounds**: `slate-50`, `slate-100`

### Colors (Marketing)
- **Warm backgrounds**: `warm-50` (#FFF9F5), `warm-100` (#FEF8F0)
- Alternating sections: warm → white → warm

### Typography
- **Font**: Manrope (400, 500, 600)
- **Classes**: `text-hero`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`

### Spacing
- Section padding: `py-12` (mobile) → `py-24` (xl)
- Container max-width: 1280px (default), 800px (narrow), 1440px (wide)

---

## SWARM Agent System

The `/SWARM` directory contains a hierarchical multi-agent orchestration system for AI-assisted development.

### Architecture
```
User → @swarm-lead → [12 Main Agents] → [53 Subagents] → Result
```

### Main Agents
| Agent | Role |
|-------|------|
| `@swarm-lead` | Team Lead - your only interface |
| `@swarm-frontend` | Frontend Lead |
| `@swarm-backend` | Backend Engineer |
| `@swarm-dev` | Full-Stack Developer |
| `@swarm-qa` | QA/Test Engineer |
| `@swarm-arch` | Software Architect |
| `@swarm-ops` | DevOps Engineer |
| `@swarm-ux` | UX/Product Designer |
| `@swarm-pm` | Product Manager |
| `@swarm-data` | Data Analyst |
| `@swarm-sec` | Security Engineer |
| `@swarm-analyst` | Debug/RCA |

### Key Files
- `SWARM/AGENTS.md` - Agent quick reference
- `SWARM/README.md` - System overview
- `SWARM/SWARM_PROTOCOL.md` - Master protocol
- `SWARM/SWARM_GUIDELINES.md` - Non-negotiable principles

---

## File References

| What | Where |
|------|-------|
| tRPC setup | `/app/src/lib/api/trpc.ts` |
| Root router | `/app/src/lib/api/root.ts` |
| Database client | `/app/src/lib/db/index.ts` |
| Schema index | `/app/src/lib/db/schema/index.ts` |
| Environment vars | `/app/src/lib/env.ts` |
| Middleware | `/app/src/middleware.ts` |
| Auth session | `/app/src/lib/auth/session.ts` |
| Design system | `/app/DESIGN_SYSTEM.md` |
| Development guide | `/app/DEVELOPMENT.md` |
| Implementation status | `/app/IMPLEMENTATION_STATUS.md` |

---

## Common Tasks

### Adding a New API Endpoint
1. Create or edit router in `/app/src/lib/api/routers/`
2. Use appropriate procedure (`protectedProcedure`, `adminProcedure`, etc.)
3. Add router to `/app/src/lib/api/root.ts`
4. Always include `tenantId` filtering

### Adding a New Database Table
1. Create schema file in `/app/src/lib/db/schema/`
2. Export from `/app/src/lib/db/schema/index.ts`
3. Run `npm run db:push` to sync schema
4. Add relations if needed

### Adding a New UI Component
1. For shadcn components: `npx shadcn@latest add [component]`
2. For custom components: Create in `/app/src/components/[domain]/`
3. Use `cn()` for class merging, follow existing patterns

### Adding a New Page
1. Create directory in `/app/src/app/`
2. Add `page.tsx` for the route
3. For protected pages, verify middleware coverage

---

*Last updated: 2026-02-27*
