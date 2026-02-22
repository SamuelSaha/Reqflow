---
description: "UI Implementation from Design Specs - Pixel-perfect execution"
trigger: "/ui-implementation"
time_budget: "2-3 hours"
---

# 🎨 UI IMPLEMENTATION PROTOCOL

> **TRIGGER:** `/ui-implementation`
> **GOAL:** Implement pixel-perfect UI from design specifications
> **TIME ESTIMATE:** 2-3 hours
> **OUTPUT:** Production-ready, tested component

---

## 🎯 Quick Summary

This workflow transforms design specs into production code through systematic implementation of structure, styling, interactions, accessibility, and testing. Each step has mandatory verification gates.

---

## 🚨 PRE-FLIGHT CHECKS

Before starting, verify:
- [ ] Figma/Sketch file URL or wireframe available
- [ ] Component architecture spec exists (from `/component-architecture`)
- [ ] Design system tokens accessible
- [ ] Storybook environment ready
- [ ] Test environment configured

---

## 📊 Execution Dashboard

| Step | Agent | Duration | Status |
|------|-------|----------|--------|
| 1. Design Spec Review | @swarm-ux | 10 min | ⬜ |
| 2. Component Architecture | @swarm-arch | 5 min | ⬜ |
| 3. HTML Structure | @swarm-dev | 15 min | ⬜ |
| 4. Tailwind Implementation | @swarm-dev | 25 min | ⬜ |
| 5. Interaction States | @swarm-dev | 20 min | ⬜ |
| 6. Responsive Behavior | @swarm-dev | 15 min | ⬜ |
| 7. Accessibility | @swarm-dev | 20 min | ⬜ |
| 8. Component Testing | @swarm-qa | 20 min | ⬜ |
| 9. Visual Regression | @swarm-qa | 15 min | ⬜ |
| 10. Performance Check | @swarm-dev | 10 min | ⬜ |

**Total Time:** 2 hours 55 minutes (max 3 hours)

---

## 🎯 Why These Agents

| Step | Agent | Reasoning |
|------|-------|-----------|
| Design Review | @swarm-ux | Extract design specs accurately |
| Architecture | @swarm-arch | Reference existing architecture spec |
| HTML/Tailwind | @swarm-dev | Code implementation |
| States/Responsive | @swarm-dev | Interaction and layout logic |
| Accessibility | @swarm-dev | A11y implementation (skill guided) |
| Testing | @swarm-qa | Test implementation and verification |
| Performance | @swarm-dev | Bundle and runtime optimization |

---

## 📋 Workflow Steps

### STEP 1: DESIGN SPEC REVIEW (10 min)
**Relevant Expertise:** Visual Design, Design System Analysis

**Description:**
Extract all specifications from Figma/wireframe including dimensions, colors, typography, spacing, and behavior.

**Extraction Checklist:**

**Visual Specs:**
- [ ] Width/height (fixed or fluid)
- [ ] Padding values (all sides)
- [ ] Margin values
- [ ] Border radius
- [ ] Border width and color
- [ ] Background color
- [ ] Shadow/elevation level

**Typography:**
- [ ] Font family
- [ ] Font size
- [ ] Font weight
- [ ] Line height
- [ ] Letter spacing
- [ ] Text color
- [ ] Text alignment

**Component States:**
- [ ] Default state
- [ ] Hover state
- [ ] Active/pressed state
- [ ] Focus state
- [ ] Disabled state
- [ ] Loading state
- [ ] Error state

**Interactions:**
- [ ] Click behavior
- [ ] Keyboard support
- [ ] Animation/transition specs

**Output:**
```markdown
## Design Spec Extraction: [Component Name]

**Source:** [Figma URL/Wireframe]

### Dimensions
- Width: [value]
- Height: [value]
- Padding: [value]

### Colors
- Background: [token/hex]
- Text: [token/hex]
- Border: [token/hex]

### Typography
- Font: [token]
- Size: [token/value]
- Weight: [value]

### States
- Default: [classes/tokens]
- Hover: [classes/tokens]
- Active: [classes/tokens]
- Focus: [classes/tokens]
- Disabled: [classes/tokens]

### Interactions
- [Interaction 1]: [spec]
- [Interaction 2]: [spec]
```

**Exit Criteria:**
- [ ] All visual specs extracted
- [ ] All states documented
- [ ] All interactions noted

**Micro-Checkpoint:** ✅ Design specs fully extracted

