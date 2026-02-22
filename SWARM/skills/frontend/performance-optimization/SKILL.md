---
name: Performance Optimization
description: Core Web Vitals, lazy loading, code splitting, image optimization, and bundle analysis for blazing fast frontend performance
version: 1.0.0
primary_agents: [swarm-dev, swarm-arch, swarm-ops]
---

# ⚡ Performance Optimization Skill

> **ACTIVATION:** "Apply performance-optimization skill for 90+ Lighthouse scores"

---

## 🎯 Purpose

Ruthlessly effective performance optimization patterns for achieving sub-second LCP, instant FID, and zero CLS across all device classes.

---

## 1. Core Web Vitals Optimization

### 1.1 Targets & Thresholds

```
╔════════════════════════════════════════════════════════════════╗
║                    CORE WEB VITALS TARGETS                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  LCP (Largest Contentful Paint)      < 2.5s  ✅ GOOD           ║
║                                      < 4.0s  ⚠️ NEEDS WORK    ║
║                                      > 4.0s  ❌ POOR           ║
║                                                                ║
║  FID (First Input Delay)             < 100ms ✅ GOOD           ║
║                                      < 300ms ⚠️ NEEDS WORK    ║
║                                      > 300ms ❌ POOR           ║
║                                                                ║
║  CLS (Cumulative Layout Shift)       < 0.1   ✅ GOOD           ║
║                                      < 0.25  ⚠️ NEEDS WORK    ║
║                                      > 0.25  ❌ POOR           ║
║                                                                ║
║  INP (Interaction to Next Paint)     < 200ms ✅ GOOD           ║
║  TTFB (Time to First Byte)           < 800ms ✅ GOOD           ║
║  FCP (First Contentful Paint)        < 1.8s  ✅ GOOD           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### 1.2 LCP Optimization

**Priority Loading for Hero Image:**
```html
<!-- Preload critical LCP image -->
<link rel="preload" as="image" href="/hero.webp" type="image/webp">

<!-- Use proper loading -->
<img
  src="/hero.webp"
  srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  alt="Hero image"
  width="1200"
  height="600"
  fetchpriority="high"
  decoding="async"
>
```

**Priority Font Loading:**
```html
<!-- Preconnect to font CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-bold.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font display swap -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
  }
</style>
```

**Critical CSS Inlining:**
```html
<head>
  <!-- Inline critical CSS (above-fold styles) -->
  <style>
    /* Critical: Layout, typography, hero -->
    body { margin: 0; font-family: system-ui, sans-serif; }
    .hero { min-height: 100vh; display: flex; align-items: center; }
    /* ... only above-fold styles ... */
  </style>
  
  <!-- Async load non-critical CSS -->
  <link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles.css"></noscript>
</head>
```

### 1.3 FID/INP Optimization

**Long Task Splitting:**
```typescript
// BAD: Blocking 500ms
function heavyCalculation(data: Data[]) {
  return data.map(item => expensiveTransform(item))
}

// GOOD: Yield to main thread
async function heavyCalculation(data: Data[]) {
  const results: Result[] = []
  const chunkSize = 100
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    results.push(...chunk.map(item => expensiveTransform(item)))
    
    // Yield to main thread every chunk
    if (i + chunkSize < data.length) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  return results
}
```

**Event Handler Optimization:**
```typescript
// BAD: Synchronous handler blocks input
function onClick() {
  const result = heavySyncCalculation()
  setState(result)
}

// GOOD: Async handler with loading state
async function onClick() {
  setLoading(true)
  
  // Move work off main thread
  const result = await new Promise(resolve => {
    requestIdleCallback(() => {
      resolve(heavySyncCalculation())
    })
  })
  
  setState(result)
  setLoading(false)
}
```

### 1.4 CLS Prevention

**Image/Video Sizing:**
```html
<!-- ALWAYS specify dimensions -->
<img src="photo.jpg" width="800" height="600" alt="Description">

<!-- Or use aspect-ratio -->
<div class="video-container" style="aspect-ratio: 16/9;">
  <iframe src="..." width="100%" height="100%"></iframe>
</div>

<!-- CSS aspect-ratio for modern browsers -->
<style>
  .responsive-image {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
</style>
```

**Font Loading Strategy:**
```css
/* Prevent FOUT/FIT causing CLS */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-weight: 400;
  font-display: optional; /* Skip if not cached */
}

