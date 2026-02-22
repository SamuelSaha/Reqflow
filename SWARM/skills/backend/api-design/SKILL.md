---
name: API Design Mastery
description: REST, GraphQL, and tRPC patterns for scalable, type-safe APIs
version: 1.0.0
primary_agents: [swarm-dev, swarm-arch]
---

# 🔌 API Design Mastery Skill

> **ACTIVATION:** APIs are contracts. Design them to survive 10x scale and 5 years of evolution.

---

## 🎯 Core Principles

1. **Contract First** — Define the interface before implementation
2. **Version Explicitly** — Never break existing clients
3. **Type Safety** — Runtime validation with Zod/io-ts
4. **Documentation Auto-Generated** — OpenAPI from code, not hand-written
5. **Idempotency** — Safe retries for all mutations

---

## 🏗️ API Paradigm Selection

| Paradigm | Use When | Trade-off |
|----------|----------|-----------|
| **REST** | Public APIs, caching, CDN-friendly | Multiple round-trips |
| **GraphQL** | Complex data graphs, mobile apps | Caching complexity |
| **tRPC** | TypeScript monorepo, internal APIs | TypeScript-only |
| **gRPC** | Microservices, high throughput | HTTP/2 required |
| **WebSocket** | Real-time, bidirectional | Connection overhead |

### Decision Matrix

```typescript
function selectAPIParadigm(context: APIContext): APIType {
  if (context.clientDiversity === 'high') return 'REST'      // Universal support
  if (context.dataComplexity === 'high') return 'GraphQL'   // Flexible queries
  if (context.typeScriptOnly) return 'tRPC'                // End-to-end types
  if (context.realTimeRequired) return 'WebSocket'         // Live updates
  if (context.microservices) return 'gRPC'                 // Binary protocol
  return 'REST' // Default
}
```

---

## 📐 REST API Patterns

### Resource Naming

```typescript
// ❌ BAD — Verbs in URL, inconsistent pluralization
GET /getUserData/123
POST /createOrder
DELETE /removeProduct/456

// ✅ GOOD — Nouns, plural collections, HTTP verbs for actions
GET /users/123
POST /orders
DELETE /products/456

// ✅ Complex relationships
GET /users/123/orders          // User's orders
GET /orders/456/items          // Order items
GET /products/789/reviews      // Product reviews
```

### HTTP Status Codes (Use Correctly)

| Code | Use For | Don't Use For |
|------|---------|---------------|
| 200 | Success | Everything |
| 201 | Created | Generic success |
| 204 | No content (delete) | Empty error |
| 400 | Bad request (client error) | Server errors |
| 401 | Unauthorized (need auth) | Forbidden |
| 403 | Forbidden (no permission) | Not found |
| 404 | Not found | Validation errors |
| 409 | Conflict (duplicate, state) | Generic error |
| 422 | Validation failed | 400 |
| 429 | Rate limited | 503 |
| 500 | Server error | Client errors |
| 503 | Service unavailable | Rate limiting |

### Error Response Format

```typescript
// ✅ Standard error format
interface APIError {
  error: {
    code: string;           // Machine-readable: "INVALID_EMAIL"
    message: string;        // Human-readable: "Email format is invalid"
    details?: Array<{
      field: string;
      message: string;
    }>;
    requestId: string;      // For tracing
  }
}

// Example
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "age", "message": "Must be at least 18" }
    ],
    "requestId": "req_abc123"
  }
}
```

### Pagination Patterns

```typescript
// ✅ Cursor-based (preferred for infinite scroll)
GET /users?cursor=eyJpZCI6MTAwfQ&limit=20

interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;  // Null when no more data
  hasMore: boolean;
}

// ✅ Offset-based (for jump-to-page UIs)
GET /users?page=3&perPage=20

interface OffsetPaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    perPage: number;
  }
}
```

---

## 🕸️ GraphQL Patterns

### Schema Design

```graphql
# ✅ Use nullable for fields that might not exist
type User {
  id: ID!
  email: String!
  name: String           # Can be null if user hasn't set name
  avatar: String         # Can be null
  createdAt: DateTime!
}

# ✅ Input types for mutations
input CreateUserInput {
  email: String!
  name: String
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

### N+1 Problem Solution

```typescript
// ❌ BAD — N+1 queries
const resolvers = {
  Query: {
    posts: () => db.posts.findAll(),
  },
  Post: {
    author: (post) => db.users.findById(post.authorId), // Called N times
  },
}

// ✅ GOOD — DataLoader pattern
import DataLoader from 'dataloader'

const userLoader = new DataLoader(async (userIds) => {
  const users = await db.users.findMany({
    where: { id: { in: userIds } }
  })
  return userIds.map(id => users.find(u => u.id === id))
})

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.authorId), // Batched automatically
  },
}
```

---

## ⚡ tRPC Patterns

### Router Definition

```typescript
// ✅ Type-safe procedure definitions
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const appRouter = t.router({
  // Query (read)
  userById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.users.findById(input.id)
    }),

  // Mutation (write)
  createUser: t.procedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(2),
    }))
    .mutation(({ input }) => {
      return db.users.create(input)
    }),
})

