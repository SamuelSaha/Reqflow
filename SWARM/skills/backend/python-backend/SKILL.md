---
name: Python Backend
description: Production-grade Python backend with FastAPI, Django, SQLAlchemy, Pydantic, Celery, and pytest
version: 1.0.0
primary_agents: ["@swarm-dev", "@swarm-arch", "@swarm-ops"]
---

# 🐍 Python Backend Skill

> **ACTIVATION:** "Apply python-backend skill for production-grade Python backend development"

---

## 🎯 Purpose

Ruthlessly effective Python backend patterns for achieving async performance, type safety, and reliable background job processing.

---

## 🚀 Framework Selection

### Decision Matrix

| Requirement | FastAPI | Django | Flask |
|-------------|----------|---------|--------|
| **API Performance** | ✅ Async by default | ❌ Sync (can be async) | ⚠️ Manual async |
| **Type Safety** | ✅ Pydantic built-in | ⚠️ Django types (mypy-stub) | ❌ Manual |
| **Auto-Documentation** | ✅ OpenAPI auto-gen | ✅ DRF available | ❌ Manual |
| **Admin Interface** | ❌ Build manually | ✅ Built-in | ❌ Build manually |
| **Rapid Prototyping** | ⚠️ Moderate | ✅ Batteries included | ✅ Lightweight |
| **Enterprise Features** | ⚠️ Community plugins | ✅ Built-in ORM/Auth | ❌ Manual |

### Recommendation

**Use FastAPI when:**
- APIs only (no HTML rendering)
- Performance is critical
- Type safety required
- Microservices architecture

**Use Django when:**
- Full-stack application (admin + templates)
- Rapid prototyping
- Enterprise features (ORM, Auth, Admin) built-in

---

## 1. FastAPI Patterns

### Dependency Injection

```python
# app/dependencies.py
from fastapi import Depends, Annotated
from typing import Annotated

# ✅ GOOD: Type-safe dependency injection
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    user = await validate_token(token)
    if not user:
        raise HTTPException(401, "Invalid token")
    return user

@app.get("/users/me")
async def get_me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user
```

### Async Database Access

```python
# ❌ BAD: Blocking database calls
@app.get("/orders")
async def get_orders():
    orders = db.execute("SELECT * FROM orders")  # Blocks
    return orders

# ✅ GOOD: Async database access
from sqlalchemy.ext.asyncio import AsyncSession

@app.get("/orders")
async def get_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    return orders
```

### Middleware Pattern

```python
# app/middleware.py
from fastapi import Request
import time
import logging

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    formatted_time = "{0:.2f}".format(process_time)
    
    logger.info(
        f"method={request.method} path={request.url_path} "
        f"status={response.status_code} duration={formatted_time}ms"
    )
    
    response.headers["X-Process-Time"] = formatted_time
    return response
```

---

## 2. Django Patterns

### Django REST Framework

```python
# ✅ GOOD: DRF serializers with validation
from rest_framework import serializers

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'userId', 'total', 'createdAt']
        read_only_fields = ['id', 'createdAt']
    
    def validate_total(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total must be positive")
        return value

# views.py
from rest_framework import viewsets

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']
```

### Django ORM Query Optimization

```python
# ❌ BAD: N+1 queries (hits database per row)
orders = Order.objects.all()
for order in orders:
    user = order.user  # Query per order!

# ✅ GOOD: Prefetch related data
from django.db.models import Prefetch

orders = Order.objects.prefetch_related(
    Prefetch('user', queryset=User.objects.only('id', 'name', 'email'))
).all()
```

---

## 3. SQLAlchemy 2.0 Patterns

### Async Engine Configuration

```python
# db/engine.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# ✅ GOOD: Async engine with pool pre-ping
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@localhost/db",
    pool_pre_ping=True,  # Detect stale connections
    pool_size=20,  # Match PgBouncer pool
    max_overflow=10,  # Allow 10 extra during spikes
    pool_recycle=3600,  # Recycle after 1 hour
    echo=False  # Don't log SQL in production
)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)
```

### Declarative Models

```python
# ✅ GOOD: Type-safe models with relationships
from sqlalchemy import String, DateTime, Numeric, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Order(Base):
    __tablename__ = 'orders'
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    userId: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    total: Mapped[Numeric] = mapped_column(Numeric(10,2), nullable=False)
    createdAt: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="orders")
```

---

## 4. Pydantic v2 Patterns

### Validation with Constraints

```python
# ✅ GOOD: Email validation
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal

class CreateUserRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100)
    role: Literal['user', 'admin', 'moderator'] = Field(default='user')
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('email')
    @classmethod
    def email_must_be_lowercase(cls, v: str) -> str:
        if v != v.lower():
            raise ValueError('Email must be lowercase')
        return v
```

### Serialization with Computed Fields

```python
# ✅ GOOD: Computed fields with schema
from pydantic import BaseModel, Field, computed_field

class OrderResponse(BaseModel):
    id: UUID
    userId: UUID
    total: float
    status: str
    
    @computed_field
    @property
    def total_with_tax(self) -> float:
        return self.total * 1.1  # 10% tax
    
    model_config = ConfigDict(
        json_schema_extra={
            'total_with_tax': {
                'description': 'Total including 10% tax',
                'type': 'number'
            }
        }
    )
```

---

## 5. Celery Background Tasks

### Task Definition

```python
# tasks/emails.py
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task(bind=True, max_retries=3)
def send_welcome_email(self, user_id: UUID, email: str):
    try:
        user = User.objects.get(id=user_id)
        send_email(
            to=email,
            subject="Welcome!",
            body=f"Hello {user.name}"
        )
        return {'status': 'sent', 'user_id': str(user_id)}
    
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
```

---

## 6. Testing Patterns

### Async Test Configuration

```python
# conftest.py
import pytest
import asyncio
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
```

---

## 7. Performance Targets

| Metric | Good | Needs Work | Poor |
|---------|-------|-----------|-------|
| API Response Time (P50) | < 100ms | 100-300ms | > 300ms |
| API Response Time (P99) | < 500ms | 500ms-2s | > 2s |
| Database Query Time (P50) | < 10ms | 10-50ms | > 50ms |
| Celery Task Latency | < 5s | 5-30s | > 30s |
| Memory Per Worker | < 200MB | 200-500MB | > 500MB |

---

## 8. Anti-Patterns

### ❌ DON'T

1. Blocking in FastAPI - Use async/await for I/O
2. N+1 Django Queries - Always prefetch related data
3. Ignoring Type Errors - Mypy strict mode catches bugs
4. Celery Without Retries - Transient errors cause failures
5. Using `any` in Type Hints - Loses type safety
6. Sync Database in Async Context - Blocks event loop
7. Missing indexes - Check `pg_stat_user_indexes`

### ✅ DO

1. Always use async/await - In FastAPI for I/O operations
2. Always use select_related/prefetch - In Django to prevent N+1
3. Run mypy in CI - Catch type errors before deployment
4. Add Celery retries - Handle transient failures
5. Use AsyncSession with SQLAlchemy 2.0
6. Add health checks - `/health` endpoint for load balancers

---

**Skill Version:** 1.0.0
**Last Updated:** 2026-02-02
