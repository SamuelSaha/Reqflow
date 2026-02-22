---
name: Testing Patterns
description: Comprehensive testing strategies for unit, integration, and contract testing
version: 1.0.0
primary_agents: [swarm-qa, swarm-dev]
---

# 🧪 Testing Patterns Skill

> **ACTIVATION:** Tests are safety nets. The more critical the code, the tighter the net.

---

## 🎯 Core Principles

1. **Test Behavior, Not Implementation** — Test what, not how
2. **Arrange-Act-Assert** — Clear test structure
3. **One Concept Per Test** — Single responsibility
4. **Fast, Isolated, Repeatable** — F.I.R.S.T principles
5. **Coverage is a Metric, Not a Goal** — Meaningful tests > high coverage

---

## 🧬 Test Pyramid

```
    /
   /  \     E2E Tests (Critical paths only)
  /____\    ~5% of tests, slow, expensive
 /      \
/________\  Integration Tests (APIs, DB)
            ~15% of tests, medium speed
/__________/
/          /\   Unit Tests (Functions, logic)
/          /  \  ~80% of tests, fast, cheap
/________/____\
```

### Test Distribution

| Type | Count | Speed | When to Write |
|------|-------|-------|---------------|
| **Unit** | 80% | <10ms | Every function with logic |
| **Integration** | 15% | <100ms | API endpoints, DB queries |
| **E2E** | 5% | <5s | Critical user flows only |

---

## 🔬 Unit Testing

### Test Structure (AAA)

```typescript
// ✅ Arrange - Act - Assert
describe('calculateDiscount', () => {
  test('applies 20% discount for premium users', () => {
    // Arrange
    const user = { tier: 'premium' }
    const order = { total: 100 }
    
    // Act
    const result = calculateDiscount(order, user)
    
    // Assert
    expect(result).toBe(20) // $20 discount
  })
  
  test('applies 10% discount for standard users', () => {
    // Arrange
    const user = { tier: 'standard' }
    const order = { total: 100 }
    
    // Act
    const result = calculateDiscount(order, user)
    
    // Assert
    expect(result).toBe(10)
  })
  
  test('returns 0 for orders under minimum threshold', () => {
    // Arrange
    const user = { tier: 'premium' }
    const order = { total: 10 } // Below $50 minimum
    
    // Act
    const result = calculateDiscount(order, user)
    
    // Assert
    expect(result).toBe(0)
  })
})
```

### Testing Async Code

```typescript
// ✅ Testing async functions
describe('fetchUser', () => {
  test('returns user data on success', async () => {
    // Arrange
    const userId = '123'
    
    // Act
    const user = await fetchUser(userId)
    
    // Assert
    expect(user).toEqual({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    })
  })
  
  test('throws error when user not found', async () => {
    // Arrange
    const userId = 'nonexistent'
    
    // Act & Assert
    await expect(fetchUser(userId))
      .rejects
      .toThrow('User not found')
  })
  
  test('handles network errors gracefully', async () => {
    // Arrange - Mock network failure
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res.networkError('Failed to connect')
      })
    )
    
    // Act & Assert
    await expect(fetchUser('123'))
      .rejects
      .toThrow('Network error')
  })
})
```

### Mocking Best Practices

```typescript
// ✅ Mock external dependencies
// Don't test the database, test your logic

describe('createOrder', () => {
  // Mock the database
  const mockDb = {
    orders: {
      create: jest.fn(),
      findById: jest.fn(),
    },
    inventory: {
      checkStock: jest.fn(),
      reserve: jest.fn(),
    },
  }
  
  test('creates order when stock available', async () => {
    // Arrange
    mockDb.inventory.checkStock.mockResolvedValue(10)
    mockDb.orders.create.mockResolvedValue({ id: 'order-123' })
    
    const orderData = {
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 2 }],
    }
    
    // Act
    const result = await createOrder(orderData, mockDb)
    
    // Assert
    expect(mockDb.inventory.checkStock).toHaveBeenCalledWith('prod-1')
    expect(mockDb.inventory.reserve).toHaveBeenCalledWith('prod-1', 2)
    expect(mockDb.orders.create).toHaveBeenCalledWith(orderData)
    expect(result.id).toBe('order-123')
  })
  
  test('throws error when insufficient stock', async () => {
    // Arrange
    mockDb.inventory.checkStock.mockResolvedValue(1) // Only 1 available
    
    const orderData = {
      userId: 'user-123',
      items: [{ productId: 'prod-1', quantity: 2 }],
    }
    
    // Act & Assert
    await expect(createOrder(orderData, mockDb))
      .rejects
      .toThrow('Insufficient stock')
    
    expect(mockDb.orders.create).not.toHaveBeenCalled()
  })
})
```

