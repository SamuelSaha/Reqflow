---
name: User-Centric Design
description: Ruthless user-centric validation framework ensuring all features solve real problems with logical, usable interfaces
version: 1.0.0
primary_agents: ["@swarm-ux", "@swarm-specifier", "@swarm-dev"]
authority: CRITICAL
---

# 🎯 USER-CENTRIC DESIGN SKILL

> **THE STANDARD:** Every feature must pass user validation before building. No exceptions. No shortcuts.

---

## 🔒 BASELINE EXPECTATION (NON-NEGOTIABLE)

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   BEFORE ANY FEATURE IS BUILT:                                  ║
║                                                                  ║
║   1. User need validated via Mom Test (3 questions)            ║
║   2. Cognitive load measured (< 3 decisions per screen)        ║
║   3. Logical flow verified (journey makes sense)               ║
║   4. Error prevention score calculated (can users mess up?)    ║
║                                                                  ║
║   IF ANY GATE FAILS → STOP. Redesign.                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## A. USER-CENTRIC VALIDATION FRAMEWORK

### The Mom Test (3 Questions That Validate Real User Need)

**Purpose:** Ensure you're solving a real problem, not imagining one.

**The Questions:**

1. **"Tell me about the last time you [did this activity]"**
   - ❌ If user can't recall → FAKE PROBLEM
   - ✅ If user tells a story → REAL PROBLEM

2. **"What did you do instead when that didn't work?"**
   - ❌ If user did nothing → LOW PRIORITY
   - ✅ If user hacked a workaround → HIGH PRIORITY

3. **"How much did that cost you (time/money/frustration)?"**
   - ❌ If cost < 5 min/month → NOT WORTH SOLVING
   - ✅ If cost > 30 min/month → WORTH SOLVING

**Binary Gate:**
- **PASS:** All 3 questions answered with real examples
- **FAIL:** Any question fails → STOP and redesign

---

### Cognitive Load Assessment

**Purpose:** Measure how much thinking your interface requires.

**Cognitive Load Formula:**
```
COGNITIVE_LOAD = (Decisions per screen × Complexity per decision) + Memory required
```

**Metrics:**

| Load Level | Decisions/Screen | User Experience |
|------------|------------------|-----------------|
| 🟢 LOW | 1-2 | Effortless, instinctive |
| 🟡 MEDIUM | 3 | Manageable, requires attention |
| 🔴 HIGH | 4+ | Frustrating, error-prone |

**Rule:** Maximum 3 decisions per screen. No exceptions.

**Decision Counting Method:**
1. List every choice user must make
2. Count: Click targets, form inputs, toggles, selections
3. Include implicit decisions ("Should I click this?")

**Binary Gate:**
- **PASS:** ≤ 3 decisions per screen
- **FAIL:** > 3 decisions → Simplify or split into multiple screens

---

### Decision Fatigue Calculator

**Purpose:** Track cumulative decisions across entire user journey.

**Calculation:**
```
TOTAL_DECISIONS = Σ(Decisions per screen × Number of users hitting that screen)
```

**Fatigue Thresholds:**

| Journey Length | Max Total Decisions | Risk Level |
|----------------|---------------------|------------|
| 1-2 screens | 5 decisions | 🟢 Safe |
| 3-5 screens | 10 decisions | 🟡 Watch |
| 6+ screens | 15 decisions | 🔴 Danger |

**Decision Types (Weighted):**
- Binary choice (yes/no): 1 point
- Single selection (dropdown): 2 points
- Multi-selection (checkboxes): 3 points
- Text input (typing): 2 points
- Complex configuration: 4 points

**Binary Gate:**
- **PASS:** Total journey decisions ≤ threshold
- **FAIL:** Exceeds threshold → Redesign flow

---

### User Journey Sanity Check

**Purpose:** Ensure the flow follows logical progression.

**Validation Questions:**

1. **Does step N+1 naturally follow step N?**
   - ✅ Yes: Flow makes sense
   - ❌ No: Jarring jump, redesign

2. **Does the user have everything needed at each step?**
   - ✅ Yes: No backtracking required
   - ❌ No: Missing context or data

3. **Can the user predict what happens next?**
   - ✅ Yes: Clear progression
   - ❌ No: Mystery navigation

4. **Is there a clear way back/undo?**
   - ✅ Yes: User feels safe
   - ❌ No: Trapped, anxious

**Journey Logic Test:**
```
IF (StepN.output == StepN+1.input) → LOGICAL ✓
IF (StepN.output != StepN+1.input) → BROKEN ✗
```

