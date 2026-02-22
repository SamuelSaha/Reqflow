---
description: "Component Architecture Design - Design before you build"
trigger: "/component-architecture <component_name>"
time_budget: "45 minutes"
---

# 🏗️ COMPONENT ARCHITECTURE PROTOCOL

> **TRIGGER:** `/component-architecture <component_name>`
> **GOAL:** Design comprehensive component architecture before implementation
> **TIME ESTIMATE:** 45 minutes
> **OUTPUT:** Complete architecture specification ready for implementation

---

## 🎯 Quick Summary

This workflow designs production-grade component architecture through systematic analysis of boundaries, interfaces, composition patterns, and testing strategies. Output is a complete spec that any developer can implement without ambiguity.

---

## 🚨 PRE-FLIGHT CHECKS

Before starting, verify:
- [ ] Component name is clear and descriptive
- [ ] User requirements/stories are available
- [ ] Design system tokens are accessible
- [ ] Component location in codebase is known

---

## 📊 Execution Dashboard

| Step | Agent | Duration | Status |
|------|-------|----------|--------|
| 1. Boundary Analysis | @swarch-arch | 5 min | ⬜ |
| 2. Props Interface | @swarm-dev | 7 min | ⬜ |
| 3. Composition Pattern | @swarm-ux | 8 min | ⬜ |
| 4. State Management | @swarm-dev | 7 min | ⬜ |
| 5. Styling Architecture | @swarm-ux | 8 min | ⬜ |
| 6. Testing Strategy | @swarm-qa | 5 min | ⬜ |
| 7. Documentation Structure | @swarm-dev | 5 min | ⬜ |

**Total Time:** 45 minutes

---

## 🎯 Why These Agents

| Step | Agent | Reasoning |
|------|-------|-----------|
| Boundaries | @swarm-arch | Defines component scope and relationships |
| Props | @swarm-dev | Technical interface design |
| Composition | @swarm-ux | User-centric component structure |
| State | @swarm-dev | Data flow and management patterns |
| Styling | @swarm-ux | Visual system alignment |
| Testing | @swarm-qa | Coverage and validation planning |
| Documentation | @swarm-dev | API documentation structure |

---

## 📋 Workflow Steps

### STEP 1: COMPONENT BOUNDARY ANALYSIS (5 min)
**Relevant Expertise:** System Architecture, Scope Definition

**Description:**
Define what the component does and does NOT do. Establish clear boundaries to prevent scope creep and ensure single responsibility.

