import "server-only"

/**
 * Auth email helper stubs.
 *
 * In the current deployment, authentication email flows are handled by
 * Neon Auth or the dev-session bypass. These stubs satisfy the HRM legacy
 * import surface while a transactional email integration is wired separately.
 */

export async function sendOrgInviteEmail(_options: {
  toEmail: string
  orgName: string
  inviteUrl: string
}): Promise<void> {
  // TODO: wire to transactional email provider (e.g. Resend / SendGrid).
  console.info("[auth-mail] Org invite email queued (not yet wired).", {
    toEmail: _options.toEmail,
  })
}