**Binary Gate:**
- **PASS:** All 4 questions answered positively
- **FAIL:** Any question fails → Fix flow logic

---

## B. LOGICAL DESIGN PRINCIPLES

### Principle of Least Astonishment

**Definition:** Users shouldn't be surprised by system behavior.

**Checklist:**
- [ ] Buttons do what their label says
- [ ] Navigation goes where users expect
- [ ] State changes are visible and explained
- [ ] Error messages describe what happened
- [ ] Success states confirm the action

**Anti-Patterns:**
- ❌ "Save" button that deletes
- ❌ Clicking logo doesn't go home
- ❌ Silent failures
- ❌ Unexpected navigation jumps

---

### Progressive Disclosure

**Definition:** Show only what's needed, when needed.

**Implementation Rules:**

1. **First Screen:** Core action only (1-2 decisions)
2. **Secondary Screens:** Details and options (on demand)
3. **Advanced Screens:** Power features (explicitly accessed)

**Progressive Disclosure Template:**
```
Layer 1: Essential (Always visible)
  - Primary action
  - Critical information

Layer 2: Contextual (Revealed on interaction)
  - Related options
  - Helpful details

Layer 3: Advanced (Explicitly requested)
  - Power user features
  - Configuration
```

**Binary Gate:**
- **PASS:** First screen shows ≤ 2 decisions
- **FAIL:** Information overload on entry

---

### Affordance Design

**Definition:** Clear what actions are possible.

**Affordance Requirements:**

| Element | Must Show |
|---------|-----------|
| Buttons | Clickability (shadow, hover state) |
| Inputs | Editability (border, cursor) |
| Links | Clickability (underline, color) |
| Drag items | Grabbability (handle icon) |
| Dropdowns | Expandability (chevron icon) |

**Visual Affordance Checklist:**
- [ ] Interactive elements look interactive
- [ ] Static elements look static
- [ ] Disabled state is visually distinct
- [ ] Hover/Active states provide feedback

---

### Error Prevention

**Definition:** Design so errors can't happen.

**Prevention Strategies:**

1. **Constraint Input**
   - Date picker instead of free text
   - Dropdown instead of typing
   - Validation on blur, not submit

2. **Smart Defaults**
   - Pre-fill based on context
   - Suggest most common option
   - Remember previous choices

3. **Confirmation for Destruction**
   - Destructive actions require explicit confirmation
   - Show consequences clearly
   - Allow undo for 30 seconds

4. **Inline Validation**
   - Check on blur, not submit
   - Show clear error messages
   - Suggest corrections

**Error Prevention Score:**
```
Score = (Preventable errors / Total possible errors) × 100

90-100%: Excellent
70-89%: Good
50-69%: Needs work
<50%: Critical redesign needed
```

**Binary Gate:**
- **PASS:** Error prevention score ≥ 70%
- **FAIL:** Score < 70% → Add more safeguards

---

### Recognition over Recall

**Definition:** Show options, don't make users remember.

**Application Rules:**

| Instead of... | Use... |
|---------------|--------|
| "Type your country" | Country dropdown |
| "Remember password rules" | Inline requirements list |
| "What did you search for?" | Recent searches list |
| "Type format: YYYY-MM-DD" | Date picker |

**Recognition Checklist:**
- [ ] Options visible, not memorized
- [ ] Recent items easily accessible
- [ ] Format requirements shown, not documented
- [ ] Help available in context

---

## C. USABILITY HEURISTICS CHECKLIST

### Nielsen's 10 Heuristics (Binary Assessment)

| Heuristic | Check | Pass Criteria |
|-----------|-------|---------------|
| **1. Visibility of System Status** | [ ] | User always knows what's happening |
| **2. Match System ↔ Real World** | [ ] | Uses user's language, not jargon |
| **3. User Control & Freedom** | [ ] | Clear exits, undo available |
| **4. Consistency & Standards** | [ ] | Same patterns throughout |
| **5. Error Prevention** | [ ] | Design prevents problems |
| **6. Recognition > Recall** | [ ] | Options visible, not memorized |
| **7. Flexibility & Efficiency** | [ ] | Shortcuts for experts |
| **8. Aesthetic & Minimalist** | [ ] | No irrelevant information |
| **9. Error Recognition & Recovery** | [ ] | Clear errors, solutions offered |
| **10. Help & Documentation** | [ ] | Contextual help available |

**Scoring:**
- **PASS:** 9-10 heuristics met
- **CONDITIONAL PASS:** 7-8 heuristics met (fix gaps before ship)
- **FAIL:** < 7 heuristics met → Major redesign required

---

## D. VALIDATION GATES

