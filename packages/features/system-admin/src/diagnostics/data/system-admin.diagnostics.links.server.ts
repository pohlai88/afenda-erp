import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import type {
  SystemAdminDiagnosticCategory,
  SystemAdminDiagnosticTargetType,
} from "../contracts/system-admin.diagnostic-issue.contract";

export function resolveSystemAdminDiagnosticTargetHref(input: {
  category: SystemAdminDiagnosticCategory;
  targetType: SystemAdminDiagnosticTargetType;
  targetId?: string;
}) {
  switch (input.targetType) {
    case "permission":
      return systemAdminControlLinks.permissions(input.targetId);
    case "capability":
      return systemAdminControlLinks.capabilities(input.targetId);
    case "module":
      return systemAdminControlLinks.modules(input.targetId);
    case "policy":
      return systemAdminControlLinks.policies(input.targetId);
    case "approval_rule":
      return systemAdminControlLinks.approvals(input.targetId);
    case "audit_action":
      return systemAdminControlLinks.audit();
    case "role":
      return systemAdminControlLinks.roles();
    case "security_setting":
      return systemAdminControlLinks.security();
    default: {
      const _exhaustive: never = input.targetType;
      return _exhaustive;
    }
  }
}

export function systemAdminDiagnosticsHubHref() {
  return systemAdminRoutePaths.diagnostics;
}
