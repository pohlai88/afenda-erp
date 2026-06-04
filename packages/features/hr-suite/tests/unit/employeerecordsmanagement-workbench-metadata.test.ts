import { describe, expect, it } from "vitest";

import {
  HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_RECORDS_LIST_SURFACE_KEYS,
  HR_RECORDS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
} from "../../src/metadata";
import { hrRecordsAssignmentsSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-assignments-list.surface";
import { hrRecordsAuditTrailSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-audit-trail-list.surface";
import { hrRecordsDocumentReferencesSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-document-references-list.surface";
import { hrRecordsStatusHistorySurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-status-history-list.surface";

describe("hr records workbench metadata", () => {
  it("registers historical and reference lists as read-only workbench surfaces", () => {
    expect(HR_RECORDS_WORKBENCH_READ_ONLY_SURFACE_KEYS).toEqual(
      new Set([
        hrRecordsAssignmentsSurfaceKey,
        hrRecordsAuditTrailSurfaceKey,
        hrRecordsStatusHistorySurfaceKey,
        hrRecordsDocumentReferencesSurfaceKey,
      ]),
    );
    expect(HR_RECORDS_LIST_SURFACE_KEYS).toHaveLength(7);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_RECORDS_LIST_SURFACE_KEYS) {
      const paramKey = HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
    expect(
      HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS.recordsEmploymentStatus,
    ).toBe("employmentStatusFilter");
  });
});
