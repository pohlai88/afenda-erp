import { classifyComplianceAlert } from "@afenda/db";
import { describe, expect, it } from "vitest";

import {
  formatComplianceAlertKindLabel,
  formatComplianceAlertSeverityLabel,
  formatComplianceAlertSourceKindLabel,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-alerts.shared";
import {
  buildHrComplianceAlertsListSurface,
  hrComplianceAlertsSearchParam,
  hrComplianceAlertsSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-alerts-list.surface";
import {
  resolveComplianceAlertKindBadgeTone,
  resolveComplianceAlertSeverityBadgeTone,
  resolveComplianceAlertSeverityRowTone,
  resolveComplianceAlertSourceKindBadgeTone,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";

describe("hr compliance alerts (HRM-CMP-016)", () => {
  const now = new Date("2026-05-30T12:00:00.000Z");

  it("classifies overdue filings as deadline alerts with critical severity", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "filing",
        sourceStatus: "pending",
        triggerAt: new Date("2026-05-01T00:00:00.000Z"),
        requirementKind: "filing",
        now,
      }),
    ).toEqual({ alertKind: "deadline", severity: "critical" });
  });

  it("classifies missing work authorization documents as overdue-action alerts", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "work_auth_missing",
        sourceStatus: "missing",
        triggerAt: null,
        requirementKind: null,
        now,
      }),
    ).toEqual({ alertKind: "overdue_action", severity: "critical" });
  });

  it("suppresses missing work authorization alerts when linked evidence satisfies HRM-CMP-011", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "work_auth_missing",
        sourceStatus: "pending_verification",
        triggerAt: null,
        requirementKind: null,
        documentNumber: null,
        linkedEvidenceCount: 1,
        now,
      }),
    ).toBeNull();
  });

  it("classifies expiring work authorization renewals as renewal alerts", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "work_auth_renewal",
        sourceStatus: "verified",
        triggerAt: new Date("2026-06-08T00:00:00.000Z"),
        requirementKind: null,
        documentNumber: "WP-100",
        now,
      }),
    ).toEqual({ alertKind: "renewal", severity: "attention" });
  });

  it("classifies expired safety training certifications as expiry alerts", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "employee_requirement",
        sourceStatus: "compliant",
        triggerAt: new Date("2026-05-01T00:00:00.000Z"),
        requirementKind: "training",
        now,
      }),
    ).toEqual({ alertKind: "expiry", severity: "critical" });
  });

  it("classifies overdue policy acknowledgments as overdue-action alerts", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "employee_requirement",
        sourceStatus: "pending",
        triggerAt: new Date("2026-05-01T00:00:00.000Z"),
        requirementKind: "policy_acknowledgement",
        now,
      }),
    ).toEqual({ alertKind: "overdue_action", severity: "critical" });
  });

  it("classifies undated pending policy acknowledgments as overdue-action alerts", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "employee_requirement",
        sourceStatus: "pending",
        triggerAt: null,
        requirementKind: "policy_acknowledgement",
        now,
      }),
    ).toEqual({ alertKind: "overdue_action", severity: "critical" });
  });

  it("ignores undated pending labor law requirements", () => {
    expect(
      classifyComplianceAlert({
        sourceKind: "employee_requirement",
        sourceStatus: "compliant",
        triggerAt: new Date("2026-12-01T00:00:00.000Z"),
        requirementKind: "labor_law",
        now,
      }),
    ).toBeNull();
  });

  it("formats alert labels for governed grid cells", () => {
    expect(formatComplianceAlertKindLabel("deadline")).toBe("Deadline");
    expect(formatComplianceAlertSeverityLabel("critical")).toBe("Critical");
    expect(formatComplianceAlertSourceKindLabel("work_auth_missing")).toBe(
      "Missing work authorization document",
    );
  });

  it("maps alert severity and kinds to governed badge tones", () => {
    expect(resolveComplianceAlertSeverityBadgeTone("critical")).toBe("critical");
    expect(resolveComplianceAlertSeverityRowTone("attention")).toBe("attention");
    expect(resolveComplianceAlertKindBadgeTone("expiry")).toBe("critical");
    expect(resolveComplianceAlertSourceKindBadgeTone("work_auth_missing")).toBe(
      "critical",
    );
  });

  it("builds alerts list surface with severity-first columns and serialized values", () => {
    const configuration = buildHrComplianceAlertsListSurface({
      window: {
        rows: [
          {
            id: "filing:fil_1",
            alertKind: "deadline",
            severity: "critical",
            sourceKind: "filing",
            triggerAt: new Date("2026-05-01T00:00:00.000Z"),
            title: "EPF-01 · Monthly EPF submission",
            subjectLabel: null,
            complianceArea: "statutory",
            sourceStatus: "pending",
            requirementKind: "filing",
            employeeId: null,
          },
          {
            id: "work_auth_missing:wad_1",
            alertKind: "overdue_action",
            severity: "critical",
            sourceKind: "work_auth_missing",
            triggerAt: null,
            title: "Missing work permit",
            subjectLabel: "E-1001 · Alex Operator",
            complianceArea: "work_authorization",
            sourceStatus: "missing",
            requirementKind: null,
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

    expect(hrComplianceAlertsSurfaceKey).toBe(
      "hr.workforce.compliance.alerts.list",
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceAlertsSearchParam,
    );
    expect(configuration.requiresErpPermission).toBe(
      hrWorkforceComplianceReadPermission,
    );
    expect(configuration.presentation?.primaryColumnId).toBe("severity");
    expect(configuration.columns?.[0]?.id).toBe("severity");
    expect(configuration.rows?.[0]?.cells?.alertKindValue).toBe("deadline");
    expect(configuration.rows?.[0]?.cells?.severityValue).toBe("critical");
    expect(configuration.rows?.[1]?.rowHref).toContain("emp_1");
    expect(configuration.rows?.[1]?.cells?.effectiveSourceStatusValue).toBe(
      "missing",
    );
  });

  it("derives non-missing work authorization alert status when linked evidence is present", () => {
    const configuration = buildHrComplianceAlertsListSurface({
      window: {
        rows: [
          {
            id: "work_auth_missing:wad_linked",
            alertKind: "overdue_action",
            severity: "critical",
            sourceKind: "work_auth_missing",
            triggerAt: null,
            title: "Missing work permit",
            subjectLabel: "E-1001 · Alex Operator",
            complianceArea: "work_authorization",
            sourceStatus: "pending_verification",
            requirementKind: null,
            employeeId: "emp_1",
            documentNumber: null,
            linkedEvidenceCount: 1,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        mergeTruncated: false,
      },
    });

    expect(configuration.rows?.[0]?.cells?.effectiveSourceStatusValue).toBe(
      "pending_verification",
    );
  });
});
