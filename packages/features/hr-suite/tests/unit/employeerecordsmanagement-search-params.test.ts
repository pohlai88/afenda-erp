import { describe, expect, it } from "vitest";

import { parseHrRecordsSearchParams } from "../../src/employee-management/employee-records-management/hr.workforce.records-search-params.parse.shared";

describe("hr records search params", () => {
  it("returns empty object when search params are undefined", () => {
    expect(parseHrRecordsSearchParams(undefined)).toEqual({});
  });

  it("parses list-specific search params from URL keys", () => {
    expect(
      parseHrRecordsSearchParams({
        recordsIncompleteSearch: "incomplete-query",
        recordsDirectorySearch: "directory-query",
        recordsAssignmentsSearch: "assignments-query",
        recordsAuditTrailSearch: "audit-query",
        recordsStatusHistorySearch: "status-query",
        recordsDocumentReferencesSearch: "docs-query",
        recordsSeparatedSearch: "separated-query",
        recordsEmploymentStatus: "probation",
      }),
    ).toEqual({
      incompleteSearch: "incomplete-query",
      directorySearch: "directory-query",
      assignmentsSearch: "assignments-query",
      auditTrailSearch: "audit-query",
      statusHistorySearch: "status-query",
      documentReferencesSearch: "docs-query",
      separatedSearch: "separated-query",
      employmentStatusFilter: "probation",
    });
  });
});
