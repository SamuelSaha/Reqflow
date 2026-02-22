# Backend Architecture Mastery - Production-Grade Patterns

Advanced backend system architecture patterns for scalable, maintainable systems.

---

## 🎯 WHEN TO USE

### Use Backend Architecture Patterns When:
- **Complex domain logic** → Multiple bounded contexts, business rules
- **Scalability requirements** → High throughput, horizontal scaling
- **Team collaboration** → Multiple developers, clean boundaries
- **Long-term maintenance** → Evolving requirements, technical debt management
- **Performance critical** → Optimized query paths, caching strategies

### Pattern Selection Guide:

| Pattern | Use Case | Complexity | Scalability |
|---------|----------|------------|-------------|
| Layered | Simple CRUD apps | Low | Medium |
| Hexagonal | Domain-driven design | Medium | High |
| CQRS | Read/write asymmetry | High | Very High |
| Event Sourcing | Audit trail, temporal queries | Very High | Very High |
| Saga | Distributed transactions | High | High |

---

## 🏗️ LAYERED ARCHITECTURE

### Pattern Overview

```
┌─────────────────────────────────────┐
│     Presentation Layer (HTTP)      │
├─────────────────────────────────────┤
│       Application Layer            │
├─────────────────────────────────────┤
│       Domain Layer                 │
├─────────────────────────────────────┤
│     Infrastructure Layer (DB)       │
└─────────────────────────────────────┘
```

### Implementation

```typescript
// Presentation Layer
// src/controllers/userController.ts
export class UserController {
  constructor(private userService: UserService) {}
  
  async createUser(req: Request, res: Response) {
    const dto = CreateUserDTO.fromRequest(req.body);
    const user = await this.userService.createUser(dto);
    res.status(201).json(user);
  }
  
  async getUser(req: Request, res: Response) {
    const id = req.params.id;
    const user = await this.userService.getUserById(id);
    res.json(user);
  }
}

// Application Layer
// src/services/userService.ts
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService
  ) {}
  
  async createUser(dto: CreateUserDTO) {
    // Validate
    await this.validateEmail(dto.email);
    
    // Create user
    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: await this.hashPassword(dto.password),
    });
    
    // Send welcome email (fire and forget)
    this.emailService.sendWelcomeEmail(user.email).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
    
    return user;
  }
  
  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}

// Domain Layer
// src/models/user.ts
export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
  
  validate() {
    if (!this.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }
    if (this.password.length < 8) {
      throw new ValidationError('Password too short');
    }
  }
}

// Infrastructure Layer
// src/repositories/userRepository.ts
export class UserRepository {
  constructor(private db: Database) {}
  
  async findById(id: string) {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
  
  async create(data: CreateUserData) {
    return this.db.query('INSERT INTO users ...', [data]);
  }
}
```

### Pros and Cons

**Pros:**
- Simple to understand and implement
- Clear separation of concerns
- Easy to test each layer
- Common pattern with many examples

**Cons:**
- Can become anemic domain model
- Tight coupling between layers
- Database leak (infrastructure affects domain)
- Hard to scale read/write separately

---

## 🔄 HEXAGONAL ARCHITECTURE (PORTS AND ADAPTERS)

### Pattern Overview

```
         ┌──────────────────┐
         │     Domain       │
         │   (Business)     │
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │      Ports        │  (Interfaces)
        └─────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───┴────┐   ┌───┴────┐   ┌───┴────┐
│Primary │   │Secondary│   │Secondary│
│Adapters│   │Adapters │   │Adapters │
│(Driving)│   │(Driven)  │   │(Driven)  │
└────────┘   └─────────┘   └─────────┘
HTTP         Database      Email
CLI          Cache         Message Queue
```

### Implementation