### Gate 1: User Need Validation (Mom Test)

**Purpose:** Confirm real user problem exists.

**Questions:**
1. Can user describe last time they experienced this pain?
2. What workaround did they use?
3. What did it cost them?

**Binary Outcome:**
- **PASS (✅):** All 3 questions answered with concrete examples
- **FAIL (🚫):** Any question vague or hypothetical → STOP, redesign

**If Fails:**
```
⛔ GATE 1 FAILED: User Need Not Validated

Action Required:
1. Interview 3+ real users
2. Document specific examples
3. Re-run Mom Test
4. Do not proceed until PASS
```

---

### Gate 2: Cognitive Load Check

**Purpose:** Ensure interface doesn't overwhelm users.

**Measurement:**
- Count decisions per screen
- Calculate decision fatigue score

**Binary Outcome:**
- **PASS (✅):** ≤ 3 decisions per screen AND ≤ 10 total journey decisions
- **FAIL (🚫):** Exceeds limits → Simplify or split flow

**If Fails:**
```
⛔ GATE 2 FAILED: Cognitive Load Too High

Current: [X] decisions
Maximum: 3 per screen, 10 total

Action Required:
1. Remove non-essential decisions
2. Move advanced options to secondary screens
3. Use smart defaults
4. Re-measure until PASS
```

---

### Gate 3: Logical Flow Validation

**Purpose:** Ensure journey progression makes sense.

**Validation:**
- Step N+1 naturally follows Step N
- User has required context at each step
- Clear way back/undo exists

**Binary Outcome:**
- **PASS (✅):** All 4 journey sanity checks positive
- **FAIL (🚫):** Any check fails → Redesign flow

**If Fails:**
```
⛔ GATE 3 FAILED: Flow Logic Broken

Broken: [Specific check that failed]

Action Required:
1. Map current user journey
2. Identify logic gaps
3. Redesign step sequence
4. Re-validate until PASS
```

---

### Gate 4: Error Prevention Score

**Purpose:** Measure how well design prevents user errors.

**Calculation:**
```
Score = (Preventable errors / Total possible errors) × 100
```

**Binary Outcome:**
- **PASS (✅):** Score ≥ 70%
- **FAIL (🚫):** Score < 70% → Add safeguards

**If Fails:**
```
⛔ GATE 4 FAILED: Error Prevention Insufficient

Current Score: [X]%
Required: 70%

Action Required:
1. Add input constraints (pickers > free text)
2. Implement inline validation
3. Add smart defaults
4. Add confirmation for destructive actions
5. Re-score until PASS
```

---

## E. ANTI-PATTERNS CATALOG

### User-Hostile Patterns (NEVER USE)

#### 1. Hidden Functionality
**Definition:** Features exist but users can't find them.

**Examples:**
- Right-click menus with no visual indicator
- Keyboard shortcuts without on-screen hints
- Swipe gestures without tutorials
- Features buried 3+ levels deep

**Detection:**
```
If (feature_exists AND user_discovery_rate < 30%) → HIDDEN_FUNCTIONALITY
```

**Fix:**
- Add visual affordances
- Show contextual hints
- Surface in primary navigation

---

#### 2. Mystery Navigation
**Definition:** Users can't predict where actions lead.

**Examples:**
- Icon-only buttons with no labels
- Clicking "Settings" opens unrelated modal
- Navigation that changes based on invisible state
- Buttons that do different things in different contexts

**Detection:**
```
If (user_click_wrong_target_rate > 20%) → MYSTERY_NAVIGATION
```

**Fix:**
- Use clear labels + icons
- Consistent behavior across contexts
- Preview on hover where possible

---

#### 3. Forced Sequences
**Definition:** Users must complete steps in rigid order even when unnecessary.

**Examples:**
- Must fill profile before using app
- Can't browse without creating account
- Must watch tutorial before accessing features
- Linear flow when parallel would work

**Detection:**
```
If (required_steps > necessary_steps) → FORCED_SEQUENCE
```

**Fix:**
- Allow skipping non-critical steps
- Progressive onboarding (use features, learn as you go)
- Optional account creation

---

#### 4. Unforgiving Actions
**Definition:** Destructive actions with no recovery path.

**Examples:**
- Delete with no confirmation
- No undo for 30 seconds
- Form data lost on back button
- Settings change with no way to revert

**Detection:**
```
If (destructive_action AND no_recovery_path) → UNFORGIVING
```

**Fix:**
- Confirmation dialogs for destructive actions
- 30-second undo window
- Auto-save form drafts
- Settings history/revert

---

