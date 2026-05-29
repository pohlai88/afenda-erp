import { describe, expect, it } from "vitest";

import {
  deriveRegulatoryCalendarEffectiveSourceStatus,
  deriveRegulatoryCalendarPosture,
  formatRegulatoryCalendarEntryKindLabel,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-regulatory-calendar.shared";
import {
  buildHrComplianceRegulatoryCalendarListSurface,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceRegulatoryCalendarSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-regulatory-calendar-list.surface";
import {
  resolveRegulatoryCalendarEntryKindBadgeTone,
  resolveRegulatoryCalendarPostureBadgeTone,
  resolveRegulatoryCalendarPostureRowTone,
  resolveRegulatoryCalendarSourceStatusBadgeTone,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";

describe("hr compliance regulatory calendar (HRM-CMP-010)", () => {
  it("derives overdue, due today, and upcoming posture from UTC calendar-day boundaries", () => {
    const now = new Date("2026-05-30T12:00:00.000Z");

    expect(
      deriveRegulatoryCalendarPosture({
        deadlineAt: new Date("2026-05-29T12:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");

    expect(
      deriveRegulatoryCalendarPosture({
        deadlineAt: new Date("2026-05-30T08:00:00.000Z"),
        now,
      }),
    ).toBe("due_today");

    expect(
      deriveRegulatoryCalendarPosture({
        deadlineAt: new Date("2026-05-31T12:00:00.000Z"),
        now,
      }),
    ).toBe("upcoming");
  });

  it("derives effective source status from stored status and deadline", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");
    const pastDeadline = new Date("2026-05-01T00:00:00.000Z");

    expect(
      deriveRegulatoryCalendarEffectiveSourceStatus({
        entryKind: "filing",
        sourceStatus: "pending",
        deadlineAt: pastDeadline,
        requirementKind: "filing",
        now,
      }),
    ).toBe("overdue");

    expect(
      deriveRegulatoryCalendarEffectiveSourceStatus({
        entryKind: "employee_requirement",
        sourceStatus: "pending",
        deadlineAt: pastDeadline,
        requirementKind: "labor_law",
        now,
      }),
    ).toBe("overdue");

    expect(
      deriveRegulatoryCalendarEffectiveSourceStatus({
        entryKind: "work_eligibility_renewal",
        sourceStatus: "eligible",
        deadlineAt: pastDeadline,
        requirementKind: null,
        now,
      }),
    ).toBe("expired");

    expect(
      deriveRegulatoryCalendarEffectiveSourceStatus({
        entryKind: "work_auth_renewal",
        sourceStatus: "verified",
        deadlineAt: pastDeadline,
        documentNumber: "WP-100",
        requirementKind: null,
        now,
      }),
    ).toBe("expired");

    expect(
      deriveRegulatoryCalendarEffectiveSourceStatus({
        entryKind: "work_auth_renewal",
        sourceStatus: "verified",
        deadlineAt: pastDeadline,
        documentNumber: null,
        requirementKind: null,
        now,
      }),
    ).toBe("missing");
  });

  it("formats entry kind labels for the calendar grid", () => {
    expect(formatRegulatoryCalendarEntryKindLabel("filing")).toBe(
      "Mandatory filing",
    );
    expect(formatRegulatoryCalendarEntryKindLabel("corrective_action")).toBe(
      "Corrective action",
    );
  });

  it("maps posture to governed badge tones", () => {
    expect(resolveRegulatoryCalendarPostureBadgeTone("overdue")).toBe(
      "critical",
    );
    expect(resolveRegulatoryCalendarPostureBadgeTone("due_today")).toBe(
      "attention",
    );
    expect(resolveRegulatoryCalendarPostureBadgeTone("upcoming")).toBe(
      "default",
    );
    expect(resolveRegulatoryCalendarPostureRowTone("overdue")).toBe("critical");
  });

  it("maps entry kind and derived source status to governed badge tones", () => {
    expect(
      resolveRegulatoryCalendarSourceStatusBadgeTone({
        entryKind: "filing",
        effectiveSourceStatus: "overdue",
      }),
    ).toBe("critical");
    expect(
      resolveRegulatoryCalendarSourceStatusBadgeTone({
        entryKind: "corrective_action",
        effectiveSourceStatus: "open",
      }),
    ).toBe("attention");
    expect(resolveRegulatoryCalendarEntryKindBadgeTone("corrective_action")).toBe(
      "critical",
    );
    expect(resolveRegulatoryCalendarEntryKindBadgeTone("filing")).toBe(
      "attention",
    );
  });

  it("builds regulatory calendar list surface with search toolbar and deadline-first columns", () => {
    const configuration = buildHrComplianceRegulatoryCalendarListSurface({
      window: {
        rows: [
          {
            id: "filing:fil_1",
            entryKind: "filing",
            deadlineAt: new Date("2026-06-01T00:00:00.000Z"),
            title: "EPF-01 · Monthly EPF submission",
            subjectLabel: null,
            complianceArea: "statutory",
            sourceStatus: "pending",
            requirementKind: "filing",
            employeeId: null,
          },
          {
            id: "requirement:req_1",
            entryKind: "employee_requirement",
            deadlineAt: new Date("2026-06-15T00:00:00.000Z"),
            title: "SAF-01 · Fire safety induction",
            subjectLabel: "E-1001 · Alex Operator",
            complianceArea: "safety",
            sourceStatus: "pending",
            requirementKind: "training",
            employeeId: "emp_1",
          },
        ],
        pageSize: 25,
        totalCount: 2,
        hasNextPage: false,
        mergeTruncated: false,
      },
      searchValue: "epf",
    });

    expect(hrComplianceRegulatoryCalendarSurfaceKey).toBe(
      "hr.workforce.compliance.regulatory-calendar.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceRegulatoryCalendarSearchParam,
    );
    expect(configuration.requiresErpPermission).toBe(
      hrWorkforceComplianceReadPermission,
    );
    expect(configuration.presentation?.primaryColumnId).toBe("deadlineAt");
    expect(configuration.columns?.[0]?.id).toBe("deadlineAt");
    expect(configuration.rows?.[0]?.cells.title).toContain("EPF-01");
    expect(configuration.rows?.[1]?.rowHref).toContain("emp_1");
  });

  it("serializes derived overdue source status for pending requirements past due", () => {
    const configuration = buildHrComplianceRegulatoryCalendarListSurface({
      window: {
        rows: [
          {
            id: "requirement:req_overdue",
            entryKind: "employee_requirement",
            deadlineAt: new Date("2026-01-01T00:00:00.000Z"),
            title: "LAB-01 · Statutory notice",
            subjectLabel: "E-1001 · Alex Operator",
            complianceArea: "labor_law",
            sourceStatus: "pending",
            requirementKind: "labor_law",
            employeeId: "emp_1",
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        mergeTruncated: false,
      },
    });

    expect(configuration.rows?.[0]?.cells?.sourceStatus).toBe("Overdue");
    expect(configuration.rows?.[0]?.cells?.effectiveSourceStatusValue).toBe(
      "overdue",
    );
    expect(configuration.rows?.[0]?.cells?.storedSourceStatusValue).toBe(
      "pending",
    );
    expect(configuration.rows?.[0]?.cellKinds?.sourceStatus).toEqual({
      kind: "badge",
      tone: "critical",
    });
    expect(configuration.rows?.[0]?.cellKinds?.entryKind).toEqual({
      kind: "badge",
      tone: "default",
    });
  });
});
