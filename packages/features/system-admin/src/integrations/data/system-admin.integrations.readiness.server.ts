import type {
  IntegrationReadinessIssue,
  IntegrationReadinessReport,
  IntegrationReadinessVerdict,
} from "../contracts/system-admin.integrations-readiness.contract";
import type {
  SystemAdminApiCredentialListRow,
  SystemAdminSsoConnectionListRow,
  SystemAdminWebhookDeliveryListRow,
  SystemAdminWebhookListRow,
} from "../contracts/system-admin.integrations-list.contract";

function issue(
  id: string,
  title: string,
  description: string,
): IntegrationReadinessIssue {
  return { id, title, description };
}

function resolveVerdict(
  issues: readonly IntegrationReadinessIssue[],
): IntegrationReadinessVerdict {
  if (issues.some((entry) => entry.id.startsWith("blocked:"))) {
    return "blocked";
  }

  if (issues.length > 0) {
    return "warning";
  }

  return "ready";
}

export function evaluateIntegrationsReadiness(input: {
  credentials: readonly SystemAdminApiCredentialListRow[];
  webhooks: readonly SystemAdminWebhookListRow[];
  deliveries: readonly SystemAdminWebhookDeliveryListRow[];
  ssoConnections: readonly SystemAdminSsoConnectionListRow[];
}): IntegrationReadinessReport {
  const issues: IntegrationReadinessIssue[] = [];
  const activeCredentials = input.credentials.filter(
    (credential) => credential.status === "active",
  );
  const enabledWebhooks = input.webhooks.filter(
    (webhook) => webhook.status === "enabled",
  );
  const failedDeliveries = input.deliveries.filter(
    (delivery) => delivery.status === "failed",
  );
  const stagedSso = input.ssoConnections.filter(
    (connection) => connection.enabled,
  );

  if (activeCredentials.length === 0 && enabledWebhooks.length === 0) {
    issues.push(
      issue(
        "blocked:connectivity",
        "No active external connectivity",
        "Issue API credentials or enable webhooks before relying on outbound integration.",
      ),
    );
  }

  if (enabledWebhooks.length > 0 && failedDeliveries.length > 0) {
    issues.push(
      issue(
        "webhook-failures",
        "Webhook delivery failures recorded",
        `${failedDeliveries.length} recent delivery attempt(s) failed. Review webhook health before trusting automation.`,
      ),
    );
  }

  if (
    failedDeliveries.length >= 5 &&
    enabledWebhooks.length > 0
  ) {
    issues.push(
      issue(
        "blocked:webhook-health",
        "Webhook health is critically degraded",
        "Multiple consecutive failures indicate the endpoint is unhealthy.",
      ),
    );
  }

  if (stagedSso.length > 0) {
    issues.push(
      issue(
        "sso-staged",
        "SSO connections remain staged",
        "Staged SSO metadata is not enforced until auth activation completes.",
      ),
    );
  }

  const expiredCredentials = input.credentials.filter(
    (credential) => credential.status === "expired",
  );
  if (expiredCredentials.length > 0 && activeCredentials.length === 0) {
    issues.push(
      issue(
        "credentials",
        "Only expired API credentials remain",
        "Rotate or issue a new credential before external systems lose access.",
      ),
    );
  }

  return {
    verdict: resolveVerdict(issues),
    issues,
  };
}
