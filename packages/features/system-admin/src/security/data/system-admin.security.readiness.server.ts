import type { OrganizationSecuritySettings } from "../contracts/system-admin.security-settings.contract";
import type {
  SecurityReadinessIssue,
  SecurityReadinessReport,
  SecurityReadinessVerdict,
} from "../contracts/system-admin.security-readiness.contract";

function issue(
  id: string,
  title: string,
  description: string,
): SecurityReadinessIssue {
  return { id, title, description };
}

function resolveVerdict(
  issues: readonly SecurityReadinessIssue[],
): SecurityReadinessVerdict {
  if (issues.some((entry) => entry.id.startsWith("blocked:"))) {
    return "blocked";
  }

  if (issues.length > 0) {
    return "warning";
  }

  return "ready";
}

export function evaluateSecurityReadiness(
  security: OrganizationSecuritySettings | null,
): SecurityReadinessReport {
  if (!security) {
    return {
      verdict: "blocked",
      issues: [
        issue(
          "blocked:uninitialized",
          "Security settings are not initialized",
          "Tenant security settings must exist before posture can be reviewed.",
        ),
      ],
    };
  }

  const issues: SecurityReadinessIssue[] = [];

  if (!security.requireMfaForAdmins) {
    issues.push(
      issue(
        "mfa",
        "MFA not required for admins",
        "Administrators are not required to use multi-factor authentication.",
      ),
    );
  }

  if (security.allowedEmailDomains.length === 0) {
    issues.push(
      issue(
        "domains",
        "No trusted domains configured",
        "Allowed email domains are empty; identity boundaries are not restricted.",
      ),
    );
  }

  if (!security.adminLockoutProtectionEnabled) {
    issues.push(
      issue(
        "lockout",
        "Admin lockout protection disabled",
        "The organization can lose administrative control without guardrails.",
      ),
    );
  }

  if (!security.requireSensitiveActionConfirmation) {
    issues.push(
      issue(
        "sensitive-confirmation",
        "Sensitive action confirmation disabled",
        "Sensitive administrative actions do not require explicit confirmation.",
      ),
    );
  }

  if (security.idleTimeoutMinutes > security.sessionMaxAgeMinutes) {
    issues.push(
      issue(
        "blocked:session-policy",
        "Idle timeout exceeds session max age",
        "Session governance is inconsistent; idle timeout must be less than or equal to session max age.",
      ),
    );
  }

  if (
    security.restrictInvitesToAllowedDomains &&
    security.allowedEmailDomains.length === 0
  ) {
    issues.push(
      issue(
        "blocked:invite-restriction",
        "Invite restriction without trusted domains",
        "Restricting invites requires at least one allowed email domain.",
      ),
    );
  }

  const allProtectionsDisabled =
    !security.requireMfaForAdmins &&
    !security.requireSensitiveActionConfirmation &&
    !security.adminLockoutProtectionEnabled;

  if (allProtectionsDisabled) {
    issues.push(
      issue(
        "blocked:protections",
        "All admin protections disabled",
        "At least one admin protection must remain enabled.",
      ),
    );
  }

  return {
    verdict: resolveVerdict(issues),
    issues,
  };
}
