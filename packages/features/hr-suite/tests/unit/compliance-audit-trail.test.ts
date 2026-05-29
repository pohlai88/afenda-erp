import { describe, expect, it } from "vitest";

import {
  HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS,
  isHrComplianceAuditAction,
} from "../../src/employee-management/compliance-regulatory-tracking/events/hr.workforce.compliance.audit-emitted.shared";
import {
  formatComplianceAuditActionLabel,
  maskComplianceAuditMetadata,
  resolveComplianceAuditCategory,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance.audit-trail.shared";
import { buildHrComplianceAuditTrailListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-audit-trail-list.surface";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";

describe("compliance audit trail (HRM-CMP-025)", () => {
  it("registers unique emitted audit actions under hr.compliance", () => {
    const unique = new Set(HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS);
    expect(unique.size).toBe(HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS.length);
    for (const action of HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS) {
      expect(action.startsWith("hr.compliance.")).toBe(true);
      expect(isHrComplianceAuditAction(action)).toBe(true);
    }
  });

  it("masks sensitive audit metadata for restricted readers", () => {
    expect(
      maskComplianceAuditMetadata({
        action: "hr.compliance.work_eligibility.status.update",
        canViewSensitive: false,
        metadata: {
          status: "eligible",
          reviewNotes: "Passport verified",
        },
      }),
    ).toEqual({
      status: "eligible",
      reviewNotes: null,
    });
  });

  it("formats audit categories and action labels for the register", () => {
    expect(
      resolveComplianceAuditCategory("hr.compliance.exception.waive"),
    ).toBe("exception");
    expect(
      formatComplianceAuditActionLabel("hr.compliance.filing.status.update"),
    ).toContain("Filing");
  });

  it("builds a governed audit trail list surface", () => {
    const occurredAt = new Date("2026-05-01T12:00:00.000Z");
    const surface = buildHrComplianceAuditTrailListSurface({
      window: {
        rows: [
          {
            id: "audit_1",
            occurredAt,
            action: "hr.compliance.exception.waive",
            category: "exception",
            actorAuthUserId: "user_1",
            targetId: "exc_1",
            summary: "Exception waived.",
            metadata: { waiverReason: "Policy exception approved" },
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(surface.dataNature).toBe("table");
    expect(surface.requiresErpPermission).toEqual(
      hrWorkforceComplianceReadPermission,
    );
    expect(surface.rows[0]?.cells.actionValue).toBe(
      "hr.compliance.exception.waive",
    );
    expect(surface.rows[0]?.cells.occurredAt).toBe(occurredAt.toISOString());
  });

  it("does not emit audit actions for derived read models or page-load auto-sync", () => {
    const forbiddenTokens = [
      "alert",
      "calendar",
      "regulatory_calendar",
      "auto_sync",
      "auto_resolve",
      "auto_create",
    ];

    for (const action of HR_COMPLIANCE_EMITTED_AUDIT_ACTIONS) {
      for (const token of forbiddenTokens) {
        expect(action.includes(token)).toBe(false);
      }
    }
  });
});
