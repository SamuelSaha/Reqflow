/**
 * Security Module Index
 * Central export for all security utilities
 */

// CSRF Protection
export {
  generateCSRFToken,
  validateCSRFToken,
  getCSRFTokenFromRequest,
  withCSRF,
} from "./csrf";

// Rate Limiting
export {
  checkAuthRateLimit,
  checkApiRateLimit,
  checkMutationRateLimit,
  checkEmailVerificationRateLimit,
  checkInviteTokenRateLimit,
  checkSignupRateLimit,
} from "./rate-limit";

// Input Sanitization
export {
  sanitizeString,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeCurrency,
  sanitizeUrl,
  sanitizeJSON,
  sanitizeObject,
} from "./sanitize";

// OAuth State
export {
  generateOAuthState,
  validateOAuthState,
  validateOAuthStateAndExtractContext,
} from "./oauth-state";

// Row-Level Security
export {
  setRLSContext,
  clearRLSContext,
  getRLSContext,
  withRLSContext,
  createRLSMiddleware,
  type RLSContext,
} from "./rls-context";

// Field Encryption
export {
  FieldEncryption,
  encryptField,
  decryptField,
  isFieldEncrypted,
  compareEncryptedField,
  asEncrypted,
  fromEncrypted,
  type EncryptedField,
} from "./field-encryption";

// ABAC (Attribute-Based Access Control)
export {
  ABACEngine,
  getABACEngine,
  checkABAC,
  createABACSubject,
  createABACEnvironment,
  defaultABACPolicies,
  DataSensitivity,
  ClearanceLevel,
  type ABACAction,
  type ABACEffect,
  type ABACResource,
  type ABACEnvironment,
  type ABACRequest,
  type ABACSubject,
  type ABACPolicy,
  type ABACDecision,
} from "./abac";

// Data Masking
export {
  maskEmail,
  maskPhone,
  maskName,
  maskApiKey,
  maskCardNumber,
  maskAmount,
  maskUrl,
  maskConnectionString,
  mask,
  filterResponse,
  sanitizeForLogging,
  defaultMaskingConfig,
  reqflowFieldFilters,
  type MaskingLevel,
  type MaskingConfig,
  type FieldFilterRules,
} from "./data-masking";

// Security Monitoring
export {
  SecurityMonitor,
  getSecurityMonitor,
  recordSecurityEvent,
  isIpBlacklisted,
  getIpRiskLevel,
  securityThresholds,
  type SecurityEventType,
  type Severity,
  type SecurityEvent,
  type SecurityEventDetails,
  type SecurityAlert,
  type AnomalyScore,
} from "./security-monitor";
