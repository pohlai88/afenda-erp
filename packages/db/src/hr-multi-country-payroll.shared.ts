export class HrMcpCommandError extends Error {
  readonly code:
    | "country_config_not_found"
    | "legal_entity_setup_not_found"
    | "rule_version_not_found"
    | "rule_version_locked"
    | "invalid_rule_version_transition"
    | "employee_not_found"
    | "duplicate_country_code"
    | "duplicate_legal_entity_code"
    | "invalid_effective_range"
    | "snapshot_not_found"
    | "report_config_not_found";

  constructor(code: HrMcpCommandError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrMcpCommandError";
    this.code = code;
  }
}

export function parseNumeric(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNumeric(value: number, scale = 4): string {
  return value.toFixed(scale);
}

export const HR_MCP_EDITABLE_RULE_VERSION_STATUSES = ["draft"] as const;

export const HR_MCP_PUBLISHED_RULE_VERSION_STATUSES = [
  "published",
  "archived",
  "superseded",
] as const;

export function assertEffectiveDateRange(
  effectiveFrom: Date,
  effectiveTo: Date | null | undefined,
): void {
  if (effectiveTo && effectiveTo.getTime() < effectiveFrom.getTime()) {
    throw new HrMcpCommandError(
      "invalid_effective_range",
      "effective_to must be on or after effective_from",
    );
  }
}

export function assertHrMcpRuleVersionStatusTransition(
  from: string,
  to: string,
): void {
  const allowed: Record<string, readonly string[]> = {
    draft: ["published", "archived"],
    published: ["superseded", "archived"],
    superseded: ["archived"],
    archived: [],
  };

  if (!(allowed[from] ?? []).includes(to)) {
    throw new HrMcpCommandError(
      "invalid_rule_version_transition",
      `Cannot transition rule version from ${from} to ${to}`,
    );
  }
}

export function isHrMcpRuleVersionLocked(status: string): boolean {
  return (HR_MCP_PUBLISHED_RULE_VERSION_STATUSES as readonly string[]).includes(
    status,
  );
}
