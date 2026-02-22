---
name: TypeScript Precision
description: Advanced TypeScript patterns for bulletproof type safety
version: 1.0.0
primary_agents: [swarm-dev, swarm-architect]
---

# 🎯 TypeScript Precision Skill

> **ACTIVATION:** Types are documentation that the compiler enforces. Zero `any`. Zero escape hatches.

---

## 🎯 Core Principles

1. **No `any`** — Use `unknown` and narrow, or fix the type
2. **Infer When Possible** — Let TypeScript do the work
3. **Branded Types** — Prevent mixing similar primitives
4. **Strict Mode Always** — No exceptions

---

## 🔧 TSCONFIG BASELINE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

---

## 🏷️ BRANDED TYPES

### Problem: Mixing IDs
```typescript
// ❌ Easy to mix up
function getOrder(orderId: string, userId: string) { }
getOrder(userId, orderId) // Compiles! But wrong!
```

### Solution: Branded Types
```typescript
// lib/types/branded.ts
declare const brand: unique symbol

type Brand<T, TBrand extends string> = T & { [brand]: TBrand }

// Create branded types
export type UserId = Brand<string, 'UserId'>
export type OrderId = Brand<string, 'OrderId'>
export type ProductId = Brand<string, 'ProductId'>

// Factory functions
export const UserId = (id: string) => id as UserId
export const OrderId = (id: string) => id as OrderId
export const ProductId = (id: string) => id as ProductId

// Usage - now type safe!
function getOrder(orderId: OrderId, userId: UserId) { }

const userId = UserId('user_123')
const orderId = OrderId('order_456')

getOrder(orderId, userId) // ✅ Correct
getOrder(userId, orderId) // ❌ Type error!
```

---

## 🔒 DISCRIMINATED UNIONS

### Pattern: State Machines
```typescript
type AsyncState<T, E = Error> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E }

function renderState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return <Idle />
    case 'loading':
      return <Spinner />
    case 'success':
      return <Data data={state.data} /> // TS knows data exists
    case 'error':
      return <Error error={state.error} /> // TS knows error exists
  }
}
```

### Pattern: API Responses
```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code: number }

async function fetchUser(id: UserId): Promise<ApiResponse<User>> {
  try {
    const user = await db.users.findUnique({ where: { id } })
    if (!user) {
      return { success: false, error: 'User not found', code: 404 }
    }
    return { success: true, data: user }
  } catch (e) {
    return { success: false, error: 'Database error', code: 500 }
  }
}

// Usage
const result = await fetchUser(UserId('123'))
if (result.success) {
  console.log(result.data.name) // TS knows data exists
} else {
  console.error(result.error, result.code) // TS knows error exists
}
```

---

## 🧩 UTILITY TYPES

### Extract & Exclude
```typescript
type Status = 'pending' | 'active' | 'completed' | 'cancelled'

// Only active statuses
type ActiveStatus = Exclude<Status, 'cancelled'> 
// = 'pending' | 'active' | 'completed'

// Only final statuses
type FinalStatus = Extract<Status, 'completed' | 'cancelled'>
// = 'completed' | 'cancelled'
```

### Pick & Omit
```typescript
interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

// For API responses - never expose password
type PublicUser = Omit<User, 'password'>

// For updates - only updatable fields
type UserUpdate = Pick<User, 'name' | 'email'>
```

### Partial & Required
```typescript
// All fields optional for patching
type UserPatch = Partial<UserUpdate>

// Make specific fields required
type CreateUser = Required<Pick<User, 'email' | 'password'>> & 
                  Partial<Pick<User, 'name'>>
```

---

## 🔄 TYPE INFERENCE

### Infer from Functions
```typescript
// Don't repeat yourself
async function fetchOrders(userId: UserId) {
  const orders = await db.orders.findMany({
    where: { userId },
    include: { items: true, user: true }
  })
  return orders
}

// Infer the return type
type OrderWithDetails = Awaited<ReturnType<typeof fetchOrders>>[number]
```

### Infer from Arrays
```typescript
const STATUSES = ['draft', 'published', 'archived'] as const

// Type is 'draft' | 'published' | 'archived'
type Status = typeof STATUSES[number]
```

### Infer from Objects
```typescript
const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  settings: '/settings',
} as const

// Type is '/' | '/dashboard' | '/settings'
type Route = typeof ROUTES[keyof typeof ROUTES]
```

---

## 🛡️ ZOD INTEGRATION

### Schema to Type
```typescript
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin', 'moderator']),
  metadata: z.record(z.string()).optional(),
})

// Derive TypeScript type from Zod schema
type User = z.infer<typeof UserSchema>
// No need to write the type twice!
```

### Transform with Type Safety
```typescript
const ApiUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string().transform(s => new Date(s)),
  // Transform snake_case API to camelCase
}).transform(({ created_at, ...rest }) => ({
  ...rest,
  createdAt: created_at,
}))

type ApiUser = z.infer<typeof ApiUserSchema>
// { id: string; email: string; createdAt: Date }
```

---

## 🎭 GENERICS

### Constrained Generics
```typescript
// T must have an id property
function findById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id)
}
```

### Default Generics
```typescript
interface PaginatedResponse<T, TMeta = { total: number; page: number }> {
  data: T[]
  meta: TMeta
}

// Uses default meta
type UserList = PaginatedResponse<User>

// Custom meta
type OrderList = PaginatedResponse<Order, { total: number; hasMore: boolean }>
```

### Mapped Types
```typescript
// Make all properties nullable
type Nullable<T> = { [K in keyof T]: T[K] | null }

// Make all properties getters
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }

type UserGetters = Getters<User>
// { getId: () => string; getEmail: () => string; ... }
```

---

## ❌ ANTI-PATTERNS

### Never Use `any`
```typescript
// ❌ any = no type safety
function process(data: any) { }

// ✅ unknown + narrowing
function process(data: unknown) {
  if (typeof data === 'string') {
    // data is string here
  }
  if (isUser(data)) {
    // data is User here
  }
}

// Type guard
function isUser(data: unknown): data is User {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'email' in data
}
```

### Never Use Type Assertions Unless Certain
```typescript
// ❌ Lying to the compiler
const user = response.data as User // What if it's not?

// ✅ Validate at runtime
const user = UserSchema.parse(response.data) // Throws if invalid

// ✅ Or use safeParse
const result = UserSchema.safeParse(response.data)
if (result.success) {
  const user = result.data // Guaranteed User
}
```

---

## ✅ CHECKLIST

- [ ] `strict: true` in tsconfig
- [ ] Zero `any` in codebase
- [ ] Branded types for IDs
- [ ] Discriminated unions for states
- [ ] Zod schemas derive types
- [ ] No type assertions without validation
- [ ] `as const` for literal types
- [ ] `noUncheckedIndexedAccess: true`
