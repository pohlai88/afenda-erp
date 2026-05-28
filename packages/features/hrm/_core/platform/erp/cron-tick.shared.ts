/**
 * Cron tick validation helpers — isomorphic.
 *
 * Used to validate the `Authorization: Bearer <CRON_SECRET>` header
 * in `/api/cron/*` Route Handlers.
 */

/**
 * Returns true when the Authorization header contains the expected cron secret.
 * Returns false when `CRON_SECRET` is not configured (disables the route in dev
 * if desired, but logs a warning).
 */
export function isValidCronRequest(authorizationHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn(
      "[cron] CRON_SECRET is not set — cron endpoints are unprotected.",
    )
    return true // allow in dev when not configured
  }
  return authorizationHeader === `Bearer ${secret}`
}

export type CronTickResult<T = void> = {
  readonly ok: boolean
  readonly processed: number
  readonly summary?: T
  readonly error?: string
}
