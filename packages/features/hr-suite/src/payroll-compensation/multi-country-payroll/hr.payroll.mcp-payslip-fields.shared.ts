import type { HrMcpPayslipFieldConfig } from "@afenda/db";

import { HrMcpValidationError } from "./hr.payroll.mcp-statutory-readiness.shared";
import {
  hrMcpResolvePayslipFieldsInputSchema,
  type HrMcpPayslipFieldManifestEntry,
  type HrMcpPayslipFieldValues,
  type HrMcpResolvePayslipFieldsInput,
  type HrMcpResolvedPayslipField,
} from "./hr.payroll.mcp-export.schema";

/** MCP-020 — default payslip field manifests by country (extend via DB config). */
export const HR_MCP_DEFAULT_PAYSLIP_FIELD_MANIFESTS: Readonly<
  Record<string, readonly HrMcpPayslipFieldManifestEntry[]>
> = {
  MY: [
    {
      fieldKey: "employee_name",
      label: "Employee Name",
      required: true,
      displayOrder: 1,
      statutoryBreakdown: false,
    },
    {
      fieldKey: "tax_id",
      label: "Income Tax Number",
      required: true,
      displayOrder: 2,
      statutoryBreakdown: false,
    },
    {
      fieldKey: "epf_employee",
      label: "EPF (Employee)",
      required: true,
      displayOrder: 10,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "epf_employer",
      label: "EPF (Employer)",
      required: true,
      displayOrder: 11,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "socso_employee",
      label: "SOCSO (Employee)",
      required: true,
      displayOrder: 12,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "net_pay",
      label: "Net Pay (MYR)",
      required: true,
      displayOrder: 99,
      statutoryBreakdown: false,
    },
  ],
  SG: [
    {
      fieldKey: "employee_name",
      label: "Employee Name",
      required: true,
      displayOrder: 1,
      statutoryBreakdown: false,
    },
    {
      fieldKey: "tax_id",
      label: "NRIC/FIN",
      required: true,
      displayOrder: 2,
      statutoryBreakdown: false,
    },
    {
      fieldKey: "cpf_employee",
      label: "CPF (Employee)",
      required: true,
      displayOrder: 10,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "cpf_employer",
      label: "CPF (Employer)",
      required: true,
      displayOrder: 11,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "sdl",
      label: "Skills Development Levy",
      required: false,
      displayOrder: 12,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "net_pay",
      label: "Net Pay (SGD)",
      required: true,
      displayOrder: 99,
      statutoryBreakdown: false,
    },
  ],
  GB: [
    {
      fieldKey: "employee_name",
      label: "Employee Name",
      required: true,
      displayOrder: 1,
      statutoryBreakdown: false,
    },
    {
      fieldKey: "tax_id",
      label: "National Insurance Number",
      required: true,
      displayOrder: 2,
      statutoryBreakdown: false,
    },
    {
      fieldKey: "paye_tax",
      label: "PAYE Tax",
      required: true,
      displayOrder: 10,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "ni_employee",
      label: "NI (Employee)",
      required: true,
      displayOrder: 11,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "ni_employer",
      label: "NI (Employer)",
      required: true,
      displayOrder: 12,
      statutoryBreakdown: true,
    },
    {
      fieldKey: "net_pay",
      label: "Net Pay (GBP)",
      required: true,
      displayOrder: 99,
      statutoryBreakdown: false,
    },
  ],
};

export function resolveDefaultPayslipManifest(
  countryCode: string,
): readonly HrMcpPayslipFieldManifestEntry[] {
  return (
    HR_MCP_DEFAULT_PAYSLIP_FIELD_MANIFESTS[countryCode.toUpperCase()] ?? [
      {
        fieldKey: "employee_name",
        label: "Employee Name",
        required: true,
        displayOrder: 1,
        statutoryBreakdown: false,
      },
      {
        fieldKey: "net_pay",
        label: "Net Pay",
        required: true,
        displayOrder: 99,
        statutoryBreakdown: false,
      },
    ]
  );
}

/** Convert DB payslip field config rows into manifest entries. */
export function mapDbPayslipFieldConfigs(
  configs: readonly HrMcpPayslipFieldConfig[],
): readonly HrMcpPayslipFieldManifestEntry[] {
  return configs
    .map((config) => ({
      fieldKey: config.fieldKey,
      label: config.label,
      required: config.required,
      displayOrder: config.displayOrder,
      statutoryBreakdown: config.statutoryBreakdown ?? false,
    }))
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

function formatPayslipValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

/** MCP-020 — resolve localized payslip fields with missing-required detection. */
export function resolvePayslipFields(
  rawInput: HrMcpResolvePayslipFieldsInput,
): readonly HrMcpResolvedPayslipField[] {
  const parsed = hrMcpResolvePayslipFieldsInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new HrMcpValidationError(
      "invalid_readiness_input",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  const { manifest, values } = parsed.data;

  return [...manifest]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((entry) => {
      const rawValue = values[entry.fieldKey] ?? null;
      const missing =
        entry.required &&
        (rawValue === null ||
          rawValue === undefined ||
          (typeof rawValue === "string" && rawValue.trim().length === 0));

      return {
        fieldKey: entry.fieldKey,
        label: entry.label,
        value: rawValue,
        required: entry.required,
        displayOrder: entry.displayOrder,
        statutoryBreakdown: entry.statutoryBreakdown,
        missing,
      };
    });
}

/** MCP-020 — assert all required payslip fields are populated. */
export function assertPayslipFieldsComplete(
  input: HrMcpResolvePayslipFieldsInput,
): readonly HrMcpResolvedPayslipField[] {
  const resolved = resolvePayslipFields(input);
  const missingKeys = resolved
    .filter((field) => field.missing)
    .map((field) => field.fieldKey);

  if (missingKeys.length > 0) {
    throw new HrMcpValidationError(
      "employee_not_statutory_ready",
      `Missing required payslip fields: ${missingKeys.join(", ")}`,
    );
  }

  return resolved;
}

export function buildPayslipFieldValuesFromPayrollRun(input: {
  employeeName: string;
  taxId: string | null;
  statutoryAmounts: HrMcpPayslipFieldValues;
  netPay: number;
}): HrMcpPayslipFieldValues {
  return {
    employee_name: input.employeeName,
    tax_id: input.taxId,
    net_pay: input.netPay,
    ...input.statutoryAmounts,
  };
}

export { formatPayslipValue };
