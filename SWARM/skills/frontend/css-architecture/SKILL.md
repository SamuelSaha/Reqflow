---
name: CSS Architecture
description: Master Tailwind, BEM, CSS-in-JS, design tokens, and style isolation for scalable frontend styling
version: 1.1.0
primary_agents: [swarm-dev, swarm-ux, swarm-arch]
---

# 🎨 CSS Architecture Skill

> **ACTIVATION:** "Apply css-architecture skill for production-grade styling"

---

## 🎯 Purpose

Ruthlessly effective CSS architecture patterns for maintaining scalable, consistent, and performant styling across the entire frontend codebase.

---

## 0. Spec Grounding & Verification (Mandatory)

**Problem this prevents:** styling drift, “looks fixed” claims without proof, and misreading design intent.

### Inputs (Required)
- `spec_packet` (preferred) or explicit design constraints (tokens, components, breakpoints)
- Target scope: pages/components/files in scope

### Output Contract (CT1/CT2 applies)
- Restate the styling goal in one sentence (what changes in the UI)
- List the non-goals (what must not change)
- Define verification: what will be checked (visual, a11y focus, responsive, perf) and how

### Verification (Minimum)
- A11y: focus-visible indicator exists for interactive elements (no `outline: none` without replacement)
- Responsive: at least 3 breakpoints verified (or per spec)
- Drift: no raw colors/fonts/radii introduced outside tokens (or spec-defined exception)

---

## Focus Rings & “Blue Outline” Debugging (No Ghost Rings)

**Rule:** Never remove focus styles globally. Keyboard focus is a first-class UI state. If the default ring is ugly, replace it with a branded, accessible focus-visible treatment.

### Fast Diagnosis Checklist (DevTools → Computed)
When a field shows an unexpected blue halo/outline, identify which property is responsible:
- `outline` / `outline-color` (often UA styles or a global `*:focus-visible` rule)
- `box-shadow` (Tailwind `ring-*`, component styles, or global focus utilities)
- `border-color` (focus border change can look like an outline)
- Safari/WebKit: `-webkit-appearance`, `-webkit-focus-ring-color`

