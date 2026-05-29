import { describe, expect, it } from "vitest";

import {
  HRM_COMPLIANCE_REQUIREMENT_STATUSES,
  HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES,
  deriveEffectiveLaborLawRequirementStatus,
  deriveEffectiveSafetyTrainingRequirementStatus,
  normalizeRequirementStatusForTrailingSelect,
  worstComplianceRequirementStatus,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-status.shared";
import {
  resolveLaborLawRequirementListBadgeTone,
  resolvePolicyAcknowledgementListBadgeTone,
  resolveSafetyTrainingRequirementListBadgeTone,
  resolveWorkplaceSafetyRequirementListBadgeTone,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";
import { updateHrEmployeeLaborLawRequirementFormSchema } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-requirement-trailing.schema";

describe("HRM-CMP-015 compliance requirement status classification", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("declares all seven effective posture tokens", () => {
    expect(HRM_COMPLIANCE_REQUIREMENT_STATUSES).toEqual([
      "compliant",
      "pending",
      "at_risk",
      "overdue",
      "expired",
      "waived",
      "non_compliant",
    ]);
  });

  it("restricts trailing mutations to stored workflow statuses", () => {
    expect(HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES).toEqual([
      "compliant",
      "pending",
      "expired",
      "waived",
      "non_compliant",
    ]);
  });

  it("derives overdue and at_risk from pending due dates", () => {
    expect(
      deriveEffectiveLaborLawRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
    expect(
      deriveEffectiveLaborLawRequirementStatus({
        status: "pending",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe("at_risk");
  });

  it("derives expired certification posture from compliant rows", () => {
    expect(
      deriveEffectiveSafetyTrainingRequirementStatus({
        status: "compliant",
        dueDate: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("preserves terminal stored statuses", () => {
    for (const status of [
      "compliant",
      "waived",
      "non_compliant",
      "expired",
    ] as const) {
      expect(
        deriveEffectiveLaborLawRequirementStatus({
          status,
          dueDate: new Date("2026-01-01T00:00:00.000Z"),
          now,
        }),
      ).toBe(status);
    }
  });

  it("normalizes derived-only statuses for trailing selects", () => {
    expect(normalizeRequirementStatusForTrailingSelect("overdue")).toBe("pending");
    expect(normalizeRequirementStatusForTrailingSelect("at_risk")).toBe("pending");
    expect(normalizeRequirementStatusForTrailingSelect("non_compliant")).toBe(
      "non_compliant",
    );
  });

  it("rejects derived-only statuses on mutation forms", () => {
    expect(
      updateHrEmployeeLaborLawRequirementFormSchema.safeParse({
        requirementId: "00000000-0000-4000-8000-000000000001",
        status: "overdue",
        reviewNotes: null,
      }).success,
    ).toBe(false);
    expect(
      updateHrEmployeeLaborLawRequirementFormSchema.safeParse({
        requirementId: "00000000-0000-4000-8000-000000000001",
        status: "at_risk",
        reviewNotes: null,
      }).success,
    ).toBe(false);
  });

  it("maps every effective posture to governed list badge tone", () => {
    for (const status of HRM_COMPLIANCE_REQUIREMENT_STATUSES) {
      expect(resolveLaborLawRequirementListBadgeTone(status)).toBeTruthy();
      expect(resolvePolicyAcknowledgementListBadgeTone(status)).toBeTruthy();
      expect(resolveSafetyTrainingRequirementListBadgeTone(status)).toBeTruthy();
      expect(resolveWorkplaceSafetyRequirementListBadgeTone(status)).toBeTruthy();
    }
  });

  it("selects worst posture across employee requirements", () => {
    expect(
      worstComplianceRequirementStatus([
        "compliant",
        "waived",
        "at_risk",
        "non_compliant",
      ]),
    ).toBe("non_compliant");
  });
});
