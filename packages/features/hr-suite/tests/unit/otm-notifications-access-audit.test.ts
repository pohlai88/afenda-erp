import { describe, expect, it } from "vitest";

import { HRM_OTM_AUDIT } from "../../src/time-attendance/overtime-management/hr.time.otm.event";
import {
  buildHrTimeOtmModulePath,
  buildHrTimeOtmNotificationCopy,
} from "../../src/time-attendance/overtime-management/hr.time.otm-notification-templates.shared";
import { HR_OTM_REPORT_GROUP_BY_OPTIONS } from "../../src/time-attendance/overtime-management/hr.time.otm.schema";

describe("HRM-OTM-026 notification copy", () => {
  it("builds submitted and approved lifecycle titles", () => {
    expect(buildHrTimeOtmNotificationCopy({ kind: "request_submitted" }).title).toBe(
      "Overtime request submitted",
    );
    expect(buildHrTimeOtmNotificationCopy({ kind: "request_approved" }).title).toBe(
      "Overtime request approved",
    );
    expect(buildHrTimeOtmNotificationCopy({ kind: "payroll_ready" }).title).toBe(
      "Overtime payroll ready",
    );
  });

  it("includes work date in body when provided", () => {
    const copy = buildHrTimeOtmNotificationCopy({
      kind: "request_overdue",
      employeeDisplayName: "Alex",
      workDate: new Date("2026-05-15T00:00:00.000Z"),
    });
    expect(copy.body).toContain("2026-05-15");
    expect(copy.body).toContain("Alex");
  });

  it("builds locale-internal overtime module path", () => {
    expect(buildHrTimeOtmModulePath("acme", "en")).toBe(
      "/en/o/acme/apps/hrm/overtime",
    );
  });
});

describe("HRM-OTM-027 report dimensions", () => {
  it("exposes all required group-by dimensions", () => {
    const values = HR_OTM_REPORT_GROUP_BY_OPTIONS.map((option) => option.value);
    expect(values).toEqual(
      expect.arrayContaining([
        "employee",
        "department",
        "manager",
        "cost_center",
        "legal_entity",
        "location",
        "overtime_type",
        "status",
        "period",
      ]),
    );
  });
});

describe("HRM-OTM-029 audit contract", () => {
  it("maps lifecycle mutations to erp.hrm.overtime audit strings", () => {
    expect(HRM_OTM_AUDIT.request.submit).toBe("erp.hrm.overtime.request.submit");
    expect(HRM_OTM_AUDIT.request.cancel).toBe("erp.hrm.overtime.request.cancel");
    expect(HRM_OTM_AUDIT.request.adjust).toBe("erp.hrm.overtime.request.adjust");
    expect(HRM_OTM_AUDIT.eligibility.validate).toBe(
      "erp.hrm.overtime.eligibility.validate",
    );
    expect(HRM_OTM_AUDIT.payroll.export).toBe("erp.hrm.overtime.payroll.export");
    expect(HRM_OTM_AUDIT.calculation.apply).toBe(
      "erp.hrm.overtime.calculation.apply",
    );
  });
});
