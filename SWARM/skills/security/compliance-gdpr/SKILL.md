---
name: GDPR Compliance
description: EU data protection compliance, consent management, and privacy by design
version: 1.0.0
primary_agents: [swarm-sec, swarm-dev]
---

# 🔒 GDPR Compliance Skill

> **ACTIVATION:** Privacy is not a feature—it's a foundation. Build it in from day one, not as an afterthought.

---

## 🎯 Core Principles

1. **Privacy by Design** — Build privacy into systems, not bolt it on
2. **Data Minimization** — Collect only what you need, keep only as long as needed
3. **Consent is King** — Explicit, informed, freely given, revocable
4. **Transparency** — Users must understand what happens to their data
5. **Accountability** — Document everything, demonstrate compliance

---

## 📋 GDPR Fundamentals

### Lawful Basis for Processing

| Basis | When to Use | Example |
|-------|-------------|---------|
| **Consent** | Marketing, non-essential cookies | Newsletter signup |
| **Contract** | Providing a service the user requested | Processing an order |
| **Legal Obligation** | Required by law | Tax records |
| **Vital Interests** | Protecting someone's life | Emergency contact |
| **Public Task** | Official authority | Government services |
| **Legitimate Interests** | Your interests don't override user rights | Fraud prevention |

### Key Data Subject Rights

```typescript
const dataSubjectRights = {
  rightToBeInformed: 'Clear privacy notice at collection',
  rightOfAccess: 'Provide copy of personal data within 30 days',
  rightToRectification: 'Correct inaccurate data promptly',
  rightToErasure: 'Delete data when no legal basis ("right to be forgotten")',
  rightToRestrictProcessing: 'Stop processing but retain data',
  rightToDataPortability: 'Export data in machine-readable format',
  rightToObject: 'Opt-out of direct marketing anytime',
  rightsRelatedToAutomation: 'Human review of automated decisions',
}
```

---

## 🎨 Privacy by Design

### Data Minimization

```typescript
// ❌ BAD — Collecting everything "just in case"
interface BadUserRegistration {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string        // Not needed for SaaS
  address: string      // Not needed for SaaS
  birthDate: Date      // Not needed
  gender: string       // Not needed
  ssn: string          // Never collect without legal basis
}

// ✅ GOOD — Only collect what's necessary
interface GoodUserRegistration {
  email: string        // Required for account
  password: string     // Required for authentication
  firstName?: string   // Optional, for personalization
  companyName?: string // Optional, for B2B context
}

// Data collection justification
interface DataField {
  field: string
  purpose: string
  legalBasis: 'consent' | 'contract' | 'legitimate_interest'
  retentionPeriod: string
  required: boolean
}
```

### Purpose Limitation

```typescript
// ✅ Only use data for stated purposes
const dataUsagePolicy = {
  email: {
    collectedFor: 'Account creation and login',
    usedFor: [
      'Authentication',
      'Password reset',
      'Critical service notifications',
    ],
    notUsedFor: [
      'Marketing (without separate consent)',
      'Sold to third parties',
      'Unrelated product announcements',
    ],
  },
}
```

---

## ✅ Consent Management

### Valid Consent Requirements

```typescript
const validConsentRequirements = {
  freelyGiven: 'No coercion or negative consequences for refusing',
  specific: 'Separate consent for each purpose',
  informed: 'Clear explanation before consent',
  unambiguous: 'Clear affirmative action required',
  revocable: 'Easy withdrawal anytime',
  documented: 'Record when and how consent obtained',
}

// ❌ Invalid consent patterns
const invalidConsent = [
  'Pre-ticked boxes',
  'Bundled terms (agree to all or nothing)',
  'Inactivity or silence as consent',
  'Hidden in terms of service',
  'Hard to withdraw',
]
```

### Consent Implementation

```typescript
// ✅ Granular consent for different purposes
interface ConsentPreferences {
  essential: {
    description: 'Required for the service to function',
    required: true,
    collected: true,
  },
  analytics: {
    description: 'Helps us improve our website',
    required: false,
    collected: boolean,
    timestamp?: Date,
    method?: 'checkbox' | 'banner',
  },
  marketing: {
    description: 'Send you product updates and offers',
    required: false,
    collected: boolean,
    timestamp?: Date,
    method?: 'checkbox',
  },
  thirdParty: {
    description: 'Share with trusted partners',
    required: false,
    collected: boolean,
    timestamp?: Date,
  },
}

// Consent storage
const consentRecord = {
  userId: string,
  timestamp: Date,
  ipAddress: string,      // For audit trail
  userAgent: string,
  consentGiven: string[], // ['essential', 'analytics']
  consentWithdrawn: string[],
  version: '2026-01-15',  // Privacy policy version
}
```

