---
name: E2E Testing
description: End-to-end testing with Playwright for critical user flows
version: 1.0.0
primary_agents: [swarm-qa]
---

# 🎭 E2E Testing Skill

> **ACTIVATION:** Unit tests verify code. E2E tests verify value. If it matters to users, cover it with E2E.

---

## 🎯 Core Principles

1. **Test Like a User** — Click, type, navigate as real users do
2. **Flakiness is a Bug** — Reliable tests > comprehensive tests  
3. **Test Critical Paths** — Happy path first, edge cases second
4. **Data Independence** — Tests create and clean up their own data
5. **Fast Feedback** — Parallelize, optimize, fail fast

---

## 🏗️ Test Architecture

### Page Object Model (POM)

```typescript
// Encapsulate page interactions
export class LoginPage {
  constructor(private page: Page) {}
  
  private emailInput = '[data-testid=email-input]'
  private passwordInput = '[data-testid=password-input]'
  private submitButton = '[data-testid=login-button]'
  
  async goto() {
    await this.page.goto('/login')
  }
  
  async login(email: string, password: string) {
    await this.page.fill(this.emailInput, email)
    await this.page.fill(this.passwordInput, password)
    await this.page.click(this.submitButton)
  }
}
```

### Test Data Factories

```typescript
export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: 'TestPassword123!',
      ...overrides,
    }
  }
}
```

---

## 🎭 Critical User Flows

### Authentication

```typescript
test.describe('Authentication', () => {
  test('successful login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('valid@example.com', 'correctPassword')
    await expect(page).toHaveURL('/dashboard')
  })
  
  test('invalid credentials show error', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('valid@example.com', 'wrongPassword')
    await expect(page.locator('[data-testid=error-message]'))
      .toHaveText('Invalid email or password')
  })
})
```

---

## 🔍 Best Practices

### Resilient Selectors

```typescript
// Priority order for selectors:
// 1. data-testid attributes (most stable)
// 2. ARIA roles (accessible)
// 3. Form labels (semantic)
// 4. Placeholder text (fallback)
// 5. Visible text (last resort)

// Examples
[data-testid=submit-button]  // Best
[role=button][name=Submit]   // Good  
label=Email Address          // OK
```

### Test Isolation

```typescript
test('user can create project', async ({ page }) => {
  // Setup: Create unique test user
  const user = UserFactory.create()
  await api.createUser(user)
  
  // Test
  await login(page, user)
  await createProject(page, 'Test Project')
  
  // Teardown
  await api.deleteUser(user.id)
})
```

---

## 🌍 Cross-Browser Testing

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

---

## ✅ Checklist

- [ ] Page Object Model for common flows
- [ ] data-testid attributes on key elements
- [ ] Parallel execution enabled
- [ ] Visual regression tests
- [ ] CI/CD integration
- [ ] Test data factories
- [ ] Environment configuration