/* Reserve space for fonts */
body {
  font-family: 'Inter', system-ui, sans-serif;
  /* Match fallback font metrics to reduce shift */
}
```

**Dynamic Content Placeholders:**
```tsx
// Skeleton loaders prevent CLS
function CardSkeleton() {
  return (
    <div className="h-48 w-full animate-pulse bg-gray-200 rounded-lg">
      <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
    </div>
  )
}

function AsyncCard() {
  const { data, isLoading } = useData()
  
  if (isLoading) return <CardSkeleton />
  return <Card data={data} />
}
```

---

## 2. Lazy Loading Patterns

### 2.1 Image Lazy Loading

**Native Lazy Loading:**
```html
<!-- Modern browsers (Chrome 76+, Firefox 75+, Safari 15.4+) -->
<img src="photo.jpg" loading="lazy" alt="Description" width="800" height="600">

<!-- Above-fold image - eager load -->
<img src="hero.jpg" loading="eager" fetchpriority="high" alt="Hero">
```

**Intersection Observer (Legacy Support):**
```typescript
// hooks/useLazyImage.ts
import { useEffect, useRef, useState } from 'react'

export function useLazyImage(src: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' } // Start loading 200px before viewport
    )
    
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return { imgRef, isLoaded, shouldLoad, setIsLoaded }
}

// Usage
function LazyImage({ src, alt, ...props }: ImageProps) {
  const { imgRef, isLoaded, shouldLoad, setIsLoaded } = useLazyImage(src)
  
  return (
    <img
      ref={imgRef}
      src={shouldLoad ? src : undefined}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 300ms' }}
      {...props}
    />
  )
}
```

### 2.2 Component Lazy Loading

**React.lazy with Suspense:**
```typescript
// routes/index.tsx
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

// Lazy load route components
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

// Loading fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
  </div>
)

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

**Dynamic Imports for Heavy Components:**
```typescript
// components/DataTable/index.tsx
import { lazy, Suspense, useState } from 'react'

// Heavy chart component - only load when needed
const HeavyChart = lazy(() => import('./HeavyChart'))

export function DataTableWithChart({ data }: { data: Data[] }) {
  const [showChart, setShowChart] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart data={data} />
        </Suspense>
      )}
    </div>
  )
}
```

### 2.3 Route-Based Code Splitting

**Next.js Dynamic Routes:**
```typescript
// app/page.tsx (server component - always loaded)
import { Suspense } from 'react'

// Lazy load below-fold content
import { lazy } from 'react'
const Testimonials = lazy(() => import('./Testimonials'))
const FAQ = lazy(() => import('./FAQ'))

export default function HomePage() {
  return (
    <main>
      {/* Critical content - loaded immediately */}
      <Hero />
      <Features />
      
      {/* Below-fold - lazy loaded */}
      <Suspense fallback={<div className="h-96" />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<div className="h-96" />}>
        <FAQ />
      </Suspense>
    </main>
  )
}
```

---

## 3. Code Splitting Strategies

### 3.1 Vendor Chunk Splitting

**Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts', 'd3'],
          'form-vendor': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
```

**Webpack Configuration:**
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
}
```

### 3.2 Route-Based Splitting

```typescript
// Router with code splitting
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home'),
    preload: true, // Preload on hover
  },
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard'),
  },
  {
    path: '/admin',
    component: () => import('./pages/Admin'),
    // Heavy admin bundle - only load when needed
  },
]

// Preload on hover
function NavLink({ route, children }: NavLinkProps) {
  return (
    <a
      href={route.path}
      onMouseEnter={() => route.preload && route.component()}
    >
      {children}
    </a>
  )
}
```

---

## 4. Image Optimization

### 4.1 Modern Image Formats

**Format Priority:**
1. **AVIF** - Best compression, newer support
2. **WebP** - Great compression, wide support
3. **JPEG XL** - Future format (limited support)
4. **JPEG/PNG** - Fallback

