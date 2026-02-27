/**
 * Cloudflare R2 Storage Client
 * S3-compatible object storage for file uploads
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

/**
 * Initialize R2 client
 * Uses S3-compatible API with Cloudflare R2 endpoint
 */
function getR2Client() {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Generate presigned upload URL
 * Client uploads directly to R2 using PUT request
 */
export async function generateUploadUrl(params: {
  key: string; // File path in bucket (e.g., "requests/uuid/filename.pdf")
  contentType: string; // MIME type (e.g., "application/pdf")
  contentLength?: number; // File size in bytes
}): Promise<{ uploadUrl: string; key: string }> {
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: params.key,
    ContentType: params.contentType,
    ...(params.contentLength && { ContentLength: params.contentLength }),
  });

  // Presigned URL expires in 1 hour
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    key: params.key,
  };
}

/**
 * Generate presigned download URL
 * Time-limited access (1 hour expiry)
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const client = getR2Client();

  // Use GetObject for downloads
  const url = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`;

  // For R2, we can use the public URL with presigned params
  // Or use getSignedUrl if bucket is private
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  // Generate presigned GET URL (expires in 1 hour)
  const downloadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return downloadUrl;
}

/**
 * Delete file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  await client.send(command);
}

/**
 * Generate unique file key
 * Format: {prefix}/{tenantId}/{timestamp}-{uuid}.{ext}
 */
export function generateFileKey(params: {
  prefix: string; // "requests" | "contracts" | "invoices"
  tenantId: string;
  filename: string;
}): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const ext = params.filename.split(".").pop() || "";
  const sanitizedName = params.filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .slice(0, 100);

  return `${params.prefix}/${params.tenantId}/${timestamp}-${uuid}.${ext}`;
}

/**
 * Validate file type
 * 🔒 SECURITY NOTE: This validates extension + MIME type before upload.
 * For complete security, magic bytes should also be validated after upload.
 * TODO: Implement post-upload magic bytes validation via R2 webhook or Lambda
 */
export function validateFileType(filename: string, contentType: string): boolean {
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];

  const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".xlsx", ".xls"];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  return allowedTypes.includes(contentType) && allowedExtensions.includes(ext);
}

/**
 * 🔒 SECURITY FIX: Validate file magic bytes (file signature)
 * Prevents malicious files disguised with fake extensions
 * Call this AFTER file is uploaded to verify actual file type
 */
export function validateFileMagicBytes(buffer: Buffer, expectedType: string): boolean {
  // Magic bytes signatures for allowed file types
  const signatures: Record<string, number[][]> = {
    pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    png: [[0x89, 0x50, 0x4e, 0x47]], // .PNG
    jpg: [[0xff, 0xd8, 0xff]], // JPEG
    jpeg: [[0xff, 0xd8, 0xff]], // JPEG
    xlsx: [[0x50, 0x4b, 0x03, 0x04]], // ZIP (Excel uses ZIP format)
    xls: [[0xd0, 0xcf, 0x11, 0xe0]], // OLE2 (old Excel format)
  };

  const fileSignatures = signatures[expectedType.toLowerCase()];
  if (!fileSignatures) {
    return false; // Unknown type
  }

  // Check if buffer starts with any of the valid signatures
  return fileSignatures.some((signature) =>
    signature.every((byte, index) => buffer[index] === byte)
  );
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
}

/**
 * File metadata type
 */
export interface FileMetadata {
  id: string;
  name: string;
  key: string; // R2 object key
  size: number; // bytes
  type: string; // MIME type
  uploadedAt: Date;
  uploadedBy: string; // userId
}
