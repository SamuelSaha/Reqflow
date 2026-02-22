---
name: Design Systems
description: Component libraries, design tokens, variant APIs, compound components, and Storybook documentation for scalable design systems
version: 1.1.0
primary_agents: [swarm-ux, swarm-dev, swarm-arch]
---

# 🎨 Design Systems Skill

> **ACTIVATION:** "Apply design-systems skill for component library architecture"

---

## 🎯 Purpose

Ruthlessly effective patterns for building scalable, maintainable, and well-documented design systems that enable rapid UI development across teams.

---

## 0. Spec Grounding & Token Contract (Mandatory)

**Problem this prevents:** “design drift” and one-off components that silently fork the visual language.

### Inputs (Required)
- `spec_packet` (preferred) with design constraints (palette, typography, radii, motion, a11y)
- Component scope: which surfaces/components must be covered

### Output Contract
- One source of truth for tokens (colors/typography/spacing/radii/shadows)
- Semantic tokens mapped to primitives (no direct primitive usage in components unless explicitly allowed)
- Focus-visible and interaction states standardized (no component-specific inventions)

### Verification
- No new raw colors/fonts/radii introduced in components outside token definitions
- Component variants cover required states (hover/active/disabled/focus/selected)

---

## 1. Design Token Architecture

### 1.1 Token Structure (W3C Design Tokens Format)

**File:** `tokens/colors.json`

```json
{
  "color": {
    "primitive": {
      "blue": {
        "50": { "value": "#f0f9ff", "type": "color" },
        "100": { "value": "#e0f2fe", "type": "color" },
        "500": { "value": "#0ea5e9", "type": "color" },
        "600": { "value": "#0284c7", "type": "color" },
        "900": { "value": "#0c4a6e", "type": "color" }
      },
      "slate": {
        "50": { "value": "#f8fafc", "type": "color" },
        "100": { "value": "#f1f5f9", "type": "color" },
        "500": { "value": "#64748b", "type": "color" },
        "900": { "value": "#0f172a", "type": "color" }
      }
    },
    "semantic": {
      "primary": {
        "DEFAULT": { "value": "{color.primitive.blue.500}", "type": "color" },
        "hover": { "value": "{color.primitive.blue.600}", "type": "color" },
        "light": { "value": "{color.primitive.blue.50}", "type": "color" }
      },
      "text": {
        "primary": { "value": "{color.primitive.slate.900}", "type": "color" },
        "secondary": { "value": "{color.primitive.slate.500}", "type": "color" }
      },
      "surface": {
        "primary": { "value": "#ffffff", "type": "color" },
        "secondary": { "value": "{color.primitive.slate.50}", "type": "color" }
      }
    }
  }
}
```

**File:** `tokens/spacing.json`

```json
{
  "spacing": {
    "primitive": {
      "0": { "value": "0", "type": "dimension" },
      "1": { "value": "0.25rem", "type": "dimension" },
      "2": { "value": "0.5rem", "type": "dimension" },
      "4": { "value": "1rem", "type": "dimension" },
      "6": { "value": "1.5rem", "type": "dimension" },
      "8": { "value": "2rem", "type": "dimension" },
      "12": { "value": "3rem", "type": "dimension" }
    },
    "semantic": {
      "xs": { "value": "{spacing.primitive.1}", "type": "dimension" },
      "sm": { "value": "{spacing.primitive.2}", "type": "dimension" },
      "md": { "value": "{spacing.primitive.4}", "type": "dimension" },
      "lg": { "value": "{spacing.primitive.6}", "type": "dimension" },
      "xl": { "value": "{spacing.primitive.8}", "type": "dimension" },
      "2xl": { "value": "{spacing.primitive.12}", "type": "dimension" }
    }
  }
}
```

**File:** `tokens/typography.json`

