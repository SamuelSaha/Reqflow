---
name: Supabase Mastery
description: Complete Supabase expertise including RLS, Edge Functions, Realtime, and Auth patterns
version: 1.0.0
primary_agents: [swarm-dev, swarm-architect, swarm-sec]
---

# 🔐 Supabase Mastery Skill

> **ACTIVATION:** This skill transforms any agent into a Supabase expert with zero hallucinations.

---

## 🎯 Core Competencies

1. **Row Level Security (RLS)** — Bulletproof data isolation
2. **Edge Functions** — Deno-based serverless logic
3. **Realtime** — Live subscriptions and presence
4. **Auth** — Session management, PKCE, OAuth providers
5. **Storage** — Bucket policies and transformations
6. **Database** — Postgres optimization and migrations

---

## 🛡️ RLS PROTOCOLS

### The Golden Rule
```sql
-- EVERY table with user data MUST have RLS enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ALWAYS create explicit policies, never rely on defaults
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy Patterns

#### 1. User Ownership
```sql
-- For tables where users own their own records
CREATE POLICY "owner_select" ON public.{table}
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_insert" ON public.{table}
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update" ON public.{table}
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "owner_delete" ON public.{table}
  FOR DELETE USING (auth.uid() = user_id);
```

#### 2. Organization Multi-Tenancy
```sql
-- For SaaS with org-based access
CREATE POLICY "org_member_access" ON public.{table}
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM public.org_members 
      WHERE user_id = auth.uid()
    )
  );
```

#### 3. Role-Based Access (Admin Pattern)
```sql
-- Check user role from profiles table
CREATE POLICY "admin_full_access" ON public.{table}
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### ❌ ANTI-PATTERNS
- **NEVER** use `USING (true)` in production
- **NEVER** disable RLS for "convenience"
- **NEVER** trust client-side role claims

---

## ⚡ EDGE FUNCTIONS

### Standard Template
```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create authenticated client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Your logic here
    const result = { message: 'Success', userId: user.id }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### Environment Variables
```bash
# Available in all Edge Functions
SUPABASE_URL          # Project URL
SUPABASE_ANON_KEY     # Public anon key
SUPABASE_SERVICE_ROLE_KEY  # Admin key (use sparingly)
```

---

## 🔄 REALTIME

### Subscription Pattern
```typescript
// Subscribe to user's own records only
const channel = supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${user.id}`,
    },
    (payload) => {
      console.log('Change received!', payload)
      handleOrderChange(payload)
    }
  )
  .subscribe()

// ALWAYS unsubscribe on cleanup
return () => {
  supabase.removeChannel(channel)
}
```

### Presence (for collaborative features)
```typescript
const channel = supabase.channel('room-1')

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', Object.keys(state).length)
})

channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({ user_id: user.id, online_at: new Date().toISOString() })
  }
})
```

---

## 🔑 AUTH PATTERNS

### Server-Side Session (Next.js App Router)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Protected Route Pattern
```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

---

## 📊 DATABASE OPTIMIZATION

### Index Patterns
```sql
-- For RLS policies that filter by user_id
CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- For queries with multiple conditions
CREATE INDEX idx_orders_user_status ON public.orders(user_id, status);

-- For text search
CREATE INDEX idx_products_name_search ON public.products 
  USING gin(to_tsvector('english', name));
```

### Query Optimization
```sql
-- Use EXPLAIN ANALYZE to check query plans
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 'xxx';

-- Avoid N+1 with proper joins
SELECT o.*, p.name as product_name
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.user_id = auth.uid();
```

---

## ✅ VERIFICATION CHECKLIST

Before declaring Supabase work "done":

- [ ] RLS enabled on all tables with user data
- [ ] Policies tested for SELECT, INSERT, UPDATE, DELETE
- [ ] Indexes added for RLS filter columns
- [ ] Edge Functions have CORS headers
- [ ] Auth tokens validated server-side
- [ ] Service role key NOT exposed to client
- [ ] Realtime subscriptions have cleanup
- [ ] Migrations are idempotent