**Process:**
1. Write component purpose statement (one sentence)
2. List responsibilities (what it does)
3. List non-responsibilities (what it doesn't do)
4. Identify related components (collaborators)
5. Define integration points

**Decision Framework:**
```
Single Responsibility Test:
- Can I describe this component in one sentence?
- Does it have more than 3 primary responsibilities?
- Is there another component doing similar work?

If NO to first or YES to others → SPLIT the component
```

**Output:**
```markdown
## Component: <ComponentName>

**Purpose:** [One sentence description]

**Responsibilities:**
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

**Non-Responsibilities (out of scope):**
- [What component A does instead]
- [What component B does instead]
- [What parent handles]

**Collaborators:**
- [Component A] - provides [data/functionality]
- [Component B] - consumes [output/events]

**Integration Points:**
- [Where/how this connects to the system]
```

**Exit Criteria:**
- [ ] Purpose statement is clear and single-sentence
- [ ] Maximum 3 responsibilities listed
- [ ] At least 2 non-responsibilities identified
- [ ] Collaborators documented

**Micro-Checkpoint:** ✅ Boundary analysis complete - component scope is clear

---

### STEP 1.5: USER MENTAL MODEL (5 min) - MANDATORY
**Relevant Expertise:** User Psychology, Mental Model Matching
**Skill:** `user-centric-design`

**Description:**
Ensure the component matches how users think and what they expect. Components should be intuitive, not require explanation.

**Mental Model Validation (3 Questions):**

1. **What does the user expect this component to do?**
   - Based on name alone, what's their assumption?
   - Does our implementation match that expectation?
   - If NO → Rename or redesign

2. **What real-world object is this like?**
   - Calendar → Date picker should look/feel like a calendar
   - Form → Should behave like paper form
   - List → Should behave like shopping list
   - If NO metaphor → Explainability gap

3. **Will the user be surprised by any behavior?**
   - Principle of Least Astonishment
   - All interactions should be predictable
   - If YES → Redesign

**Component Naming Rules:**
- Name describes what it does (not how it works)
- Uses user's vocabulary, not technical terms
- Matches industry standard names if applicable

**Binary Gate:**
- **PASS:** Mental model matches user expectations
- **FAIL:** Surprise or confusion likely → **STOP. Redesign.**

**Output:** User Mental Model Assessment

```markdown
## User Mental Model Assessment

**Component Name:** [Name]

**User Expectation Test:**
- What user expects: [Description]
- What component does: [Description]
- Match? ✅ Yes / ❌ No

**Real-World Metaphor:**
- This is like: [Real object]
- Behaves similarly? ✅ Yes / ❌ No

**Surprise Check:**
- Any surprising behavior? ✅ Yes / ❌ No
- If yes: [Description] → Fix: [Solution]

**Gate:** ✅ PASS / 🚫 FAIL

**If FAIL:**
- Rename component to match expectation
- Adjust behavior to match real-world metaphor
- Remove surprising elements
- Document design decision
```

**Exit Criteria:**
- User expectation documented
- Real-world metaphor identified
- No surprising behavior
- **If FAIL → Redesign component to match mental model**

---

### STEP 2: PROPS INTERFACE DESIGN (7 min)

---

### STEP 2: PROPS INTERFACE DESIGN (7 min)
**Relevant Expertise:** TypeScript, API Design

**Description:**
Design the complete props interface including data inputs, callbacks, and configuration options. Focus on type safety and developer experience.

**Process:**
1. List all data inputs (required and optional)
2. Define callback functions (events out)
3. Add configuration props (variants, sizes, states)
4. Include HTML attributes passthrough
5. Define ref forwarding

**Interface Template:**
```typescript
export interface <ComponentName>Props {
  // Required props
  [propName]: [type]
  
  // Optional configuration
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  
  // State props
  disabled?: boolean
  loading?: boolean
  error?: string
  
  // Callbacks
  onChange?: (value: [type]) => void
  onFocus?: () => void
  onBlur?: () => void
  
  // Composition
  asChild?: boolean
  children?: React.ReactNode
  
  // HTML attributes (extend appropriate type)
} extends React.[Element]HTMLAttributes<[HTMLElement]>

// Ref type
export interface <ComponentName>Ref {
  focus: () => void
  blur: () => void
  // Additional imperative methods
}
```

**Validation Checklist:**
- [ ] All props have explicit types (no `any`)
- [ ] Required vs optional clearly marked
- [ ] Callbacks use standard naming (`on[Event]`)
- [ ] HTML attributes extended appropriately
- [ ] Ref forwarding type defined

**Anti-Patterns to Avoid:**
- ❌ Prop drilling (use composition instead)
- ❌ `any` types
- ❌ Unclear prop names (`data`, `value`, `item`)
- ❌ Too many props (>10 suggests splitting)

**Output:**
Complete TypeScript interface definition

**Micro-Checkpoint:** ✅ Props interface designed with full type safety

---

### STEP 3: COMPOSITION PATTERN SELECTION (8 min)
**Relevant Expertise:** Component Patterns, UX Design

**Description:**
Select the optimal composition pattern based on component complexity, reusability needs, and user experience requirements.

**Pattern Decision Matrix:**

| Pattern | Use When | Example |
|---------|----------|---------|
| **Simple Props** | <5 props, no child customization | Button, Badge |
| **Compound** | Multiple coordinated parts | Tabs, Accordion |
| **Slots** | Flexible content areas | Card, Modal |
| **Render Props** | Customizable rendering | DataTable, List |
| **HOC** | Cross-cutting concerns | withAuth, withTheme |

**Decision Logic:**
```
Does component have multiple coordinated sub-components?
├─ YES → Compound Components
│   └─ Examples: Tabs, Accordion, Breadcrumb
│
├─ NO → Does it need flexible content insertion?
│   ├─ YES → Slots Pattern
│   │   └─ Examples: Card, Modal, Layout
│   │
│   └─ NO → Does it render list/data?
│       ├─ YES → Render Props
│       │   └─ Examples: DataTable, VirtualList
│       │
│       └─ NO → Simple Props
│           └─ Examples: Button, Input, Badge
```

**Compound Component Example:**
```typescript
// For complex, stateful components
<Tabs defaultValue="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">Account settings</Tabs.Content>
  <Tabs.Content value="password">Password settings</Tabs.Content>
</Tabs>
```

**Slots Pattern Example:**
```typescript
// For layout/content components
<Card>
  <Card.Header title="Title" action={<Button>Edit</Button>} />
  <Card.Body>Content goes here</Card.Body>
  <Card.Footer>
    <Button>Cancel</Button>
    <Button variant="primary">Save</Button>
  </Card.Footer>
</Card>
```

**Output:**
```markdown
## Composition Pattern: [Pattern Name]

**Rationale:**
[Why this pattern was chosen]

**Structure:**
```
[Visual component hierarchy]
```

**API Design:**
[Code example of usage]

**State Sharing:**
[How child components share state if applicable]
```

**Exit Criteria:**
- [ ] Pattern selected with clear rationale
- [ ] Component structure visualized
- [ ] Usage example provided
- [ ] State sharing strategy defined (if compound)

**Micro-Checkpoint:** ✅ Composition pattern selected and documented

---

### STEP 3.5: AFFORDANCE DESIGN (5 min) - MANDATORY
**Relevant Expertise:** Affordance Design, Visual Communication
**Skill:** `user-centric-design`

**Description:**
Design clear visual affordances so users immediately understand what actions are possible. The component should communicate its functionality without explanation.

**Affordance Requirements:**

| Element | Must Communicate | Visual Cues |
|---------|------------------|-------------|
| **Clickable** | "I can click this" | Hover state, cursor pointer, shadow |
| **Draggable** | "I can drag this" | Handle icon, cursor grab, elevation |
| **Editable** | "I can type here" | Border, cursor text, placeholder |
| **Disabled** | "This is inactive" | Dimmed, no pointer, gray |
| **Expandable** | "More content available" | Chevron icon, "...", hover hint |

**Affordance Checklist:**

1. **Interactive vs Static**
   - [ ] Interactive elements look interactive
   - [ ] Static elements don't look clickable
   - [ ] Disabled state clearly distinct

2. **State Transitions**
   - [ ] Hover state provides feedback
   - [ ] Active/pressed state visible
   - [ ] Focus state obvious (keyboard nav)

3. **Visual Hierarchy**
   - [ ] Primary action most prominent
   - [ ] Secondary actions subdued
   - [ ] Destructive actions clearly marked

**Anti-Patterns to Avoid:**
- ❌ Mystery icons (no label or tooltip)
- ❌ No hover states
- ❌ Clickable things that look static
- ❌ Static things that look clickable
- ❌ Inconsistent cursor behavior

**Binary Gate:**
- **PASS:** All affordance requirements met
- **FAIL:** User might be confused → **STOP. Add visual cues.**

**Output:** Affordance Design Specification

```markdown
## Affordance Design

**Visual Affordances:**

| Element | Affordance | Implementation |
|---------|------------|----------------|
| [Element 1] | Clickable | Hover: bg change, Cursor: pointer |
| [Element 2] | Draggable | Handle icon, Cursor: grab/grabbing |
| [Element 3] | Editable | Border focus, Cursor: text |

**State Definitions:**
- **Default:** [Visual description]
- **Hover:** [Visual description]
- **Active/Pressed:** [Visual description]
- **Disabled:** [Visual description]
- **Focus:** [Visual description]

**Visual Hierarchy:**
- Primary: [Style]
- Secondary: [Style]
- Destructive: [Style]

**Gate:** ✅ PASS / 🚫 FAIL

**If FAIL:**
- Add missing hover states
- Clarify clickable vs static elements
- Add labels to mystery icons
- Ensure consistent cursor behavior
```

**Exit Criteria:**
- All interactive elements have clear affordances
- All states (hover, active, disabled, focus) defined
- Visual hierarchy established
- **If FAIL → Add visual cues before implementation**

---

### STEP 4: STATE MANAGEMENT DECISION (7 min)

---

### STEP 4: STATE MANAGEMENT DECISION (7 min)
**Relevant Expertise:** React State Patterns, Data Flow

**Description:**
Determine where state lives (local vs lifted) and how data flows through the component.

**State Decision Tree:**
```
Does component need to share state with siblings/parent?
├─ NO → Local State (useState/useReducer)
│   └─ Examples: Input value, isOpen, isLoading
│
├─ YES → Lifted State
    ├─ Direct sibling? → Lift to common parent
    ├─ Distant relative? → Context API
    └─ Global app state? → External store (Zustand/Redux)
```

**State Classification:**

| Type | Location | Examples |
|------|----------|----------|
| **UI State** | Local | isOpen, isHovering, activeTab |
| **Form State** | Local/Lifted | input values, validation errors |
| **Server State** | External | data from API, loading, error |
| **Shared State** | Context | theme, user, permissions |
| **Global State** | Store | cart, notifications |

**Implementation Patterns:**

```typescript
// 1. Local State
function Input({ value, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(value)
  // Controlled or uncontrolled
}

// 2. Lifted State (Lifting State Up)
function Parent() {
  const [sharedState, setSharedState] = useState()
  return (
    <>
      <ChildA state={sharedState} />
      <ChildB onUpdate={setSharedState} />
    </>
  )
}

// 3. Context for Deep Sharing
const ComponentContext = createContext<ContextValue>()
function ComponentProvider({ children }) {
  const [state, setState] = useState()
  return (
    <ComponentContext.Provider value={{ state, setState }}>
      {children}
    </ComponentContext.Provider>
  )
}

// 4. External State (Server)
function DataComponent() {
  const { data, isLoading, error } = useQuery(['key'], fetchData)
  // Use TanStack Query / SWR / RTK Query
}
```

**Output:**
```markdown
## State Management

**State Classification:**
| State | Type | Location | Initial Value |
|-------|------|----------|---------------|
| [State 1] | UI | Local | false |
| [State 2] | Data | Lifted | undefined |

**Data Flow:**
```
[Parent] → [prop] → [Component] → [callback] → [Parent]
```

**State Updates:**
1. [Event] → [Handler] → [State Update] → [Re-render]
2. ...
```

**Exit Criteria:**
- [ ] All state classified by type
- [ ] State location determined for each
- [ ] Data flow diagrammed
- [ ] Update handlers outlined

**Micro-Checkpoint:** ✅ State management strategy defined

---

### STEP 5: STYLING ARCHITECTURE (8 min)
**Relevant Expertise:** CSS Architecture, Tailwind

**Description:**
Define the styling approach including Tailwind configuration, design token usage, and responsive behavior.

**Styling Checklist:**

**Design Tokens:**
- [ ] Colors use semantic tokens (not hex codes)
- [ ] Spacing follows 8px grid
- [ ] Typography uses type scale
- [ ] Shadows match elevation system

**Tailwind Implementation:**
```typescript
// CVA (class-variance-authority) pattern
const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white',
        secondary: 'bg-gray-100 text-gray-900',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)
```

**Responsive Strategy:**
```
Mobile-First Approach:
- Base styles: Mobile (320px)
- sm: 640px+  
- md: 768px+
- lg: 1024px+
- xl: 1280px+
```

**Accessibility Styling:**
- [ ] Focus states defined (`focus-visible:ring-2`)
- [ ] Reduced motion support (`motion-reduce:`)
- [ ] Color contrast verified (WCAG 4.5:1)
- [ ] Touch targets ≥44px

**Output:**
```markdown
## Styling Architecture

**Design Tokens Used:**
- Colors: [semantic tokens]
- Spacing: [token names]
- Typography: [type scale levels]

**Variant Classes:**
```typescript
const variants = cva('...', {
  // CVA configuration
})
```

**Responsive Breakpoints:**
- Mobile: [base classes]
- md: [override classes]
- lg: [override classes]

**Accessibility:**
- Focus: [ring styles]
- Motion: [reduced-motion styles]
```

**Exit Criteria:**
- [ ] CVA variants defined
- [ ] All tokens semantic (no hardcoded values)
- [ ] Responsive breakpoints specified
- [ ] Accessibility styles documented

**Micro-Checkpoint:** ✅ Styling architecture complete

---

### STEP 6: TESTING STRATEGY (5 min)
**Relevant Expertise:** Testing Patterns, QA

**Description:**
Plan comprehensive testing including unit tests, interaction tests, accessibility tests, and visual regression.

**Testing Pyramid:**
```
    /\
   /  \  E2E (1-2 critical flows)
  /____\
 /      \  Integration (component interactions)
/________\
          Unit (logic, rendering, states)
```

**Test Coverage Requirements:**

| Test Type | Coverage | Tools |
|-----------|----------|-------|
| Unit | 100% logic branches | Vitest/Jest |
| Component | All variants/states | React Testing Library |
| Interaction | User workflows | Storybook interactions |
| A11y | WCAG 2.2 AA | axe-core |
| Visual | All states | Chromatic/Loki |

**Test Cases Template:**
```typescript
describe('<ComponentName>', () => {
  // Rendering
  it('renders correctly', () => {})
  it('renders all variants', () => {})
  
  // Props
  it('handles required props', () => {})
  it('handles optional props', () => {})
  
  // Interactions
  it('calls onClick when clicked', () => {})
  it('handles keyboard navigation', () => {})
  
  // States
  it('shows loading state', () => {})
  it('shows disabled state', () => {})
  it('shows error state', () => {})
  
  // Accessibility
  it('has correct ARIA attributes', () => {})
  it('is keyboard accessible', () => {})
})
```

**Output:**
```markdown
## Testing Strategy

**Unit Tests:**
- [Logic to test 1]
- [Logic to test 2]

**Component Tests:**
- Render all variants
- Test all states
- Test interactions

**Accessibility Tests:**
- ARIA attributes
- Keyboard navigation
- Screen reader labels

**Visual Regression:**
- Test states: default, hover, focus, disabled
- Test all variants
- Test responsive breakpoints
```

**Exit Criteria:**
- [ ] Unit test cases listed
- [ ] Component tests outlined
- [ ] A11y tests defined
- [ ] Visual regression scope set

**Micro-Checkpoint:** ✅ Testing strategy defined

---

### STEP 7: DOCUMENTATION STRUCTURE (5 min)
**Relevant Expertise:** Technical Writing, API Docs

**Description:**
Create documentation structure including Storybook stories, prop tables, usage examples, and design notes.

**Documentation Checklist:**

**Storybook Structure:**
```typescript
// Component.stories.tsx
export default {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
}

// 1. Default story
export const Default = {}

// 2. Variant stories
export const VariantName = {
  args: { variant: 'name' }
}

// 3. State stories
export const Loading = {
  args: { loading: true }
}

// 4. Composition story
export const WithChildren = {
  render: () => <Component>...</Component>
}
```

**MDX Documentation:**
```markdown
# ComponentName

## Overview
[Brief description]

## Props
<Controls />

## Usage
```tsx
[Code example]
```

## Accessibility
[Notes]

## Design Notes
[Design system context]
```

**Output:**
```markdown
## Documentation Structure

**Storybook Stories:**
1. Default - [description]
2. [Variant 1] - [description]
3. [Variant 2] - [description]
4. [State] - [description]

**MDX Sections:**
- Overview
- Props (auto-generated)
- Usage examples
- Accessibility notes
- Design notes

**README Sections:**
- Installation
- Import
- Basic usage
- Advanced usage
- Props reference
```

**Exit Criteria:**
- [ ] Story structure defined
- [ ] MDX sections outlined
- [ ] Usage examples planned

**Micro-Checkpoint:** ✅ Documentation structure complete

---

## 🚪 EXIT CRITERIA

| Check | Required |
|-------|----------|
| Component boundaries defined | ✅ |
| **User mental model validated** | ✅ **MANDATORY** |
| Props interface with types | ✅ |
| Composition pattern selected | ✅ |
| **Affordance design complete** | ✅ **MANDATORY** |
| State management strategy | ✅ |
| Styling architecture (CVA) | ✅ |
| Testing plan documented | ✅ |
| Documentation structure | ✅ |

**Output Deliverable:** `component-architecture-[name].md`

### User-Centric Exit Criteria:

**User Mental Model:**
- Component name matches user expectations
- Real-world metaphor identified and matched
- No surprising behavior

**Affordance Design:**
- All interactive elements have clear affordances
- All states (hover, active, disabled, focus) defined
- Visual hierarchy established

**IF ANY USER-CENTRIC CHECK FAILS → DO NOT PROCEED TO IMPLEMENTATION**

---

## ⏱️ TIME BUDGET

| Step | Target |
|------|--------|
| Boundary Analysis | 5 min |
| Props Interface | 7 min |
| Composition Pattern | 8 min |
| State Management | 7 min |
| Styling Architecture | 8 min |
| Testing Strategy | 5 min |
| Documentation | 5 min |
| **TOTAL** | **45 min** |

---

## 🔄 Workflow Relationships

**Used By:**
- `/ui-implementation` - Uses this architecture as input

**Uses:**
- `css-architecture` skill - Styling patterns
- `design-systems` skill - Component patterns
- `testing-patterns` skill - Testing strategies

---

## 📝 Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| [Pattern choice] | [Why] | [Date] |
| [State location] | [Why] | [Date] |

---

**Workflow Version:** 1.0.0
**Last Updated:** 2026-02-02
