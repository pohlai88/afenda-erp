import { describe, expect, it } from "vitest";

import {
  appliesBenefitEligibilityRuleToEmployee,
  computeEmployeeTenureMonths,
  isEmployeeEligibleForBenefitPlan,
} from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-eligibility.shared";
import { assertOpenEnrollmentChannelAllowed } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-open-enrollment.shared";
import { upsertHrBenefitPlanFormSchema } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-plan.schema";
import { upsertHrBenefitEligibilityRuleFormSchema } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-eligibility.schema";
import { upsertHrBenefitOpenEnrollmentWindowFormSchema } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-open-enrollment.schema";
import { createOpenEnrollmentBenefitEnrollmentFormSchema } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits-enrollment.schema";

describe("upsertHrBenefitPlanFormSchema", () => {
  it("accepts BEN-002 benefit categories", () => {
    const result = upsertHrBenefitPlanFormSchema.safeParse({
      code: "MED-2026",
      name: "Medical PPO",
      category: "health",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown categories", () => {
    const result = upsertHrBenefitPlanFormSchema.safeParse({
      code: "X",
      name: "Bad",
      category: "unknown",
    });
    expect(result.success).toBe(false);
  });
});

describe("upsertHrBenefitEligibilityRuleFormSchema", () => {
  it("accepts tenure and scope dimensions for BEN-003", () => {
    const result = upsertHrBenefitEligibilityRuleFormSchema.safeParse({
      planId: "hr_ben_plan_1",
      countryCode: "MY",
      legalEntityCode: "AFENDA-MY",
      employmentType: "permanent",
      grade: "G5",
      level: "L3",
      minTenureMonths: 6,
    });
    expect(result.success).toBe(true);
  });
});

describe("upsertHrBenefitOpenEnrollmentWindowFormSchema", () => {
  it("rejects enrollment end before start", () => {
    const result = upsertHrBenefitOpenEnrollmentWindowFormSchema.safeParse({
      code: "OE-2026",
      name: "Annual enrollment",
      enrollmentStartAt: "2026-11-01T00:00:00.000Z",
      enrollmentEndAt: "2026-10-01T00:00:00.000Z",
      coverageEffectiveFrom: "2027-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("HRM-BEN-004 eligibility determination", () => {
  const employee = {
    countryCode: "MY",
    legalEntityCode: "AFENDA-MY",
    workLocationCode: "KL",
    employmentType: "permanent",
    workerCategory: "staff",
    grade: "G5",
    level: "L3",
    tenureMonths: 12,
  };

  it("matches when all configured dimensions align", () => {
    const rule = {
      countryCode: "MY",
      legalEntityCode: "AFENDA-MY",
      workLocationCode: "KL",
      employmentType: "permanent",
      workerCategory: "staff",
      grade: "G5",
      level: "L3",
      minTenureMonths: 6,
      maxTenureMonths: null,
    };
    expect(appliesBenefitEligibilityRuleToEmployee(rule, employee)).toBe(true);
    expect(isEmployeeEligibleForBenefitPlan({ rules: [rule], employee })).toBe(
      true,
    );
  });

  it("fails when grade does not match", () => {
    const rule = {
      countryCode: null,
      legalEntityCode: null,
      workLocationCode: null,
      employmentType: null,
      workerCategory: null,
      grade: "G9",
      level: null,
      minTenureMonths: null,
      maxTenureMonths: null,
    };
    expect(appliesBenefitEligibilityRuleToEmployee(rule, employee)).toBe(false);
    expect(isEmployeeEligibleForBenefitPlan({ rules: [rule], employee })).toBe(
      false,
    );
  });

  it("computes tenure months from employment start date", () => {
    const start = new Date("2024-01-15T00:00:00.000Z");
    const asOf = new Date("2025-01-15T00:00:00.000Z");
    expect(computeEmployeeTenureMonths({ employmentStartDate: start, asOf })).toBe(
      12,
    );
  });
});

describe("HRM-BEN-006 open enrollment guard", () => {
  it("blocks open enrollment channel when window is not active", () => {
    expect(
      assertOpenEnrollmentChannelAllowed({
        enrollmentChannel: "open_enrollment",
        windowActive: false,
        planInWindow: true,
      }),
    ).toEqual({ allowed: false, reason: "open_enrollment_closed" });
  });

  it("blocks when plan is not linked to the window", () => {
    expect(
      assertOpenEnrollmentChannelAllowed({
        enrollmentChannel: "open_enrollment",
        windowActive: true,
        planInWindow: false,
      }),
    ).toEqual({
      allowed: false,
      reason: "open_enrollment_plan_not_in_window",
    });
  });

  it("allows new hire channel without an open window", () => {
    expect(
      assertOpenEnrollmentChannelAllowed({
        enrollmentChannel: "new_hire",
        windowActive: false,
        planInWindow: false,
      }),
    ).toEqual({ allowed: true });
  });
});

describe("createOpenEnrollmentBenefitEnrollmentFormSchema", () => {
  it("requires open enrollment window id for BEN-006", () => {
    const result = createOpenEnrollmentBenefitEnrollmentFormSchema.safeParse({
      employeeId: "hr_emp_1",
      planId: "hr_ben_plan_1",
      coverageLevel: "employee_only",
      enrollmentChannel: "open_enrollment",
      coverageStartDate: "2026-06-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
