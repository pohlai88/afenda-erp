import { describe, expect, it } from "vitest";

import {
  appliesComplianceObligationToEmployee,
  formatComplianceObligationScope,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-obligation.shared";

describe("HRM-CMP-001 compliance obligation scope", () => {
  it("matches employee when obligation scope dimensions are unset", () => {
    expect(
      appliesComplianceObligationToEmployee(
        {
          countryCode: null,
          legalEntityCode: null,
          workLocationCode: null,
          employmentType: null,
          workerCategory: null,
        },
        {
          countryCode: "MY",
          legalEntityCode: "AFENDA-MY",
          workLocationCode: "KL-HQ",
          employmentType: "permanent",
          workerCategory: "staff",
        },
      ),
    ).toBe(true);
  });

  it("requires all configured scope dimensions to match", () => {
    const obligation = {
      countryCode: "MY",
      legalEntityCode: "AFENDA-MY",
      workLocationCode: "KL-HQ",
      employmentType: "permanent",
      workerCategory: "staff",
    };

    expect(
      appliesComplianceObligationToEmployee(obligation, {
        ...obligation,
      }),
    ).toBe(true);

    expect(
      appliesComplianceObligationToEmployee(obligation, {
        ...obligation,
        workerCategory: "contractor",
      }),
    ).toBe(false);
  });

  it("requires department id to match exactly (case-sensitive)", () => {
    const obligation = {
      countryCode: null,
      legalEntityCode: null,
      workLocationCode: null,
      employmentType: null,
      workerCategory: null,
      departmentId: "dept-abc",
    };

    expect(
      appliesComplianceObligationToEmployee(obligation, {
        countryCode: "MY",
        legalEntityCode: null,
        workLocationCode: null,
        employmentType: null,
        workerCategory: null,
        departmentId: "dept-abc",
      }),
    ).toBe(true);

    expect(
      appliesComplianceObligationToEmployee(obligation, {
        countryCode: "MY",
        legalEntityCode: null,
        workLocationCode: null,
        employmentType: null,
        workerCategory: null,
        departmentId: "DEPT-ABC",
      }),
    ).toBe(false);
  });

  it("matches scope text case-insensitively", () => {
    expect(
      appliesComplianceObligationToEmployee(
        {
          countryCode: "my",
          legalEntityCode: null,
          workLocationCode: null,
          employmentType: null,
          workerCategory: null,
        },
        {
          countryCode: "MY",
          legalEntityCode: null,
          workLocationCode: null,
          employmentType: null,
          workerCategory: null,
        },
      ),
    ).toBe(true);
  });

  it("formats scope labels for obligation register surfaces", () => {
    expect(
      formatComplianceObligationScope({
        countryCode: "MY",
        legalEntityCode: "AFENDA-MY",
        workLocationCode: "KL-HQ",
        employmentType: "permanent",
        workerCategory: "staff",
      }),
    ).toBe("MY · AFENDA-MY · KL-HQ · permanent · staff");

    expect(formatComplianceObligationScope({})).toBe("All employees");
  });
});
