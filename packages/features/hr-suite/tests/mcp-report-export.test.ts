import { describe, expect, it } from "vitest";

import { buildBankPaymentExport } from "./hr.payroll.mcp-bank-export.shared";
import {
  generateMcpContributionReport,
  generateMcpReportByKind,
} from "./hr.payroll.mcp-contribution-reports.shared";
import {
  assertPayslipFieldsComplete,
  resolveDefaultPayslipManifest,
  resolvePayslipFields,
} from "./hr.payroll.mcp-payslip-fields.shared";
import { generateMcpStatutoryReport } from "./hr.payroll.mcp-statutory-reports.shared";
import { generateMcpTaxReport } from "./hr.payroll.mcp-tax-reports.shared";
import { HrMcpValidationError } from "./hr.payroll.mcp-statutory-readiness.shared";
import { buildVendorExport } from "./hr.payroll.mcp-vendor-export.shared";
import type { HrMcpReportLineItem } from "../schemas/hr.payroll.mcp-report.schema";

const sampleLineItems: HrMcpReportLineItem[] = [
  {
    employeeId: "hr_emp_001",
    employeeName: "Aisha Rahman",
    taxId: "IG123456789",
    statutoryReference: "EPF123456",
    currencyCode: "MYR",
    grossPay: 8000,
    taxablePay: 7500,
    taxWithheld: 450,
    employeeContribution: 880,
    employerContribution: 968,
    netPay: 6670,
  },
  {
    employeeId: "hr_emp_002",
    employeeName: "Ben Tan",
    taxId: "S1234567A",
    statutoryReference: "CPF654321",
    currencyCode: "SGD",
    grossPay: 6000,
    taxablePay: 5800,
    taxWithheld: 320,
    employeeContribution: 600,
    employerContribution: 510,
    netPay: 5080,
  },
];

const reportBase = {
  organizationId: "org_001",
  countryCode: "MY",
  periodRef: "2026-05",
  legalEntitySetupId: "hr_mcp_entity_001",
  lineItems: sampleLineItems,
} as const;

describe("HRM-MCP-017 statutory reports", () => {
  it("generates statutory CSV with summary totals", () => {
    const result = generateMcpStatutoryReport({
      ...reportBase,
      reportKind: "statutory",
      reportCode: "MY_EPF_SOCso",
    });

    expect(result.generationStatus).toBe("completed");
    expect(result.reportKind).toBe("statutory");
    expect(result.summary.employeeCount).toBe(2);
    expect(result.csvContent).toContain("statutory_reference");
    expect(result.rows).toHaveLength(2);
  });
});

describe("HRM-MCP-018 tax reports", () => {
  it("generates tax CSV including tax_id and tax_withheld columns", () => {
    const result = generateMcpTaxReport({
      ...reportBase,
      reportKind: "tax",
      reportCode: "MY_PCB",
    });

    expect(result.reportKind).toBe("tax");
    expect(result.csvContent).toContain("tax_withheld");
    expect(result.summary.totalTaxWithheld).toBe(770);
  });
});

describe("HRM-MCP-019 contribution reports", () => {
  it("generates contribution CSV and dispatches by kind", () => {
    const direct = generateMcpContributionReport({
      ...reportBase,
      reportKind: "contribution",
      reportCode: "MY_CONTRIB",
    });
    expect(direct.reportKind).toBe("contribution");
    expect(direct.csvContent).toContain("employer_contribution");

    const dispatched = generateMcpReportByKind({
      ...reportBase,
      reportKind: "contribution",
      reportCode: "MY_CONTRIB",
    });
    expect(dispatched.reportKind).toBe("contribution");
  });
});

describe("HRM-MCP-020 payslip fields", () => {
  it("resolves country manifest and flags missing required fields", () => {
    const manifest = resolveDefaultPayslipManifest("MY");
    const resolved = resolvePayslipFields({
      countryCode: "MY",
      manifest: [...manifest],
      values: {
        employee_name: "Aisha Rahman",
        tax_id: "IG123456789",
        epf_employee: 880,
        epf_employer: 968,
        socso_employee: 40,
        net_pay: 6670,
      },
    });

    expect(resolved.some((field) => field.missing)).toBe(false);
    expect(resolved.find((field) => field.fieldKey === "epf_employee")?.statutoryBreakdown).toBe(
      true,
    );
  });

  it("throws when required payslip fields are missing", () => {
    const manifest = resolveDefaultPayslipManifest("SG");
    expect(() =>
      assertPayslipFieldsComplete({
        countryCode: "SG",
        manifest: [...manifest],
        values: {
          employee_name: "Ben Tan",
        },
      }),
    ).toThrow(HrMcpValidationError);
  });
});

describe("HRM-MCP-021 bank payment exports", () => {
  const bankLine = {
    employeeId: "hr_emp_001",
    employeeName: "Aisha Rahman",
    bankCode: "MBB",
    accountNumber: "1234567890",
    sortCode: null,
    amount: 6670,
    currencyCode: "MYR",
    paymentReference: "PAY-2026-05",
  };

  it("builds MY and SG bank CSV exports", () => {
    const myExport = buildBankPaymentExport({
      countryCode: "MY",
      format: "MY_CSV",
      periodRef: "2026-05",
      lines: [bankLine],
    });
    expect(myExport.format).toBe("MY_CSV");
    expect(myExport.content).toContain("bank_code");

    const sgExport = buildBankPaymentExport({
      countryCode: "SG",
      format: "SG_CSV",
      periodRef: "2026-05",
      lines: [{ ...bankLine, currencyCode: "SGD" }],
    });
    expect(sgExport.format).toBe("SG_CSV");
    expect(sgExport.fileName).toContain("giro");
  });

  it("requires sort code for UK bank exports", () => {
    expect(() =>
      buildBankPaymentExport({
        countryCode: "GB",
        format: "UK_CSV",
        periodRef: "2026-05",
        lines: [bankLine],
      }),
    ).toThrow(HrMcpValidationError);

    const ukExport = buildBankPaymentExport({
      countryCode: "GB",
      format: "UK_CSV",
      periodRef: "2026-05",
      lines: [{ ...bankLine, sortCode: "12-34-56", currencyCode: "GBP" }],
    });
    expect(ukExport.content).toContain("sort_code");
  });
});

describe("HRM-MCP-022 vendor exports", () => {
  it("builds statutory portal and payroll vendor CSV files", () => {
    const portal = buildVendorExport({
      countryCode: "MY",
      target: "statutory_portal",
      vendorCode: "LHDN_PORTAL",
      periodRef: "2026-05",
      lines: [
        {
          employeeId: "hr_emp_001",
          employeeName: "Aisha Rahman",
          taxId: "IG123456789",
          statutoryReference: "EPF123456",
          grossPay: 8000,
          netPay: 6670,
          currencyCode: "MYR",
        },
      ],
    });

    expect(portal.target).toBe("statutory_portal");
    expect(portal.content).toContain("statutory_reference");

    const vendor = buildVendorExport({
      countryCode: "SG",
      target: "payroll_vendor",
      vendorCode: "ADP_SG",
      periodRef: "2026-05",
      lines: [
        {
          employeeId: "hr_emp_002",
          employeeName: "Ben Tan",
          taxId: "S1234567A",
          statutoryReference: null,
          grossPay: 6000,
          netPay: 5080,
          currencyCode: "SGD",
        },
      ],
    });

    expect(vendor.target).toBe("payroll_vendor");
    expect(vendor.fileName).toContain("ADP_SG");
  });
});
