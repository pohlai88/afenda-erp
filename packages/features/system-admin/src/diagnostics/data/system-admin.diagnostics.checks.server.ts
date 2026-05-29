import { isAppCapability, organizationRoles } from "@afenda/auth";
import type {
  RoleOverrideRow,
  TenantApprovalSettingRow,
  TenantCapabilitySettingRow,
  TenantModuleSettingRow,
  TenantPolicySettingRow,
} from "@afenda/db";
import {
  getExecutionCapability,
  listExecutionCapabilities,
  listExecutionCapabilitiesForModule,
} from "@afenda/kernel/execution-capabilities";
import { evaluateCapabilityCoverage } from "../../capabilities/data/system-admin.capabilities.coverage.server";
import type { OrganizationSecuritySettings } from "../../security/contracts/system-admin.security-settings.contract";
import { mapTenantApprovalSettingToRule } from "../../approvals/data/system-admin.approval-rules.mapper";
import { mapTenantPolicySettingToRule } from "../../policies/data/system-admin.policy-rules.mapper";
import type { IntegrationReadinessReport } from "../../integrations/contracts/system-admin.integrations-readiness.contract";
import { resolveSystemAdminDiagnosticTargetHref } from "../contracts/system-admin.diagnostics-links.shared";
import type { SystemAdminDiagnosticIssue } from "../contracts/system-admin.diagnostic-issue.contract";
import { sortDiagnosticIssues } from "./system-admin.diagnostics.verdict.server";

function issueId(parts: string[]) {
  return parts.join(":");
}

function withHref(
  issue: Omit<SystemAdminDiagnosticIssue, "targetHref">,
): SystemAdminDiagnosticIssue {
  return {
    ...issue,
    targetHref: resolveSystemAdminDiagnosticTargetHref({
      targetType: issue.targetType,
      targetId: issue.targetId,
    }),
  };
}

export function collectIntegrationDiagnosticIssues(
  readiness: IntegrationReadinessReport,
): SystemAdminDiagnosticIssue[] {
  return readiness.issues.map((entry) =>
    withHref({
      id: issueId(["integration_health", entry.id]),
      category: "integration_health",
      severity: entry.id.startsWith("blocked:") ? "blocked" : "warning",
      title: entry.title,
      description: entry.description,
      targetType: "integration",
      targetId: "integrations",
      recommendedAction:
        "Review integrations connectivity, webhook health, and credential rotation in System Admin integrations.",
    }),
  );
}

function resolveCapabilityForAction(action: string) {
  const direct = getExecutionCapability(action);
  if (direct) {
    return direct;
  }

  return (
    listExecutionCapabilities().find(
      (capability) => capability.requiredPermission === action,
    ) ?? null
  );
}

function moduleSettingsByKey(settings: readonly TenantModuleSettingRow[]) {
  return new Map(settings.map((setting) => [setting.moduleKey, setting]));
}

function capabilitySettingsByKey(settings: readonly TenantCapabilitySettingRow[]) {
  return new Map(settings.map((setting) => [setting.capabilityKey, setting]));
}

