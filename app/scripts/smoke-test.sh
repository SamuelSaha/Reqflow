#!/usr/bin/env bash
#
# Post-deploy smoke tests
# Verifies the production deployment is healthy after a new deploy.
# Used by CI/CD pipeline (.github/workflows/deploy.yml).
#
# Environment variables:
#   DEPLOY_URL       - The Vercel deployment URL (from deploy step output)
#   PRODUCTION_URL   - The canonical production URL (from GitHub secrets)

set -euo pipefail

# Use the deployment URL, fall back to production URL
BASE_URL="${DEPLOY_URL:-${PRODUCTION_URL:-}}"

if [ -z "$BASE_URL" ]; then
  echo "❌ Neither DEPLOY_URL nor PRODUCTION_URL is set"
  exit 1
fi

# Strip trailing slash
BASE_URL="${BASE_URL%/}"

PASSED=0
FAILED=0

check() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  echo -n "  Testing $name... "

  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" 2>/dev/null || echo "000")

  if [ "$HTTP_STATUS" = "$expected_status" ]; then
    echo "✓ ($HTTP_STATUS)"
    PASSED=$((PASSED + 1))
  else
    echo "✗ (expected $expected_status, got $HTTP_STATUS)"
    FAILED=$((FAILED + 1))
  fi
}

echo "🔍 Running smoke tests against: $BASE_URL"
echo ""

# 1. Homepage loads
check "Homepage" "$BASE_URL" "200"

# 2. Health endpoint returns 200
check "Health check" "$BASE_URL/api/health" "200"

# 3. Health ping (lightweight liveness)
check "Health ping" "$BASE_URL/api/health/ping" "200"

# 4. Auth endpoints exist (should return redirect or page, not 404)
check "Login page" "$BASE_URL/login" "200"

# 5. API returns 401 for unauthenticated tRPC calls (proves the API layer is running)
check "tRPC auth guard" "$BASE_URL/api/trpc/requests.list" "401"

echo ""
echo "────────────────────────────────"
echo "  Results: $PASSED passed, $FAILED failed"
echo "────────────────────────────────"

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "❌ Smoke tests failed — deployment may be unhealthy"
  exit 1
fi

echo ""
echo "✅ All smoke tests passed"
