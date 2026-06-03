"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** @see https://neon.com/docs/auth/quick-start/nextjs-api-only */
export const neonAuthClient: ReturnType<typeof createAuthClient> = createAuthClient();
export { neonAuthClient as authClient };
