---
name: Microservices Architecture
description: Distributed systems patterns for scalable, resilient services
version: 1.0.0
primary_agents: [swarm-arch]
---

# 🏛️ Microservices Architecture Skill

> **ACTIVATION:** Monoliths scale teams poorly. Microservices scale systems well but introduce complexity. Choose wisely.

---

## 🎯 Core Principles

1. **Single Responsibility** — One service, one bounded context
2. **Loose Coupling** — Services know each other through APIs, not internals
3. **High Cohesion** — Related functionality stays together
4. **Independent Deployability** — Deploy without coordinating with other teams
5. **Failure Isolation** — One service down doesn't cascade to all

---

## 🎭 Monolith vs Microservices

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Team Size** | < 10 developers | > 20 developers |
| **Deployment** | Weekly/Monthly | Multiple times daily |
| **Scale** | Scale entire app | Scale individual services |
| **Tech Stack** | Single stack | Polyglot (per service) |
| **Complexity** | Code complexity | Operational complexity |
| **Latency** | In-process calls | Network calls |
| **Data** | Shared database | Database per service |

### When to Choose What

```typescript
function selectArchitecture(context: ProjectContext): Architecture {
  if (context.teamSize < 10) return 'Monolith'
  if (context.scaleRequirement === 'uniform') return 'Monolith'
  if (context.deploymentFrequency === 'rare') return 'Monolith'
  if (context.teamCount > 3) return 'Microservices'
  if (context.scaleRequirement === 'heterogeneous') return 'Microservices'
  return 'Modular Monolith' // Best of both worlds
}
```

---

## 🏗️ Service Decomposition Patterns

### Bounded Context (DDD)

```typescript
// ✅ Each service owns a business capability

// User Service — Owns user identity and profiles
interface UserService {
  createUser(data: CreateUserDTO): Promise<User>
  updateProfile(userId: string, data: ProfileDTO): Promise<User>
  authenticate(credentials: Credentials): Promise<Token>
}

// Order Service — Owns order lifecycle
interface OrderService {
  createOrder(userId: string, items: OrderItem[]): Promise<Order>
  cancelOrder(orderId: string): Promise<void>
  getOrderHistory(userId: string): Promise<Order[]>
}

// Inventory Service — Owns stock levels
interface InventoryService {
  reserveStock(productId: string, quantity: number): Promise<Reservation>
  releaseStock(reservationId: string): Promise<void>
  checkAvailability(productId: string): Promise<number>
}
```

### Decomposition Strategies

| Strategy | By | When to Use |
|----------|-----|-------------|
| **Business Capability** | What it does | Natural domain boundaries |
| **Subdomain** | DDD bounded contexts | Complex domain logic |
| **Transaction** | Data consistency needs | Strong consistency requirements |
| **Team** | Organizational structure | Conway's Law alignment |

---

## 🔄 Inter-Service Communication

### Synchronous (Request/Response)

```typescript
// ✅ Use for real-time requirements
// ⚠️ Avoid long chains (cascading failures)

// REST API call
async function getUserOrders(userId: string): Promise<Order[]> {
  const user = await userService.getUser(userId)
  if (!user) throw new NotFoundError()
  
  return await orderService.getOrdersByUser(userId)
}

// gRPC for performance
const client = new OrderServiceClient('orders:50051')
const response = await client.getOrders({ userId })
```

### Asynchronous (Event-Driven)

```typescript
// ✅ Use for loose coupling, eventual consistency
// ✅ Preferred for most microservice communication

// Event Publisher (Order Service)
async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const order = await db.orders.create(data)
  
  // Publish event instead of calling services directly
  await eventBus.publish('order.created', {
    orderId: order.id,
    userId: order.userId,
    items: order.items,
    total: order.total,
    timestamp: new Date(),
  })
  
  return order
}

// Event Subscriber (Inventory Service)
eventBus.subscribe('order.created', async (event) => {
  for (const item of event.items) {
    await inventoryService.reserveStock(item.productId, item.quantity)
  }
})

// Event Subscriber (Notification Service)
eventBus.subscribe('order.created', async (event) => {
  await notificationService.sendOrderConfirmation(event.userId, event.orderId)
})
```

---

## 📊 Data Management

### Database Per Service

```typescript
// ✅ Each service owns its data store
// ✅ Services integrate via APIs, not database joins

// User Service — PostgreSQL
interface UserDB {
  users: {
    id: string
    email: string
    profile: JSON
    createdAt: Date
  }
}

// Order Service — PostgreSQL (different instance)
interface OrderDB {
  orders: {
    id: string
    userId: string      // Reference, not foreign key
    items: OrderItem[]
    status: OrderStatus
    total: number
  }
}

// Analytics Service — ClickHouse (OLAP)
interface AnalyticsDB {
  order_events: {
    orderId: string
    eventType: string
    timestamp: DateTime64
    metadata: JSON
  }
}
```