#### 5. Inconsistent Behavior
**Definition:** Same action produces different results in different contexts.

**Examples:**
- "Save" button works differently on different pages
- Same icon does different things
- Swipe left deletes in one place, archives in another
- Enter key submits sometimes, new line other times

**Detection:**
```
If (action_type == same AND behavior != same) → INCONSISTENT
```

**Fix:**
- Standardize interaction patterns
- Document behavior in design system
- Audit for consistency

---

#### 6. Jargon-Heavy Language
**Definition:** Using internal/technical terms users don't understand.

**Examples:**
- "404 Error" instead of "Page not found"
- "Database constraint violation" instead of "That name is taken"
- "Async operation failed" instead of "Save failed, try again"
- Acronyms without explanation ("API", "SDK", "SSO")

**Detection:**
```
If (internal_term_count > 0 AND user_clarity_score < 80%) → JARGON
```

**Fix:**
- Use user's vocabulary
- Explain technical terms in plain language
- Test copy with non-technical users

---

#### 7. Buried Settings
**Definition:** Important configuration hidden deep in UI hierarchy.

**Examples:**
- Logout under "Profile > Settings > Advanced > Account"
- Notifications settings 4 clicks from home
- Privacy controls hidden in sub-menu
- Help/contact in footer only

**Detection:**
```
If (common_action_clicks > 3) → BURIED
```

**Fix:**
- Surface common actions in primary navigation
- Settings organized by frequency, not alphabetically
- Quick access to critical controls

---

## F. CODE EXAMPLES

### Clear Call-to-Action Buttons

```tsx
// ✅ GOOD: Clear label, visible affordance, consistent styling
<button
  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors focus:ring-2 focus:ring-primary-500"
  onClick={handleSave}
>
  Save Changes
</button>

// ❌ BAD: Unclear icon-only, no hover state, poor contrast
<div onClick={save} className="btn">
  <svg>...</svg> {/* What does this do? */}
</div>
```

**Requirements:**
- Text label (icon + text preferred)
- Hover state (cursor pointer, visual change)
- Active state (pressed appearance)
- Disabled state (dimmed, no pointer)
- Loading state (spinner, disabled)

---

### Progressive Forms

```tsx
// ✅ GOOD: Progressive disclosure, 1-2 decisions per step
function MultiStepForm() {
  const [step, setStep] = useState(1);
  
  return (
    <div>
      {step === 1 && (
        <Step1Email
          onNext={(email) => {
            saveEmail(email);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <Step2Profile
          onBack={() => setStep(1)}
          onNext={(profile) => {
            saveProfile(profile);
            setStep(3);
          }}
        />
      )}
      {step === 3 && <Step3Confirmation />}
    </div>
  );
}

// Step 1: Just email (1 decision)
function Step1Email({ onNext }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  return (
    <div>
      <h2>Enter your email</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
        onBlur={() => {
          if (!isValidEmail(email)) {
            setError('Please enter a valid email');
          }
        }}
        placeholder="you@example.com"
        aria-describedby="email-help"
      />
      {error && <span role="alert" className="text-red-600">{error}</span>}
      <p id="email-help" className="text-sm text-gray-600">
        We'll send a confirmation link
      </p>
      <button
        onClick={() => onNext(email)}
        disabled={!isValidEmail(email)}
      >
        Continue
      </button>
    </div>
  );
}
```

**Pattern:**
1. One primary decision per step
2. Inline validation on blur
3. Clear progress indication
4. Back button available
5. Summary before final submit

---

### Contextual Help

```tsx
// ✅ GOOD: Help available in context, not buried in docs
function FormField({ label, name, helpText, required }) {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span aria-label="required" className="text-red-500">*</span>}
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          aria-label={`Help for ${label}`}
          aria-expanded={showHelp}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <HelpIcon className="w-4 h-4" />
        </button>
      </label>
      
      <input
        id={name}
        name={name}
        required={required}
        aria-describedby={showHelp ? `${name}-help` : undefined}
      />
      
      {showHelp && (
        <div id={`${name}-help`} className="help-text bg-gray-50 p-2 rounded text-sm">
          {helpText}
          <a href={`/docs/${name}`} target="_blank" rel="noopener">
            Learn more →
          </a>
        </div>
      )}
    </div>
  );
}

// Usage
<FormField
  label="Webhook URL"
  name="webhookUrl"
  helpText="The URL where we'll send event notifications. Must be publicly accessible and return 200 status."
  required
/>
```

