import { describe, expect, it } from "vitest";

import { hrWorkforceRecordsReadPermission } from "../../src/employee-management/employee-records-management/hr.workforce.records.contract";
import { buildHrRecordsAssignmentsListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-assignments-list.surface";
import { buildHrRecordsDirectoryListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-directory-list.surface";
import { buildHrRecordsIncompleteListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-incomplete-list.surface";
import { buildHrRecordsAuditTrailListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-audit-trail-list.surface";
import { buildHrRecordsDocumentReferencesListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-document-references-list.surface";
import { buildHrRecordsSeparatedListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-separated-list.surface";
import { buildHrRecordsStatusHistoryListSurface } from "../../src/employee-management/employee-records-management/hr.workforce.records-status-history-list.surface";
import {
  hrRecordsAssignmentsColumnsId,
  hrRecordsAuditTrailColumnsId,
  hrRecordsDirectoryColumnsId,
  hrRecordsDocumentReferencesColumnsId,
  hrRecordsIncompleteColumnsId,
  hrRecordsSeparatedColumnsId,
  hrRecordsStatusHistoryColumnsId,
} from "../../src/employee-management/employee-records-management/hr.workforce.records-surface-columns.shared";
import { hrRecordsAssignmentsSearchParam } from "../../src/employee-management/employee-records-management/hr.workforce.records-assignments-list.surface";
import { hrRecordsAssignmentsSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-assignments-list.surface";
import { hrRecordsAuditTrailSearchParam, hrRecordsAuditTrailSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-audit-trail-list.surface";
import {
  hrRecordsDirectorySearchParam,
  hrRecordsDirectorySurfaceKey,
} from "../../src/employee-management/employee-records-management/hr.workforce.records-directory-list.surface";
import { hrRecordsDocumentReferencesSearchParam, hrRecordsDocumentReferencesSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-document-references-list.surface";
import {
  hrRecordsIncompleteSearchParam,
  hrRecordsIncompleteSurfaceKey,
} from "../../src/employee-management/employee-records-management/hr.workforce.records-incomplete-list.surface";
import { hrRecordsSeparatedSearchParam, hrRecordsSeparatedSurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-separated-list.surface";
import { hrRecordsStatusHistorySearchParam, hrRecordsStatusHistorySurfaceKey } from "../../src/employee-management/employee-records-management/hr.workforce.records-status-history-list.surface";

const emptyWindow = {
  rows: [],
  pageSize: 25,
  totalCount: 0,
  hasNextPage: false,
};

describe("records Pattern C governed list EUI contract", () => {
  const cases = [
    {
      label: "incomplete profiles",
      surfaceKey: hrRecordsIncompleteSurfaceKey,
      searchParam: hrRecordsIncompleteSearchParam,
      columnsId: hrRecordsIncompleteColumnsId,
      build: () =>
        buildHrRecordsIncompleteListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "directory",
      surfaceKey: hrRecordsDirectorySurfaceKey,
      searchParam: hrRecordsDirectorySearchParam,
      columnsId: hrRecordsDirectoryColumnsId,
      build: () =>
        buildHrRecordsDirectoryListSurface({
          window: emptyWindow,
          canViewSensitive: true,
        }),
    },
    {
      label: "assignment history",
      surfaceKey: hrRecordsAssignmentsSurfaceKey,
      searchParam: hrRecordsAssignmentsSearchParam,
      columnsId: hrRecordsAssignmentsColumnsId,
      build: () =>
        buildHrRecordsAssignmentsListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "audit trail",
      surfaceKey: hrRecordsAuditTrailSurfaceKey,
      searchParam: hrRecordsAuditTrailSearchParam,
      columnsId: hrRecordsAuditTrailColumnsId,
      build: () =>
        buildHrRecordsAuditTrailListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "status history",
      surfaceKey: hrRecordsStatusHistorySurfaceKey,
      searchParam: hrRecordsStatusHistorySearchParam,
      columnsId: hrRecordsStatusHistoryColumnsId,
      build: () =>
        buildHrRecordsStatusHistoryListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "document references",
      surfaceKey: hrRecordsDocumentReferencesSurfaceKey,
      searchParam: hrRecordsDocumentReferencesSearchParam,
      columnsId: hrRecordsDocumentReferencesColumnsId,
      build: () =>
        buildHrRecordsDocumentReferencesListSurface({
          window: emptyWindow,
        }),
    },
    {
      label: "separated roster",
      surfaceKey: hrRecordsSeparatedSurfaceKey,
      searchParam: hrRecordsSeparatedSearchParam,
      columnsId: hrRecordsSeparatedColumnsId,
      build: () =>
        buildHrRecordsSeparatedListSurface({
          window: emptyWindow,
        }),
    },
  ] as const;

  for (const testCase of cases) {
    it(`builds ${testCase.label} with governed list contract fields`, () => {
      const surface = testCase.build();

      expect(surface.requiresErpPermission).toEqual(
        hrWorkforceRecordsReadPermission,
      );
      expect(surface.presentation!.toolbar?.search?.param).toBe(
        testCase.searchParam,
      );
      expect(surface.surface.columnsId).toBe(testCase.columnsId);
      expect(surface.surface.rowKey).toBe("id");
    });
  }
});