### CQRS (Command Query Responsibility Segregation)

```typescript
// ✅ Separate read and write models

// Write Model (Command Side)
class OrderWriteService {
  async createOrder(cmd: CreateOrderCommand): Promise<void> {
    await db.orders.insert({
      id: cmd.orderId,
      userId: cmd.userId,
      items: cmd.items,
      status: 'pending',
    })
    
    await eventStore.append('order.created', {
      orderId: cmd.orderId,
      userId: cmd.userId,
      items: cmd.items,
    })
  }
}

// Read Model (Query Side) — Optimized for queries
class OrderReadService {
  async getOrderSummary(orderId: string): Promise<OrderSummary> {
    // Pre-joined, denormalized data
    return await db.orderViews.findOne({ orderId })
  }
  
  async getUserOrderHistory(userId: string): Promise<OrderHistory[]> {
    return await db.orderViews.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
  }
}
```

---

## 🔄 Sagas (Distributed Transactions)

### Choreography Saga (Event-Driven)

```typescript
// ✅ Services react to events, no central coordinator

// Order Service — Initiates saga
async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const order = await db.orders.create({ ...data, status: 'pending' })
  await eventBus.publish('order.created', { orderId: order.id, items: data.items })
  return order
}

// Inventory Service — Participates
eventBus.subscribe('order.created', async (event) => {
  try {
    for (const item of event.items) {
      await inventoryService.reserveStock(item.productId, item.quantity)
    }
    await eventBus.publish('inventory.reserved', { orderId: event.orderId })
  } catch (error) {
    await eventBus.publish('inventory.reservation_failed', { 
      orderId: event.orderId,
      reason: error.message 
    })
  }
})

// Payment Service — Participates  
eventBus.subscribe('inventory.reserved', async (event) => {
  try {
    await paymentService.charge(event.orderId)
    await eventBus.publish('payment.processed', { orderId: event.orderId })
  } catch (error) {
    await eventBus.publish('payment.failed', { orderId: event.orderId })
  }
})

// Order Service — Completes or compensates
eventBus.subscribe('payment.processed', async (event) => {
  await db.orders.update(event.orderId, { status: 'confirmed' })
})

eventBus.subscribe('payment.failed', async (event) => {
  await db.orders.update(event.orderId, { status: 'cancelled' })
  // Compensation: release inventory
  await eventBus.publish('order.cancelled', { orderId: event.orderId })
})
```

### Orchestration Saga (Central Coordinator)

```typescript
// ✅ Central saga orchestrator manages the flow
// ✅ Better for complex, long-running sagas

class OrderSagaOrchestrator {
  async execute(orderId: string): Promise<void> {
    const saga = await this.createSaga(orderId)
    
    try {
      // Step 1: Reserve inventory
      await this.reserveInventory(saga)
      
      // Step 2: Process payment
      await this.processPayment(saga)
      
      // Step 3: Create shipment
      await this.createShipment(saga)
      
      // Success
      await this.completeOrder(saga)
    } catch (error) {
      // Compensate in reverse order
      await this.compensate(saga)
    }
  }
  
  private async compensate(saga: Saga): Promise<void> {
    if (saga.shipmentCreated) {
      await shipmentService.cancelShipment(saga.orderId)
    }
    if (saga.paymentProcessed) {
      await paymentService.refund(saga.orderId)
    }
    if (saga.inventoryReserved) {
      await inventoryService.releaseStock(saga.orderId)
    }
  }
}
```

---

## 🛡️ Resilience Patterns

### Circuit Breaker

```typescript
// ✅ Prevent cascading failures
import CircuitBreaker from 'opossum'

const options = {
  timeout: 3000,              // 3 second timeout
  errorThresholdPercentage: 50, // Open when 50% fail
  resetTimeout: 30000,        // Try again after 30s
}

const breaker = new CircuitBreaker(asyncFunction, options)

breaker.on('open', () => console.log('Circuit breaker opened'))
breaker.on('halfOpen', () => console.log('Circuit breaker half-open'))
breaker.on('close', () => console.log('Circuit breaker closed'))

// Usage
async function getUserWithCircuitBreaker(userId: string) {
  try {
    return await breaker.fire(userId)
  } catch (error) {
    if (breaker.opened) {
      // Return fallback data
      return getCachedUser(userId)
    }
    throw error
  }
}
```