export function collectSystemAdminDiagnosticIssues(input: {
  moduleSettings: readonly TenantModuleSettingRow[];
  capabilitySettings: readonly TenantCapabilitySettingRow[];
  policySettings: readonly TenantPolicySettingRow[];
  approvalSettings: readonly TenantApprovalSettingRow[];
  roleOverrides: readonly RoleOverrideRow[];
  security: OrganizationSecuritySettings | null;
}): SystemAdminDiagnosticIssue[] {
  const issues: SystemAdminDiagnosticIssue[] = [];
  const modulesByKey = moduleSettingsByKey(input.moduleSettings);
  const capabilitiesByKey = capabilitySettingsByKey(input.capabilitySettings);
  const capabilities = listExecutionCapabilities();

  for (const capability of capabilities) {
    const coverage = evaluateCapabilityCoverage({
      capability,
      moduleSettings: input.moduleSettings,
      capabilitySettings: input.capabilitySettings,
    });

    if (coverage.verdict === "missing_permission") {
      issues.push(
        withHref({
          id: issueId(["permission_coverage", capability.key]),
          category: "permission_coverage",
          severity: "blocked",
          title: "Missing permission in catalog",
          description: `Capability ${capability.key} requires permission ${capability.requiredPermission}, but that permission is not declared in the catalog.`,
          targetType: "permission",
          targetId: capability.requiredPermission,
          recommendedAction:
            "Add the permission to the auth catalog or update the capability required permission.",
        }),
      );
    }

    if (
      coverage.verdict === "missing_audit" ||
      coverage.issues.some((issue) => issue.toLowerCase().includes("audit area"))
    ) {
      issues.push(
        withHref({
          id: issueId(["audit_coverage", capability.key]),
          category: "audit_coverage",
          severity: "blocked",
          title: "Audit action mapping missing",
          description: `Sensitive capability ${capability.key} has no audit area mapping for execution evidence.`,
          targetType: "capability",
          targetId: capability.key,
          recommendedAction:
            "Declare auditArea on the execution capability or route sensitive mutations through audited actions.",
        }),
      );
    }

    const moduleSetting = modulesByKey.get(capability.moduleKey);
    const orgAvailability = capabilitiesByKey.get(capability.key)?.availability;

    if (
      moduleSetting &&
      (!moduleSetting.enabled || !moduleSetting.visible) &&
      orgAvailability !== "disabled"
    ) {
      issues.push(
        withHref({
          id: issueId(["capability_status", `${capability.key}:module-off`]),
          category: "capability_status",
          severity: "warning",
          title: "Capability active while module is disabled",
          description: `Module ${capability.moduleKey} is disabled or hidden, but capability ${capability.key} remains enabled for this organization.`,
          targetType: "capability",
          targetId: capability.key,
          recommendedAction:
            "Disable the capability or re-enable the module to keep configuration consistent.",
        }),
      );
    }

    if (
      moduleSetting?.enabled &&
      moduleSetting.visible &&
      orgAvailability === "disabled"
    ) {
      issues.push(
        withHref({
          id: issueId(["capability_status", capability.key]),
          category: "capability_status",
          severity: "warning",
          title: "Inactive capability on enabled module",
          description: `Module ${capability.moduleKey} is enabled, but capability ${capability.key} is disabled for this organization.`,
          targetType: "capability",
          targetId: capability.key,
          recommendedAction:
            "Enable the capability in System Admin capabilities or disable the parent module if access should remain off.",
        }),
      );
    }
  }

  for (const moduleSetting of input.moduleSettings) {
    if (!moduleSetting.enabled || !moduleSetting.visible) {
      continue;
    }

    const moduleCapabilities = listExecutionCapabilitiesForModule(
      moduleSetting.moduleKey,
    );

    if (moduleCapabilities.length === 0) {
      continue;
    }

    const activeCount = moduleCapabilities.filter((capability) => {
      const availability = capabilitiesByKey.get(capability.key)?.availability;
      return availability !== "disabled";
    }).length;

    if (activeCount === 0) {
      issues.push(
        withHref({
          id: issueId(["module_health", moduleSetting.moduleKey]),
          category: "module_health",
          severity: "warning",
          title: "Module enabled without active capabilities",
          description: `Module ${moduleSetting.moduleKey} is enabled, but every declared capability is disabled for this organization.`,
          targetType: "module",
          targetId: moduleSetting.moduleKey,
          recommendedAction:
            "Enable at least one capability for the module or disable the module to avoid empty access surfaces.",
        }),
      );
    }
  }

  for (const policyRow of input.policySettings) {
    const rule = mapTenantPolicySettingToRule(policyRow);
    if (rule.status !== "active" || !rule.enabled) {
      continue;
    }

    const moduleSetting = modulesByKey.get(rule.moduleKey);
    if (
      moduleSetting &&
      (!moduleSetting.enabled ||
        !moduleSetting.visible ||
        moduleSetting.readiness === "blocked")
    ) {
      issues.push(
        withHref({
          id: issueId(["policy_drift", rule.key]),
          category: "policy_drift",
          severity: "blocked",
          title: "Policy references inactive module",
          description: `Policy ${rule.name} targets module ${rule.moduleKey}, which is disabled or blocked for this organization.`,
          targetType: "policy",
          targetId: rule.key,
          recommendedAction:
            "Update the policy module target or restore module availability before keeping the rule active.",
        }),
      );
    }

    const actionCapability = resolveCapabilityForAction(rule.action);
    if (!actionCapability) {
      issues.push(
        withHref({
          id: issueId(["policy_drift", `${rule.key}:action`]),
          category: "policy_drift",
          severity: "blocked",
          title: "Policy references unknown action",
          description: `Policy ${rule.name} references action ${rule.action}, which is not registered in the execution capability catalog.`,
          targetType: "policy",
          targetId: rule.key,
          recommendedAction:
            "Align the policy action with an active execution capability or deprecate the policy rule.",
        }),
      );
      continue;
    }

    const actionAvailability = capabilitiesByKey.get(actionCapability.key)?.availability;
    if (actionAvailability === "disabled" || actionCapability.status === "deprecated") {
      issues.push(
        withHref({
          id: issueId(["policy_drift", `${rule.key}:capability`]),
          category: "policy_drift",
          severity: "blocked",
          title: "Policy references inactive capability",
          description: `Policy ${rule.name} references action ${rule.action}, but the mapped capability is disabled or deprecated.`,
          targetType: "policy",
          targetId: rule.key,
          recommendedAction:
            "Re-enable the capability, update the policy action, or disable the policy rule.",
        }),
      );
    }
  }

  for (const approvalRow of input.approvalSettings) {
    const rule = mapTenantApprovalSettingToRule(approvalRow);
    if (rule.status === "deprecated") {
      issues.push(
        withHref({
          id: issueId(["approval_drift", rule.key]),
          category: "approval_drift",
          severity: "warning",
          title: "Deprecated approval rule",
          description: `Approval rule ${rule.name} is marked deprecated but remains configured.`,
          targetType: "approval_rule",
          targetId: rule.key,
          recommendedAction:
            "Deprecate or remove the approval rule if it should no longer govern mutations.",
        }),
      );
    }

    for (const roleKey of rule.approverRoleKeys) {
      if (!(organizationRoles as readonly string[]).includes(roleKey)) {
        issues.push(
          withHref({
            id: issueId(["approval_drift", `${rule.key}:${roleKey}`]),
            category: "approval_drift",
            severity: "warning",
            title: "Approval rule references unknown role",
            description: `Approval rule ${rule.name} references role ${roleKey}, which is not in the organization role catalog.`,
            targetType: "approval_rule",
            targetId: rule.key,
            recommendedAction:
              "Assign a valid approver role or update the approval rule configuration.",
          }),
        );
      }
    }
  }

  for (const override of input.roleOverrides) {
    if (!isAppCapability(override.permissionKey)) {
      issues.push(
        withHref({
          id: issueId(["role_coverage", `${override.role}:${override.permissionKey}`]),
          category: "role_coverage",
          severity: "warning",
          title: "Role override references unknown permission",
          description: `Role ${override.role} includes permission ${override.permissionKey}, which is not in the declared permission catalog.`,
          targetType: "role",
          targetId: override.role,
          recommendedAction:
            "Remove the override or add the permission to the catalog before granting it to a role.",
        }),
      );
    }
  }

  const security = input.security;
  if (security) {
    if (!security.requireMfaForAdmins) {
      issues.push(
        withHref({
          id: issueId(["security_posture", "mfa"]),
          category: "security_posture",
          severity: "warning",
          title: "Admin MFA requirement disabled",
          description: "Administrators are not required to use multi-factor authentication.",
          targetType: "security_setting",
          targetId: "requireMfaForAdmins",
          recommendedAction:
            "Enable MFA for admins in System Admin security settings.",
        }),
      );
    }

    if (!security.requireSensitiveActionConfirmation) {
      issues.push(
        withHref({
          id: issueId(["security_posture", "sensitive-confirmation"]),
          category: "security_posture",
          severity: "warning",
          title: "Sensitive action confirmation disabled",
          description: "Sensitive administrative actions do not require explicit confirmation.",
          targetType: "security_setting",
          targetId: "requireSensitiveActionConfirmation",
          recommendedAction:
            "Enable sensitive action confirmation in security settings.",
        }),
      );
    }

    if (!security.adminLockoutProtectionEnabled) {
      issues.push(
        withHref({
          id: issueId(["security_posture", "lockout"]),
          category: "security_posture",
          severity: "warning",
          title: "Admin lockout protection disabled",
          description: "Admin lockout protection is turned off for this organization.",
          targetType: "security_setting",
          targetId: "adminLockoutProtectionEnabled",
          recommendedAction:
            "Re-enable admin lockout protection after confirming the operational impact.",
        }),
      );
    }
  }

  return sortDiagnosticIssues(issues);
}