### Correct Fix Pattern (Tailwind)
Use a consistent focus-visible ring everywhere:
```tsx
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

### Scoped Override (Last Resort)
If a single component must opt out, do it **scoped** and add an alternate visible state:
- Disable the default ring/outline for that component only
- Add a replacement (border/ring) that meets contrast requirements

## 1. Tailwind Configuration Patterns

### 1.1 Custom Configuration Structure

**File:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colors - Semantic naming over literal
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        // Semantic aliases
        'action-primary': '#0ea5e9',
        'action-hover': '#0284c7',
        'text-primary': '#0f172a',
        'text-secondary': '#64748b',
        'surface-primary': '#ffffff',
        'surface-secondary': '#f8fafc',
      },
      
      // Spacing - 8px base grid
      spacing: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
      },
      
      // Typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 300ms ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

### 1.2 Plugin Development

**Custom Plugin:** `tailwind-plugins/shadows.js`

```javascript
const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addComponents, theme }) {
  const shadows = {
    '.shadow-elevation-1': {
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    '.shadow-elevation-2': {
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    '.shadow-elevation-3': {
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  }
  
  addComponents(shadows)
})
```

**Usage in tailwind.config.ts:**
```typescript
plugins: [
  require('./tailwind-plugins/shadows'),
]
```

### 1.3 Shadcn-Compatible Semantic Colors (CSS Variables)

**Goal:** Stop hardcoding hex values in components. Define a semantic color system once, then consume it everywhere via Tailwind utilities.

**Recommended pairing:** Tailwind + CSS variables + `bg-background/text-foreground` style tokens (shadcn-style).

**File:** `app/globals.css` (or `styles/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Semantic tokens (HSL triplets) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.6rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

**File:** `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

**Rules:**
- Components may use `bg-primary text-primary-foreground`, never `bg-[#...]`.
- If a new color is needed, add a token (semantic first, primitive second).
- Dark mode is a token swap, not a second stylesheet.

### 1.4 Tailwind Class Composition (cn + variants)

**Goal:** Make conditional styling and variants predictable, deduped, and reviewable.

**File:** `src/lib/cn.ts` (or `lib/utils.ts`)

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Variant rule:** Use CVA for variant APIs (see `design-systems` skill). Don’t hand-roll `variant === "..." ? "..." : "..."` across files.

**Shadcn/radix rule:** Prefer `data-[state=open]:...`, `data-[disabled]:...` utilities over brittle descendant selectors.

---

## 2. BEM Methodology for Legacy CSS

### 2.1 BEM Structure

**Pattern:** `block__element--modifier`

```css
/* Block */
.card {
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Element */
.card__header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.card__title {
  font-size: 1.25rem;
  font-weight: 600;
}

.card__body {
  padding: 1rem;
}

.card__footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Modifier */
.card--elevated {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card--compact .card__header,
.card--compact .card__body,
.card--compact .card__footer {
  padding: 0.75rem;
}

.card--danger {
  border: 2px solid #ef4444;
}

.card--danger .card__title {
  color: #dc2626;
}
```

### 2.2 BEM with Sass (Nesting)

```scss
// card.scss
.card {
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &__header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  &__body {
    padding: 1rem;
  }
  
  &__footer {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  // Modifiers
  &--elevated {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  &--compact {
    #{$self}__header,
    #{$self}__body,
    #{$self}__footer {
      padding: 0.75rem;
    }
  }
  
  &--danger {
    border: 2px solid #ef4444;
    
    #{$self}__title {
      color: #dc2626;
    }
  }
}
```

---

## 3. CSS-in-JS Patterns

### 3.1 Styled Components (Recommended for React)

```typescript
// components/Button/styles.ts
import styled, { css } from 'styled-components'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles = {
  primary: css`
    background-color: #0ea5e9;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: #0284c7;
    }
  `,
  secondary: css`
    background-color: white;
    color: #334155;
    border: 1px solid #cbd5e1;
    
    &:hover:not(:disabled) {
      background-color: #f1f5f9;
    }
  `,
  danger: css`
    background-color: #ef4444;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: #dc2626;
    }
  `,
}

const sizeStyles = {
  sm: css`
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  `,
  md: css`
    padding: 0.5rem 1rem;
    font-size: 1rem;
  `,
  lg: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  `,
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  
  &:focus-visible {
    outline: 2px solid #0ea5e9;
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => variantStyles[props.variant || 'primary']}
  ${props => sizeStyles[props.size || 'md']}
  
  ${props => props.loading && css`
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  `}
`

// Usage
// <Button variant="primary" size="lg">Click me</Button>
```

### 3.2 Emotion (CSS Prop Pattern)

```typescript
// components/Badge.tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

const variantColors = {
  success: { bg: '#dcfce7', text: '#166534' },
  warning: { bg: '#fef3c7', text: '#92400e' },
  error: { bg: '#fee2e2', text: '#991b1b' },
  info: { bg: '#e0f2fe', text: '#0c4a6e' },
}

export function Badge({ variant = 'info', children }: BadgeProps) {
  const colors = variantColors[variant]
  
  return (
    <span
      css={css`
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        background-color: ${colors.bg};
        color: ${colors.text};
      `}
    >
      {children}
    </span>
  )
}
```

---

## 4. CSS Variable Architecture (Design Tokens)

### 4.1 Global Design Tokens

**File:** `styles/tokens.css`

```css
:root {
  /* Color Tokens */
  --color-primary-50: #f0f9ff;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f8fafc;
  --color-surface-tertiary: #f1f5f9;
  
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  
  --color-border-default: #e2e8f0;
  --color-border-hover: #cbd5e1;
  
  /* Spacing Tokens */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Typography Tokens */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  
  /* Shadow Tokens */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Border Radius Tokens */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
  
  /* Transition Tokens */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
  
  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-tooltip: 500;
}
```

### 4.2 Component Tokens

**File:** `styles/components.css`

```css
:root {
  /* Button Tokens */
  --button-padding-sm: var(--space-sm) var(--space-md);
  --button-padding-md: var(--space-md) var(--space-lg);
  --button-padding-lg: var(--space-lg) var(--space-xl);
  
  --button-bg-primary: var(--color-primary-500);
  --button-bg-primary-hover: var(--color-primary-600);
  --button-text-primary: white;
  
  --button-radius: var(--radius-md);
  --button-font-weight: 500;
  
  /* Card Tokens */
  --card-padding: var(--space-lg);
  --card-bg: var(--color-surface-primary);
  --card-radius: var(--radius-lg);
  --card-shadow: var(--shadow-md);
  --card-border: 1px solid var(--color-border-default);
}
```

### 4.3 Dark Mode Tokens

```css
:root {
  /* Light mode (default) */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
}

[data-theme="dark"] {
  --color-surface-primary: #0f172a;
  --color-surface-secondary: #1e293b;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
}
```

---

## 5. Style Isolation Strategies

### 5.1 CSS Modules

**File:** `Button.module.css`

```css
.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 150ms ease;
}

.primary {
  composes: button;
  background-color: #0ea5e9;
  color: white;
}

.secondary {
  composes: button;
  background-color: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.small {
  composes: button;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.large {
  composes: button;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.loading {
  composes: button;
  position: relative;
  color: transparent;
}

.loading::after {
  content: '';
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Usage:**
```typescript
// Button.tsx
import styles from './Button.module.css'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading,
  children 
}: ButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    styles[size === 'sm' ? 'small' : size === 'lg' ? 'large' : ''],
    loading && styles.loading,
  ].filter(Boolean).join(' ')
  
  return <button className={className}>{children}</button>
}
```

### 5.2 Scoped Styles (Vue/Scoped CSS)

```vue
<!-- ScopedButton.vue -->
<template>
  <button :class="['button', variant, size, { loading }]">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  loading: { type: Boolean, default: false }
})
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