```json
{
  "typography": {
    "fontFamily": {
      "sans": { "value": ["Inter", "system-ui", "sans-serif"], "type": "fontFamily" },
      "mono": { "value": ["JetBrains Mono", "monospace"], "type": "fontFamily" }
    },
    "fontSize": {
      "xs": { "value": "0.75rem", "type": "dimension" },
      "sm": { "value": "0.875rem", "type": "dimension" },
      "base": { "value": "1rem", "type": "dimension" },
      "lg": { "value": "1.125rem", "type": "dimension" },
      "xl": { "value": "1.25rem", "type": "dimension" },
      "2xl": { "value": "1.5rem", "type": "dimension" },
      "3xl": { "value": "1.875rem", "type": "dimension" },
      "4xl": { "value": "2.25rem", "type": "dimension" }
    },
    "fontWeight": {
      "normal": { "value": "400", "type": "fontWeight" },
      "medium": { "value": "500", "type": "fontWeight" },
      "semibold": { "value": "600", "type": "fontWeight" },
      "bold": { "value": "700", "type": "fontWeight" }
    },
    "lineHeight": {
      "tight": { "value": "1.25", "type": "dimension" },
      "normal": { "value": "1.5", "type": "dimension" },
      "relaxed": { "value": "1.625", "type": "dimension" }
    }
  }
}
```

### 1.2 Token Build Pipeline

**Style Dictionary Configuration:**
```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    tailwind: {
      transforms: ['attribute/cti', 'name/cti/kebab', 'color/css'],
      buildPath: 'build/tailwind/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/module',
        },
      ],
    },
    typescript: {
      transformGroup: 'js',
      buildPath: 'build/ts/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
  },
}
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "tokens:build": "style-dictionary build",
    "tokens:watch": "style-dictionary build --watch"
  }
}
```

### 1.3 Color Palette Design (Primitives → Semantics → States)

**Objective:** A palette that looks premium, stays consistent, and never breaks accessibility when you add a new component.

#### The 3-Layer Model (Non-Negotiable)
1. **Primitive colors** — raw scales (neutral, brand hue, status hues)
2. **Semantic tokens** — intent-based (`primary`, `background`, `destructive`, `muted`)
3. **Component tokens** — per-component needs (`button-bg`, `badge-bg`) *only when semantics aren’t enough*

#### Pair Tokens (Stop Guessing Text Colors)
Every “paint” token that can be a background **must** have a paired foreground token:
- `primary` + `primary-foreground`
- `card` + `card-foreground`
- `destructive` + `destructive-foreground`

This prevents random `text-white` / `text-slate-900` decisions across the codebase.

#### Interaction States (Make Them Systemic)
Define state rules at the token/variant layer, not ad-hoc in components:
- **Hover:** increase contrast slightly (darken on light themes, lighten on dark themes)
- **Active:** more contrast than hover
- **Focus:** consistent `ring` token (high contrast, visible on all surfaces)
- **Disabled:** reduce saturation + increase transparency, but keep text readable

#### Accessibility Constraints (Hard Gate)
- Normal text contrast target: **≥ 4.5:1**
- Large text contrast target: **≥ 3:1**
- UI component boundaries (borders, focus rings) must be **clearly visible** in both themes

#### Practical Token Set (Minimum Viable Palette)
If you’re using Tailwind/shadcn-style theming, your baseline semantic palette should include:
- `background`, `foreground`
- `card`, `card-foreground`
- `popover`, `popover-foreground`
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `muted`, `muted-foreground`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`
- `border`, `input`, `ring`

**Rule:** Components may only consume semantic tokens (or variants built on them). If a new color appears in UI, it becomes a token or it doesn’t ship.

---

## 2. Component Composition Patterns

### 2.1 Compound Components

**Pattern: Context-Based Composition**

```typescript
// components/Tabs/index.tsx
import React, { createContext, useContext, useState, useCallback } from 'react'

// Context for state sharing
interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

// Root component
interface TabsProps {
  defaultTab?: string
  children: React.ReactNode
  onChange?: (tabId: string) => void
}

export function Tabs({ defaultTab, children, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || '')
  
  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id)
    onChange?.(id)
  }, [onChange])
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

// List component
interface TabListProps {
  children: React.ReactNode
  className?: string
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={`flex border-b border-gray-200 ${className}`} role="tablist">
      {children}
    </div>
  )
}

// Individual tab
interface TabProps {
  id: string
  children: React.ReactNode
  disabled?: boolean
}

