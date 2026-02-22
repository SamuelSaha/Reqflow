---
name: Zero Trust Implementation
description: Defense-in-depth security patterns for web applications
version: 1.0.0
primary_agents: [swarm-sec, swarm-dev, swarm-architect]
---

# 🛡️ Zero Trust Implementation Skill

> **ACTIVATION:** Trust nothing. Verify everything. Every layer, every time.

---

## 🎯 Core Principles

1. **Never Trust, Always Verify** — Every request is potentially hostile
2. **Least Privilege** — Minimum access required for the task
3. **Assume Breach** — Design as if attackers are already inside
4. **Defense in Depth** — Multiple layers of security

---

## 🔐 AUTHENTICATION LAYERS

### Layer 1: Client-Side (Warning Only)
```typescript
// ⚠️ Client-side auth is for UX only, NEVER for security
'use client'

export function ProtectedButton() {
  const { user } = useAuth()
  
  // This prevents button from showing, but doesn't protect the action
  if (!user) return null
  
  return <button onClick={sensitiveAction}>Do Thing</button>
}
```

### Layer 2: Middleware (Gate)
```typescript
// middleware.ts — First line of defense
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
```

### Layer 3: Server Action (Actual Security)
```typescript
// This is where security ACTUALLY happens
'use server'

export async function sensitiveAction(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verify user exists
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // 2. Verify user has permission (RBAC)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    throw new Error('Forbidden')
  }
  
  // 3. NOW perform the action
  // ...
}
```

### Layer 4: Database (RLS — The Real Wall)
```sql
-- Even if all other layers fail, RLS stops the attack
CREATE POLICY "Users can only access own data"
  ON public.sensitive_data
  USING (auth.uid() = user_id);
```

---

## 🔑 SESSION MANAGEMENT

### Secure Session Configuration
```typescript
// lib/supabase/config.ts
export const supabaseConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',  // ALWAYS use PKCE for OAuth
  },
  cookies: {
    name: 'sb-auth',
    lifetime: 60 * 60 * 24 * 7, // 7 days
    domain: process.env.COOKIE_DOMAIN,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}
```

### Session Validation
```typescript
// ALWAYS use getUser(), NEVER trust getSession() alone
async function validateSession() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // getUser() makes a request to Supabase to verify the token
  // getSession() only reads from cookies (can be forged)
  
  if (error || !user) {
    throw new Error('Invalid session')
  }
  
  return user
}
```

---

## 🛡️ INPUT VALIDATION

### The Zod Wall
```typescript
// lib/validations/order.ts
import { z } from 'zod'

export const CreateOrderSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number()
    .int('Quantity must be whole number')
    .positive('Quantity must be positive')
    .max(100, 'Maximum 100 items per order'),
  notes: z.string()
    .max(500, 'Notes too long')
    .optional()
    .transform(val => val?.trim()),
})

// In Server Action
export async function createOrder(formData: FormData) {
  const raw = {
    productId: formData.get('productId'),
    quantity: Number(formData.get('quantity')),
    notes: formData.get('notes'),
  }
  
  const result = CreateOrderSchema.safeParse(raw)
  
  if (!result.success) {
    return { 
      error: 'Validation failed', 
      details: result.error.flatten() 
    }
  }
  
  // ONLY use result.data from here
  const { productId, quantity, notes } = result.data
}
```

### SQL Injection Prevention
```typescript
// ❌ NEVER do this
const { data } = await supabase
  .from('products')
  .select()
  .filter('name', 'eq', userInput) // Direct user input = vulnerability

// ✅ Supabase client handles escaping, but validate anyway
const validatedInput = ProductNameSchema.parse(userInput)
const { data } = await supabase
  .from('products')
  .select()
  .eq('name', validatedInput)
```

---

## 🚫 RATE LIMITING

### API Route Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
})

// In API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success, limit, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      },
    })
  }
  
  // Process request
}
```

---

## 🔒 SECRETS MANAGEMENT

### Environment Variables
```bash
# .env.local (NEVER commit)
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin key - server only
STRIPE_SECRET_KEY=sk_live_...     # Server only

# .env (can commit - public values)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Safe for client
```

### Exposing Secrets Prevention
```typescript
// ❌ This exposes the secret to the client
'use client'
const secret = process.env.STRIPE_SECRET_KEY // undefined in client

// ✅ Secrets only accessible in server code
'use server'
const secret = process.env.STRIPE_SECRET_KEY // works
```

---

## 🔍 AUDIT LOGGING

### Critical Actions Logging
```typescript
// lib/audit.ts
interface AuditLog {
  userId: string
  action: string
  resource: string
  resourceId: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

export async function logAuditEvent(event: AuditLog) {
  const supabase = await createClient()
  
  await supabase.from('audit_logs').insert({
    ...event,
    created_at: new Date().toISOString(),
  })
}

// Usage in sensitive operations
export async function deleteAccount(userId: string) {
  await logAuditEvent({
    userId,
    action: 'DELETE_ACCOUNT',
    resource: 'users',
    resourceId: userId,
    metadata: { reason: 'user_requested' },
  })
  
  // Perform deletion
}
```

---

## ⚠️ COMMON VULNERABILITIES

### XSS Prevention
```typescript
// ❌ NEVER render user HTML directly
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Use a sanitizer if HTML is required
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ Best: Don't render HTML at all
<div>{userContent}</div>
```

### CSRF Protection
```typescript
// Next.js Server Actions have built-in CSRF protection
// The action is tied to the origin, preventing cross-site requests

// For API routes, verify origin
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
    return new Response('Forbidden', { status: 403 })
  }
}
```

---

## ✅ SECURITY CHECKLIST

Before shipping:

- [ ] All forms use Server Actions (not client fetches)
- [ ] All inputs validated with Zod
- [ ] RLS enabled on all tables
- [ ] getUser() used instead of getSession()
- [ ] No secrets in client code
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for sensitive actions
- [ ] CORS headers configured correctly
- [ ] CSP headers set
- [ ] No inline scripts (`onclick`, etc.)
- [ ] Dependencies scanned for vulnerabilities