.primary {
  background: #0ea5e9;
  color: white;
}

.secondary {
  background: white;
  border: 1px solid #cbd5e1;
}

.loading {
  color: transparent;
}
</style>
```

### 5.3 Tailwind with @apply (Component Extraction)

**File:** `styles/components/button.css`

```css
@layer components {
  .btn {
    @apply inline-flex items-center gap-2 rounded-md font-medium transition-all duration-150;
  }
  
  .btn-primary {
    @apply btn bg-primary-500 text-white hover:bg-primary-600;
  }
  
  .btn-secondary {
    @apply btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50;
  }
  
  .btn-sm {
    @apply px-3 py-1.5 text-sm;
  }
  
  .btn-md {
    @apply px-4 py-2 text-base;
  }
  
  .btn-lg {
    @apply px-6 py-3 text-lg;
  }
  
  .btn-loading {
    @apply relative text-transparent;
  }
  
  .btn-loading::after {
    @apply content-[''] absolute w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin;
  }
}
```

**Import in main CSS:**
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import './components/button.css';
@import 'tailwindcss/utilities';
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ NEVER DO THESE

1. **Deep nesting in CSS**
   ```css
   /* BAD - 5 levels deep */
   .card .header .title .icon svg {
     fill: blue;
   }
   
   /* GOOD - 2 levels max */
   .card__icon {
     fill: blue;
   }
   ```

2. **Magic numbers in classes**
   ```css
   /* BAD */
   .margin-top-37 {
     margin-top: 37px;
   }
   
   /* GOOD */
   .mt-lg {
     margin-top: var(--space-lg);
   }
   ```

3. **Over-specific selectors**
   ```css
   /* BAD */
   div.container > ul.list > li.item a.link {
     color: blue;
   }
   
   /* GOOD */
   .link {
     color: blue;
   }
   ```

4. **Global styles without scoping**
   ```css
   /* BAD - affects ALL buttons */
   button {
     background: blue;
   }
   
   /* GOOD - scoped component */
   .btn-primary {
     background: blue;
   }
   ```

5. **Mixing Tailwind with arbitrary values**
   ```html
   <!-- BAD -->
   <div class="mt-[37px] w-[123px] text-[#1a2b3c]">
   
   <!-- GOOD - use config tokens -->
   <div class="mt-8 w-32 text-primary-600">
   ```

6. **ID selectors in CSS**
   ```css
   /* BAD - 100 specificity, hard to override */
   #header {
     height: 60px;
   }
   
   /* GOOD - class-based, 10 specificity */
   .header {
     height: 60px;
   }
   ```

---

## ✅ Verification Checklist

### Before Implementation
- [ ] Tailwind config has semantic color names (not hex values)
- [ ] Spacing uses 8px grid multiples
- [ ] CSS variables defined for all design tokens
- [ ] Dark mode tokens configured (if applicable)
- [ ] No arbitrary Tailwind values (use config extensions)

### During Implementation
- [ ] BEM naming used for legacy CSS (block__element--modifier)
- [ ] CSS nesting limited to 2 levels max
- [ ] Specificity kept low (avoid !important, IDs, deep nesting)
- [ ] Component styles isolated (CSS Modules, scoped, or CSS-in-JS)
- [ ] No magic numbers - use design tokens

### After Implementation
- [ ] CSS bundle size checked (no unused styles)
- [ ] Dark mode renders correctly
- [ ] No style conflicts between components
- [ ] Build passes without CSS errors
- [ ] Visual regression tests pass

### Performance Checks
- [ ] No unused CSS in production bundle
- [ ] CSS minified and compressed
- [ ] Critical CSS inlined for above-fold content
- [ ] No @import in CSS (use bundler instead)

---

## 🔒 SKILL VERSION

```
Skill: CSS Architecture
Version: 1.1.0
Last Updated: 2026-02-06
Patterns: Tailwind (semantic tokens), BEM, CSS-in-JS, CSS Variables, Isolation, cn/twMerge
Use On: All styling tasks
Anti-Patterns: Deep nesting, magic numbers, !important, ID selectors
```

---

**See Also:**
- `design-systems` skill - Component libraries, tokens
- `performance-optimization` skill - CSS bundle optimization
- `accessibility-wcag` skill - A11y compliance in styling
