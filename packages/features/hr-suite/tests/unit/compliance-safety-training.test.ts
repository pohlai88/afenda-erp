import { describe, expect, it } from "vitest";

import { deriveEffectiveSafetyTrainingRequirementStatus, isSafetyTrainingOverdue } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-status.shared";
import { formatComplianceDateTimeLocalInput } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-form.shared";
import { resolveSafetyTrainingRequirementListBadgeTone } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";
import {
  buildHrComplianceSafetyTrainingRequirementsListSurface,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceSafetyTrainingSearchParam,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";

describe("HRM-CMP-007 safety training requirement status", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("derives overdue from pending when training due date is in the past", () => {
    expect(
      deriveEffectiveSafetyTrainingRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
  });

  it("marks compliant training expired when certification expiry is past", () => {
    expect(
      deriveEffectiveSafetyTrainingRequirementStatus({
        status: "compliant",
        dueDate: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("marks compliant training at risk within 14 days of certification expiry", () => {
    expect(
      deriveEffectiveSafetyTrainingRequirementStatus({
        status: "compliant",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe("at_risk");
  });

  it("maps expired certification posture to critical list badge tone", () => {
    expect(resolveSafetyTrainingRequirementListBadgeTone("expired")).toBe(
      "critical",
    );
  });

  it("maps overdue training posture to critical list badge tone", () => {
    expect(resolveSafetyTrainingRequirementListBadgeTone("overdue")).toBe(
      "critical",
    );
  });

  it("flags overdue training when pending requirement is past due", () => {
    expect(
      isSafetyTrainingOverdue({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe(true);
  });

  it("builds overdue safety training list with critical row tone", () => {
    const configuration = buildHrComplianceSafetyTrainingRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_st_overdue",
            employeeId: "emp_3",
            employeeNumber: "E-300",
            employeeDisplayName: "Sam Operator",
            obligationId: "obl_3",
            obligationCode: "ST-03",
            obligationTitle: "Fire safety training",
            complianceArea: "training",
            requirementKind: "training",
            status: "pending",
            dueDate: new Date("2026-05-01T00:00:00.000Z"),
            completedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(configuration.rows[0]?.cells?.effectiveStatusValue).toBe("overdue");
    expect(configuration.rows[0]?.rowTone).toBe("critical");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("builds safety training list with toolbar, kind column, and trailing metadata", () => {
    const dueDate = new Date("2026-06-10T00:00:00.000Z");
    const configuration = buildHrComplianceSafetyTrainingRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_st_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_1",
            obligationCode: "ST-01",
            obligationTitle: "Forklift certification",
            complianceArea: "training",
            requirementKind: "training",
            status: "pending",
            dueDate,
            completedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(hrComplianceSafetyTrainingRequirementsSurfaceKey).toBe(
      "hr.workforce.compliance.safety-training-requirements.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceSafetyTrainingSearchParam,
    );
    expect(configuration.rows[0]?.rowHref).toBe("/hr/records/emp_1");
    expect(configuration.rows[0]?.cells.kind).toBe("Training");
    expect(configuration.rows[0]?.cells.dueDateInput).toBe(
      formatComplianceDateTimeLocalInput(dueDate),
    );
    expect(configuration.rows[0]?.cells.statusValue).toBe("pending");
    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("keeps trailing actions visible for compliant rows so certifications can be renewed", () => {
    const configuration = buildHrComplianceSafetyTrainingRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_st_2",
            employeeId: "emp_2",
            employeeNumber: "E-200",
            employeeDisplayName: "Jordan Lead",
            obligationId: "obl_2",
            obligationCode: "ST-02",
            obligationTitle: "First aid certification",
            complianceArea: "training",
            requirementKind: "training",
            status: "compliant",
            dueDate: new Date("2027-01-01T00:00:00.000Z"),
            completedAt: new Date("2026-01-01T00:00:00.000Z"),
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(configuration.rows[0]?.trailingAction?.state).toBe("ready");
  });
});
