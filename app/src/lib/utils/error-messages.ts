/**
 * Error Message Utilities
 * Formats tRPC errors into user-friendly messages
 */

import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/lib/api/root";

/**
 * Get user-friendly error message from tRPC error
 * @param error - tRPC client error
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: TRPCClientErrorLike<AppRouter> | null | undefined
): string {
  if (!error) {
    return "An error occurred";
  }

  // Handle specific error codes
  const code = error.data?.code;

  switch (code) {
    case "UNAUTHORIZED":
      return "Please sign in to continue";

    case "FORBIDDEN":
      return "You don't have permission to view this";

    case "NOT_FOUND":
      return "Not found";

    case "BAD_REQUEST":
      return error.message || "Invalid request";

    case "CONFLICT":
      return error.message || "This operation conflicts with existing data";

    case "INTERNAL_SERVER_ERROR":
      return "Something went wrong on our end. Please try again.";

    default:
      // Network/fetch errors
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return "Connection lost. Check your internet connection.";
      }

      // Timeout errors
      if (error.message.includes("timeout")) {
        return "Request timed out. Please try again.";
      }

      // Generic error
      return error.message || "Something went wrong. Please try again.";
  }
}

/**
 * Check if error should trigger redirect to login
 * @param error - tRPC client error
 * @returns true if should redirect to login
 */
export function shouldRedirectToLogin(
  error: TRPCClientErrorLike<AppRouter> | null | undefined
): boolean {
  return error?.data?.code === "UNAUTHORIZED";
}

/**
 * Get action label for error retry button
 * @param error - tRPC client error
 * @returns Button label ("Try again", "Sign in", "Go back", etc.)
 */
export function getErrorActionLabel(
  error: TRPCClientErrorLike<AppRouter> | null | undefined
): string {
  const code = error?.data?.code;

  switch (code) {
    case "UNAUTHORIZED":
      return "Sign in";

    case "FORBIDDEN":
      return "Go back";

    case "NOT_FOUND":
      return "Go back";

    default:
      return "Try again";
  }
}
