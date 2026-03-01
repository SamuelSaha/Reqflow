/**
 * Field-Level Encryption Utility
 *
 * Provides AES-256-GCM encryption for sensitive data at rest.
 * Used for OAuth tokens, API keys, and other sensitive PII.
 *
 * Security properties:
 * - AES-256-GCM: Authenticated encryption with associated data (AEAD)
 * - Random IV per encryption: Prevents deterministic ciphertext
 * - Key derivation with scrypt: Protects against brute force
 * - Constant-time comparison: Prevents timing attacks
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 32;

/**
 * FieldEncryption class for encrypting/decrypting sensitive data
 */
export class FieldEncryption {
  private static instance: FieldEncryption;
  private encryptionKey: Buffer;

  private constructor() {
    const secretKey = env.FIELD_ENCRYPTION_KEY;

    if (!secretKey) {
      // In development, generate a temporary key (NOT for production!)
      if (env.NODE_ENV === "development") {
        console.warn(
          "WARNING: FIELD_ENCRYPTION_KEY not set. Using temporary key. " +
          "Set FIELD_ENCRYPTION_KEY for production!"
        );
        this.encryptionKey = randomBytes(KEY_LENGTH);
        return;
      }

      throw new Error(
        "FIELD_ENCRYPTION_KEY environment variable is required in production"
      );
    }

    // Derive a 256-bit key from the secret using scrypt
    // The salt is derived from the key itself for deterministic key derivation
    const salt = scryptSync(secretKey, "reqflow-field-encryption-salt", SALT_LENGTH);
    this.encryptionKey = scryptSync(secretKey, salt, KEY_LENGTH);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FieldEncryption {
    if (!FieldEncryption.instance) {
      FieldEncryption.instance = new FieldEncryption();
    }
    return FieldEncryption.instance;
  }

  /**
   * Encrypt a plaintext string
   *
   * @param plaintext - The data to encrypt
   * @returns Encrypted data in format: iv:authTag:ciphertext (base64)
   */
  public encrypt(plaintext: string): string {
    if (!plaintext) {
      return "";
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext (all base64)
    return [
      iv.toString("base64"),
      authTag.toString("base64"),
      encrypted.toString("base64"),
    ].join(":");
  }

  /**
   * Decrypt an encrypted string
   *
   * @param encryptedData - The encrypted data in format: iv:authTag:ciphertext
   * @returns Decrypted plaintext
   * @throws Error if decryption fails (invalid data, tampering, wrong key)
   */
  public decrypt(encryptedData: string): string {
    if (!encryptedData) {
      return "";
    }

    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const [ivBase64, authTagBase64, ciphertextBase64] = parts;

    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");
    const ciphertext = Buffer.from(ciphertextBase64, "base64");

    if (iv.length !== IV_LENGTH) {
      throw new Error("Invalid IV length");
    }

    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error("Invalid auth tag length");
    }

    const decipher = createDecipheriv(ALGORITHM, this.encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    } catch (error) {
      throw new Error("Decryption failed: data may be tampered or key is wrong");
    }
  }

  /**
   * Verify if a value is encrypted (basic format check)
   *
   * @param value - The value to check
   * @returns true if the value appears to be encrypted
   */
  public isEncrypted(value: string): boolean {
    if (!value) {
      return false;
    }

    const parts = value.split(":");
    if (parts.length !== 3) {
      return false;
    }

    try {
      const iv = Buffer.from(parts[0], "base64");
      const authTag = Buffer.from(parts[1], "base64");
      const ciphertext = Buffer.from(parts[2], "base64");

      return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH && ciphertext.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Compare a plaintext value with an encrypted value
   * Uses constant-time comparison to prevent timing attacks
   *
   * @param plaintext - The plaintext to compare
   * @param encryptedValue - The encrypted value to compare against
   * @returns true if they match
   */
  public compare(plaintext: string, encryptedValue: string): boolean {
    try {
      const decrypted = this.decrypt(encryptedValue);

      // Constant-time comparison
      const plaintextBuffer = Buffer.from(plaintext, "utf8");
      const decryptedBuffer = Buffer.from(decrypted, "utf8");

      if (plaintextBuffer.length !== decryptedBuffer.length) {
        return false;
      }

      return timingSafeEqual(plaintextBuffer, decryptedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Rotate encryption: decrypt with old key and re-encrypt with new key
   * Used during key rotation
   *
   * @param encryptedValue - Value encrypted with old key
   * @param oldKey - Previous encryption key
   * @returns Value encrypted with current key
   */
  public rotateKey(encryptedValue: string, oldKey: string): string {
    // Create temporary instance with old key
    const originalKey = this.encryptionKey;

    try {
      // Derive old key
      const salt = scryptSync(oldKey, "reqflow-field-encryption-salt", SALT_LENGTH);
      this.encryptionKey = scryptSync(oldKey, salt, KEY_LENGTH);

      // Decrypt with old key
      const plaintext = this.decrypt(encryptedValue);

      // Restore current key
      this.encryptionKey = originalKey;

      // Re-encrypt with current key
      return this.encrypt(plaintext);
    } finally {
      // Ensure original key is restored
      this.encryptionKey = originalKey;
    }
  }
}

// Convenience functions for common operations
let encryptionInstance: FieldEncryption | null = null;

function getEncryption(): FieldEncryption {
  if (!encryptionInstance) {
    encryptionInstance = FieldEncryption.getInstance();
  }
  return encryptionInstance;
}

/**
 * Encrypt a field value
 */
export function encryptField(plaintext: string): string {
  return getEncryption().encrypt(plaintext);
}

/**
 * Decrypt a field value
 */
export function decryptField(encryptedValue: string): string {
  return getEncryption().decrypt(encryptedValue);
}

/**
 * Check if a value is encrypted
 */
export function isFieldEncrypted(value: string): boolean {
  return getEncryption().isEncrypted(value);
}

/**
 * Compare plaintext with encrypted value
 */
export function compareEncryptedField(plaintext: string, encryptedValue: string): boolean {
  return getEncryption().compare(plaintext, encryptedValue);
}

/**
 * Type for encrypted fields - helps with type safety
 */
export type EncryptedField = string & { readonly __encrypted: unique symbol };

/**
 * Mark a field as encrypted (type-level only, no runtime effect)
 */
export function asEncrypted(value: string): EncryptedField {
  return value as EncryptedField;
}

/**
 * Decrypt an encrypted field type
 */
export function fromEncrypted(encrypted: EncryptedField): string {
  return decryptField(encrypted);
}
