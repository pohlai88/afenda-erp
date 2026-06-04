import type { TenantApprovalSettingRow } from "@afenda/db";
import { organizationRoles } from "@afenda/kernel";
import type { TenantApprovalRuleRecord } from "@afenda/kernel/execution";
import type {
  ApprovalEscalationBehavior,
  SystemAdminApprovalMode,
  SystemAdminApprovalRule,
  SystemAdminApprovalRuleListRow,
  SystemAdminApprovalRuleStatus,
} from "./sys-approval-rule.contract";
import { evaluateApprovalRuleReadiness } from "./sys-approval-rules.readiness.server";
import {
  formatApprovalEscalationSummary,
} from "./sys-approval-rules.shared";
import {
  MINUTES_PER_HOUR,
  readConfigurationNumber,
  readConfigurationOptionalNumber,
  readConfigurationString,
  readExecutionSettingConfiguration,
} from "../tenant-execution/sys-execution-settings.shared";
import {
  APPROVAL_RULE_DEFAULT_MODULE_KEY,
  APPROVAL_RULE_DEFAULT_TARGET_TYPE,
  APPROVAL_RULE_MIN_ESCALATION_HOURS_FROM_MINUTES,
} from "./sys-approval-rule.limits.shared";
import {
  approvalModeSchema,
  escalationBehaviorSchema,
} from "./sys-approval-rule.schema";

type ApproverRole = NonNullable<TenantApprovalSettingRow["approverRole"]>;

function readRoleKeys(
  configuration: Record<string, unknown>,
  key: "approverRoleKeys" | "delegateToRoleKeys" | "escalationRoleKeys",
): readonly ApproverRole[] {
  const configured = configuration[key];
  if (!Array.isArray(configured)) {
    return [];
  }

  return configured.filter(
    (role): role is ApproverRole =>
      typeof role === "string" &&
      (organizationRoles as readonly string[]).includes(role),
  );
}

function readApproverRoles(
  configuration: Record<string, unknown>,
  fallbackRole: ApproverRole | null,
): readonly ApproverRole[] {
  const configured = readRoleKeys(configuration, "approverRoleKeys");
  if (configured.length > 0) {
    return configured;
  }

  return fallbackRole ? [fallbackRole] : [];
}

function readApprovalMode(
  configuration: Record<string, unknown>,
): SystemAdminApprovalMode {
  const parsed = approvalModeSchema.safeParse(configuration.approvalMode);
  return parsed.success ? parsed.data : "parallel";
}

function readEscalationBehavior(
  configuration: Record<string, unknown>,
): ApprovalEscalationBehavior | undefined {
  const parsed = escalationBehaviorSchema.safeParse(configuration.escalationBehavior);
  return parsed.success ? parsed.data : undefined;
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
  const configuration = readExecutionSettingConfiguration(row.configuration);
  const escalationAfterHours =
    typeof configuration.escalationAfterHours === "number"
      ? configuration.escalationAfterHours
      : row.escalationMinutes
        ? Math.max(
            APPROVAL_RULE_MIN_ESCALATION_HOURS_FROM_MINUTES,
            Math.round(row.escalationMinutes / MINUTES_PER_HOUR),
          )
        : undefined;

  return {
    id: row.id,
    organizationId: row.organizationId,
    key: row.approvalKey,
    name: row.label,
    moduleKey: readConfigurationString(
      configuration.moduleKey,
      APPROVAL_RULE_DEFAULT_MODULE_KEY,
    ),
    action: readConfigurationString(configuration.action, row.approvalKey),
    targetType: readConfigurationString(
      configuration.targetType,
      APPROVAL_RULE_DEFAULT_TARGET_TYPE,
    ),
    approvalMode: readApprovalMode(configuration),
    approverRoleKeys: readApproverRoles(configuration, row.approverRole),
    minApprovals: readConfigurationNumber(configuration.minApprovals, 1),
    escalationAfterHours,
    escalationBehavior: readEscalationBehavior(configuration),
    escalationRoleKeys: readRoleKeys(configuration, "escalationRoleKeys"),
    delegateToRoleKeys: readRoleKeys(configuration, "delegateToRoleKeys"),
    delegationValidDays: readConfigurationOptionalNumber(configuration.delegationValidDays),
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
    approvalMode: rule.approvalMode,
    approverRoles: rule.approverRoleKeys.join(", "),
    minApprovals: rule.minApprovals,
    escalation: formatApprovalEscalationSummary(rule),
    status: rule.status,
    enabled: rule.enabled,
    readinessVerdict: evaluateApprovalRuleReadiness(rule),
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
    approvalMode: rule.approvalMode,
    approverRoleKeys: rule.approverRoleKeys,
    minApprovals: rule.minApprovals,
    escalationAfterHours: rule.escalationAfterHours,
    escalationBehavior: rule.escalationBehavior,
    escalationRoleKeys:
      rule.escalationRoleKeys.length > 0 ? rule.escalationRoleKeys : undefined,
    delegateToRoleKeys:
      rule.delegateToRoleKeys.length > 0 ? rule.delegateToRoleKeys : undefined,
    delegationValidDays: rule.delegationValidDays,
    status: "active",
  };
}

export function serializeApprovalRuleConfiguration(
  rule: Pick<
    SystemAdminApprovalRule,
    | "moduleKey"
    | "action"
    | "targetType"
    | "approvalMode"
    | "approverRoleKeys"
    | "minApprovals"
    | "escalationAfterHours"
    | "escalationBehavior"
    | "escalationRoleKeys"
    | "delegateToRoleKeys"
    | "delegationValidDays"
    | "status"
  >,
) {
  return {
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    approvalMode: rule.approvalMode,
    approverRoleKeys: rule.approverRoleKeys,
    delegateToRoleKeys: rule.delegateToRoleKeys,
    delegationValidDays: rule.delegationValidDays,
    minApprovals: rule.minApprovals,
    escalationAfterHours: rule.escalationAfterHours,
    escalationBehavior: rule.escalationBehavior,
    escalationRoleKeys: rule.escalationRoleKeys,
    status: rule.status,
  };
}
