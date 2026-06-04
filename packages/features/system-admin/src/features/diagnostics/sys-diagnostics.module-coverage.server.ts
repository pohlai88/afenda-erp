import { moduleById } from "@afenda/kernel";
import type { ModuleId } from "@afenda/config/module-ids";
import type { TenantModuleSettingRow } from "@afenda/db";
import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import type { SystemAdminDiagnosticIssue } from "./sys-diagnostic-issue.contract";
import type { SystemAdminDiagnosticsModuleCoverageRow } from "./sys-diagnostics-coverage.contract";

function titleCaseModuleKey(moduleKey: string) {
  return moduleKey
    .split(/[-.]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function resolveDiagnosticIssueModuleKey(
  issue: SystemAdminDiagnosticIssue,
): string {
  if (issue.targetType === "module" && issue.targetId) {
    return issue.targetId;
  }

  if (issue.targetId?.includes(".")) {
    const [segment] = issue.targetId.split(".");
    if (segment && segment.length > 0) {
      return segment;
    }
  }

  return "system-admin";
}

function moduleLabelForKey(moduleKey: string) {
  const definition = moduleById.get(moduleKey as ModuleId);
  return definition?.label ?? titleCaseModuleKey(moduleKey);
}

function coverageStatusForCounts(input: {
  blockedCount: number;
  warningCount: number;
  totalCount: number;
}): SystemAdminDiagnosticsModuleCoverageRow["status"] {
  if (input.blockedCount > 0) {
    return "blocked";
  }

  if (input.warningCount > 0) {
    return "warning";
  }

  if (input.totalCount > 0) {
    return "notice";
  }

  return "healthy";
}

export function buildDiagnosticsModuleCoverageRows(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
  moduleSettings: readonly TenantModuleSettingRow[];
}): SystemAdminDiagnosticsModuleCoverageRow[] {
  const moduleKeys = new Set<string>();

  for (const setting of input.moduleSettings) {
    moduleKeys.add(setting.moduleKey);
  }

  for (const issue of input.issues) {
    moduleKeys.add(resolveDiagnosticIssueModuleKey(issue));
  }

  return [...moduleKeys]
    .sort((left, right) => left.localeCompare(right))
    .map((moduleKey) => {
      const moduleIssues = input.issues.filter(
        (issue) => resolveDiagnosticIssueModuleKey(issue) === moduleKey,
      );
      const blockedCount = moduleIssues.filter(
        (issue) => issue.severity === "blocked",
      ).length;
      const warningCount = moduleIssues.filter(
        (issue) => issue.severity === "warning",
      ).length;
      const infoCount = moduleIssues.filter(
        (issue) => issue.severity === "info",
      ).length;
      const totalCount = moduleIssues.length;

      return {
        id: moduleKey,
        moduleKey,
        moduleLabel: moduleLabelForKey(moduleKey),
        status: coverageStatusForCounts({
          blockedCount,
          warningCount,
          totalCount,
        }),
        blockedCount,
        warningCount,
        infoCount,
        totalCount,
        href: systemAdminControlLinks.modules(moduleKey),
      };
    });
}
