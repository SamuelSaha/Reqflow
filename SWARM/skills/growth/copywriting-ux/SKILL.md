---
name: Copywriting UX
description: Microcopy, CTAs, and user-centered writing that converts
version: 1.1.0
primary_agents: [swarm-growth, swarm-ux]
---

# ✍️ Copywriting UX Skill

> **ACTIVATION:** Words are interface elements. Every pixel of text should earn its place by reducing friction or increasing clarity.

---

## 0. Spec Grounding & Truthfulness (Mandatory)

**Problem this prevents:** shipping copy that overpromises, contradicts the spec, or forces the user to “figure out what you mean”.

### Rules
- **Claims must be true:** every promise must be supported by the spec or current implementation.
- **Examples must be labeled:** if numbers/itineraries/prices are illustrative, label them explicitly (e.g., “Example itinerary”).
- **No decision dumping:** don’t ask users to choose between vague options (“Want to explore or optimize?”). Provide one primary action.
- **No permission language in UX:** avoid “If you want…” / “Should we…” in critical flows; write copy that confidently guides the next action.

### Verification
- Cross-check key strings against acceptance criteria and actual behavior (errors, empty states, pricing, guarantees).
- Run a “misread test”: can a new user explain what happens next in one sentence after reading the UI?

---

## 🎯 Core Principles

1. **Clarity > Cleverness** — Be understood, not admired
2. **Brevity > Verbosity** — Cut 50% of your first draft
3. **Action > Description** — Tell users what to do, not what it is
4. **User-Centered > Company-Centered** — "You" not "We"
5. **Specific > Vague** — "Save 2 hours daily" not "Save time"

---

## 🎭 Voice & Tone

### Voice (Always Consistent)

| Attribute | Is | Is Not |
|-----------|-----|--------|
| **Clear** | Plain language, no jargon | Vague, technical, buzzwords |
| **Confident** | Direct statements | Hesitant, apologetic, passive |
| **Helpful** | Problem-solving focus | Self-promotional, salesy |
| **Human** | Conversational warmth | Robotic, corporate, stiff |

### Tone (Context-Dependent)

```typescript
const toneByContext = {
  onboarding: 'Encouraging, patient, celebratory',
  error: 'Apologetic, helpful, reassuring',
  success: 'Enthusiastic, rewarding, specific',
  billing: 'Clear, transparent, trustworthy',
  support: 'Empathetic, solution-oriented, prompt',
  emptyState: 'Motivating, guiding, hopeful',
}
```

---

## 🎯 Microcopy Patterns

### Buttons & CTAs

```typescript
// ❌ BAD — Vague, passive, no benefit
const badCTAs = {
  submit: 'Submit',
  click: 'Click Here',
  learn: 'Learn More',
  get: 'Get Started',
  buy: 'Buy Now',
}

// ✅ GOOD — Specific, active, benefit-driven
const goodCTAs = {
  submit: 'Create Free Account',
  save: 'Save 20% Today',
  trial: 'Start 14-Day Free Trial',
  demo: 'See 5-Min Demo',
  download: 'Download Template (PDF)',
  upgrade: 'Unlock Pro Features',
}
```

#### CTA Formula

```typescript
// Verb + Value + Urgency (optional)
interface CTAStructure {
  action: string      // Strong verb: Get, Start, Claim, Unlock
  value: string       // Benefit: "your free guide", "20% off"
  urgency?: string    // Optional: "today", "now", "limited time"
}

// Examples
'Get Your Free SEO Audit'
'Claim Your 20% Discount'
'Unlock Premium Features Today'
'Start Building in 5 Minutes'
```

---

## 🚨 Error Messages

### Error Message Formula

```typescript
// What happened + Why + How to fix
interface ErrorMessage {
  what: string    // Clear statement of problem
  why: string     // Brief explanation (if helpful)
  fix: string     // Specific action to resolve
}

// ❌ BAD
{
  error: "Error 500: Internal Server Error"
}

// ❌ BAD (Too technical)
{
  error: "Database connection timeout on query SELECT * FROM users"
}

// ✅ GOOD
{
  error: "We couldn't save your changes",
  explanation: "Your connection was interrupted",
  action: "Please check your internet and try again"
}
```

### Error Message Patterns

| Scenario | Bad | Good |
|----------|-----|------|
| **Form validation** | "Invalid input" | "Email must include @ symbol" |
| **Payment failed** | "Transaction declined" | "Card declined. Try different payment method or contact bank." |
| **404 page** | "Page not found" | "We couldn't find that page. Try searching or browse categories." |
| **Loading timeout** | "Timeout error" | "Taking longer than expected. Still trying..." |
| **Authentication** | "Login failed" | "Email or password incorrect. Try again or reset password." |

---

## 🎉 Success Messages

### Celebration Copy

