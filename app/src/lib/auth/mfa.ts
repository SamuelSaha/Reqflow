/**
 * MFA (Multi-Factor Authentication) utilities
 * 🔒 SECURITY (issue #121): TOTP-based MFA for Finance/Admin roles
 *
 * Uses otplib for TOTP generation/verification
 * Uses qrcode for QR code generation
 */

import * as crypto from "crypto";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

const APP_NAME = "Reqflow";

/**
 * Generate a new MFA secret for TOTP
 * Returns base32-encoded secret
 */
export function generateMFASecret(): string {
  return generateSecret();
}

/**
 * Generate the otpauth:// URL for authenticator apps
 */
export function generateOtpAuthUrl(
  secret: string,
  email: string
): string {
  return generateURI({
    secret,
    issuer: APP_NAME,
    label: email,
  });
}

/**
 * Generate QR code as data URL for display
 */
export async function generateQRCodeDataUrl(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl, {
    width: 256,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

/**
 * Verify a TOTP code against a secret
 * 🔒 SECURITY: Uses time-based verification with 1 period window
 */
export async function verifyTOTP(secret: string, code: string): Promise<boolean> {
  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return false;
  }

  try {
    const result = await verify({ secret, token: code });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Generate backup codes for MFA recovery
 * 🔒 SECURITY: 10 codes, 8 characters each, alphanumeric
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes confusing characters

  for (let i = 0; i < count; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += chars.charAt(crypto.randomInt(0, chars.length));
    }
    codes.push(code);
  }

  return codes;
}

/**
 * Hash backup codes for storage
 * 🔒 SECURITY: Uses bcrypt (same as passwords)
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}

/**
 * Verify a backup code against hashed codes
 * 🔒 SECURITY: Removes used code after successful verification (one-time use)
 */
export async function verifyBackupCode(
  hashedCodes: string[],
  code: string
): Promise<{ valid: boolean; remainingCodes: string[] }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) {
      // Remove the used code
      const remainingCodes = [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
      return { valid: true, remainingCodes };
    }
  }

  return { valid: false, remainingCodes: hashedCodes };
}

/**
 * Check if MFA is required for a role
 */
export function isMFARequiredForRole(role: string): boolean {
  return role === "finance" || role === "admin";
}

/**
 * Setup MFA for a user
 * Returns secret, otpAuthUrl, QR code data URL, and backup codes
 */
export async function setupMFA(email: string): Promise<{
  secret: string;
  otpAuthUrl: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}> {
  const secret = generateMFASecret();
  const otpAuthUrl = generateOtpAuthUrl(secret, email);
  const qrCodeDataUrl = await generateQRCodeDataUrl(otpAuthUrl);
  const backupCodes = generateBackupCodes();

  return {
    secret,
    otpAuthUrl,
    qrCodeDataUrl,
    backupCodes,
  };
}