### Bulkhead (Thread Pool Isolation)

```typescript
// ✅ Isolate failures by resource pools
class ServiceClient {
  private priorityPool: Pool
  private standardPool: Pool
  
  constructor() {
    // Separate pools prevent one workload from starving another
    this.priorityPool = new Pool({ maxConnections: 10 })
    this.standardPool = new Pool({ maxConnections: 20 })
  }
  
  async requestPriority(data: Request): Promise<Response> {
    return this.priorityPool.execute(() => this.makeRequest(data))
  }
  
  async requestStandard(data: Request): Promise<Response> {
    return this.standardPool.execute(() => this.makeRequest(data))
  }
}
```

### Timeout & Retry

```typescript
// ✅ Fail fast, retry with backoff
async function resilientRequest<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number
    baseDelay: number
    maxDelay: number
  }
): Promise<T> {
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await withTimeout(operation, 5000)
    } catch (error) {
      if (attempt === options.maxRetries) throw error
      
      // Exponential backoff with jitter
      const delay = Math.min(
        options.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        options.maxDelay
      )
      
      await sleep(delay)
    }
  }
  throw new Error('Unreachable')
}
```

---

## 🔍 Service Discovery

### Client-Side Discovery

```typescript
// ✅ Client queries registry, selects instance
import { Consul } from 'consul'

const consul = new Consul()

async function getServiceInstance(serviceName: string): Promise<string> {
  const services = await consul.health.service(serviceName)
  
  // Filter healthy instances
  const healthy = services.filter(s => 
    s.Checks.every(c => c.Status === 'passing')
  )
  
  // Load balance (round-robin or random)
  const instance = healthy[Math.floor(Math.random() * healthy.length)]
  return `${instance.Service.Address}:${instance.Service.Port}`
}

// Usage
const userServiceUrl = await getServiceInstance('user-service')
const user = await fetch(`${userServiceUrl}/users/${userId}`)
```

### Server-Side Discovery (API Gateway)

```typescript
// ✅ Gateway routes to appropriate service
const gatewayRoutes = {
  '/api/users': 'user-service',
  '/api/orders': 'order-service',
  '/api/products': 'product-service',
}

app.use('/api', async (req, res) => {
  const service = gatewayRoutes[req.path]
  if (!service) return res.status(404).send('Not found')
  
  const instances = await serviceRegistry.getHealthy(service)
  const target = loadBalancer.select(instances)
  
  // Proxy request
  proxy.web(req, res, { target })
})
```

---

## 🚀 Deployment Strategies

### Blue-Green Deployment

```typescript
// ✅ Zero-downtime, instant rollback
async function deploy(version: string): Promise<void> {
  // Deploy to green environment
  await deployTo('green', version)
  
  // Health check green
  const healthy = await healthCheck('green')
  if (!healthy) {
    await rollback('green')
    throw new Error('Health check failed')
  }
  
  // Switch traffic (instant)
  await switchTraffic('blue', 'green')
  
  // Keep blue for quick rollback
  setTimeout(() => undeploy('blue'), 3600000) // 1 hour
}
```

### Canary Deployment

```typescript
// ✅ Gradual rollout with monitoring
async function canaryDeploy(version: string): Promise<void> {
  // Deploy canary (5% traffic)
  await deployCanary(version, { traffic: 0.05 })
  
  // Monitor for 15 minutes
  const metrics = await collectMetrics(15 * 60 * 1000)
  
  if (metrics.errorRate > 0.01 || metrics.latencyP99 > 1000) {
    await rollbackCanary()
    throw new Error('Canary failed metrics')
  }
  
  // Gradually increase: 5% → 25% → 50% → 100%
  for (const percentage of [0.25, 0.5, 1.0]) {
    await adjustTraffic(version, percentage)
    await sleep(600000) // 10 minutes between steps
  }
}
```

---

## ✅ Microservices Checklist

Before decomposing into microservices:

- [ ] Bounded contexts clearly defined
- [ ] Database per service (no shared DB)
- [ ] Inter-service communication pattern chosen (sync vs async)
- [ ] Saga pattern for distributed transactions
- [ ] Circuit breakers on all external calls
- [ ] Service discovery implemented
- [ ] Centralized logging & tracing
- [ ] Health checks on all services
- [ ] CI/CD pipeline per service
- [ ] Monitoring and alerting configured
- [ ] Rollback strategy tested

---

## 🔒 Skill Version

```
Skill: Microservices Architecture
Version: 1.0.0
Last Updated: 2026-02-02
Patterns: Saga, Circuit Breaker, CQRS, Event-Driven
```
