---
name: Observability Stack
description: Logging, metrics, tracing, and error monitoring patterns
version: 1.0.0
primary_agents: [swarm-ops, swarm-ops, swarm-ops]
---

# 📊 Observability Stack Skill

> **ACTIVATION:** You can't fix what you can't see. Instrument everything. Alert on what matters.

---

## 🎯 The Three Pillars

1. **Logs** — What happened and when
2. **Metrics** — Aggregated measurements over time
3. **Traces** — Request flow across services

---

## 📝 STRUCTURED LOGGING

### Logger Setup
```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    env: process.env.NODE_ENV,
    service: 'swarm-mode-app',
    version: process.env.npm_package_version,
  },
})

// Create child loggers for specific domains
export const authLogger = logger.child({ domain: 'auth' })
export const apiLogger = logger.child({ domain: 'api' })
export const dbLogger = logger.child({ domain: 'database' })
```

### Logging Patterns
```typescript
// ✅ Good: Structured with context
authLogger.info({
  event: 'user_login',
  userId: user.id,
  method: 'email',
  duration_ms: Date.now() - startTime,
})

// ❌ Bad: Unstructured string
console.log(`User ${user.id} logged in`)

// ✅ Error with stack trace
apiLogger.error({
  event: 'api_error',
  error: error.message,
  stack: error.stack,
  request: {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  },
})
```

### Request Logging Middleware
```typescript
// middleware/logging.ts
import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

export function withLogging(handler: Function) {
  return async (req: NextRequest) => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    
    try {
      const response = await handler(req)
      
      apiLogger.info({
        event: 'request_complete',
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        status: response.status,
        duration_ms: Date.now() - startTime,
      })
      
      return response
    } catch (error) {
      apiLogger.error({
        event: 'request_error',
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        error: error.message,
        duration_ms: Date.now() - startTime,
      })
      
      throw error
    }
  }
}
```

---

## 📈 METRICS

### Prometheus/OpenMetrics Pattern
```typescript
// lib/metrics.ts
import { Counter, Histogram, Registry } from 'prom-client'

const register = new Registry()

// HTTP request metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
})

// Business metrics
export const ordersCreated = new Counter({
  name: 'orders_created_total',
  help: 'Total orders created',
  labelNames: ['status'],
  registers: [register],
})

// Export metrics endpoint
export async function getMetrics() {
  return await register.metrics()
}
```

### Metrics Endpoint
```typescript
// app/api/metrics/route.ts
import { getMetrics } from '@/lib/metrics'

export async function GET() {
  const metrics = await getMetrics()
  
  return new Response(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    },
  })
}
```

---

## 🔍 DISTRIBUTED TRACING

### OpenTelemetry Setup
```typescript
// instrumentation.ts (Next.js 13+)
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
})

sdk.start()
```

### Manual Spans
```typescript
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('swarm-mode-app')

export async function createOrder(userId: string, items: OrderItem[]) {
  return tracer.startActiveSpan('createOrder', async (span) => {
    try {
      span.setAttributes({
        'user.id': userId,
        'order.item_count': items.length,
      })
      
      // Validate inventory
      await tracer.startActiveSpan('validateInventory', async (childSpan) => {
        await checkInventory(items)
        childSpan.end()
      })
      
      // Create order
      const order = await db.orders.create({ userId, items })
      
      span.setAttributes({
        'order.id': order.id,
        'order.total': order.total,
      })
      
      return order
    } catch (error) {
      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()
    }
  })
}
```

---

## 🚨 ERROR MONITORING

### Sentry Setup
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

### Error Boundaries
```typescript
// components/error-boundary.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    })
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
```

### User Context
```typescript
// After login, set user context
import * as Sentry from '@sentry/nextjs'

export function setUserContext(user: User) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    // Never include PII like name
  })
}

export function clearUserContext() {
  Sentry.setUser(null)
}
```

---

## 📊 UPTIME MONITORING

### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: 'up' | 'down'
    cache?: 'up' | 'down'
  }
  version: string
  timestamp: string
}

export async function GET() {
  const checks: HealthCheck['checks'] = {
    database: 'down',
  }
  
  // Check database
  try {
    const supabase = await createClient()
    await supabase.from('health_check').select('id').limit(1)
    checks.database = 'up'
  } catch {
    checks.database = 'down'
  }
  
  const allUp = Object.values(checks).every(v => v === 'up')
  
  const health: HealthCheck = {
    status: allUp ? 'healthy' : 'degraded',
    checks,
    version: process.env.npm_package_version || 'unknown',
    timestamp: new Date().toISOString(),
  }
  
  return Response.json(health, {
    status: allUp ? 200 : 503,
  })
}
```

---

## 🔔 ALERTING RULES

### Critical Alerts (Wake Someone Up)
```yaml
# prometheus/alerts.yml
groups:
  - name: critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
          
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
```

### Warning Alerts (Check in the Morning)
```yaml
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High P95 latency"
          description: "P95 latency is {{ $value | humanizeDuration }}"
          
      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 15m
        labels:
          severity: warning
```

---

## ✅ OBSERVABILITY CHECKLIST

- [ ] Structured JSON logging (not console.log)
- [ ] Request logging with duration and status
- [ ] Error tracking with Sentry or similar
- [ ] Health check endpoint
- [ ] Core business metrics defined
- [ ] Request latency histograms
- [ ] Alerting rules for error rate and latency
- [ ] User context in errors (without PII)
- [ ] Log levels properly configured per environment
- [ ] Distributed tracing for multi-service apps