export function Tab({ id, children, disabled }: TabProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')
  
  const { activeTab, setActiveTab } = context
  const isActive = activeTab === id
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => setActiveTab(id)}
      className={`
        px-4 py-2 font-medium transition-colors
        ${isActive 
          ? 'border-b-2 border-primary-500 text-primary-600' 
          : 'text-gray-600 hover:text-gray-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

// Panel component
interface TabPanelProps {
  id: string
  children: React.ReactNode
}

export function TabPanel({ id, children }: TabPanelProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')
  
  const { activeTab } = context
  
  if (activeTab !== id) return null
  
  return (
    <div role="tabpanel" className="p-4">
      {children}
    </div>
  )
}

// Usage
<Tabs defaultTab="account" onChange={(tab) => console.log(tab)}>
  <TabList>
    <Tab id="account">Account</Tab>
    <Tab id="security">Security</Tab>
    <Tab id="notifications">Notifications</Tab>
  </TabList>
  <TabPanel id="account">Account settings...</TabPanel>
  <TabPanel id="security">Security settings...</TabPanel>
  <TabPanel id="notifications">Notification preferences...</TabPanel>
</Tabs>
```

### 2.2 Slot Pattern (Polymorphic)

```typescript
// components/Card/index.tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

const cardVariants = cva(
  'rounded-lg border bg-white shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        destructive: 'border-red-200 bg-red-50',
        outline: 'border-2',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

// Header slot
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        className={`flex flex-col space-y-1.5 ${className}`}
        {...props}
      />
    )
  }
)
CardHeader.displayName = 'CardHeader'

// Title slot
const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

// Main card component
interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        className={cardVariants({ variant, size, className })}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

// Export compound components
export { Card, CardHeader, CardTitle, cardVariants }

// Usage with polymorphism
<Card asChild>
  <article>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
  </article>
</Card>
```

### 2.3 Render Props Pattern

```typescript
// components/DataTable/index.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  renderRow?: (row: T, index: number) => React.ReactNode
  renderCell?: (value: unknown, column: ColumnDef<T>, row: T) => React.ReactNode
  emptyState?: React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  renderRow,
  renderCell,
  emptyState,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <>{emptyState || <div>No data available</div>}</>
  }
  
  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} className="text-left p-2 border-b">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => {
          if (renderRow) {
            return renderRow(row, index)
          }
          
          return (
            <tr key={index}>
              {columns.map(col => {
                const value = row[col.accessor as keyof T]
                
                if (renderCell) {
                  return (
                    <td key={col.key} className="p-2 border-b">
                      {renderCell(value, col, row)}
                    </td>
                  )
                }
                
                return (
                  <td key={col.key} className="p-2 border-b">
                    {String(value)}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// Usage with render props
<DataTable
  data={users}
  columns={[
    { key: 'name', header: 'Name', accessor: 'name' },
    { key: 'status', header: 'Status', accessor: 'status' },
  ]}
  renderCell={(value, column) => {
    if (column.key === 'status') {
      return <StatusBadge status={value as string} />
    }
    return String(value)
  }}
  emptyState={<EmptyUsersState />}
/>
```

---

## 3. Variant API Design (CVA)

### 3.1 class-variance-authority Setup

```typescript
// components/Button/index.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

// Define variants with CVA
const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    compoundVariants: [
      // Compound: ghost + destructive
      {
        variant: 'ghost',
        class: 'hover:bg-red-100 text-red-600',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Type inference from CVA
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

// Component implementation
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

### 3.2 Advanced CVA Patterns

**Responsive Variants:**
```typescript
const responsiveVariants = cva(
  'grid gap-4',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
      },
    },
    defaultVariants: {
      cols: 1,
    },
  }
)

// Usage with responsive override
<Grid cols={{ default: 1, md: 2, lg: 3 }} />
// Output: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

**Dynamic Variants:**
```typescript
// Generate variants from design tokens
const colors = ['red', 'blue', 'green', 'yellow']

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      color: colors.reduce((acc, color) => ({
        ...acc,
        [color]: `bg-${color}-100 text-${color}-800`,
      }), {}),
    },
    defaultVariants: {
      color: 'blue',
    },
  }
)
```

---

## 4. Theme Management

### 4.1 Theme Provider

```typescript
// components/ThemeProvider/index.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    const root = window.document.documentElement
    
    const applyTheme = (newTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches ? 'dark' : 'light')
      
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    } else {
      applyTheme(theme)
    }
  }, [theme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

// Theme Toggle Component
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

### 4.2 CSS Variable Theming

**File:** `styles/themes.css`

```css
:root {
  /* Light theme (default) */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-accent: #0ea5e9;
}

.dark {
  /* Dark theme */
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-accent: #38bdf8;
}

/* Brand themes */
[data-brand="acme"] {
  --color-accent: #f97316;
}

