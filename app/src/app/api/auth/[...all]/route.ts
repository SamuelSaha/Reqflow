/**
 * Better Auth API route handler
 * Handles all /api/auth/* endpoints
 */

import { auth } from "@/lib/auth/config";

export const { GET, POST } = auth.handler;
