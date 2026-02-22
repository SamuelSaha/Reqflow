---
name: SEO Optimization
description: Technical and content SEO for search visibility and organic growth
version: 1.1.0
primary_agents: [swarm-growth, swarm-ux]
---

# 🔍 SEO Optimization Skill

> **ACTIVATION:** Search is the highest-intent traffic source. Technical excellence + content relevance = sustainable growth.

---

## 0. Canonicalization & Truthfulness (Mandatory)

**Problem this prevents:** SEO dilution from duplicate pages, “two competing truths” after renames, and metadata that promises what the product doesn’t do.

### When a page is renamed / merged / replaced
1. **Pick one canonical URL** (the new “source of truth” route).
2. **301 redirect legacy URLs** to the canonical route (no soft 200s for duplicates).
3. **Update internal links** to point to the canonical route (don’t rely on redirects internally).
4. **Set canonical tags** on the canonical route (and never self-canonicalize legacy URLs that redirect).
5. **Update sitemap / nav / breadcrumbs** so discovery aligns to the canonical route.

### Verification (Minimum)
- Redirect correctness (status + Location header)
- Canonical tag present and correct
- Title/description match actual content (no overpromises)

---

## 🎯 Core Principles

1. **Technical Foundation First** — Crawlability, speed, mobile-first
2. **Content Relevance** — Match search intent, not just keywords
3. **User Experience Signals** — CTR, dwell time, bounce rate matter
4. **Authority Building** — Quality backlinks, brand mentions
5. **Continuous Iteration** — SEO is never "done"

---

## 🏗️ Technical SEO

### Meta Tags (Essential)

```html
<!-- ✅ Every page must have these -->
<head>
  <!-- Character encoding and viewport -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Title: 50-60 characters, unique per page -->
  <title>Product Name | Category | Brand Name</title>
  
  <!-- Description: 150-160 characters, compelling CTA -->
  <meta name="description" content="Learn how our product helps you achieve specific outcome. Try it free for 14 days. No credit card required.">
  
  <!-- Canonical URL (prevents duplicate content issues) -->
  <link rel="canonical" href="https://example.com/page-url">
  
  <!-- Robots (index by default, use noindex for admin pages) -->
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph (Facebook, LinkedIn, etc.) -->
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page description">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/page-url">
  <meta property="og:type" content="website">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Page description">
  <meta name="twitter:image" content="https://example.com/image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
</head>
```

### Schema.org Structured Data

```html
<!-- ✅ Organization Schema (Homepage) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/company",
    "https://linkedin.com/company/name",
    "https://github.com/company"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-123-456-7890",
    "contactType": "customer service"
  }
}
</script>

<!-- ✅ Product Schema (Product Pages) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "image": "https://example.com/product.jpg",
  "description": "Product description",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/product",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "123"
  }
}
</script>

<!-- ✅ Article Schema (Blog Posts) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2026-01-15T08:00:00+00:00",
  "dateModified": "2026-01-20T10:00:00+00:00",
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article-url"
  }
}
</script>
```

---

## 📱 Core Web Vitals

### Performance Thresholds (Google Ranking Factors)

| Metric | Good | Poor | Priority |
|--------|------|------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | > 4.0s | High |
| **INP** (Interaction to Next Paint) | < 200ms | > 500ms | High |
| **CLS** (Cumulative Layout Shift) | < 0.1 | > 0.25 | High |
| **TTFB** (Time to First Byte) | < 800ms | > 1.8s | Medium |
| **FCP** (First Contentful Paint) | < 1.8s | > 3.0s | Medium |

### Optimization Techniques

```typescript
// ✅ Image Optimization
import Image from 'next/image'

// Automatic WebP/AVIF conversion, lazy loading, responsive sizes
<Image
  src="/hero.jpg"
  alt="Descriptive alt text for accessibility and SEO"
  width={1200}
  height={600}
  priority={true} // Above the fold
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// Font Optimization
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Prevent invisible text during load
})
```

