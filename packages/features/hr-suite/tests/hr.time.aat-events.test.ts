import { describe, expect, it } from "vitest";

import {
  HR_AAT_EMITTED_AUDIT_ACTIONS,
  hrTimeAatAuditActions,
  isHrAatAuditAction,
} from "../events/hr.time.aat.event";
import { HR_TIME_AAT_AUDIT_MODULE_KEY } from "../contracts/hr.time.aat.contract";

describe("hr.time.aat.event", () => {
  it("uses hr.aat.* audit prefix for moduleKey search", () => {
    for (const action of HR_AAT_EMITTED_AUDIT_ACTIONS) {
      expect(action.startsWith(`${HR_TIME_AAT_AUDIT_MODULE_KEY}.`)).toBe(true);
    }
  });

  it("covers HRM-AAT-029 audit categories", () => {
    expect(hrTimeAatAuditActions.analytics.generated).toBe(
      "hr.aat.analytics.generated",
    );
    expect(hrTimeAatAuditActions.analytics.snapshotPersisted).toBe(
      "hr.aat.analytics.snapshot.persisted",
    );
    expect(hrTimeAatAuditActions.threshold.updated).toBe(
      "hr.aat.threshold.updated",
    );
    expect(hrTimeAatAuditActions.report.exported).toBe("hr.aat.report.exported");
    expect(hrTimeAatAuditActions.risk.reviewed).toBe("hr.aat.risk.reviewed");
    expect(hrTimeAatAuditActions.correctiveAction.linked).toBe(
      "hr.aat.corrective_action.linked",
    );
    expect(hrTimeAatAuditActions.notification.enqueued).toBe(
      "hr.aat.notification.enqueued",
    );
  });

  it("validates known audit actions", () => {
    expect(isHrAatAuditAction("hr.aat.report.generated")).toBe(true);
    expect(isHrAatAuditAction("hr.lam.leave.submit")).toBe(false);
  });
});
