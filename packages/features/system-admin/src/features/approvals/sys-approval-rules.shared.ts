import type {
  SystemAdminApprovalRule,
  SystemAdminApprovalRuleStatus,
} from "./sys-approval-rule.contract";
import {
  MINUTES_PER_HOUR,
  readOptionalFormValue,
} from "../tenant-execution/sys-execution-settings.shared";
import {
  approvalRuleStatusSchema,
  systemAdminApprovalRuleActionSchema,
  type SystemAdminApprovalRuleActionInput,
} from "./sys-approval-rule.schema";

export const APPROVAL_ACTIVITY_DEFAULT_LIMIT = 10;

export const SYSTEM_ADMIN_APPROVAL_AUDIT_ACTION_PREFIX =
  "system-admin.approval";

export function resolveApprovalRuleKey(input: SystemAdminApprovalRuleActionInput) {
  return input.mode === "create" ? input.approvalKey : input.approvalRuleId;
}

export function toEscalationMinutes(escalationAfterHours?: number) {
  return escalationAfterHours
    ? escalationAfterHours * MINUTES_PER_HOUR
    : null;
}

export function readConfiguredApprovalRuleStatus(
  configuration: Record<string, unknown>,
): SystemAdminApprovalRuleStatus {
  const parsed = approvalRuleStatusSchema.safeParse(configuration.status);
  return parsed.success ? parsed.data : "active";
}

export function formatApprovalEscalationSummary(rule: {
  escalationAfterHours?: number;
  escalationBehavior?: SystemAdminApprovalRule["escalationBehavior"];
  escalationRoleKeys: readonly string[];
}) {
  if (!rule.escalationAfterHours) {
    return "Not configured";
  }

  const behavior = rule.escalationBehavior ?? "notify";
  const roles =
    rule.escalationRoleKeys.length > 0
      ? ` → ${rule.escalationRoleKeys.join(", ")}`
      : "";

  return `${rule.escalationAfterHours}h · ${behavior}${roles}`;
}

export function parseApprovalRuleActionFormData(formData: FormData) {
  const mode = formData.get("mode") === "create" ? "create" : "update";

  return systemAdminApprovalRuleActionSchema.safeParse({
    mode,
    approvalKey:
      mode === "create"
        ? formData.get("approvalKey")
        : formData.get("approvalRuleId"),
    approvalRuleId: formData.get("approvalRuleId"),
    name: formData.get("name"),
    moduleKey: formData.get("moduleKey"),
    action: formData.get("action"),
    targetType: formData.get("targetType"),
    approvalMode: formData.get("approvalMode"),
    approverRoleKeys: formData.get("approverRoleKeys"),
    delegateToRoleKeys: readOptionalFormValue(formData.get("delegateToRoleKeys")),
    delegationValidDays: readOptionalFormValue(formData.get("delegationValidDays")),
    minApprovals: formData.get("minApprovals"),
    escalationAfterHours: readOptionalFormValue(
      formData.get("escalationAfterHours"),
    ),
    escalationBehavior: readOptionalFormValue(formData.get("escalationBehavior")),
    escalationRoleKeys: readOptionalFormValue(formData.get("escalationRoleKeys")),
    status: formData.get("status"),
    enabled: formData.get("enabled"),
  });
}

export function buildApprovalRuleAuditMetadata(input: {
  previous: {
    label: string;
    enabled: boolean;
    approverRole: string | null;
    configuration: Record<string, unknown>;
  } | null;
  next: {
    name: string;
    enabled: boolean;
    status: string;
    approvalMode: SystemAdminApprovalRule["approvalMode"];
    approverRoleKeys: readonly string[];
    delegateToRoleKeys: readonly string[];
    delegationValidDays?: number;
    minApprovals: number;
    escalationAfterHours?: number;
    escalationBehavior?: SystemAdminApprovalRule["escalationBehavior"];
    escalationRoleKeys: readonly string[];
    configuration: Record<string, unknown>;
  };
}) {
  return {
    previous: input.previous,
    next: {
      label: input.next.name,
      enabled: input.next.enabled,
      status: input.next.status,
      approvalMode: input.next.approvalMode,
      approverRoleKeys: input.next.approverRoleKeys,
      delegateToRoleKeys: input.next.delegateToRoleKeys,
      delegationValidDays: input.next.delegationValidDays ?? null,
      minApprovals: input.next.minApprovals,
      escalationAfterHours: input.next.escalationAfterHours ?? null,
      escalationBehavior: input.next.escalationBehavior ?? null,
      escalationRoleKeys: input.next.escalationRoleKeys,
      configuration: input.next.configuration,
    },
  };
}
