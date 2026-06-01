export const APPROVAL_RULE_DEFAULT_MODULE_KEY = "*";

export const APPROVAL_RULE_DEFAULT_TARGET_TYPE = "erp-record";

export const APPROVAL_RULE_NAME_MAX_LENGTH = 160;

export const APPROVAL_RULE_KEY_MAX_LENGTH = 120;

export const APPROVAL_RULE_FIELD_MAX_LENGTH = 80;

export const APPROVAL_RULE_ROLE_KEYS_INPUT_MAX_LENGTH = 500;

export const APPROVAL_RULE_MIN_APPROVALS_MIN = 1;

export const APPROVAL_RULE_MIN_APPROVALS_MAX = 10;

export const APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN = 1;

export const APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX = 365;

export const APPROVAL_RULE_ESCALATION_HOURS_MIN = 1;

export const APPROVAL_RULE_ESCALATION_HOURS_MAX = 720;

export const APPROVAL_RULE_MIN_ESCALATION_HOURS_FROM_MINUTES = 1;

export const APPROVAL_RULE_LIST_SEARCH_FIELDS = [
  "key",
  "name",
  "moduleKey",
  "action",
  "targetType",
  "approvalMode",
  "approverRoles",
  "readinessVerdict",
  "status",
] as const;
