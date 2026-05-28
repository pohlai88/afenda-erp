import "server-only"

import { getDb } from "@afenda/db"

/**
 * Lazy Drizzle database instance — matches the `@afenda/platform/db` surface.
 *
 * Uses `getDb()` to respect the lazy-pool rule: no module-scope pool creation.
 * Import this instead of calling `getDb()` directly in HRM action/data files.
 */
export const db = getDb()