**Picture Element with Fallbacks:**
```html
<picture>
  <!-- AVIF for browsers that support it -->
  <source 
    srcset="image-400.avif 400w, image-800.avif 800w, image-1200.avif 1200w"
    sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
    type="image/avif"
  >
  
  <!-- WebP for browsers that support it -->
  <source 
    srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
    sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
    type="image/webp"
  >
  
  <!-- JPEG fallback -->
  <img 
    src="image-800.jpg" 
    srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
    sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
    alt="Description"
    width="800"
    height="600"
    loading="lazy"
  >
</picture>
```

### 4.2 Responsive Images

**Next.js Image Component:**
```tsx
import Image from 'next/image'

// Automatic optimization + responsive
<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  priority={false} // Set true for LCP image
  quality={85} // 0-100, default 75
/>

// Fill mode (responsive container)
<div className="relative h-64 w-full">
  <Image
    src="/hero.jpg"
    alt="Hero"
    fill
    className="object-cover"
    sizes="100vw"
    priority
  />
</div>
```

**Sharp.js for Server-Side Optimization:**
```typescript
// api/optimize-image.ts
import sharp from 'sharp'

export async function optimizeImage(
  buffer: Buffer,
  options: { width?: number; height?: number; format?: 'webp' | 'avif' | 'jpeg' }
) {
  let pipeline = sharp(buffer)
  
  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }
  
  switch (options.format) {
    case 'webp':
      pipeline = pipeline.webp({ quality: 85 })
      break
    case 'avif':
      pipeline = pipeline.avif({ quality: 80 })
      break
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: 90, progressive: true })
      break
  }
  
  return await pipeline.toBuffer()
}
```

### 4.3 SVG Optimization

**Inline SVG vs Sprite:**
```html
<!-- BAD: Multiple identical inline SVGs -->
<svg>...</svg> <!-- 50 times -->

<!-- GOOD: SVG Sprite -->
<svg class="icon">
  <use href="/icons.svg#search"></use>
</svg>

<!-- Or SVG symbol definition -->
<svg style="display: none;">
  <defs>
    <symbol id="search" viewBox="0 0 24 24">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </symbol>
  </defs>
</svg>
```

---

## 5. Bundle Analysis & Optimization

### 5.1 Bundle Analysis Tools

**Vite Bundle Visualizer:**
```bash
# Install
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})

# Build and analyze
npm run build
```

**Webpack Bundle Analyzer:**
```bash
npm install -D webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true,
    }),
  ],
}
```

### 5.2 Tree Shaking

**ESM for Tree Shaking:**
```typescript
// GOOD: Named exports (tree-shakeable)
export { Button } from './Button'
export { Card } from './Card'
export { Input } from './Input'

// BAD: Barrel export with side effects
import * as components from './components'
export default components

// GOOD: Explicit imports
import { Button } from './components'
// NOT: import * as UI from './components'
```

**Package.json Side Effects:**
```json
{
  "name": "my-library",
  "sideEffects": [
    "*.css",
    "*.scss"
  ],
  "main": "dist/index.js",
  "module": "dist/index.esm.js"
}
```

---

## 6. Preloading/Prefetching Strategies

### 6.1 Resource Hints

```html
<head>
  <!-- Preconnect to critical domains -->
  <link rel="preconnect" href="https://api.example.com">
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  
  <!-- DNS prefetch for non-critical domains -->
  <link rel="dns-prefetch" href="https://analytics.example.com">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/hero.webp" as="image" type="image/webp">
  
  <!-- Prefetch likely next page -->
  <link rel="prefetch" href="/about">
  
  <!-- Preload next route chunks -->
  <link rel="modulepreload" href="/chunks/dashboard.js">
</head>
```

### 6.2 Predictive Prefetching

```typescript
// hooks/usePrefetchRoute.ts
import { useEffect } from 'react'

export function usePrefetchRoute(route: string) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
    
    return () => {
      document.head.removeChild(link)
    }
  }, [route])
}

// Prefetch on hover
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const prefetch = usePrefetchRoute(to)
  
  return (
    <a 
      href={to}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {children}
    </a>
  )
}
```

---

## 7. Performance Budgets

### 7.1 Budget Configuration

