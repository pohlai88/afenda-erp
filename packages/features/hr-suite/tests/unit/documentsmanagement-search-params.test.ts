import { describe, expect, it } from "vitest";

import {
  parseHrDocumentsSearchParams,
  toHrDocumentsPageModelInput,
} from "../../src/employee-management/documents-management/data/hr.workforce.documents-search-params.parse.shared";

describe("hr documents search params", () => {
  it("returns empty object when search params are undefined", () => {
    expect(parseHrDocumentsSearchParams(undefined)).toEqual({});
  });

  it("reads repository search from URL param", () => {
    expect(
      parseHrDocumentsSearchParams({
        documentsRepositorySearch: " passport ",
      }),
    ).toEqual({
      repositorySearch: "passport",
    });
  });

  it("normalizes all governed list search params for the page model", () => {
    expect(
      toHrDocumentsPageModelInput({
        organizationId: "org_1",
        canWrite: true,
        canViewSensitive: false,
        searchParams: {
          documentsRepositorySearch: " repository ",
          documentsRequirementsSearch: " requirements ",
          documentsMissingSearch: " missing ",
          documentsExpiringSearch: " expiring ",
          documentsRetentionSearch: " retention ",
          documentsAuditTrailSearch: " audit ",
          documentsAcknowledgmentsSearch: " acknowledgments ",
        },
      }),
    ).toEqual({
      organizationId: "org_1",
      canWrite: true,
      canViewSensitive: false,
      repositorySearch: "repository",
      requirementsSearch: "requirements",
      missingSearch: "missing",
      expiringSearch: "expiring",
      retentionSearch: "retention",
      auditTrailSearch: "audit",
      acknowledgmentsSearch: "acknowledgments",
    });
  });
});
