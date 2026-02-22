/**
 * Better Auth API route handler
 * Handles all /api/auth/* endpoints
 */

import { auth } from "@/lib/auth/config";

const handler = auth.handler;

export const GET = handler;
export const POST = handler;