**Lighthouse CI Budget:**
```json
// budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "document",
        "budget": 20
      },
      {
        "resourceType": "stylesheet",
        "budget": 50
      },
      {
        "resourceType": "image",
        "budget": 300
      },
      {
        "resourceType": "script",
        "budget": 200
      },
      {
        "resourceType": "font",
        "budget": 100
      },
      {
        "resourceType": "total",
        "budget": 1000
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "third-party",
        "budget": 10
      }
    ],
    "timings": [
      {
        "metric": "interactive",
        "budget": 3500
      },
      {
        "metric": "first-meaningful-paint",
        "budget": 1500
      },
      {
        "metric": "speed-index",
        "budget": 2000
      }
    ]
  }
]
```

**Bundle Size Limits:**
```javascript
// webpack.config.js
module.exports = {
  performance: {
    hints: 'error',
    maxEntrypointSize: 250000, // 250kb
    maxAssetSize: 250000,
  },
}
```

### 7.2 CI Performance Gates

```yaml
# .github/workflows/performance.yml
name: Performance Check

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**lighthouserc.js:**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      startServerCommand: 'npm run start',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
}
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ NEVER DO THESE

1. **Render-blocking resources**
   ```html
   <!-- BAD -->
   <link rel="stylesheet" href="/heavy.css"> <!-- in <head> without async -->
   <script src="/app.js"></script> <!-- in <head> without defer/async -->
   
   <!-- GOOD -->
   <link rel="preload" href="/critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
   <script src="/app.js" defer></script>
   ```

2. **Unoptimized images**
   ```html
   <!-- BAD - 5MB PNG -->
   <img src="/huge.png" width="800" height="600">
   
   <!-- GOOD - 50KB WebP with responsive sizes -->
   <picture>
     <source srcset="/image-400.webp 400w, /image-800.webp 800w" type="image/webp">
     <img src="/image-800.jpg" width="800" height="600" loading="lazy">
   </picture>
   ```

3. **Massive third-party scripts**
   ```html
   <!-- BAD - Load all analytics immediately -->
   <script src="https://analytics.com/full-suite.js"></script>
   
   <!-- GOOD - Lazy load non-critical analytics -->
   <script>
     window.addEventListener('load', () => {
       import('https://analytics.com/lite.js')
     })
   </script>
   ```

4. **Synchronous font loading**
   ```css
   /* BAD - Blocks rendering */
   @import url('https://fonts.googleapis.com/css2?family=Inter');
   
   /* GOOD - Async with swap */
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
   ```

5. **Unused JavaScript/CSS**
   ```javascript
   // BAD - Import entire library
   import _ from 'lodash'
   
   // GOOD - Import only what you need
   import debounce from 'lodash/debounce'
   // Or use: import { debounce } from 'lodash-es'
   ```

---

## ✅ Verification Checklist

### Before Launch
- [ ] Lighthouse score ≥ 90 (Performance)
- [ ] LCP < 2.5s on 4G
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Total bundle size < 200KB (gzipped)
- [ ] First-party JS < 100KB (gzipped)
- [ ] Images optimized (WebP/AVIF with fallbacks)
- [ ] Fonts use `font-display: swap`
- [ ] No render-blocking resources

### Performance Testing
- [ ] Test on 3G connection (Chrome DevTools)
- [ ] Test on low-end device (Moto G4 simulation)
- [ ] Test with JavaScript disabled (progressive enhancement)
- [ ] Run Lighthouse CI in pipeline
- [ ] Check Core Web Vitals in Search Console

### Bundle Analysis
- [ ] Analyze bundle with rollup-plugin-visualizer
- [ ] No duplicate dependencies (check with `npm ls`)
- [ ] All imports are ESM (tree-shakeable)
- [ ] No unused code (dead code elimination working)
- [ ] Vendor chunks split by size > 150KB

### Monitoring
- [ ] Real User Monitoring (RUM) configured
- [ ] Web Vitals reporting to analytics
- [ ] Error tracking for performance issues
- [ ] Alerting for performance regression

---

## 🔒 SKILL VERSION

```
Skill: Performance Optimization
Version: 1.0.0
Last Updated: 2026-02-02
Targets: LCP < 2.5s, FID < 100ms, CLS < 0.1, Lighthouse ≥ 90
Use On: All frontend implementations
Anti-Patterns: Render-blocking, unoptimized assets, sync loading
```

---

**See Also:**
- `css-architecture` skill - Style optimization
- `design-systems` skill - Component optimization
- `next15-patterns` skill - Framework-specific patterns
