import { formatNumeric } from "@afenda/db";

import {
  HR_MCP_STATUTORY_READINESS_CHECK_CODES,
  hrMcpStatutoryReadinessInputSchema,
  type HrMcpStatutoryReadinessCheckCode,
  type HrMcpStatutoryReadinessCheckResult,
  type HrMcpStatutoryReadinessInput,
  type HrMcpStatutoryReadinessResult,
} from "../schemas/hr.payroll.mcp-validation.schema";

/** MCP-015 — validation failures for statutory readiness checks. */
export class HrMcpValidationError extends Error {
  readonly code:
    | "invalid_readiness_input"
    | "employee_not_statutory_ready"
    | "invalid_threshold_input"
    | "threshold_validation_failed";

  constructor(code: HrMcpValidationError["code"], message?: string) {
    super(message ?? code);
    this.name = "HrMcpValidationError";
    this.code = code;
  }
}

export { HR_MCP_STATUTORY_READINESS_CHECK_CODES };

function evaluateTaxIdCheck(
  taxId: string | null,
): HrMcpStatutoryReadinessCheckResult {
  const passed = taxId !== null && taxId.trim().length > 0;
  return {
    code: "tax_id",
    passed,
    message: passed
      ? "Employee tax ID is present."
      : "Employee tax ID is required before country payroll processing.",
  };
}

function evaluateStatutoryIdCheck(
  statutoryIds: Readonly<Record<string, string>>,
  requiredStatutoryIdKeys: readonly string[],
): HrMcpStatutoryReadinessCheckResult {
  const missingKeys = requiredStatutoryIdKeys.filter((key) => {
    const value = statutoryIds[key];
    return value === undefined || value.trim().length === 0;
  });

  const passed = missingKeys.length === 0;
  return {
    code: "statutory_id",
    passed,
    message: passed
      ? "Required statutory IDs are present."
      : `Missing statutory IDs: ${missingKeys.join(", ")}.`,
  };
}

function evaluateClassificationCheck(
  classification: HrMcpStatutoryReadinessInput["classification"],
): HrMcpStatutoryReadinessCheckResult {
  if (classification === null) {
    return {
      code: "classification",
      passed: false,
      message:
        "Employee classification (tax residency, worker category, statutory eligibility) is required.",
    };
  }

  if (classification.statutoryEligibility === "pending") {
    return {
      code: "classification",
      passed: false,
      message: "Statutory eligibility classification is still pending.",
    };
  }

  if (classification.statutoryEligibility === "ineligible") {
    return {
      code: "classification",
      passed: false,
      message: "Employee is marked ineligible for statutory payroll processing.",
    };
  }

  return {
    code: "classification",
    passed: true,
    message: "Employee classification is complete and eligible.",
  };
}

function evaluateLegalEntityAssignmentCheck(
  classification: HrMcpStatutoryReadinessInput["classification"],
): HrMcpStatutoryReadinessCheckResult {
  const legalEntitySetupId = classification?.legalEntitySetupId ?? null;
  const passed =
    legalEntitySetupId !== null && legalEntitySetupId.trim().length > 0;

  return {
    code: "legal_entity_assignment",
    passed,
    message: passed
      ? "Employee is assigned to a legal entity for this country."
      : "Legal entity assignment is required before country payroll processing.",
  };
}

/** MCP-015 — build per-check statutory readiness checklist. */
export function buildStatutoryReadinessChecklist(
  input: HrMcpStatutoryReadinessInput,
): readonly HrMcpStatutoryReadinessCheckResult[] {
  return [
    evaluateTaxIdCheck(input.taxId),
    evaluateStatutoryIdCheck(input.statutoryIds, input.requiredStatutoryIdKeys),
    evaluateClassificationCheck(input.classification),
    evaluateLegalEntityAssignmentCheck(input.classification),
  ];
}

/** MCP-015 — validate employee statutory readiness before payroll processing. */
export function validateEmployeeStatutoryReadiness(
  rawInput: HrMcpStatutoryReadinessInput,
): HrMcpStatutoryReadinessResult {
  const parsed = hrMcpStatutoryReadinessInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new HrMcpValidationError(
      "invalid_readiness_input",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  const input = parsed.data;
  const checks = buildStatutoryReadinessChecklist(input);
  const blockingCodes = checks
    .filter((check) => !check.passed)
    .map((check) => check.code satisfies HrMcpStatutoryReadinessCheckCode);

  return {
    employeeId: input.employeeId,
    countryCode: input.countryCode,
    ready: blockingCodes.length === 0,
    checks: [...checks],
    blockingCodes,
  };
}

/** MCP-015 — assert readiness; throws when employee is not statutory-ready. */
export function assertEmployeeStatutoryReady(
  input: HrMcpStatutoryReadinessInput,
): HrMcpStatutoryReadinessResult {
  const result = validateEmployeeStatutoryReadiness(input);
  if (!result.ready) {
    throw new HrMcpValidationError(
      "employee_not_statutory_ready",
      `Employee ${result.employeeId} is not statutory-ready for ${result.countryCode}: ${result.blockingCodes.join(", ")}`,
    );
  }
  return result;
}

/** Default statutory ID keys required by country (stub registry for MCP-015). */
export const HR_MCP_DEFAULT_REQUIRED_STATUTORY_ID_KEYS: Readonly<
  Record<string, readonly string[]>
> = {
  MY: ["epf_number", "socso_number"],
  SG: ["cpf_number"],
  GB: ["ni_number"],
};

export function resolveRequiredStatutoryIdKeys(
  countryCode: string,
  overrideKeys?: readonly string[],
): readonly string[] {
  if (overrideKeys !== undefined) {
    return overrideKeys;
  }
  return HR_MCP_DEFAULT_REQUIRED_STATUTORY_ID_KEYS[countryCode.toUpperCase()] ?? [];
}

export function formatMcpReadinessSummary(
  result: HrMcpStatutoryReadinessResult,
): string {
  const status = result.ready ? "READY" : "BLOCKED";
  const failed = result.checks.filter((check) => !check.passed).length;
  return `${result.countryCode}/${result.employeeId}: ${status} (${failed}/${result.checks.length} failed)`;
}

export { formatNumeric };