---

## 🔌 Integration Testing

### API Testing

```typescript
// ✅ Test API endpoints with real HTTP
describe('POST /api/orders', () => {
  test('creates order successfully', async () => {
    // Arrange
    const orderData = {
      items: [{ productId: '1', quantity: 2 }],
      shippingAddress: { city: 'NYC', zip: '10001' },
    }
    
    // Act
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData)
    
    // Assert
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      id: expect.any(String),
      status: 'created',
      total: expect.any(Number),
    })
    
    // Verify side effects
    const orderInDb = await db.orders.findById(response.body.id)
    expect(orderInDb).toBeTruthy()
  })
  
  test('returns 400 for invalid data', async () => {
    // Arrange - Missing required fields
    const invalidData = { items: [] }
    
    // Act
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidData)
    
    // Assert
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })
  
  test('returns 401 without authentication', async () => {
    // Act
    const response = await request(app)
      .post('/api/orders')
      .send({ items: [] })
    
    // Assert
    expect(response.status).toBe(401)
  })
})
```

### Database Testing

```typescript
// ✅ Test database queries
describe('OrderRepository', () => {
  // Setup test database
  beforeAll(async () => {
    await setupTestDatabase()
  })
  
  afterAll(async () => {
    await teardownTestDatabase()
  })
  
  beforeEach(async () => {
    await cleanDatabase() // Clean state between tests
  })
  
  test('finds orders by user', async () => {
    // Arrange - Seed data
    const userId = 'user-123'
    await db.orders.create([
      { userId, total: 100 },
      { userId, total: 200 },
      { userId: 'other', total: 300 },
    ])
    
    // Act
    const orders = await OrderRepository.findByUser(userId)
    
    // Assert
    expect(orders).toHaveLength(2)
    expect(orders.map(o => o.total)).toEqual([100, 200])
  })
  
  test('handles pagination', async () => {
    // Arrange - Create 25 orders
    const userId = 'user-123'
    await db.orders.create(
      Array(25).fill(null).map((_, i) => ({
        userId,
        total: i * 10,
      }))
    )
    
    // Act
    const page1 = await OrderRepository.findByUser(userId, { page: 1, limit: 10 })
    const page2 = await OrderRepository.findByUser(userId, { page: 2, limit: 10 })
    
    // Assert
    expect(page1).toHaveLength(10)
    expect(page2).toHaveLength(10)
    expect(page1[0].total).not.toBe(page2[0].total) // Different data
  })
})
```

---

## 📊 Test Coverage

### Coverage Strategy

```typescript
// ✅ Meaningful coverage metrics
const coverageGoals = {
  statements: 80,    // Lines of code executed
  branches: 70,      // if/else branches tested
  functions: 90,     // Functions called
  lines: 80,         // Total lines covered
}

// What to exclude
const coverageExcludes = [
  '**/node_modules/**',
  '**/*.config.*',
  '**/types/**',
  '**/mocks/**',
  '**/test/**',
  '**/*.test.ts',
  '**/*.spec.ts',
]

// Critical paths that MUST have 100% coverage
const criticalPaths = [
  'src/auth/**',
  'src/payments/**',
  'src/security/**',
]
```

### Coverage Reports

```typescript
// Generate coverage report
// npm run test:coverage

// Coverage output
// ------------------|---------|----------|---------|---------|-------------------
// File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
// ------------------|---------|----------|---------|---------|-------------------
// All files         |   82.5  |   68.2   |   91.3  |   81.9  |
//  auth             |   95.2  |   88.1   |   97.8  |   94.6  |
//  payments         |   78.3  |   62.5   |   85.2  |   77.1  | 45-67,89
//  orders           |   91.7  |   75.0   |   95.0  |   90.5  |
// ------------------|---------|----------|---------|---------|-------------------
```

---

## 🎯 Testing Checklist

### Before Writing Tests
- [ ] Understand the behavior being tested
- [ ] Identify edge cases and boundary conditions
- [ ] Determine what to mock vs integrate
- [ ] Plan test data setup and teardown

### Test Quality
- [ ] Tests are independent (no shared state)
- [ ] Tests are deterministic (same input = same output)
- [ ] Tests are fast (<100ms for unit, <1s for integration)
- [ ] Tests are readable (clear arrange/act/assert)
- [ ] Tests focus on one concept each

### Coverage
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Boundary conditions tested
- [ ] Edge cases identified and tested
- [ ] Critical paths have 100% coverage

---

## 🔒 Skill Version

```
Skill: Testing Patterns
Version: 1.0.0
Last Updated: 2026-02-02
Focus: Unit, Integration, Coverage
```