[data-brand="techcorp"] {
  --color-accent: #8b5cf6;
}
```

### 4.3 Shadcn UI Integration (Radix + Tailwind)

**Use shadcn/ui when:**
- You need accessible primitives fast (Dialog, DropdownMenu, Popover, Tooltip, etc.).
- You want “design system as code” (components live in-repo, not a black-box package).

**Core stance:** shadcn components are **a starting point**, not a design system by themselves. Your design system is the **tokens + variants + rules** you enforce around them.

**Non-negotiables:**
- **Token-first:** shadcn styling must consume semantic tokens (`bg-background`, `text-foreground`, `bg-primary`, etc.), not ad-hoc hex.
- **Variant-first:** component APIs expose variants via CVA, not `className` soup.
- **A11y-first:** Radix semantics stay intact (don’t strip labels/roles/focus management).

**Recommended file layout:**
```
components/
  ui/                 # shadcn components (source-controlled)
  primitives/         # your wrappers (domain naming)
  marketing/          # landing page blocks
lib/
  cn.ts               # clsx + tailwind-merge
  tokens.ts           # optional typed token map (if needed)
styles/
  globals.css         # CSS vars: light/dark + base styles
```

**Customization strategy (safe):**
1. Change **tokens** in `globals.css` (brand, light/dark) first.
2. If a component still doesn’t fit, change **variants** (CVA) next.
3. Only then touch **structure** (DOM) — and re-verify keyboard + screen reader behavior.

**Anti-patterns (block in review):**
- Replacing semantic token classes with literal colors (`text-slate-900` in one-off components).
- Deleting focus rings without replacement (`focus-visible:ring-*`).
- “Just add a wrapper” nesting (breaks Radix focus/positioning and increases DOM depth).

---

## 5. Documentation Strategies

### 5.1 Storybook Setup

**File:** `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config
```

### 5.2 Component Stories

**File:** `Button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {}

// Variant stories
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

// Size stories
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

// State stories
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

// Interactive story with play function
export const ClickInteraction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await userEvent.click(button)
  },
}

// Story with multiple buttons (compositions)
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>
  ),
}
```

### 5.3 MDX Documentation

**File:** `Button.docs.mdx`

```mdx
import { Meta, Canvas, Story, Controls } from '@storybook/blocks'
import * as ButtonStories from './Button.stories'

<Meta of={ButtonStories} />

# Button

The Button component is the primary way to trigger actions in the interface.

## Overview

<Canvas of={ButtonStories.Default} />

## Props

<Controls />

## Variants

Buttons come in multiple variants to indicate different levels of emphasis.

### Primary (Default)

Use for the most important action on a page.

<Canvas of={ButtonStories.Default} />

### Destructive

Use for actions that delete data or can't be undone.

<Canvas of={ButtonStories.Destructive} />

### Outline

Use for secondary actions or in toolbars with multiple options.

<Canvas of={ButtonStories.Outline} />

## Usage Guidelines

### Do
- Use primary buttons sparingly (1 per page/section)
- Place destructive actions in confirmation dialogs
- Use loading state for async actions

### Don't
- Use multiple primary buttons on the same screen
- Disable buttons without explaining why
- Use link variant for actual navigation (use `<a>` instead)

## Accessibility

- Buttons are focusable and keyboard accessible
- `aria-disabled` is set when disabled
- Focus ring is visible for keyboard navigation
- Loading state announces to screen readers

## Code Example

```tsx
import { Button } from '@/components/ui/button'

// Primary button
<Button>Click me</Button>

// Destructive with loading
<Button variant="destructive" loading>
  Deleting...
</Button>

// As link
<Button variant="link" asChild>
  <a href="/about">Learn more</a>
</Button>
```
```

---

## 6. Component Library Structure

### 6.1 File Organization

```
src/
├── components/
│   ├── ui/              # Primitive/base components
│   │   ├── button/
│   │   │   ├── index.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.docs.mdx
│   │   ├── card/
│   │   ├── input/
│   │   ├── select/
│   │   └── index.ts     # Barrel export
│   ├── composite/       # Composite components
│   │   ├── data-table/
│   │   ├── form/
│   │   └── navigation/
│   └── feedback/        # Feedback components
│       ├── toast/
│       ├── alert/
│       └── modal/
├── hooks/
│   ├── useTheme.ts
│   ├── useToast.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── utils.ts         # cn() utility
│   └── tokens.ts        # Token exports
├── styles/
│   ├── globals.css
│   └── themes.css
└── types/
    └── index.ts