**Turbo:**
```bash
# Use Figma API to extract tokens (if configured)
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  https://api.figma.com/v1/files/[FILE_ID]/styles
```

---

### STEP 2: COMPONENT ARCHITECTURE (5 min)
**Relevant Expertise:** System Architecture

**Description:**
Load and review the component architecture specification from `/component-architecture` workflow.

**Load Checklist:**
- [ ] Architecture document exists
- [ ] Props interface matches design needs
- [ ] Composition pattern still appropriate
- [ ] State management approach confirmed

**Validation:**
```
Does architecture spec match design spec?
├─ Props cover all design variations? → If NO, update interface
├─ States match design states? → If NO, add state definitions  
└─ Composition supports design layout? → If NO, revise pattern
```

**Exit Criteria:**
- [ ] Architecture spec reviewed
- [ ] Mismatches resolved
- [ ] Implementation plan updated

**Micro-Checkpoint:** ✅ Architecture validated against design

---

### STEP 3: HTML STRUCTURE (15 min)
**Relevant Expertise:** Semantic HTML, Accessibility

**Description:**
Create semantic HTML structure following accessibility best practices.

**Semantic Guidelines:**

| Element | Use For | ARIA Role |
|---------|---------|-----------|
| `<button>` | Clickable actions | button |
| `<a>` | Navigation | link |
| `<input>` | Text input | textbox |
| `<label>` | Input labels | N/A |
| `<nav>` | Navigation sections | navigation |
| `<main>` | Main content | main |
| `<section>` | Thematic grouping | region |
| `<article>` | Self-contained content | article |

**Structure Template:**
```tsx
// Component structure
export function Component({ ...props }: ComponentProps) {
  return (
    <Element
      role="[appropriate-role]"
      aria-[attribute]="[value]"
      className="[base-classes]"
    >
      {/* Header/Label */}
      {label && <label htmlFor={id}>{label}</label>}
      
      {/* Main content */}
      <div className="[content-classes]">
        {children}
      </div>
      
      {/* Footer/Actions */}
      {actions && <div className="[actions-classes]">{actions}</div>}
    </Element>
  )
}
```

**Accessibility Checklist:**
- [ ] Semantic element used (not just `<div>`)
- [ ] `id` for label association (forms)
- [ ] `role` when semantic element insufficient
- [ ] `aria-label` for icon-only elements
- [ ] `aria-expanded` for expandable content
- [ ] `aria-pressed` for toggle buttons
- [ ] `aria-current` for current nav item

**Exit Criteria:**
- [ ] Semantic HTML structure complete
- [ ] ARIA attributes added where needed
- [ ] Label associations correct

**Micro-Checkpoint:** ✅ Semantic HTML structure complete

**Turbo:**
```bash
# Validate HTML structure
npx html-validate src/components/Component.tsx
```

---

### STEP 4: TAILWIND IMPLEMENTATION (25 min)
**Relevant Expertise:** Tailwind CSS, Design Tokens

**Description:**
Implement all visual styling using Tailwind utility classes and design tokens. NO arbitrary values.

**Token-First Rule:**
```
ALWAYS use tokens:
✅ bg-primary-500
✅ text-slate-700  
✅ p-4 (not p-[16px])
✅ rounded-md (not rounded-[6px])

NEVER use arbitrary values:
❌ bg-[#0ea5e9]
❌ text-[#334155]
❌ p-[16px]
❌ w-[123px]
```

**Implementation Approach:**

1. **Base Classes (always applied):**
```tsx
const baseClasses = `
  flex items-center justify-center
  rounded-md font-medium
  transition-colors duration-150
  focus-visible:outline-none focus-visible:ring-2
  disabled:pointer-events-none disabled:opacity-50
`
```

2. **Variant Classes (CVA):**
```tsx
import { cva } from 'class-variance-authority'

const componentVariants = cva(baseClasses, {
  variants: {
    variant: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    },
    size: {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-11 px-6 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})
```

3. **Class Composition Utility:**
```tsx
import { cn } from '@/lib/utils'

// Merge base, variants, and overrides
const className = cn(
  componentVariants({ variant, size }),
  className // Allow consumer overrides
)
```

**Verification Checklist:**
- [ ] No arbitrary values (search for `-[` in classes)
- [ ] All colors use semantic tokens
- [ ] Spacing uses 8px grid tokens
- [ ] Typography uses type scale
- [ ] Shadows use elevation tokens
- [ ] CVA variants cover all design variants

