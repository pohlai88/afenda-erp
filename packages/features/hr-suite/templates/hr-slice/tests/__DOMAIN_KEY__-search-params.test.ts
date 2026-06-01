import { describe, expect, it } from "vitest";

import {
  parse__IDENTIFIER__SearchParams,
  to__IDENTIFIER__PageModelInput,
} from "../../src/__CATEGORY__/__CAPABILITY_SLUG__/data/__DOMAIN_KEY__-search-params.parse.shared";

describe("__CAPABILITY_TITLE__ search params", () => {
  it("parses and trims scaffold workbench, audit, grouping, and status params", () => {
    expect(
      parse__IDENTIFIER__SearchParams({
        __SEARCH_PARAM__: [" readiness ", "ignored"],
        __IDENTIFIER_CAMEL__AuditTrailSearch: " seeded ",
        __IDENTIFIER_CAMEL__ReportGroupBy: "owner",
        __IDENTIFIER_CAMEL__Status: "draft",
      }),
    ).toEqual({
      workbenchSearch: "readiness",
      auditTrailSearch: "seeded",
      reportGroupBy: "owner",
      status: "draft",
    });
  });

  it("normalizes page model input with safe defaults", () => {
    expect(
      to__IDENTIFIER__PageModelInput({
        organizationId: "org_123",
        canReadAudit: true,
        searchParams: new URLSearchParams(
          "__IDENTIFIER_CAMEL__ReportGroupBy=not-real&__IDENTIFIER_CAMEL__Status=not-real",
        ),
      }),
    ).toEqual({
      organizationId: "org_123",
      canReadAudit: true,
      reportGroupBy: "status",
      status: "all",
    });
  });
});
