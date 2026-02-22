---
name: Event-Driven Architecture
description: Message queues, event streaming, and async processing patterns
version: 1.0.0
primary_agents: [swarm-arch, swarm-dev]
---

# ⚡ Event-Driven Architecture Skill

> **ACTIVATION:** Async is the default. Sync is the exception. Build for loose coupling.

---

## 🎯 Core Concepts

### Event-Driven vs Request-Response

```typescript
// ❌ Synchronous - Tight coupling
const order = await createOrder(data)
await inventoryService.reserve(order.items)     // Blocking
await paymentService.charge(order.total)        // Blocking
await notificationService.sendConfirmation(order) // Blocking

// ✅ Asynchronous - Loose coupling
const order = await createOrder(data)
await eventBus.publish('order.created', order)
// Services react independently
```

### Event Types

| Type | Pattern | Use Case |
|------|---------|----------|
| **Event** | Fire-and-forget | Notification sent |
| **Command** | Request-response | Process payment |
| **Document** | Data transfer | User profile updated |

---

## 🏗️ Message Queue Patterns

### Point-to-Point (Queue)

```typescript
// One consumer processes each message
// ✅ Work distribution, load balancing

// Producer
await queue.send('email-queue', {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: '...',
})

// Consumer (multiple instances)
queue.process('email-queue', async (job) => {
  await sendEmail(job.data)
})
```

### Publish-Subscribe (Topic)

```typescript
// Multiple consumers receive each message
// ✅ Broadcasting, decoupled services

// Producer
await eventBus.publish('user.signup', {
  userId: '123',
  email: 'user@example.com',
})

// Consumer 1: Send welcome email
eventBus.subscribe('user.signup', async (event) => {
  await sendWelcomeEmail(event.email)
})

// Consumer 2: Add to CRM
eventBus.subscribe('user.signup', async (event) => {
  await crm.addContact(event)
})

// Consumer 3: Analytics tracking
eventBus.subscribe('user.signup', async (event) => {
  await analytics.track('signup', event)
})
```

---

## 🔄 Event Processing

### At-Least-Once Delivery

```typescript
// ✅ Acknowledge after processing
queue.process('orders', async (job) => {
  try {
    await processOrder(job.data)
    // Acknowledge on success
    return { success: true }
  } catch (error) {
    // Fail — will retry
    throw error
  }
})

// Idempotency for safety
async function processOrder(order: Order) {
  // Check if already processed
  const existing = await db.processedEvents.findOne({
    eventId: order.id,
  })
  
  if (existing) {
    console.log('Already processed, skipping')
    return existing.result
  }
  
  // Process
  const result = await doProcessing(order)
  
  // Record as processed
  await db.processedEvents.insert({
    eventId: order.id,
    result,
    processedAt: new Date(),
  })
  
  return result
}
```

### Dead Letter Queue

```typescript
// Handle failed messages
const queueConfig = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // Start with 1s
  },
  removeOnComplete: 100, // Keep last 100
  removeOnFail: 50,      // Keep last 50
}

// After 3 failures, move to dead letter
queue.on('failed', async (job, err) => {
  if (job.attemptsMade >= 3) {
    await deadLetterQueue.add({
      originalJob: job.data,
      error: err.message,
      failedAt: new Date(),
    })
    
    // Alert operations
    await alertOps(`Job ${job.id} moved to DLQ`)
  }
})
```

---

## 📊 Message Queue Technologies

| Technology | Pattern | Best For |
|------------|---------|----------|
| **Redis** | Queue + Pub/Sub | Simple, fast, in-memory |
| **RabbitMQ** | Queue + Exchange | Reliability, routing |
| **Kafka** | Log/Stream | High throughput, persistence |
| **SQS** | Queue | AWS ecosystem |
| **Pub/Sub** | Pub/Sub | GCP ecosystem |

---

## ✅ Checklist

- [ ] Events are immutable
- [ ] Consumers are idempotent
- [ ] Dead letter queue configured
- [ ] Message ordering defined (if needed)
- [ ] Retries with backoff
- [ ] Monitoring and alerting
- [ ] Schema versioning for events

---

## 🔒 Skill Version

```
Skill: Event-Driven Architecture
Version: 1.0.0
Last Updated: 2026-02-02
```