export type AppRouter = typeof appRouter
```

### Client Usage

```typescript
// ✅ Fully typed client
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from './server'

const trpc = createTRPCReact<AppRouter>()

// In component — all types inferred
function UserProfile({ userId }: { userId: string }) {
  const { data } = trpc.userById.useQuery({ id: userId })
  // data is fully typed as User | undefined
  
  const createUser = trpc.createUser.useMutation()
  // createUser.mutate expects { email: string, name: string }
}
```

---

## 🔒 API Security Patterns

### Rate Limiting

```typescript
// ✅ Tiered rate limits
const rateLimits = {
  public: { windowMs: 60000, maxRequests: 30 },
  authenticated: { windowMs: 60000, maxRequests: 100 },
  premium: { windowMs: 60000, maxRequests: 1000 },
}

// Implementation with Redis
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
})

export async function middleware(req: Request) {
  const identifier = getUserId(req) || getIP(req)
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return new Response('Rate limited', { status: 429 })
  }
}
```

### Input Validation

```typescript
// ✅ Zod for runtime validation
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(12, 'Password must be 12+ characters'),
  age: z.number().int().min(18, 'Must be 18+'),
  role: z.enum(['user', 'admin']),
})

// Type inference
type CreateUserInput = z.infer<typeof CreateUserSchema>

export async function createUser(req: Request) {
  const body = await req.json()
  const result = CreateUserSchema.safeParse(body)
  
  if (!result.success) {
    return Response.json({
      error: {
        code: 'VALIDATION_FAILED',
        details: result.error.issues,
      }
    }, { status: 400 })
  }
  
  // result.data is fully typed and validated
  return db.users.create(result.data)
}
```

---

## 📋 Versioning Strategies

### URL Path Versioning (Recommended)

```typescript
// ✅ Explicit version in URL
/api/v1/users
/api/v2/users

// Express.js example
const v1Router = express.Router()
v1Router.get('/users', getUsersV1)

const v2Router = express.Router()
v2Router.get('/users', getUsersV2) // Different response format

app.use('/api/v1', v1Router)
app.use('/api/v2', v2Router)
```

### Deprecation Policy

```typescript
// ✅ Mark deprecated endpoints
app.get('/api/v1/users', (req, res) => {
  res.setHeader('Deprecation', 'Sun, 01 Jun 2025 00:00:00 GMT')
  res.setHeader('Sunset', 'Sun, 01 Dec 2025 00:00:00 GMT')
  res.setHeader('Link', '</api/v2/users>; rel="successor-version"')
  
  return getUsersV1(req, res)
})
```

---

## 🔄 Idempotency

### Idempotency Keys

```typescript
// ✅ Ensure safe retries
import { createHash } from 'crypto'

interface IdempotencyStore {
  get(key: string): Promise<{ response: any; status: number } | null>
  set(key: string, value: any, ttl: number): Promise<void>
}

export async function handleIdempotentRequest(
  req: Request,
  handler: () => Promise<Response>,
  store: IdempotencyStore
) {
  const idempotencyKey = req.headers.get('Idempotency-Key')
  
  if (idempotencyKey) {
    // Check for existing response
    const cached = await store.get(idempotencyKey)
    if (cached) {
      return Response.json(cached.response, { status: cached.status })
    }
  }
  
  // Process request
  const response = await handler()
  
  // Cache if idempotency key provided
  if (idempotencyKey && response.ok) {
    const body = await response.clone().json()
    await store.set(idempotencyKey, {
      response: body,
      status: response.status,
    }, 86400) // 24 hour TTL
  }
  
  return response
}
```

---

## 📊 API Documentation

### OpenAPI Generation

```typescript
// ✅ Generate OpenAPI from Zod schemas
import { extendZodWithOpenApi } from 'zod-openapi'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

// Register schema
const UserSchema = z.object({
  id: z.string().openapi({ example: '123' }),
  email: z.string().email().openapi({ example: 'user@example.com' }),
}).openapi('User')

registry.register('User', UserSchema)

// Generate spec
const generator = new OpenApiGeneratorV3(registry.definitions)
const docs = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
})
```

---

## ✅ API Design Checklist

Before shipping any API:

- [ ] Resource naming follows REST conventions
- [ ] HTTP status codes used correctly
- [ ] Error format is consistent and includes requestId
- [ ] Pagination strategy chosen (cursor vs offset)
- [ ] Rate limiting implemented
- [ ] Input validation with Zod (or similar)
- [ ] Idempotency keys for mutations
- [ ] Versioning strategy defined
- [ ] OpenAPI documentation generated
- [ ] CORS configured correctly
- [ ] Authentication/authorization enforced
- [ ] Response times < 200ms (p95)

---

## 🔒 Skill Version

```
Skill: API Design Mastery
Version: 1.0.0
Last Updated: 2026-02-02
Applicable Paradigms: REST, GraphQL, tRPC, gRPC
```