**Pattern:**
1. Help icon next to field label
2. Expandable help text (doesn't clutter UI)
3. Links to detailed docs if needed
4. Screen reader accessible

---

### Undo Functionality

```tsx
// ✅ GOOD: 30-second undo window for destructive actions
function DeletableItem({ id, name, onDelete }) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  
  const handleDelete = () => {
    setIsDeleted(true);
    setCanUndo(true);
    setCountdown(30);
    
    // Countdown timer
    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    
    // Final delete after 30 seconds
    timeoutRef.current = setTimeout(() => {
      onDelete(id);
      setCanUndo(false);
    }, 30000);
  };
  
  const handleUndo = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    setIsDeleted(false);
    setCanUndo(false);
  };
  
  if (isDeleted && canUndo) {
    return (
      <div className="deleted-item bg-yellow-50 p-4 rounded">
        <p>"{name}" deleted. 
          <button 
            onClick={handleUndo}
            className="text-blue-600 underline"
          >
            Undo ({countdown}s)
          </button>
        </p>
      </div>
    );
  }
  
  if (isDeleted) {
    return null; // Permanently deleted
  }
  
  return (
    <div className="item">
      <span>{name}</span>
      <button 
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800"
      >
        Delete
      </button>
    </div>
  );
}
```

**Pattern:**
1. Immediate visual feedback (item marked deleted)
2. 30-second undo window (configurable)
3. Countdown visible
4. Actual deletion only after grace period
5. Clear "Undo" action

---

### Smart Defaults

```tsx
// ✅ GOOD: Smart defaults reduce user decisions
function SmartSettingsForm({ user, organization }) {
  const [settings, setSettings] = useState({
    // Default: User's local timezone
    timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Default: Organization's business hours
    workHoursStart: organization.businessHours?.start || '09:00',
    workHoursEnd: organization.businessHours?.end || '17:00',
    
    // Default: User's preferred language
    language: user.preferredLanguage || navigator.language || 'en',
    
    // Default: Most common selection
    notificationFrequency: 'immediate',
    
    // Default: Inferred from role
    defaultView: user.role === 'admin' ? 'dashboard' : 'inbox',
  });
  
  return (
    <form>
      <Select
        label="Timezone"
        value={settings.timezone}
        onChange={(tz) => setSettings({ ...settings, timezone: tz })}
        options={TIMEZONES}
        helpText={`Detected: ${settings.timezone}`}
      />
      
      <Select
        label="Language"
        value={settings.language}
        onChange={(lang) => setSettings({ ...settings, language: lang })}
        options={LANGUAGES}
        helpText={`Browser default: ${navigator.language}`}
      />
      
      {/* User can override, but defaults are sensible */}
    </form>
  );
}
```

**Default Sources (Priority Order):**
1. User's previous selections (persisted)
2. User profile data
3. Organization defaults
4. Browser/system settings
5. Most common selection (analytics)
6. Geographic inference (IP/timezone)

---

## ✅ USER-CENTRIC DESIGN CHECKLIST

### Before Design Starts:
```markdown
□ Mom Test completed with 3 real users
□ Problem validated with concrete examples
□ Workaround cost quantified (> 30 min/month)
□ User segment clearly defined
```

### During Design:
```markdown
□ ≤ 3 decisions per screen
□ Progressive disclosure applied
□ Error prevention score ≥ 70%
□ All 10 usability heuristics checked
□ No anti-patterns present
□ Logical flow validated
□ Recognition over recall applied
□ Clear affordances designed
```

### Before Implementation:
```markdown
□ Gate 1: User need validated ✅
□ Gate 2: Cognitive load acceptable ✅
□ Gate 3: Flow logic verified ✅
□ Gate 4: Error prevention sufficient ✅
□ All 4 gates PASS → Proceed to build
□ Any gate FAIL → Redesign required
```

### After Implementation:
```markdown
□ Usability tested with 3+ users
□ Task completion rate > 80%
□ Error rate < 5%
□ Time-on-task within expectations
□ User satisfaction score > 4/5
```

---

## 🔒 SKILL VERSION

```
Skill: User-Centric Design
Version: 1.0.0
Last Updated: 2026-02-02
Authority: CRITICAL (all features must pass)
Standard: Binary validation gates, zero exceptions
```

---

## 📖 USAGE IN WORKFLOWS

**Always load this skill for:**
- Feature specification
- UX design
- Form/interface design
- User flow design
- Component design

**Integration:**
```bash
@swarm-ux Use user-centric-design skill for all interface decisions
@swarm-specifier Use Mom Test before writing any spec
@swarm-dev Implement with error prevention patterns
```

**Validation Command:**
```bash
*validate-ux  # Run all 4 gates on current design
```
