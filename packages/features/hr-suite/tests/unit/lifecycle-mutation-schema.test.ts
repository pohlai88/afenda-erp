import { describe, expect, it } from "vitest";

import { parseHrLifecycleProbationOutcomeForm } from "../../src/employee-management/employee-lifecycle-management/schemas/hr.workforce.lifecycle-probation.schema";
import { parseHrLifecycleMovementForm } from "../../src/employee-management/employee-lifecycle-management/schemas/hr.workforce.lifecycle-movement.schema";
import { parseHrLifecycleNoticePeriodForm } from "../../src/employee-management/employee-lifecycle-management/schemas/hr.workforce.lifecycle-exit.schema";
import {
  parseHrLifecycleCancelTransitionForm,
  parseHrLifecycleScheduleStatusChangeForm,
} from "../../src/employee-management/employee-lifecycle-management/schemas/hr.workforce.lifecycle-transition.schema";

describe("lifecycle mutation schemas", () => {
  it("parses schedule status change with stored enum only", () => {
    const formData = new FormData();
    formData.set("employeeId", "emp-1");
    formData.set("toStatus", "probation");
    formData.set("reason", "Policy change");

    const parsed = parseHrLifecycleScheduleStatusChangeForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.toStatus).toBe("probation");
      expect(parsed.data.employeeId).toBe("emp-1");
    }
  });

  it("rejects derived or invalid status tokens on write", () => {
    const formData = new FormData();
    formData.set("employeeId", "emp-1");
    formData.set("toStatus", "overdue");

    expect(parseHrLifecycleScheduleStatusChangeForm(formData).success).toBe(
      false,
    );
  });

  it("requires reason for separation-related status changes", () => {
    const formData = new FormData();
    formData.set("employeeId", "emp-1");
    formData.set("toStatus", "separated");

    expect(parseHrLifecycleScheduleStatusChangeForm(formData).success).toBe(
      false,
    );

    formData.set("reason", "End of contract");
    expect(parseHrLifecycleScheduleStatusChangeForm(formData).success).toBe(
      true,
    );
  });

  it("requires probation end date when extending probation", () => {
    const formData = new FormData();
    formData.set("employeeId", "emp-1");
    formData.set("outcome", "extended");

    expect(parseHrLifecycleProbationOutcomeForm(formData).success).toBe(false);

    formData.set("probationEndDate", "2026-12-31");
    expect(parseHrLifecycleProbationOutcomeForm(formData).success).toBe(true);
  });

  it("requires reason to initiate notice period", () => {
    const formData = new FormData();
    formData.set("employeeId", "emp-1");

    expect(parseHrLifecycleNoticePeriodForm(formData).success).toBe(false);

    formData.set("reason", "Resignation accepted");
    expect(parseHrLifecycleNoticePeriodForm(formData).success).toBe(true);
  });

  it("parses movement form with placement fields", () => {
    const formData = new FormData();
    formData.set("employeeId", "emp-1");
    formData.set("movementKind", "transfer");
    formData.set("currentDepartmentId", "dept-1");

    const parsed = parseHrLifecycleMovementForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.movementKind).toBe("transfer");
      expect(parsed.data.currentDepartmentId).toBe("dept-1");
    }
  });

  it("parses cancel transition by id", () => {
    const formData = new FormData();
    formData.set("transitionId", "trn-1");

    const parsed = parseHrLifecycleCancelTransitionForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.transitionId).toBe("trn-1");
    }
  });
});