**Exit Criteria:**
- [ ] All styles implemented with tokens
- [ ] CVA variants defined
- [ ] No arbitrary values present

**Micro-Checkpoint:** ✅ Tailwind implementation complete

**Turbo:**
```bash
# Check for arbitrary values
grep -r "\-[\[" src/components/Component/

# If any found, replace with tokens
```

---

### STEP 5: INTERACTION STATES (20 min)
**Relevant Expertise:** React State, Event Handling

**Description:**
Implement all interaction states: hover, focus, active, disabled, loading, error.

**State Implementation Matrix:**

| State | Tailwind | React Logic | Visual |
|-------|----------|-------------|--------|
| Hover | `hover:` | N/A | Design spec |
| Focus | `focus-visible:` | `onFocus` | Ring/shadow |
| Active | `active:` | `onMouseDown` | Pressed |
| Disabled | `disabled:` | `disabled` prop | 50% opacity |
| Loading | `aria-busy` | `loading` prop | Spinner |
| Error | `data-error` | `error` prop | Red border |

**Implementation Patterns:**

```tsx
// Hover/Focus/Active (Tailwind only)
<button className="
  bg-primary-500
  hover:bg-primary-600
  active:bg-primary-700
  focus-visible:ring-2 focus-visible:ring-primary-500
">

// Disabled (prop + Tailwind)
<button 
  disabled={disabled}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>

// Loading (state + visual)
<button disabled={loading}>
  {loading && <Spinner className="mr-2" />}
  {loading ? loadingText : children}
</button>

// Error (data attribute + CSS)
<input 
  data-error={!!error}
  className="data-[error=true]:border-red-500"
/>
{error && <span className="text-red-500 text-sm">{error}</span>}
```

**State Testing Checklist:**
- [ ] Hover styles applied
- [ ] Focus ring visible
- [ ] Active/pressed state working
- [ ] Disabled state prevents interaction
- [ ] Loading state shows spinner
- [ ] Error state shows message + styling

**Exit Criteria:**
- [ ] All states implemented
- [ ] State transitions smooth (150-200ms)
- [ ] No visual glitches

**Micro-Checkpoint:** ✅ All interaction states working

---

### STEP 6: RESPONSIVE BEHAVIOR (15 min)
**Relevant Expertise:** Responsive Design, Mobile-First

**Description:**
Implement responsive behavior using mobile-first breakpoints.

**Mobile-First Approach:**
```css
/* Base: Mobile (320px+) */
.element {
  padding: 1rem;  /* Mobile spacing */
}

/* sm: 640px+ */
@media (min-width: 640px) {
  .element {
    padding: 1.5rem;
  }
}

/* md: 768px+ */
@media (min-width: 768px) {
  .element {
    padding: 2rem;
  }
}

/* lg: 1024px+ */
@media (min-width: 1024px) {
  .element {
    padding: 3rem;
  }
}
```

**Tailwind Implementation:**
```tsx
// Mobile-first classes
<div className="
  w-full           /* Mobile: full width */
  sm:w-auto        /* sm+: auto width */
  md:w-96          /* md+: fixed width */
  
  px-4             /* Mobile: small padding */
  md:px-8          /* md+: larger padding */
  
  text-sm          /* Mobile: small text */
  md:text-base     /* md+: normal text */
  
  flex-col         /* Mobile: stacked */
  sm:flex-row      /* sm+: horizontal */
">
```

**Breakpoint Usage Guide:**

| Breakpoint | Use For | Min Width |
|------------|---------|-----------|
| (none) | Mobile base | 0px |
| `sm:` | Large phones | 640px |
| `md:` | Tablets | 768px |
| `lg:` | Desktop | 1024px |
| `xl:` | Large desktop | 1280px |

**Touch Target Sizes:**
```
Minimum touch targets:
- Buttons: 44px × 44px
- Form inputs: 48px height
- Links: 44px height
- Checkboxes: 24px × 24px
```

**Exit Criteria:**
- [ ] Mobile layout implemented
- [ ] Breakpoints follow design specs
- [ ] Touch targets ≥44px on mobile
- [ ] Text readable at all sizes (≥16px base)

**Micro-Checkpoint:** ✅ Responsive behavior complete

**Turbo:**
```bash
# Test responsive in dev tools
# Open Chrome DevTools → Device Toolbar
# Test: iPhone SE (375px), iPad (768px), Desktop (1440px)
```

---

