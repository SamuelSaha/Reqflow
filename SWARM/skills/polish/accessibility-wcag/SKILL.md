---
name: Accessibility WCAG 2.2
description: Complete WCAG 2.2 AA compliance patterns for web applications
version: 1.0.0
primary_agents: [swarm-ux, swarm-ux, swarm-dev]
---

# ♿ Accessibility WCAG 2.2 Skill

> **ACTIVATION:** Accessibility is not optional. 15% of users have disabilities. Build for everyone.

---

## 🎯 WCAG 2.2 AA Essentials

### The Four Principles (POUR)
1. **Perceivable** — Can users perceive the content?
2. **Operable** — Can users operate the interface?
3. **Understandable** — Can users understand the content?
4. **Robust** — Does it work with assistive technologies?

---

## 🔤 SEMANTIC HTML

### Use the Right Elements
```tsx
// ❌ Div soup
<div onClick={handleClick} className="button">Click me</div>

// ✅ Semantic HTML
<button onClick={handleClick}>Click me</button>

// ❌ Fake heading
<div className="text-2xl font-bold">Page Title</div>

// ✅ Real heading
<h1>Page Title</h1>
```

### Heading Hierarchy
```tsx
// ✅ Correct hierarchy
<h1>Page Title</h1>           // Only ONE h1 per page
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>
    <h3>Subsection 2.2</h3>

// ❌ Skipped levels
<h1>Title</h1>
  <h3>Subsection</h3>  // Skipped h2!
```

### Landmark Regions
```tsx
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>

<main role="main">
  <article>
    <h1>Article Title</h1>
  </article>
  <aside aria-label="Related content">...</aside>
</main>

<footer role="contentinfo">...</footer>
```

---

## ⌨️ KEYBOARD NAVIGATION

### Focus Management
```tsx
// Visible focus indicator (NEVER remove)
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

// Focus trap for modals
import { FocusTrap } from 'focus-trap-react'

function Modal({ isOpen, children, onClose }) {
  if (!isOpen) return null
  
  return (
    <FocusTrap>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Modal Title</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </FocusTrap>
  )
}
```

### Skip Links
```tsx
// First element in body
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>

// Target
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

### Tab Order
```tsx
// ✅ Natural tab order (follows DOM)
<button>First</button>
<button>Second</button>
<button>Third</button>

// ⚠️ Only use tabIndex="0" to make non-interactive elements focusable
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>
  Custom Button
</div>

// ❌ NEVER use positive tabIndex
<button tabIndex={2}>This breaks everything</button>
```

---

## 📝 FORMS

### Labels and Descriptions
```tsx
// ✅ Proper labeling
<div>
  <label htmlFor="email">Email address</label>
  <input 
    id="email" 
    type="email"
    aria-describedby="email-hint email-error"
    aria-invalid={hasError}
    required
  />
  <span id="email-hint">We'll never share your email.</span>
  {hasError && (
    <span id="email-error" role="alert">Please enter a valid email.</span>
  )}
</div>

// ✅ For visually hidden labels
<label htmlFor="search" className="sr-only">Search</label>
<input id="search" type="search" placeholder="Search..." />
```

### Error Handling
```tsx
function Form() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  return (
    <form aria-describedby="form-errors">
      {Object.keys(errors).length > 0 && (
        <div 
          id="form-errors" 
          role="alert" 
          aria-live="polite"
          className="error-summary"
        >
          <h2>Please fix the following errors:</h2>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Form fields */}
    </form>
  )
}
```

---

## 🎨 COLOR & CONTRAST

### Minimum Contrast Ratios
```css
/* WCAG AA requirements */
/* Normal text (< 18pt): 4.5:1 contrast ratio */
/* Large text (>= 18pt or 14pt bold): 3:1 contrast ratio */
/* UI components and graphics: 3:1 contrast ratio */

