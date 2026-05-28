import type { TenantApprovalSettingRow } from "@afenda/db";
import { organizationRoles } from "@afenda/auth";
import type { TenantApprovalRuleRecord } from "@afenda/kernel/execution";
import type {
  SystemAdminApprovalRule,
  SystemAdminApprovalRuleListRow,
  SystemAdminApprovalRuleStatus,
} from "../contracts/system-admin.approval-rule.contract";

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

type ApproverRole = NonNullable<TenantApprovalSettingRow["approverRole"]>;

function readApproverRoles(
  configuration: Record<string, unknown>,
  fallbackRole: ApproverRole | null,
): readonly ApproverRole[] {
  const configured = configuration.approverRoleKeys;
  if (Array.isArray(configured)) {
    const roles = configured.filter(
      (role): role is ApproverRole =>
        typeof role === "string" &&
        (organizationRoles as readonly string[]).includes(role),
    );
    if (roles.length > 0) {
      return roles;
    }
  }

  return fallbackRole ? [fallbackRole] : [];
}

function deriveApprovalStatus(
  row: TenantApprovalSettingRow,
  configuredStatus: unknown,
): SystemAdminApprovalRuleStatus {
  if (
    configuredStatus === "active" ||
    configuredStatus === "disabled" ||
    configuredStatus === "deprecated"
  ) {
    if (!row.enabled) {
      return "disabled";
    }
    return configuredStatus;
  }

  return row.enabled ? "active" : "disabled";
}

export function mapTenantApprovalSettingToRule(
  row: TenantApprovalSettingRow,
): SystemAdminApprovalRule {
  const configuration = readRecord(row.configuration);
  const escalationAfterHours =
    typeof configuration.escalationAfterHours === "number"
      ? configuration.escalationAfterHours
      : row.escalationMinutes
        ? Math.max(1, Math.round(row.escalationMinutes / 60))
        : undefined;

  return {
    id: row.id,
    organizationId: row.organizationId,
    key: row.approvalKey,
    name: row.label,
    moduleKey: readString(configuration.moduleKey, "*"),
    action: readString(configuration.action, row.approvalKey),
    targetType: readString(configuration.targetType, "erp-record"),
    approverRoleKeys: readApproverRoles(configuration, row.approverRole),
    minApprovals: readNumber(configuration.minApprovals, 1),
    escalationAfterHours,
    status: deriveApprovalStatus(row, configuration.status),
    enabled: row.enabled,
  };
}

export function mapTenantApprovalSettingToListRow(
  row: TenantApprovalSettingRow,
): SystemAdminApprovalRuleListRow {
  const rule = mapTenantApprovalSettingToRule(row);

  return {
    id: rule.id,
    key: rule.key,
    name: rule.name,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    approverRoles: rule.approverRoleKeys.join(", "),
    minApprovals: rule.minApprovals,
    escalation: rule.escalationAfterHours
      ? `${rule.escalationAfterHours} hours`
      : "Not configured",
    status: rule.status,
  };
}

export function mapTenantApprovalSettingToKernelRecord(
  row: TenantApprovalSettingRow,
): TenantApprovalRuleRecord | null {
  const rule = mapTenantApprovalSettingToRule(row);

  if (rule.status !== "active" || rule.approverRoleKeys.length === 0) {
    return null;
  }

  return {
    id: rule.id,
    key: rule.key,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    approverRoleKeys: rule.approverRoleKeys,
    minApprovals: rule.minApprovals,
    escalationAfterHours: rule.escalationAfterHours,
    status: "active",
  };
}

export function serializeApprovalRuleConfiguration(
  rule: Pick<
    SystemAdminApprovalRule,
    | "moduleKey"
    | "action"
    | "targetType"
    | "approverRoleKeys"
    | "minApprovals"
    | "escalationAfterHours"
    | "status"
  >,
) {
  return {
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    approverRoleKeys: rule.approverRoleKeys,
    minApprovals: rule.minApprovals,
    escalationAfterHours: rule.escalationAfterHours,
    status: rule.status,
  };
}
