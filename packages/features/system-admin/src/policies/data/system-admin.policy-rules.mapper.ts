import type { TenantPolicySettingRow } from "@afenda/db";
import {
  executionPolicyEffects,
  type TenantPolicyRuleRecord,
} from "@afenda/kernel/execution-tenant-policy";
import { policyRuleStatusSchema } from "../schemas/system-admin.policy-rule.schema";
import type {
  SystemAdminPolicyRule,
  SystemAdminPolicyRuleListRow,
  SystemAdminPolicyRuleStatus,
} from "../contracts/system-admin.policy-rule.contract";
import { evaluatePolicyRuleReadiness } from "./system-admin.policy-rules.readiness.server";
import {
  readConfigurationNumber,
  readConfigurationString,
  readExecutionSettingConfiguration,
} from "../../tenant-execution/contracts/system-admin.execution-settings.shared";

function derivePolicyStatus(
  row: TenantPolicySettingRow,
  configuredStatus: unknown,
): SystemAdminPolicyRuleStatus {
  if (
    configuredStatus === "active" ||
    configuredStatus === "disabled" ||
    configuredStatus === "deprecated"
  ) {
    if (!row.enabled || row.readiness !== "active") {
      return "disabled";
    }
    return configuredStatus;
  }

  if (!row.enabled) {
    return "disabled";
  }

  if (row.readiness === "deprecated") {
    return "deprecated";
  }

  if (row.readiness !== "active") {
    return "disabled";
  }

  return "active";
}

export function mapTenantPolicySettingToRule(
  row: TenantPolicySettingRow,
): SystemAdminPolicyRule {
  const configuration = readExecutionSettingConfiguration(row.configuration);
  const effectParse =
    typeof configuration.effect === "string" &&
    (executionPolicyEffects as readonly string[]).includes(configuration.effect)
      ? { success: true as const, data: configuration.effect as TenantPolicyRuleRecord["effect"] }
      : { success: false as const };

  return {
    id: row.id,
    organizationId: row.organizationId,
    key: row.policyKey,
    name: row.label,
    moduleKey: readConfigurationString(configuration.moduleKey, "*"),
    action: readConfigurationString(configuration.action, row.policyKey),
    targetType: readConfigurationString(configuration.targetType, "erp-record"),
    effect: effectParse.success ? effectParse.data : "deny",
    condition: readExecutionSettingConfiguration(configuration.condition),
    status: derivePolicyStatus(row, configuration.status),
    priority: readConfigurationNumber(configuration.priority, 0),
    enabled: row.enabled,
    readiness: row.readiness,
  };
}

export function mapTenantPolicySettingToListRow(
  row: TenantPolicySettingRow,
): SystemAdminPolicyRuleListRow {
  const rule = mapTenantPolicySettingToRule(row);
  const conditionKeys = Object.keys(rule.condition);
  const readinessVerdict = evaluatePolicyRuleReadiness(rule);

  return {
    id: rule.id,
    key: rule.key,
    name: rule.name,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    effect: rule.effect,
    status: rule.status,
    enabled: rule.enabled,
    priority: rule.priority,
    conditionSummary:
      conditionKeys.length === 0
        ? "No conditions"
        : `${conditionKeys.length} condition${conditionKeys.length === 1 ? "" : "s"}`,
    readinessVerdict,
    coverageSummary:
      rule.effect === "require_approval"
        ? "Approval chain"
        : rule.effect === "warn"
          ? "Warning only"
          : "Execution gate",
  };
}

export function mapTenantPolicySettingToKernelRecord(
  row: TenantPolicySettingRow,
): TenantPolicyRuleRecord | null {
  const rule = mapTenantPolicySettingToRule(row);

  if (rule.status !== "active") {
    return null;
  }

  return {
    id: rule.id,
    key: rule.key,
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    effect: rule.effect,
    condition: rule.condition,
    status: policyRuleStatusSchema.parse(rule.status),
    priority: rule.priority,
  };
}

export function serializePolicyRuleConfiguration(
  rule: Pick<
    SystemAdminPolicyRule,
    | "moduleKey"
    | "action"
    | "targetType"
    | "effect"
    | "condition"
    | "status"
    | "priority"
  >,
) {
  return {
    moduleKey: rule.moduleKey,
    action: rule.action,
    targetType: rule.targetType,
    effect: rule.effect,
    condition: rule.condition,
    status: rule.status,
    priority: rule.priority,
  };
}
