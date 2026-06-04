import { describe, expect, it } from "vitest";

import { HR_TIME_AAT_AUDIT_MODULE_KEY } from "../src/time-attendance/absence-analytics-trends/hr.time.aat.contract";
import { hrTimeAatAuditActions } from "../src/time-attendance/absence-analytics-trends/hr.time.aat.event";

describe("HRM-AAT-029 audit trail contract", () => {
  it("filters audit logs by hr.aat module key", () => {
    expect(HR_TIME_AAT_AUDIT_MODULE_KEY).toBe("hr.aat");
    expect(hrTimeAatAuditActions.report.generated.startsWith("hr.aat.")).toBe(
      true,
    );
  });

  it("includes all required audit event types", () => {
    const required = [
      hrTimeAatAuditActions.analytics.generated,
      hrTimeAatAuditActions.analytics.snapshotPersisted,
      hrTimeAatAuditActions.threshold.updated,
      hrTimeAatAuditActions.report.exported,
      hrTimeAatAuditActions.risk.reviewed,
      hrTimeAatAuditActions.correctiveAction.linked,
    ];
    for (const action of required) {
      expect(action).toMatch(/^hr\.aat\./);
    }
  });
});