### STEP 7: ACCESSIBILITY IMPLEMENTATION (20 min)
**Relevant Expertise:** WCAG 2.2, ARIA, Keyboard Navigation

**Description:**
Implement full accessibility support including ARIA attributes, keyboard navigation, and screen reader support.

**WCAG 2.2 AA Checklist:**

**Perceivable:**
- [ ] Color contrast ≥4.5:1 (text)
- [ ] Color contrast ≥3:1 (UI components)
- [ ] Text resize up to 200% works
- [ ] Images have alt text

**Operable:**
- [ ] All functionality keyboard accessible
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Skip links for navigation (if needed)

**Understandable:**
- [ ] Error messages clear
- [ ] Labels associated with inputs
- [ ] Consistent navigation

**Robust:**
- [ ] Valid HTML
- [ ] ARIA used correctly

**Implementation Patterns:**

```tsx
// 1. Label Association
<label htmlFor={id}>{label}</label>
<input id={id} aria-describedby={error ? errorId : undefined} />
{error && <span id={errorId} role="alert">{error}</span>}

// 2. Button Accessibility
<button
  aria-label={iconOnly ? label : undefined}
  aria-pressed={isPressed}
  aria-expanded={isExpanded}
  aria-controls={controlsId}
  disabled={disabled}
>

// 3. Navigation
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" aria-current={isCurrent ? 'page' : undefined}>

// 4. Live Regions
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// 5. Modal/Dialog
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
>
  <h2 id={titleId}>Dialog Title</h2>
  <p id={descriptionId}>Description</p>
</div>
```

**Keyboard Navigation:**
```tsx
// Focus management
const buttonRef = useRef<HTMLButtonElement>(null)

// Focus on mount (if needed)
useEffect(() => {
  if (autoFocus) buttonRef.current?.focus()
}, [autoFocus])

// Keyboard handler
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      handleClick()
      break
    case 'Escape':
      onClose?.()
      break
    case 'Tab':
      // Handle tab trap for modals
      manageTabTrap(e)
      break
  }
}
```

**Exit Criteria:**
- [ ] All ARIA attributes present
- [ ] Keyboard navigation works
- [ ] Focus visible and logical
- [ ] Screen reader tested (VoiceOver/NVDA)

**Micro-Checkpoint:** ✅ Accessibility implementation complete

**Turbo:**
```bash
# Run axe accessibility check
npx @axe-core/cli http://localhost:3000

# Or use browser extension:
# Chrome: axe DevTools
# Firefox: WAVE
```

---

### STEP 8: COMPONENT TESTING (20 min)
**Relevant Expertise:** React Testing Library, Jest/Vitest

**Description:**
Write comprehensive component tests covering rendering, interactions, and accessibility.

**Test File Structure:**
```typescript
// Component.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component } from './Component'

describe('Component', () => {
  // Setup
  const user = userEvent.setup()
  
  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Component>Content</Component>)
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
    
    it('renders all variants', () => {
      const { rerender } = render(<Component variant="primary" />)
      expect(screen.getByRole('button')).toHaveClass('bg-primary-600')
      
      rerender(<Component variant="secondary" />)
      expect(screen.getByRole('button')).toHaveClass('bg-gray-100')
    })
  })
  
  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const onClick = vi.fn()
      render(<Component onClick={onClick} />)
      
      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })
    
    it('handles keyboard activation', async () => {
      const onClick = vi.fn()
      render(<Component onClick={onClick} />)
      
      await user.tab()
      await user.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalled()
    })
  })
  
  describe('States', () => {
    it('shows disabled state', () => {
      render(<Component disabled />)
      expect(screen.getByRole('button')).toBeDisabled()
    })
    
    it('shows loading state', () => {
      render(<Component loading />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })
  })
  
  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Component aria-label="Close" />)
      expect(screen.getByLabelText('Close')).toBeInTheDocument()
    })
    
    it('is keyboard accessible', async () => {
      render(<Component />)
      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()
    })
  })
})
```

**Test Coverage Requirements:**
- [ ] 100% of props tested
- [ ] All variants rendered
- [ ] All interactions tested
- [ ] All states verified
- [ ] A11y attributes checked

**Exit Criteria:**
- [ ] All tests passing
- [ ] Coverage ≥80%
- [ ] No test warnings

**Micro-Checkpoint:** ✅ Component tests passing

**Turbo:**
```bash
# Run tests
npm test Component.test.tsx

# Run with coverage
npm test -- --coverage Component.test.tsx
```

