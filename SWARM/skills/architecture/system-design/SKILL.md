---
name: System Design
version: 1.0.0
primary_agents: [swarm-arch]
---

# 🏗️ System Design Skill

> **ACTIVATION:** Design systems that survive 10x growth without architectural changes.

---

## 🎯 Design Process

### 1. Requirements Gathering

```typescript
const requirements = {
  functional: [
    'What features must the system support?',
    'What are the user interactions?',
    'What data needs to be stored?',
  ],
  nonFunctional: {
    scale: 'Expected users, requests/sec, data volume',
    performance: 'Latency requirements (p50, p95, p99)',
    availability: 'SLA target (99.9%, 99.99%)',
    consistency: 'Strong vs eventual consistency needs',
  },
  constraints: [
    'Budget limitations',
    'Team expertise',
    'Time to market',
    'Regulatory requirements',
  ],
}
```

### 2. Back-of-Envelope Calculations

```typescript
// Example: Designing a URL shortener
const calculations = {
  // Scale
  dailyActiveUsers: 100_000_000, // 100M DAU
  requestsPerUserPerDay: 10,
  totalRequestsPerDay: 1_000_000_000, // 1B
  requestsPerSecond: 1_000_000_000 / 86_400, // ~11,574 RPS
  
  // Data
  urlLength: 500, // bytes
  metadataLength: 200, // bytes
  totalPerUrl: 700, // bytes
  newUrlsPerDay: 10_000_000, // 10M
  storagePerDay: 10_000_000 * 700, // 7GB
  storagePerYear: 7 * 365, // ~2.5TB
  
  // Cache
  readWriteRatio: 100, // 100:1
  cacheHitRate: 0.8,
  cacheSize: '100GB', // Hot URLs
}
```

---

## 🏛️ Architecture Patterns

### Monolith vs Microservices

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Team Size | <10 devs | >20 devs |
| Deployment | Weekly | Daily |
| Scale | Uniform | Heterogeneous |
| Complexity | Code | Operational |

### Layered Architecture

```
┌─────────────────────────────────────┐
│           Load Balancer              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│              CDN                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          API Gateway                 │
│  (Auth, Rate Limit, Routing)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Application Layer             │
│  (Services, Business Logic)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Data Layer                   │
│  (Database, Cache, Queue)            │
└─────────────────────────────────────┘
```

---

## 🗄️ Data Storage

### Storage Types

| Type | Use Case | Examples |
|------|----------|----------|
| **Relational** | Structured, ACID | PostgreSQL, MySQL |
| **NoSQL** | Flexible, scale | MongoDB, DynamoDB |
| **Cache** | Fast reads | Redis, Memcached |
| **Search** | Full-text | Elasticsearch |
| **Blob** | Files, images | S3, GCS |
| **Time-series** | Metrics | InfluxDB, TimescaleDB |

### CAP Theorem

```typescript
// You can only pick 2 of 3
const capChoices = {
  cp: 'Consistency + Partition Tolerance (CP) — Traditional databases',
  ap: 'Availability + Partition Tolerance (AP) — Cassandra, DynamoDB',
  // CA not possible in distributed systems
}

// Real-world: Choose based on requirements
const databaseChoice = {
  banking: 'CP — Consistency is critical',
  socialFeed: 'AP — Availability matters more',
  shoppingCart: 'AP — Eventual consistency OK',
}
```

---

## 🚀 Scalability Patterns

### Horizontal vs Vertical

```typescript
// ✅ Horizontal Scaling (Preferred)
// Add more machines
const horizontalScaling = {
  pros: ['Unlimited scale', 'No downtime', 'Cost effective'],
  cons: ['Complexity', 'Data consistency challenges'],
  requires: ['Stateless services', 'Load balancer', 'Distributed data'],
}

// Vertical Scaling (Simpler, limited)
// Bigger machines
const verticalScaling = {
  pros: ['Simple', 'No code changes'],
  cons: ['Hardware limits', 'Downtime', 'Expensive'],
  limit: 'Max instance size (e.g., 128 CPU, 4TB RAM)',
}
```

### Caching Strategy

```typescript
// Cache-Aside (Lazy Loading)
async function getUser(userId: string) {
  // Try cache first
  let user = await cache.get(`user:${userId}`)
  
  if (!user) {
    // Cache miss — fetch from DB
    user = await db.users.findById(userId)
    
    // Store in cache
    await cache.set(`user:${userId}`, user, { ttl: 3600 })
  }
  
  return user
}

// Write-Through (Cache always fresh)
async function updateUser(userId: string, data: UserUpdate) {
  // Update DB
  const user = await db.users.update(userId, data)
  
  // Update cache simultaneously
  await cache.set(`user:${userId}`, user, { ttl: 3600 })
  
  return user
}

// Cache Eviction Strategies
const evictionPolicies = {
  lru: 'Least Recently Used — Good for general case',
  lfu: 'Least Frequently Used — Good for hot data',
  ttl: 'Time To Live — Automatic expiration',
}
```

---

## 🔐 Security Architecture

### Defense in Depth

```
┌────────────────────────────────────────┐
│  1. WAF (Block malicious requests)     │
├────────────────────────────────────────┤
│  2. DDoS Protection (Rate limiting)    │
├────────────────────────────────────────┤
│  3. TLS/SSL (Encryption in transit)    │
├────────────────────────────────────────┤
│  4. Authentication (Who are you?)      │
├────────────────────────────────────────┤
│  5. Authorization (What can you do?)   │
├────────────────────────────────────────┤
│  6. Input Validation (Sanitize data)   │
├────────────────────────────────────────┤
│  7. Output Encoding (Prevent XSS)      │
├────────────────────────────────────────┤
│  8. Database Security (RLS, encryption)│
└────────────────────────────────────────┘
```

### Security Checklist

- [ ] All data encrypted in transit (TLS 1.3)
- [ ] Sensitive data encrypted at rest
- [ ] Authentication on all endpoints
- [ ] Principle of least privilege
- [ ] Input validation on all inputs
- [ ] Rate limiting on APIs
- [ ] Audit logging for sensitive operations
- [ ] Secrets management (Vault, KMS)

---

## 📊 System Design Checklist

### Before Design
- [ ] Requirements clarified (functional + non-functional)
- [ ] Scale estimates calculated
- [ ] Constraints identified

### During Design
- [ ] High-level architecture diagram created
- [ ] Data model designed
- [ ] API contracts defined
- [ ] Scaling strategy chosen
- [ ] Failure modes identified
- [ ] Security layers designed

### After Design
- [ ] Trade-offs documented
- [ ] Bottlenecks identified
- [ ] Monitoring strategy defined
- [ ] Rollback plan created

---

## 🔒 Skill Version

```
Skill: System Design
Version: 1.0.0
Last Updated: 2026-02-02
Focus: Architecture, Scalability, Trade-offs
```
