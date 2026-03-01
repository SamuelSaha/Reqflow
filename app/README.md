# Reqflow — Procurement Software for Small Teams

Procurement workflow application for teams of 5-50 people. Track SaaS spend, catch duplicates, never miss renewals.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Drizzle ORM, PostgreSQL, tRPC, BullMQ, Better Auth

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis (for background jobs)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reqflow

# Auth
AUTH_SECRET=<generate-random-32-char-string>
AUTH_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=Reqflow <notifications@reqflow.com>

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# File Storage (Cloudflare R2)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=reqflow-files

# Integrations (optional)
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...
XERO_CLIENT_ID=...
XERO_CLIENT_SECRET=...
```

### Installation

```bash
npm install
npm run db:push          # Push schema to database
npm run dev              # Start development server
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## MCP Server — AI-Powered Procurement Workflow

Reqflow includes a **Model Context Protocol (MCP) server** that exposes procurement workflows to AI assistants like Claude Desktop, Cursor, and other MCP-compatible clients.

### What is MCP?

MCP (Model Context Protocol) allows AI assistants to interact with external services through well-defined tools. Think of it as an API for AI — instead of clicking through the web UI, you can manage procurement through natural language conversations.

### Available Tools

The Reqflow MCP server provides 10 tools:

| Tool | Description | Type |
|------|-------------|------|
| `reqflow_list_requests` | Search/filter purchase requests by status, vendor, category, urgency | Read |
| `reqflow_get_request` | Get full request details with approval chain | Read |
| `reqflow_create_request` | Create a draft purchase request | Write |
| `reqflow_submit_request` | Submit draft for approval workflow | Write |
| `reqflow_list_pending_approvals` | Get approval queue for current user | Read |
| `reqflow_approve_request` | Approve request with optional comments | Write |
| `reqflow_reject_request` | Reject request (reason required) | Write |
| `reqflow_get_spend_summary` | Spend analytics by dept/category/vendor/month | Read |
| `reqflow_list_subscriptions` | List active SaaS subscriptions with costs | Read |
| `reqflow_get_budget_status` | Budget utilization per department | Read |

### Setup with Claude Desktop

1. **Find your Claude Desktop config file:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

2. **Add the Reqflow MCP server:**

```json
{
  "mcpServers": {
    "reqflow": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/absolute/path/to/Reqflow/app",
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/reqflow",
        "REQFLOW_USER_EMAIL": "your-email@company.com"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test it:**
   - Open a new conversation in Claude Desktop
   - Look for the 🔌 icon (MCP tools connected)
   - Ask: "Show me my pending approvals"

### Manual Testing

You can test the MCP server directly from the terminal:

```bash
cd app
DATABASE_URL=... REQFLOW_USER_EMAIL=your@email.com npm run mcp
```

The server will start in stdio mode, waiting for MCP protocol messages on stdin.

### Example Conversations

```
User: "What approvals are waiting for me?"
→ Lists all pending approvals with amounts, requesters, urgency

User: "Show me our SaaS spend this quarter"
→ Breaks down approved spend by category for last 90 days

User: "Create a request for GitHub Copilot Business, $19/month per seat, 10 seats"
→ Creates draft request REQ-2026-0042
→ "Submit it for approval"
→ Routes to appropriate approver

User: "Approve the Figma request"
→ Finds Figma in pending queue
→ Updates approval
→ Checks if all approvals complete
→ Updates request status if ready
```

### Architecture

The MCP server:
- Runs as a standalone process (stdio transport)
- Connects directly to PostgreSQL using Drizzle ORM
- Authenticates via `REQFLOW_USER_EMAIL` (looks up user at startup)
- Enforces tenant isolation on all queries
- Uses the same database schema as the web app

**Security:**
- All operations respect user permissions and tenant boundaries
- Write operations (approve/reject) verify the user owns the approval
- Read operations are scoped to the user's tenant

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code with ESLint
npm run type-check   # Check TypeScript types
npm run mcp          # Start MCP server (stdio mode)

# Database
npm run db:generate  # Generate migration from schema changes
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema directly (dev only)
npm run db:studio    # Open Drizzle Studio
```

---

## Project Structure

```
app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Auth pages (login, register)
│   │   ├── (marketing)/  # Public pages (landing, pricing)
│   │   ├── dashboard/    # Protected app pages
│   │   └── api/          # API routes (tRPC, webhooks)
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── dashboard/    # Dashboard-specific components
│   ├── lib/
│   │   ├── api/          # tRPC routers and procedures
│   │   ├── db/           # Drizzle ORM (schema, migrations)
│   │   ├── auth/         # Better Auth configuration
│   │   ├── email/        # Email templates (React Email)
│   │   ├── integrations/ # QuickBooks, Xero, Slack integrations
│   │   ├── monitoring/   # Sentry, Axiom logging
│   │   └── security/     # Rate limiting, CSRF, RLS
│   └── mcp/
│       └── server.ts     # MCP server (AI integration)
├── public/               # Static assets
├── drizzle/              # Database migrations
└── scripts/              # Utility scripts
```

---

## Key Features

### Procurement Workflow
- Create purchase requests with AI-powered duplicate detection
- Multi-step approval routing with conditional logic
- Budget tracking and enforcement
- Vendor management and compliance tiers

### "Connected Record" Model
- Request → Subscription conversion (one-click)
- Subscription → Contract linking
- Contract → Invoice tracking
- Full audit trail from request to payment

### Integrations
- **Accounting:** QuickBooks, Xero (automatic PO sync)
- **Communication:** Slack (approval notifications)
- **AI:** Claude (request analysis, duplicate detection)

### Security
- Row-level security (tenant isolation at database level)
- CSRF protection on all mutations
- Rate limiting (100 queries/min, 20 mutations/min)
- Field-level encryption for sensitive data
- Comprehensive audit logging

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
- [Better Auth Documentation](https://better-auth.com)

---

## Deployment

See [docs/DEPLOYMENT_PLAN.md](./docs/DEPLOYMENT_PLAN.md) for production deployment guide.

**Quick Deploy:**
1. Set up PostgreSQL and Redis instances
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Build: `npm run build`
5. Start: `npm run start`

**Recommended Platform:** Vercel (Next.js) + Neon (PostgreSQL) + Upstash (Redis)
