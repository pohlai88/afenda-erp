import { Badge } from "@afenda/ui";

import type {
  ApprovalReadinessVerdict,
  SystemAdminApprovalRuleStatus,
} from "../contracts/system-admin.approval-rule.contract";
import {
  resolveSystemAdminApprovalEnabledBadgePresentation,
  resolveSystemAdminApprovalReadinessBadgePresentation,
  resolveSystemAdminApprovalStatusBadgePresentation,
  systemAdminApprovalEnabledBadgeAriaLabel,
  systemAdminApprovalReadinessBadgeAriaLabel,
  systemAdminApprovalStatusBadgeAriaLabel,
} from "../surface/system-admin.approvals-detail-badges.shared";

export function SystemAdminApprovalStatusBadge({
  status,
}: {
  status: SystemAdminApprovalRuleStatus;
}) {
  const presentation = resolveSystemAdminApprovalStatusBadgePresentation(status);

  return (
    <Badge
      variant={presentation.variant}
      aria-label={systemAdminApprovalStatusBadgeAriaLabel(status)}
      data-testid={`system-admin-approval-status-badge:${status}`}
    >
      {presentation.label}
    </Badge>
  );
}

export function SystemAdminApprovalReadinessBadge({
  verdict,
}: {
  verdict: ApprovalReadinessVerdict;
}) {
  const presentation =
    resolveSystemAdminApprovalReadinessBadgePresentation(verdict);

  return (
    <Badge
      variant={presentation.variant}
      aria-label={systemAdminApprovalReadinessBadgeAriaLabel(verdict)}
      data-testid={`system-admin-approval-readiness-badge:${verdict}`}
    >
      {presentation.label}
    </Badge>
  );
}

export function SystemAdminApprovalEnabledBadge({
  enabled,
}: {
  enabled: boolean;
}) {
  const presentation = resolveSystemAdminApprovalEnabledBadgePresentation(enabled);

  return (
    <Badge
      variant={presentation.variant}
      aria-label={systemAdminApprovalEnabledBadgeAriaLabel(enabled)}
      data-testid={`system-admin-approval-enabled-badge:${enabled ? "true" : "false"}`}
    >
      {presentation.label}
    </Badge>
  );
}
