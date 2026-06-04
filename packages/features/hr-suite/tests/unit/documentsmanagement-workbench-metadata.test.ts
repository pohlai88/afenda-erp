import { describe, expect, it } from "vitest";

import {
  HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_DOCUMENTS_LIST_SURFACE_KEYS,
  HR_DOCUMENTS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrDocumentsMissingSurfaceKey,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsAuditTrailSurfaceKey,
} from "../../src/metadata";
import { parseHrDocumentsSearchParams } from "../../src/employee-management/documents-management/hr.workforce.documents-search-params.parse.shared";

describe("hr documents workbench metadata", () => {
  it("marks missing, expiring, and audit trail as read-only Pattern C surfaces", () => {
    expect(
      HR_DOCUMENTS_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
        hrDocumentsMissingSurfaceKey,
      ),
    ).toBe(true);
    expect(
      HR_DOCUMENTS_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
        hrDocumentsExpiringSurfaceKey,
      ),
    ).toBe(true);
    expect(
      HR_DOCUMENTS_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
        hrDocumentsAuditTrailSurfaceKey,
      ),
    ).toBe(true);
  });

  it("maps every list surface key to a columns registry entry", () => {
    for (const surfaceKey of HR_DOCUMENTS_LIST_SURFACE_KEYS) {
      const columnsId = HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY[surfaceKey];
      expect(columnsId).toMatch(/\.columns$/);
    }
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_DOCUMENTS_LIST_SURFACE_KEYS) {
      const paramKey = HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
  });

  it("parses list-specific search params from the metadata registry", () => {
    const paramEntries = HR_DOCUMENTS_LIST_SURFACE_KEYS.map((surfaceKey) => {
      const paramKey = HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      return [paramKey, `${surfaceKey}-query`] as const;
    });

    expect(
      parseHrDocumentsSearchParams(Object.fromEntries(paramEntries)),
    ).toEqual({
      repositorySearch: "hr.workforce.documents.repository.list-query",
      requirementsSearch: "hr.workforce.documents.requirements.list-query",
      missingSearch: "hr.workforce.documents.missing.list-query",
      expiringSearch: "hr.workforce.documents.expiring.list-query",
      retentionSearch: "hr.workforce.documents.retention.list-query",
      auditTrailSearch: "hr.workforce.documents.audit-trail.list-query",
      acknowledgmentsSearch:
        "hr.workforce.documents.acknowledgments.list-query",
    });
  });
});