```

### 6.2 Export Pattern

**File:** `components/ui/index.ts`

```typescript
// Barrel exports for clean imports
export { Button, buttonVariants, type ButtonProps } from './button'
export { Card, CardHeader, CardTitle, cardVariants, type CardProps } from './card'
export { Input, inputVariants, type InputProps } from './input'
export { Select, SelectItem, type SelectProps } from './select'

// Re-export utility
export { cn } from '@/lib/utils'
```

**Usage:**
```typescript
import { Button, Card, Input, cn } from '@/components/ui'
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ NEVER DO THESE

1. **Prop drilling instead of compound components**
   ```tsx
   // BAD
   <Tabs activeTab={tab} onTabChange={setTab} tabs={[
     { id: '1', label: 'Tab 1', content: <Content1 /> },
     { id: '2', label: 'Tab 2', content: <Content2 /> },
   ]} />
   
   // GOOD
   <Tabs defaultTab="1">
     <TabList>
       <Tab id="1">Tab 1</Tab>
       <Tab id="2">Tab 2</Tab>
     </TabList>
     <TabPanel id="1"><Content1 /></TabPanel>
     <TabPanel id="2"><Content2 /></TabPanel>
   </Tabs>
   ```

2. **Hardcoded values instead of tokens**
   ```tsx
   // BAD
   <div className="text-[#0ea5e9] p-[16px]">
   
   // GOOD
   <div className="text-primary-500 p-4">
   ```

3. **Tight coupling with business logic**
   ```tsx
   // BAD - Component knows about users
   function UserCard({ user }: { user: User }) {
     return <div>{user.name}</div>
   }
   
   // GOOD - Generic card with slots
   function Card({ title, children }: CardProps) {
     return (
       <div>
         <h3>{title}</h3>
         {children}
       </div>
     )
   }
   
   // Usage
   <Card title={user.name}>
     <UserDetails user={user} />
   </Card>
   ```

4. **Missing prop types/type safety**
   ```tsx
   // BAD
   function Button(props) {
     return <button {...props} />
   }
   
   // GOOD
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary'
     size?: 'sm' | 'md' | 'lg'
   }
   
   const Button = forwardRef<HTMLButtonElement, ButtonProps>(
     ({ variant = 'primary', size = 'md', ...props }, ref) => {
       // Implementation
     }
   )
   ```

5. **No documentation or stories**
   ```tsx
   // Components MUST have:
   // 1. Storybook stories
   // 2. Prop documentation
   // 3. Usage examples
   // 4. Accessibility notes
   ```

---

## ✅ Verification Checklist

### Design Tokens
- [ ] All colors defined as semantic tokens
- [ ] Spacing uses 8px base grid
- [ ] Typography scale defined (xs to 4xl)
- [ ] Shadows, borders, radii tokenized
- [ ] Dark mode tokens present
- [ ] Style Dictionary build pipeline configured
- [ ] Tokens exported to CSS, JS, and TS

### Component Architecture
- [ ] CVA used for variant management
- [ ] Compound components use Context API
- [ ] Polymorphic components with `asChild` prop
- [ ] TypeScript interfaces exported
- [ ] Forward refs implemented
- [ ] No prop drilling (use composition)

### Documentation
- [ ] Storybook configured and running
- [ ] Every component has stories file
- [ ] Props documented with controls
- [ ] MDX docs for complex components
- [ ] Usage examples included
- [ ] Accessibility notes documented
- [ ] Visual regression tests configured

### Testing
- [ ] Component unit tests written
- [ ] Interaction tests in Storybook
- [ ] Accessibility tests (axe-core)
- [ ] Visual regression tests
- [ ] All states tested (hover, focus, disabled, loading)

### Distribution
- [ ] Barrel exports from `components/ui/index.ts`
- [ ] Tree-shakeable ESM exports
- [ ] No side effects in package.json
- [ ] README with installation instructions
- [ ] CHANGELOG maintained

---

## 🔒 SKILL VERSION

```
Skill: Design Systems
Version: 1.1.0
Last Updated: 2026-02-06
Patterns: Tokens, Palette, CVA, Compound Components, Theming, Storybook, shadcn integration
Use On: Component library development, design system implementation
Anti-Patterns: Hardcoded values, prop drilling, missing docs
```

---

**See Also:**
- `css-architecture` skill - Styling patterns
- `performance-optimization` skill - Bundle optimization
- `accessibility-wcag` skill - A11y compliance
