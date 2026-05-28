import "server-only"

/**
 * Public portal server helpers — for unauthenticated employee portal entry points.
 */

/**
 * Checks whether a portal access token is valid.
 * Placeholder until the portal access token model is implemented.
 */
export async function verifyPortalAccessToken(
  _token: string,
): Promise<{ valid: boolean; employeeId?: string; organizationId?: string }> {
  return { valid: false }
}