---

### STEP 9: VISUAL REGRESSION (15 min)
**Relevant Expertise:** Visual Testing, Storybook

**Description:**
Set up visual regression testing using Storybook and Chromatic/Loki.

**Storybook Stories for Visual Testing:**
```typescript
// Component.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Component } from './Component'

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  tags: ['autodocs'],
  parameters: {
    chromatic: {
      disableSnapshot: false,
    },
  },
}

export default meta

// Visual test: All variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Component variant="primary">Primary</Component>
      <Component variant="secondary">Secondary</Component>
      <Component variant="outline">Outline</Component>
    </div>
  ),
}

// Visual test: All states
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Component>Default</Component>
      <Component disabled>Disabled</Component>
      <Component loading>Loading</Component>
    </div>
  ),
}

// Visual test: All sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Component size="sm">Small</Component>
      <Component size="md">Medium</Component>
      <Component size="lg">Large</Component>
    </div>
  ),
}

// Visual test: Responsive
export const Responsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: {
      viewports: [320, 768, 1024],
    },
  },
}
```

**Visual Test Checklist:**
- [ ] Default state captured
- [ ] All variants captured
- [ ] All states captured
- [ ] All sizes captured
- [ ] Responsive breakpoints captured

**Exit Criteria:**
- [ ] Stories written
- [ ] Chromatic/Loki configured
- [ ] Baseline snapshots approved

**Micro-Checkpoint:** ✅ Visual regression set up

**Turbo:**
```bash
# Run Storybook
npm run storybook

# Run visual tests (if using Chromatic)
npx chromatic --project-token=$CHROMATIC_TOKEN
```

---

### STEP 10: PERFORMANCE CHECK (10 min)
**Relevant Expertise:** Bundle Analysis, Performance Optimization

**Description:**
Verify component doesn't impact bundle size or runtime performance negatively.

**Performance Checklist:**

**Bundle Impact:**
```bash
# Check bundle size impact
npm run build

# Analyze with bundle analyzer
npm run analyze
```

**Acceptable Limits:**
- Component bundle: <5KB gzipped
- New dependencies: 0 (prefer native)
- CSS added: <1KB

**Runtime Performance:**
```tsx
// Memoization for expensive renders
const MemoizedComponent = React.memo(Component, (prev, next) => {
  return prev.id === next.id
})

// useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.map(expensiveTransform)
}, [data])

// useCallback for stable callbacks
const handleClick = useCallback(() => {
  onAction(id)
}, [id, onAction])
```

**Lighthouse Check:**
```bash
# Run Lighthouse CI
npm run lighthouse

# Check scores
# Performance: >90
# Accessibility: >90
# Best Practices: >90
```

**Exit Criteria:**
- [ ] Bundle size acceptable (<5KB)
- [ ] No new heavy dependencies
- [ ] Memoization applied where needed
- [ ] Lighthouse scores maintained

**Micro-Checkpoint:** ✅ Performance verified

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| Design specs matched pixel-perfect | ✅ |
| HTML semantic and valid | ✅ |
| Tailwind uses only tokens | ✅ |
| All interaction states working | ✅ |
| Responsive on all breakpoints | ✅ |
| WCAG 2.2 AA compliant | ✅ |
| Tests passing (≥80% coverage) | ✅ |
| Visual regression snapshots | ✅ |
| Performance acceptable | ✅ |

**Final Verification:**
```bash
npm run build && npm run test && npm run lint
```

All must pass.

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Design Review | 10 min |
| Architecture | 5 min |
| HTML Structure | 15 min |
| Tailwind | 25 min |
| States | 20 min |
| Responsive | 15 min |
| Accessibility | 20 min |
| Testing | 20 min |
| Visual Regression | 15 min |
| Performance | 10 min |
| **TOTAL** | **2h 55m** |

---

## 🔄 Workflow Relationships

**Uses:**
- `/component-architecture` - Architecture specification
- `css-architecture` skill - Styling patterns
- `design-systems` skill - Component patterns
- `accessibility-wcag` skill - A11y compliance
- `performance-optimization` skill - Performance checks
- `testing-patterns` skill - Testing strategies

**Used By:**
- `/standard-feature` - For UI components within features
- `/epic-feature` - For complex UI implementations

---

## 📝 Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| [Any deviations from spec] | [Why] | [Date] |

---

**Workflow Version:** 1.0.0
**Last Updated:** 2026-02-02
