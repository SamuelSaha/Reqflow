/**
 * tRPC Files Router
 * Handles file upload/download operations with R2
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  generateUploadUrl,
  generateDownloadUrl,
  deleteFile,
  generateFileKey,
  validateFileType,
  validateFileSize,
  validateFileMagicBytes,
} from "@/lib/storage/r2";
import { createAuditLog, AuditAction } from "@/lib/monitoring/audit";

export const filesRouter = router({
  /**
   * Generate presigned upload URL
   * Client uploads directly to R2 using this URL
   */
  generateUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        entityType: z.enum(["request", "contract", "invoice"]),
        entityId: z.string().uuid().optional(), // Optional for new entities
        // First 16 bytes of the file as a hex string for magic-byte validation.
        // Clients should read file.slice(0, 16) and send it as
        // Buffer.from(bytes).toString('hex') before uploading.
        fileHeader: z.string().regex(/^[0-9a-f]{1,32}$/i).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 🔒 SECURITY FIX: Verify entity belongs to user's tenant (IDOR prevention)
      // If entityId is provided, user must own that entity to attach files
      if (input.entityId) {
        const { requests } = await import("@/lib/db/schema");
        const { eq, and } = await import("drizzle-orm");

        let entity;
        if (input.entityType === "request") {
          entity = await ctx.db.query.requests.findFirst({
            where: and(
              eq(requests.id, input.entityId),
              eq(requests.tenantId, ctx.tenantId)
            ),
          });
        } else {
          // TODO: Add support for contracts and invoices
          throw new TRPCError({
            code: "NOT_IMPLEMENTED",
            message: "File uploads for contracts and invoices coming soon",
          });
        }

        if (!entity) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied. You don't have permission to attach files to this entity.",
          });
        }
      }

      // Validate file type (extension + MIME)
      if (!validateFileType(input.filename, input.contentType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Invalid file type. Only PDF, PNG, JPG, and XLSX files are allowed.",
        });
      }

      // Validate magic bytes when the client provides the file header
      if (input.fileHeader) {
        const ext = input.filename.toLowerCase().split(".").pop() ?? "";
        const headerBuffer = Buffer.from(input.fileHeader, "hex");
        if (!validateFileMagicBytes(headerBuffer, ext)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "File content does not match the declared type. Upload rejected.",
          });
        }
      }

      // Validate file size (10MB max)
      if (!validateFileSize(input.size)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds 10MB limit.",
        });
      }

      // Generate unique file key
      const key = generateFileKey({
        prefix: `${input.entityType}s`, // "requests", "contracts", "invoices"
        tenantId: ctx.tenantId,
        filename: input.filename,
      });

      // Generate presigned upload URL
      const { uploadUrl } = await generateUploadUrl({
        key,
        contentType: input.contentType,
        contentLength: input.size,
      });

      // Return URL + metadata for client
      return {
        uploadUrl,
        fileId: crypto.randomUUID(),
        key,
        filename: input.filename,
        contentType: input.contentType,
        size: input.size,
      };
    }),

  /**
   * Generate presigned download URL
   * Returns time-limited (1hr) download link
   * 🔒 SECURITY FIX: Verify file key belongs to specific entity (IDOR prevention)
   */
  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        entityType: z.enum(["request", "contract", "invoice"]),
        entityId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify entity belongs to user's tenant
      const { requests } = await import("@/lib/db/schema");
      const { eq, and } = await import("drizzle-orm");

      let entity;
      if (input.entityType === "request") {
        entity = await ctx.db.query.requests.findFirst({
          where: and(
            eq(requests.id, input.entityId),
            eq(requests.tenantId, ctx.tenantId)
          ),
        });
      } else {
        // TODO: Add support for contracts and invoices
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "File downloads for contracts and invoices coming soon",
        });
      }

      if (!entity) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied.",
        });
      }

      // 🔒 CRITICAL FIX: Verify file key exists in entity's attachments
      // Prevents IDOR where user could download any file by guessing keys
      const attachments = (entity as unknown as { attachments?: Array<{ key: string }> }).attachments || [];
      const fileExists = attachments.some(
        (att) => att.key === input.key
      );

      if (!fileExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied.",
        });
      }

      // Generate presigned download URL
      const downloadUrl = await generateDownloadUrl(input.key);

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.FILE_DOWNLOADED,
        entityType: input.entityType,
        entityId: input.entityId,
        description: `Downloaded file: ${input.key}`,
        metadata: { key: input.key },
      });

      return { downloadUrl };
    }),

  /**
   * Delete file from R2
   * Removes file and updates entity metadata
   */
  deleteFile: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        fileId: z.string().uuid(),
        entityType: z.enum(["request", "contract", "invoice"]),
        entityId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify entity belongs to user's tenant
      const { requests } = await import("@/lib/db/schema");
      const { eq, and } = await import("drizzle-orm");

      let entity;
      if (input.entityType === "request") {
        entity = await ctx.db.query.requests.findFirst({
          where: and(
            eq(requests.id, input.entityId),
            eq(requests.tenantId, ctx.tenantId)
          ),
        });
      } else {
        // TODO: Add support for contracts and invoices
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "File deletion for contracts and invoices coming soon",
        });
      }

      if (!entity) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this file.",
        });
      }

      // Delete from R2
      await deleteFile(input.key);

      // 🔒 SECURITY FIX: Use parameterized query to prevent SQL injection
      // Remove from attachments array in DB (only for requests currently)
      if (input.entityType === "request") {
        // Safer approach: Filter in application layer to avoid SQL injection
        const currentEntity = entity as unknown as { attachments?: Array<{ id: string }> };
        const updatedAttachments = (currentEntity.attachments || []).filter(
          (att) => att.id !== input.fileId
        ) as unknown as Array<{ name: string; url: string }>;

        await ctx.db
          .update(requests)
          .set({
            attachments: updatedAttachments,
          })
          .where(eq(requests.id, input.entityId));
      }
      // TODO: Add support for contracts and invoices when tables have attachments field

      // Audit log
      await createAuditLog({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        userEmail: ctx.user.email,
        userName: ctx.user.name,
        action: AuditAction.FILE_DELETED,
        entityType: input.entityType,
        entityId: input.entityId,
        description: `Deleted file: ${input.key}`,
        metadata: { key: input.key, fileId: input.fileId },
      });

      return { success: true };
    }),
});
