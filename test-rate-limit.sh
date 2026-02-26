#!/bin/bash

# Test script for authentication rate limiting
# Tests both login and signup rate limits

echo "========================================="
echo "Testing Authentication Rate Limiting"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test login rate limiting
echo "📝 Testing Login Rate Limit (5 attempts per 15 minutes)..."
echo ""

for i in {1..6}; do
  echo -n "Attempt $i: "

  response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"WrongPassword123!"}' 2>/dev/null)

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "429" ]; then
    echo -e "${RED}RATE LIMITED ✓${NC} (HTTP $http_code)"
    echo "   Response: $(echo $body | jq -r '.error' 2>/dev/null || echo $body)"
    retry_after=$(echo $body | jq -r '.retryAfter' 2>/dev/null)
    if [ "$retry_after" != "null" ]; then
      echo "   Retry after: ${retry_after}s"
    fi
  elif [ "$http_code" = "401" ]; then
    echo -e "${GREEN}ALLOWED${NC} (HTTP $http_code - Invalid credentials)"
  else
    echo -e "${YELLOW}UNEXPECTED${NC} (HTTP $http_code)"
    echo "   Response: $body"
  fi

  sleep 0.5
done

echo ""
echo "========================================="
echo ""

# Test signup rate limiting
echo "📝 Testing Signup Rate Limit (3 attempts per hour)..."
echo ""

for i in {1..4}; do
  echo -n "Attempt $i: "

  response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\",\"password\":\"TestPassword123!\",\"name\":\"Test User $i\"}" 2>/dev/null)

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "429" ]; then
    echo -e "${RED}RATE LIMITED ✓${NC} (HTTP $http_code)"
    echo "   Response: $(echo $body | jq -r '.error' 2>/dev/null || echo $body)"
    retry_after=$(echo $body | jq -r '.retryAfter' 2>/dev/null)
    if [ "$retry_after" != "null" ]; then
      echo "   Retry after: ${retry_after}s"
    fi
  elif [ "$http_code" = "409" ]; then
    echo -e "${GREEN}ALLOWED${NC} (HTTP $http_code - User exists)"
  elif [ "$http_code" = "200" ]; then
    echo -e "${GREEN}ALLOWED${NC} (HTTP $http_code - Created)"
  else
    echo -e "${YELLOW}UNEXPECTED${NC} (HTTP $http_code)"
    echo "   Response: $body"
  fi

  sleep 0.5
done

echo ""
echo "========================================="
echo -e "${GREEN}Rate Limiting Test Complete!${NC}"
echo "========================================="
echo ""
echo "Expected behavior:"
echo "  • Login: Attempts 1-5 allowed (401), attempt 6 rate limited (429)"
echo "  • Signup: Attempts 1-3 allowed (200/409), attempt 4 rate limited (429)"
echo ""
