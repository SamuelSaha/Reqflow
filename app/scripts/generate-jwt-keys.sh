#!/bin/bash

# Generate JWT RS256 Keys for Production
# Run this script to generate new RSA key pair for JWT signing
#
# Usage:
#   ./scripts/generate-jwt-keys.sh           # Print keys to console
#   ./scripts/generate-jwt-keys.sh --write   # Write to .env.local

set -e

WRITE_TO_ENV=false
if [ "$1" == "--write" ]; then
  WRITE_TO_ENV=true
fi

echo "🔐 Generating RSA key pair for JWT RS256..."
echo ""

# Create temp directory for key generation
TEMP_DIR=$(mktemp -d)
PRIVATE_KEY_FILE="$TEMP_DIR/jwt-private.pem"
PUBLIC_KEY_FILE="$TEMP_DIR/jwt-public.pem"

# Generate private key (2048 bits)
openssl genrsa -out "$PRIVATE_KEY_FILE" 2048 2>/dev/null

# Extract public key
openssl rsa -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE" 2>/dev/null

# Base64 encode for environment variables (single line)
PRIVATE_KEY_B64=$(cat "$PRIVATE_KEY_FILE" | base64 | tr -d '\n')
PUBLIC_KEY_B64=$(cat "$PUBLIC_KEY_FILE" | base64 | tr -d '\n')

# Clean up temp files
rm -rf "$TEMP_DIR"

if [ "$WRITE_TO_ENV" = true ]; then
  ENV_FILE=".env.local"
  
  if [ -f "$ENV_FILE" ]; then
    # Remove old JWT keys if they exist
    if grep -q "JWT_PRIVATE_KEY=" "$ENV_FILE"; then
      echo "📝 Updating existing JWT keys in $ENV_FILE..."
      # Create a temp file without the old keys
      grep -v "JWT_PRIVATE_KEY=" "$ENV_FILE" | grep -v "JWT_PUBLIC_KEY=" > "${ENV_FILE}.tmp" || true
      mv "${ENV_FILE}.tmp" "$ENV_FILE"
    else
      echo "📝 Adding JWT keys to $ENV_FILE..."
    fi
    
    # Append new keys
    echo "" >> "$ENV_FILE"
    echo "# JWT RS256 keys (generated $(date -u +"%Y-%m-%dT%H:%M:%SZ"))" >> "$ENV_FILE"
    echo "JWT_PRIVATE_KEY=$PRIVATE_KEY_B64" >> "$ENV_FILE"
    echo "JWT_PUBLIC_KEY=$PUBLIC_KEY_B64" >> "$ENV_FILE"
    
    echo "✅ Keys written to $ENV_FILE"
  else
    echo "❌ $ENV_FILE not found. Creating it..."
    echo "# JWT RS256 keys (generated $(date -u +"%Y-%m-%dT%H:%M:%SZ"))" > "$ENV_FILE"
    echo "JWT_PRIVATE_KEY=$PRIVATE_KEY_B64" >> "$ENV_FILE"
    echo "JWT_PUBLIC_KEY=$PUBLIC_KEY_B64" >> "$ENV_FILE"
    echo "✅ Keys written to new $ENV_FILE"
  fi
else
  echo "✅ Keys generated successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Add these to your .env.local (development) or secret manager (production):"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "JWT_PRIVATE_KEY=$PRIVATE_KEY_B64"
  echo ""
  echo "JWT_PUBLIC_KEY=$PUBLIC_KEY_B64"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo "⚠️  SECURITY WARNINGS:"
echo "   - NEVER commit JWT_PRIVATE_KEY to git"
echo "   - NEVER expose JWT_PRIVATE_KEY publicly"
echo "   - Store JWT_PRIVATE_KEY in vault (AWS Secrets Manager, etc.)"
echo "   - Rotate keys every 90 days"
echo ""
echo "💡 TIP: Run with --write flag to automatically add to .env.local"
echo "   bash scripts/generate-jwt-keys.sh --write"
echo ""
