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

## Account Lockout

### Overview
Progressive account lockout protects individual accounts from targeted brute force attacks:
- **Separate from rate limiting**: Rate limiting protects by IP, lockout protects by account
- **Progressive penalties**: Lockout duration increases with repeated failures
- **Automatic unlock**: Accounts automatically unlock after lockout period
- **Attack prevention**: Prevents unlimited password guessing on specific accounts

### Implementation

**Lockout Thresholds:**
- 5 failed attempts → 15 minute lockout
- 8 failed attempts → 30 minute lockout
- 10 failed attempts → 1 hour lockout
- 15 failed attempts → 24 hour lockout

**Key Features:**
- Failed attempts tracked per email address (case-insensitive)
- Lockout persists across different IP addresses (prevents distributed attacks)
- Successful login clears all failed attempts
- Lockout data expires after 24 hours
- HTTP 423 (Locked) status code returned when locked

### Behavior

**Failed Login Flow:**
1. Check if account is currently locked
2. If locked, return 423 with remaining lockout time
3. If not locked, attempt authentication
4. On failure, increment failed attempt counter
5. If threshold reached, lock account and return 423
6. If below threshold, return 401 with attempts remaining

**Successful Login:**
- All failed attempts cleared for that account
- Account unlocked immediately
- User can login normally

### Testing Account Lockout

```bash
# Test progressive lockout - make 6 failed attempts
EMAIL="lockout-test@example.com"

for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"wrong\"}" \
    -w "\nStatus: %{http_code}\n\n" | jq
  sleep 1
done

# Attempts 1-4: Should return 401 with attemptsRemaining
# Attempt 5: Should return 401 (last attempt before lockout)
# Attempt 6: Should return 423 with lockout message
```

### Response Examples

**Failed attempt (below threshold):**
```json
{
  "error": "Invalid email or password",
  "attemptsRemaining": 3
}
HTTP 401 Unauthorized
```

**Account locked:**
```json
{
  "error": "Too many failed attempts. Account locked for 15 minutes.",
  "retryAfter": 900,
  "locked": true
}
HTTP 423 Locked
Retry-After: 900
```

### Monitoring

Account lockouts are logged to Axiom (if configured):

```json
{
  "level": "warn",
  "message": "Account locked after failed attempt",
  "email": "user@example.com",
  "attempts": 5,
  "lockedUntil": "2024-03-01T12:30:00.000Z"
}
```

### Security Notes

- **Account enumeration**: Returns same error for invalid email vs invalid password
- **Timing attacks**: Response time is consistent regardless of whether account exists
- **Distributed attacks**: Lockout persists across all IP addresses
- **Recovery**: Users can wait for automatic unlock or contact support
- **Customization**: Thresholds can be adjusted in `rate-limit.ts`

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
