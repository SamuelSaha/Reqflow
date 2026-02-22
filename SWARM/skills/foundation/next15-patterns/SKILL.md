---
name: Next.js 15 Patterns
description: App Router mastery, Server Actions, Streaming, Caching, and performance patterns
version: 1.0.0
primary_agents: [swarm-dev, swarm-arch, swarm-ops]
---

# ⚡ Next.js 15 Patterns Skill

> **ACTIVATION:** This skill provides definitive patterns for Next.js 15 App Router with zero ambiguity.

---

## 🎯 Core Competencies

1. **App Router** — Layouts, Templates, Route Groups
2. **Server Actions** — Form handling, mutations
3. **Data Fetching** — Caching, revalidation, streaming
4. **Performance** — Bundle optimization, lazy loading
5. **Middleware** — Auth, redirects, headers

---

## 📁 PROJECT STRUCTURE

### The Golden Layout
```
app/
├── (auth)/                    # Route group: unauthenticated pages
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/               # Route group: authenticated pages
│   ├── layout.tsx             # Shared sidebar/nav
│   ├── overview/page.tsx
│   └── settings/page.tsx
├── api/                       # API routes (use sparingly)
│   └── webhook/route.ts
├── globals.css
├── layout.tsx                 # Root layout
├── template.tsx               # For page transitions
└── page.tsx                   # Landing page
components/
├── ui/                        # Reusable UI components
└── features/                  # Feature-specific components
lib/
├── supabase/                  # DB client setup
├── utils.ts                   # Pure utility functions
└── validations.ts             # Zod schemas
```

---

## 🔄 LAYOUTS vs TEMPLATES

### ❌ Common Mistake
Using `layout.tsx` for page transitions — layouts **persist** across navigations.

### ✅ The Rule
```
layout.tsx   → Persistent UI (nav, sidebar, providers)
template.tsx → Re-renders on navigation (transitions, animations)
page.tsx     → The actual page content
```

### Example: Page Transition Animation
```tsx
// app/(dashboard)/template.tsx
'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 🚀 SERVER ACTIONS

### The Standard Pattern
```tsx
// app/actions/orders.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Validate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate input
  const parsed = CreateOrderSchema.safeParse({
    productId: formData.get('productId'),
    quantity: Number(formData.get('quantity')),
  })
  
  if (!parsed.success) {
    return { error: 'Invalid input', details: parsed.error.flatten() }
  }

  // 3. Execute mutation
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      product_id: parsed.data.productId,
      quantity: parsed.data.quantity,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 4. Revalidate affected paths
  revalidatePath('/dashboard/orders')
  
  return { data }
}
```

### Form Usage
```tsx
// components/features/order-form.tsx
'use client'

import { createOrder } from '@/app/actions/orders'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Order'}
    </button>
  )
}

export function OrderForm({ productId }: { productId: string }) {
  return (
    <form action={createOrder}>
      <input type="hidden" name="productId" value={productId} />
      <input type="number" name="quantity" min="1" defaultValue="1" />
      <SubmitButton />
    </form>
  )
}
```

---

## 📦 DATA FETCHING

### Server Component Fetching (Preferred)
```tsx
// app/(dashboard)/orders/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function OrdersPage() {
  const supabase = await createClient()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(name, price)')
    .order('created_at', { ascending: false })

  return (
    <div>
      {orders?.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
```

### Streaming with Suspense
```tsx
// app/(dashboard)/overview/page.tsx
import { Suspense } from 'react'
import { StatsSkeleton, RecentOrdersSkeleton } from '@/components/skeletons'

export default function OverviewPage() {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      
      <Suspense fallback={<RecentOrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

// These fetch independently and stream in as ready
async function StatsSection() {
  const stats = await fetchStats() // Slow query
  return <StatsCards stats={stats} />
}

async function RecentOrders() {
  const orders = await fetchRecentOrders() // Fast query
  return <OrderList orders={orders} />
}
```

---

## ⚡ CACHING & REVALIDATION

### Static Data (Cached Forever)
```tsx
// For data that rarely changes
const data = await fetch('https://api.example.com/static', {
  cache: 'force-cache', // Default in Next.js
})
```

### Time-Based Revalidation
```tsx
// Refresh every hour
const data = await fetch('https://api.example.com/products', {
  next: { revalidate: 3600 },
})
```

### On-Demand Revalidation
```tsx
// In a Server Action or API route
import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
revalidatePath('/dashboard/orders')

// Revalidate by tag
revalidateTag('orders')
```

### Opting Out of Cache
```tsx
// For user-specific data
const data = await fetch('https://api.example.com/user', {
  cache: 'no-store',
})
```

---

## 🛡️ MIDDLEWARE

### Auth Protection Pattern
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 🎨 STYLING

### CSS Module Pattern
```tsx
// components/ui/button.tsx
import styles from './button.module.css'

export function Button({ children, variant = 'primary' }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  )
}
```

### Global Variables
```css
/* app/globals.css */
:root {
  --obsidian: #020204;
  --starlight: #f8fafc;
  --accent: #6366f1;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}

/* NEVER use magic numbers in component CSS */
```

---

## ✅ VERIFICATION CHECKLIST

Before declaring Next.js work "done":

- [ ] All pages render server-side first (no hydration errors)
- [ ] Forms use Server Actions (not API routes)
- [ ] User data uses `cache: 'no-store'` or auth check
- [ ] Protected routes have middleware guard
- [ ] Suspense boundaries for async components
- [ ] No `useEffect` for data that could be fetched server-side
- [ ] `template.tsx` used for transitions, not `layout.tsx`
- [ ] Run `npm run build` — no build errors