```typescript
// Domain - Ports (Interfaces)
// src/domain/ports/userRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IEmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

// Domain - Application Service
// src/domain/services/userService.ts
export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private emailService: IEmailService
  ) {}
  
  async registerUser(data: RegisterUserData) {
    // Domain logic
    if (await this.userRepo.findByEmail(data.email)) {
      throw new ConflictError('Email already exists');
    }
    
    const user = new User({
      id: generateId(),
      name: data.name,
      email: data.email,
      password: await this.hashPassword(data.password),
    });
    
    await this.userRepo.save(user);
    await this.emailService.sendWelcomeEmail(user.email);
    
    return user;
  }
}

// Infrastructure - Adapters
// src/infrastructure/adapters/postgresUserRepository.ts
export class PostgresUserRepository implements IUserRepository {
  constructor(private db: PgPool) {}
  
  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? User.fromPersistence(row) : null;
  }
  
  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
      [user.id, user.name, user.email, user.password]
    );
  }
}

// src/infrastructure/adapters/sendgridEmailService.ts
export class SendgridEmailService implements IEmailService {
  async sendWelcomeEmail(email: string): Promise<void> {
    await this.sendgrid.send({
      to: email,
      template: 'welcome',
    });
  }
}

// Primary Adapter - HTTP Controller
// src/interfaces/http/userController.ts
export class UserController {
  constructor(private userService: UserService) {}
  
  async register(req: Request, res: Response) {
    const dto = RegisterUserDTO.fromRequest(req.body);
    const user = await this.userService.registerUser(dto);
    res.status(201).json(user.toDTO());
  }
}

// Composition Root
// src/composition.ts
export function createApp() {
  // Infrastructure
  const db = new PgPool(process.env.DATABASE_URL);
  const sendgrid = new SendgridClient(process.env.SENDGRID_API_KEY);
  
  // Adapters
  const userRepo = new PostgresUserRepository(db);
  const emailService = new SendgridEmailService(sendgrid);
  
  // Domain
  const userService = new UserService(userRepo, emailService);
  
  // Interfaces
  const userController = new UserController(userService);
  
  return express()
    .use(express.json())
    .post('/users/register', (req, res) => userController.register(req, res));
}
```

### Pros and Cons

**Pros:**
- Domain logic independent of infrastructure
- Easy to swap implementations (e.g., PostgreSQL → MongoDB)
- Testable domain logic with mocks
- Clear separation of concerns

**Cons:**
- More boilerplate code
- Overkill for simple applications
- Steeper learning curve
- Can lead to interface explosion

---

## 📊 CQRS (COMMAND QUERY RESPONSIBILITY SEGREGATION)

### Pattern Overview

```
┌─────────────────┐      ┌─────────────────┐
│  Write Side     │      │  Read Side      │
│ (Command Path)  │      │ (Query Path)    │
├─────────────────┤      ├─────────────────┤
│  Command Handler│      │   Query Handler │
│        ↓        │      │        ↓        │
│  Domain Model   │      │  Read Model     │
│        ↓        │      │        ↓        │
│  Write DB       │      │  Read DB        │
└────────┬────────┘      └─────────────────┘
         │
         └──→ Event Store → Update Read DB
```

### Implementation

```typescript
// Command Side
// src/commands/createUserCommand.ts
export interface CreateUserCommand {
  name: string;
  email: string;
  password: string;
}

export class CreateUserCommandHandler {
  constructor(
    private eventStore: IEventStore,
    private userRepository: IUserRepository
  ) {}
  
  async handle(command: CreateUserCommand) {
    // Create domain entity
    const user = User.create({
      name: command.name,
      email: command.email,
      password: command.password,
    });
    
    // Persist events
    await this.eventStore.appendEvents(user.getUncommittedEvents());
    
    // Update write model
    await this.userRepository.save(user);
    
    // Publish events
    await this.eventBus.publish(user.getUncommittedEvents());
    
    // Clear uncommitted events
    user.markEventsAsCommitted();
  }
}

// Query Side
// src/queries/getUserQuery.ts
export interface GetUserQuery {
  userId: string;
}

export interface UserReadModel {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

export class GetUserQueryHandler {
  constructor(private readDb: ReadDatabase) {}
  
  async handle(query: GetUserQuery): Promise<UserReadModel | null> {
    return this.readDb.queryOne(`
      SELECT 
        u.id, u.name, u.email,
        COUNT(o.id) as order_count,
        SUM(o.total) as total_spent
      FROM users_read u
      LEFT JOIN orders_read o ON o.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [query.userId]);
  }
}

// Event Handler - Updates Read Model
// src/projections/userProjection.ts
export class UserProjection {
  constructor(private readDb: ReadDatabase) {}
  