:root {
  /* ✅ High contrast pairs */
  --text-primary: #1a1a1a;      /* On white: 16.1:1 */
  --text-secondary: #525252;    /* On white: 7.0:1 */
  --text-on-primary: #ffffff;   /* On accent: check! */
  
  /* ❌ Avoid pure gray on white */
  --bad-gray: #999999;          /* On white: 2.8:1 - FAIL */
}
```

### Don't Rely on Color Alone
```tsx
// ❌ Color-only status
<span style={{ color: 'red' }}>Error</span>
<span style={{ color: 'green' }}>Success</span>

// ✅ Color + icon + text
<span className="text-red-600 flex items-center gap-2">
  <XCircleIcon aria-hidden="true" />
  <span>Error: {message}</span>
</span>

<span className="text-green-600 flex items-center gap-2">
  <CheckCircleIcon aria-hidden="true" />
  <span>Success: {message}</span>
</span>
```

---

## 🖼️ IMAGES & MEDIA

### Alternative Text
```tsx
// Informative image - describe it
<img 
  src="/chart.png" 
  alt="Sales increased 25% from January to March 2024"
/>

// Decorative image - empty alt
<img src="/decorative-wave.svg" alt="" />

// Complex image - detailed description
<figure>
  <img 
    src="/org-chart.png" 
    alt="Organization chart"
    aria-describedby="org-chart-desc"
  />
  <figcaption id="org-chart-desc">
    CEO at top, three VPs reporting to CEO, each VP has 2-3 directors.
  </figcaption>
</figure>
```

### Video & Audio
```tsx
// Captions for video
<video controls>
  <source src="/video.mp4" type="video/mp4" />
  <track 
    kind="captions" 
    src="/captions.vtt" 
    srclang="en" 
    label="English captions"
    default
  />
</video>

// Transcript for audio
<div>
  <audio controls src="/podcast.mp3" aria-describedby="podcast-transcript" />
  <details id="podcast-transcript">
    <summary>Read transcript</summary>
    <p>...</p>
  </details>
</div>
```

---

## 🔔 LIVE REGIONS

### Announcements
```tsx
// For status messages
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : ''}
</div>

// For urgent alerts
<div role="alert" aria-live="assertive">
  {error}
</div>

// Custom announcement
function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = document.createElement('div')
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', priority)
  el.className = 'sr-only'
  el.textContent = message
  document.body.appendChild(el)
  
  setTimeout(() => el.remove(), 1000)
}

// Usage
announce('Form submitted successfully')
```

---

## 🧪 TESTING

### Automated Testing
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    // Enable accessibility testing
  },
})

// tests/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('accessibility', () => {
  test('home page should have no violations', async ({ page }) => {
    await page.goto('/')
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze()
    
    expect(results.violations).toEqual([])
  })
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Tab through the page
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => 
      document.activeElement?.tagName
    )
    expect(firstFocused).toBeTruthy()
  })
})
```

### Manual Testing Checklist
```markdown
## Keyboard Testing
- [ ] All interactive elements reachable with Tab
- [ ] Focus visible at all times
- [ ] Focus order follows visual order
- [ ] Modals trap focus
- [ ] Escape closes modals

## Screen Reader Testing
- [ ] All content announced correctly
- [ ] Form labels read properly
- [ ] Errors announced immediately
- [ ] State changes communicated

## Visual Testing
- [ ] Color contrast passes (use Stark/axe)
- [ ] Works at 200% zoom
- [ ] Text resizes properly
- [ ] Motion can be reduced
```

---

## 🎛️ UTILITY CLASSES

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## ✅ A11Y CHECKLIST

Before shipping:

- [ ] All images have appropriate alt text
- [ ] Color contrast ratios meet AA (4.5:1 / 3:1)
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Skip link exists
- [ ] Heading hierarchy is logical
- [ ] Forms have proper labels
- [ ] Errors are announced
- [ ] No content relies on color alone
- [ ] Reduced motion preference respected
- [ ] Axe/Lighthouse a11y audit passes
