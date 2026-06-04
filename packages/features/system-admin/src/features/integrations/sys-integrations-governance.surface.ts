import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import {
  buildLinkedControlListSurface,
  moduleReadinessVerdictBadge,
} from "../overview/sys-control-list.shared";
import {
  formatIntegrationReadinessVerdictLabel,
  type IntegrationReadinessReport,
} from "./sys-integrations-readiness.contract";
import { systemAdminIntegrationsUiCopy } from "./sys-integrations-ui.copy.shared";

export const systemAdminIntegrationsGovernanceSurfaceKey =
  "system-admin.integrations.governance";

export function buildIntegrationsGovernanceListSurface(input: {
  readiness: IntegrationReadinessReport;
  activeCredentialCount: number;
  enabledWebhookCount: number;
  failedDeliveryCount: number;
  stagedSsoCount: number;
}): ListSurfaceRendererConfigurationResolvedInput {
  const issueSummary =
    input.readiness.issues.length > 0
      ? input.readiness.issues.map((entry) => entry.title).join("; ")
      : "No outstanding issues";

  return buildLinkedControlListSurface({
    key: systemAdminIntegrationsGovernanceSurfaceKey,
    title: systemAdminIntegrationsUiCopy.governance.title,
    object: "integrations-governance",
    columns: [
      { id: "area", header: "Area", priority: "primary", pin: "start" },
      { id: "signal", header: "Signal" },
      { id: "value", header: "Value", cellKind: { kind: "badge" } },
    ],
    rows: [
      {
        id: "readiness",
        cells: {
          area: "Readiness",
          signal: "Verdict",
          value: formatIntegrationReadinessVerdictLabel(input.readiness.verdict),
        },
        cellKinds: {
          value: moduleReadinessVerdictBadge(input.readiness.verdict),
        },
      },
      {
        id: "risks",
        cells: {
          area: "Readiness",
          signal: "Outstanding risks",
          value: issueSummary,
        },
      },
      {
        id: "credentials",
        cells: {
          area: "API credentials",
          signal: "Active credentials",
          value: String(input.activeCredentialCount),
        },
      },
      {
        id: "webhooks",
        cells: {
          area: "Webhooks",
          signal: "Enabled endpoints",
          value: String(input.enabledWebhookCount),
        },
      },
      {
        id: "failures",
        cells: {
          area: "Webhook health",
          signal: "Failed deliveries (recent window)",
          value: String(input.failedDeliveryCount),
        },
        cellKinds:
          input.failedDeliveryCount > 0
            ? { value: moduleReadinessVerdictBadge("warning") }
            : { value: moduleReadinessVerdictBadge("ready") },
      },
      {
        id: "sso",
        cells: {
          area: "SSO",
          signal: "Staged connections",
          value: String(input.stagedSsoCount),
        },
      },
    ],
    emptyTitle: systemAdminIntegrationsUiCopy.governance.emptyTitle,
    emptyDescription: systemAdminIntegrationsUiCopy.governance.emptyDescription,
    searchPlaceholder: systemAdminIntegrationsUiCopy.governance.searchPlaceholder,
  });
}