  async handle(event: UserCreatedEvent) {
    await this.readDb.query(`
      INSERT INTO users_read (id, name, email, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [event.userId, event.name, event.email, event.createdAt]);
  }
  
  async handle(event: OrderPlacedEvent) {
    await this.readDb.query(`
      INSERT INTO orders_read (id, user_id, total, created_at)
      VALUES ($1, $2, $3, $4)
    `, [event.orderId, event.userId, event.total, event.createdAt]);
  }
}
```

### Pros and Cons

**Pros:**
- Optimized read/write models separately
- Independent scaling of read/write sides
- Complex queries optimized for read side
- Clear separation of concerns

**Cons:**
- Increased complexity
- Eventual consistency
- More infrastructure (event bus, projections)
- Learning curve

---

## 📜 EVENT SOURCING

### Pattern Overview

```
┌──────────────────┐
│   Command        │
│   ↓              │
│   Aggregate      │
│   ↓              │
│   Generate Event │
│   ↓              │
│   Save to        │
│   Event Store    │
└──────────────────┘
        ↓
        ├──→ Rebuild State (from events)
        ├──→ Audit Trail
        └──→ Update Read Models (Projections)
```

### Implementation

```typescript
// Event Types
// src/domain/events.ts
export type DomainEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

export interface UserCreatedEvent {
  type: 'UserCreated';
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserUpdatedEvent {
  type: 'UserUpdated';
  userId: string;
  name?: string;
  email?: string;
  updatedAt: Date;
}

// Aggregate Root
// src/domain/aggregates/user.ts
export class User {
  private uncommittedEvents: DomainEvent[] = [];
  
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public version: number,
    public createdAt: Date
  ) {}
  
  static create(data: CreateUserData): User {
    const event: UserCreatedEvent = {
      type: 'UserCreated',
      userId: generateId(),
      name: data.name,
      email: data.email,
      createdAt: new Date(),
    };
    
    const user = new User(event.userId, event.name, event.email, 0, event.createdAt);
    user.applyEvent(event);
    return user;
  }
  
  updateName(name: string) {
    const event: UserUpdatedEvent = {
      type: 'UserUpdated',
      userId: this.id,
      name,
      updatedAt: new Date(),
    };
    
    this.applyEvent(event);
    this.uncommittedEvents.push(event);
  }
  
  private applyEvent(event: DomainEvent) {
    switch (event.type) {
      case 'UserCreated':
        this.id = event.userId;
        this.name = event.name;
        this.email = event.email;
        this.createdAt = event.createdAt;
        break;
      case 'UserUpdated':
        if (event.name) this.name = event.name;
        if (event.email) this.email = event.email;
        break;
    }
    this.version++;
  }
  
  getUncommittedEvents(): DomainEvent[] {
    return this.uncommittedEvents;
  }
  
  markEventsAsCommitted() {
    this.uncommittedEvents = [];
  }
  
  static fromHistory(events: DomainEvent[]): User {
    let user: User | null = null;
    for (const event of events) {
      if (event.type === 'UserCreated') {
        user = new User(event.userId, event.name, event.email, 0, event.createdAt);
      } else {
        user!.applyEvent(event);
      }
    }
    return user!;
  }
}

// Event Store
// src/infrastructure/eventStore.ts
export class EventStore {
  constructor(private db: PgPool) {}
  
  async appendEvents(streamId: string, events: DomainEvent[], expectedVersion: number) {
    await this.db.query('BEGIN');
    
    try {
      for (const event of events) {
        await this.db.query(`
          INSERT INTO events (stream_id, event_type, event_data, version, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [streamId, event.type, JSON.stringify(event), expectedVersion + 1, new Date()]);
        expectedVersion++;
      }
      
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }
  
  async getEvents(streamId: string): Promise<DomainEvent[]> {
    const rows = await this.db.query(`
      SELECT event_data FROM events
      WHERE stream_id = $1
      ORDER BY version
    `, [streamId]);
    
    return rows.map(row => JSON.parse(row.event_data));
  }
}
```

### Pros and Cons

**Pros:**
- Complete audit trail
- Temporal queries (state at any time)
- Event replay for debugging
- Event-driven architecture

**Cons:**
- Complex to implement
- Version conflicts and concurrency
- Large event store size
- Learning curve

---

## 🔄 SAGA PATTERN (DISTRIBUTED TRANSACTIONS)

### Pattern Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Service A  │      │  Service B  │      │  Service C  │
│   (Start)   │─────→│   (Step 1)  │─────→│   (Step 2)  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │ Failure           │ Failure            │ Failure
       ↓                    ↓                    ↓
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Compensate  │      │ Compensate  │      │ Compensate  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Implementation

```typescript
// Choreography-based Saga
// src/sagas/orderSaga.ts
export class OrderSaga {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private eventBus: EventBus
  ) {}
  
  async start(orderData: CreateOrderData) {
    try {
      // Step 1: Create order
      const order = await this.orderService.create(orderData);
      
      // Step 2: Process payment
      const payment = await this.paymentService.charge({
        orderId: order.id,
        amount: order.total,
        userId: order.userId,
      });
      
      // Step 3: Reserve inventory
      await this.inventoryService.reserve({
        orderId: order.id,
        items: order.items,
      });
      
      // Mark order as completed
      await this.orderService.markCompleted(order.id);
      
      return order;
      
    } catch (error) {
      // Compensating transactions
      await this.compensate(error, orderData);
      throw error;
    }
  }
  
  private async compensate(error: Error, orderData: CreateOrderData) {
    // Compensation actions based on where the saga failed
    if (error instanceof PaymentError) {
      // Cancel order
      await this.orderService.cancel(orderData.id);
    } else if (error instanceof InventoryError) {
      // Refund payment
      await this.paymentService.refund(orderData.paymentId);
      // Cancel order
      await this.orderService.cancel(orderData.id);
    }
  }
}