---

## 🗺️ URL Structure & Navigation

### URL Best Practices

```typescript
// ✅ GOOD URLs — Descriptive, hierarchical, hyphenated
https://example.com/products/running-shoes/nike-air-max
https://example.com/blog/seo-best-practices-2026
https://example.com/about/team

// ❌ BAD URLs — Vague, parameters, underscores
https://example.com/p?id=12345
https://example.com/blog/post_1
https://example.com/page.php?cat=5&sub=12
```

### XML Sitemap

```xml
<!-- ✅ sitemap.xml — Submit to Google Search Console -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-02-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/products</loc>
    <lastmod>2026-02-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog/post-slug</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

### Robots.txt

```
# ✅ robots.txt — Control crawler access
User-agent: *
Allow: /

# Block admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /cart/

# Allow specific crawlers
User-agent: Googlebot
Allow: /

# Sitemap location
Sitemap: https://example.com/sitemap.xml
```

---

## ✍️ Content SEO

### Search Intent Types

| Intent Type | Query Pattern | Content Type |
|-------------|---------------|--------------|
| **Informational** | "how to", "what is", "guide" | Blog posts, explainers |
| **Navigational** | "brand name", "login" | Homepage, brand pages |
| **Commercial** | "best", "top", "vs" | Comparison pages, reviews |
| **Transactional** | "buy", "price", "discount" | Product pages, checkout |

### Content Optimization Checklist

```typescript
// ✅ Title Tag Formula
const titleFormulas = {
  product: '{Product Name} | Buy {Category} Online | {Brand}',
  blog: '{Benefit-Oriented Title} | {Brand} Blog',
  category: 'Shop {Category} | Best {Category} Online | {Brand}',
  landing: '{Primary Keyword} | {Value Proposition} | {Brand}',
}

// ✅ Heading Hierarchy (One H1 per page)
const headingStructure = {
  h1: 'Primary Keyword + Value Proposition', // Only one
  h2: 'Major sections (2-5 per page)',
  h3: 'Subsections under H2s',
  h4: 'Detailed breakdowns (optional)',
}

// ✅ Content Quality Signals
const qualitySignals = {
  wordCount: 'Comprehensive (1000+ for guides, 300+ for pages)',
  readability: '8th-grade reading level (Hemingway Score < 10)',
  freshness: 'Updated within last 12 months',
  originality: 'Unique insights, not just aggregation',
  multimedia: 'Images, videos, infographics',
  internalLinks: '3-5 contextual links to other pages',
  externalLinks: '1-2 links to authoritative sources',
}
```

---

## 🔗 Link Building

### Internal Linking Strategy

```typescript
// ✅ Contextual internal links boost topical authority
interface InternalLinkStrategy {
  // Hub pages link to spoke pages
  hubPage: '/seo-guide',           // Broad topic
  spokePages: [                    // Specific subtopics
    '/seo/technical-seo',
    '/seo/content-optimization', 
    '/seo/link-building',
  ]
  
  // Each spoke links back to hub
  // Spokes cross-link to related spokes
}

// Implementation
// In /seo/technical-seo:
// "Technical SEO works hand-in-hand with 
//  <a href="/seo/content-optimization">content optimization</a> 
//  for maximum impact."
```

### Backlink Quality Factors

| Factor | High Quality | Low Quality |
|--------|--------------|-------------|
| **Domain Authority** | > 50 | < 20 |
| **Relevance** | Same niche | Unrelated |
| **Editorial** | Earned naturally | Paid/bought |
| **Context** | In-content | Footer/sidebar |
| **Follow/NoFollow** | dofollow | nofollow |
| **Traffic** | High organic traffic | No traffic |

---

## 📊 SEO Analytics

### Key Metrics to Track

```typescript
const seoMetrics = {
  // Search Console Metrics
  impressions: 'How many times you appeared in search',
  clicks: 'Actual visits from search',
  ctr: 'Click-through rate (clicks / impressions)',
  averagePosition: 'Average ranking position',
  
  // Analytics Metrics
  organicSessions: 'Visits from organic search',
  organicUsers: 'Unique users from search',
  organicConversions: 'Goal completions from organic',
  pagesPerSession: 'Content engagement',
  averageSessionDuration: 'Time on site',
  bounceRate: 'Single-page visits',
}

