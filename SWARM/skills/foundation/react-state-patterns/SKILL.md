---
name: React State Patterns
description: State management patterns for React applications - when to use global vs local, lifting state, anti-patterns
version: 1.0.0
primary_agents: [swarm-dev, swarm-architect, swarm-ux]
---

# ⚛️ React State Patterns Skill

> **ACTIVATION:** State is architecture. Choose wisely, refactor rarely.

---

## 🎯 Core Principle

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   State should live at the LOWEST level that satisfies          ║
║   all components that need it.                                  ║
║                                                                  ║
║   Too high = unnecessary re-renders                             ║
║   Too low = prop drilling hell                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 📊 State Location Decision Tree

```
Does this state affect MULTIPLE components across different branches?
│
├── YES → Use GLOBAL state (Zustand, Redux, Context)
│   │
│   └── Does it need persistence?
│       ├── YES → Consider localStorage sync or persisted store
│       └── NO → In-memory store is fine
│
└── NO → Use LOCAL state (useState, useReducer)
    │
    └── Does it need to survive component unmount?
        ├── YES → Lift to parent OR use URL params
        └── NO → Keep it local
```

---

## 🏷️ When to Use Global State

| Scenario | Example | Store It |
|----------|---------|----------|
| **User input affects multiple components** | Search query, filters | ✅ Global |
| **User session data** | Auth state, user profile | ✅ Global |
| **Multi-step form data** | Wizard state | ✅ Global |
| **Shared UI state** | Theme, sidebar open | ✅ Global |
| **Cache for API responses** | Query cache (React Query handles this) | ✅ Global |

---

## 🏷️ When to Use Local State

| Scenario | Example | Keep It |
|----------|---------|---------|
| **Single component UI** | Modal open/close, hover | ✅ Local |
| **Form input before submit** | Controlled inputs | ✅ Local |
| **Animation state** | isAnimating | ✅ Local |
| **Temporary selections** | Dropdown expanded | ✅ Local |

---

## 🔄 Common Patterns

### Pattern 1: Lifting State to Store (Chips → Search)

**Problem:** Chips component has local state, but clicking a chip should populate the search input.

**Wrong Approach:**
```tsx
// ❌ Local state that tries to communicate
function Chips() {
  const [selected, setSelected] = useState('');
  // How does SearchInput know about this?
}
```

**Correct Approach:**
```tsx
// ✅ Global store owns the query
// stores/useSearchStore.ts
export const useSearchStore = create((set) => ({
  query: '',
  setQuery: (query: string) => set({ query }),
}));

// components/Chips.tsx
function Chips() {
  const setQuery = useSearchStore((s) => s.setQuery);
  return chips.map(chip => (
    <button onClick={() => setQuery(chip.text)}>{chip.text}</button>
  ));
}

// components/SearchInput.tsx
function SearchInput() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

---

### Pattern 2: Deriving Local Aliases

**Problem:** Component needs store state but also needs local modifications.

**Correct Approach:**
```tsx
function SearchResults() {
  // Global state
  const rawQuery = useSearchStore((s) => s.query);
  
  // Local derived state
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);
  
  // Use debouncedQuery for API calls
}
```

---

### Pattern 3: URL as State Source

**Problem:** State needs to survive page refresh or be shareable.

**Correct Approach:**
```tsx
function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const setQuery = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('q', newQuery);
    router.push(`?${params.toString()}`);
  };
  
  // URL is the source of truth
}
```

---

### Pattern 4: Sync Store with URL

**Problem:** Need both URL persistence AND store reactivity.

**Correct Approach:**
```tsx
// Initialize store from URL on mount
useEffect(() => {
  const urlQuery = searchParams.get('q') || '';
  if (urlQuery !== storeQuery) {
    setStoreQuery(urlQuery);
  }
}, [searchParams]);

// Sync URL when store changes
useEffect(() => {
  const params = new URLSearchParams(searchParams);
  params.set('q', storeQuery);
  router.replace(`?${params.toString()}`, { scroll: false });
}, [storeQuery]);
```

---

## ❌ Anti-Patterns

### 1. Duplicating Store Data in Local State

```tsx
// ❌ BAD: Duplicate creates sync hell
function Component() {
  const storeData = useStore((s) => s.data);
  const [localData, setLocalData] = useState(storeData); // WHY?
}

// ✅ GOOD: Use store directly
function Component() {
  const data = useStore((s) => s.data);
  const setData = useStore((s) => s.setData);
}
```

### 2. Store for Purely Visual State

```tsx
// ❌ BAD: No component cares about this globally
const useStore = create((set) => ({
  isButtonHovered: false, // Why is this global?
}));

// ✅ GOOD: Keep it local
function Button() {
  const [isHovered, setIsHovered] = useState(false);
}
```

### 3. Prop Drilling When Store Exists

```tsx
// ❌ BAD: Drilling through 5 components
<App>
  <Layout query={query}>
    <Sidebar query={query}>
      <Search query={query} />
    </Sidebar>
  </Layout>
</App>

// ✅ GOOD: Access store directly
function Search() {
  const query = useSearchStore((s) => s.query);
}
```

### 4. Initializing Store from Props

```tsx
// ❌ BAD: Store initialized from prop (loses independence)
function Page({ initialQuery }) {
  useEffect(() => {
    setStoreQuery(initialQuery);
  }, [initialQuery]);
}

// ✅ GOOD: Store hydrates itself or uses URL
// In _app.tsx or layout.tsx, hydrate once from server/URL
```

---

## 🔐 Security Considerations

When managing state:

- **Never store sensitive data in URL params** (tokens, passwords)
- **Sanitize user input** before storing (XSS prevention)
- **Clear sensitive state on logout** (auth tokens, user data)
- **Avoid storing PII in localStorage** without encryption

```tsx
// Safe logout
function logout() {
  useAuthStore.getState().clear();
  localStorage.removeItem('user');
  router.push('/login');
}
```

---

## ✅ State Management Checklist

Before implementing state:

- [ ] **Scope defined:** Which components need this state?
- [ ] **Location chosen:** Global, local, or URL?
- [ ] **Persistence needed:** Does it survive unmount/refresh?
- [ ] **Single source:** No duplicates across stores
- [ ] **Security checked:** No sensitive data exposed

---

## 📁 File Organization

```
src/
├── stores/
│   ├── useSearchStore.ts      # Global search state
│   ├── useTripStore.ts        # Trip planning state
│   └── useUIStore.ts          # Global UI state (theme, sidebar)
├── hooks/
│   ├── useDebounce.ts         # Derived state utilities
│   └── useURLSync.ts          # URL ↔ Store sync
└── components/
    └── [Component].tsx         # Local state stays here
```

---

## 🔒 SKILL VERSION

```
Skill: React State Patterns
Version: 1.0.0
Last Updated: 2026-01-22
Compatible Agents: swarm-dev, swarm-architect, swarm-ux
```
