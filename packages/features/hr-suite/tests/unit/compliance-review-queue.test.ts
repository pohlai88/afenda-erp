import { describe, expect, it } from "vitest";

import {
  formatComplianceReviewQueueEntryKindLabel,
  formatComplianceReviewQueueRequiredActionLabel,
  isSensitiveComplianceReviewQueueEntryKind,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-review-queue.shared";
import {
  buildHrComplianceReviewQueueListSurface,
  hrComplianceReviewQueueSearchParam,
  hrComplianceReviewQueueSurfaceKey,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-review-queue-list.surface";
import { hrWorkforceComplianceReadPermission } from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance.contract";

describe("hr compliance review queue (HRM-CMP-021)", () => {
  const queuedAt = new Date("2026-05-30T09:00:00.000Z");

  it("formats entry kind and required-action labels", () => {
    expect(formatComplianceReviewQueueEntryKindLabel("filing_confirmation")).toBe(
      "Filing confirmation",
    );
    expect(
      formatComplianceReviewQueueRequiredActionLabel("work_auth_verification"),
    ).toBe("Verify document");
    expect(
      isSensitiveComplianceReviewQueueEntryKind("work_eligibility_verification"),
    ).toBe(true);
    expect(isSensitiveComplianceReviewQueueEntryKind("filing_confirmation")).toBe(
      false,
    );
  });

  it("builds governed list surface with registry metadata", () => {
    const configuration = buildHrComplianceReviewQueueListSurface({
      window: {
        rows: [],
        pageSize: 25,
        totalCount: 0,
        hasNextPage: false,
        mergeTruncated: false,
      },
      searchValue: "filing",
      canWrite: true,
    });

    expect(configuration.dataNature).toBe("table");
    expect(configuration.requiresErpPermission).toEqual(
      hrWorkforceComplianceReadPermission,
    );
    expect(configuration.presentation?.toolbar?.search?.param).toBe(
      hrComplianceReviewQueueSearchParam,
    );
    expect(configuration.surface?.columnsId).toBe(
      "hr.workforce.compliance.review-queue",
    );
  });

  it("masks confidential evidence titles without sensitive read", () => {
    const configuration = buildHrComplianceReviewQueueListSurface({
      window: {
        rows: [
          {
            id: "review:evidence_acknowledgment:ev_1",
            entryKind: "evidence_acknowledgment",
            sourceRecordId: "ev_1",
            queuedAt,
            title: "Passport scan",
            subjectLabel: "E-100 · Alex Operator",
            complianceArea: "immigration",
            sourceStatus: "submitted",
            employeeId: "emp_1",
            documentClassification: "confidential",
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        mergeTruncated: false,
      },
      canWrite: true,
      canViewSensitive: false,
    });

    const row = configuration.rows[0]!;
    expect(row.cells.title).not.toBe("Passport scan");
    expect(row.trailingAction).toBeUndefined();
  });

  it("exposes trailing approve/reject for sensitive rows when write and sensitive read are granted", () => {
    const configuration = buildHrComplianceReviewQueueListSurface({
      window: {
        rows: [
          {
            id: "review:work_eligibility_verification:we_1",
            entryKind: "work_eligibility_verification",
            sourceRecordId: "we_1",
            queuedAt,
            title: "Work permit verification",
            subjectLabel: "E-100 · Alex Operator",
            complianceArea: "immigration",
            sourceStatus: "pending_verification",
            employeeId: "emp_1",
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        mergeTruncated: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    const row = configuration.rows[0]!;
    expect(row.cells.entryKindValue).toBe("work_eligibility_verification");
    expect(row.cells.sourceRecordIdValue).toBe("we_1");
    expect(row.trailingAction?.state).toBe("ready");
  });

  it("uses stable surface key identifier", () => {
    expect(hrComplianceReviewQueueSurfaceKey).toBe(
      "hr.workforce.compliance.review-queue.list",
    );
  });
});
