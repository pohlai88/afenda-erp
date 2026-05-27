"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Neon’s Next.js adapter resolves `/api/auth` on the current origin by default.
 * Set `NEXT_PUBLIC_AUTH_URL` when the browser must target a different host.
 */
export const neonAuthClient: ReturnType<typeof createAuthClient> =
  createAuthClient();