### Cookie Consent Banner

```typescript
// ✅ Compliant cookie banner
interface CookieBanner {
  // Immediate display (no scrolling required)
  position: 'bottom' | 'top' | 'modal'
  
  // Clear, jargon-free language
  title: 'We value your privacy'
  description: 'We use cookies to enhance your browsing experience, serve personalized content, and analyze traffic. Read our Privacy Policy.'
  
  // Granular options (not just accept/reject)
  options: {
    essential: { label: 'Essential', required: true, enabled: true }
    analytics: { label: 'Analytics', required: false, enabled: false }
    marketing: { label: 'Marketing', required: false, enabled: false }
  }
  
  // Actions
  actions: [
    { label: 'Accept All', action: 'accept_all' },
    { label: 'Save Preferences', action: 'save_preferences' },
    { label: 'Reject Non-Essential', action: 'reject_optional' },
  ]
  
  // Always accessible
  manageLink: 'Manage preferences anytime in footer'
}
```

---

## 🔐 Data Security

### Encryption Standards

```typescript
const encryptionStandards = {
  atRest: {
    algorithm: 'AES-256',
    keyManagement: 'AWS KMS / HashiCorp Vault',
    fields: ['ssn', 'financial_data', 'health_data'],
  },
  inTransit: {
    protocol: 'TLS 1.3',
    hsts: 'max-age=31536000; includeSubDomains; preload',
    certificatePinning: true,
  },
}

// Pseudonymization for analytics
function pseudonymize(userId: string): string {
  return crypto.createHash('sha256')
    .update(userId + PEPPER)
    .digest('hex')
}
```

### Access Controls

```typescript
const dataAccessPolicy = {
  principle: 'Least privilege',
  roles: {
    'support-agent': ['view:user_profile', 'edit:tickets'],
    'support-manager': ['view:user_profile', 'edit:tickets', 'view:billing'],
    'billing-team': ['view:billing', 'edit:invoices'],
    'engineer': ['view:logs', 'view:metrics'], // No PII access
    'data-engineer': ['view:anonymized_data'],
  },
  logging: {
    accessLog: true,
    fields: ['who', 'what', 'when', 'why'],
    retention: '2 years',
  },
}
```

---

## 📊 Data Subject Request Handling

### Request Types & SLAs

```typescript
const dsrWorkflows = {
  access: {
    description: 'Provide copy of all personal data',
    sla: '30 days',
    format: 'JSON or CSV (machine-readable)',
    verification: 'Identity confirmation required',
  },
  deletion: {
    description: 'Delete all personal data (right to be forgotten)',
    sla: '30 days',
    exceptions: ['legal_obligation', 'contract_performance'],
    process: [
      'Verify identity',
      'Check legal basis for retention',
      'Delete or anonymize data',
      'Notify third parties (if shared)',
      'Confirm completion to user',
    ],
  },
  portability: {
    description: 'Export data in portable format',
    sla: '30 days',
    format: 'JSON, XML, or CSV',
    scope: 'Data provided by user or observed behavior',
  },
  rectification: {
    description: 'Correct inaccurate data',
    sla: 'Immediate (within reason)',
    process: [
      'Verify requested change',
      'Update data',
      'Propagate to third parties (if shared)',
    ],
  },
}

// Request tracking
interface DataSubjectRequest {
  id: string
  type: 'access' | 'deletion' | 'portability' | 'rectification'
  userId: string
  email: string
  status: 'pending' | 'in_review' | 'processing' | 'completed' | 'rejected'
  submittedAt: Date
  dueDate: Date
  completedAt?: Date
  notes: string[]
}
```

---

## 🌍 International Data Transfers

### Transfer Mechanisms

```typescript
const transferMechanisms = {
  adequacyDecision: {
    description: 'EU recognizes country as adequate',
    countries: ['UK', 'Canada', 'Japan', 'Switzerland', 'New Zealand'],
  },
  standardContractualClauses: {
    description: 'SCCs with additional safeguards',
    requiredFor: ['USA', 'India', 'other_non_adequate'],
    version: '2021/914 (new SCCs)',
  },
  bindingCorporateRules: {
    description: 'For intra-company transfers',
    useCase: 'Multinational corporations',
  },
  derogations: {
    explicitConsent: 'User explicitly consents to transfer',
    contract: 'Necessary for contract performance',
    publicInterest: 'Important public interest',
  },
}

// Schrems II compliance
const additionalSafeguards = {
  encryption: 'End-to-end encryption during transfer',
  pseudonymization: 'Data pseudonymized before transfer',
  supplementaryMeasures: 'Technical safeguards documented',
  tia: 'Transfer Impact Assessment completed',
}
```

---

## 📝 Privacy Policy Requirements

### Required Disclosures