```typescript
// ❌ Boring
"Success"
"Operation completed"
"Done"

// ✅ Celebratory
"Welcome to the team! 🎉"
"Your report is ready—great work!"
"You just saved 5 hours per week!"
"Project published. Time to celebrate!"

// Progressive celebration based on milestone
const celebrationTiers = {
  small: 'Nice!',
  medium: 'Great job!',
  large: 'Amazing work! 🎉',
  milestone: 'Incredible! You\'re crushing it! 🚀',
}
```

---

## 📝 Form Labels & Placeholders

### Label Best Practices

```typescript
// ❌ Vague
const badLabels = {
  name: 'Name',
  email: 'Email',
  address: 'Address',
}

// ✅ Specific
const goodLabels = {
  fullName: 'Full Name (as it appears on card)',
  workEmail: 'Work Email',
  shippingAddress: 'Shipping Address',
  companySize: 'How many people work at your company?',
}
```

### Placeholder Guidelines

```typescript
// ✅ Use placeholders as examples, not labels
const fieldExamples = {
  email: {
    label: 'Work Email',
    placeholder: 'sarah@company.com',
  },
  phone: {
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
  },
  url: {
    label: 'Website',
    placeholder: 'https://yourcompany.com',
  },
  date: {
    label: 'Start Date',
    placeholder: 'MM/DD/YYYY',
  },
}

// ❌ Don't use placeholder as only label
// ❌ Don't repeat label in placeholder
```

---

## 🎯 Conversion Copy

### Headline Patterns

```typescript
// Pattern 1: Problem → Solution
const problemSolution = {
  headline: 'Stop losing leads to slow follow-up',
  subheadline: 'Our CRM automates responses in under 60 seconds',
}

// Pattern 2: Benefit + Proof
const benefitProof = {
  headline: 'The CRM that helps you close 23% more deals',
  subheadline: 'Join 10,000+ sales teams who switched last year',
}

// Pattern 3: Transformation
const transformation = {
  headline: 'From spreadsheet chaos to organized bliss',
  subheadline: 'Manage your entire business in one dashboard',
}

// Pattern 4: Specific Outcome
const specificOutcome = {
  headline: 'Write blog posts 5x faster with AI',
  subheadline: 'Generate drafts, outlines, and research in seconds',
}
```

### Social Proof Copy

```typescript
const socialProofPatterns = {
  numbers: 'Join 50,000+ marketers',
  results: 'Customers save 10 hours per week on average',
  testimonials: '"This tool paid for itself in the first week" — Sarah K., Marketing Director',
  logos: 'Trusted by teams at Stripe, Notion, and Figma',
  caseStudies: 'How CompanyX increased revenue by 340%',
}
```

---

## 🎨 Empty States

### Onboarding Empty State

```typescript
// ❌ Boring
{
  title: 'No projects yet',
  description: 'Create your first project to get started',
  cta: 'Create Project',
}

// ✅ Motivating
{
  title: 'Let\'s build something amazing',
  description: 'Create your first project and invite your team. You\'ll be surprised how much you can accomplish together.',
  cta: 'Start Your First Project',
  secondaryCTA: 'See Example Project',
}
```

### Feature Empty State

```typescript
const emptyStateTemplates = {
  noData: {
    title: 'No data yet',
    description: 'Connect your account to start seeing insights',
    cta: 'Connect Account',
  },
  noResults: {
    title: 'No results found',
    description: 'Try adjusting your filters or search terms',
    cta: 'Clear Filters',
  },
  noNotifications: {
    title: 'All caught up!',
    description: 'You\'ll see notifications here when something important happens',
    cta: null,
  },
}
```

---

## 📧 Email Copy

### Subject Line Patterns

```typescript
const subjectLineTypes = {
  // Urgency (use sparingly)
  urgency: [
    '24 hours left: Your trial expires tomorrow',
    'Last chance: 40% off ends tonight',
  ],
  
  // Curiosity
  curiosity: [
    'The #1 mistake killing your conversions',
    'What we learned from 1M email campaigns',
  ],
  
  // Benefit
  benefit: [
    'Save 10 hours this week with this template',
    'Your weekly performance report is ready',
  ],
  
  // Personal
  personal: [
    'Sarah, your custom report is ready',
    'Quick question about your project',
  ],
  
  // Social Proof
  socialProof: [
    'See why 10,000 teams switched this month',
    'How [Competitor] uses our tool',
  ],
}
```

### Email Structure

```typescript
const emailTemplate = {
  subject: 'Clear, compelling, under 50 chars',
  preview: 'Expand on subject (shown in inbox preview)',
  greeting: 'Hi {{firstName}}',
  
  body: {
    hook: 'Attention-grabbing opener',
    value: 'Main benefit or information',
    proof: 'Supporting evidence or example',
    action: 'Clear CTA',
  },
  
  closing: 'Friendly sign-off',
  signature: 'Name + Title',
  
  p.s.: 'Optional: Secondary CTA or urgency',
}
```

