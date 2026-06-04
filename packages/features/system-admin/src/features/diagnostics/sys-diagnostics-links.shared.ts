import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import type {
  SystemAdminDiagnosticCategory,
  SystemAdminDiagnosticTargetType,
} from "./sys-diagnostic-issue.contract";

export function resolveSystemAdminDiagnosticTargetHref(input: {
  targetType: SystemAdminDiagnosticTargetType;
  targetId?: string;
}) {
  switch (input.targetType) {
    case "permission":
      return systemAdminControlLinks.permissions();
    case "capability":
      return systemAdminControlLinks.capabilities(
        input.targetId?.split(".")[0],
      );
    case "module":
      return systemAdminControlLinks.modules(input.targetId);
    case "policy":
      return input.targetId
        ? systemAdminControlLinks.policy(input.targetId)
        : systemAdminRoutePaths.policies;
    case "approval_rule":
      return input.targetId
        ? systemAdminControlLinks.approval(input.targetId)
        : systemAdminRoutePaths.approvals;
    case "audit_action":
      return systemAdminControlLinks.audit();
    case "role":
      return systemAdminControlLinks.roles();
    case "security_setting":
      return systemAdminControlLinks.security();
    case "integration":
      return systemAdminControlLinks.integrations();
    default: {
      const _exhaustive: never = input.targetType;
      return _exhaustive;
    }
  }
}

export function systemAdminDiagnosticsHubHref() {
  return systemAdminRoutePaths.diagnostics;
}

export function buildSystemAdminDiagnosticsCategoryHref(
  category: SystemAdminDiagnosticCategory,
) {
  const search = new URLSearchParams();
  search.set("diagnosticsCategory", category);
  return `${systemAdminRoutePaths.diagnostics}?${search.toString()}`;
}

export const systemAdminAuditCoverageDiagnosticsHref =
  buildSystemAdminDiagnosticsCategoryHref("audit_coverage");