```typescript
const privacyPolicySections = {
  identity: 'Who you are (legal name, contact)',
  dpo: 'Data Protection Officer contact (if required)',
  whatData: 'What personal data you collect',
  howCollected: 'How you collect it (forms, cookies, etc.)',
  legalBasis: 'Legal basis for each processing activity',
  purposes: 'Why you collect it (specific purposes)',
  retention: 'How long you keep it',
  sharing: 'Who you share it with (third parties)',
  transfers: 'International transfers and safeguards',
  rights: 'User rights and how to exercise them',
  cookies: 'Cookie usage and consent',
  automatedDecisions: 'Any automated decision-making',
  security: 'Security measures (high level)',
  changes: 'How you notify of policy changes',
  complaints: 'How to lodge complaints with supervisory authority',
}

// Keep policy versioned
interface PrivacyPolicyVersion {
  version: string      // e.g., '2026-02-01'
  effectiveDate: Date
  changes: string[]    // Summary of changes
  notificationSent: boolean
}
```

---

## 🔍 Data Breach Response

### Breach Notification Requirements

```typescript
const breachResponse = {
  detection: {
    timeframe: '72 hours maximum to assess',
    steps: [
      'Identify scope and nature',
      'Assess risk to individuals',
      'Determine notification obligation',
    ],
  },
  notification: {
    supervisoryAuthority: {
      required: 'When risk to rights and freedoms',
      timeline: 'Within 72 hours of discovery',
      format: 'Written, electronic',
    },
    dataSubjects: {
      required: 'When high risk',
      timeline: 'Without undue delay',
      method: 'Direct communication (email, in-app)',
      content: [
        'Nature of breach',
        'Data Protection Officer contact',
        'Likely consequences',
        'Measures taken/proposed',
        'Steps users should take',
      ],
    },
  },
  documentation: {
    required: true,
    content: [
      'Facts relating to the breach',
      'Effects of the breach',
      'Remedial action taken',
    ],
  },
}
```

---

## ⚙️ Technical Implementation

### Privacy-Compliant Logging

```typescript
// ❌ BAD — Logging PII
logger.info(`User ${email} logged in from ${ip}`)

// ✅ GOOD — Logging pseudonymized data
logger.info({
  event: 'user_login',
  userId: hash(userId),      // Pseudonymized
  timestamp: new Date(),
  ipHash: hash(ip),          // One-way hash
  userAgent: req.headers['user-agent'], // OK for analytics
})

// Never log
const neverLog = [
  'passwords',
  'credit_card_numbers',
  'ssn',
  'unhashed_emails',
  'health_records',
  'precise_location',
]
```

### Data Retention Automation

```typescript
// ✅ Automatic data purging
interface RetentionPolicy {
  userActivity: {
    retention: '2 years after last login',
    action: 'anonymize_or_delete',
  },
  analytics: {
    retention: '26 months',
    action: 'aggregate_and_delete_raw',
  },
  supportTickets: {
    retention: '7 years', // Legal obligation
    action: 'retain_with_access_restrictions',
  },
  failedLogins: {
    retention: '90 days',
    action: 'delete',
  },
}

// Automated cleanup job
async function executeDataRetentionPolicy() {
  const usersToAnonymize = await db.users.find({
    lastLogin: { $lt: twoYearsAgo() },
    status: { $ne: 'anonymized' },
  })
  
  for (const user of usersToAnonymize) {
    await anonymizeUser(user.id)
    await logRetentionAction(user.id, 'anonymized')
  }
}
```

---

## ✅ GDPR Compliance Checklist

### Legal & Documentation
- [ ] Privacy policy updated (comprehensive, clear)
- [ ] Cookie policy and consent mechanism
- [ ] Data Processing Agreements (DPAs) with all processors
- [ ] Records of Processing Activities (ROPA) maintained
- [ ] Data Protection Officer appointed (if required)
- [ ] Transfer Impact Assessments (for international transfers)

### Technical & Security
- [ ] Encryption at rest and in transit
- [ ] Access controls (least privilege)
- [ ] Audit logging for data access
- [ ] Pseudonymization where possible
- [ ] Regular security assessments
- [ ] Data retention automation

### User Rights
- [ ] Process for handling Data Subject Requests (DSRs)
- [ ] DSR request tracking system
- [ ] Identity verification for DSRs
- [ ] Data portability export function
- [ ] Account deletion functionality

### Breach Preparedness
- [ ] Breach detection and monitoring
- [ ] Incident response plan
- [ ] 72-hour notification procedure
- [ ] Communication templates ready

---

## 🔒 Skill Version

```
Skill: GDPR Compliance
Version: 1.0.0
Last Updated: 2026-02-02
Regulation: EU GDPR 2016/679
Scope: Data protection, privacy by design
```