// SEO Health Score
function calculateSEOHealth(metrics: SEOMetrics): number {
  const weights = {
    technical: 0.3,    // Core Web Vitals, crawl errors
    content: 0.3,      // Keyword rankings, content freshness
    authority: 0.2,    // Backlinks, domain rating
    engagement: 0.2,   // CTR, dwell time, bounce rate
  }
  
  return weightedScore(metrics, weights)
}
```

### Rank Tracking

```typescript
// ✅ Track keyword rankings over time
interface KeywordTracking {
  keyword: string
  currentPosition: number
  previousPosition: number
  searchVolume: number
  keywordDifficulty: number
  url: string
  lastChecked: Date
}

// Priority keywords (track daily)
const priorityKeywords = [
  { keyword: 'primary product term', targetPosition: 1 },
  { keyword: 'category + modifier', targetPosition: 1 },
  { keyword: 'brand comparison', targetPosition: 3 },
  { keyword: 'informational query', targetPosition: 1 },
]
```

---

## 🛠️ Technical Implementation

### Next.js (App Router) SEO Optimization (Recommended)

```typescript
// ✅ app/layout.tsx (or app/(marketing)/layout.tsx)
import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Brand Name",
    template: "%s | Brand Name",
  },
  description: "Clear value proposition in ~155 characters.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Brand Name",
    description: "Clear value proposition.",
    images: ["/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand Name",
    description: "Clear value proposition.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

```typescript
// ✅ app/products/[slug]/page.tsx
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)

  return {
    title: `${product.name} | ${product.category}`,
    description: product.metaDescription,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.metaDescription,
      images: [product.image],
    },
  }
}
```

### Sitemap + Robots (App Router)

```typescript
// ✅ app/sitemap.ts → served at /sitemap.xml
import type { MetadataRoute } from "next"
import { getAllPages } from "@/lib/content"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages()

  return pages.map((page) => ({
    url: `https://example.com${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }))
}
```

```typescript
// ✅ app/robots.ts
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/private/"],
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  }
}
```

---

## ✅ SEO Checklist

### Technical Foundation
- [ ] Mobile-first responsive design
- [ ] Core Web Vitals passing (LCP, INP, CLS)
- [ ] HTTPS enabled sitewide
- [ ] XML sitemap generated and submitted
- [ ] Robots.txt configured
- [ ] Canonical tags on all pages
- [ ] Schema.org structured data
- [ ] 404 page optimized
- [ ] Redirects for moved pages (301)

### On-Page Optimization
- [ ] Unique title tags (50-60 chars)
- [ ] Compelling meta descriptions (150-160 chars)
- [ ] One H1 per page with primary keyword
- [ ] Logical heading hierarchy (H2, H3)
- [ ] Alt text on all images
- [ ] Internal linking (3-5 per page)
- [ ] External links to authority sites
- [ ] Keyword in first 100 words

### Content Strategy
- [ ] Search intent matched
- [ ] Comprehensive coverage
- [ ] Regular content updates
- [ ] E-E-A-T signals (Experience, Expertise, Authoritativeness, Trust)
- [ ] Author bios with credentials
- [ ] Citations and references

### Off-Page SEO
- [ ] Google Business Profile (for local)
- [ ] Social media profiles active
- [ ] Quality backlink acquisition
- [ ] Brand mention monitoring
- [ ] Guest posting strategy

---

## 🔒 Skill Version

```
Skill: SEO Optimization
Version: 1.1.0
Last Updated: 2026-02-06
Focus: Technical SEO, Content Strategy, Performance
```