---

## 🧪 The Hemingway Protocol

### Readability Standards

```typescript
const hemingwayRules = {
  gradeLevel: '8th grade maximum',
  sentenceLength: 'Max 20 words per sentence',
  paragraphLength: 'Max 3-4 sentences per paragraph',
  adverbs: 'Eliminate 90% of adverbs (words ending in -ly)',
  passiveVoice: 'Use active voice 95%+ of the time',
  complexWords: 'Replace jargon with common alternatives',
}

// Before (Grade 14, complex)
"Utilizing our proprietary algorithmic technology enables the optimization of your workflow processes for maximum efficiency gains."

// After (Grade 6, clear)
"Our smart technology helps you work faster and get more done."
```

### Jargon to Plain Language

| Jargon | Plain Alternative |
|--------|-------------------|
| "Leverage" | "Use" |
| "Utilize" | "Use" |
| "Optimize" | "Improve" |
| "Facilitate" | "Help" |
| "Implement" | "Add" or "Start" |
| "Streamline" | "Simplify" |
| "Best-in-class" | Don't use |
| "Synergy" | Don't use |
| "Paradigm" | Don't use |

---

## 🎯 Accessibility in Copy

### Inclusive Language

```typescript
const inclusiveAlternatives = {
  // Gender-neutral
  'guys': 'everyone, team, folks',
  'he/him': 'they/them (when gender unknown)',
  'manpower': 'workforce, team',
  
  // Ability-inclusive
  'crazy': 'unexpected, wild',
  'insane': 'incredible, amazing',
  'blind spot': 'gap, oversight',
  'dumb': 'unhelpful, unclear',
  
  // Person-first (when relevant)
  'disabled user': 'user with disabilities',
  'blind user': 'user who is blind',
}
```

### Screen Reader Considerations

```typescript
const accessibilityRules = {
  // Link text should make sense out of context
  badLinks: ['Click here', 'Read more', 'Learn more'],
  goodLinks: [
    'Download the SEO guide',
    'Read the full case study',
    'Learn about pricing plans',
  ],
  
  // Instructions shouldn't rely on color alone
  bad: 'Click the red button to continue',
  good: 'Click "Continue" (the primary action button)',
  
  // Error messages should be specific
  bad: 'Form error',
  good: 'Password must be at least 12 characters',
}
```

---

## 🔎 SEO-Aware Copy (Titles, Descriptions, Headings)

**Principle:** SEO copy is still UX copy — it must match intent *and* earn the click.

### Title Tag Templates (50–60 chars target)

```typescript
// Primary keyword + benefit + brand (if space)
const titleTemplates = [
  '{Primary Keyword} for {Audience} | {Brand}',
  '{Primary Keyword}: {Specific Outcome} | {Brand}',
  '{Specific Outcome} with {Primary Keyword} | {Brand}',
]

// Examples
'Trip Planner for Teams | Planavo'
'SEO Audit: Fix Issues in 10 Minutes | Planavo'
```

### Meta Description Templates (150–160 chars target)

```typescript
const metaTemplates = [
  'Plan {Outcome} with {Primary Keyword}. {Proof}. {CTA}.',
  '{Primary Keyword} that helps you {Outcome}. {Differentiator}. {CTA}.',
]

// Example
'Plan trips in one place with our travel planner. Build itineraries fast, share with your group, and keep everyone aligned. Try it free.'
```

### Headings (On-Page Clarity)
- One H1 per page; it should match the page’s intent (not a slogan).
- H2s are scannable promises; avoid “Features” as a heading when you can say the outcome.
- Don’t keyword-stuff; use natural language synonyms across sections.

### Link Text (SEO + Accessibility)
- Bad: “Learn more”, “Click here”
- Good: “Compare pricing plans”, “Read the itinerary template guide”

**Rule:** If a link is read out of context by a screen reader, it should still make sense.

---

## ✅ Copywriting Checklist

Before shipping any copy:

- [ ] User-centered ("you" not "we")
- [ ] Active voice (95%+ of the time)
- [ ] Grade 8 reading level or lower
- [ ] Specific numbers over vague claims
- [ ] One main idea per sentence
- [ ] Short paragraphs (3-4 sentences max)
- [ ] Jargon eliminated or explained
- [ ] CTAs are specific and benefit-driven
- [ ] Error messages explain how to fix
- [ ] Empty states motivate action
- [ ] Inclusive language throughout
- [ ] Proofread for typos (Grammarly)
- [ ] Read aloud (catches awkward phrasing)

---

## 🔒 Skill Version

```
Skill: Copywriting UX
Version: 1.1.0
Last Updated: 2026-02-06
Focus: Microcopy, CTAs, Conversion, Accessibility
```