// Orchestration-based Saga (with state machine)
// src/sagas/orchestrator.ts
export class SagaOrchestrator {
  private sagaState: Map<string, SagaState> = new Map();
  
  async execute(sagaId: string, steps: SagaStep[]) {
    const state: SagaState = {
      id: sagaId,
      currentStep: 0,
      status: 'running',
      completedSteps: [],
      compensating: false,
    };
    
    this.sagaState.set(sagaId, state);
    
    try {
      for (let i = 0; i < steps.length; i++) {
        state.currentStep = i;
        const result = await steps[i].action();
        state.completedSteps.push({ index: i, result });
      }
      
      state.status = 'completed';
    } catch (error) {
      state.status = 'failed';
      state.compensating = true;
      
      // Compensate in reverse order
      for (let i = state.completedSteps.length - 1; i >= 0; i--) {
        const step = steps[state.completedSteps[i].index];
        await step.compensate(state.completedSteps[i].result);
      }
      
      state.compensating = false;
      throw error;
    }
  }
}

interface SagaStep {
  action: () => Promise<any>;
  compensate: (result: any) => Promise<void>;
}
```

### Pros and Cons

**Pros:**
- Distributed transactions without 2PC
- Failure handling with compensation
- Clear transaction boundaries
- Event-driven integration

**Cons:**
- Complex to implement
- Eventual consistency
- Compensation logic required
- Debugging challenges

---

## 🔌 CIRCUIT BREAKER PATTERN

### Implementation

```typescript
// src/resilience/circuitBreaker.ts
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: Date | null = null;
  private successCount = 0;
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private halfOpenAttempts: number = 3
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new CircuitOpenError('Circuit is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenAttempts) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
  
  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== null &&
      Date.now() - this.lastFailureTime.getTime() > this.timeout;
  }
}

// Usage
const circuitBreaker = new CircuitBreaker(5, 60000);

async function fetchUser(id: string) {
  return circuitBreaker.execute(async () => {
    return await userService.getById(id);
  });
}
```

---

## 🚦 BULKHEAD PATTERN

### Implementation

```typescript
// src/resilience/bulkhead.ts
export class Bulkhead {
  private queue: Array<() => void> = [];
  private activeCount = 0;
  
  constructor(
    private maxConcurrent: number,
    private maxQueueSize: number = 100
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCount--;
          this.processQueue();
        }
      };
      
      if (this.activeCount < this.maxConcurrent) {
        this.activeCount++;
        task();
      } else if (this.queue.length < this.maxQueueSize) {
        this.queue.push(task);
      } else {
        reject(new BulkheadFullError('Bulkhead queue is full'));
      }
    });
  }
  
  private processQueue() {
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const task = this.queue.shift()!;
      this.activeCount++;
      task();
    }
  }
}

// Usage
const bulkhead = new Bulkhead(10); // Max 10 concurrent requests

async function processOrder(order: Order) {
  return bulkhead.execute(async () => {
    return await orderService.process(order);
  });
}
```

---

## ⏱️ TIMEOUT AND RETRY STRATEGIES

### Implementation

```typescript
// src/resilience/retry.ts
export class RetryPolicy {
  constructor(
    private maxAttempts: number = 3,
    private initialDelay: number = 1000,
    private maxDelay: number = 10000,
    private backoffMultiplier: number = 2
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.initialDelay;
    
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxAttempts) {
          // Exponential backoff with jitter
          const jitter = Math.random() * 0.1 * delay;
          await this.sleep(delay + jitter);
          delay = Math.min(delay * this.backoffMultiplier, this.maxDelay);
        }
      }
    }
    
    throw lastError;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retryPolicy = new RetryPolicy(3, 1000, 10000, 2);

