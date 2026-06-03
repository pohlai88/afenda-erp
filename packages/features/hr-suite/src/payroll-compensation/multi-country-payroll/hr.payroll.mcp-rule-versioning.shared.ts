import {
  assertHrMcpRuleVersionStatusTransition,
  HrMcpCommandError,
  isHrMcpRuleVersionLocked,
  type HrMcpRuleVersionSnapshotPayload,
} from "@afenda/db";

import type { HrMcpRuleVersionStatus } from "./hr.payroll.mcp-constants.shared";

export class HrMcpRuleVersionError extends Error {
  readonly code:
    | "rule_version_locked"
    | "invalid_rule_version_transition"
    | "rule_version_not_publishable";

  constructor(
    code: HrMcpRuleVersionError["code"],
    message?: string,
  ) {
    super(message ?? code);
    this.name = "HrMcpRuleVersionError";
    this.code = code;
  }
}

export function formatHrMcpRuleVersionLabel(input: {
  versionNumber: number;
  versionStatus: string;
}): string {
  return `v${input.versionNumber} · ${formatRuleVersionStatusLabel(input.versionStatus)}`;
}

export function formatRuleVersionStatusLabel(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function assertHrMcpRuleVersionEditable(versionStatus: string): void {
  if (isHrMcpRuleVersionLocked(versionStatus)) {
    throw new HrMcpRuleVersionError(
      "rule_version_locked",
      "Published or archived rule versions cannot be edited",
    );
  }
}

export function assertHrMcpRuleVersionPublishable(versionStatus: string): void {
  assertHrMcpRuleVersionEditable(versionStatus);
  try {
    assertHrMcpRuleVersionStatusTransition(versionStatus, "published");
  } catch (error) {
    if (error instanceof HrMcpCommandError) {
      throw new HrMcpRuleVersionError(
        "invalid_rule_version_transition",
        error.message,
      );
    }
    throw error;
  }
}

export function canTransitionHrMcpRuleVersion(
  from: HrMcpRuleVersionStatus,
  to: HrMcpRuleVersionStatus,
): boolean {
  try {
    assertHrMcpRuleVersionStatusTransition(from, to);
    return true;
  } catch {
    return false;
  }
}

export function buildHrMcpRuleVersionSnapshotPayload(input: {
  ruleVersionId: string;
  versionNumber: number;
  countryConfigId: string;
  taxRules?: readonly Record<string, unknown>[];
  statutoryRules?: readonly Record<string, unknown>[];
  employerRules?: readonly Record<string, unknown>[];
  payComponentTreatments?: readonly Record<string, unknown>[];
  prorationRules?: readonly Record<string, unknown>[];
  overtimeRules?: readonly Record<string, unknown>[];
  leaveTreatments?: readonly Record<string, unknown>[];
}): HrMcpRuleVersionSnapshotPayload {
  return {
    ruleVersionId: input.ruleVersionId,
    versionNumber: input.versionNumber,
    countryConfigId: input.countryConfigId,
    taxRules: input.taxRules,
    statutoryRules: input.statutoryRules,
    employerRules: input.employerRules,
    payComponentTreatments: input.payComponentTreatments,
    prorationRules: input.prorationRules,
    overtimeRules: input.overtimeRules,
    leaveTreatments: input.leaveTreatments,
  };
}

export function resolveFinalizedRuleVersionReference(input: {
  payrollRunRef: string;
  ruleVersionId: string;
  versionNumber: number;
}): string {
  return `${input.payrollRunRef}::${input.ruleVersionId}::v${input.versionNumber}`;
}

export function isPublishedHrMcpRuleVersion(versionStatus: string): boolean {
  return versionStatus === "published";
}
