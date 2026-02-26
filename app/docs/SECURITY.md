# Security Features

## Rate Limiting

### Overview
Authentication endpoints are protected with rate limiting to prevent:
- **Brute force attacks**: Unlimited password guessing attempts
- **Credential stuffing**: Testing leaked credentials
- **Account enumeration**: Discovering valid email addresses via timing attacks
- **DoS attacks**: Resource exhaustion through excessive requests

### Implementation

Rate limiting is implemented using [@upstash/ratelimit](https://github.com/upstash/ratelimit) with Upstash Redis REST API.

**Protected Endpoints:**
- `POST /api/auth/login` - 5 attempts per 15 minutes per email+IP
- `POST /api/auth/signup` - 3 signups per hour per IP

**Algorithm:** Sliding window (more accurate than fixed window)

### Setup

#### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a free account (generous free tier)
3. Create a new Redis database
4. Copy the REST API credentials

#### 2. Configure Environment Variables

Add to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### 3. Graceful Degradation

Rate limiting is **optional** but **strongly recommended** for production.

- **If configured**: Full rate limiting protection
- **If not configured**: Warning logged, all requests allowed

### Testing Rate Limits

#### Test Login Rate Limit

```bash
# Make 6 login attempts with the same email
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done

# 6th attempt should return 429 Too Many Requests
```

#### Test Signup Rate Limit

```bash
# Make 4 signup attempts from the same IP
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"Test123!@#abc\",\"name\":\"Test User\"}" \
    -w "\nStatus: %{http_code}\n\n"
done

# 4th attempt should return 429 Too Many Requests
```

### Rate Limit Headers

When rate limited, responses include:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 900
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1709251200000
```

### Monitoring

Rate limit violations are logged to Axiom (if configured):

```json
{
  "level": "warn",
  "message": "Login rate limit exceeded",
  "email": "user@example.com",
  "remaining": 0,
  "reset": "2024-03-01T00:00:00.000Z"
}
```

### Customization

Edit `/src/lib/security/rate-limit.ts` to adjust limits:

```typescript
// Login: 5 attempts per 15 minutes
limiter: Ratelimit.slidingWindow(5, "15 m")

// Signup: 3 attempts per hour
limiter: Ratelimit.slidingWindow(3, "1 h")
```

### IP Address Detection

The system detects client IPs from these headers (in order):
1. `CF-Connecting-IP` (Cloudflare)
2. `X-Real-IP` (nginx)
3. `X-Forwarded-For` (standard proxy)

Ensure your reverse proxy/CDN is configured to pass these headers.

## Password Policy

See issue #42 for password requirements:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Compliant with NIST SP 800-63B and OWASP ASVS guidelines.

## Future Enhancements

- [ ] Account lockout after repeated failures
- [ ] Email alerts for suspicious activity
- [ ] CAPTCHA integration for high-risk scenarios
- [ ] Anomaly detection (impossible travel, device fingerprinting)
- [ ] Two-factor authentication (TOTP)