async function fetchWithRetry(url: string) {
  return retryPolicy.execute(async () => {
    return await fetch(url);
  });
}
```

---

## 🔑 IDEMPOTENCY KEYS

### Implementation

```typescript
// src/idempotency/idempotency.ts
export class IdempotencyService {
  constructor(private redis: Redis) {}
  
  async execute<T>(
    idempotencyKey: string,
    fn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Check if already processed
    const cached = await this.redis.get(`idempotency:${idempotencyKey}`);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Execute function
    const result = await fn();
    
    // Cache result
    await this.redis.setex(
      `idempotency:${idempotencyKey}`,
      ttl,
      JSON.stringify(result)
    );
    
    return result;
  }
  
  async isProcessed(idempotencyKey: string): Promise<boolean> {
    const cached = await this.redis.get(`idempotency:${idempotencyKey}`);
    return cached !== null;
  }
}

// Usage in API
app.post('/orders', async (req, res) => {
  const idempotencyKey = req.headers['x-idempotency-key'] as string;
  
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency key required' });
  }
  
  const order = await idempotencyService.execute(
    idempotencyKey,
    async () => {
      return await orderService.create(req.body);
    }
  );
  
  res.json(order);
});
```

---

## 📡 API VERSIONING STRATEGIES

### URL Versioning

```typescript
// Version 1
app.get('/api/v1/users', getUsersV1);
app.post('/api/v1/users', createUserV1);

// Version 2
app.get('/api/v2/users', getUsersV2);
app.post('/api/v2/users', createUserV2);

// Version middleware
app.use('/api/v1', requireAPIKeyV1);
app.use('/api/v2', requireAPIKeyV2);
```

### Header Versioning

```typescript
app.get('/api/users', (req, res) => {
  const version = req.headers['api-version'] || 'v1';
  
  switch (version) {
    case 'v1':
      return getUsersV1(req, res);
    case 'v2':
      return getUsersV2(req, res);
    default:
      return res.status(400).json({ error: 'Unsupported API version' });
  }
});
```

### Content Negotiation

```typescript
app.get('/api/users', (req, res) => {
  const accept = req.headers.accept;
  
  if (accept?.includes('application/vnd.myapi.v1+json')) {
    return getUsersV1(req, res);
  } else if (accept?.includes('application/vnd.myapi.v2+json')) {
    return getUsersV2(req, res);
  } else {
    return res.status(406).json({ error: 'Unsupported content type' });
  }
});
```

---

## 🔄 MICROSERVICES COMMUNICATION

### REST

```typescript
// HTTP REST
async function getUser(id: string) {
  const response = await fetch(`http://user-service/api/v1/users/${id}`);
  return response.json();
}
```

### gRPC

```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserResponse {
  User user = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

```typescript
// gRPC client
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).userservice;

const client = new userProto.UserService(
  'user-service:50051',
  grpc.credentials.createInsecure()
);

async function getUser(userId: string) {
  return new Promise((resolve, reject) => {
    client.GetUser({ user_id: userId }, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}
```

### Message Queues

```typescript
// RabbitMQ
import amqp from 'amqplib';

async function publishOrderCreated(order: Order) {
  const connection = await amqp.connect(process.env.AMQP_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue('order.created', { durable: true });
  channel.sendToQueue('order.created', Buffer.from(JSON.stringify(order)));
}

async function consumeOrderCreated() {
  const connection = await amqp.connect(process.env.AMQP_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue('order.created', { durable: true });
  channel.consume('order.created', (msg) => {
    const order = JSON.parse(msg.content.toString());
    processOrder(order);
    channel.ack(msg);
  });
}
```

---

## 🎯 CHECKLIST

Before implementing architecture patterns:

- [ ] Pattern justified by business requirements
- [ ] Team understanding and buy-in
- [ ] Infrastructure ready (event bus, message queue)
- [ ] Monitoring and observability in place
- [ ] Testing strategy defined
- [ ] Deployment pipeline supports complexity
- [ ] Documentation created
- [ ] Migration plan (if refactoring)

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-02  
**Status**: Production-Ready
